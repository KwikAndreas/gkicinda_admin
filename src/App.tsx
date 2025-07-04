import React, { useEffect, useState } from "react";
import { supabase } from "./api/supabase";
import Login from "./auth/LoginAuth";
import Home from "./pages/Home";

// ErrorBoundary sebagai class component
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
},
{
  error: Error | null;
}> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Bisa log error ke service eksternal di sini jika perlu
    // console.error(error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div>
            <h2 className="text-red-600 font-bold text-xl mb-2">
              Terjadi Error!
            </h2>
            <pre className="bg-gray-100 p-2 rounded">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ErrorBoundary>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <span>Loading...</span>
        </div>
      ) : !user ? (
        <Login />
      ) : (
        <Home />
      )}
    </ErrorBoundary>
  );
}
