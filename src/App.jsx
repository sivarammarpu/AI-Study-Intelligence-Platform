import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudyProvider } from './context/StudyContext';
import { AppLayout } from './layouts/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import StudyPage from './pages/StudyPage';
import QuizPage from './pages/QuizPage';
import FlashcardsPage from './pages/FlashcardsPage';
import PDFLearningPage from './pages/PDFLearningPage';
import YouTubeLearningPage from './pages/YouTubeLearningPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import CurriculumBuilder from './pages/CurriculumBuilder';
import ExamSimulator from './pages/ExamSimulator';
import UserProfile from './pages/UserProfile';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );
  return currentUser ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  return currentUser ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected App */}
      <Route element={
        <ProtectedRoute>
          <StudyProvider>
            <AppLayout />
          </StudyProvider>
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/pdf-learning" element={<PDFLearningPage />} />
        <Route path="/youtube-learning" element={<YouTubeLearningPage />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/curriculum" element={<CurriculumBuilder />} />
        <Route path="/exam" element={<ExamSimulator />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              fontSize: '0.875rem',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
