import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';

const Register = () => {
    const { register } = useAuth();
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (credentials) => {
        try {
            await register(credentials.username ?? credentials.email ?? credentials, credentials.password);
            navigate('/'); // go to dashboard after successful register
        } catch (err) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
    <div className="register-container">
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      <AuthForm onSubmit={handleRegister} isLogin={false} />
      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;