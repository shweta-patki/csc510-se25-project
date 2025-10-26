import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Broadcast from './pages/Broadcast';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Footer from "./components/Footer";

function Layout({ children }) {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);
  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
      {!hideNavbar && <Footer/>}
    </>
  );
}

function App() {
  const [runs, setRuns] = useState([
    { id: 1, restaurant: "Campus Deli", eta: "12:30", seats: 3, runner: "Alice" },
    { id: 2, restaurant: "Pizza Place", eta: "13:15", seats: 2, runner: "Bob" },
  ]);//Default Runs lifted to app to persists across accounts
  //TODO: Change to API Calls when backend is ready

  const handleAddRun = (newRun) => {
    setRuns((prev) => [newRun, ...prev]); //TODO: Change to API Calls when backend is ready
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <PrivateRoute>
              <Home runs={runs}/> {/* By Default loads the active run page */}
            </PrivateRoute>
          } />
          

          <Route path="/broadcast" element={
            <PrivateRoute>
              <Broadcast onBroadcast={handleAddRun}/> {/* Form to add run TODO: shift to NavBar when ready*/}
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;