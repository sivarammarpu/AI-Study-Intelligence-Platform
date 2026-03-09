import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, BookOpen, Brain, CreditCard, FileText,
  Youtube, BarChart2, Map, GraduationCap, User, ChevronLeft,
  ChevronRight, LogOut, Zap, Flame,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/study', icon: BookOpen, label: 'Study' },
  { to: '/quiz', icon: Brain, label: 'Quiz' },
  { to: '/flashcards', icon: CreditCard, label: 'Flashcards' },
  { to: '/pdf-learning', icon: FileText, label: 'PDF Learning' },
  { to: '/youtube-learning', icon: Youtube, label: 'YouTube' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/curriculum', icon: Map, label: 'Curriculum' },
  { to: '/exam', icon: GraduationCap, label: 'Exam Simulator' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export const Sidebar = ({ collapsed, mobileOpen, onToggle, closeMobile }) => {
  const { currentUser, logout } = useAuth();
  const { xp, level, xpInLevel, xpToNextLevel, streak } = useStudy();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '0 1rem' : '0 1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
            }}>
              <span style={{ fontSize: '1.1rem' }}>🧠</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Study<span className="gradient-text">AI</span>
            </span>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span>🧠</span>
          </div>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            padding: '0.3rem',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* XP / Streak quick stats */}
      {!collapsed && (
        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            borderRadius: 12,
            padding: '0.875rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#a78bfa' }}>
                <Zap size={12} /> Lv.{level}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#fb923c' }}>
                <Flame size={12} /> {streak}d
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              {xpInLevel} / {xpToNextLevel} XP
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(xpInLevel / xpToNextLevel) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav style={{ flex: 1, overflowY: 'auto' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
            title={collapsed ? label : ''}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', marginTop: '1rem' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.displayName || 'Student'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.email}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="btn-ghost"
          style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', color: 'var(--accent-rose)' }}
        >
          <LogOut size={16} />
          {!collapsed && 'Logout'}
        </button>

        {/* Ownership text */}
        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          opacity: 0.6
        }}>
          {!collapsed ? '© 2026 Sivaram Marpu' : '©SM'}
        </div>
      </div>
    </aside>
  );
};
