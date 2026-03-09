import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
      toast.success('Account created! Welcome to StudyAI 🎉');
      navigate('/dashboard');
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Try signing in.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (code === 'auth/api-key-not-valid') {
        setError('Firebase API key is invalid. Please add your real Firebase config to the .env file.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-up is not enabled. Enable it in your Firebase Console → Authentication → Sign-in methods.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else if (code === 'auth/configuration-not-found' || err?.message?.includes('PROJECT_NOT_FOUND')) {
        setError('Firebase project not found. Check your VITE_FIREBASE_PROJECT_ID in the .env file.');
      } else {
        // Show the raw Firebase message for easy debugging
        setError(err?.message || 'Registration failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Welcome to StudyAI! 🎉');
      navigate('/dashboard');
    } catch {
      setError('Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', position: 'relative', overflow: 'hidden',
    }}>
      <div className="orb orb-purple" style={{ opacity: 0.1 }} />
      <div className="orb orb-cyan" style={{ opacity: 0.08 }} />

      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 24, padding: '2.5rem',
        position: 'relative', zIndex: 1,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
            fontSize: '1.5rem',
          }}>🧠</div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Start learning smarter today — it's free</p>
        </div>

        <button onClick={handleGoogle} disabled={loading} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginBottom: '1.5rem', padding: '0.75rem' }}>
          <img src="https://www.google.com/favicon.ico" width={16} height={16} alt="G" />
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
        </div>

        {error && (
          <div style={{
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fb7185', fontSize: '0.85rem',
          }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="John Doe" style={{ paddingLeft: '2.5rem' }} required />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" style={{ paddingLeft: '2.5rem' }} required />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Min. 6 characters" style={{ paddingLeft: '2.5rem' }} required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', marginTop: '0.5rem' }}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <>Create Account <ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
