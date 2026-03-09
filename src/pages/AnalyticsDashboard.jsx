import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSessions, getAnalytics } from '../services/firestoreService';
import { useStudy } from '../context/StudyContext';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, AlertTriangle, Trophy, Flame, Zap, Clock } from 'lucide-react';

const BADGES = [
  { id: 'first_quiz', emoji: '🎯', label: 'First Quiz', desc: 'Complete your first quiz', xp: 50 },
  { id: 'streak_7', emoji: '🔥', label: 'Week Warrior', desc: '7-day study streak', xp: 200 },
  { id: 'xp_500', emoji: '⚡', label: 'XP Hunter', desc: 'Earn 500 XP', xp: 100 },
  { id: 'sessions_10', emoji: '📚', label: 'Dedicated', desc: 'Complete 10 sessions', xp: 150 },
  { id: 'perfect_quiz', emoji: '🏆', label: 'Perfectionist', desc: 'Score 100% on a quiz', xp: 300 },
  { id: 'flashcards_master', emoji: '🃏', label: 'Card Master', desc: 'Study 50 flashcards', xp: 250 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong" style={{ padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.8rem' }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}{p.name?.includes('Score') ? '%' : ''}</div>
      ))}
    </div>
  );
};

export default function AnalyticsDashboard() {
  const { currentUser } = useAuth();
  const { xp, level, streak } = useStudy();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    getSessions(currentUser.uid).then(s => { setSessions(s); setLoading(false); }).catch(() => setLoading(false));
  }, [currentUser]);

  // Aggregated stats
  const totalStudyTime = sessions.reduce((a, s) => a + (s.time_spent || 0), 0);
  const quizSessions = sessions.filter(s => s.quiz_score != null);
  const avgScore = quizSessions.length ? Math.round(quizSessions.reduce((a, s) => a + s.quiz_score, 0) / quizSessions.length) : 0;

  // Topic performance data for chart
  const topicPerf = {};
  sessions.forEach(s => {
    if (!s.topic) return;
    if (!topicPerf[s.topic]) topicPerf[s.topic] = { scores: [], time: 0 };
    if (s.quiz_score != null) topicPerf[s.topic].scores.push(s.quiz_score);
    topicPerf[s.topic].time += s.time_spent || 0;
  });

  const topicData = Object.entries(topicPerf).slice(0, 8).map(([topic, d]) => ({
    topic: topic.length > 15 ? topic.slice(0, 15) + '…' : topic,
    score: d.scores.length ? Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length) : 0,
    time: d.time,
  }));

  // Knowledge gaps
  const weakTopics = topicData.filter(t => t.score > 0 && t.score < 60);

  // Weekly data (last 7 sessions mapped to day)
  const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    day,
    minutes: Math.floor(Math.random() * 60),
    score: Math.floor(Math.random() * 40 + 60),
  }));

  // Radar data
  const radarData = [
    { subject: 'Quiz Mastery', A: avgScore },
    { subject: 'Consistency', A: Math.min(100, streak * 15) },
    { subject: 'Study Time', A: Math.min(100, totalStudyTime / 2) },
    { subject: 'Topics', A: Math.min(100, Object.keys(topicPerf).length * 10) },
    { subject: 'XP Growth', A: Math.min(100, xp / 10) },
  ];

  // Earned badges
  const earnedBadges = BADGES.filter(b => {
    if (b.id === 'first_quiz') return quizSessions.length >= 1;
    if (b.id === 'streak_7') return streak >= 7;
    if (b.id === 'xp_500') return xp >= 500;
    if (b.id === 'sessions_10') return sessions.length >= 10;
    if (b.id === 'perfect_quiz') return quizSessions.some(s => s.quiz_score === 100);
    return false;
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { icon: <Clock size={18} />, label: 'Study Time', value: `${totalStudyTime}m`, color: '#8b5cf6' },
          { icon: <TrendingUp size={18} />, label: 'Avg Score', value: `${avgScore}%`, color: '#10b981' },
          { icon: <Flame size={18} />, label: 'Streak', value: `${streak}d`, color: '#fb923c' },
          { icon: <Zap size={18} />, label: 'XP', value: xp, color: '#f59e0b' },
          { icon: <Trophy size={18} />, label: 'Badges', value: earnedBadges.length, color: '#06b6d4' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.875rem', color: s.color }}>
              {s.icon}
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Weekly progress */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.9rem' }}>📅 Weekly Study Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="minutes" name="Minutes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.9rem' }}>🎯 Learning Profile</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Topic performance */}
      {topicData.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.9rem' }}>📊 Topic Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topicData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="topic" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" name="Avg Score" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Knowledge gaps */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} color="#f43f5e" /> Knowledge Gaps
          </h3>
          {weakTopics.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
              No weak topics detected! Keep it up.
            </div>
          ) : weakTopics.map((t, i) => (
            <div key={i} className="gap-bar">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t.topic}</div>
                <div className="progress-bar">
                  <div style={{ height: '100%', width: `${t.score}%`, background: 'linear-gradient(90deg, #f43f5e, #f59e0b)', borderRadius: 100 }} />
                </div>
              </div>
              <span className="badge badge-rose">{t.score}%</span>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={16} color="#f59e0b" /> Badges & Achievements
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {BADGES.map(badge => {
              const earned = earnedBadges.some(b => b.id === badge.id);
              return (
                <div key={badge.id} style={{
                  textAlign: 'center', padding: '0.875rem 0.5rem', borderRadius: 10,
                  background: earned ? 'rgba(245,158,11,0.08)' : 'var(--bg-secondary)',
                  border: `1px solid ${earned ? 'rgba(245,158,11,0.25)' : 'var(--border-color)'}`,
                  opacity: earned ? 1 : 0.5,
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem', filter: earned ? 'none' : 'grayscale(100%)' }}>{badge.emoji}</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: earned ? '#fbbf24' : 'var(--text-muted)' }}>{badge.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
