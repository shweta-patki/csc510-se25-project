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
