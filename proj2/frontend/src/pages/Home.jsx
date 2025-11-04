import React, {useState} from 'react';
import { useNavigate} from 'react-router-dom';
import RunCard from "../components/RunCard";
import Menu from "../components/Menu";
import { useAuth } from '../hooks/useAuth';
import menuData from "../mock_data/menuData.json";


export default function Home({ runs, setRuns }) {
  /* Home page component
    Displays a list of active runs and user information
  */
  const [activeRun, setActiveRun] = useState(null);
  const { user, logout } = useAuth();

  const handleJoinClick = (run) => {
    if (menuData[run.restaurant]) { //TODO: Change to API Calls when backend is ready
      setActiveRun(run); // Show popup for menu selection
    } else {
      // No menu popup for this restaurant — generate a PIN and show it to the joining user
      const generatedPin = String(Math.floor(1000 + Math.random() * 9000));
      alert(`Joining run to ${run.restaurant}. Your 4-digit PIN is ${generatedPin}. Give this to the runner when they arrive.`);
      handleConfirmOrder([], run, generatedPin);
    }
  };

  const handleConfirmOrder = (selectedItems = [], run = activeRun, pin = null) => {
  if (!run) return;

  const updatedRuns = runs
    .map((r) =>
      r.id === run.id
        ? {
            ...r,
            seats: r.seats - 1,
            orders: [
              ...(r.orders || []),
              { user: user.username, items: selectedItems, pin: pin, delivered: false },
            ],
          }
        : r
    )
    .filter((r) => r.seats > 0); // remove runs with no seats left

  setRuns(updatedRuns);
  localStorage.setItem("runs", JSON.stringify(updatedRuns)); //TODO: Change to API Calls when backend is ready

  setActiveRun(null);
};


  return (
    <div className="home-container">
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
            onConfirm={(selectedItems, pin) => handleConfirmOrder(selectedItems, activeRun, pin)}
        />
      )}
    </div>
  );
}

