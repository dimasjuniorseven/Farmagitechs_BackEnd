import React, { useState, useEffect, useRef } from 'react';
import './ChatPage.css';

export default function ChatPage({ user, goLogin }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [username] = useState(() => user?.username || 'Anonim' + Math.floor(Math.random() * 1000));
  const [replyTo, setReplyTo] = useState(null);
  const [showMention, setShowMention] = useState(false);
  const [mentionOptions, setMentionOptions] = useState([]);
  const [cursorPos, setCursorPos] = useState(0);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/messages')
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        const uniqueUsers = [...new Set(data.map(msg => msg.username))];
        setMentionOptions(uniqueUsers.filter(name => name !== username));
      })
      .catch(err => console.error('Gagal fetch pesan:', err));
  }, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fungsi format tanggal dan jam ke format: DD MMM YYYY HH:mm:ss
  const formatDate = (isoStr) => {
    const dt = new Date(isoStr);
    return dt.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ' ' + dt.toLocaleTimeString('id-ID', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    let textToSend = input;

    if (replyTo) {
      const mentionString = `>> Membalas @${replyTo.username}\n`;
      if (!input.startsWith(mentionString)) {
        textToSend = mentionString + input;
      }
    }

    const now = new Date();

    if (editingId) {
      fetch(`http://localhost:5000/messages/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSend }),
      })
        .then(res => res.json())
        .then(updated => {
          setMessages(prev => prev.map(msg => msg.id === updated.id ? updated : msg));
          setEditingId(null);
          setInput('');
          setReplyTo(null);
        });
    } else {
      const newMsg = {
        username,
        text: textToSend,
        timestamp: now.toISOString(),
        replyTo: replyTo ? replyTo.id : null,
        replyText: replyTo ? replyTo.text : null,
        replyUser: replyTo ? replyTo.username : null,
      };

      fetch('http://localhost:5000/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg),
      })
        .then(res => res.json())
        .then(saved => {
          setMessages(prev => [...prev, saved]);
          setInput('');
          setReplyTo(null);
        });
    }
  };

  const editMessage = (id, text) => {
    setEditingId(id);
    setInput(text);
    setReplyTo(null);
  };

  const deleteMessage = (id) => {
    fetch(`http://localhost:5000/messages/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setMessages(prev => prev.filter(msg => msg.id !== id));
      });
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    setCursorPos(e.target.selectionStart);

    const lastWord = val.slice(0, e.target.selectionStart).split(' ').pop();
    if (lastWord.startsWith('@')) {
      setShowMention(true);
    } else {
      setShowMention(false);
    }
  };

  const handleMentionClick = (mentionName) => {
    const words = input.slice(0, cursorPos).split(' ');
    words[words.length - 1] = `@${mentionName}`;
    const newText = words.join(' ') + input.slice(cursorPos);
    setInput(newText);
    setShowMention(false);
    setTimeout(() => {
      inputRef.current.focus();
    }, 0);
  };

  // Render teks dengan mention @username warna biru dan bold
  const renderTextWithMentions = (text) => {
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const start = match.index;
      const end = mentionRegex.lastIndex;

      if (start > lastIndex) {
        parts.push(text.slice(lastIndex, start));
      }

      parts.push(
        <span key={start} className="mention-blue">
          @{match[1]}
        </span>
      );

      lastIndex = end;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.map((part, i) =>
      typeof part === 'string'
        ? part.split('\n').reduce((acc, line, idx, arr) => {
            if (idx === arr.length - 1) return [...acc, line];
            else return [...acc, line, <br key={idx} />];
          }, [])
        : part
    );
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className='header-left'>
          <h1>💬 Surat Dalam Botol</h1>
          <div className="chat-username">Welcome, <strong>{username}</strong></div>
          {!user && <button className="login-button" onClick={goLogin}>Masuk</button>}
        </div>
      </header>

      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message-bubble ${msg.username === username ? 'own' : ''}`}>
            <div className="avatar">
              <img
                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                alt="avatar"
              />
            </div>
            <div className="bubble">
              {msg.replyTo && (
                <div className="reply-info">
                  <div className="reply-username">@{msg.replyUser}:</div>
                  <div className="reply-text">"{renderTextWithMentions(msg.replyText)}"</div>
                </div>
              )}
              <p className="message-text">{renderTextWithMentions(msg.text)}</p>
              <div className="message-info">
                <span className="username">{msg.username}</span>
                <span className="timestamp">{formatDate(msg.timestamp)}</span>
              </div>
              <div className="action-buttons">
                <button onClick={() => setReplyTo(msg)}>↩️</button>
                {msg.username === username && (
                  <>
                    <button onClick={() => editMessage(msg.id, msg.text)}>✏️</button>
                    <button onClick={() => deleteMessage(msg.id)}>🗑️</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {replyTo && (
        <div className="reply-preview">
          Membalas: <strong>@{replyTo.username}</strong> — <em>"{replyTo.text}"</em>
          <button className="cancel-reply" onClick={() => setReplyTo(null)}>❌ Batal</button>
        </div>
      )}

      <div className="chat-input-area">
        <input
          type="text"
          ref={inputRef}
          placeholder="Tulis pesan disini... 😊❤️😂"
          value={input}
          onChange={handleInputChange}
          onKeyDown={e => {
            if (e.key === 'Enter') sendMessage();
          }}
        />
        <button onClick={sendMessage}>{editingId ? 'Simpan' : 'Send'}</button>

        {showMention && (
          <div className="mention-dropdown">
            {mentionOptions.map(name => (
              <div
                key={name}
                className="mention-option"
                onClick={() => handleMentionClick(name)}
              >
                @{name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
