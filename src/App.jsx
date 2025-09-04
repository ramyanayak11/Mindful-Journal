import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { JournalProvider } from './context/JournalContext';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Journal from './pages/Journal';
import Dashboard from './pages/Dashboard';
import Reflections from './pages/Reflections';
import './App.css';

// Create a wrapper component to access useLocation hook
function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/journal')) return 'journal';
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/reflections')) return 'reflections';
    return 'home';
  };

  return (
    <div className="app">
      <Sidebar 
        activeTab={getActiveTab()}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <main className="main-content">
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reflections" element={<Reflections />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <JournalProvider>
      <Router>
        <AppContent />
      </Router>
    </JournalProvider>
  );
}

export default App;