export default function RunCard({ run }) {
  return (
    <div className="run-card">
      <div className="run-card-header">
        <h3>{run.restaurant}</h3>
        <span className="run-card-runner">by {run.runner}</span>
      </div>
      <div className="run-card-body">
        <p><strong>ETA:</strong> {run.eta}</p>
        <p><strong>Open Seats:</strong> {run.seats}</p>
      </div>
      <div className="run-card-footer">
        <button className="btn btn-primary">Join Run</button>
      </div>
    </div>
  );
}
