import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">Home</Link>
        <Link to="/broadcast">Broadcast</Link>
        <Link to="/your-runs">Your Runs</Link>
        <Link to="/profile">Profile</Link>
      </div>

      <div className="navbar-right">
        <span className="navbar-username">{user?.username ?? 'User'}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
