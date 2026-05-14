import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Detector from './pages/Detector';
import Humanizer from './pages/Humanizer';
import History from './pages/History';
import { textService } from './services/api';

function App() {
  useEffect(() => {
    // Test backend connection on startup
    textService.testConnection()
      .then(() => console.log('✅ Backend connected'))
      .catch(err => console.error('❌ Backend connection failed:', err));
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/detector" element={<Detector />} />
            <Route path="/humanizer" element={<Humanizer />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;