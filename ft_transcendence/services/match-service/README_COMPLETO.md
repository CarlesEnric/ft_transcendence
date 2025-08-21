# 📊 Match Service - Historial i Estadístiques

## 📋 Visió General

El Match Service gestiona **historial de partides, estadístiques de jugadors, leaderboards i anàlisis de rendiment**. Emmagatzema i processa tots els resultats de les partides.

## 🏗️ Funcionalitats Planificades

### ⚠️ **PLACEHOLDER - IMPORTANT FOR TRACKING**
- Historial complet de partides
- Estadístiques detallades per jugador
- Leaderboards globals i entre amics
- Anàlisi de rendiment
- Trends i progressió
- Achievements system
- Tournament tracking

## 🔧 Tecnologies

- **Fastify**: Framework web amb SSL/HTTPS
- **SQLite**: Base de dades per matches i estadístiques
- **JWT Validation**: Verificació tokens via Auth Service
- **Statistics Engine**: Càlculs d'estadístiques avançades
- **TypeScript**: Type safety complet

## 📁 Estructura Planificada

```
services/match-service/
├── src/
│   ├── index.ts              # Entry point
│   ├── routes/
│   │   ├── matches.ts        # Match management
│   │   ├── stats.ts          # Player statistics
│   │   ├── leaderboard.ts    # Rankings i leaderboards
│   │   └── health.ts         # Health check
│   ├── services/
│   │   ├── match.ts          # Match data processing
│   │   ├── statistics.ts     # Stats calculation engine
│   │   ├── ranking.ts        # Ranking calculations
│   │   └── achievements.ts   # Achievement tracking
│   ├── database/
│   │   ├── migrations/       # Database migrations
│   │   └── index.ts          # Database connection
│   ├── types/
│   │   ├── match.ts          # Match interfaces
│   │   └── stats.ts          # Statistics types
│   └── utils/
│       ├── calculations.ts   # Statistics calculations
│       └── validators.ts     # Input validation
├── ssl/
├── Dockerfile
├── package.json
└── tsconfig.json
```

## 🗄️ Database Schema Detallat

```sql
-- Matches table - Core match data
CREATE TABLE matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT UNIQUE,                  -- Reference to game service
  player1_id INTEGER NOT NULL,
  player2_id INTEGER NOT NULL,
  winner_id INTEGER,
  loser_id INTEGER,
  game_type TEXT DEFAULT 'pong',       -- 'pong', 'tournament', etc.
  status TEXT DEFAULT 'completed',      -- 'completed', 'forfeit', 'disconnected'
  duration INTEGER,                     -- Match duration in seconds
  started_at DATETIME NOT NULL,
  finished_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (winner_id) REFERENCES users(id),
  FOREIGN KEY (loser_id) REFERENCES users(id)
);

-- Match details - Detailed game data
CREATE TABLE match_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  max_ball_speed REAL,
  total_hits INTEGER,
  player1_hits INTEGER,
  player2_hits INTEGER,
  longest_rally INTEGER,
  match_data TEXT,                      -- JSON with detailed game events
  FOREIGN KEY (match_id) REFERENCES matches(id)
);

-- Player statistics - Aggregated stats
CREATE TABLE player_statistics (
  user_id INTEGER PRIMARY KEY,
  total_matches INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_percentage REAL DEFAULT 0.0,
  total_score INTEGER DEFAULT 0,
  average_score REAL DEFAULT 0.0,
  best_score INTEGER DEFAULT 0,
  total_playtime INTEGER DEFAULT 0,     -- Total seconds played
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  ranking_points INTEGER DEFAULT 1000,  -- ELO-style ranking
  last_match_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Rankings table - Historical rankings
CREATE TABLE rankings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  rank_position INTEGER NOT NULL,
  ranking_points INTEGER NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE,
  ranking_type TEXT DEFAULT 'global',   -- 'global', 'weekly', 'monthly'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Achievements table
CREATE TABLE achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,            -- 'first_win', 'win_streak_10', etc.
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  points INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common',         -- 'common', 'rare', 'epic', 'legendary'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Player achievements - Many to many
CREATE TABLE player_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  achievement_id INTEGER NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  progress INTEGER DEFAULT 100,         -- Progress percentage (for incremental achievements)
  UNIQUE(user_id, achievement_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);

-- Head to head statistics
CREATE TABLE head_to_head (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player1_id INTEGER NOT NULL,
  player2_id INTEGER NOT NULL,
  player1_wins INTEGER DEFAULT 0,
  player2_wins INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  last_match_at DATETIME,
  UNIQUE(player1_id, player2_id),
  FOREIGN KEY (player1_id) REFERENCES users(id),
  FOREIGN KEY (player2_id) REFERENCES users(id)
);

-- Indexes per performance
CREATE INDEX idx_matches_player1 ON matches(player1_id);
CREATE INDEX idx_matches_player2 ON matches(player2_id);
CREATE INDEX idx_matches_winner ON matches(winner_id);
CREATE INDEX idx_matches_finished_at ON matches(finished_at);
CREATE INDEX idx_player_stats_ranking ON player_statistics(ranking_points DESC);
CREATE INDEX idx_rankings_period ON rankings(period_start, period_end);
```

## 🚀 API Endpoints Detallats

### **Match Management**
```typescript
// POST /matches - Record new match result
server.post('/matches', async (request, reply) => {
  const matchData = validateMatchData(request.body);
  
  // Store match in database
  const match = await createMatch(db, {
    game_id: matchData.gameId,
    player1_id: matchData.player1Id,
    player2_id: matchData.player2Id,
    winner_id: matchData.winnerId,
    loser_id: matchData.loserId,
    duration: matchData.duration,
    started_at: new Date(matchData.startedAt),
    finished_at: new Date(matchData.finishedAt)
  });
  
  // Store detailed match data
  await createMatchDetails(db, match.id, matchData.details);
  
  // Update player statistics
  await updatePlayerStatistics(db, matchData.player1Id, matchData.player2Id, match);
  
  // Check for achievements
  await checkAchievements(db, matchData.player1Id, matchData.player2Id, match);
  
  // Update rankings
  await updateRankings(db, matchData.player1Id, matchData.player2Id, match);
  
  return reply.code(201).send({
    success: true,
    match: formatMatchResponse(match)
  });
});

// GET /matches/:userId - Get user's match history
server.get('/matches/:userId', async (request, reply) => {
  const { userId } = request.params;
  const { page = 1, limit = 20, opponent } = request.query;
  
  const matches = await getUserMatches(db, userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    opponent
  });
  
  return reply.send({
    success: true,
    matches: matches.map(formatMatchResponse),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: await getUserMatchCount(db, userId)
    }
  });
});

// GET /matches/:matchId - Get specific match details
server.get('/matches/:matchId', async (request, reply) => {
  const { matchId } = request.params;
  
  const match = await getMatchWithDetails(db, matchId);
  if (!match) {
    return reply.code(404).send({ error: 'Match not found' });
  }
  
  return reply.send({
    success: true,
    match: formatDetailedMatchResponse(match)
  });
});
```

### **Player Statistics**
```typescript
// GET /stats/:userId - Get player statistics
server.get('/stats/:userId', async (request, reply) => {
  const { userId } = request.params;
  const { period = 'all_time' } = request.query; // 'all_time', 'monthly', 'weekly'
  
  const stats = await getPlayerStatistics(db, userId, period);
  
  if (!stats) {
    return reply.code(404).send({ error: 'Player statistics not found' });
  }
  
  // Calculate additional metrics
  const enhancedStats = await calculateEnhancedStats(db, userId, stats);
  
  return reply.send({
    success: true,
    statistics: {
      ...stats,
      ...enhancedStats,
      period
    }
  });
});

// GET /stats/:userId/trends - Get performance trends
server.get('/stats/:userId/trends', async (request, reply) => {
  const { userId } = request.params;
  const { timeframe = '30d' } = request.query; // '7d', '30d', '90d', '1y'
  
  const trends = await getPlayerTrends(db, userId, timeframe);
  
  return reply.send({
    success: true,
    trends: {
      winRate: trends.winRateOverTime,
      rankingPoints: trends.rankingPointsOverTime,
      averageScore: trends.averageScoreOverTime,
      matchesPerDay: trends.matchesPerDay
    }
  });
});

// GET /stats/compare/:userId1/:userId2 - Compare two players
server.get('/stats/compare/:userId1/:userId2', async (request, reply) => {
  const { userId1, userId2 } = request.params;
  
  const [stats1, stats2, headToHead] = await Promise.all([
    getPlayerStatistics(db, userId1),
    getPlayerStatistics(db, userId2),
    getHeadToHeadStats(db, userId1, userId2)
  ]);
  
  return reply.send({
    success: true,
    comparison: {
      player1: stats1,
      player2: stats2,
      headToHead,
      insights: generateComparisonInsights(stats1, stats2, headToHead)
    }
  });
});
```

### **Leaderboards**
```typescript
// GET /leaderboard - Global leaderboard
server.get('/leaderboard', async (request, reply) => {
  const { 
    type = 'ranking_points', 
    period = 'all_time', 
    page = 1, 
    limit = 50 
  } = request.query;
  
  const leaderboard = await getLeaderboard(db, {
    type, // 'ranking_points', 'wins', 'win_percentage', 'total_score'
    period,
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  return reply.send({
    success: true,
    leaderboard: leaderboard.map((entry, index) => ({
      rank: (parseInt(page) - 1) * parseInt(limit) + index + 1,
      ...formatLeaderboardEntry(entry)
    })),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: await getLeaderboardTotal(db, type, period)
    }
  });
});

// GET /leaderboard/friends/:userId - Friends leaderboard
server.get('/leaderboard/friends/:userId', async (request, reply) => {
  const { userId } = request.params;
  const { type = 'ranking_points' } = request.query;
  
  // Get user's friends from user service
  const friends = await getFriendsFromUserService(userId);
  
  const friendsLeaderboard = await getFriendsLeaderboard(db, friends, type);
  
  return reply.send({
    success: true,
    leaderboard: friendsLeaderboard.map(formatLeaderboardEntry)
  });
});
```

### **Achievements System**
```typescript
// GET /achievements - Get all available achievements
server.get('/achievements', async (request, reply) => {
  const achievements = await getAllAchievements(db);
  
  return reply.send({
    success: true,
    achievements: achievements.map(formatAchievementResponse)
  });
});

// GET /achievements/:userId - Get player's achievements
server.get('/achievements/:userId', async (request, reply) => {
  const { userId } = request.params;
  
  const [playerAchievements, allAchievements] = await Promise.all([
    getPlayerAchievements(db, userId),
    getAllAchievements(db)
  ]);
  
  const achievementsWithProgress = allAchievements.map(achievement => {
    const playerAchievement = playerAchievements.find(pa => pa.achievement_id === achievement.id);
    
    return {
      ...achievement,
      earned: !!playerAchievement,
      earnedAt: playerAchievement?.earned_at,
      progress: playerAchievement?.progress || 0
    };
  });
  
  return reply.send({
    success: true,
    achievements: achievementsWithProgress
  });
});
```

## 📊 Statistics Calculation Engine

### **Player Statistics Calculation**
```typescript
export class StatisticsEngine {
  static async updatePlayerStatistics(
    db: Database, 
    playerId: number, 
    match: Match
  ): Promise<void> {
    const isWinner = match.winner_id === playerId;
    const isLoser = match.loser_id === playerId;
    
    if (!isWinner && !isLoser) return; // Player not in this match
    
    // Get current stats
    let stats = await getPlayerStatistics(db, playerId);
    
    if (!stats) {
      // Create initial stats
      stats = await createInitialPlayerStatistics(db, playerId);
    }
    
    // Update basic counters
    stats.total_matches += 1;
    if (isWinner) {
      stats.wins += 1;
      stats.current_streak += 1;
      stats.best_streak = Math.max(stats.best_streak, stats.current_streak);
    } else {
      stats.losses += 1;
      stats.current_streak = 0;
    }
    
    // Calculate win percentage
    stats.win_percentage = (stats.wins / stats.total_matches) * 100;
    
    // Update score statistics
    const playerScore = this.getPlayerScore(match, playerId);
    stats.total_score += playerScore;
    stats.average_score = stats.total_score / stats.total_matches;
    stats.best_score = Math.max(stats.best_score, playerScore);
    
    // Update playtime
    stats.total_playtime += match.duration;
    
    // Update ELO-style ranking
    const opponentId = match.player1_id === playerId ? match.player2_id : match.player1_id;
    const opponentStats = await getPlayerStatistics(db, opponentId);
    const newRanking = this.calculateEloRating(
      stats.ranking_points,
      opponentStats?.ranking_points || 1000,
      isWinner ? 1 : 0
    );
    stats.ranking_points = newRanking;
    
    stats.last_match_at = new Date();
    stats.updated_at = new Date();
    
    // Save updated statistics
    await updatePlayerStatistics(db, playerId, stats);
  }
  
  static calculateEloRating(
    playerRating: number, 
    opponentRating: number, 
    score: number, // 1 for win, 0 for loss
    kFactor: number = 32
  ): number {
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    return Math.round(playerRating + kFactor * (score - expectedScore));
  }
  
  static async calculateEnhancedStats(
    db: Database, 
    userId: number, 
    basicStats: PlayerStatistics
  ): Promise<any> {
    const recentMatches = await getRecentMatches(db, userId, 10);
    const allMatches = await getUserMatches(db, userId);
    
    return {
      recentForm: this.calculateRecentForm(recentMatches),
      longestWinStreak: this.calculateLongestWinStreak(allMatches),
      averageMatchDuration: this.calculateAverageMatchDuration(allMatches),
      mostFrequentOpponent: await this.getMostFrequentOpponent(db, userId),
      bestVictory: await this.getBestVictory(db, userId),
      favoritePlayTime: this.calculateFavoritePlayTime(allMatches)
    };
  }
}
```

### **Achievement System**
```typescript
export class AchievementSystem {
  static async checkAchievements(
    db: Database,
    playerId: number,
    match: Match
  ): Promise<void> {
    const stats = await getPlayerStatistics(db, playerId);
    const recentMatches = await getRecentMatches(db, playerId, 100);
    
    const achievementsToCheck = [
      this.checkFirstWin(stats),
      this.checkWinStreaks(stats),
      this.checkTotalWins(stats),
      this.checkPerfectGames(recentMatches),
      this.checkComebacks(recentMatches),
      this.checkPlayTime(stats),
      this.checkRankingMilestones(stats)
    ];
    
    for (const achievement of achievementsToCheck) {
      if (achievement && !(await this.hasAchievement(db, playerId, achievement.code))) {
        await this.awardAchievement(db, playerId, achievement.code);
      }
    }
  }
  
  private static checkFirstWin(stats: PlayerStatistics): Achievement | null {
    return stats.wins === 1 ? { code: 'first_win' } : null;
  }
  
  private static checkWinStreaks(stats: PlayerStatistics): Achievement | null {
    if (stats.current_streak === 5) return { code: 'win_streak_5' };
    if (stats.current_streak === 10) return { code: 'win_streak_10' };
    if (stats.current_streak === 25) return { code: 'win_streak_25' };
    return null;
  }
  
  private static checkTotalWins(stats: PlayerStatistics): Achievement | null {
    if (stats.wins === 10) return { code: 'wins_10' };
    if (stats.wins === 50) return { code: 'wins_50' };
    if (stats.wins === 100) return { code: 'wins_100' };
    if (stats.wins === 500) return { code: 'wins_500' };
    return null;
  }
}
```

## 📊 Estat Actual

### ✅ **Infraestructura**
- Basic service structure
- SSL/HTTPS configuration
- Health check endpoint
- Docker configuration

### ⚠️ **IMPORTANT PER IMPLEMENTAR**
- Complete database schema
- Match recording system
- Statistics calculation engine
- Leaderboard generation
- Achievement system
- API endpoints implementation

### ❌ **Features Avançades**
- Advanced analytics
- Performance insights
- Tournament brackets
- Social features integration
- Data visualization endpoints

## 🎯 Prioritats de Desenvolupament

### **Fase 1: Core Match Tracking**
1. Implementar database schema complet
2. Match recording des de Game Service
3. Basic player statistics calculation
4. Simple leaderboard endpoints

### **Fase 2: Enhanced Statistics**
1. Advanced statistics calculation
2. Trends i performance analysis
3. Head-to-head comparisons
4. Achievement system implementation

### **Fase 3: Social Features**
1. Friends leaderboards
2. Achievement sharing
3. Challenge system
4. Tournament support

## 🔗 Integracions Necessàries

### **Game Service**
- Rebre match results en temps real
- Game event tracking per estadístiques detallades

### **User Service**
- Friends list per friends leaderboards
- User profile information

### **Auth Service**
- JWT token validation
- User identity verification

### **Frontend**
- Statistics dashboard
- Leaderboard displays
- Achievement notifications
- Progress tracking

## 📝 Notes Tècniques

- **Real-time Updates**: WebSocket per live leaderboard updates
- **Performance**: Índexs optimitzats per queries frequents
- **Scalability**: Aggregated statistics per performance
- **Data Integrity**: Consistent statistics calculation
- **Analytics**: Historical data per trend analysis

**El Match Service és IMPORTANT per tracking i engagement del projecte.**
