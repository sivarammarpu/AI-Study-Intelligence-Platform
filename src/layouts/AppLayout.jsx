import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Layout/Sidebar';
import { Navbar } from '../components/Layout/Navbar';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/study': 'Study Mode',
  '/quiz': 'Quiz Generator',
  '/flashcards': 'Flashcards',
  '/pdf-learning': 'PDF Learning',
  '/youtube-learning': 'YouTube Learning',
  '/analytics': 'Analytics Dashboard',
  '/curriculum': 'Curriculum Builder',
  '/exam': 'Exam Simulator',
  '/profile': 'My Profile',
};

export const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'StudyAI';

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 45, backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}
      <Sidebar 
        collapsed={collapsed} 
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed(c => !c)} 
        closeMobile={() => setMobileOpen(false)}
      />
      <main className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <Navbar 
          onMenuToggle={() => {
            if (window.innerWidth <= 768) setMobileOpen(true);
            else setCollapsed(c => !c);
          }} 
          title={title} 
        />
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
