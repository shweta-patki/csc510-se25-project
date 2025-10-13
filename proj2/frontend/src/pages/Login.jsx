import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';

const Login = () => {
    const { login, user } = useAuth();
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      if (user) navigate('/');
    }, [user, navigate]);

    const handleLogin = async (credentials) => {
        try {
            await login(credentials.username ?? credentials.email ?? credentials, credentials.password);
            navigate('/');
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <AuthForm onSubmit={handleLogin} isLogin />
      <p style={{ marginTop: 12 }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;