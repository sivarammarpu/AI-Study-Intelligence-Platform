import { useEffect, useRef, useState, useCallback } from 'react';

const IDLE_THRESHOLD_MS = 30_000; // 30 seconds
const TAB_SWITCH_PENALTY = 10;
const IDLE_PENALTY = 5;
const RECOVERY_RATE = 2; // points per active interval
const INTERVAL_MS = 10_000; // check every 10s

export const useFocusMonitor = () => {
  const [focusScore, setFocusScore] = useState(100);
  const [isIdle, setIsIdle] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const lastActivityRef = useRef(Date.now());
  const focusScoreRef = useRef(100);

  const updateScore = useCallback((delta) => {
    setFocusScore(prev => {
      const next = Math.max(0, Math.min(100, prev + delta));
      focusScoreRef.current = next;
      return next;
    });
  }, []);

  // Track user activity
  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsIdle(false);
  }, []);

  // Tab visibility
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches(p => p + 1);
        updateScore(-TAB_SWITCH_PENALTY);
        setIsActive(false);
      } else {
        setIsActive(true);
        lastActivityRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [updateScore]);

  // Activity listeners
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, handleActivity));
  }, [handleActivity]);

  // Periodic idle check & score recovery
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const idle = now - lastActivityRef.current > IDLE_THRESHOLD_MS;

      if (idle && !isIdle) {
        setIsIdle(true);
        updateScore(-IDLE_PENALTY);
      } else if (!idle && isActive) {
        updateScore(RECOVERY_RATE);
      }
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isIdle, isActive, updateScore]);

  const resetFocus = () => {
    setFocusScore(100);
    focusScoreRef.current = 100;
    setTabSwitches(0);
    setIsIdle(false);
  };

  const getFocusLevel = () => {
    if (focusScore >= 80) return { label: 'Great', color: '#10b981' };
    if (focusScore >= 60) return { label: 'Good', color: '#f59e0b' };
    if (focusScore >= 40) return { label: 'Low', color: '#f97316' };
    return { label: 'Poor', color: '#f43f5e' };
  };

  return {
    focusScore,
    isIdle,
    tabSwitches,
    isActive,
    getFocusLevel,
    resetFocus,
  };
};
