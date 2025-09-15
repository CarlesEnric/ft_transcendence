export interface User {
    userId: number;
    username: string;
    email: string;
    avatar?: string;
    stats?: UserStats;
    // stats?: {
    //   gamesPlayed: number;
    //   gamesWon: number;
    //   winRate: number;
    //   ranking: number;
    // };
  }
  
  export interface UserStats {
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
  }