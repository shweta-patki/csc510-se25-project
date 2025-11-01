// export default function RunCard({ run }) {
//   return (
//     <div className="run-card">
//       <div className="run-card-header">
//         <h3>{run.restaurant}</h3>
//         <span className="run-card-runner">by {run.runner}</span>
//       </div>
//       <div className="run-card-body">
//         <p><strong>ETA:</strong> {run.eta}</p>
//         <p><strong>Open Seats:</strong> {run.seats}</p>
//       </div>
//       <div className="run-card-footer">
//         <button className="btn btn-primary">Join Run</button>
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import menuData from "../mock_data/menuData.json";
import Menu from "./Menu";

// export default function RunCard({ run, onAddOrder }) {
//   const [showMenu, setShowMenu] = useState(false);

//   const handleJoinClick = () => {
//     if (menuData[run.restaurant]) setShowMenu(true);
//     else alert(`Joining run to ${run.restaurant}`);
//   };

//   const handleConfirmOrder = (items) => {
//     onAddOrder(run.id, items);
//   };

//   return (
//     <div className="run-card">
//       <div className="run-card-header">
//         <h3>{run.restaurant}</h3>
//         <span className="run-card-runner">by {run.runner}</span>
//       </div>

//       <div className="run-card-body">
//         <p><strong>ETA:</strong> {run.eta}</p>
//         <p><strong>Open Seats:</strong> {run.seats}</p>

//         {run.orders && run.orders.length > 0 && (
//           <div className="orders-section">
//             <strong>Orders Taken:</strong>
//             <ul>
//               {run.orders.map((item, index) => (
//                 <li key={index}>{item}</li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>

//       <div className="run-card-footer">
//         <button className="btn btn-primary" onClick={handleJoinClick}>
//           Join Run
//         </button>
//       </div>
//     </div>
//   );
// }

export default function RunCard({ run, onJoin }) {
  return (
    <div className="run-card">
      <div className="run-card-header">
        <h3>{run.restaurant}</h3>
        <span className="run-card-runner">by {run.runner}</span>
      </div>

      <div className="run-card-body">
        <p><strong>ETA:</strong> {run.eta}</p>
        <p><strong>Available Seats:</strong> {run.seats}</p>
      </div>

      <div className="run-card-footer">
        <button
          className="btn btn-primary"
          onClick={() => onJoin(run)}
          disabled={run.seats <= 0}
        >
          {run.seats > 0 ? "Join Run" : "Full"}
        </button>
      </div>
    </div>
  );
}
