import React, { useState ,useEffect} from 'react';
import { useAuth } from './hooks/useAuth';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';

//Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Broadcast from './pages/Broadcast';
import YourRuns from './pages/YourRuns';
import Profile from './pages/Profile';
import PinEntry from './pages/PinEntry';

//Components
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
    const stored = localStorage.getItem("runs");//TODO: Change to API Calls when backend is ready
    return stored
      ? JSON.parse(stored)
      : [
          { id: 1, restaurant: "PCJ", eta: "12:30", seats: 3, runner: "Alice" },
          { id: 2, restaurant: "Jason's", eta: "13:15", seats: 2, runner: "Bob" },
        ];
  });
  //TODO: Change to API Calls when backend is ready
  useEffect(() => {
    localStorage.setItem("runs", JSON.stringify(runs));
  }, [runs]);


  const handleAddOrder = (runId, items, username) => {
  setRuns((prevRuns) =>
    prevRuns.map((run) =>
      run.id === runId
        ? {
            ...run,
            seats: run.seats - 1,
            orders: [
              ...(run.orders || []),
              { user: username, items },
            ],
          }
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
              <YourRuns runs={runs} setRuns={setRuns} />
            </PrivateRoute>}/>

          <Route path="/pin/:runId/:orderIndex" element={
            <PrivateRoute>
              <PinEntry runs={runs} setRuns={setRuns} />
            </PrivateRoute>
          } />

          <Route path="/broadcast" element={
            <PrivateRoute>
              <Broadcast onBroadcast={handleAddRun}/> 
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