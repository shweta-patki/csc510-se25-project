// import React from "react";

// export default function YourRuns({ runs, currentUser }) {
//   const yourRuns = runs.filter((r) => r.runner === currentUser?.username);


//   return (
//     <div className="home-container">
//       <div className="home-header">
//         <h1>Your Runs</h1>
//       </div>

//       {yourRuns.length === 0 ? (
//         <p>You haven’t broadcasted any runs yet.</p>
//       ) : (
//         <div className="runs-list">
//           {yourRuns.map((run) => (
//             <div key={run.id} className="run-card">
//               <div className="run-card-header">
//                 <h3>{run.restaurant}</h3>
//                 <span className="run-card-runner">ETA: {run.eta}</span>
//               </div>
//               <div className="run-card-body">
//                 <p><strong>Seats Left:</strong> {run.seats}</p>

//                 <h4>Orders Taken:</h4>
//                 {run.orders && run.orders.length > 0 ? (
//                   <ul className="order-list">
//                     {run.orders.map((order, idx) => (
//                       <li key={idx}>
//                         <strong>{order.user}:</strong>{" "}
//                         {order.items.join(", ")}
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <p>No orders yet.</p>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
// src/pages/YourRuns.jsx
import React, { useEffect, useState } from "react";

export default function YourRuns({ runs, setRuns, currentUser }) {
  const [yourRuns, setYourRuns] = useState([]);

  // Automatically updates whenever runs or user change
  useEffect(() => {
    if (currentUser) {
      const userRuns = runs.filter((r) => r.runner === currentUser.username);
      setYourRuns(userRuns);
    }
  }, [runs, currentUser]);

  // Optional manual refresh (useful for debugging)
  const handleRefresh = () => {
    if (currentUser) {
      setYourRuns(runs.filter((r) => r.runner === currentUser.username));
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

