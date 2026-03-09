import { useState } from 'react';
import { BookOpen, Send, Clock, ChevronRight, Lightbulb, Target, Star } from 'lucide-react';
import { generateSummary } from '../services/geminiService';
import { useStudy } from '../context/StudyContext';
import { useFocusMonitor } from '../hooks/useFocusMonitor';
import toast from 'react-hot-toast';

const SUGGESTED_TOPICS = [
  'Photosynthesis', 'World War II', 'Quantum Physics', 'Machine Learning',
  'French Revolution', 'DNA Replication', 'Climate Change', 'Calculus',
];

export default function StudyPage() {
  const [topic, setTopic] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const { startSession, endSession } = useStudy();
  const { focusScore, getFocusLevel } = useFocusMonitor();
  const focus = getFocusLevel();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setSummary(null);
    startSession(topic);
    try {
      const result = await generateSummary(topic);
      setSummary(result);
      toast.success('Summary generated!');
    } catch (err) {
      toast.error('Failed to generate summary. Check your Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    await endSession();
    setSummary(null);
    setTopic('');
    toast.success('Session saved! 🎉');
  };

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Focus Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.75rem 1rem', marginBottom: '1.5rem',
        background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)',
        borderRadius: 10,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: focus.color, boxShadow: `0 0 8px ${focus.color}` }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Focus: <strong style={{ color: focus.color }}>{focus.label}</strong> ({focusScore}%)
        </span>
        <div style={{ flex: 1 }} />
        {summary && (
          <button onClick={handleEndSession} className="btn-ghost" style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>
            ✅ End Session & Save
          </button>
        )}
      </div>

      {/* Topic Input */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={20} color="#a78bfa" /> AI Study Mode
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Enter any topic and get an instant AI-powered structured summary
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <input
            type="text" value={topic} onChange={e => setTopic(e.target.value)}
            className="input-field" placeholder="e.g., Photosynthesis, World War II, Machine Learning..."
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            style={{ flex: 1, fontSize: '1rem', padding: '0.875rem 1.25rem' }}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="btn-primary"
            style={{ padding: '0.875rem 1.5rem', whiteSpace: 'nowrap' }}
          >
            {loading
              ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Generating...</>
              : <><Send size={16} /> Generate</>}
          </button>
        </div>

        {/* Suggested topics */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.25rem 0', alignSelf: 'center' }}>Try:</span>
          {SUGGESTED_TOPICS.map(t => (
            <button
              key={t} onClick={() => setTopic(t)}
              style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                borderRadius: 100, padding: '0.25rem 0.75rem', fontSize: '0.75rem',
                color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'rgba(139,92,246,0.4)'; e.target.style.color = '#a78bfa'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.color = 'var(--text-secondary)'; }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="spinner" />
            <div>
              <div style={{ fontWeight: 600 }}>Generating summary...</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gemini AI is analyzing "{topic}"</div>
            </div>
          </div>
          {[80, 60, 90, 70].map((w, i) => (
            <div key={i} style={{
              height: 14, borderRadius: 7,
              background: 'var(--bg-secondary)',
              width: `${w}%`, marginBottom: '0.75rem',
              animation: 'pulse 1.5s ease infinite',
            }} />
          ))}
        </div>
      )}

      {/* Summary Output */}
      {summary && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.5s ease' }}>
          {/* Header */}
          <div className="card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.05))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.4rem', fontWeight: 800 }}>{summary.title || topic}</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge badge-purple">{summary.difficulty || 'Intermediate'}</span>
                <span className="badge badge-cyan"><Clock size={10} /> {summary.estimatedReadTime || '5 min'}</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.925rem' }}>{summary.overview}</p>
          </div>

          {/* Key Points */}
          {summary.keyPoints?.length > 0 && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                <Target size={16} color="#a78bfa" /> Key Points
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {summary.keyPoints.map((point, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6, background: 'rgba(139,92,246,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa', flexShrink: 0, marginTop: 1,
                    }}>{i + 1}</div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examples */}
          {summary.examples?.length > 0 && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                <Lightbulb size={16} color="#fbbf24" /> Examples
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {summary.examples.map((ex, i) => (
                  <div key={i} style={{
                    background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
                    borderRadius: 12, padding: '1rem',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fbbf24', marginBottom: '0.375rem' }}>{ex.title}</div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ex.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Concepts */}
          {summary.importantConcepts?.length > 0 && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                <Star size={16} color="#06b6d4" /> Important Concepts
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
                {summary.importantConcepts.map((c, i) => (
                  <div key={i} style={{
                    background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)',
                    borderRadius: 10, padding: '0.875rem',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.825rem', color: '#22d3ee', marginBottom: '0.3rem' }}>{c.term}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.definition}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
