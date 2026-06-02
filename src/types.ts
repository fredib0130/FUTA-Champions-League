export interface ChampionRecord {
  year: number;
  winnerId: string;
  winnerName: string;
  runnerUpId: string;
  runnerUpName: string;
  score: string;
}

export interface Team {
  id: string;
  name: string;
  logoUrl: string | null;
  group: string;
  pot?: 'A' | 'B' | 'C' | 'D';
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
  description: string;
  squad: Player[];
}

export interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  goals: number;
  assists: number;
  cleanSheets?: number;
  teamId: string;
  image: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  status: 'Upcoming' | 'Live' | 'Finished';

  homeScore: number;
  awayScore: number;

  lineupSubmittedHome: boolean;
  lineupSubmittedAway: boolean;

  matchday: number;
}

export interface NewsPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  category: string;
}

export interface CoefficientRanking {
  rank: number;
  teamId: string;
  teamName: string;
  points2026: number;
  points2025: number;
  totalCoefficient: number;
  isActive: boolean; // green indicator if true, red if false
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  tier: 'GOLD' | 'SILVER' | 'BRONZE';
  website: string;
}

export interface MatchStats {
  matchId: string;

  cornersHome: number;
  cornersAway: number;

  yellowCardsHome: number;
  yellowCardsAway: number;

  redCardsHome: number;
  redCardsAway: number;
}

export interface GoalScorer {
  id: string;

  matchId: string;

  playerName: string;

  team: string;

  minute: number;

  type:
    | "Goal"
    | "Penalty"
    | "Own Goal";

  assist?: string;
}


