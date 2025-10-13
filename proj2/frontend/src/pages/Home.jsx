import React from 'react';
import { useNavigate } from 'react-router-dom';
import RunCard from "../components/RunCard";
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const mockRuns = [
    { id: 1, restaurant: "Campus Deli", eta: "12:30", seats: 3, runner: "Alice" },
    { id: 2, restaurant: "Pizza Place", eta: "13:15", seats: 2, runner: "Bob" },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Welcome, {user?.username ?? 'User'}</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <h2>Active Runs</h2>
      {mockRuns.map(run => <RunCard key={run.id} run={run} />)}
    </div>
  );
}
