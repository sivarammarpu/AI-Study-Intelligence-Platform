import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Brain, CreditCard, BarChart2, ArrowRight,
  Clock, Target, Flame, Zap, TrendingUp, CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { getSessions } from '../services/firestoreService';

const quickStart = [
  { to: '/study', icon: '📖', label: 'Study a Topic', color: '#8b5cf6', desc: 'AI summaries & key points' },
  { to: '/quiz', icon: '❓', label: 'Take a Quiz', color: '#6366f1', desc: 'Test your knowledge' },
  { to: '/flashcards', icon: '🃏', label: 'Flashcards', color: '#06b6d4', desc: 'Spaced repetition' },
  { to: '/curriculum', icon: '🗺️', label: 'Build Curriculum', color: '#10b981', desc: 'Learning roadmap' },
  { to: '/exam', icon: '📝', label: 'Exam Simulator', color: '#f59e0b', desc: 'Timed practice exams' },
  { to: '/analytics', icon: '📊', label: 'Analytics', color: '#f43f5e', desc: 'Track your progress' },
];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { xp, level, xpInLevel, xpToNextLevel, streak, totalStudyTime } = useStudy();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    getSessions(currentUser.uid).then(s => {
      setSessions(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser]);

  const avgScore = sessions.length
    ? Math.round(sessions.filter(s => s.quiz_score != null).reduce((a, b) => a + (b.quiz_score || 0), 0) / Math.max(sessions.filter(s => s.quiz_score != null).length, 1))
    : 0;

  const totalMinutes = sessions.reduce((a, b) => a + (b.time_spent || 0), 0);
  const displayTime = totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes}m`;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header greeting */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          {greeting()}, {currentUser?.displayName?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Ready to learn something amazing today?
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: <Clock size={20} />, label: 'Study Time', value: displayTime, color: '#8b5cf6', sub: 'Total time' },
          { icon: <Target size={20} />, label: 'Avg Quiz Score', value: `${avgScore}%`, color: '#6366f1', sub: `${sessions.filter(s => s.quiz_score != null).length} quizzes taken` },
          { icon: <Flame size={20} />, label: 'Study Streak', value: `${streak} days`, color: '#fb923c', sub: 'Keep it up!' },
          { icon: <Zap size={20} />, label: 'Total XP', value: xp, color: '#f59e0b', sub: `Level ${level}` },
          { icon: <BookOpen size={20} />, label: 'Sessions', value: sessions.length, color: '#10b981', sub: 'All time' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${stat.color}18`, border: `1px solid ${stat.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: stat.color,
              }}>
                {stat.icon}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color: stat.color, marginBottom: '0.25rem' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* XP Progress */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Level {level} Progress</span>
            <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{xpInLevel} / {xpToNextLevel} XP to Level {level + 1}</span>
          </div>
          <span className="badge badge-purple"><Zap size={10} /> {xp} XP Total</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(xpInLevel / xpToNextLevel) * 100}%` }} />
        </div>
      </div>

      {/* Quick Start Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Quick Start
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {quickStart.map(item => (
            <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '1.25rem', cursor: 'pointer' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${item.color}15`,
                  border: `1px solid ${item.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', marginBottom: '0.875rem',
                }}>
                  {item.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{item.label}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Sessions</h2>
          <Link to="/analytics" className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
            View All <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div className="spinner" />
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
            <p>No sessions yet. Start your first study session!</p>
            <Link to="/study" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              Start Studying <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sessions.slice(0, 5).map((s, i) => (
              <div key={s.id || i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.875rem 1rem', background: 'var(--bg-secondary)',
                borderRadius: 10, border: '1px solid var(--border-color)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <BookOpen size={16} color="#a78bfa" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{s.topic || 'Study Session'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.time_spent || 0} min</div>
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
    </div>
  );
}
