import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
// import { UserCircle } from 'lucide-react'; // optional icon (lucide-react already available)

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
        <Link to="/" className="font-semibold hover:underline">Home</Link>
        <Link to="/broadcast" className="font-semibold hover:underline">Broadcast</Link>
      </div>

      <div className="navbar-right">
        <Link to="/profile" className="flex items-center gap-1">
          {/* <UserCircle size={22} /> */}
          <span className="navbar-username">{user?.username ?? 'User'}</span>
        </Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
