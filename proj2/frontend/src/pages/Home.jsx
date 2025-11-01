import React, {useState} from 'react';
import { useNavigate} from 'react-router-dom';
import RunCard from "../components/RunCard";
import Menu from "../components/Menu";
import { useAuth } from '../hooks/useAuth';
import menuData from "../mock_data/menuData.json";


export default function Home({ runs ,setRuns}) {
  const [activeRun, setActiveRun] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleJoinClick = (run) => {
    if (menuData[run.restaurant]) {
      setActiveRun(run); // Show popup for menu selection
    } else {
      alert(`Joining run to ${run.restaurant}`);
      handleConfirmOrder([], run);
    }
  };

  const handleConfirmOrder = (selectedItems = [], run = activeRun) => {
    if (!run) return;
    setRuns((prevRuns) =>
      prevRuns
        .map((r) =>
          r.id === run.id
            ? {
                ...r,
                seats: r.seats - 1,
                orders: [
                  ...(r.orders || []),
                  { user: user.username, items: selectedItems },
                ],
              }
            : r
        )
        .filter((r) => r.seats > 0) // remove runs with no seats left
    );

    setActiveRun(null);
  };

  const updateSeats = (runId) => {
    setRuns((prevRuns) =>
      prevRuns
        .map((r) => (r.id === runId ? { ...r, seats: r.seats - 1 } : r))
        .filter((r) => r.seats > 0)
    );
  };

  return (
    <div className="home-container">
      {/* <header className="home-header">
        <h1>Welcome, {user?.username ?? 'User'}</h1>
        <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
      </header> */}

      <h2>Active Runs</h2>
      <div className="runs-list">
        {runs.length === 0 ? (
          <p>No active runs yet. Broadcast one!</p>
        ) : (
          runs.filter((r) => r.seats > 0).map((run) => (
          <RunCard key={run.id} run={run} onJoin={handleJoinClick} />
        ))
        )}
      </div>
      {activeRun && (
        <Menu
          restaurant={activeRun.restaurant}
          menuItems={menuData[activeRun.restaurant] || []}
          onClose={() => setActiveRun(null)}
          onConfirm={handleConfirmOrder}
        />
      )}
    </div>
  );
}

