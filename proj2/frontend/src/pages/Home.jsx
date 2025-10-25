import React from 'react';
import { useNavigate } from 'react-router-dom';
import RunCard from "../components/RunCard";
import { useAuth } from '../hooks/useAuth';


export default function Home({ runs }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome, {user?.username ?? 'User'}</h1>
        <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
      </header>

      <h2>Active Runs</h2>
      <div className="runs-list">
        {runs.length === 0 ? (
          <p>No active runs yet. Broadcast one!</p>
        ) : (
          runs.map((run) => <RunCard key={run.id} run={run} />)
        )}
      </div>
      
      <button className="btn btn-primary" onClick={() => navigate('/broadcast')}>
        Broadcast a Run
      </button>
    </div>
  );
}

