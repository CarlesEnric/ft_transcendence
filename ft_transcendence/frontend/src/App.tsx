import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import './index.css';

const App: React.FC = () => {
  console.log('🚀 App component loading...');
  
  // Add immediate logging
  console.log('BEFORE useState - Current URL:', window.location.href);
  console.log('BEFORE useState - Search params:', window.location.search);
  
  // Initialize state with a function to handle OAuth2 token immediately
  const [user, setUser] = useState<{ token: string; userId?: number; username?: string; email?: string } | null>(() => {
    console.log('🔥🔥🔥 INITIAL STATE FUNCTION RUNNING! 🔥🔥🔥');
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Search params:', window.location.search);
    
    // Check for OAuth2 token in URL first
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('token');
    
    console.log('🔍 Token from URL:', oauthToken);
    
    if (oauthToken) {
      console.log('✅ FOUND TOKEN IN URL! Setting user...');
      localStorage.setItem('token', oauthToken);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return { token: oauthToken };
    }
    
    // Check localStorage as fallback
    const existingToken = localStorage.getItem('token');
    console.log('🔍 Token from localStorage:', existingToken);
    if (existingToken) {
      console.log('✅ FOUND TOKEN IN LOCALSTORAGE! Setting user...');
      return { token: existingToken };
    }
    
    console.log('❌ No token found');
    return null;
  });
  
  console.log('AFTER useState - user state:', user);
  
  const [loading, setLoading] = useState(false); // No need for loading since we handle token in initial state

  // Keep useEffect for debugging - token logic moved to initial state
  useEffect(() => {
    console.log('DEBUG: useEffect IS RUNNING!');
    console.log('DEBUG: User state after init:', user);
  }, []);

  const handleLogin = (data: string | { token: string; user: { userId: number; username: string; email: string } }) => {
    console.log('✅ User logged in successfully');
    
    if (typeof data === 'string') {
      // OAuth2 flow - only token received
      localStorage.setItem('token', data);
      setUser({ token: data });
    } else {
      // Normal login - complete user data received
      localStorage.setItem('token', data.token);
      setUser({ 
        token: data.token, 
        userId: data.user.userId, 
        username: data.user.username, 
        email: data.user.email 
      });
    }
  };

  const handleLogout = () => {
    console.log('👋 User logged out');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  console.log('🔍 Render decision - user:', user, 'loading:', loading);
  
  if (!user) {
    console.log('📝 Rendering LoginForm');
    return <LoginForm onLoginSuccess={handleLogin} />;
  }

  console.log('📝 Rendering Dashboard with token:', user.token.substring(0, 20) + '...');
  return <Dashboard token={user.token} onLogout={handleLogout} />;
};

export default App;
