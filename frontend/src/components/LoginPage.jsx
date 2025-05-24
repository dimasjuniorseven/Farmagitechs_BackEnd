import React, { useState } from 'react';
import './LoginPage.css';

const Login = ({ setUser, goRegister }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('Login error:', data);
        setError(data.message || 'Gagal masuk.. pastikan username dan password benar.');
        return;
      }

      setUser({ username: data.user.username });
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Gagal menghubungi server. Silakan coba lagi.');
    }
  };


  return (
    <div className="auth-container">
      <h2>Masuk</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
          required
          autoFocus
        />
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-11-7 1.28-2.52 3.75-4.51 6.87-5.15"/>
                <path d="M1 1l22 22"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>

        {error && (
          <div className="error-message" role="alert" aria-live="polite">
            <svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 24 24" fill="none" stroke="#e53935" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <button type="submit" disabled={!form.username || !form.password}>
          Login
        </button>
        <p className="register-link" onClick={goRegister}>
          Belum punya akun? <span>Daftar</span>
        </p>
      </form>
    </div>
  );
};

export default Login;
