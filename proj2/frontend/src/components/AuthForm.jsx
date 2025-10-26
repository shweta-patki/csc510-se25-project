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
    try {
      if (onSubmit) {
        await onSubmit({ username: email, password });
      } else {
        if (isLogin) await ctxLogin(email, password);
        else await ctxRegister(email, password);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`auth-form ${className}`}>
      {error && <p className="error">{error}</p>}

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
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
