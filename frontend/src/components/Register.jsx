import React, { useState, useEffect } from 'react';
import './Register.css';

const Register = ({ goLogin }) => {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(3);

  // By Dimas - validasi username dan password
  const validateForm = () => {
    if (!form.username.startsWith('@')) {
      setError('⚠️ Username harus diawali dengan karakter "@"');
      return false;
    }

    // Password harus ada huruf besar, huruf kecil, simbol, dan minimal 8 karakter
    const password = form.password;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const minLength = password.length >= 8;

    if (!hasUpperCase || !hasLowerCase || !hasSymbol || !minLength) {
      setError('⚠️ Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, dan simbol.');
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError('⚠️ Password dan konfirmasi password harus sama.');
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (success) {
      if (countdown === 0) {
        goLogin();
      } else {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [countdown, success, goLogin]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCountdown(3);

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(`⚠️ ${data.error || 'Terjadi kesalahan saat registrasi.'}`);
      } else {
        setSuccess(data.message || `✅ Akun "${form.username}" berhasil dibuat. Mengarahkan ke login dalam ${countdown} detik...`);
      }
    } catch (err) {
      setError('⚠️ Tidak bisa terhubung ke server.');
    }
  };

  // By Dimas - update success message saat countdown berubah
  useEffect(() => {
    if (success) {
      setSuccess(`✅ Akun "${form.username}" berhasil dibuat. Mengarahkan ke login dalam ${countdown} detik...`);
    }
  }, [countdown, form.username, success]);

  return (
    <div className="auth-container">
      <h2>Daftar</h2>
      <form onSubmit={handleRegister}>
        <input
          placeholder="Username (harus diawali @)"
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
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        <div className="password-wrapper">
          <input
            type={showConfirm ? 'text' : 'password'}
            placeholder="Konfirmasi Password"
            value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowConfirm(!showConfirm)}
            aria-label={showConfirm ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}
          >
            {showConfirm ? '🙈' : '👁️'}
          </button>
        </div>

        {error && (
          <div className="error-message" role="alert" style={{ color: 'red', marginBottom: 10 }}>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message" role="alert" style={{ color: 'green', marginBottom: 10 }}>
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={!form.username || !form.password || !form.confirmPassword}
        >
          Daftar
        </button>

        <p>
          Sudah punya akun?{' '}
          <span
            onClick={goLogin}
            style={{ color: '#feb47b', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline' }}
          >
            Masuk
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;
