import React, { useState, useEffect } from 'react';

interface User {
  userId: number;
  username: string;
  email: string;
}

interface DashboardProps {
  token: string;
  onLogout: () => void;
}

type Theme = 'dark' | 'light';

interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
}

const Dashboard: React.FC<DashboardProps> = ({ token, onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<Theme>('dark');
  const [gameStats] = useState<GameStats>({
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    winRate: 0
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('https://localhost/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setUser(data.user);
        } else {
          setError('Failed to fetch user profile');
          // If token is invalid, logout
          if (response.status === 401) {
            onLogout();
          }
        }
      } catch (error) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token, onLogout]);

  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const handlePlayGame = () => {
    // TODO: Implement game functionality
    alert('Game functionality coming soon!');
  };

  const handleViewStats = () => {
    // TODO: Implement stats view
    alert('Stats view coming soon!');
  };

  const handleFindMatch = () => {
    // TODO: Implement matchmaking
    alert('Matchmaking coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  const themeClasses = theme === 'dark' 
    ? 'min-h-screen bg-gray-900 text-white' 
    : 'min-h-screen bg-gray-100 text-gray-900';

  const cardClasses = theme === 'dark' 
    ? 'bg-gray-800 rounded-lg p-6 shadow-lg' 
    : 'bg-white rounded-lg p-6 shadow-lg border';

  return (
    <div className={themeClasses}>
      <header className={theme === 'dark' ? 'bg-gray-800 p-4 shadow-lg' : 'bg-white p-4 shadow-lg border-b'}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">FT Transcendence</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleThemeToggle}
              className={`px-3 py-2 rounded transition-colors ${
                theme === 'dark' 
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className={`${cardClasses} mb-6`}>
            <h2 className="text-2xl font-bold mb-4">
              Welcome back, {user?.username}! 🎮
            </h2>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Ready to play some Pong? Check out your stats and start a new game!
            </p>
          </div>

          {/* Game Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className={cardClasses}>
              <h3 className="text-xl font-bold mb-4 text-green-400">🎯 Quick Play</h3>
              <div className="space-y-3">
                <button
                  onClick={handlePlayGame}
                  className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded transition-colors text-white font-semibold"
                >
                  🚀 Start Game
                </button>
                <button
                  onClick={handleFindMatch}
                  className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded transition-colors text-white font-semibold"
                >
                  🔍 Find Match
                </button>
              </div>
            </div>

            <div className={cardClasses}>
              <h3 className="text-xl font-bold mb-4 text-purple-400">� Your Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Games Played:</span>
                  <span className="font-semibold">{gameStats.gamesPlayed}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Wins:</span>
                  <span className="font-semibold text-green-400">{gameStats.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Losses:</span>
                  <span className="font-semibold text-red-400">{gameStats.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Win Rate:</span>
                  <span className="font-semibold text-blue-400">{gameStats.winRate}%</span>
                </div>
              </div>
              <button
                onClick={handleViewStats}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors text-white"
              >
                📈 View Detailed Stats
              </button>
            </div>
          </div>

          {/* User Profile */}
          <div className={cardClasses}>
            <h3 className="text-xl font-bold mb-4 text-indigo-400">👤 Profile Info</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Username:</p>
                <p className="font-semibold text-indigo-400">{user?.username}</p>
              </div>
              <div>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Email:</p>
                <p className="font-semibold text-indigo-400">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
