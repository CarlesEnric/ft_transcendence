import React, { useState } from 'react';
import MatchesDashboard from './MatchesDashboard';

type Theme = 'dark' | 'light';

interface DashboardProps {
  user: { userId: number; username: string; email: string };
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }: DashboardProps) => {
  const [theme, setTheme] = useState<Theme>('dark');

  const handleThemeToggle = (): void => {
    setTheme((prevTheme: Theme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const handlePlayGame = (): void => {
    alert('Game functionality coming soon!');
  };

  const handleFindMatch = (): void => {
    alert('Matchmaking coming soon!');
  };

  const themeClasses =
    theme === 'dark'
      ? 'min-h-screen bg-gray-900 text-white'
      : 'min-h-screen bg-gray-100 text-gray-900';

  const cardClasses =
    theme === 'dark'
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
          <div className={`${cardClasses} mb-6`}>
            <h2 className="text-2xl font-bold mb-4">
              Welcome back, {user.username}! 🎮
            </h2>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Ready to play some Pong? Check out your stats and start a new game!
            </p>
          </div>

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
              <h3 className="text-xl font-bold mb-4 text-blue-400">📊 Your Stats</h3>
              <ul className="space-y-2">
                <li>Games Played: <span className="font-semibold">0</span></li>
                <li>Wins: <span className="font-semibold">0</span></li>
                <li>Losses: <span className="font-semibold">0</span></li>
                <li>Win Rate: <span className="font-semibold">0%</span></li>
              </ul>
            </div>
          </div>

          <div className={cardClasses + ' mb-6'}>
            <MatchesDashboard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
