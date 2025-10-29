import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import KnowledgePage from './pages/KnowledgePage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const username = localStorage.getItem('admin_username');
    
    if (token && username) {
      setIsAuthenticated(true);
      setIsAdmin(true);
    }
  }, []);

  const handleLogin = (username) => {
    setIsAuthenticated(true);
    setIsAdmin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <Router>
      <div className="app">
        <Toaster position="top-right" />
        
        {/* Navbar แสดงตลอด */}
        <Navbar 
          isAdmin={isAdmin} 
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />

        <Routes>
          {/* หน้าแรก = Chat */}
          <Route 
            path="/" 
            element={<ChatPage />} 
          />

          {/* Admin Pages */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/knowledge" replace /> : 
                <LoginPage onLogin={handleLogin} />
            } 
          />
          
          <Route 
            path="/knowledge" 
            element={
              isAuthenticated ? 
                <KnowledgePage /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          <Route 
            path="/analytics" 
            element={
              isAuthenticated ? 
                <AnalyticsPage /> : 
                <Navigate to="/login" replace />
            } 
          />

          {/* Redirect อื่นๆ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;