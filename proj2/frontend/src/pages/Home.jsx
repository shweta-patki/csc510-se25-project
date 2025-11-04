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
  const navigate = useNavigate();

  const handleJoinClick = (run) => {
    if (run.runner === user.username) {
      alert("You cannot join your own run."); //Prevent joining your own run
      return;
    }

    if (menuData[run.restaurant]) { //TODO: Change to API Calls when backend is ready
      setActiveRun(run); // Show popup for menu selection
    } else {
      alert(`Joining run to ${run.restaurant}`);
      handleConfirmOrder([], run);
    }
  };

  const handleConfirmOrder = (selectedItems = [], run = activeRun) => {
  if (!run) return;

  const updatedRuns = runs
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
    .filter((r) => r.seats > 0); // remove runs with no seats left

  setRuns(updatedRuns);
  localStorage.setItem("runs", JSON.stringify(updatedRuns)); //TODO: Change to API Calls when backend is ready

  setActiveRun(null);
};

const joinedRuns = runs.filter((r) =>
    r.orders?.some(order => order.user === user.username)
  );

const availableRuns = runs.filter(
    (r) =>
      r.runner !== user.username &&
      !(r.orders?.some(order => order.user === user.username)) &&
      r.seats > 0
  );


return (
    <div className="home-container">
      <div className="home-header">
        <h1>Active Runs</h1>
      </div>

      <div className="runs-columns">
        <div className="runs-section">
          <h3>Available Runs</h3>
          <div className="runs-list scrollable">
            {availableRuns.length > 0 ? (
              availableRuns.map((run) => (
                <RunCard
                  key={run.id}
                  run={run}
                  onJoin={handleJoinClick}
                  currentUser={user}
                  joinedRuns={joinedRuns}
                />
              ))
            ) : (
              <p>No available runs.</p>
            )}
          </div>
        </div>

        <div className="runs-section">
          <h3>Joined Runs</h3>
          <div className="runs-list scrollable">
            {joinedRuns.length > 0 ? (
              joinedRuns.map((run) => (
                <RunCard
                  key={run.id}
                  run={run}
                  onJoin={handleJoinClick}
                  currentUser={user}
                  joinedRuns={joinedRuns}
                />
              ))
            ) : (
              <p>You haven’t joined any runs yet.</p>
            )}
          </div>
        </div>
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
