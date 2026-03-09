import { useState, useEffect, useRef } from 'react';
import { Brain, Send, CheckCircle, XCircle, Clock, Trophy, RotateCcw, ArrowRight } from 'lucide-react';
import { generateQuiz } from '../services/geminiService';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { saveAnalytics } from '../services/firestoreService';
import toast from 'react-hot-toast';

const QUIZ_TYPES = [
  { id: 'mcq', label: 'Multiple Choice', emoji: '🔤' },
  { id: 'truefalse', label: 'True / False', emoji: '⚖️' },
];

const QUESTION_COUNTS = [5, 10, 15, 20];

export default function QuizPage() {
  const [topic, setTopic] = useState('');
  const [quizType, setQuizType] = useState('mcq');
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizActive, setQuizActive] = useState(false);
  const timerRef = useRef(null);
  const { addXp, endSession, startSession } = useStudy();
  const { currentUser } = useAuth();

  const startTimer = (secs) => {
    setTimeLeft(secs);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setQuestions([]);
    setAnswers({});
    setShowResults(false);
    setCurrentQ(0);
    try {
      const qs = await generateQuiz(topic, quizType, questionCount);
      if (!qs || qs.length === 0) throw new Error('No questions generated');
      setQuestions(qs);
      setQuizActive(true);
      startSession(topic);
      startTimer(questionCount * 60);
      toast.success(`${qs.length} questions ready!`);
    } catch (err) {
      toast.error('Quiz generation failed. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (qIndex, optionIndex) => {
    if (answers[qIndex] !== undefined) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const finishQuiz = async () => {
    clearInterval(timerRef.current);
    setQuizActive(false);
    setShowResults(true);
    const correct = questions.filter((q, i) => answers[i] === q.correct).length;
    const score = Math.round((correct / questions.length) * 100);
    addXp(score);
    endSession(score);
    if (currentUser) {
      await saveAnalytics(currentUser.uid, { topic, quiz_score: score, quiz_type: quizType, question_count: questions.length });
    }
  };

  const resetQuiz = () => {
    clearInterval(timerRef.current);
    setQuestions([]);
    setAnswers({});
    setShowResults(false);
    setCurrentQ(0);
    setQuizActive(false);
    setTimeLeft(null);
  };

  const q = questions[currentQ];
  const correct = questions.filter((q, i) => answers[i] === q.correct).length;
  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;

  // Config screen
  if (!quizActive && !showResults) return (
    <div style={{ maxWidth: 700 }}>
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Brain size={20} color="#a78bfa" /> Quiz Generator
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          Generate AI-powered quizzes on any topic
        </p>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="label">Topic</label>
          <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="input-field" placeholder="e.g., World War II, Photosynthesis, Python..." onKeyDown={e => e.key === 'Enter' && handleGenerate()} />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="label">Quiz Type</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {QUIZ_TYPES.map(t => (
              <button key={t.id} onClick={() => setQuizType(t.id)} style={{
                flex: 1, padding: '0.75rem', borderRadius: 10, cursor: 'pointer',
                background: quizType === t.id ? 'rgba(139,92,246,0.15)' : 'var(--bg-secondary)',
                border: `1.5px solid ${quizType === t.id ? '#8b5cf6' : 'var(--border-color)'}`,
                color: quizType === t.id ? '#a78bfa' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
              }}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.75rem' }}>
          <label className="label">Number of Questions</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {QUESTION_COUNTS.map(n => (
              <button key={n} onClick={() => setQuestionCount(n)} style={{
                flex: 1, padding: '0.6rem', borderRadius: 8, cursor: 'pointer',
                background: questionCount === n ? 'rgba(139,92,246,0.15)' : 'var(--bg-secondary)',
                border: `1.5px solid ${questionCount === n ? '#8b5cf6' : 'var(--border-color)'}`,
                color: questionCount === n ? '#a78bfa' : 'var(--text-secondary)',
                fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s',
              }}>{n}</button>
            ))}
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading || !topic.trim()} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
          {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Generating...</> : <><Send size={16} /> Generate Quiz</>}
        </button>
      </div>
    </div>
  );

  // Results screen
  if (showResults) return (
    <div style={{ maxWidth: 700 }}>
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {score >= 80 ? '🏆' : score >= 60 ? '👍' : '📚'}
        </div>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>
          Quiz Complete!
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{topic}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Score', value: `${score}%`, color: score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e' },
            { label: 'Correct', value: `${correct}/${questions.length}`, color: '#06b6d4' },
            { label: 'XP Earned', value: `+${score} XP`, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1.25rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Readiness meter */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span>Exam Readiness</span><span>{score}%</span>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-fill" style={{ width: `${score}%` }} />
          </div>
        </div>

        {/* Answer Review */}
        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>Answer Review</h3>
          {questions.map((q, i) => {
            const userAns = answers[i];
            const isCorrect = userAns === q.correct;
            return (
              <div key={i} style={{
                padding: '1rem', borderRadius: 10, marginBottom: '0.5rem',
                background: isCorrect ? 'rgba(16,185,129,0.06)' : 'rgba(244,63,94,0.06)',
                border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
              }}>
                {isCorrect ? <CheckCircle size={16} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} /> : <XCircle size={16} color="#f43f5e" style={{ marginTop: 2, flexShrink: 0 }} />}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>{q.question}</div>
                  {!isCorrect && <div style={{ fontSize: '0.8rem', color: '#34d399' }}>✓ {q.options?.[q.correct] || q.answer}</div>}
                  {q.explanation && <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{q.explanation}</div>}
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={resetQuiz} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
          <RotateCcw size={16} /> Take Another Quiz
        </button>
      </div>
    </div>
  );

  // Active quiz
  return (
    <div style={{ maxWidth: 700 }}>
      {/* Progress bar + timer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span>Question {currentQ + 1} of {questions.length}</span>
            <span>{Math.round(((currentQ) / questions.length) * 100)}% complete</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((currentQ) / questions.length) * 100}%` }} />
          </div>
        </div>
        {timeLeft !== null && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.4rem 0.875rem', borderRadius: 8,
            background: timeLeft < 60 ? 'rgba(244,63,94,0.1)' : 'rgba(139,92,246,0.1)',
            border: `1px solid ${timeLeft < 60 ? 'rgba(244,63,94,0.3)' : 'rgba(139,92,246,0.2)'}`,
            color: timeLeft < 60 ? '#fb7185' : '#a78bfa',
          }}>
            <Clock size={14} /><span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.9rem' }}>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Question Card */}
      {q && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Question {currentQ + 1}
          </div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.75rem', lineHeight: 1.5 }}>{q.question}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
            {(q.options || ['True', 'False']).map((opt, i) => {
              const selected = answers[currentQ] === i;
              const revealed = answers[currentQ] !== undefined;
              const isCorrect = i === q.correct;
              let cls = 'quiz-option';
              if (revealed) cls += isCorrect ? ' correct' : (selected && !isCorrect ? ' incorrect' : '');
              else if (selected) cls += ' selected';
              return (
                <button key={i} className={cls} onClick={() => selectAnswer(currentQ, i)}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-secondary)', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                  {revealed && isCorrect && <CheckCircle size={14} color="#10b981" style={{ marginLeft: 'auto' }} />}
                  {revealed && selected && !isCorrect && <XCircle size={14} color="#f43f5e" style={{ marginLeft: 'auto' }} />}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {answers[currentQ] !== undefined && q.explanation && q.explanation.substring(0, 80) + '...'}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {currentQ < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQ(i => i + 1)}
                  disabled={answers[currentQ] === undefined}
                  className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}
                >
                  Next <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={finishQuiz}
                  className="btn-primary" style={{ padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                >
                  <Trophy size={14} /> Finish Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
