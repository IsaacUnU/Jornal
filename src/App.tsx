import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import TradeList from './features/trades/TradeList';
import TradeDetail from './features/trades/TradeDetail';
import CreateTrade from './features/trades/CreateTrade';
import EditTrade from './features/trades/EditTrade';
import TradeCalendar from './features/trades/TradeCalendar';
import Layout from './components/Layout';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />

        <Route element={session ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<TradeCalendar />} />
          <Route path="/trades" element={<TradeList />} />
          <Route path="/trades/new" element={<CreateTrade />} />
          <Route path="/trades/:id" element={<TradeDetail />} />
          <Route path="/trades/:id/edit" element={<EditTrade />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
