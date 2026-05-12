import React, { useState } from 'react';
import './App.css';

const PERSONAS = [
  { value: 'the-pro',      label: '💼 The Pro',     sub: 'LinkedIn-ready, polished' },
  { value: 'the-hustler',  label: '🔥 The Hustler',  sub: 'Sales energy, punchy' },
  { value: 'the-cook',     label: '🍳 The Cook',     sub: 'Facebook food seller' },
  { value: 'the-creator',  label: '✨ The Creator',  sub: 'Twitter/X vibes, snappy' },
  { value: 'the-casual',   label: '😎 The Casual',   sub: 'Instagram, chill tone' },
];

function App() {
  const [input, setInput] = useState('');
  const [persona, setPersona] = useState('the-pro');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generateBundle = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setOutput('');
    try {
      const response = await fetch('https://repost-it-api.maya-zakry.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input, persona }),
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setOutput(data.result || JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') generateBundle();
  };

  return (
    <div className="app">
      <div className="card">
        <header className="header">
          <h1 className="logo">repost<span className="dot">.</span>it</h1>
          <p className="tagline">Turn any idea into platform-ready posts — powered by Gemini</p>
        </header>

        <div className="form">
          <label className="label">Your idea or link</label>
          <textarea
            className="textarea"
            placeholder="Paste an article, idea, or rough draft…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={5}
          />

          <label className="label">Persona</label>
          <div className="persona-grid">
            {PERSONAS.map((p) => (
              <button
                key={p.value}
                className={`persona-btn${persona === p.value ? ' active' : ''}`}
                onClick={() => setPersona(p.value)}
              >
                <span className="persona-label">{p.label}</span>
                <span className="persona-sub">{p.sub}</span>
              </button>
            ))}
          </div>

          <button
            className={`generate-btn${loading ? ' loading' : ''}`}
            onClick={generateBundle}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <><span className="spinner" /> Generating…</>
            ) : (
              '✦ Generate Bundle'
            )}
          </button>

          <p className="hint">Tip: Cmd/Ctrl + Enter to generate</p>
        </div>

        {error && (
          <div className="error-box">
            <span>⚠️ {error}</span>
          </div>
        )}

        {output && (
          <div className="output-box">
            <div className="output-header">
              <span className="output-title">Your bundle</span>
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre className="output-text">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
