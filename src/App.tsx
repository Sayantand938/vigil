// src/App.tsx
import * as React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Timer } from "@/pages/Timer";
import { History } from "@/pages/History";
import { Settings } from "@/pages/Settings";
import { LoginSignup } from "@/components/LoginSignup";
import { Spinner } from "@/components/Spinner";
import { useTimerStore } from "@/store/timerStore";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      }
      setLoading(false);
    });
  }, [navigate]);

  if (loading) {
    return <Spinner size="lg" />;
  }

  return children;
}

export function App() {
  const initStore = useTimerStore((state) => state.init);

  useEffect(() => {
    // Initialize the store (set up auth listener, fetch session)
    const unsubscribe = initStore();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [initStore]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginSignup />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;