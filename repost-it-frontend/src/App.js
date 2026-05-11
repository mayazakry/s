import React, { useState } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [persona, setPersona] = useState('the-pro');
  const [output, setOutput] = useState('');

  const generateBundle = async () => {
    const response = await fetch('https://repost-it-api.maya-zakry.workers.dev/', {
      method: 'POST',
      body: JSON.stringify({ content: input, persona: persona })
    });
    const data = await response.json();
    setOutput(data.result);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Repost.it</h1>
      <textarea 
        placeholder="Paste your idea or link here..." 
        style={{ width: '100%', height: '100px' }}
        onChange={(e) => setInput(e.target.value)}
      />
      <select onChange={(e) => setPersona(e.target.value)}>
        <option value="the-pro">The Pro (LinkedIn)</option>
        <option value="the-hustler">The Hustler (Sales)</option>
      </select>
      <button onClick={generateBundle} style={{ marginTop: '10px' }}>Generate Bundle</button>
      {output && <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>{output}</div>}
    </div>
  );
}

export default App;