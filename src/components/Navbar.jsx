import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, BookOpen, BarChart3, LogOut, User } from 'lucide-react';

export default function Navbar({ isAdmin, isAuthenticated, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <MessageSquare size={28} />
          <span>ASEFA AI Chatbot</span>
        </Link>

        {/* Nav Links */}
        <div className="navbar-links">
          <Link to="/" className="nav-link">
            <MessageSquare size={20} />
            <span>Chat</span>
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/knowledge" className="nav-link">
                <BookOpen size={20} />
                <span>Knowledge</span>
              </Link>

              <Link to="/analytics" className="nav-link">
                <BarChart3 size={20} />
                <span>Analytics</span>
              </Link>
            </>
          )}
        </div>

        {/* User Menu */}
        <div className="navbar-user">
          {isAuthenticated ? (
            <>
              <span className="user-name">
                <User size={18} />
                {localStorage.getItem('admin_username')}
              </span>
              <button onClick={handleLogout} className="logout-button">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="login-button">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}