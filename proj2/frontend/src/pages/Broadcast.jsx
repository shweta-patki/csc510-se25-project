import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";


export default function Broadcast({ onBroadcast }) {
  const [restaurant, setRestaurant] = useState("");
  const [eta, setEta] = useState("");
  const [seats, setSeats] = useState(4);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!restaurant || !eta) {
      alert("Please fill out both the restaurant and ETA!");
      return;
    }
    setError("");

    onBroadcast({
      restaurant,
      eta,
      seats: Number(seats),
      runner: user.username, 
      id: Date.now(), 
    });

    // TODO: API hit to store the new run
    alert(`Broadcast run: ${restaurant} @ ${eta} seats:${seats}`);
    navigate("/")
  };

  return (
    <div className="card broadcast-form">
      <h2 className="card-title">Broadcast a New Run</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="restaurant">Restaurant</label>
          <input 
            id="restaurant"
            type="text"
            value={restaurant} 
            onChange={(e) => setRestaurant(e.target.value)} 
            placeholder="e.g., Hunt Library Creamery"
          />
        </div>
        <div className="form-group">
          <label htmlFor="eta">ETA</label>
          <input 
            id="eta"
            type="text"
            value={eta} 
            onChange={(e) => setEta(e.target.value)}
            placeholder="e.g., 2:30 PM"
          />
        </div>
        <div className="form-group">
          <label htmlFor="seats">Available Seats</label>
          <input 
            id="seats"
            type="number" 
            value={seats} 
            onChange={(e) => setSeats(Number(e.target.value))} 
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary full-width">Broadcast</button>
      </form>
    </div>
  );
}