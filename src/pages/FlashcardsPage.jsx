import { useState } from 'react';
import { CreditCard, Send, RotateCcw, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { generateFlashcards } from '../services/geminiService';
import { useSpacedRepetition } from '../hooks/useSpacedRepetition';
import { useAuth } from '../context/AuthContext';
import { saveFlashcards } from '../services/firestoreService';
import { useStudy } from '../context/StudyContext';
import toast from 'react-hot-toast';

const DIFFICULTY_RATINGS = [
  { label: 'Again', value: 0, color: '#f43f5e', emoji: '😓' },
  { label: 'Hard', value: 2, color: '#f59e0b', emoji: '😤' },
  { label: 'Good', value: 4, color: '#10b981', emoji: '👍' },
  { label: 'Easy', value: 5, color: '#06b6d4', emoji: '🚀' },
];

export default function FlashcardsPage() {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(15);
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [generatedCards, setGeneratedCards] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [session, setSession] = useState(null);
  const { currentUser } = useAuth();
  const { addXp } = useStudy();

  const { rateCard, getStats } = useSpacedRepetition(generatedCards);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const cards = await generateFlashcards(topic, count);
      if (!cards?.length) throw new Error('No cards generated');
      setGeneratedCards(cards);
      setSession({ cards, currentIdx: 0, rated: {} });
      setCurrentIdx(0);
      setFlipped(false);
      if (currentUser) {
        await saveFlashcards(currentUser.uid, topic, cards);
      }
      toast.success(`${cards.length} flashcards generated!`);
    } catch {
      toast.error('Flashcard generation failed. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIdx(i => Math.min(i + 1, generatedCards.length - 1)), 150);
  };

  const prevCard = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIdx(i => Math.max(i - 1, 0)), 150);
  };

  const handleRate = (rating) => {
    addXp(rating);
    nextCard();
  };

  const card = generatedCards[currentIdx];
  const stats = generatedCards.length ? {
    total: generatedCards.length,
    seen: currentIdx + 1,
    remaining: generatedCards.length - currentIdx - 1,
  } : null;

  // Config screen
  if (!generatedCards.length) return (
    <div style={{ maxWidth: 700 }}>
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={20} color="#a78bfa" /> Flashcard Generator
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          AI-generated flashcards with spaced repetition scheduling
        </p>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="label">Topic</label>
          <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="input-field" placeholder="e.g., Calculus derivatives, French vocabulary..." onKeyDown={e => e.key === 'Enter' && handleGenerate()} />
        </div>

        <div style={{ marginBottom: '1.75rem' }}>
          <label className="label">Number of Cards ({count})</label>
          <input type="range" min={5} max={30} value={count} onChange={e => setCount(+e.target.value)} style={{ width: '100%', accentColor: '#8b5cf6' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            <span>5</span><span>30</span>
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading || !topic.trim()} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
          {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Generating...</> : <><Send size={16} /> Generate Flashcards</>}
        </button>
      </div>
    </div>
  );

  // Flashcard study mode
  return (
    <div style={{ maxWidth: 700 }}>
      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: stats.total, color: '#8b5cf6' },
          { label: 'Seen', value: stats.seen, color: '#06b6d4' },
          { label: 'Remaining', value: stats.remaining, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, minWidth: 100, padding: '0.75rem 1rem', borderRadius: 10,
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(currentIdx / generatedCards.length) * 100}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          <span>{topic}</span>
          <span>{currentIdx + 1} / {generatedCards.length}</span>
        </div>
      </div>

      {/* Flip Card */}
      {card && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="flashcard-container" style={{ height: 320, cursor: 'pointer' }} onClick={() => setFlipped(f => !f)}>
            <div className={`flashcard-inner${flipped ? ' flipped' : ''}`} style={{ height: '100%' }}>
              {/* Front */}
              <div className="flashcard-front" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.08))', border: '1.5px solid rgba(139,92,246,0.25)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Front</div>
                  <p style={{ fontSize: '1.2rem', fontWeight: 600, lineHeight: 1.5, color: 'var(--text-primary)', maxWidth: 400 }}>{card.front}</p>
                  <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tap to reveal answer</div>
                </div>
              </div>
              {/* Back */}
              <div className="flashcard-back" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(16,185,129,0.06))', border: '1.5px solid rgba(6,182,212,0.25)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#22d3ee', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Answer</div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.6, color: 'var(--text-primary)', maxWidth: 400 }}>{card.back}</p>
                  <span className={`badge ${card.difficulty === 'easy' ? 'badge-emerald' : card.difficulty === 'hard' ? 'badge-rose' : 'badge-amber'}`} style={{ marginTop: '1%'}}>{card.difficulty}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <button onClick={prevCard} disabled={currentIdx === 0} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              <ChevronLeft size={16} /> Prev
            </button>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tap card to flip</div>
            <button onClick={nextCard} disabled={currentIdx === generatedCards.length - 1} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* SM2 Rating buttons */}
      {flipped && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.875rem', textAlign: 'center' }}>
            How well did you know this?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {DIFFICULTY_RATINGS.map(r => (
              <button key={r.value} onClick={() => handleRate(r.value)} style={{
                padding: '0.75rem 0.5rem', borderRadius: 10, cursor: 'pointer',
                background: `${r.color}15`, border: `1.5px solid ${r.color}40`,
                color: r.color, fontWeight: 700, fontSize: '0.8rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = `${r.color}25`}
                onMouseLeave={e => e.currentTarget.style.background = `${r.color}15`}
              >
                <span>{r.emoji}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button onClick={() => { setGeneratedCards([]); setTopic(''); }} className="btn-ghost">
          <RotateCcw size={14} /> Generate New Cards
        </button>
      </div>
    </div>
  );
}
