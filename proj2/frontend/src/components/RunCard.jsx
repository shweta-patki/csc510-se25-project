export default function RunCard({ run }) {
  return (
    <div style={{ border: "1px solid #ddd", margin: "10px", padding: "10px" }}>
      <h3>{run.restaurant}</h3>
      <p>ETA: {run.eta} | Runner: {run.runner} | Seats: {run.seats}</p>
      <button>Join</button>
    </div>
  );
}
