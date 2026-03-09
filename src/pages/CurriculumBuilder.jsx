import { useState } from 'react';
import { Map, Send, CheckCircle, Circle, Clock, RotateCcw, ChevronRight } from 'lucide-react';
import { generateCurriculum } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { saveCurriculum } from '../services/firestoreService';
import { useStudy } from '../context/StudyContext';
import toast from 'react-hot-toast';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export default function CurriculumBuilder() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [curriculum, setCurriculum] = useState(null);
  const [completed, setCompleted] = useState({});
  const { currentUser } = useAuth();
  const { addXp } = useStudy();

  const handleGenerate = async () => {
    if (!topic.trim() || !goal.trim()) return;
    setLoading(true);
    setCurriculum(null);
    setCompleted({});
    try {
      const result = await generateCurriculum(topic, difficulty, goal);
      if (!result) throw new Error('Generation failed');
      setCurriculum(result);
      if (currentUser) {
        await saveCurriculum(currentUser.uid, { topic, difficulty, goal, ...result });
      }
      toast.success('Curriculum created!');
    } catch {
      toast.error('Failed to generate curriculum. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (i) => {
    const wasCompleted = completed[i];
    setCompleted(prev => ({ ...prev, [i]: !prev[i] }));
    if (!wasCompleted) addXp(25);
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalSteps = curriculum?.steps?.length || 0;
  const progress = totalSteps ? Math.round((completedCount / totalSteps) * 100) : 0;

  // Config form
  if (!curriculum) return (
    <div style={{ maxWidth: 700 }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Map size={20} color="#a78bfa" /> Curriculum Builder
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          Generate a personalized AI-powered learning roadmap
        </p>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="label">Topic</label>
          <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="input-field" placeholder="e.g., Machine Learning, Spanish Language, Web Development..." />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="label">Difficulty Level</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setDifficulty(d)} style={{
                flex: 1, padding: '0.75rem', borderRadius: 10, cursor: 'pointer',
                background: difficulty === d ? 'rgba(139,92,246,0.15)' : 'var(--bg-secondary)',
                border: `1.5px solid ${difficulty === d ? '#8b5cf6' : 'var(--border-color)'}`,
                color: difficulty === d ? '#a78bfa' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
              }}>{d}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.75rem' }}>
          <label className="label">Learning Goal</label>
          <textarea
            value={goal} onChange={e => setGoal(e.target.value)}
            className="input-field" placeholder="e.g., Build a complete machine learning model from scratch and understand the core algorithms..."
            rows={3} style={{ resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <button onClick={handleGenerate} disabled={loading || !topic.trim() || !goal.trim()} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
          {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Generating Roadmap...</> : <><Send size={16} /> Generate Curriculum</>}
        </button>
      </div>
    </div>
  );

  // Curriculum view
  return (
    <div style={{ maxWidth: 800 }}>
      {/* Header */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem', background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.04))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.25rem' }}>{curriculum.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{curriculum.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <span className="badge badge-purple">{difficulty}</span>
            <span className="badge badge-cyan"><Clock size={10} /> {curriculum.estimatedDuration}</span>
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          <span>{completedCount} / {totalSteps} steps completed</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar" style={{ height: 8 }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <button onClick={() => { setCurriculum(null); setTopic(''); setGoal(''); }} className="btn-ghost" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
          <RotateCcw size={12} /> Build New Curriculum
        </button>
      </div>

      {/* Timeline steps */}
      <div className="card" style={{ padding: '1.5rem' }}>
        {curriculum.steps?.map((step, i) => {
          const done = completed[i];
          return (
            <div key={i} className="timeline-step">
              <div className="timeline-dot" style={{
                background: done ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.1)',
                borderColor: done ? '#10b981' : '#8b5cf6',
                color: done ? '#10b981' : '#a78bfa',
              }}>
                {done ? <CheckCircle size={16} /> : <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{step.step}</span>}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                    {step.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {step.duration && <span className="badge badge-purple"><Clock size={10} /> {step.duration}</span>}
                    <button
                      onClick={() => toggleStep(i)}
                      style={{
                        background: done ? 'rgba(16,185,129,0.15)' : 'var(--bg-secondary)',
                        border: `1.5px solid ${done ? '#10b981' : 'var(--border-color)'}`,
                        borderRadius: 8, padding: '0.35rem 0.75rem',
                        color: done ? '#34d399' : 'var(--text-muted)',
                        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem',
                      }}
                    >
                      {done ? <><CheckCircle size={12} /> Done</> : <><Circle size={12} /> Mark Done</>}
                    </button>
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.625rem', lineHeight: 1.5 }}>{step.description}</p>
                <div style={{ fontSize: '0.8rem', color: '#a78bfa', marginBottom: '0.5rem' }}>
                  <strong>Goal:</strong> {step.goal}
                </div>

                {step.subtopics?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
                    {step.subtopics.map((sub, j) => (
                      <span key={j} style={{
                        padding: '0.2rem 0.625rem', borderRadius: 100,
                        background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                        fontSize: '0.7rem', color: 'var(--text-muted)',
                      }}>{sub}</span>
                    ))}
                  </div>
                )}

                {step.resources?.length > 0 && (
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    <strong>Resources:</strong> {step.resources.join(' · ')}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {progress === 100 && (
          <div style={{
            textAlign: 'center', padding: '2rem',
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 12, marginTop: '1rem',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏆</div>
            <h3 style={{ fontWeight: 800, color: '#34d399', marginBottom: '0.25rem' }}>Curriculum Complete!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>You've mastered: {topic}</p>
          </div>
        )}
      </div>
    </div>
  );
}
