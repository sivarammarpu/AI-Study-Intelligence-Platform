import { useState } from 'react';
import { Youtube, Send, BookOpen, Brain, AlertCircle, ExternalLink } from 'lucide-react';
import { generateNotesFromText, generateQuiz } from '../services/geminiService';
import toast from 'react-hot-toast';

const YouTubeIcon = () => (
  <svg viewBox="0 0 28 20" width={28} height={20} fill="#f43f5e">
    <path d="M27.4 3.1A3.5 3.5 0 0 0 24.9.6C22.7 0 14 0 14 0S5.3 0 3.1.6A3.5 3.5 0 0 0 .6 3.1C0 5.3 0 10 0 10s0 4.7.6 6.9A3.5 3.5 0 0 0 3.1 19.4C5.3 20 14 20 14 20s8.7 0 10.9-.6a3.5 3.5 0 0 0 2.5-2.5C28 14.7 28 10 28 10s0-4.7-.6-6.9zM11.2 14.3V5.7L18.5 10l-7.3 4.3z"/>
  </svg>
);

const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

export default function YouTubeLearningPage() {
  const [url, setUrl] = useState('');
  const [manualTranscript, setManualTranscript] = useState('');
  const [useManual, setUseManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [notes, setNotes] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [quizDone, setQuizDone] = useState(false);

  const videoId = extractVideoId(url);

  const handleProcess = async () => {
    const textToProcess = useManual ? manualTranscript : manualTranscript;
    if (!textToProcess.trim() && !useManual) {
      toast.error('Please paste the video transcript text below.');
      setUseManual(true);
      return;
    }
    if (!textToProcess.trim()) {
      toast.error('Please paste a transcript to analyze.');
      return;
    }
    setLoading(true);
    setNotes(null);
    setQuiz([]);
    setAnswers({});
    setQuizDone(false);
    try {
      setLoadingStep('Analyzing transcript...');
      const n = await generateNotesFromText(textToProcess, 'YouTube video transcript');
      setNotes(n);
      setLoadingStep('Generating quiz...');
      const q = await generateQuiz(n?.title || 'Video Topic', 'mcq', 8);
      setQuiz(q || []);
      toast.success('Analysis complete!');
    } catch {
      toast.error('Failed to process transcript. Check your API key.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const score = quiz.filter((q, i) => answers[i] === q.correct).length;

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <YouTubeIcon /> YouTube Learning Mode
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          Paste a YouTube URL to preview the video, then paste the transcript to generate AI notes & quiz
        </p>

        {/* URL input */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="label">YouTube URL</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="input-field" placeholder="https://www.youtube.com/watch?v=..." />
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.75rem', flexShrink: 0 }}>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Video preview */}
        {videoId && (
          <div style={{ marginBottom: '1.25rem', borderRadius: 12, overflow: 'hidden', background: '#000', aspectRatio: '16/9', maxHeight: 300 }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allowFullScreen
              title="YouTube video"
            />
          </div>
        )}

        {/* Transcript input */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
            borderRadius: 10, padding: '0.875rem', marginBottom: '0.875rem',
            display: 'flex', gap: '0.625rem', alignItems: 'flex-start',
          }}>
            <AlertCircle size={14} color="#fbbf24" style={{ marginTop: 1, flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
              To get the transcript: click the "..." button on any YouTube video → "Show transcript" → copy all the text and paste below.
            </span>
          </div>
          <label className="label">Video Transcript</label>
          <textarea
            value={manualTranscript}
            onChange={e => setManualTranscript(e.target.value)}
            className="input-field"
            placeholder="Paste the YouTube video transcript here..."
            rows={7}
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <button
          onClick={handleProcess}
          disabled={loading || !manualTranscript.trim()}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}
        >
          {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> {loadingStep || 'Processing...'}</> : <><Send size={16} /> Generate Notes & Quiz</>}
        </button>
      </div>

      {/* Notes Output */}
      {notes && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(244,63,94,0.06), rgba(244,63,94,0.02))' }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>{notes.title || 'Video Notes'}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{notes.summary}</p>
          </div>

          {notes.keyPoints?.length > 0 && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>🎯 Key Points</h3>
              {notes.keyPoints.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.625rem' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fb7185', flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p}</span>
                </div>
              ))}
            </div>
          )}

          {notes.importantConcepts?.length > 0 && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>💡 Key Concepts</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {notes.importantConcepts.map((c, i) => (
                  <div key={i} style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 10, padding: '0.875rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.825rem', color: '#fb7185', marginBottom: '0.3rem' }}>{c.term}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.definition}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz */}
          {quiz.length > 0 && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Brain size={16} color="#a78bfa" /> Quick Quiz
                </h3>
                {quizDone && <span className={`badge ${score / quiz.length >= 0.7 ? 'badge-emerald' : 'badge-rose'}`}>{score}/{quiz.length}</span>}
              </div>
              {quiz.map((q, i) => (
                <div key={i} style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.625rem' }}>{i + 1}. {q.question}</div>
                  {q.options?.map((opt, j) => {
                    const selected = answers[i] === j;
                    const revealed = quizDone;
                    const isCorrect = j === q.correct;
                    let bg = 'var(--bg-secondary)', border = 'var(--border-color)', color = 'var(--text-secondary)';
                    if (revealed && isCorrect) { bg = 'rgba(16,185,129,0.1)'; border = 'rgba(16,185,129,0.3)'; color = '#34d399'; }
                    else if (revealed && selected && !isCorrect) { bg = 'rgba(244,63,94,0.1)'; border = 'rgba(244,63,94,0.3)'; color = '#fb7185'; }
                    else if (!revealed && selected) { bg = 'rgba(139,92,246,0.1)'; border = '#8b5cf6'; color = '#a78bfa'; }
                    return (
                      <button key={j} onClick={() => !quizDone && setAnswers(prev => ({ ...prev, [i]: j }))} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.625rem 0.875rem', marginBottom: '0.375rem', borderRadius: 8, border: `1.5px solid ${border}`, background: bg, color, fontSize: '0.825rem', cursor: quizDone ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ))}
              {!quizDone ? (
                <button onClick={() => setQuizDone(true)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={Object.keys(answers).length < quiz.length}>
                  Submit Quiz
                </button>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(139,92,246,0.06)', borderRadius: 10 }}>
                  Score: <strong style={{ color: '#a78bfa' }}>{Math.round((score / quiz.length) * 100)}%</strong>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
