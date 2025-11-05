//import React, { useState, useContext } from 'react';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';

const Register = () => {
  /* Register page component 
    Handles user registration and redirects to dashboard on success
    Error handling: displays error messages if registration fails
  */
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
    <div className='auth-page'>
      <div className="auth-container">
        <h2>Register</h2>
        {error && <p className="auth-error">{error}</p>}
        <AuthForm onSubmit={handleRegister} isLogin={false} className="auth-form"/>
        <p style={{ marginTop: 12 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;