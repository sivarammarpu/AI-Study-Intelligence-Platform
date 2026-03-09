import { useState, useEffect } from 'react';
import { User, Mail, Zap, Flame, Trophy, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { getSessions } from '../services/firestoreService';
import toast from 'react-hot-toast';

const ALL_BADGES = [
  { emoji: '🎯', label: 'First Quiz', desc: 'Complete first quiz' },
  { emoji: '🔥', label: 'Week Warrior', desc: '7-day streak' },
  { emoji: '⚡', label: 'XP Hunter', desc: 'Earn 500 XP' },
  { emoji: '📚', label: 'Dedicated', desc: '10 sessions' },
  { emoji: '🏆', label: 'Perfectionist', desc: '100% quiz score' },
  { emoji: '🎓', label: 'Graduate', desc: 'Complete a curriculum' },
  { emoji: '🃏', label: 'Card Master', desc: 'Study 50 flashcards' },
  { emoji: '🧠', label: 'AI Explorer', desc: 'Use all features' },
];

export default function UserProfile() {
  const { currentUser, userData, refreshUserData, updateUserProfile } = useAuth();
  const { xp, level, xpInLevel, xpToNextLevel, streak } = useStudy();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [sessions, setSessions] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    getSessions(currentUser.uid).then(setSessions).catch(() => {});
    setDisplayName(currentUser.displayName || '');
  }, [currentUser]);

  const handleSave = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await updateUserProfile(displayName);
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const totalStudyTime = sessions.reduce((a, s) => a + (s.time_spent || 0), 0);
  const quizSessions = sessions.filter(s => s.quiz_score != null);
  const avgScore = quizSessions.length ? Math.round(quizSessions.reduce((a, s) => a + s.quiz_score, 0) / quizSessions.length) : 0;

  // Which badges earned
  const earnedBadges = ALL_BADGES.filter((b, i) => {
    if (i === 0) return quizSessions.length >= 1;
    if (i === 1) return streak >= 7;
    if (i === 2) return xp >= 500;
    if (i === 3) return sessions.length >= 10;
    if (i === 4) return quizSessions.some(s => s.quiz_score === 100);
    return false;
  });

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Profile Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 800, color: 'white',
            boxShadow: '0 8px 25px rgba(139,92,246,0.4)',
            flexShrink: 0,
          }}>
            {currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
          </div>

          <div style={{ flex: 1 }}>
            {editing ? (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input
                  type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                  className="input-field" style={{ maxWidth: 260, padding: '0.5rem 0.875rem' }}
                  autoFocus
                />
                <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><Save size={14} /> Save</>}
                </button>
                <button onClick={() => setEditing(false)} className="btn-ghost"><X size={14} /></button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.4rem', fontWeight: 800 }}>
                  {currentUser?.displayName || 'Student'}
                </h2>
                <button onClick={() => setEditing(true)} className="btn-ghost" style={{ padding: '0.3rem', color: 'var(--text-muted)' }}>
                  <Edit2 size={14} />
                </button>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <Mail size={14} /> {currentUser?.email}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-purple"><Zap size={10} /> Level {level}</span>
              <span className="badge badge-amber"><Flame size={10} /> {streak}-day streak</span>
              <span className="badge badge-cyan"><Trophy size={10} /> {earnedBadges.length} badges</span>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Level {level} → {level + 1}</span>
            <span style={{ color: '#a78bfa' }}>{xpInLevel} / {xpToNextLevel} XP</span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${(xpInLevel / xpToNextLevel) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total XP', value: xp, color: '#f59e0b', emoji: '⚡' },
          { label: 'Sessions', value: sessions.length, color: '#8b5cf6', emoji: '📚' },
          { label: 'Study Time', value: `${totalStudyTime}m`, color: '#06b6d4', emoji: '⏱️' },
          { label: 'Avg Quiz', value: `${avgScore}%`, color: '#10b981', emoji: '🎯' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.emoji}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trophy size={16} color="#f59e0b" /> Badges & Achievements
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.875rem' }}>
          {ALL_BADGES.map((badge, i) => {
            const earned = i < earnedBadges.length;
            return (
              <div key={badge.label} style={{
                padding: '1rem 0.75rem', borderRadius: 12, textAlign: 'center',
                background: earned ? 'rgba(245,158,11,0.06)' : 'var(--bg-secondary)',
                border: `1px solid ${earned ? 'rgba(245,158,11,0.25)' : 'var(--border-color)'}`,
                opacity: earned ? 1 : 0.45, transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem', filter: earned ? 'none' : 'grayscale(1)' }}>{badge.emoji}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: earned ? '#fbbf24' : 'var(--text-muted)', marginBottom: '0.2rem' }}>{badge.label}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{badge.desc}</div>
                {earned && <span style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.6rem', color: '#34d399', fontWeight: 700 }}>✓ EARNED</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>📜 Recent Study Sessions</h3>
          {sessions.slice(0, 8).map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.75rem 1rem', background: 'var(--bg-secondary)',
              borderRadius: 10, marginBottom: '0.5rem', border: '1px solid var(--border-color)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1rem' }}>📖</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.topic || 'Session'}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.time_spent || 0} min</div>
                </div>
              </div>
              {s.quiz_score != null && (
                <span className={`badge ${s.quiz_score >= 70 ? 'badge-emerald' : s.quiz_score >= 50 ? 'badge-amber' : 'badge-rose'}`}>
                  {s.quiz_score}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
