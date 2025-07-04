// Ganti dynamic import dengan import biasa jika bukan Next.js
import Dashboard from "./Dashboard";
import CMSManager from "./CMSPage";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 px-2 sm:px-4 md:px-8 py-4 sm:py-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-indigo-800">
          GKI Cipinang Indah Admin Dashboard
        </h1>
        <p className="text-center text-gray-500 mb-8 sm:mb-10">
          Pantau statistik dan kelola konten website dengan mudah.
        </p>

        {/* CMS */}
        <CMSManager />

        {/* Statistik Google Analytics */}
        <Dashboard />
      </div>
    </main>
  );
}
