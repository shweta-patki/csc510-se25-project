import RunCard from "../components/RunCard";

export default function Home() {
  const mockRuns = [
    { id: 1, restaurant: "Campus Deli", eta: "12:30", seats: 3, runner: "Alice" },
    { id: 2, restaurant: "Pizza Place", eta: "13:15", seats: 2, runner: "Bob" },
  ];

  return (
    <div>
      <h2>Active Runs</h2>
      {mockRuns.map(run => <RunCard key={run.id} run={run} />)}
    </div>
  );
}
