import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';

interface Match {
  id: number;
  player1: number;
  player2: number;
  score1: number;
  score2: number;
  date: string;
}

  interface MatchesDashboardProps {}
  const MatchesDashboard: React.FC<MatchesDashboardProps> = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      // Amb cookies HTTP-only, no cal JWT manualment
      apiFetch('https://localhost/api/matches/dashboard', {
        credentials: 'include' // Envia cookies amb la petició
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch matches');
          return res.json();
        })
        .then((data: any) => setMatches(Array.isArray(data) ? data : [data]))
        .catch((err: Error) => setError(err.message));
    }, []);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!matches.length) return <div>No matches found.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Match Dashboard</h2>
      <ul>
          {matches.map((match: Match) => (
            <li key={match.id}>
              {match.player1} vs {match.player2}  {match.score1}:{match.score2} ({match.date})
            </li>
          ))}
      </ul>
    </div>
  );
};

export default MatchesDashboard;
