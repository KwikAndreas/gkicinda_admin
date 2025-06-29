import CMSManager from "./pages/CMSPage";

export default function App() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 md:px-8 py-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-indigo-800">
          GKI Cipinang Indah Admin Dashboard
        </h1>
        <p className="text-center text-gray-500 mb-10">
          Pantau statistik dan kelola konten website dengan mudah.
        </p>
        {/* CMS */}
        <CMSManager />

        {/* Statistik Google Analytics */}
        {/* <Dashboard /> */}
      </div>
    </main>
  );
}
