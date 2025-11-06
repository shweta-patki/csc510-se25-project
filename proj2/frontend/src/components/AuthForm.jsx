import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthForm = ({ isLogin = true, onSubmit, className = '' }) => {
  const { login: ctxLogin, register: ctxRegister } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedEmail = (email || '').trim();
    // Client-side guidance: enforce NCSU format before calling API
    if (!trimmedEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!trimmedEmail.toLowerCase().endsWith('@ncsu.edu')) {
      setError('Please enter a valid NCSU email address');
      return;
    }
    try {
      if (onSubmit) {
        await onSubmit({ username: trimmedEmail, password });
      } else {
        if (isLogin) await ctxLogin(trimmedEmail, password);
        else await ctxRegister(trimmedEmail, password);
        navigate('/');
      }
    } catch (err) {
      const msg = (err?.message || 'Authentication failed').replace(/\s*\(\d+\)$/, '');
      setError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`auth-form ${className}`}>
      {error && <p className="auth-error" role="alert">{error}</p>}

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className={error ? 'input-error' : ''}
          aria-invalid={!!error}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className={error ? 'input-error' : ''}
          aria-invalid={!!error}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary full-width">
        {isLogin ? 'Login' : 'Register'}
      </button>
    </form>
  );
};

export default AuthForm;
