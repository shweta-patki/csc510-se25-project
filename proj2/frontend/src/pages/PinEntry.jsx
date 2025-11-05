import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function PinEntry({ runs, setRuns }) {
  const { runId, orderIndex } = useParams();
  const navigate = useNavigate();
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(null);

  const run = runs.find((r) => String(r.id) === String(runId));
  const order = run && run.orders && run.orders[Number(orderIndex)];

  if (!run || !order) {
    return (
      <div style={{ padding: 20 }}>
        <h3>Invalid run or order</h3>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{4}$/.test(pinInput)) {
      setError('Enter a 4-digit PIN');
      return;
    }
    if (order.pin == null) {
      setError('No PIN was set for this order');
      return;
    }
    if (String(order.pin) !== String(pinInput)) {
      setError('Incorrect PIN');
      return;
    }

    // mark delivered
    const updated = runs.map((r) => {
      if (r.id !== run.id) return r;
      const updatedOrders = r.orders.map((o, i) => i === Number(orderIndex) ? { ...o, delivered: true } : o);
      return { ...r, orders: updatedOrders };
    });

    setRuns(updated);
    localStorage.setItem('runs', JSON.stringify(updated));
    navigate(-1);
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Enter 4-digit PIN for {run.restaurant}</h3>
      <p>Order for: <strong>{order.user}</strong></p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
        <input
          type="text"
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
          maxLength={4}
          placeholder="1234"
          style={{ padding: 8, fontSize: 16 }}
        />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" type="submit">Submit PIN</button>
          <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
