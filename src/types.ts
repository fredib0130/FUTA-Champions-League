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

  firstHalfAddedTime?: number;
  secondHalfAddedTime?: number;
  homePenalties?: number;
  awayPenalties?: number;
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

  minute: number | string;

  type:
    | "Goal"
    | "Penalty"
    | "Own Goal";

  assist?: string;
}

export function parseMinuteToNumeric(minStr: string | number): number {
  if (typeof minStr === 'number') return minStr;
  const cleaned = minStr.replace("'", "").trim();
  if (cleaned.includes('+')) {
    const parts = cleaned.split('+');
    const base = parseFloat(parts[0]) || 0;
    const added = parseFloat(parts[1]) || 0;
    // Keep 30+2 played after 30 but before 31
    return base + (added / 100);
  }
  return parseFloat(cleaned) || 0;
}

export function formatMinuteDisplay(minute: string | number): string {
  const mStr = String(minute).trim();
  if (mStr.endsWith("'")) return mStr;
  return `${mStr}'`;
}


