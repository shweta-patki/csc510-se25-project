import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getRunById, removeOrder, completeRun, cancelRun } from "../services/runsService";

export default function RunDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const data = await getRunById(id);
      setRun(data);
    } catch (e) {
      setError(e.message || "Failed to load run");
    }
  }

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleRemove(orderId) {
    if (!window.confirm("Remove this order from the run?")) return;
    setLoading(true);
    setError("");
    try {
      await removeOrder(run.id, orderId);
      await load();
    } catch (e) {
      setError(e.message || "Failed to remove order");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    if (!window.confirm("Mark this run complete and award points?")) return;
    setLoading(true);
    setError("");
    try {
      await completeRun(run.id);
      await load();
    } catch (e) {
      setError(e.message || "Failed to complete run");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm("Cancel this run?")) return;
    setLoading(true);
    setError("");
    try {
      await cancelRun(run.id);
      await load();
    } catch (e) {
      setError(e.message || "Failed to cancel run");
    } finally {
      setLoading(false);
    }
  }

  const joinedCount = run ? Math.max((run.capacity || 0) - (run.seats_remaining || 0), 0) : 0;

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Run Details</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="btn btn-secondary" to="/your-runs">Back</Link>
          <button className="btn btn-secondary" onClick={load} disabled={loading}>Refresh</button>
        </div>
      </div>

      {error && (<div style={{ color: 'red', marginBottom: 12 }}>{error}</div>)}

      {!run ? (
        <p>Loading…</p>
      ) : (
        <div className="run-card run-card--details" style={{ maxWidth: 800 }}>
          <div className="run-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <h3 style={{ margin: 0 }}>{run.restaurant}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {run.status === 'active' && (
                <span className="badge badge-active">Active</span>
              )}
              <span className="run-card-runner">ETA: {run.eta}</span>
            </div>
          </div>
          <div className="run-card-body">
            <p><strong>Status:</strong> {run.status}</p>
            <p><strong>Drop:</strong> {run.drop_point}</p>
            <p><strong>Max joiners:</strong> {run.capacity}</p>
            <p><strong>Seats left:</strong> {run.seats_remaining}</p>
            <p><strong>Total participants:</strong> {1 + (Array.isArray(run.orders) ? run.orders.length : 0)}</p>

            {run.status === 'active' && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button className="btn btn-secondary" onClick={handleComplete} disabled={loading}>Complete</button>
                <button className="btn btn-secondary" onClick={handleCancel} disabled={loading}>Cancel</button>
              </div>
            )}

            <h4>Joined Users ({joinedCount})</h4>
            {Array.isArray(run.orders) && run.orders.length > 0 ? (
              <ul>
                {run.orders.map((o) => (
                  <li key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span>
                      <strong>{o.user_email}:</strong> {o.items} (${Number(o.amount).toFixed(2)})
                    </span>
                    {run.status === 'active' && (
                      <button className="btn btn-secondary" onClick={() => handleRemove(o.id)} disabled={loading}>Remove</button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{joinedCount > 0 ? 'Joined users present but not yet visible. Try Refresh.' : 'No joined users yet.'}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
