import { useState, useRef, useEffect } from 'react';
import { GraduationCap, Send, Clock, Trophy, RotateCcw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { generateExamQuestions } from '../services/geminiService';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { saveAnalytics } from '../services/firestoreService';
import toast from 'react-hot-toast';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Mixed'];
const DURATIONS = [10, 20, 30, 45, 60];

export default function ExamSimulator() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [duration, setDuration] = useState(20);
  const [questionCount, setQuestionCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [examActive, setExamActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef(null);
  const { addXp, endSession, startSession } = useStudy();
  const { currentUser } = useAuth();

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startExam = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const qs = await generateExamQuestions(topic, difficulty, questionCount);
      if (!qs?.length) throw new Error('No questions generated');
      setQuestions(qs);
      setAnswers({});
      setShowResults(false);
      setExamActive(true);
      startSession(topic);
      const secs = duration * 60;
      setTimeLeft(secs);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(timerRef.current); finishExam(qs, answers); return 0; }
          return prev - 1;
        });
      }, 1000);
      toast.success('Exam started! Good luck 🍀');
    } catch {
      toast.error('Failed to generate exam. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const finishExam = async (qs = questions, ans = answers) => {
    clearInterval(timerRef.current);
    setExamActive(false);
    setShowResults(true);
    const correct = qs.filter((q, i) => ans[i] === q.correct).length;
    const score = Math.round((correct / qs.length) * 100);
    addXp(score);
    endSession(score);
    if (currentUser) {
      await saveAnalytics(currentUser.uid, { topic, exam_score: score, difficulty, exam_mode: true });
    }
  };

  const selectAnswer = (qIdx, optIdx) => {
    if (!examActive) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const resetExam = () => {
    clearInterval(timerRef.current);
    setQuestions([]);
    setAnswers({});
    setTimeLeft(null);
    setExamActive(false);
    setShowResults(false);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const correct = questions.filter((q, i) => answers[i] === q.correct).length;
  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  const answeredCount = Object.keys(answers).length;

  const getReadinessLevel = (s) => {
    if (s >= 85) return { label: 'Exam Ready! 🎓', color: '#10b981' };
    if (s >= 70) return { label: 'Almost Ready 👍', color: '#06b6d4' };
    if (s >= 55) return { label: 'Needs Practice 📚', color: '#f59e0b' };
    return { label: 'More Study Needed 📖', color: '#f43f5e' };
  };

  // Config screen
  if (!examActive && !showResults) return (
    <div style={{ maxWidth: 700 }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GraduationCap size={20} color="#a78bfa" /> Exam Simulator
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          Simulate real exam conditions with timed questions and detailed analysis
        </p>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="label">Topic / Subject</label>
          <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="input-field" placeholder="e.g., Organic Chemistry, Computer Science, History..." />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="label">Difficulty</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setDifficulty(d)} style={{
                flex: 1, minWidth: 80, padding: '0.625rem', borderRadius: 10, cursor: 'pointer',
                background: difficulty === d ? 'rgba(139,92,246,0.15)' : 'var(--bg-secondary)',
                border: `1.5px solid ${difficulty === d ? '#8b5cf6' : 'var(--border-color)'}`,
                color: difficulty === d ? '#a78bfa' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.825rem', transition: 'all 0.2s',
              }}>{d}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="label">Time Limit (minutes)</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {DURATIONS.map(d => (
              <button key={d} onClick={() => setDuration(d)} style={{
                flex: 1, minWidth: 60, padding: '0.625rem', borderRadius: 8, cursor: 'pointer',
                background: duration === d ? 'rgba(139,92,246,0.15)' : 'var(--bg-secondary)',
                border: `1.5px solid ${duration === d ? '#8b5cf6' : 'var(--border-color)'}`,
                color: duration === d ? '#a78bfa' : 'var(--text-secondary)',
                fontSize: '0.825rem', fontWeight: 600, transition: 'all 0.2s',
              }}>{d}m</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.75rem' }}>
          <label className="label">Questions ({questionCount})</label>
          <input type="range" min={5} max={30} value={questionCount} onChange={e => setQuestionCount(+e.target.value)} style={{ width: '100%', accentColor: '#8b5cf6' }} />
        </div>

        {/* Exam info card */}
        <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 12, padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Questions', value: questionCount },
            { label: 'Duration', value: `${duration} min` },
            { label: 'Difficulty', value: difficulty },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{s.label}</div>
              <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '1rem' }}>{s.value}</div>
            </div>
          ))}
        </div>

        <button onClick={startExam} disabled={loading || !topic.trim()} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
          {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Generating Exam...</> : <><GraduationCap size={16} /> Start Exam</>}
        </button>
      </div>
    </div>
  );

  // Results
  if (showResults) {
    const readiness = getReadinessLevel(score);
    return (
      <div style={{ maxWidth: 700 }}>
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
            {score >= 85 ? '🎓' : score >= 70 ? '📚' : '💪'}
          </div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>Exam Complete!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{topic} · {difficulty}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Score', value: `${score}%`, color: score >= 70 ? '#10b981' : '#f43f5e' },
              { label: 'Correct', value: `${correct}/${questions.length}`, color: '#06b6d4' },
              { label: 'XP Earned', value: `+${score}`, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1.25rem' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{
            padding: '1.25rem', borderRadius: 12,
            background: `${readiness.color}10`, border: `1px solid ${readiness.color}30`,
            marginBottom: '2rem',
          }}>
            <div style={{ fontWeight: 700, color: readiness.color, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{readiness.label}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Exam Readiness — {score}%
            </div>
            <div className="progress-bar" style={{ marginTop: '0.75rem', height: 10 }}>
              <div style={{ height: '100%', width: `${score}%`, background: `linear-gradient(90deg, ${readiness.color}, ${readiness.color}aa)`, borderRadius: 100, transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* Review */}
          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>Answer Review</h3>
            {questions.slice(0, 10).map((q, i) => {
              const isCorrect = answers[i] === q.correct;
              return (
                <div key={i} style={{
                  padding: '0.875rem', borderRadius: 10, marginBottom: '0.5rem',
                  background: isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(244,63,94,0.05)',
                  border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}`,
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                }}>
                  {isCorrect ? <CheckCircle size={14} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} /> : <XCircle size={14} color="#f43f5e" style={{ marginTop: 2, flexShrink: 0 }} />}
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{q.question}</div>
                    {!isCorrect && q.options && <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.25rem' }}>✓ {q.options[q.correct]}</div>}
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={resetExam} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <RotateCcw size={14} /> Take Another Exam
          </button>
        </div>
      </div>
    );
  }

  // Active exam
  const timePercent = timeLeft !== null ? (timeLeft / (duration * 60)) * 100 : 100;
  return (
    <div style={{ maxWidth: 800 }}>
      {/* Exam header */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{topic} · {difficulty}</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{answeredCount} / {questions.length} answered</div>
        </div>
        <div style={{
          padding: '0.75rem 1.25rem', borderRadius: 10,
          background: timeLeft < 120 ? 'rgba(244,63,94,0.1)' : 'rgba(139,92,246,0.1)',
          border: `1px solid ${timeLeft < 120 ? 'rgba(244,63,94,0.3)' : 'rgba(139,92,246,0.2)'}`,
        }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.2rem' }}>TIME LEFT</div>
          <div className="timer-display" style={{ fontSize: '1.75rem', color: timeLeft < 120 ? '#fb7185' : '#a78bfa', textAlign: 'center' }}>
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </div>
        </div>
        <button onClick={() => finishExam()} className="btn-secondary" style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>
          <Trophy size={14} /> Submit
        </button>
      </div>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {questions.map((q, i) => (
          <div key={i} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Q{i + 1}</span>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {q.marks && <span className="badge badge-cyan">+{q.marks}</span>}
                <span className={`badge ${q.difficulty === 'easy' ? 'badge-emerald' : q.difficulty === 'hard' ? 'badge-rose' : 'badge-amber'}`}>{q.difficulty || difficulty}</span>
              </div>
            </div>
            <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.925rem', lineHeight: 1.5 }}>{q.question}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(q.options || ['True', 'False']).map((opt, j) => (
                <button key={j} onClick={() => selectAnswer(i, j)} style={{
                  textAlign: 'left', padding: '0.75rem 1rem', borderRadius: 10, cursor: 'pointer',
                  background: answers[i] === j ? 'rgba(139,92,246,0.12)' : 'var(--bg-secondary)',
                  border: `1.5px solid ${answers[i] === j ? '#8b5cf6' : 'var(--border-color)'}`,
                  color: answers[i] === j ? '#a78bfa' : 'var(--text-secondary)',
                  fontSize: '0.875rem', transition: 'all 0.2s', display: 'flex', gap: '0.75rem', alignItems: 'center',
                }}>
                  <span style={{ width: 26, height: 26, borderRadius: 6, background: answers[i] === j ? 'rgba(139,92,246,0.2)' : 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                    {String.fromCharCode(65 + j)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
