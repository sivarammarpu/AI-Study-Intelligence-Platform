import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Zap, BarChart2, BookOpen, CreditCard, Shield, Star, ChevronRight } from 'lucide-react';

const features = [
  { icon: '🧠', title: 'AI Topic Summaries', desc: 'Get instant, structured summaries of any topic powered by Gemini AI.', color: '#8b5cf6' },
  { icon: '❓', title: 'Smart Quiz Generator', desc: 'Generate MCQ, True/False, and short-answer quizzes on any subject.', color: '#6366f1' },
  { icon: '🃏', title: 'Flashcard System', desc: 'Auto-generated flashcards with SM2 spaced repetition scheduling.', color: '#06b6d4' },
  { icon: '📄', title: 'PDF Learning', desc: 'Upload PDF documents and get AI-generated summaries and quizzes.', color: '#10b981' },
  { icon: '🎬', title: 'YouTube Learning', desc: 'Turn any YouTube video into structured study notes.', color: '#f59e0b' },
  { icon: '📊', title: 'Learning Analytics', desc: 'Track your progress, identify gaps, and visualize your learning journey.', color: '#f43f5e' },
  { icon: '🗺️', title: 'Curriculum Builder', desc: 'Generate personalized, step-by-step learning roadmaps with AI.', color: '#a78bfa' },
  { icon: '📝', title: 'Exam Simulator', desc: 'Take timed exams and get detailed readiness scores.', color: '#fb923c' },
];

const stats = [
  { value: '10x', label: 'Faster Learning' },
  { value: '95%', label: 'Students Satisfied' },
  { value: '50+', label: 'Subject Areas' },
  { value: 'AI', label: 'Powered by Gemini' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div className="orb orb-purple" />
      <div className="orb orb-cyan" />
      <div className="orb orb-indigo" />

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 2rem',
        height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
          }}>
            <span style={{ fontSize: '1.2rem' }}>🧠</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Study<span className="gradient-text">AI</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/login" className="btn-ghost" style={{ fontSize: '0.875rem' }}>Sign In</Link>
          <Link to="/register" className="btn-primary" style={{ fontSize: '0.875rem' }}>
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        paddingTop: '10rem', paddingBottom: '6rem',
        textAlign: 'center', position: 'relative', zIndex: 1,
        maxWidth: 900, margin: '0 auto', padding: '10rem 2rem 6rem',
      }}>
        <div className="badge badge-purple" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
          <Zap size={12} /> Powered by Google Gemini AI
        </div>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 900,
          lineHeight: 1.1,
          marginBottom: '1.5rem',
          color: 'var(--text-primary)',
        }}>
          Learn Smarter with <br />
          <span className="gradient-text">AI-Powered</span> Intelligence
        </h1>
        <p style={{
          fontSize: '1.125rem', color: 'var(--text-secondary)',
          maxWidth: 600, margin: '0 auto 2.5rem',
          lineHeight: 1.7,
        }}>
          Transform any topic into structured summaries, quizzes, flashcards, and personalized
          learning plans — all powered by advanced AI.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
            Start Learning Free <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-secondary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
            Sign In
          </Link>
        </div>

        {/* Hero stats */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '4rem',
          flexWrap: 'wrap',
        }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2rem', fontWeight: 900, fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '4rem 2rem', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800, marginBottom: '1rem',
          }}>
            Everything You Need to <span className="gradient-text">Excel</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 500, margin: '0 auto' }}>
            A complete AI-powered study ecosystem — from topic exploration to exam readiness.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.25rem',
        }}>
          {features.map((f) => (
            <div key={f.title} className="card" style={{ padding: '1.75rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${f.color}18`,
                border: `1px solid ${f.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', marginBottom: '1rem',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{
          maxWidth: 700, margin: '0 auto', padding: '3rem',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.08))',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: 24,
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '1rem',
          }}>
            Ready to Study Smarter?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>
            Join students who are already learning 10x faster with StudyAI.
          </p>
          <Link to="/register" className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2.5rem' }}>
            Create Free Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        position: 'relative', zIndex: 1,
      }}>
        © 2026 <strong>Sivaram Marpu</strong>. StudyAI – AI Learning Intelligence Platform. All rights reserved.
      </footer>
    </div>
  );
}
