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
  isDisqualified?: boolean;
  disqualificationReason?: string;
  fineAmount?: number;
  finePaid?: boolean;
  disciplinaryStatus?: string;
  
  // FCL 2026 Standing Rules
  yellowCards?: number;
  yellow_cards?: number;
  redCards?: number;
  red_cards?: number;
  
  // Database-style property aliases for standings compatibility
  wins?: number;
  draws?: number;
  losses?: number;
  goals_for?: number;
  goals_against?: number;
  goal_difference?: number;
}

export interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  goals: number;
  played: number;
  matchesPlayed?: number;
  yellowCards?: number;
  yellow_cards?: number;
  redCards?: number;
  red_cards?: number;
  cleanSheets: number;
  clean_sheets?: number;
  goalsConceded?: number;
  goals_conceded?: number;
  teamId: string;
  image: string;
  level?: string;
  jerseyNo?: number;
  regNumber?: string;
  isSuspended?: boolean;
  suspensionDuration?: string;
  fineAmount?: number;
  finePaid?: boolean;
  appealAllowed?: boolean;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  status: 'Upcoming' | 'Live' | 'Finished' | 'Postponed' | 'Cancelled' | 'Half Time' | 'Interrupted';

  homeScore: number;
  awayScore: number;

  lineupSubmittedHome: boolean;
  lineupSubmittedAway: boolean;

  matchday: number;

  firstHalfAddedTime?: number;
  secondHalfAddedTime?: number;
  homePenalties?: number;
  awayPenalties?: number;

  referee?: string;
  refereeAssigned?: boolean;
  matchApproved?: boolean;
  officialsPanel?: string[];
  manOfTheMatch?: string;
  walkover?: boolean;
  note?: string;
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
  movement?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  logoUrl?: string | null;
  category?: 'Sponsor' | 'Media Partner';
  tier: 'GOLD' | 'SILVER' | 'BRONZE';
  website: string;
  email?: string;
}

export interface MatchStats {
  matchId: string;

  cornersHome: number;
  cornersAway: number;

  yellowCardsHome: number;
  yellowCardsAway: number;

  redCardsHome: number;
  redCardsAway: number;

  // Database-style and optional fields
  homeCorners?: number;
  awayCorners?: number;
  homeYellowCards?: number;
  awayYellowCards?: number;
  homeRedCards?: number;
  awayRedCards?: number;
  homeOffsides?: number;
  awayOffsides?: number;
  homeFouls?: number;
  awayFouls?: number;
  homeFreeKicks?: number;
  awayFreeKicks?: number;
  
  updatedAt?: string;
  updatedBy?: string;
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

export interface Article {
  id: string;
  title: string;
  featuredImage: string;
  author: string;
  category: 'Match Preview' | 'Match Report' | 'Team Spotlight' | 'Player Spotlight' | 'Tournament Feature' | 'Opinion Article';
  body: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  matchId?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  featuredImage: string;
  author: string;
  category: 'Tournament News' | 'Fixture Announcement' | 'Disciplinary Updates' | 'Registration Updates' | 'Competition Updates' | 'Committee Announcement' | 'Sponsor News';
  body: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
}

export interface MatchPhoto {
  id: string;
  matchId: string;
  fileUrl: string;
  category: 'Match Action' | 'Team Photo' | 'Goal Celebration' | 'Crowd' | 'Match Officials' | 'Man of the Match' | 'Trophy Ceremony' | 'Press Conference' | 'Other';
  uploadedAt: string;
  uploadedBy: string;
  originalSize: string;
  compressedSize: string;
  ratio: string;
  folderStage: string;
}
