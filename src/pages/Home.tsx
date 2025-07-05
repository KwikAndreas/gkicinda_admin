import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import CMSManager from "./CMSPage";
import { supabase } from "../api/supabase";

export default function Home() {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    setCounter(0);
    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev + 1 >= 900) {
          supabase.auth.signOut();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 px-2 sm:px-4 md:px-8 py-4 sm:py-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-indigo-800">
          GKI Cipinang Indah Admin Dashboard
        </h1>
        <p className="text-center text-gray-500 mb-8 sm:mb-10">
          Pantau statistik dan kelola konten website dengan mudah, Automatic Logout: {counter}.
        </p>

        {/* CMS */}
        <CMSManager />

        {/* Statistik Google Analytics */}
        <Dashboard />
      </div>
    </main>
  );
}
