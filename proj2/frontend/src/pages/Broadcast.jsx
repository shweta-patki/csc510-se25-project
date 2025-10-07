import React, { useState } from "react";

export default function Broadcast() {
  const [restaurant, setRestaurant] = useState("");
  const [eta, setEta] = useState("");
  const [seats, setSeats] = useState(4);

  const submit = (e) => {
    e.preventDefault();
    // TODO: call API POST /runs
    alert(`Broadcast run: ${restaurant} @ ${eta} seats:${seats}`);
  };

  return (
    <form onSubmit={submit} className="max-w-md bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Broadcast a Run</h2>
      <label className="block">
        Restaurant
        <input value={restaurant} onChange={(e)=>setRestaurant(e.target.value)} className="w-full mt-1 p-2 border rounded" />
      </label>
      <label className="block mt-2">
        ETA
        <input value={eta} onChange={(e)=>setEta(e.target.value)} className="w-full mt-1 p-2 border rounded" />
      </label>
      <label className="block mt-2">
        Seats
        <input type="number" value={seats} onChange={(e)=>setSeats(Number(e.target.value))} className="w-24 mt-1 p-2 border rounded" />
      </label>
      <div className="mt-4">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded">Broadcast</button>
      </div>
    </form>
  );
}