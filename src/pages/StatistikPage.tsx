import Dashboard from "./Dashboard";

export default function StatistikPage() {
  return (
    <div className="min-h-screen bg-gray-100 px-4 md:px-8 py-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Statistik Website GKI Cipinang Indah
        </h1>
        <Dashboard />
      </div>
    </div>
  );
}
