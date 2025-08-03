import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import './index.css';

const App: React.FC = () => {
  const [user, setUser] = useState<{ userId: number; username: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('https://localhost/api/auth/profile', { credentials: 'include' });
        const data = await response.json();
        if (response.ok && data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogin = (userData: { userId: number; username: string; email: string }) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    fetch('https://localhost/api/auth/logout', { method: 'POST', credentials: 'include' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLoginSuccess={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
};

export default App;
