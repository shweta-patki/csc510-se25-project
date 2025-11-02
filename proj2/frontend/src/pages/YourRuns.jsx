import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function YourRuns({ runs, setRuns}) {
  const [yourRuns, setYourRuns] = useState([]);
    const { user } = useAuth();

  // Automatically updates whenever runs or user change
  useEffect(() => {
    if (user) {
      const userRuns = runs.filter((r) => r.runner === user.username);
      setYourRuns(userRuns);
    }
  }, [runs]);

  // Optional manual refresh 
  const handleRefresh = () => {
    if (user) {
      setYourRuns(runs.filter((r) => r.runner === user.username));
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Your Runs</h1>
        <button className="btn btn-secondary" onClick={handleRefresh}>
          Refresh
        </button>
      </div>

      {yourRuns.length === 0 ? (
        <p>You haven’t broadcasted any runs yet.</p>
      ) : (
        <div className="runs-list">
          {yourRuns.map((run) => (
            <div key={run.id} className="run-card">
              <div className="run-card-header">
                <h3>{run.restaurant}</h3>
                <span className="run-card-runner">ETA: {run.eta}</span>
              </div>
              <div className="run-card-body">
                <p><strong>Seats Left:</strong> {run.seats}</p>
                <p><strong>Orders Taken:</strong> {run.orders?.length || 0}</p>
                {run.orders?.length > 0 && (
                  <ul>
                    {run.orders.map((o, i) => (
                      <li key={i}>
                        {o.user}: {o.items.join(", ")}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

