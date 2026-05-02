export interface Team {
  id: string;
  name: string;
  logo: string;
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
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  time: string;
  status: 'UPCOMING' | 'LIVE' | 'FINISHED';
  venue: string;
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
