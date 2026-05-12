import React, { useState } from 'react';
import './App.css';

const PERSONAS = [
  { value: 'the-pro',      label: '💼 The Pro',     sub: 'LinkedIn-ready, polished' },
  { value: 'the-hustler',  label: '🔥 The Hustler',  sub: 'Sales energy, punchy' },
  { value: 'the-cook',     label: '🍳 The Cook',     sub: 'Facebook food seller' },
  { value: 'the-creator',  label: '✨ The Creator',  sub: 'Twitter/X thread format' },
  { value: 'the-casual',   label: '😎 The Casual',   sub: 'Instagram, chill tone' },
];

// instagram has no compose URL — handlePreview copies text first then opens the app
const PLATFORM_COMPOSE = {
  linkedin:  (text) => `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`,
  twitter:   (text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  threads:   (text) => `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`,
  facebook:  (text) => `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`,
  instagram: ()     => `https://www.instagram.com/`,
};

const PLATFORM_LABELS = {
  linkedin:  { badge: 'in', name: 'LinkedIn' },
  twitter:   { badge: 'X',  name: 'X / Twitter' },
  threads:   { badge: '@',  name: 'Threads' },
  facebook:  { badge: 'f',  name: 'Facebook' },
  instagram: { badge: '📸', name: 'Instagram' },
};

function guessPlatform(title, persona) {
  const t = (title || '').toLowerCase();
  const p = (persona || '').toLowerCase();
  if (t.includes('linkedin') || t.includes('professional') || p === 'the-pro') return 'linkedin';
  if (t.includes('thread') || t.includes('twitter') || t.includes(' x ') || p === 'the-creator') return 'threads';
  if (t.includes('facebook') || t.includes('community') || p === 'the-cook') return 'facebook';
  if (t.includes('instagram') || t.includes('casual') || p === 'the-casual') return 'instagram';
  return 'twitter';
}

function parseIntoSections(text) {
  // Split on bold headers like **Option 1: Title** — drop any preamble intro that has no title
  const byOption = text.split(/(?=\n?\*\*(?:Option|Post|Version|Variation)\s+\d+[^*]*\*\*)/i).filter(s => s.trim());

  if (byOption.length > 1) {
    return byOption
      .map((part, i) => {
        const m = part.match(/^\*\*([^*]+)\*\*\n?([\s\S]*)/);
        if (m) return { id: i, title: m[1].trim(), content: m[2].trim() };
        return null; // skip preamble sections with no bold title
      })
      .filter(Boolean);
  }

  // Split on --- dividers
  const byDivider = text.split(/\n---+\n/).filter(s => s.trim());
  if (byDivider.length > 1) {
    return byDivider
      .map((part, i) => {
        const m = part.match(/^\*\*([^*]+)\*\*\n?([\s\S]*)/);
        if (m) return { id: i, title: m[1].trim(), content: m[2].trim() };
        return null;
      })
      .filter(Boolean);
  }

  // No clear sections — return as one card (strip leading intro line if present)
  const stripped = text.replace(/^[^\n*]+\n\n/, '').trim();
  return [{ id: 0, title: 'Your Bundle', content: (stripped || text).trim() }];
}

function ThreadItem({ part, index, total, platform }) {
  const [copied, setCopied] = useState(false);
  const clean = part.replace(/^\d+\/\d+\s*/, '').replace(/\*\*/g, '').trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(clean).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePost = () => {
    window.open(PLATFORM_COMPOSE[platform](clean), '_blank', 'noopener');
  };

  return (
    <div className="thread-item">
      <div className="thread-item-top">
        <span className="thread-num">{index + 1}/{total}</span>
        <div className="thread-item-actions">
          <button className="thread-act copy" onClick={handleCopy}>{copied ? '✓' : 'Copy'}</button>
          <button className="thread-act post" onClick={handlePost}>Post</button>
        </div>
      </div>
      <p className="thread-text">{clean}</p>
    </div>
  );
}


function PostCard({ post, persona, index }) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');
  const platform = guessPlatform(post.title, persona);
  const { badge, name } = PLATFORM_LABELS[platform];

  // Thread if: explicit 1/N notation, title says thread, or creator persona with multiple paragraphs
  const paragraphs = post.content.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  const isThread = /\b1\/\d+\b/.test(post.content)
    || /\bthread\b/i.test(post.title)
    || (persona === 'the-creator' && paragraphs.length > 1);

  const threadParts = isThread ? paragraphs : [];

  const copyText = post.content;

  const handleCopy = () => {
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePreview = () => {
    const previewText = (isThread ? threadParts[0] || post.content : post.content).replace(/\*\*/g, '');
    if (platform === 'instagram') {
      navigator.clipboard.writeText(previewText).catch(() => {});
      setToast('✓ Text copied — paste it in Instagram');
      // delay opening so the user sees the toast before the tab switches
      setTimeout(() => window.open('https://www.instagram.com/', '_blank', 'noopener'), 900);
      setTimeout(() => setToast(''), 4000);
    } else {
      window.open(PLATFORM_COMPOSE[platform](previewText), '_blank', 'noopener');
    }
  };

  return (
    <div className="post-card">
      <div className="post-card-header">
        <div className="post-meta">
          <span className="post-index">Post {index + 1}</span>
          <span className="post-title-text">{post.title}</span>
        </div>
        <span className={`platform-badge plat-${platform}`}>{badge}</span>
      </div>

      <div className="post-body">
        {isThread ? (
          <div className="thread-list">
            {threadParts.map((part, i) => (
              <ThreadItem key={i} part={part} index={i} total={threadParts.length} platform={platform} />
            ))}
            <p className="thread-hint">Post each part, then reply to yourself to continue the thread.</p>
          </div>
        ) : (
          <p className="post-text">{post.content.replace(/\*\*/g, '')}</p>
        )}
      </div>

      {toast && <div className="post-toast">{toast}</div>}

      {!isThread && (
        <div className="post-actions">
          <button className="act-btn act-copy" onClick={handleCopy}>
            {copied ? '✓ Copied!' : 'Copy Text'}
          </button>
          <button className="act-btn act-preview" onClick={handlePreview}>
            {platform === 'instagram' ? 'Copy + Open Instagram' : `Preview on ${name}`}
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [input, setInput]       = useState('');
  const [persona, setPersona]   = useState('the-pro');
  const [posts, setPosts]       = useState([]);
  const [rawOutput, setRaw]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [copiedAll, setCopiedAll] = useState(false);

  const generateBundle = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setPosts([]);
    setRaw('');
    try {
      const res = await fetch('https://repost-it-api.maya-zakry.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input, persona }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const text = data.result || JSON.stringify(data, null, 2);
      setRaw(text);
      setPosts(parseIntoSections(text));
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(rawOutput).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') generateBundle();
  };

  const hasOutput = posts.length > 0;

  return (
    <div className={`app${hasOutput ? ' app--wide' : ''}`}>
      <div className={`layout${hasOutput ? ' layout--two-col' : ''}`}>

        {/* ── LEFT / INPUT PANEL ── */}
        <div className="panel panel--input">
          <header className="header">
            <h1 className="logo">repost<span className="dot">.</span>it</h1>
            <p className="tagline">Turn any idea into platform-ready posts — powered by Gemini</p>
          </header>

          <p className="step-label">Step 1 · Input Your Core Concept</p>
          <textarea
            className="textarea"
            placeholder="Paste an article, idea, or rough draft…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={5}
          />

          <p className="step-label">Step 2 · Choose Your Tone Persona</p>
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
            {loading
              ? <><span className="spinner" /> Generating…</>
              : '✦ Generate My Social Bundle'}
          </button>
          <p className="hint">Tip: Cmd/Ctrl + Enter to generate</p>

          {error && <div className="error-box">⚠️ {error}</div>}
        </div>

        {/* ── RIGHT / OUTPUT PANEL ── */}
        {hasOutput && (
          <div className="panel panel--output">
            <div className="output-top">
              <p className="step-label step-label--light">Step 3 · Your Social Bundle is Ready!</p>
              <button className="copy-all-btn" onClick={handleCopyAll}>
                {copiedAll ? '✓ All Copied' : 'Copy All'}
              </button>
            </div>
            <div className="posts-list">
              {posts.map((post, i) => (
                <PostCard key={post.id} post={post} persona={persona} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
