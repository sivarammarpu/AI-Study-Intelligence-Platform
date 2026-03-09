import { Bell, Menu, FlaskConical } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useFocusMonitor } from '../../hooks/useFocusMonitor';
import { isDemoMode } from '../../services/demoService';

export const Navbar = ({ onMenuToggle, title }) => {
  const { xp, level, focusScore } = useStudy();
  const { getFocusLevel } = useFocusMonitor();
  const focus = getFocusLevel ? getFocusLevel() : { label: 'Great', color: '#10b981' };

  return (
    <header style={{
      height: 60,
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(17, 17, 24, 0.95)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={onMenuToggle} className="btn-ghost" style={{ padding: '0.4rem' }}>
          <Menu size={18} />
        </button>
        <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Demo Mode badge */}
        {isDemoMode() && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.25rem 0.75rem', borderRadius: 100,
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            fontSize: '0.7rem', fontWeight: 700, color: '#fbbf24',
          }}>
            <FlaskConical size={11} /> DEMO MODE
          </div>
        )}

        {/* Focus indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: focus.color,
            boxShadow: `0 0 8px ${focus.color}`,
          }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {focus.label} focus
          </span>
        </div>

        {/* XP Badge */}
        <div className="badge badge-purple">
          <span>⚡</span>
          <span>{xp} XP · Lv.{level}</span>
        </div>

        {/* Notifications */}
        <button className="btn-ghost" style={{ padding: '0.4rem', position: 'relative' }}>
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
};

