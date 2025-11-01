import React, { useState ,useEffect} from 'react';
import { useAuth } from './hooks/useAuth';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Broadcast from './pages/Broadcast';
import YourRuns from './pages/YourRuns';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Footer from "./components/Footer";

function Layout({ children }) {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);
  return (
    <>
      {!hideNavbar && <Navbar />}
      <main>{children}</main>
      {!hideNavbar && <Footer/>}
    </>
  );
}

function App() {
  const { user } = useAuth();
  const [runs, setRuns] = useState(() => {
    const stored = localStorage.getItem("runs");
    return stored
      ? JSON.parse(stored)
      : [
          { id: 1, restaurant: "PCJ", eta: "12:30", seats: 3, runner: "Alice" },
          { id: 2, restaurant: "Jason's", eta: "13:15", seats: 2, runner: "Bob" },
        ];
  });

  useEffect(() => {
    localStorage.setItem("runs", JSON.stringify(runs));
  }, [runs]);

  const handleAddOrder = (runId, items) => {
    setRuns((prevRuns) =>
      prevRuns.map((run) =>
        run.id === runId
          ? { ...run, orders: [...(run.orders || []), ...items] }
          : run
      )
    );
  };

  const handleAddRun = (newRun) => {
    setRuns((prev) => [newRun, ...prev]); //TODO: Change to API Calls when backend is ready
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <PrivateRoute>
              <Home runs={runs} onAddOrder={handleAddOrder} setRuns={setRuns}/> {/* By Default loads the active run page */}
            </PrivateRoute>
          } />
          <Route path="/your-runs" element={
            <PrivateRoute>
              <YourRuns runs={runs} currentUser={user} />
            </PrivateRoute>}/>

          <Route path="/broadcast" element={
            <PrivateRoute>
              <Broadcast onBroadcast={handleAddRun}/> {/* Form to add run TODO: shift to NavBar when ready*/}
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;