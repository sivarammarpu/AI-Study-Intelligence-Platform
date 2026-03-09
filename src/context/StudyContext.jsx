import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { saveSession } from '../services/firestoreService';

const StudyContext = createContext(null);

export const useStudy = () => useContext(StudyContext);

export const StudyProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [activeTopic, setActiveTopic] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [focusScore, setFocusScore] = useState(100);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [recentTopics, setRecentTopics] = useState([]);

  const timerRef = useRef(null);

  const startSession = (topic) => {
    setActiveTopic(topic);
    setSessionStartTime(Date.now());
  };

  const endSession = async (quizScore = null) => {
    if (!sessionStartTime || !currentUser) return;

    const duration = Math.round((Date.now() - sessionStartTime) / 60000); // in minutes
    setTotalStudyTime(prev => prev + duration);

    const earned = Math.max(0, Math.floor(duration * 2 + (quizScore || 0) * 0.5));
    setXp(prev => prev + earned);

    setRecentTopics(prev => {
      const updated = [activeTopic, ...prev.filter(t => t !== activeTopic)].slice(0, 10);
      return updated;
    });

    try {
      await saveSession(currentUser.uid, {
        topic: activeTopic,
        time_spent: duration,
        quiz_score: quizScore,
        xp_earned: earned,
        focus_score: focusScore,
      });
    } catch (err) {
      console.error('Session save failed:', err);
    }

    setActiveTopic('');
    setSessionStartTime(null);
  };

  const addXp = (amount) => setXp(prev => prev + amount);
  const updateFocusScore = (score) => setFocusScore(score);

  // XP level computation
  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;
  const xpToNextLevel = 500;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <StudyContext.Provider value={{
      activeTopic,
      sessionStartTime,
      xp,
      level,
      xpInLevel,
      xpToNextLevel,
      streak,
      focusScore,
      totalStudyTime,
      recentTopics,
      startSession,
      endSession,
      addXp,
      updateFocusScore,
      setStreak,
    }}>
      {children}
    </StudyContext.Provider>
  );
};
