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
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'StudyAI';

  return (
    <div className="layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main
        className="main-content"
        style={{ marginLeft: collapsed ? '70px' : '260px', transition: 'margin-left 0.3s ease' }}
      >
        <Navbar onMenuToggle={() => setCollapsed(c => !c)} title={title} />
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
