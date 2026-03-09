import { useState, useRef } from 'react';
import { FileText, Upload, BookOpen, Brain, Loader } from 'lucide-react';
import { generateNotesFromText, generateQuiz } from '../services/geminiService';
import toast from 'react-hot-toast';

export default function PDFLearningPage() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [notes, setNotes] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizDone, setQuizDone] = useState(false);
  const fileRef = useRef();

  const extractText = (file) => new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = (e) => {
      const bytes = new Uint8Array(e.target.result);
      let text = '';
      for (let i = 0; i < bytes.length; i++) {
        const c = bytes[i];
        if (c >= 32 && c < 127) text += String.fromCharCode(c);
        else if (c === 10 || c === 13) text += ' ';
      }
      const cleaned = text.replace(/\s+/g, ' ').trim();
      resolve(cleaned.length > 200 ? cleaned : null);
    };
    fr.onerror = reject;
    fr.readAsArrayBuffer(file);
  });

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setNotes(null);
      setQuiz([]);
    } else {
      toast.error('Please upload a PDF file.');
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setLoadingText('Extracting text from PDF...');
    try {
      const text = await extractText(file);
      if (!text) throw new Error('Could not extract text from this PDF.');
      setLoadingText('Generating AI notes...');
      const n = await generateNotesFromText(text, 'PDF document');
      setNotes(n);
      setLoadingText('Generating quiz questions...');
      const q = await generateQuiz(n?.title || file.name, 'mcq', 8);
      setQuiz(q || []);
      toast.success('PDF processed successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to process PDF.');
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  const score = quiz.filter((q, i) => answers[i] === q.correct).length;

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Upload zone */}
      {!notes && (
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="#a78bfa" /> PDF Learning Mode
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
            Upload a PDF and get instant AI-generated notes and quiz
          </p>

          <div
            className={`upload-zone${dragOver ? ' drag-over' : ''}`}
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Drop your PDF here</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>or click to browse files</div>
          </div>

          {file && (
            <div style={{
              marginTop: '1rem', padding: '1rem', borderRadius: 10,
              background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={20} color="#a78bfa" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{file.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
              <button onClick={handleProcess} disabled={loading} className="btn-primary" style={{ padding: '0.625rem 1.25rem' }}>
                {loading ? <><Loader size={14} className="spinning" /> {loadingText}</> : <><BookOpen size={14} /> Process PDF</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem', width: 36, height: 36 }} />
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Processing PDF...</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{loadingText}</div>
        </div>
      )}

      {/* Notes Output */}
      {notes && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 800 }}>{notes.title || file?.name}</h2>
            <button onClick={() => { setNotes(null); setFile(null); setQuiz([]); setAnswers({}); setQuizDone(false); }} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
              Upload New PDF
            </button>
          </div>

          {/* Summary */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.875rem', fontSize: '1rem' }}>📋 Summary</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{notes.summary}</p>
          </div>

          {/* Key Points */}
          {notes.keyPoints?.length > 0 && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>🎯 Key Points</h3>
              {notes.keyPoints.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p}</span>
                </div>
              ))}
            </div>
          )}

          {/* Important Concepts */}
          {notes.importantConcepts?.length > 0 && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>💡 Important Concepts</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {notes.importantConcepts.map((c, i) => (
                  <div key={i} style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 10, padding: '0.875rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.825rem', color: '#22d3ee', marginBottom: '0.3rem' }}>{c.term}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.definition}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz section */}
          {quiz.length > 0 && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Brain size={16} color="#a78bfa" /> Quick Quiz
                </h3>
                {quizDone && <span className={`badge ${score / quiz.length >= 0.7 ? 'badge-emerald' : 'badge-rose'}`}>{score}/{quiz.length} Correct</span>}
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
                      <button key={j} onClick={() => !quizDone && setAnswers(prev => ({ ...prev, [i]: j }))}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '0.625rem 0.875rem', marginBottom: '0.375rem',
                          borderRadius: 8, border: `1.5px solid ${border}`,
                          background: bg, color, fontSize: '0.825rem',
                          cursor: quizDone ? 'default' : 'pointer', transition: 'all 0.2s',
                        }}>
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
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(139,92,246,0.06)', borderRadius: 10, border: '1px solid rgba(139,92,246,0.15)' }}>
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
