// App.js
import React, { useState, useRef, useEffect } from 'react';
import sakateeProfile from './sakatee-profile.js';
import sakateeAiProfile from './sakatees-ai-profile.js';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    const systemPrompt = {
      role: "system",
      content: `${sakateeAiProfile}\n\n${sakateeProfile}\n\nあなたの役割は、訪問者である「${username}（${gender || '性別不明'}）」と会話することです。\n相手を楽しませるように、短くテンポよく、親しみやすい言葉で対応してください。\n敬語や丁寧語はやわらかく、フランクさを意識してください。`
    };

    const chatMessages = [systemPrompt, ...newMessages.map(msg => ({ role: msg.role, content: msg.text }))];

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: chatMessages
        }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "(No response)";
      setMessages([...newMessages, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", text: "エラーが発生しました 😢" }]);
      console.error(err);
    }
  };

  if (!submitted) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', backgroundColor: '#e9e1d5', fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>あなたの情報を入力してください</h2>
          <div style={{ marginBottom: '1rem' }}>
            <input
              placeholder="名前を入力"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ padding: '0.5rem', marginRight: '0.5rem' }}
            />
            <div>
              <label>
                <input type="radio" name="gender" value="男性" checked={gender === "男性"} onChange={e => setGender(e.target.value)} /> 男性
              </label>
              <label style={{ marginLeft: '1rem' }}>
                <input type="radio" name="gender" value="女性" checked={gender === "女性"} onChange={e => setGender(e.target.value)} /> 女性
              </label>
              <label style={{ marginLeft: '1rem' }}>
                <input type="radio" name="gender" value="その他" checked={gender === "その他"} onChange={e => setGender(e.target.value)} /> その他
              </label>
            </div>
          </div>
          <button onClick={() => setSubmitted(true)}>開始</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', backgroundColor: '#1e1e1e', fontFamily: 'sans-serif',
      padding: 0, margin: 0,
    }}>
      <div style={{
        width: '100%', maxWidth: '600px', backgroundColor: 'white',
        display: 'flex', flexDirection: 'column', height: '100vh',
        position: 'relative',
      }}>
        <div style={{
          flexGrow: 1, overflowY: 'auto', padding: '1rem',
          paddingBottom: '5rem', // 入力欄に被らないようにする
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>sakatee-ai とおしゃべり 🤖</h2>
  
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'center', margin: '0.5rem 0'
            }}>
              {msg.role === 'assistant' && (
                <img src="/imgs/robot-icon.png" alt="AI" style={{ width: 30, height: 30, marginRight: '0.5rem' }} />
              )}
              <div style={{
                background: msg.role === 'user' ? '#d1e7dd' : '#333',
                color: msg.role === 'user' ? 'black' : 'white',
                padding: '0.5rem 1rem', borderRadius: '1rem', maxWidth: '80%',
                wordBreak: 'break-word'
              }}>{msg.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
  
        {/* 入力欄：スマホ画面下部固定 */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          maxWidth: '600px',
          background: 'white',
          borderTop: '1px solid #ddd',
          padding: '0.5rem',
          display: 'flex',
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="メッセージを入力..."
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #ccc',
              fontSize: '1rem'
            }}
          />
          <button onClick={handleSend} style={{
            padding: '0.75rem 1rem',
            marginLeft: '0.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            backgroundColor: '#0d6efd',
            color: 'white',
            fontSize: '1rem'
          }}>送信</button>
        </div>
      </div>
    </div>
  );
}

export default App;