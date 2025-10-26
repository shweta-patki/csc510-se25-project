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
    <div className='auth-page'>
      <div className="auth-container">
        <h2>Login</h2>
        {error && <p className="auth-error">{error}</p>}
        <AuthForm onSubmit={handleLogin} isLogin className="auth-form"/>
        <p style={{ marginTop: 12 }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;