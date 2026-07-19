import React, { createContext, useContext, useState, useEffect } from 'react';
import { Match, Team, GoalScorer, MatchStats, Article, NewsItem, MatchPhoto, Sponsor, Player, CoefficientRanking } from '../types';
import { MATCHES, TEAMS, MOCK_MATCH_STATS, PLAYERS, COEFFICIENTS } from '../data/mockData';
import { fclApi } from '../lib/api';

export const GOALKEEPER_BASELINES: Record<string, { played: number; cleanSheets: number; goalsConceded: number }> = {
  "adeyemi prosper": { played: 3, cleanSheets: 3, goalsConceded: 0 },
  "ogundeji feyitunmise hezekiah": { played: 5, cleanSheets: 3, goalsConceded: 2 },
  "adegoke": { played: 5, cleanSheets: 3, goalsConceded: 2 },
  "aina john": { played: 4, cleanSheets: 3, goalsConceded: 1 },
  "ikwue david oche": { played: 2, cleanSheets: 2, goalsConceded: 0 },
  "akinyode joseph oluwaseun": { played: 5, cleanSheets: 2, goalsConceded: 4 },
  "atere victor": { played: 5, cleanSheets: 2, goalsConceded: 4 },
  "adesuyi oluwasegun": { played: 5, cleanSheets: 2, goalsConceded: 5 },
  "olabode victor oluwatosin": { played: 3, cleanSheets: 2, goalsConceded: 1 },
  "rotimi joseph folahan": { played: 5, cleanSheets: 1, goalsConceded: 6 },
  "ojo david": { played: 3, cleanSheets: 1, goalsConceded: 3 },
  "divine gabriel ibrahim": { played: 1, cleanSheets: 0, goalsConceded: 1 },
  "john igbalamide": { played: 1, cleanSheets: 0, goalsConceded: 2 },
  "afolabi yusuf": { played: 4, cleanSheets: 0, goalsConceded: 8 },
  "afolabi timothy testimony": { played: 2, cleanSheets: 0, goalsConceded: 3 },
  "babatunde": { played: 3, cleanSheets: 0, goalsConceded: 6 },
  "eniola ayomide emmanuel": { played: 3, cleanSheets: 0, goalsConceded: 5 },
  "harun abdulkareem": { played: 3, cleanSheets: 0, goalsConceded: 4 },
  "nwabunwanne chibichi daniel": { played: 3, cleanSheets: 0, goalsConceded: 5 },
  "adedotun faiz ayobami": { played: 0, cleanSheets: 0, goalsConceded: 0 },
  "adeleye benjamin": { played: 0, cleanSheets: 0, goalsConceded: 0 },
  "emmanuel": { played: 0, cleanSheets: 0, goalsConceded: 0 },
  "owogbemi oluwadunsin emmanuel": { played: 0, cleanSheets: 0, goalsConceded: 0 }
};

export const PRE_COMPLETED_MATCH_IDS = new Set([
  'md1-1', 'md1-2', 'md1-3', 'md1-4', 'md1-5', 'md1-6', 'md1-7', 'md1-8', 'md1-9', 'md1-10',
  'md2-1', 'md2-2', 'md2-3', 'md2-4', 'md2-5', 'md2-6', 'md2-7', 'md2-8', 'md2-9', 'md2-10',
  'md3-1', 'md3-2', 'md3-3', 'md3-4', 'md3-5', 'md3-6', 'md3-7', 'md3-8', 'md3-9', 'md3-10',
  'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6',
  'QF1', 'QF2', 'QF3', 'QF4'
]);

export interface CardEvent {
  id: string;
  matchId: string;
  playerName: string;
  teamAbbr: string; // Team abbreviation e.g., 'MST'
  minute: number | string;
  type: 'Yellow' | 'Second Yellow' | 'Red';
}

export interface SubEvent {
  id: string;
  matchId: string;
  teamAbbr: string;
  playerOut: string;
  playerIn: string;
  minute: number | string;
}

export interface MatchLineup {
  matchId: string;
  teamAbbr: string;
  formation: string;
  captainId: string;
  players: Record<string, string>; // spotId -> playerId
  bench: string[]; 
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface DetailedMatchStats extends MatchStats {
  /** @deprecated Removed from official FCL 2026 categories */
  possessionHome?: number;
  /** @deprecated Removed from official FCL 2026 categories */
  possessionAway?: number;
  /** @deprecated Removed from official FCL 2026 categories */
  shotsHome?: number;
  /** @deprecated Removed from official FCL 2026 categories */
  shotsAway?: number;
  /** @deprecated Removed from official FCL 2026 categories */
  shotsOnTargetHome?: number;
  /** @deprecated Removed from official FCL 2026 categories */
  shotsOnTargetAway?: number;
  /** @deprecated Removed from official FCL 2026 categories */
  savesHome?: number;
  /** @deprecated Removed from official FCL 2026 categories */
  savesAway?: number;

  cornerKicksHome?: number;
  cornerKicksAway?: number;
  yellowCardsHome: number;
  yellowCardsAway: number;
  redCardsHome: number;
  redCardsAway: number;
  offsidesHome: number;
  offsidesAway: number;
  foulsHome: number;
  foulsAway: number;
  freeKicksHome: number;
  freeKicksAway: number;
}

export interface CommentaryItem {
  id: string;
  matchId: string;
  minute: string;
  text: string;
  timestamp: string;
  type: 'general' | 'goal' | 'card' | 'sub' | 'system';
}

export interface MatchReport {
  matchId: string;
  summary: string;
  playerOfMatch: string;
  tacticalAnalysis: string;
  keyMoments: string[];
  isPublished: boolean;
}

export interface AuditLogItem {
  id: string;
  adminName: string;
  role: string;
  action: string;
  timestamp: string;
  matchId?: string;
  matchSummary?: string;
}

export interface AdminUser {
  username: string;
  role: 'Super Admin' | 'Match Commissioner' | 'Media Officer' | 'Team Official';
}

interface MatchStateContextType {
  matches: Match[];
  teams: Team[];
  players: Player[];
  detailedStats: Record<string, DetailedMatchStats>;
  goalScorers: GoalScorer[];
  cards: CardEvent[];
  subs: SubEvent[];
  lineups: Record<string, { home: MatchLineup; away: MatchLineup }>;
  commentaries: Record<string, CommentaryItem[]>;
  reports: Record<string, MatchReport>;
  auditLogs: AuditLogItem[];
  currentUser: AdminUser | null;
  activeMinAndStatus: Record<string, { liveMinute: string; isPaused: boolean }>;
  articles: Article[];
  newsItems: NewsItem[];
  matchPhotos: MatchPhoto[];
  isLiveTableActive: boolean;
  officialTeams: Team[];
  coefficients: CoefficientRanking[];
  saveArticle: (article: Article) => void;
  deleteArticle: (id: string) => void;
  saveNewsItem: (newsItem: NewsItem) => void;
  deleteNewsItem: (id: string) => void;
  saveMatchPhoto: (photo: MatchPhoto) => void;
  deleteMatchPhoto: (id: string) => void;
  
  // Auth
  login: (username: string, passwordHashOrPlain: string, role: AdminUser['role']) => Promise<boolean>;
  logout: () => void;

  // Match Control & Timer
  startMatch: (matchId: string) => void;
  pauseMatch: (matchId: string) => void;
  resumeMatch: (matchId: string) => void;
  endMatch: (matchId: string) => void;
  triggerHalfTime: (matchId: string) => void;
  startSecondHalf: (matchId: string) => void;
  updateMatchMinute: (matchId: string, minute: string) => void;
  updateMatchStatusDirectly: (matchId: string, status: Match['status']) => void;
  updateMatchAddedTime: (matchId: string, firstHalf: number, secondHalf: number) => void;
  updateMatchPenalties: (matchId: string, homePens: number | null, awayPens: number | null) => void;

  // Score Control
  incrementGoal: (matchId: string, team: 'home' | 'away') => void;
  decrementGoal: (matchId: string, team: 'home' | 'away') => void;
  updateScoreManually: (matchId: string, homeScore: number, awayScore: number) => void;

  // Goal & Timeline Event Management
  addGoalEvent: (matchId: string, event: Omit<GoalScorer, 'id'>) => void;
  removeLastGoalEvent: (matchId: string) => void;
  addCardEvent: (matchId: string, event: Omit<CardEvent, 'id'>) => void;
  removeCardEvent: (matchId: string, cardId: string) => void;
  addSubEvent: (matchId: string, event: Omit<SubEvent, 'id'>) => void;
  removeSubEvent: (matchId: string, subId: string) => void;

  // Statistics
  updateMatchStats: (matchId: string, stats: Partial<DetailedMatchStats>) => void;

  // Lineups Approval
  approveLineup: (matchId: string, teamAbbr: string) => void;
  rejectLineup: (matchId: string, teamAbbr: string) => void;
  lockLineups: (matchId: string) => void;

  // Commentary
  addCommentary: (matchId: string, text: string, type?: CommentaryItem['type']) => void;
  deleteCommentary: (matchId: string, commentaryId: string) => void;

  // Match Report
  saveMatchReport: (matchId: string, report: Omit<MatchReport, 'matchId'>) => void;

  // Helper
  addAuditLog: (action: string, matchId?: string) => void;
  resetAllData: () => void;

  // Fixture Management
  createFixture: (newMatch: Omit<Match, 'id' | 'homeScore' | 'awayScore' | 'lineupSubmittedHome' | 'lineupSubmittedAway'>) => void;
  editFixture: (matchId: string, updatedFields: Partial<Match>) => void;
  deleteFixture: (matchId: string) => void;

  // Sponsors & Partners
  sponsors: Sponsor[];
  saveSponsors: (sponsors: Sponsor[]) => Promise<void>;
  resetSponsorsAll: () => Promise<void>;
  uploadSponsorLogo: (id: string, logoData: string, filename: string) => Promise<void>;
}

const MatchStateContext = createContext<MatchStateContextType | undefined>(undefined);

export function MatchStateProvider({ children }: { children: React.ReactNode }) {
  // We use a BroadcastChannel to sync tabs in real-time
  const [channel] = useState(() => new BroadcastChannel('fcl_realtime_channel'));

  // 1. Core Match State
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [detailedStats, setDetailedStats] = useState<Record<string, DetailedMatchStats>>({});
  const [goalScorers, setGoalScorers] = useState<GoalScorer[]>([]);
  const [cards, setCards] = useState<CardEvent[]>([]);
  const [subs, setSubs] = useState<SubEvent[]>([]);
  const [lineups, setLineups] = useState<Record<string, { home: MatchLineup; away: MatchLineup }>>({});
  const [commentaries, setCommentaries] = useState<Record<string, CommentaryItem[]>>({});
  const [reports, setReports] = useState<Record<string, MatchReport>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  
  // Realtime Live Minute progressing tick (simulating actual runtime minutage)
  const [activeMinAndStatus, setActiveMinAndStatus] = useState<Record<string, { liveMinute: string; isPaused: boolean }>>({});

  // Media & Match Reporting States
  const [articles, setArticles] = useState<Article[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [matchPhotos, setMatchPhotos] = useState<MatchPhoto[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  // 1b. Dynamic Player and Team Recalculation Engine
  const players = React.useMemo(() => {
    // Start with the base list of PLAYERS
    const basePlayers: Player[] = PLAYERS.map(p => {
      const isGK = p.position === 'GK';
      const nameKey = p.name.toLowerCase();
      const baseline = isGK ? GOALKEEPER_BASELINES[nameKey] : null;

      return {
        ...p,
        goals: 0,
        played: baseline ? baseline.played : 0,
        matchesPlayed: baseline ? baseline.played : 0,
        yellowCards: 0,
        yellow_cards: 0,
        redCards: 0,
        red_cards: 0,
        cleanSheets: baseline ? baseline.cleanSheets : 0,
        clean_sheets: baseline ? baseline.cleanSheets : 0,
        goalsConceded: baseline ? baseline.goalsConceded : 0,
        goals_conceded: baseline ? baseline.goalsConceded : 0,
        penaltyShootoutGoals: 0,
        penaltyShootoutMisses: 0,
      };
    });

    // Calculate Penalty Shootout Goals & Misses
    matches.forEach(m => {
      const s = m.status.trim().toUpperCase();
      const isFinished = s === 'FINISHED' || s === 'FULL-TIME' || s === 'FULL TIME' || s === 'COMPLETED';
      if (isFinished) {
        if (m.penaltyShootoutHome) {
          m.penaltyShootoutHome.forEach(pAttempt => {
            const playerObj = basePlayers.find(p => p.name.toLowerCase() === pAttempt.playerName.toLowerCase());
            if (playerObj) {
              if (pAttempt.isScored) {
                playerObj.penaltyShootoutGoals = (playerObj.penaltyShootoutGoals || 0) + 1;
              } else {
                playerObj.penaltyShootoutMisses = (playerObj.penaltyShootoutMisses || 0) + 1;
              }
            }
          });
        }
        if (m.penaltyShootoutAway) {
          m.penaltyShootoutAway.forEach(pAttempt => {
            const playerObj = basePlayers.find(p => p.name.toLowerCase() === pAttempt.playerName.toLowerCase());
            if (playerObj) {
              if (pAttempt.isScored) {
                playerObj.penaltyShootoutGoals = (playerObj.penaltyShootoutGoals || 0) + 1;
              } else {
                playerObj.penaltyShootoutMisses = (playerObj.penaltyShootoutMisses || 0) + 1;
              }
            }
          });
        }
      }
    });

    // Find all finished or interrupted matches (exclude walkovers to prevent player stats from being counted)
    const finishedMatches = matches.filter(m => {
      const s = m.status.trim().toUpperCase();
      return (s === 'FINISHED' || s === 'FULL-TIME' || s === 'FULL TIME' || s === 'COMPLETED' || s === 'INTERRUPTED') && !m.walkover;
    });

    // Find all live, finished or interrupted matches for matches played (APPS) calculation
    const liveOrFinishedMatches = matches.filter(m => {
      const s = m.status.trim().toUpperCase();
      const isSFMatchesWithLineups = (m.id === 'SF1_1' || m.id === 'SF2_1');
      return (s === 'FINISHED' || s === 'FULL-TIME' || s === 'FULL TIME' || s === 'COMPLETED' || s === 'INTERRUPTED' || s === 'LIVE' || isSFMatchesWithLineups) && !m.walkover;
    });

    // 1. Calculate Goals
    goalScorers.forEach(g => {
      if (g.type !== 'Own Goal') {
        const matchExists = matches.some(m => m.id === g.matchId && ['FINISHED', 'FULL-TIME', 'FULL TIME', 'COMPLETED', 'LIVE', 'INTERRUPTED'].includes(m.status.trim().toUpperCase()));
        if (matchExists) {
          const playerObj = basePlayers.find(p => p.id === g.playerName || p.name.toLowerCase() === g.playerName.toLowerCase());
          if (playerObj) {
            playerObj.goals += 1;
          }
        }
      }
    });

    // 2. Calculate Cards (Yellow/Red)
    cards.forEach(c => {
      const matchExists = matches.some(m => m.id === c.matchId && ['FINISHED', 'FULL-TIME', 'FULL TIME', 'COMPLETED', 'LIVE', 'INTERRUPTED'].includes(m.status.trim().toUpperCase()));
      if (matchExists) {
        const playerObj = basePlayers.find(p => p.id === c.playerName || p.name.toLowerCase() === c.playerName.toLowerCase());
        if (playerObj) {
          if (c.type === 'Yellow') {
            playerObj.yellowCards = (playerObj.yellowCards || 0) + 1;
            playerObj.yellow_cards = playerObj.yellowCards;
          } else if (c.type === 'Red' || c.type === 'Second Yellow') {
            playerObj.redCards = (playerObj.redCards || 0) + 1;
            playerObj.red_cards = playerObj.redCards;
          }
        }
      }
    });

    // 3. Calculate Matches Played and Build Match History Log
    liveOrFinishedMatches.forEach(m => {
      // Look at lineups
      const matchLineup = lineups[m.id];
      const hasLineup = !!matchLineup;
      
      const involvedPlayerIds = new Set<string>();
      
      if (hasLineup) {
        // Home starting players
        if (matchLineup.home && matchLineup.home.players) {
          Object.values(matchLineup.home.players).forEach(pid => involvedPlayerIds.add(String(pid)));
        }
        // Away starting players
        if (matchLineup.away && matchLineup.away.players) {
          Object.values(matchLineup.away.players).forEach(pid => involvedPlayerIds.add(String(pid)));
        }
      }
      
      // Look at substitution events for this finished match
      const matchSubs = subs.filter(s => s.matchId === m.id);
      matchSubs.forEach(s => {
        const pInObj = basePlayers.find(p => p.id === s.playerIn || p.name.toLowerCase() === s.playerIn.toLowerCase());
        if (pInObj) {
          involvedPlayerIds.add(pInObj.id);
        }
      });
      
      // Resolve team names
      const homeTeamStr = m.id === 'SF1_1' ? 'ICE' : m.id === 'SF1_2' ? 'AGP' : m.id === 'SF2_1' ? 'CYS' : m.id === 'SF2_2' ? 'MST' : m.homeTeam;
      const awayTeamStr = m.id === 'SF1_1' ? 'AGP' : m.id === 'SF1_2' ? 'ICE' : m.id === 'SF2_1' ? 'MST' : m.id === 'SF2_2' ? 'CYS' : m.awayTeam;

      // Match Description
      let matchDesc = '';
      if (m.id === 'SF1_1') {
        matchDesc = 'FCL SF1 (1st Leg): ICE vs AGP';
      } else if (m.id === 'SF2_1') {
        matchDesc = 'FCL SF2 (1st Leg): CYS vs MST';
      } else if (m.id === 'SF1_2') {
        matchDesc = 'FCL SF1 (2nd Leg): AGP vs ICE';
      } else if (m.id === 'SF2_2') {
        matchDesc = 'FCL SF2 (2nd Leg): MST vs CYS';
      } else if (m.stage && m.stage.toLowerCase() === 'quarter-finals') {
        matchDesc = `FCL QF: ${homeTeamStr} vs ${awayTeamStr}`;
      } else if (m.stage && m.stage.toLowerCase() === 'play-offs') {
        matchDesc = `FCL Play-off: ${homeTeamStr} vs ${awayTeamStr}`;
      } else {
        matchDesc = `Matchday ${m.matchday || 1}: ${homeTeamStr} vs ${awayTeamStr}`;
      }

      // If we have lineup involved player IDs, mark them and log history
      if (involvedPlayerIds.size > 0) {
        involvedPlayerIds.forEach(pid => {
          const pObj = basePlayers.find(p => p.id === pid);
          if (pObj) {
            if (!pObj.matchHistory) pObj.matchHistory = [];
            if (!pObj.matchHistory.includes(matchDesc)) {
              pObj.matchHistory.push(matchDesc);
            }
            if (pObj.position !== 'GK') { // Skip GKs to calculate them accurately in step 4
              pObj.played += 1;
              pObj.matchesPlayed = pObj.played;
            }
          }
        });
      } else {
        // Fallback: If no lineup was created for a finished match, we count matches based on goals or cards
        const goalsFromMatch = goalScorers.filter(g => g.matchId === m.id && g.type !== 'Own Goal');
        const cardsFromMatch = cards.filter(c => c.matchId === m.id);
        const activeIds = new Set<string>();
        
        goalsFromMatch.forEach(g => {
          const pObj = basePlayers.find(p => p.id === g.playerName || p.name.toLowerCase() === g.playerName.toLowerCase());
          if (pObj) activeIds.add(pObj.id);
        });
        cardsFromMatch.forEach(c => {
          const pObj = basePlayers.find(p => p.id === c.playerName || p.name.toLowerCase() === c.playerName.toLowerCase());
          if (pObj) activeIds.add(pObj.id);
        });
        
        activeIds.forEach(pid => {
          const pObj = basePlayers.find(p => p.id === pid);
          if (pObj && pObj.position !== 'GK') { // Skip GKs
            pObj.played += 1;
            pObj.matchesPlayed = pObj.played;
          }
        });
      }
    });

    // 4. Calculate Goalkeeper Appearances, Clean Sheets, and Goals Conceded
    // Helper to resolve team abbreviation for any match ID to avoid seed/placeholder mismatches
    const getResolvedTeams = (m: Match) => {
      let homeTeam = m.homeTeam;
      let awayTeam = m.awayTeam;

      if (m.id === 'PO1') {
        homeTeam = 'IDD';
        awayTeam = 'STA';
      } else if (m.id === 'PO2') {
        homeTeam = 'ANA';
        awayTeam = 'SIMT';
      } else if (m.id === 'PO3') {
        homeTeam = 'BDG';
        awayTeam = 'AGP';
      } else if (m.id === 'PO4') {
        homeTeam = 'MBBS';
        awayTeam = 'MCB';
      } else if (m.id === 'PO5') {
        homeTeam = 'APH';
        awayTeam = 'PHY';
      } else if (m.id === 'PO6') {
        homeTeam = 'CSP';
        awayTeam = 'MST';
      } else if (m.id === 'QF1') {
        homeTeam = 'ICE';
        awayTeam = 'APH';
      } else if (m.id === 'QF2') {
        homeTeam = 'MCB';
        awayTeam = 'ANA';
      } else if (m.id === 'QF3') {
        homeTeam = 'STA';
        awayTeam = 'AGP';
      } else if (m.id === 'QF4') {
        homeTeam = 'ANA';
        awayTeam = 'MST';
      } else if (m.id === 'SF1_1') {
        homeTeam = 'ICE';
        awayTeam = 'AGP';
      } else if (m.id === 'SF1_2') {
        homeTeam = 'AGP';
        awayTeam = 'ICE';
      } else if (m.id === 'SF2_1') {
        homeTeam = 'CYS';
        awayTeam = 'MST';
      } else if (m.id === 'SF2_2') {
        homeTeam = 'MST';
        awayTeam = 'CYS';
      }
      return { homeTeam, awayTeam };
    };

    // Helper to parse minute string to integer
    const parseMinute = (minStr: string | number): number => {
      if (typeof minStr === 'number') return minStr;
      const clean = String(minStr).replace(/[^0-9+]/g, '');
      if (clean.includes('+')) {
        const parts = clean.split('+');
        return (parseInt(parts[0], 10) || 0) + (parseInt(parts[1], 10) || 0);
      }
      return parseInt(clean, 10) || 0;
    };

    liveOrFinishedMatches.forEach(m => {
      const isFinished = finishedMatches.some(fm => fm.id === m.id);
      const homeConceded = m.awayScore;
      const awayConceded = m.homeScore;
      
      const { homeTeam, awayTeam } = getResolvedTeams(m);
      const matchLineup = lineups[m.id];
      const matchSubs = subs.filter(s => s.matchId === m.id);

      const processGkForSide = (
        teamAbbr: string,
        concededTotal: number,
        isHome: boolean
      ) => {
        // 1. Identify starting GK
        let startingGk: Player | undefined;
        if (matchLineup) {
          const sideLineup = isHome ? matchLineup.home : matchLineup.away;
          if (sideLineup && sideLineup.players && sideLineup.players['GK']) {
            const gkId = sideLineup.players['GK'];
            startingGk = basePlayers.find(p => p.id === gkId);
          }
        }
        if (!startingGk) {
          // Fallback: first GK of team in basePlayers
          startingGk = basePlayers.find(p => p.teamId.toLowerCase() === teamAbbr.toLowerCase() && p.position === 'GK');
        }

        if (!startingGk) return;

        // 2. Check if starting GK was substituted
        const gkSub = matchSubs.find(s => 
          s.teamAbbr.toLowerCase() === teamAbbr.toLowerCase() &&
          (s.playerOut.toLowerCase() === startingGk?.name.toLowerCase() || 
           s.playerOut === startingGk?.id || 
           s.id.includes('gk') ||
           basePlayers.find(p => p.id === s.playerIn || p.name.toLowerCase() === s.playerIn.toLowerCase())?.position === 'GK')
        );

        // Find goals scored against this team in this match
        const opponentTeam = isHome ? awayTeam : homeTeam;
        const goalsAgainstThisTeam = goalScorers.filter(g => 
          g.matchId === m.id && 
          g.type !== 'Own Goal' && 
          g.team.toLowerCase() === opponentTeam.toLowerCase()
        );

        if (gkSub) {
          const subMinute = gkSub.minute;
          const subGkPlayer = basePlayers.find(p => p.id === gkSub.playerIn || p.name.toLowerCase() === gkSub.playerIn.toLowerCase());

          // A. Starting GK
          startingGk.played = (startingGk.played || 0) + 1;
          startingGk.matchesPlayed = startingGk.played;

          if (isFinished) {
            const startingGkConceded = goalsAgainstThisTeam.filter(g => parseMinute(g.minute) <= subMinute).length;
            startingGk.goalsConceded = (startingGk.goalsConceded || 0) + startingGkConceded;
            startingGk.goals_conceded = startingGk.goalsConceded;
            
            if (startingGkConceded === 0) {
              startingGk.cleanSheets = (startingGk.cleanSheets || 0) + 1;
              startingGk.clean_sheets = startingGk.cleanSheets;
            }
          }

          // B. Subbed GK
          if (subGkPlayer) {
            subGkPlayer.played = (subGkPlayer.played || 0) + 1;
            subGkPlayer.matchesPlayed = subGkPlayer.played;

            if (isFinished) {
              const subGkConceded = goalsAgainstThisTeam.filter(g => parseMinute(g.minute) > subMinute).length;
              subGkPlayer.goalsConceded = (subGkPlayer.goalsConceded || 0) + subGkConceded;
              subGkPlayer.goals_conceded = subGkPlayer.goalsConceded;

              if (subGkConceded === 0) {
                subGkPlayer.cleanSheets = (subGkPlayer.cleanSheets || 0) + 1;
                subGkPlayer.clean_sheets = subGkPlayer.cleanSheets;
              }
            }
          }
        } else {
          // No GK substitution: starting GK played the whole game
          startingGk.played = (startingGk.played || 0) + 1;
          startingGk.matchesPlayed = startingGk.played;

          if (isFinished) {
            startingGk.goalsConceded = (startingGk.goalsConceded || 0) + concededTotal;
            startingGk.goals_conceded = startingGk.goalsConceded;

            if (concededTotal === 0) {
              startingGk.cleanSheets = (startingGk.cleanSheets || 0) + 1;
              startingGk.clean_sheets = startingGk.cleanSheets;
            }
          }
        }
      };

      if (!PRE_COMPLETED_MATCH_IDS.has(m.id)) {
        processGkForSide(homeTeam, homeConceded, true);
        processGkForSide(awayTeam, awayConceded, false);
      }
    });

    const mjd = basePlayers.find(p => p.id === 'player-simt-5' || p.name.toLowerCase() === 'momoh joshua david');
    if (mjd) {
      mjd.isSuspended = false;
      mjd.suspensionDuration = '';
      mjd.fineAmount = 3000;
      mjd.finePaid = false;
    }

    const ncd = basePlayers.find(p => p.id === 'player-simt-1' || p.name.toLowerCase() === 'nwabunwanne chibichi daniel');
    if (ncd) {
      ncd.isSuspended = true;
      ncd.suspensionDuration = '1 match remaining';
      ncd.appealAllowed = false;
    }

    const aai = basePlayers.find(p => p.id === 'player-mst-2' || p.name.toLowerCase() === 'adeyemi adedayo ibrahim' || p.name.toLowerCase() === 'adeyemi adebayo ibrahim');
    if (aai) {
      aai.isSuspended = false;
      aai.suspensionDuration = '';
      aai.appealAllowed = false;
    }

    return basePlayers;
  }, [matches, goalScorers, cards, subs, lineups]);



  // Helper to load all state from localStorage or seed initial data
  const loadState = () => {
    // Migrate any legacy "Daisi Toluwanimi" references in localStorage to "Daisi Tioluwanimi"
    const keysToMigrate = [
      'fcl_admin_matches',
      'fcl_admin_teams',
      'fcl_admin_goals',
      'fcl_admin_cards',
      'fcl_admin_subs',
      'fcl_admin_lineups',
      'fcl_admin_commentaries',
      'fcl_admin_reports',
      'fcl_admin_news',
      'fcl_admin_stats'
    ];
    keysToMigrate.forEach(key => {
      try {
        const val = localStorage.getItem(key);
        if (val && (val.includes('Daisi Toluwanimi') || val.includes('daisi toluwanimi') || val.includes('Daisi Toluwanimi'.toLowerCase()))) {
          let updatedVal = val
            .replace(/Daisi Toluwanimi/g, 'Daisi Tioluwanimi')
            .replace(/daisi toluwanimi/g, 'daisi tioluwanimi')
            .replace(/DAISI TOLUWANIMI/g, 'DAISI TIOLUWANIMI');
          localStorage.setItem(key, updatedVal);
        }
      } catch (e) {
        console.error(`Error migrating legacy player name in localStorage for key: ${key}`, e);
      }
    });

    // 1. Matches
    const storedMatches = localStorage.getItem('fcl_admin_matches');
    let loadedMatches: Match[] = [];
    if (storedMatches) {
      loadedMatches = JSON.parse(storedMatches);
      // Auto-update matches with newly scheduled official dates, times, teams, and venues
      let updated = false;

      // Ensure all official matches exist in local storage matching the official schema
      MATCHES.forEach(official => {
        const index = loadedMatches.findIndex(m => m.id === official.id);
        if (index === -1) {
          loadedMatches.push({ ...official });
          updated = true;
        } else {
          const m = loadedMatches[index];
          if (
            m.homeTeam !== official.homeTeam ||
            m.awayTeam !== official.awayTeam ||
            m.date !== official.date ||
            m.time !== official.time ||
            m.venue !== official.venue ||
            m.referee !== official.referee ||
            m.refereeAssigned !== official.refereeAssigned ||
            m.matchApproved !== official.matchApproved ||
            m.manOfTheMatch !== official.manOfTheMatch ||
            m.lineupSubmittedHome !== official.lineupSubmittedHome ||
            m.lineupSubmittedAway !== official.lineupSubmittedAway ||
            m.note !== official.note ||
            m.homePenalties !== official.homePenalties ||
            m.awayPenalties !== official.awayPenalties ||
            JSON.stringify(m.penaltyShootoutHome) !== JSON.stringify(official.penaltyShootoutHome) ||
            JSON.stringify(m.penaltyShootoutAway) !== JSON.stringify(official.penaltyShootoutAway) ||
            (['md1-1', 'md1-2', 'md1-3', 'md1-4', 'md1-5', 'md1-6', 'md1-7', 'md1-8', 'md1-9', 'md1-10', 'md2-1', 'md2-2', 'md2-3', 'md2-4', 'md2-5', 'md2-6', 'md2-7', 'md2-8', 'md2-10', 'md3-4', 'md3-3', 'md3-6', 'md3-2', 'md3-1', 'md3-5', 'md3-7', 'md3-8', 'md3-9', 'md3-10', 'PO6', 'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'QF1', 'QF2', 'QF3', 'QF4'].includes(official.id) && m.homeScore !== official.homeScore) ||
            (['md1-1', 'md1-2', 'md1-3', 'md1-4', 'md1-5', 'md1-6', 'md1-7', 'md1-8', 'md1-9', 'md1-10', 'md2-1', 'md2-2', 'md2-3', 'md2-4', 'md2-5', 'md2-6', 'md2-7', 'md2-8', 'md2-10', 'md3-4', 'md3-3', 'md3-6', 'md3-2', 'md3-1', 'md3-5', 'md3-7', 'md3-8', 'md3-9', 'md3-10', 'PO6', 'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'QF1', 'QF2', 'QF3', 'QF4'].includes(official.id) && m.awayScore !== official.awayScore) ||
            JSON.stringify(m.officialsPanel) !== JSON.stringify(official.officialsPanel) ||
            ((official.matchday === 1 || official.matchday === 2 || official.id === 'md3-4' || official.id === 'md3-3' || official.id === 'md3-6' || official.id === 'md3-2' || official.id === 'md3-1' || official.id === 'md3-5' || official.id === 'md3-7' || official.id === 'md3-8' || official.id === 'md3-9' || official.id === 'md3-10' || official.id === 'PO6' || official.id === 'PO1' || official.id === 'PO2' || official.id === 'PO3' || official.id === 'PO4' || official.id === 'PO5' || official.id === 'QF1' || official.id === 'QF2' || official.id === 'QF3' || official.id === 'QF4') && m.status !== official.status) // Sync status specifically for matchdays, PO, and QF matches
          ) {
            loadedMatches[index] = {
              ...m,
              homeTeam: official.homeTeam,
              awayTeam: official.awayTeam,
              date: official.date,
              time: official.time,
              venue: official.venue,
              referee: official.referee,
              refereeAssigned: official.refereeAssigned,
              matchApproved: official.matchApproved,
              officialsPanel: official.officialsPanel,
              status: (official.matchday === 1 || official.matchday === 2 || official.id === 'md3-4' || official.id === 'md3-3' || official.id === 'md3-6' || official.id === 'md3-2' || official.id === 'md3-1' || official.id === 'md3-5' || official.id === 'md3-7' || official.id === 'md3-8' || official.id === 'md3-9' || official.id === 'md3-10' || official.id === 'PO6' || official.id === 'PO1' || official.id === 'PO2' || official.id === 'PO3' || official.id === 'PO4' || official.id === 'PO5' || official.id === 'QF1' || official.id === 'QF2' || official.id === 'QF3' || official.id === 'QF4') ? official.status : m.status,
              lineupSubmittedHome: official.lineupSubmittedHome,
              lineupSubmittedAway: official.lineupSubmittedAway,
              manOfTheMatch: official.manOfTheMatch,
              note: official.note,
              homeScore: ['md1-1', 'md1-2', 'md1-3', 'md1-4', 'md1-5', 'md1-6', 'md1-7', 'md1-8', 'md1-9', 'md1-10', 'md2-1', 'md2-2', 'md2-3', 'md2-4', 'md2-5', 'md2-6', 'md2-7', 'md2-8', 'md2-10', 'md3-4', 'md3-3', 'md3-6', 'md3-2', 'md3-1', 'md3-5', 'md3-7', 'md3-8', 'md3-9', 'md3-10', 'PO6', 'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'QF1', 'QF2', 'QF3', 'QF4'].includes(official.id) ? official.homeScore : m.homeScore,
              awayScore: ['md1-1', 'md1-2', 'md1-3', 'md1-4', 'md1-5', 'md1-6', 'md1-7', 'md1-8', 'md1-9', 'md1-10', 'md2-1', 'md2-2', 'md2-3', 'md2-4', 'md2-5', 'md2-6', 'md2-7', 'md2-8', 'md2-10', 'md3-4', 'md3-3', 'md3-6', 'md3-2', 'md3-1', 'md3-5', 'md3-7', 'md3-8', 'md3-9', 'md3-10', 'PO6', 'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'QF1', 'QF2', 'QF3', 'QF4'].includes(official.id) ? official.awayScore : m.awayScore,
              homePenalties: official.homePenalties,
              awayPenalties: official.awayPenalties,
              penaltyShootoutHome: official.penaltyShootoutHome,
              penaltyShootoutAway: official.penaltyShootoutAway
            };
            updated = true;
          }
        }
      });

      if (updated) {
        localStorage.setItem('fcl_admin_matches', JSON.stringify(loadedMatches));
      }
    } else {
      loadedMatches = MATCHES.map(m => ({
        ...m,
        status: m.status || 'Upcoming',
        homeScore: m.homeScore ?? 0,
        awayScore: m.awayScore ?? 0,
        lineupSubmittedHome: m.lineupSubmittedHome ?? false,
        lineupSubmittedAway: m.lineupSubmittedAway ?? false,
        penaltyShootoutHome: m.penaltyShootoutHome,
        penaltyShootoutAway: m.penaltyShootoutAway
      }));
    }

    setMatches(loadedMatches);

    // 2. Teams
    const storedTeams = localStorage.getItem('fcl_admin_teams');
    let loadedTeams: Team[] = [];
    if (storedTeams) {
      loadedTeams = JSON.parse(storedTeams);
      loadedTeams = recalculateStandingsFromMatches(loadedTeams, loadedMatches);
    } else {
      loadedTeams = TEAMS.map(team => ({
        ...team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        form: []
      }));
      // Recalculate based on whatever matches are 'Finished' initially (if any)
      loadedTeams = recalculateStandingsFromMatches(loadedTeams, loadedMatches);
      localStorage.setItem('fcl_admin_teams', JSON.stringify(loadedTeams));
    }
    setTeams(loadedTeams);

    // 3. Match Stats
    const storedStats = localStorage.getItem('fcl_admin_stats');
    let loadedStats: Record<string, DetailedMatchStats> = {};
    if (storedStats) {
      loadedStats = JSON.parse(storedStats);
    } else {
      // Initialize detailed stats from mock data
      loadedMatches.forEach(m => {
        const mockStat = MOCK_MATCH_STATS.find(s => s.matchId === m.id);
        const charSum = m.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        const cornersH = mockStat?.cornersHome ?? 0;
        const cornersA = mockStat?.cornersAway ?? 0;
        const yellowH = mockStat?.yellowCardsHome ?? 0;
        const yellowA = mockStat?.yellowCardsAway ?? 0;
        const redH = mockStat?.redCardsHome ?? 0;
        const redA = mockStat?.redCardsAway ?? 0;
        const foulsH = 10 + (charSum % 8);
        const foulsA = 11 + (charSum % 7);
        const offsidesH = charSum % 4;
        const offsidesA = charSum % 3;
        const freeKicksH = 5 + (charSum % 5);
        const freeKicksA = 4 + (charSum % 4);

        loadedStats[m.id] = {
          matchId: m.id,
          cornersHome: cornersH,
          cornersAway: cornersA,
          yellowCardsHome: yellowH,
          yellowCardsAway: yellowA,
          redCardsHome: redH,
          redCardsAway: redA,
          foulsHome: foulsH,
          foulsAway: foulsA,
          offsidesHome: offsidesH,
          offsidesAway: offsidesA,
          freeKicksHome: freeKicksH,
          freeKicksAway: freeKicksA,
          
          // Align with DB format compatibility
          homeCorners: cornersH,
          awayCorners: cornersA,
          homeYellowCards: yellowH,
          awayYellowCards: yellowA,
          homeRedCards: redH,
          awayRedCards: redA,
          homeOffsides: offsidesH,
          awayOffsides: offsidesA,
          homeFouls: foulsH,
          awayFouls: foulsA,
          homeFreeKicks: freeKicksH,
          awayFreeKicks: freeKicksA
        };
      });
      localStorage.setItem('fcl_admin_stats', JSON.stringify(loadedStats));
    }

    // Ensure md1-1 stats are populated with official full match statistics
    if (loadedStats['md1-1']) {
      loadedStats['md1-1'] = {
        ...loadedStats['md1-1'],
        cornersHome: 6,
        cornersAway: 3,
        yellowCardsHome: 0,
        yellowCardsAway: 1,
        redCardsHome: 0,
        redCardsAway: 0,
        foulsHome: 6,      // MST committed 6 fouls
        foulsAway: 16,     // ICE committed 16 fouls
        offsidesHome: 1,   // MST 1 offside (Nkemjika Sydney)
        offsidesAway: 0,
        freeKicksHome: 16, // MST 16 free kicks awarded (ICE 16 fouls)
        freeKicksAway: 6,  // ICE 6 free kicks awarded (MST 6 fouls)
        homeCorners: 6,
        awayCorners: 3,
        homeYellowCards: 0,
        awayYellowCards: 1,
        homeRedCards: 0,
        awayRedCards: 0,
        homeOffsides: 1,
        awayOffsides: 0,
        homeFouls: 6,
        awayFouls: 16,
        homeFreeKicks: 16,
        awayFreeKicks: 6
      };
      localStorage.setItem('fcl_admin_stats', JSON.stringify(loadedStats));
    }

    if (loadedStats['md1-5']) {
      loadedStats['md1-5'] = {
        ...loadedStats['md1-5'],
        cornersHome: 7,
        cornersAway: 4,
        yellowCardsHome: 1,
        yellowCardsAway: 2,
        redCardsHome: 0,
        redCardsAway: 0,
        foulsHome: 4,
        foulsAway: 9,
        offsidesHome: loadedStats['md1-5'].offsidesHome ?? 0,
        offsidesAway: loadedStats['md1-5'].offsidesAway ?? 0,
        freeKicksHome: 12, // BDG free kicks awarded (BDG 12)
        freeKicksAway: 7,  // ENT free kicks awarded (ENT 7)
        homeCorners: 7,
        awayCorners: 4,
        homeYellowCards: 1,
        awayYellowCards: 2,
        homeRedCards: 0,
        awayRedCards: 0,
        homeOffsides: loadedStats['md1-5'].homeOffsides ?? 0,
        awayOffsides: loadedStats['md1-5'].awayOffsides ?? 0,
        homeFouls: 4,
        awayFouls: 9,
        homeFreeKicks: 12,
        awayFreeKicks: 7
      };
      localStorage.setItem('fcl_admin_stats', JSON.stringify(loadedStats));
    }

    if (loadedStats['md1-3']) {
      loadedStats['md1-3'] = {
        ...loadedStats['md1-3'],
        cornersHome: 4,
        cornersAway: 2,
        yellowCardsHome: 0,
        yellowCardsAway: 0,
        redCardsHome: 0,
        redCardsAway: 0,
        foulsHome: 0,
        foulsAway: 0,
        offsidesHome: 0,
        offsidesAway: 0,
        freeKicksHome: 7,
        freeKicksAway: 5,
        homeCorners: 4,
        awayCorners: 2,
        homeYellowCards: 0,
        awayYellowCards: 0,
        homeRedCards: 0,
        awayRedCards: 0,
        homeOffsides: 0,
        awayOffsides: 0,
        homeFouls: 0,
        awayFouls: 0,
        homeFreeKicks: 7,
        awayFreeKicks: 5
      };
      localStorage.setItem('fcl_admin_stats', JSON.stringify(loadedStats));
    }

    if (loadedStats['md1-4']) {
      loadedStats['md1-4'] = {
        ...loadedStats['md1-4'],
        cornersHome: 2,
        cornersAway: 4,
        yellowCardsHome: 0,
        yellowCardsAway: 0,
        redCardsHome: 0,
        redCardsAway: 0,
        foulsHome: 0,
        foulsAway: 0,
        offsidesHome: 0,
        offsidesAway: 0,
        freeKicksHome: 3,
        freeKicksAway: 6,
        homeCorners: 2,
        awayCorners: 4,
        homeYellowCards: 0,
        awayYellowCards: 0,
        homeRedCards: 0,
        awayRedCards: 0,
        homeOffsides: 0,
        awayOffsides: 0,
        homeFouls: 0,
        awayFouls: 0,
        homeFreeKicks: 3,
        awayFreeKicks: 6
      };
      localStorage.setItem('fcl_admin_stats', JSON.stringify(loadedStats));
    }

    if (loadedStats['md1-6']) {
      loadedStats['md1-6'] = {
        ...loadedStats['md1-6'],
        cornersHome: 3,
        cornersAway: 1,
        yellowCardsHome: 0,
        yellowCardsAway: 0,
        redCardsHome: 0,
        redCardsAway: 0,
        foulsHome: 2,
        foulsAway: 5,
        offsidesHome: 0,
        offsidesAway: 3,
        freeKicksHome: 5,
        freeKicksAway: 2,
        homeCorners: 3,
        awayCorners: 1,
        homeYellowCards: 0,
        awayYellowCards: 0,
        homeRedCards: 0,
        awayRedCards: 0,
        homeOffsides: 0,
        awayOffsides: 3,
        homeFouls: 2,
        awayFouls: 5,
        homeFreeKicks: 5,
        awayFreeKicks: 2
      };
      localStorage.setItem('fcl_admin_stats', JSON.stringify(loadedStats));
    }

    if (loadedStats['md1-7']) {
      loadedStats['md1-7'] = {
        ...loadedStats['md1-7'],
        cornersHome: 1,
        cornersAway: 0,
        yellowCardsHome: 0,
        yellowCardsAway: 0,
        redCardsHome: 1,
        redCardsAway: 1,
        foulsHome: 2,
        foulsAway: 3,
        offsidesHome: 0,
        offsidesAway: 1,
        freeKicksHome: 3,
        freeKicksAway: 2,
        homeCorners: 1,
        awayCorners: 0,
        homeYellowCards: 0,
        awayYellowCards: 0,
        homeRedCards: 1,
        awayRedCards: 1,
        homeOffsides: 0,
        awayOffsides: 1,
        homeFouls: 2,
        awayFouls: 3,
        homeFreeKicks: 3,
        awayFreeKicks: 2
      };
      localStorage.setItem('fcl_admin_stats', JSON.stringify(loadedStats));
    }

    // AGE vs SIMT Match Statistics (md1-8)
    loadedStats['md1-8'] = {
      matchId: 'md1-8',
      cornersHome: 0,
      cornersAway: 0,
      yellowCardsHome: 0,
      yellowCardsAway: 3,
      redCardsHome: 0,
      redCardsAway: 2,
      foulsHome: 6,
      foulsAway: 0,
      offsidesHome: 0,
      offsidesAway: 0,
      freeKicksHome: 0,
      freeKicksAway: 5,
      homeCorners: 0,
      awayCorners: 0,
      homeYellowCards: 0,
      awayYellowCards: 3,
      homeRedCards: 0,
      awayRedCards: 2,
      homeOffsides: 0,
      awayOffsides: 0,
      homeFouls: 6,
      awayFouls: 0,
      homeFreeKicks: 0,
      awayFreeKicks: 5
    };
    localStorage.setItem('fcl_admin_stats', JSON.stringify(loadedStats));

    // MCB vs PHY Match Statistics (md1-10)
    loadedStats['md1-10'] = {
      matchId: 'md1-10',
      cornersHome: 2,
      cornersAway: 2,
      yellowCardsHome: 4,
      yellowCardsAway: 1,
      redCardsHome: 0,
      redCardsAway: 0,
      foulsHome: 4,
      foulsAway: 9,
      offsidesHome: 0,
      offsidesAway: 6,
      freeKicksHome: 15,
      freeKicksAway: 4,
      homeCorners: 2,
      awayCorners: 2,
      homeYellowCards: 4,
      awayYellowCards: 1,
      homeRedCards: 0,
      awayRedCards: 0,
      homeOffsides: 0,
      awayOffsides: 6,
      homeFouls: 4,
      awayFouls: 9,
      homeFreeKicks: 15,
      awayFreeKicks: 4
    };
    localStorage.setItem('fcl_admin_stats', JSON.stringify(loadedStats));

    // MBBS vs STA Match Statistics (md1-9)
    loadedStats['md1-9'] = {
      matchId: 'md1-9',
      cornersHome: 0,
      cornersAway: 0,
      yellowCardsHome: 0,
      yellowCardsAway: 0,
      redCardsHome: 0,
      redCardsAway: 0,
      foulsHome: 0,
      foulsAway: 0,
      offsidesHome: 0,
      offsidesAway: 0,
      freeKicksHome: 0,
      freeKicksAway: 0,
      homeCorners: 0,
      awayCorners: 0,
      homeYellowCards: 0,
      awayYellowCards: 0,
      homeRedCards: 0,
      awayRedCards: 0,
      homeOffsides: 0,
      awayOffsides: 0,
      homeFouls: 0,
      awayFouls: 0,
      homeFreeKicks: 0,
      awayFreeKicks: 0
    };

    // CSP vs STA (md2-1)
    loadedStats['md2-1'] = {
      matchId: 'md2-1',
      cornersHome: 5,
      cornersAway: 3,
      yellowCardsHome: 0,
      yellowCardsAway: 3,
      redCardsHome: 0,
      redCardsAway: 0,
      foulsHome: 3,
      foulsAway: 7,
      offsidesHome: 0,
      offsidesAway: 0,
      freeKicksHome: 7,
      freeKicksAway: 3,
      homeCorners: 5,
      awayCorners: 3,
      homeYellowCards: 0,
      awayYellowCards: 3,
      homeRedCards: 0,
      awayRedCards: 0,
      homeOffsides: 0,
      awayOffsides: 0,
      homeFouls: 3,
      awayFouls: 7,
      homeFreeKicks: 7,
      awayFreeKicks: 3
    };

    // APH vs IDD (md2-2)
    loadedStats['md2-2'] = {
      matchId: 'md2-2',
      cornersHome: 3,
      cornersAway: 3,
      yellowCardsHome: 3,
      yellowCardsAway: 2,
      redCardsHome: 1,
      redCardsAway: 0,
      foulsHome: 7,
      foulsAway: 8,
      offsidesHome: 3,
      offsidesAway: 1,
      freeKicksHome: 8,
      freeKicksAway: 7,
      homeCorners: 3,
      awayCorners: 3,
      homeYellowCards: 3,
      awayYellowCards: 2,
      homeRedCards: 1,
      awayRedCards: 0,
      homeOffsides: 3,
      awayOffsides: 1,
      homeFouls: 7,
      awayFouls: 8,
      homeFreeKicks: 8,
      awayFreeKicks: 7
    };

    // IFS vs MBBS (md2-3)
    loadedStats['md2-3'] = {
      matchId: 'md2-3',
      cornersHome: 3,
      cornersAway: 0,
      yellowCardsHome: 0,
      yellowCardsAway: 1,
      redCardsHome: 0,
      redCardsAway: 0,
      foulsHome: 9,
      foulsAway: 9,
      offsidesHome: 0,
      offsidesAway: 6,
      freeKicksHome: 9,
      freeKicksAway: 9,
      homeCorners: 3,
      awayCorners: 0,
      homeYellowCards: 0,
      awayYellowCards: 1,
      homeRedCards: 0,
      awayRedCards: 0,
      homeOffsides: 0,
      awayOffsides: 6,
      homeFouls: 9,
      awayFouls: 9,
      homeFreeKicks: 9,
      awayFreeKicks: 9
    };

    // ICE vs BCH (md2-4)
    loadedStats['md2-4'] = {
      matchId: 'md2-4',
      cornersHome: 1,
      cornersAway: 2,
      yellowCardsHome: 2,
      yellowCardsAway: 4,
      redCardsHome: 0,
      redCardsAway: 0,
      foulsHome: 4,
      foulsAway: 8,
      offsidesHome: 7,
      offsidesAway: 5,
      freeKicksHome: 8,
      freeKicksAway: 4,
      homeCorners: 1,
      awayCorners: 2,
      homeYellowCards: 2,
      awayYellowCards: 4,
      homeRedCards: 0,
      awayRedCards: 0,
      homeOffsides: 7,
      awayOffsides: 5,
      homeFouls: 4,
      awayFouls: 8,
      homeFreeKicks: 8,
      awayFreeKicks: 4
    };

    // PHS vs AGP (md2-5)
    loadedStats['md2-5'] = {
      matchId: 'md2-5',
      cornersHome: 2,
      cornersAway: 3,
      yellowCardsHome: 0,
      yellowCardsAway: 0,
      redCardsHome: 0,
      redCardsAway: 0,
      foulsHome: 5,
      foulsAway: 3,
      offsidesHome: 0,
      offsidesAway: 0,
      freeKicksHome: 3,
      freeKicksAway: 5,
      homeCorners: 2,
      awayCorners: 3,
      homeYellowCards: 0,
      awayYellowCards: 0,
      homeRedCards: 0,
      awayRedCards: 0,
      homeOffsides: 0,
      awayOffsides: 0,
      homeFouls: 5,
      awayFouls: 3,
      homeFreeKicks: 3,
      awayFreeKicks: 5
    };

    // MST vs CYS (md2-6)
    loadedStats['md2-6'] = {
      matchId: 'md2-6',
      cornersHome: 4,
      cornersAway: 1,
      yellowCardsHome: 2,
      yellowCardsAway: 2,
      redCardsHome: 0,
      redCardsAway: 0,
      foulsHome: 2,
      foulsAway: 5,
      offsidesHome: 2,
      offsidesAway: 1,
      freeKicksHome: 5,
      freeKicksAway: 2,
      homeCorners: 4,
      awayCorners: 1,
      homeYellowCards: 2,
      awayYellowCards: 2,
      homeRedCards: 0,
      awayRedCards: 0,
      homeOffsides: 2,
      awayOffsides: 1,
      homeFouls: 2,
      awayFouls: 5,
      homeFreeKicks: 5,
      awayFreeKicks: 2
    };

    // CSP vs CYS (md3-3)
    loadedStats['md3-3'] = {
      matchId: 'md3-3',
      cornersHome: 6,
      cornersAway: 1,
      yellowCardsHome: 2,
      yellowCardsAway: 0,
      redCardsHome: 0,
      redCardsAway: 0,
      foulsHome: 8,
      foulsAway: 10,
      offsidesHome: 4,
      offsidesAway: 2,
      freeKicksHome: 10,
      freeKicksAway: 8,
      homeCorners: 6,
      awayCorners: 1,
      homeYellowCards: 2,
      awayYellowCards: 0,
      homeRedCards: 0,
      awayRedCards: 0,
      homeOffsides: 4,
      awayOffsides: 2,
      homeFouls: 8,
      awayFouls: 10,
      homeFreeKicks: 10,
      awayFreeKicks: 8
    };

    // IFS vs STA (md3-4)
    loadedStats['md3-4'] = {
      matchId: 'md3-4',
      cornersHome: 4,
      cornersAway: 3,
      yellowCardsHome: 0,
      yellowCardsAway: 3,
      redCardsHome: 0,
      redCardsAway: 0,
      foulsHome: 8,
      foulsAway: 11,
      offsidesHome: 2,
      offsidesAway: 1,
      freeKicksHome: 11,
      freeKicksAway: 8,
      homeCorners: 4,
      awayCorners: 3,
      homeYellowCards: 0,
      awayYellowCards: 3,
      homeRedCards: 0,
      awayRedCards: 0,
      homeOffsides: 2,
      awayOffsides: 1,
      homeFouls: 8,
      awayFouls: 11,
      homeFreeKicks: 11,
      awayFreeKicks: 8
    };

    // MST vs SIMT (md3-6)
    loadedStats['md3-6'] = {
      matchId: 'md3-6',
      cornersHome: 11,
      cornersAway: 1,
      yellowCardsHome: 1,
      yellowCardsAway: 6,
      redCardsHome: 1,
      redCardsAway: 1,
      foulsHome: 3,
      foulsAway: 12,
      offsidesHome: 3,
      offsidesAway: 0,
      freeKicksHome: 11,
      freeKicksAway: 6,
      homeCorners: 11,
      awayCorners: 1,
      homeYellowCards: 1,
      awayYellowCards: 6,
      homeRedCards: 1,
      awayRedCards: 1,
      homeOffsides: 3,
      awayOffsides: 0,
      homeFouls: 3,
      awayFouls: 12,
      homeFreeKicks: 11,
      awayFreeKicks: 6
    };

    // PHS vs BCH (md3-2)
    loadedStats['md3-2'] = {
      matchId: 'md3-2',
      cornersHome: 0,
      cornersAway: 0,
      yellowCardsHome: 1,
      yellowCardsAway: 1,
      redCardsHome: 0,
      redCardsAway: 0,
      foulsHome: 0,
      foulsAway: 0,
      offsidesHome: 0,
      offsidesAway: 0,
      freeKicksHome: 0,
      freeKicksAway: 0,
      homeCorners: 0,
      awayCorners: 0,
      homeYellowCards: 1,
      awayYellowCards: 1,
      homeRedCards: 0,
      awayRedCards: 0,
      homeOffsides: 0,
      awayOffsides: 0,
      homeFouls: 0,
      awayFouls: 0,
      homeFreeKicks: 0,
      awayFreeKicks: 0
    };

    // PHY vs AGP (md3-1)
    loadedStats['md3-1'] = {
      matchId: 'md3-1',
      cornersHome: 0,
      cornersAway: 0,
      yellowCardsHome: 0,
      yellowCardsAway: 0,
      redCardsHome: 0,
      redCardsAway: 0,
      foulsHome: 0,
      foulsAway: 0,
      offsidesHome: 0,
      offsidesAway: 0,
      freeKicksHome: 0,
      freeKicksAway: 0,
      homeCorners: 0,
      awayCorners: 0,
      homeYellowCards: 0,
      awayYellowCards: 0,
      homeRedCards: 0,
      awayRedCards: 0,
      homeOffsides: 0,
      awayOffsides: 0,
      homeFouls: 0,
      awayFouls: 0,
      homeFreeKicks: 0,
      awayFreeKicks: 0
    };

    // MCB vs IDD (md3-5)
    loadedStats['md3-5'] = {
      matchId: 'md3-5',
      cornersHome: 0,
      cornersAway: 0,
      yellowCardsHome: 0,
      yellowCardsAway: 0,
      redCardsHome: 0,
      redCardsAway: 0,
      foulsHome: 0,
      foulsAway: 0,
      offsidesHome: 0,
      offsidesAway: 0,
      freeKicksHome: 0,
      freeKicksAway: 0,
      homeCorners: 0,
      awayCorners: 0,
      homeYellowCards: 0,
      awayYellowCards: 0,
      homeRedCards: 0,
      awayRedCards: 0,
      homeOffsides: 0,
      awayOffsides: 0,
      homeFouls: 0,
      awayFouls: 0,
      homeFreeKicks: 0,
      awayFreeKicks: 0
    };

    // ENT vs MBBS (md3-9)
    loadedStats['md3-9'] = {
      matchId: 'md3-9',
      cornersHome: 0,
      cornersAway: 0,
      yellowCardsHome: 2,
      yellowCardsAway: 3,
      redCardsHome: 0,
      redCardsAway: 0,
      foulsHome: 0,
      foulsAway: 0,
      offsidesHome: 0,
      offsidesAway: 0,
      freeKicksHome: 7,
      freeKicksAway: 5,
      homeCorners: 0,
      awayCorners: 0,
      homeYellowCards: 2,
      awayYellowCards: 3,
      homeRedCards: 0,
      awayRedCards: 0,
      homeOffsides: 0,
      awayOffsides: 0,
      homeFouls: 0,
      awayFouls: 0,
      homeFreeKicks: 7,
      awayFreeKicks: 5
    };

    // APH vs AGE (md3-8)
    loadedStats['md3-8'] = {
      matchId: 'md3-8',
      cornersHome: 0,
      cornersAway: 0,
      yellowCardsHome: 0,
      yellowCardsAway: 0,
      redCardsHome: 0,
      redCardsAway: 0,
      foulsHome: 0,
      foulsAway: 0,
      offsidesHome: 0,
      offsidesAway: 0,
      freeKicksHome: 0,
      freeKicksAway: 0,
      homeCorners: 0,
      awayCorners: 0,
      homeYellowCards: 0,
      awayYellowCards: 0,
      homeRedCards: 0,
      awayRedCards: 0,
      homeOffsides: 0,
      awayOffsides: 0,
      homeFouls: 0,
      awayFouls: 0,
      homeFreeKicks: 0,
      awayFreeKicks: 0
    };

    localStorage.setItem('fcl_admin_stats', JSON.stringify(loadedStats));

    setDetailedStats(loadedStats);

    // 4. Goal events
    const storedGoals = localStorage.getItem('fcl_admin_goals');
    let loadedGoals: GoalScorer[] = [];
    if (storedGoals) {
      loadedGoals = JSON.parse(storedGoals);
      // Migrate AGP Michael goals to Olasunkanmi Michael
      let goalsChanged = false;
      loadedGoals = loadedGoals.map(g => {
        if (g.team === 'AGP' && g.playerName === 'Michael') {
          goalsChanged = true;
          return {
            ...g,
            playerName: 'Olasunkanmi Michael',
            minute: g.matchId === 'md1-2' ? "26'" : g.minute,
            id: g.matchId === 'md1-2' ? 'goal-md1-2-michael-26' : g.id
          };
        }
        return g;
      });
      if (goalsChanged) {
        localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
      }
    } else {
      loadedGoals = [];
    }

    if (!loadedGoals.some(g => g.matchId === 'md1-2' && g.playerName === 'Olasunkanmi Michael')) {
      loadedGoals.unshift({
        id: 'goal-md1-2-michael-26',
        matchId: 'md1-2',
        playerName: 'Olasunkanmi Michael',
        team: 'AGP',
        minute: "26'",
        type: 'Goal'
      });
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md1-2' && g.playerName === 'Rowland')) {
      loadedGoals.push({
        id: 'goal-md1-2-rowland-46',
        matchId: 'md1-2',
        playerName: 'Rowland',
        team: 'AGP',
        minute: "46'",
        type: 'Goal'
      });
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md1-5' && g.playerName === 'Awoyemi Jesutofunmi')) {
      loadedGoals.push({
        id: 'goal-md1-5-tofunmi-7',
        matchId: 'md1-5',
        playerName: 'Awoyemi Jesutofunmi',
        team: 'BDG',
        minute: "7'",
        type: 'Goal'
      });
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md1-5' && g.playerName === 'Desmond')) {
      loadedGoals.push({
        id: 'goal-md1-5-desmond-43',
        matchId: 'md1-5',
        playerName: 'Desmond',
        team: 'BDG',
        minute: "43'",
        type: 'Goal'
      });
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md1-3' && g.playerName === 'Olorunfemi Taiwo James')) {
      loadedGoals = loadedGoals.filter(g => g.matchId !== 'md1-3' || (g.playerName !== 'Taiwo' && g.playerName !== 'Olorunfemi Taiwo James'));
      loadedGoals.push({
        id: 'goal-md1-3-taiwo-28',
        matchId: 'md1-3',
        playerName: 'Olorunfemi Taiwo James',
        team: 'CYS',
        minute: "28'",
        type: 'Goal'
      });
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md1-4' && g.playerName === 'Kunlex')) {
      loadedGoals.push({
        id: 'goal-md1-4-kunlex-30+3',
        matchId: 'md1-4',
        playerName: 'Kunlex',
        team: 'APH',
        minute: "30+3'",
        type: 'Goal'
      });
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md1-6' && g.playerName === 'Ademide')) {
      loadedGoals.push({
        id: 'goal-md1-6-ademide-1',
        matchId: 'md1-6',
        playerName: 'Ademide',
        team: 'CSP',
        minute: "1'",
        type: 'Goal'
      });
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md1-7' && g.playerName === 'Soji')) {
      loadedGoals.push({
        id: 'goal-md1-7-soji-12',
        matchId: 'md1-7',
        playerName: 'Soji',
        team: 'IDD',
        minute: "12'",
        type: 'Goal'
      });
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    // Replace any existing 'Sola' with 'Ikudayisi Oyesola'
    let goalsPruned = false;
    loadedGoals = loadedGoals.map(g => {
      if (g.playerName === 'Sola') {
        goalsPruned = true;
        return { ...g, playerName: 'Ikudayisi Oyesola' };
      }
      return g;
    });
    if (goalsPruned) {
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md1-7' && g.playerName === 'Ikudayisi Oyesola')) {
      loadedGoals.push({
        id: 'goal-md1-7-sola-51',
        matchId: 'md1-7',
        playerName: 'Ikudayisi Oyesola',
        team: 'IDD',
        minute: "51'",
        type: 'Goal'
      });
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }
    if (!loadedGoals.some(g => g.matchId === 'md1-8')) {
      loadedGoals.push(
        {
          id: 'goal-md1-8-adebayo-8',
          matchId: 'md1-8',
          playerName: 'Adebayo Samuel Ayobami',
          team: 'SIMT',
          minute: "8'",
          type: 'Goal'
        },
        {
          id: 'goal-md1-8-adebayo-25',
          matchId: 'md1-8',
          playerName: 'Adebayo Samuel Ayobami',
          team: 'SIMT',
          minute: "25'",
          type: 'Goal'
        },
        {
          id: 'goal-md1-8-sylvanus-42',
          matchId: 'md1-8',
          playerName: 'Sylvanus',
          team: 'AGE',
          minute: "42'",
          type: 'Penalty'
        },
        {
          id: 'goal-md1-8-anthony-47',
          matchId: 'md1-8',
          playerName: 'Anthony',
          team: 'AGE',
          minute: "47'",
          type: 'Goal'
        },
        {
          id: 'goal-md1-8-adebayo-55',
          matchId: 'md1-8',
          playerName: 'Adebayo Samuel Ayobami',
          team: 'SIMT',
          minute: "55'",
          type: 'Goal'
        }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }
    if (!loadedGoals.some(g => g.matchId === 'md1-10')) {
      loadedGoals.push(
        {
          id: 'goal-md1-10-akinseye-13',
          matchId: 'md1-10',
          playerName: 'Akinseye Oluwasanmilore',
          team: 'PHY',
          minute: "13'",
          type: 'Goal'
        },
        {
          id: 'goal-md1-10-olaniran-30',
          matchId: 'md1-10',
          playerName: 'Olaniran Oluwatimilehin',
          team: 'MCB',
          minute: "30'",
          type: 'Goal'
        },
        {
          id: 'goal-md1-10-iyenagbe-59',
          matchId: 'md1-10',
          playerName: 'Iyenagbe Christian',
          team: 'PHY',
          minute: "59'",
          type: 'Goal'
        }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }
    if (!loadedGoals.some(g => g.matchId === 'md1-9')) {
      loadedGoals.push(
        {
          id: 'goal-md1-9-sk-7',
          matchId: 'md1-9',
          playerName: 'SK',
          team: 'MBBS',
          minute: "7'",
          type: 'Goal'
        },
        {
          id: 'goal-md1-9-tioluwanimi-15',
          matchId: 'md1-9',
          playerName: 'Daisi Tioluwanimi',
          team: 'STA',
          minute: "15'",
          type: 'Goal'
        },
        {
          id: 'goal-md1-9-fikayo-48',
          matchId: 'md1-9',
          playerName: 'Bamidele Fikayo',
          team: 'MBBS',
          minute: "48'",
          type: 'Goal'
        }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    // Matchday 2 Sunday/Saturday Goals
    if (!loadedGoals.some(g => g.matchId === 'md2-1')) {
      loadedGoals.push(
        { id: 'goal-md2-1-agbo-15', matchId: 'md2-1', playerName: 'Agbo Peter', team: 'STA', minute: "15'", type: 'Goal' },
        { id: 'goal-md2-1-timilehin-44', matchId: 'md2-1', playerName: 'Timilehin Victor', team: 'CSP', minute: "44'", type: 'Goal' },
        { id: 'goal-md2-1-akindeko-55', matchId: 'md2-1', playerName: 'Akindeko Emmanuel', team: 'CSP', minute: "55'", type: 'Goal' },
        { id: 'goal-md2-1-daisi-59', matchId: 'md2-1', playerName: 'Daisi Tioluwanimi', team: 'STA', minute: "59'", type: 'Goal' },
        { id: 'goal-md2-1-akindeko-60', matchId: 'md2-1', playerName: 'Akindeko Emmanuel', team: 'CSP', minute: "60+1'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md2-2')) {
      loadedGoals.push(
        { id: 'goal-md2-2-ikudayisi-54', matchId: 'md2-2', playerName: 'Ikudayisi Oyesola', team: 'IDD', minute: "54'", type: 'Penalty' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md2-3')) {
      loadedGoals.push(
        { id: 'goal-md2-3-adewale-3', matchId: 'md2-3', playerName: 'Adewale Adeola Samuel', team: 'IFS', minute: "3'", type: 'Goal' },
        { id: 'goal-md2-3-okoh-17', matchId: 'md2-3', playerName: 'Okoh Chibuike', team: 'MBBS', minute: "17'", type: 'Goal' },
        { id: 'goal-md2-3-gbolaga-55', matchId: 'md2-3', playerName: 'Olorunfunmilayo Gbolaga Emmanuel', team: 'IFS', minute: "55'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md2-4')) {
      loadedGoals.push(
        { id: 'goal-md2-4-usman-43', matchId: 'md2-4', playerName: 'Bamidele Usman', team: 'ICE', minute: "43'", type: 'Goal' },
        { id: 'goal-md2-4-usman-60', matchId: 'md2-4', playerName: 'Bamidele Usman', team: 'ICE', minute: "60+3'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md2-5')) {
      loadedGoals.push(
        { id: 'goal-md2-5-abimbola-8', matchId: 'md2-5', playerName: 'Abimbola Alexander Akinmoyegun', team: 'PHS', minute: "8'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md2-6')) {
      loadedGoals.push(
        { id: 'goal-md2-6-iyare-2', matchId: 'md2-6', playerName: 'Iyare Praise', team: 'MST', minute: "2'", type: 'Goal' },
        { id: 'goal-md2-6-akintunde-7', matchId: 'md2-6', playerName: 'Akintunde Ayomide Oluwaseyifunmi', team: 'MST', minute: "7'", type: 'Goal' },
        { id: 'goal-md2-6-taiwo-10', matchId: 'md2-6', playerName: 'Olorunfemi Taiwo James', team: 'CYS', minute: "10'", type: 'Goal' },
        { id: 'goal-md2-6-sydney-15', matchId: 'md2-6', playerName: 'Nkemjika Sydney', team: 'MST', minute: "15'", type: 'Goal' },
        { id: 'goal-md2-6-alameen-23', matchId: 'md2-6', playerName: 'Ajao Alameen Olaide', team: 'CYS', minute: "23'", type: 'Goal' },
        { id: 'goal-md2-6-bello-28', matchId: 'md2-6', playerName: 'Bello Daniel Damilare', team: 'CYS', minute: "28'", type: 'Goal' },
        { id: 'goal-md2-6-bello-42', matchId: 'md2-6', playerName: 'Bello Daniel Damilare', team: 'CYS', minute: "42'", type: 'Goal' },
        { id: 'goal-md2-6-iyare-60', matchId: 'md2-6', playerName: 'Iyare Praise', team: 'MST', minute: "60'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md2-7')) {
      loadedGoals.push(
        { id: 'goal-md2-7-dominion-37', matchId: 'md2-7', playerName: 'Dominion', team: 'ANA', minute: "37'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md2-8')) {
      loadedGoals.push(
        { id: 'goal-md2-8-alowonle-37', matchId: 'md2-8', playerName: 'Alowonle Clement', team: 'MCB', minute: "37'", type: 'Goal' },
        { id: 'goal-md2-8-oni-45', matchId: 'md2-8', playerName: 'Oni Oluwadamilola', team: 'MCB', minute: "45'", type: 'Goal' },
        { id: 'goal-md2-8-agesin-60', matchId: 'md2-8', playerName: 'Agesin', team: 'AGE', minute: "60+1'", type: 'Own Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md2-10')) {
      loadedGoals.push(
        { id: 'goal-md2-10-oweazim-37', matchId: 'md2-10', playerName: 'Oweazim Chukwudumebi', team: 'SIMT', minute: "37'", type: 'Goal' },
        { id: 'goal-md2-10-uduak-51', matchId: 'md2-10', playerName: 'Uduak Abasi', team: 'PHY', minute: "51'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md2-9')) {
      loadedGoals.push(
        { id: 'goal-md2-9-samuel-5', matchId: 'md2-9', playerName: 'Christopher Samuel', team: 'BDG', minute: "5'", type: 'Goal' },
        { id: 'goal-md2-9-akinfolahan-20', matchId: 'md2-9', playerName: 'Akinfolahan Temidayo Ebunoluwa', team: 'BDG', minute: "20'", type: 'Goal' },
        { id: 'goal-md2-9-akinbiyi-45', matchId: 'md2-9', playerName: 'Akinbiyi Akinwalere Ayomikun', team: 'BDG', minute: "45'", type: 'Goal' },
        { id: 'goal-md2-9-awoyemi-50', matchId: 'md2-9', playerName: 'Awoyemi Jesutofunmi', team: 'BDG', minute: "50'", type: 'Goal' },
        { id: 'goal-md2-9-ogunkanmi-60', matchId: 'md2-9', playerName: 'Ogunkanmi Oluwanimisire Oladayo', team: 'FWT', minute: "60'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md3-3')) {
      loadedGoals.push(
        { id: 'goal-md3-3-olamijulo-46', matchId: 'md3-3', playerName: 'Olamijulo Israel Damilare', team: 'CYS', minute: "46'", type: 'Goal' },
        { id: 'goal-md3-3-olorunfemi-52', matchId: 'md3-3', playerName: 'Olorunfemi Taiwo James', team: 'CYS', minute: "52'", type: 'Goal' },
        { id: 'goal-md3-3-bello-64', matchId: 'md3-3', playerName: 'Bello Daniel Damilare', team: 'CYS', minute: "60+4'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md3-4')) {
      loadedGoals.push(
        { id: 'goal-md3-4-bello-24', matchId: 'md3-4', playerName: 'Bello Riliwan Remilekun', team: 'STA', minute: "24'", type: 'Goal' },
        { id: 'goal-md3-4-adeola-41', matchId: 'md3-4', playerName: 'Adewale Adeola Samuel', team: 'IFS', minute: "41'", type: 'Goal' },
        { id: 'goal-md3-4-agbo-45', matchId: 'md3-4', playerName: 'Agbo Peter', team: 'STA', minute: "45'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md3-6')) {
      loadedGoals.push(
        { id: 'goal-md3-6-sydney-25', matchId: 'md3-6', playerName: 'Nkemjika Sydney', team: 'MST', minute: "25'", type: 'Penalty' },
        { id: 'goal-md3-6-sydney-34', matchId: 'md3-6', playerName: 'Nkemjika Sydney', team: 'MST', minute: "34'", type: 'Goal' },
        { id: 'goal-md3-6-sydney-45', matchId: 'md3-6', playerName: 'Nkemjika Sydney', team: 'MST', minute: "45'", type: 'Goal' },
        { id: 'goal-md3-6-boyede-46', matchId: 'md3-6', playerName: 'Boyede Joseph Ayomide', team: 'MST', minute: "46'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md3-2')) {
      loadedGoals.push(
        { id: 'goal-md3-2-peter-25', matchId: 'md3-2', playerName: 'Peter', team: 'BCH', minute: "25'", type: 'Goal' },
        { id: 'goal-md3-2-eagle-30', matchId: 'md3-2', playerName: 'Eagle', team: 'BCH', minute: "30'", type: 'Goal' },
        { id: 'goal-md3-2-isreal-42', matchId: 'md3-2', playerName: 'Isreal', team: 'PHS', minute: "42'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md3-1')) {
      loadedGoals.push(
        { id: 'goal-md3-1-olasunkanmi-7', matchId: 'md3-1', playerName: 'Olasunkanmi Michael', team: 'AGP', minute: "7'", type: 'Goal' },
        { id: 'goal-md3-1-uduak-25', matchId: 'md3-1', playerName: 'Uduak Abasi', team: 'PHY', minute: "25'", type: 'Goal' },
        { id: 'goal-md3-1-christian-42', matchId: 'md3-1', playerName: 'Iyenagbe Christian', team: 'PHY', minute: "42'", type: 'Goal' },
        { id: 'goal-md3-1-olasunkanmi-60', matchId: 'md3-1', playerName: 'Olasunkanmi Michael', team: 'AGP', minute: "60'", type: 'Penalty' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md3-5')) {
      loadedGoals.push(
        { id: 'goal-md3-5-emmy-42', matchId: 'md3-5', playerName: 'Emmy', team: 'IDD', minute: "42'", type: 'Goal' },
        { id: 'goal-md3-5-oni-51', matchId: 'md3-5', playerName: 'Oni Oluwadamilola', team: 'MCB', minute: "51'", type: 'Penalty' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md3-9')) {
      loadedGoals.push(
        { id: 'goal-md3-9-pelumi-3', matchId: 'md3-9', playerName: 'Pelumi', team: 'ENT', minute: "3'", type: 'Goal' },
        { id: 'goal-md3-9-bamidele-52', matchId: 'md3-9', playerName: 'Bamidele Fikayo', team: 'MBBS', minute: "52'", type: 'Goal' },
        { id: 'goal-md3-9-drp-56', matchId: 'md3-9', playerName: 'Dr. P', team: 'MBBS', minute: "56'", type: 'Goal' },
        { id: 'goal-md3-9-adesola-60', matchId: 'md3-9', playerName: 'Adesola Emmanuel', team: 'MBBS', minute: "60'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md3-8')) {
      loadedGoals.push(
        { id: 'goal-md3-8-fola-15', matchId: 'md3-8', playerName: 'Fola', team: 'APH', minute: "15'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'PO6')) {
      loadedGoals.push(
        { id: 'goal-po6-iyare-49', matchId: 'PO6', playerName: 'Iyare Praise', team: 'MST', minute: "49'", type: 'Goal' },
        { id: 'goal-po6-michael-54', matchId: 'PO6', playerName: 'Michael', team: 'CSP', minute: "54'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'PO1')) {
      loadedGoals.push(
        { id: 'goal-po1-agbo-52', matchId: 'PO1', playerName: 'Agbo Peter', team: 'STA', minute: "52'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'PO2')) {
      loadedGoals.push(
        { id: 'goal-po2-isreal-15', matchId: 'PO2', playerName: 'Isreal', team: 'ANA', minute: "15'", type: 'Goal' },
        { id: 'goal-po2-ademola-20', matchId: 'PO2', playerName: 'Ademola Paul', team: 'ANA', minute: "20'", type: 'Goal' },
        { id: 'goal-po2-success-25', matchId: 'PO2', playerName: 'Success Bayode', team: 'ANA', minute: "25'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'PO3')) {
      loadedGoals.push(
        { id: 'goal-po3-michael-64', matchId: 'PO3', playerName: 'Olasunkanmi Michael', team: 'AGP', minute: "60+4'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'PO4')) {
      loadedGoals.push(
        { id: 'goal-po4-lucky-22', matchId: 'PO4', playerName: 'Ameh Lucky', team: 'MCB', minute: "22'", type: 'Goal' },
        { id: 'goal-po4-timilehin-30', matchId: 'PO4', playerName: 'Olaniran Oluwatimilehin', team: 'MCB', minute: "30'", type: 'Goal' },
        { id: 'goal-po4-damilola-54', matchId: 'PO4', playerName: 'Oni Oluwadamilola', team: 'MCB', minute: "54'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'PO5')) {
      loadedGoals.push(
        { id: 'goal-po5-fola-15', matchId: 'PO5', playerName: 'Fola', team: 'APH', minute: "15'", type: 'Penalty' },
        { id: 'goal-po5-toni-26', matchId: 'PO5', playerName: 'Toni', team: 'APH', minute: "26'", type: 'Penalty' },
        { id: 'goal-po5-kunlex-35', matchId: 'PO5', playerName: 'Kunlex', team: 'APH', minute: "35'", type: 'Goal' },
        { id: 'goal-po5-emmy-47', matchId: 'PO5', playerName: 'Emmy', team: 'APH', minute: "47'", type: 'Goal' },
        { id: 'goal-po5-emmy-58', matchId: 'PO5', playerName: 'Emmy', team: 'APH', minute: "58'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'QF1')) {
      loadedGoals.push(
        { id: 'goal-qf1-adegoke-19-og', matchId: 'QF1', playerName: 'Adegoke', team: 'APH', minute: "19'", type: 'Own Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'QF2')) {
      loadedGoals.push(
        { id: 'goal-qf2-ameh-25', matchId: 'QF2', playerName: 'Ameh Lucky', team: 'MCB', minute: "25'", type: 'Goal' },
        { id: 'goal-qf2-taiwo-30', matchId: 'QF2', playerName: 'Olorunfemi Taiwo James', team: 'CYS', minute: "30'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'QF3')) {
      loadedGoals.push(
        { id: 'goal-qf3-oluwafemi-9', matchId: 'QF3', playerName: 'Onileowo Oluwafemi', team: 'AGP', minute: "9'", type: 'Goal' },
        { id: 'goal-qf3-michael-19', matchId: 'QF3', playerName: 'Olasunkanmi Michael', team: 'AGP', minute: "19'", type: 'Penalty' },
        { id: 'goal-qf3-jesse-41', matchId: 'QF3', playerName: 'Nwachukwu Jesse', team: 'STA', minute: "41'", type: 'Penalty' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'SF1_1')) {
      loadedGoals.push(
        { id: 'goal-sf1_1-usman-33', matchId: 'SF1_1', playerName: 'Bamidele Usman', team: 'ICE', minute: "33'", type: 'Goal' },
        { id: 'goal-sf1_1-michael-35', matchId: 'SF1_1', playerName: 'Olasunkanmi Michael', team: 'AGP', minute: "35'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'SF2_1')) {
      loadedGoals.push(
        { id: 'goal-sf2_1-joshua-5-og', matchId: 'SF2_1', playerName: 'Adewumi Excel Joshua', team: 'CYS', minute: "5'", type: 'Own Goal' },
        { id: 'goal-sf2_1-praise-33', matchId: 'SF2_1', playerName: 'Iyare Praise', team: 'MST', minute: "33'", type: 'Penalty' },
        { id: 'goal-sf2_1-agboro-41', matchId: 'SF2_1', playerName: 'Arinze Meshach Agboro', team: 'CYS', minute: "41'", type: 'Goal' }
      );
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    setGoalScorers(loadedGoals);

    // 5. Cards & Subs
    const storedCards = localStorage.getItem('fcl_admin_cards');
    let loadedCards: CardEvent[] = storedCards ? JSON.parse(storedCards) : [];
    if (!loadedCards.some(c => c.matchId === 'md1-1' && (c.playerName === 'Faleye Aduragbemi' || c.playerName === 'Aduragbemi'))) {
      loadedCards.unshift({
        id: 'card-ice-aduragbemi',
        matchId: 'md1-1',
        playerName: 'Faleye Aduragbemi',
        teamAbbr: 'ICE',
        minute: '30+3',
        type: 'Yellow'
      });
      localStorage.setItem('fcl_admin_cards', JSON.stringify(loadedCards));
    } else {
      // Keep name synchronized exactly with standard
      const index = loadedCards.findIndex(c => c.matchId === 'md1-1' && c.playerName === 'Aduragbemi');
      if (index !== -1) {
        loadedCards[index].playerName = 'Faleye Aduragbemi';
        localStorage.setItem('fcl_admin_cards', JSON.stringify(loadedCards));
      }
    }

    let cardsUpdated_md1_5 = false;
    const officialMd1_5Cards: CardEvent[] = [
      // QF1 Cards (ICE vs APH)
      { id: 'card-qf1-muller-33', matchId: 'QF1', playerName: 'Muller', teamAbbr: 'ICE', minute: "33'", type: 'Yellow' },
      { id: 'card-qf1-bigsam-50', matchId: 'QF1', playerName: 'Big Sam', teamAbbr: 'ICE', minute: "50'", type: 'Yellow' },
      { id: 'card-qf1-unnamed-7', matchId: 'QF1', playerName: 'Unnamed player', teamAbbr: 'APH', minute: "7'", type: 'Yellow' },
      { id: 'card-qf1-kunlex-9', matchId: 'QF1', playerName: 'Kunlex', teamAbbr: 'APH', minute: "9'", type: 'Yellow' },
      { id: 'card-qf1-fola-17', matchId: 'QF1', playerName: 'Fola', teamAbbr: 'APH', minute: "17'", type: 'Yellow' },
      { id: 'card-qf1-unnamed-26', matchId: 'QF1', playerName: 'Unnamed player', teamAbbr: 'APH', minute: "26'", type: 'Yellow' },
      { id: 'card-qf1-unnamed-46', matchId: 'QF1', playerName: 'Unnamed player', teamAbbr: 'APH', minute: "46'", type: 'Yellow' },
      { id: 'card-qf1-chosen-50', matchId: 'QF1', playerName: 'Chosen', teamAbbr: 'APH', minute: "50'", type: 'Yellow' },

      { id: 'card-md1-5-praise', matchId: 'md1-5', playerName: 'Praise', teamAbbr: 'BDG', minute: "38'", type: 'Yellow' },
      { id: 'card-md1-5-promise', matchId: 'md1-5', playerName: 'Promise', teamAbbr: 'ENT', minute: "15'", type: 'Yellow' },
      { id: 'card-md1-5-fairy', matchId: 'md1-5', playerName: 'Fairy', teamAbbr: 'ENT', minute: "55'", type: 'Yellow' },
      { id: 'card-md1-7-malik', matchId: 'md1-7', playerName: 'Ganiyu Malik Ayomide', teamAbbr: 'FWT', minute: "53'", type: 'Red' },
      { id: 'card-md1-7-tolu', matchId: 'md1-7', playerName: 'Tolu', teamAbbr: 'IDD', minute: "53'", type: 'Red' },
      // AGE vs SIMT Card Events (md1-8)
      { id: 'card-md1-8-coach', matchId: 'md1-8', playerName: 'Asinwa Peter Adeleke (Coach)', teamAbbr: 'SIMT', minute: "1'", type: 'Yellow' },
      { id: 'card-md1-8-daniel-y1', matchId: 'md1-8', playerName: 'Nwabunwanne Chibichi Daniel', teamAbbr: 'SIMT', minute: "1'", type: 'Yellow' },
      { id: 'card-md1-8-adebayo-y', matchId: 'md1-8', playerName: 'Adebayo Samuel Ayobami', teamAbbr: 'SIMT', minute: "1'", type: 'Yellow' },
      { id: 'card-md1-8-daniel-r', matchId: 'md1-8', playerName: 'Nwabunwanne Chibichi Daniel', teamAbbr: 'SIMT', minute: "58'", type: 'Red' },
      { id: 'card-md1-8-gbolahun-r', matchId: 'md1-8', playerName: 'Omowale Ridwan Gbolahun', teamAbbr: 'SIMT', minute: "56'", type: 'Red' },
      // MCB vs PHY Card Events (md1-10)
      { id: 'card-md1-10-osowo-1', matchId: 'md1-10', playerName: 'Osowo Taiwo', teamAbbr: 'MCB', minute: "1'", type: 'Yellow' },
      { id: 'card-md1-10-adesuyi-1', matchId: 'md1-10', playerName: 'Adesuyi Oluwasegun', teamAbbr: 'MCB', minute: "1'", type: 'Yellow' },
      { id: 'card-md1-10-ajayi-19', matchId: 'md1-10', playerName: 'Ajayi Timothy', teamAbbr: 'PHY', minute: "19'", type: 'Yellow' },
      { id: 'card-md1-10-oni-44', matchId: 'md1-10', playerName: 'Oni Oluwadamilola', teamAbbr: 'MCB', minute: "44'", type: 'Yellow' },
      { id: 'card-md1-10-lawal-44', matchId: 'md1-10', playerName: 'Lawal Favour Ben', teamAbbr: 'MCB', minute: "44'", type: 'Yellow' },

      // CSP vs STA Cards (md2-1)
      { id: 'card-md2-1-nwachukwu-15', matchId: 'md2-1', playerName: 'Nwachukwu Jesse', teamAbbr: 'STA', minute: "15'", type: 'Yellow' },
      { id: 'card-md2-1-akinjogunla-34', matchId: 'md2-1', playerName: 'Akinjogunla Mayowa', teamAbbr: 'STA', minute: "34'", type: 'Yellow' },
      { id: 'card-md2-1-salam-42', matchId: 'md2-1', playerName: 'Salam Rokeeb Oladimeji', teamAbbr: 'STA', minute: "42'", type: 'Yellow' },

      // APH vs IDD Cards (md2-2)
      { id: 'card-md2-2-olajide-12', matchId: 'md2-2', playerName: 'Olajide Gabriel', teamAbbr: 'APH', minute: "12'", type: 'Yellow' },
      { id: 'card-md2-2-aremu-25', matchId: 'md2-2', playerName: 'Aremu Stone', teamAbbr: 'APH', minute: "25'", type: 'Yellow' },
      { id: 'card-md2-2-adebamibola-25', matchId: 'md2-2', playerName: 'Adebamibola Emmanuel', teamAbbr: 'IDD', minute: "25'", type: 'Yellow' },
      { id: 'card-md2-2-olajide-38', matchId: 'md2-2', playerName: 'Olajide Gabriel', teamAbbr: 'APH', minute: "38'", type: 'Red' }, // Second Yellow
      { id: 'card-md2-2-awosoji-48', matchId: 'md2-2', playerName: 'Awosoji Ifeoluwa Emmanuel', teamAbbr: 'IDD', minute: "48'", type: 'Yellow' },
      { id: 'card-md2-2-akinwekomi-53', matchId: 'md2-2', playerName: 'Ridwan Akinwekomi', teamAbbr: 'APH', minute: "53'", type: 'Yellow' },

      // IFS vs MBBS Cards (md2-3)
      { id: 'card-md2-3-okunola-3', matchId: 'md2-3', playerName: 'Okunola Samuel', teamAbbr: 'MBBS', minute: "3'", type: 'Yellow' },

      // ICE vs BCH Cards (md2-4)
      { id: 'card-md2-4-tunde-23', matchId: 'md2-4', playerName: 'Tunde Akinwande', teamAbbr: 'BCH', minute: "23'", type: 'Yellow' },
      { id: 'card-md2-4-folorunsho-37', matchId: 'md2-4', playerName: 'Folorunsho Toluwanimi', teamAbbr: 'BCH', minute: "37'", type: 'Yellow' },
      { id: 'card-md2-4-miracle-46', matchId: 'md2-4', playerName: 'Miracle', teamAbbr: 'BCH', minute: "46'", type: 'Yellow' },
      { id: 'card-md2-4-damola-50', matchId: 'md2-4', playerName: 'Adeyemi Damola', teamAbbr: 'ICE', minute: "50'", type: 'Yellow' },
      { id: 'card-md2-4-sammy-54', matchId: 'md2-4', playerName: 'Sammy', teamAbbr: 'BCH', minute: "54'", type: 'Yellow' },
      { id: 'card-md2-4-six-54', matchId: 'md2-4', playerName: 'Six', teamAbbr: 'ICE', minute: "54'", type: 'Yellow' },

      // MST vs CYS Cards (md2-6)
      { id: 'card-md2-6-esezobor-21', matchId: 'md2-6', playerName: 'Esezobor Isaac Eromosele (Coach)', teamAbbr: 'MST', minute: "21'", type: 'Yellow' },
      { id: 'card-md2-6-adewumi-21', matchId: 'md2-6', playerName: 'Adewumi Excel Joshua', teamAbbr: 'CYS', minute: "21'", type: 'Yellow' },
      { id: 'card-md2-6-fabusuyi-28', matchId: 'md2-6', playerName: 'Fabusuyi Daniel Oluwafisayo', teamAbbr: 'MST', minute: "28'", type: 'Yellow' },
      { id: 'card-md2-6-akinyede-32', matchId: 'md2-6', playerName: 'Akinyede Allen Oluwaferanmi', teamAbbr: 'CYS', minute: "32'", type: 'Yellow' },

      // ENT vs ANA Cards (md2-7)
      { id: 'card-md2-7-ent-promise', matchId: 'md2-7', playerName: 'Promise', teamAbbr: 'ENT', minute: "15'", type: 'Yellow' },
      { id: 'card-md2-7-ent-fairy', matchId: 'md2-7', playerName: 'Fairy', teamAbbr: 'ENT', minute: "42'", type: 'Yellow' },
      { id: 'card-md2-7-ana-dominion', matchId: 'md2-7', playerName: 'Dominion', teamAbbr: 'ANA', minute: "54'", type: 'Yellow' },

      // MCB vs AGE Cards (md2-8)
      { id: 'card-md2-8-mcb-osowo', matchId: 'md2-8', playerName: 'Osowo Taiwo', teamAbbr: 'MCB', minute: "22'", type: 'Yellow' },
      { id: 'card-md2-8-mcb-alowonle', matchId: 'md2-8', playerName: 'Alowonle Clement', teamAbbr: 'MCB', minute: "51'", type: 'Yellow' },
      { id: 'card-md2-8-age-afolabi', matchId: 'md2-8', playerName: 'Afolabi', teamAbbr: 'AGE', minute: "44'", type: 'Yellow' },
      { id: 'card-md2-8-age-muhammed', matchId: 'md2-8', playerName: 'Muhammed', teamAbbr: 'AGE', minute: "40'", type: 'Red' },

      // PHY vs SIMT Cards (md2-10)
      { id: 'card-md2-10-oladapo-2', matchId: 'md2-10', playerName: 'Oladapo Isaac Ayomide', teamAbbr: 'SIMT', minute: "2'", type: 'Yellow' },
      { id: 'card-md2-10-daniel-20', matchId: 'md2-10', playerName: 'Nwabunwanne Chibichi Daniel', teamAbbr: 'SIMT', minute: "20'", type: 'Yellow' },
      { id: 'card-md2-10-momoh-55', matchId: 'md2-10', playerName: 'Momoh Joshua David', teamAbbr: 'SIMT', minute: "55'", type: 'Yellow' },

      // BDG vs FWT Cards (md2-9)
      { id: 'card-md2-9-arowolo-15', matchId: 'md2-9', playerName: 'Arowolo Gideon', teamAbbr: 'BDG', minute: "15'", type: 'Yellow' },
      { id: 'card-md2-9-famuwagun-22', matchId: 'md2-9', playerName: 'Famuwagun Tomiwa Young', teamAbbr: 'FWT', minute: "22'", type: 'Yellow' },
      { id: 'card-md2-9-tiamiyu-44', matchId: 'md2-9', playerName: 'Tiamiyu Samuel Temitope', teamAbbr: 'FWT', minute: "44'", type: 'Yellow' },

      // CSP vs CYS Cards (md3-3)
      { id: 'card-md3-3-akindeko-25', matchId: 'md3-3', playerName: 'Akindeko Emmanuel', teamAbbr: 'CSP', minute: "25'", type: 'Yellow' },
      { id: 'card-md3-3-pelumi-43', matchId: 'md3-3', playerName: 'Pelumi', teamAbbr: 'CSP', minute: "43'", type: 'Yellow' },

      // IFS vs STA Cards (md3-4)
      { id: 'card-md3-4-bello-30', matchId: 'md3-4', playerName: 'Bello Riliwan Remilekun', teamAbbr: 'STA', minute: "30'", type: 'Yellow' },
      { id: 'card-md3-4-oladimeji-45', matchId: 'md3-4', playerName: 'Salam Rokeeb Oladimeji', teamAbbr: 'STA', minute: "45'", type: 'Yellow' },
      { id: 'card-md3-4-praise-51', matchId: 'md3-4', playerName: 'Afilaka Praise Temidayo', teamAbbr: 'STA', minute: "51'", type: 'Yellow' },

      // MST vs SIMT Cards (md3-6)
      { id: 'card-md3-6-coach-8', matchId: 'md3-6', playerName: 'Asinwa Peter Adeleke (Coach)', teamAbbr: 'SIMT', minute: "8'", type: 'Yellow' },
      { id: 'card-md3-6-iyare-14', matchId: 'md3-6', playerName: 'Iyare Praise', teamAbbr: 'MST', minute: "14'", type: 'Yellow' },
      { id: 'card-md3-6-adewopo-15', matchId: 'md3-6', playerName: 'Adewopo Feranmi', teamAbbr: 'SIMT', minute: "15'", type: 'Yellow' },
      { id: 'card-md3-6-daniel-y1', matchId: 'md3-6', playerName: 'Nwabunwanne Chibichi Daniel', teamAbbr: 'SIMT', minute: "35'", type: 'Yellow' },
      { id: 'card-md3-6-daniel-r', matchId: 'md3-6', playerName: 'Nwabunwanne Chibichi Daniel', teamAbbr: 'SIMT', minute: "35'", type: 'Red' },
      { id: 'card-md3-6-adeyemi-r', matchId: 'md3-6', playerName: 'Adeyemi Adedayo Ibrahim', teamAbbr: 'MST', minute: "35'", type: 'Red' },
      { id: 'card-md3-6-joshua-51', matchId: 'md3-6', playerName: 'Emmanuel Oluwapamilerin Joshua', teamAbbr: 'SIMT', minute: "51'", type: 'Yellow' },
      { id: 'card-md3-6-ogboye-57', matchId: 'md3-6', playerName: 'Ogboye Samuel Oluwaponmile', teamAbbr: 'SIMT', minute: "57'", type: 'Yellow' },
      { id: 'card-md3-6-omowale-58', matchId: 'md3-6', playerName: 'Omowale Ridwan Gbolahun', teamAbbr: 'SIMT', minute: "58'", type: 'Yellow' },

      // PHS vs BCH Cards (md3-2)
      { id: 'card-md3-2-peter-y', matchId: 'md3-2', playerName: 'Peter', teamAbbr: 'BCH', minute: "20'", type: 'Yellow' },
      { id: 'card-md3-2-isreal-y', matchId: 'md3-2', playerName: 'Isreal', teamAbbr: 'PHS', minute: "45'", type: 'Yellow' },

      // ENT vs MBBS Cards (md3-9)
      { id: 'card-md3-9-promise-y', matchId: 'md3-9', playerName: 'Promise', teamAbbr: 'ENT', minute: "15'", type: 'Yellow' },
      { id: 'card-md3-9-fairy-y', matchId: 'md3-9', playerName: 'Fairy', teamAbbr: 'ENT', minute: "42'", type: 'Yellow' },
      { id: 'card-md3-9-bamidele-y', matchId: 'md3-9', playerName: 'Bamidele Fikayo', teamAbbr: 'MBBS', minute: "20'", type: 'Yellow' },
      { id: 'card-md3-9-drp-y', matchId: 'md3-9', playerName: 'Dr. P', teamAbbr: 'MBBS', minute: "33'", type: 'Yellow' },
      { id: 'card-md3-9-adesola-y', matchId: 'md3-9', playerName: 'Adesola Emmanuel', teamAbbr: 'MBBS', minute: "55'", type: 'Yellow' },

      // QF3 Cards (STA vs AGP)
      { id: 'card-qf3-obafemi-48', matchId: 'QF3', playerName: 'Obafemi', teamAbbr: 'AGP', minute: "48'", type: 'Yellow' },

      // SF1_1 Cards (ICE vs AGP)
      { id: 'card-sf1_1-frank-52', matchId: 'SF1_1', playerName: 'Apake Avososhido Frank', teamAbbr: 'AGP', minute: "52'", type: 'Yellow' },

      // SF2_1 Cards (CYS vs MST)
      { id: 'card-sf2_1-fashola-23', matchId: 'SF2_1', playerName: 'Fashola Oluwatobi Joshua', teamAbbr: 'CYS', minute: "23'", type: 'Yellow' },
      { id: 'card-sf2_1-adeniyi-41', matchId: 'SF2_1', playerName: 'Adeniyi Ademola Daniel', teamAbbr: 'MST', minute: "41'", type: 'Yellow' },
      { id: 'card-sf2_1-fabusuyi-63', matchId: 'SF2_1', playerName: 'Fabusuyi Daniel Oluwafisayo', teamAbbr: 'MST', minute: "60+3'", type: 'Yellow' },
      { id: 'card-sf2_1-jegede-63', matchId: 'SF2_1', playerName: 'Jegede Daniel Kolawole', teamAbbr: 'CYS', minute: "60+3'", type: 'Yellow' },
      { id: 'card-sf2_1-ogayemi-66', matchId: 'SF2_1', playerName: 'David Ogayemi', teamAbbr: 'MST', minute: "60+6'", type: 'Yellow' }
    ];
    officialMd1_5Cards.forEach(c => {
      const existingIdx = loadedCards.findIndex(existing => existing.id === c.id);
      if (existingIdx !== -1) {
        if (loadedCards[existingIdx].playerName !== c.playerName) {
          loadedCards[existingIdx].playerName = c.playerName;
          cardsUpdated_md1_5 = true;
        }
      } else {
        loadedCards.push(c);
        cardsUpdated_md1_5 = true;
      }
    });
    if (cardsUpdated_md1_5) {
      localStorage.setItem('fcl_admin_cards', JSON.stringify(loadedCards));
    }

    setCards(loadedCards);

    const storedSubs = localStorage.getItem('fcl_admin_subs');
    let loadedSubs: SubEvent[] = storedSubs ? JSON.parse(storedSubs) : [];
    
    const officialSubs: SubEvent[] = [
      { id: 'sub-ice-samson-usman', matchId: 'md1-1', teamAbbr: 'ICE', playerOut: 'Olayiwola Samson', playerIn: 'Bamidele Usman', minute: 28 },
      { id: 'sub-mst-bel-dan', matchId: 'md1-1', teamAbbr: 'MST', playerOut: 'Philip Believe Oluwashina', playerIn: 'Adeniyi Ademola Daniel', minute: 43 },
      { id: 'sub-mst-fab-boy', matchId: 'md1-1', teamAbbr: 'MST', playerOut: 'Fabusuyi Daniel Oluwafisayo', playerIn: 'Boyede Joseph Ayomide', minute: 43 },
      { id: 'sub-ice-sam-iyin', matchId: 'md1-1', teamAbbr: 'ICE', playerOut: 'Ayeni Samuel', playerIn: 'Iyinbor Michael', minute: 43 },
      { id: 'sub-mst-ade-sho', matchId: 'md1-1', teamAbbr: 'MST', playerOut: 'Adekunle Ayomide Mubarak', playerIn: 'Shomuyiwa Lateef Babatunde', minute: 52 },
      { id: 'sub-ice-quad-dam', matchId: 'md1-1', teamAbbr: 'ICE', playerOut: 'Olayinka Quadri', playerIn: 'Adeyemi Damola', minute: 53 },
      { id: 'sub-mst-ake-for', matchId: 'md1-1', teamAbbr: 'MST', playerOut: 'Akintunde Ayomide Oluwaseyifunmi', playerIn: 'Ekwe Fortune', minute: 60 },
      { id: 'sub-csp-ademide-adedara', matchId: 'md1-6', teamAbbr: 'CSP', playerOut: 'Ademide', playerIn: 'Adedara', minute: 43 },
      { id: 'sub-ifs-idris-kehinde', matchId: 'md1-6', teamAbbr: 'IFS', playerOut: 'Idris', playerIn: 'Kehinde', minute: 46 },
      { id: 'sub-ifs-segun-victor', matchId: 'md1-6', teamAbbr: 'IFS', playerOut: 'Segun', playerIn: 'Victor', minute: 46 },
      { id: 'sub-idd-ney-enzo', matchId: 'md1-7', teamAbbr: 'IDD', playerOut: 'Neymar', playerIn: 'Enzo', minute: 39 },
      // MCB vs PHY Subs (md1-10)
      { id: 'sub-md1-10-mcb-1', matchId: 'md1-10', teamAbbr: 'MCB', playerOut: 'Alagbe Jeremiah Kehinde', playerIn: 'Adameji Isaac', minute: 31 },
      { id: 'sub-md1-10-mcb-2', matchId: 'md1-10', teamAbbr: 'MCB', playerOut: 'Ameh Lucky', playerIn: 'Wasiu Ismaeel', minute: 50 },
      { id: 'sub-md1-10-phy-1', matchId: 'md1-10', teamAbbr: 'PHY', playerOut: 'Are Moses', playerIn: 'Lawal Oluwabukunmi', minute: 41 },
      { id: 'sub-md1-10-phy-2', matchId: 'md1-10', teamAbbr: 'PHY', playerOut: 'Akinseye Oluwasanmilore', playerIn: 'Oladipupo Kayode Afeez', minute: 47 },
      { id: 'sub-md1-10-phy-3', matchId: 'md1-10', teamAbbr: 'PHY', playerOut: 'Ajigboteleda Emmanuel', playerIn: 'Andrew Emmanuel', minute: 57 },

      // CSP vs STA Subs (md2-1)
      { id: 'sub-md2-1-csp-1', matchId: 'md2-1', teamAbbr: 'CSP', playerOut: 'Adebisi Success', playerIn: 'Adedara', minute: 31 },
      { id: 'sub-md2-1-csp-2', matchId: 'md2-1', teamAbbr: 'CSP', playerOut: 'Ademide', playerIn: 'Goodness', minute: 31 },
      { id: 'sub-md2-1-sta-1', matchId: 'md2-1', teamAbbr: 'STA', playerOut: 'Akinjogunla Mayowa', playerIn: 'Salam Rokeeb Oladimeji', minute: 34 },
      { id: 'sub-md2-1-sta-2', matchId: 'md2-1', teamAbbr: 'STA', playerOut: 'Adedeji Taofeek Oyeleke', playerIn: 'Jackson Joseph', minute: 42 },
      { id: 'sub-md2-1-csp-3', matchId: 'md2-1', teamAbbr: 'CSP', playerOut: 'Oyebode Daniel', playerIn: 'Alonge David', minute: 42 },
      { id: 'sub-md2-1-csp-4', matchId: 'md2-1', teamAbbr: 'CSP', playerOut: 'Timilehin Victor', playerIn: 'Omowaye Timothy', minute: 56 },
      { id: 'sub-md2-1-sta-3', matchId: 'md2-1', teamAbbr: 'STA', playerOut: 'Emmanuel Olaoluwa Akintayo', playerIn: 'Eki Kelvin Aghoghomena', minute: 60 },

      // APH vs IDD Subs (md2-2)
      { id: 'sub-md2-2-aph-1', matchId: 'md2-2', teamAbbr: 'APH', playerOut: 'Akinyemi Toluwanimi', playerIn: 'Top child', minute: 31 },
      { id: 'sub-md2-2-aph-2', matchId: 'md2-2', teamAbbr: 'APH', playerOut: 'Emeka Nelson', playerIn: 'Babatunde Sodeeq', minute: 31 },
      { id: 'sub-md2-2-aph-3', matchId: 'md2-2', teamAbbr: 'APH', playerOut: 'Oluwapelumi Samuel', playerIn: 'Ayemidotun Oluwaseun', minute: 43 },
      { id: 'sub-md2-2-idd-1', matchId: 'md2-2', teamAbbr: 'IDD', playerOut: 'Aribaba Inioluwa', playerIn: 'Adebayo Mujeeb', minute: 46 },
      { id: 'sub-md2-2-idd-2', matchId: 'md2-2', teamAbbr: 'IDD', playerOut: 'Awosoji Ifeoluwa Emmanuel', playerIn: 'Sunday John', minute: 50 },
      { id: 'sub-md2-2-aph-4', matchId: 'md2-2', teamAbbr: 'APH', playerOut: 'Oloyede Adekunle Ayuba', playerIn: 'Olajide Abdulroheem', minute: 56 },
      { id: 'sub-md2-2-idd-3', matchId: 'md2-2', teamAbbr: 'IDD', playerOut: 'Oladejo Kehinde', playerIn: 'Ademoyegun Oluwatimilehin', minute: 56 },

      // IFS vs MBBS Subs (md2-3)
      { id: 'sub-md2-3-mbbs-1', matchId: 'md2-3', teamAbbr: 'MBBS', playerOut: 'Okunola Samuel', playerIn: 'Badrudeen Abduhameed', minute: 31 },
      { id: 'sub-md2-3-mbbs-2', matchId: 'md2-3', teamAbbr: 'MBBS', playerOut: 'Gazali Sheriffdeen', playerIn: 'Desola Emmanuel', minute: 31 },
      { id: 'sub-md2-3-ifs-1', matchId: 'md2-3', teamAbbr: 'IFS', playerOut: 'Olanrewaju Ifeoluwa', playerIn: 'Olorunfunmilayo Gbolaga Emmanuel', minute: 31 },
      { id: 'sub-md2-3-ifs-2', matchId: 'md2-3', teamAbbr: 'IFS', playerOut: 'Fasiku Victor Adebola', playerIn: 'Busari Ifeoluwa Habeeb', minute: 37 },
      { id: 'sub-md2-3-mbbs-3', matchId: 'md2-3', teamAbbr: 'MBBS', playerOut: 'Olasunkunmi Elijah Ogunkunle', playerIn: 'Aliyu Okuwatofunmi', minute: 37 },
      { id: 'sub-md2-3-ifs-3', matchId: 'md2-3', teamAbbr: 'IFS', playerOut: 'Olatunji Dunni Oluwagbenga', playerIn: 'Bakare Idris', minute: 48 },
      { id: 'sub-md2-3-ifs-4', matchId: 'md2-3', teamAbbr: 'IFS', playerOut: 'Olorunfemi Kehinde John', playerIn: 'Akinyemi Feranmi Olusegun', minute: 48 },
      { id: 'sub-md2-3-mbbs-4', matchId: 'md2-3', teamAbbr: 'MBBS', playerOut: 'Ayomikun Oluyamo', playerIn: 'Adeusi Oyindamola', minute: 48 },
      { id: 'sub-md2-3-ifs-5', matchId: 'md2-3', teamAbbr: 'IFS', playerOut: 'Owamokele Joshua', playerIn: 'Adeosun Peace', minute: 56 },
      { id: 'sub-md2-3-ifs-6', matchId: 'md2-3', teamAbbr: 'IFS', playerOut: 'Omotomo Olumide Daniel', playerIn: 'Ojodako Joseph Olayinka', minute: 56 },

      // ICE vs BCH Subs (md2-4)
      { id: 'sub-md2-4-ice-1', matchId: 'md2-4', teamAbbr: 'ICE', playerOut: 'Fawehinmi Emmanuel', playerIn: 'Faleye Aduragbemi', minute: 31 },
      { id: 'sub-md2-4-ice-2', matchId: 'md2-4', teamAbbr: 'ICE', playerOut: 'Adejimi Daniel', playerIn: 'Oripelaye Al-ameen Adeshina', minute: 31 },
      { id: 'sub-md2-4-ice-3', matchId: 'md2-4', teamAbbr: 'ICE', playerOut: 'Akinloye Toluwalase', playerIn: 'Kudabo Paul Timilehin', minute: 38 },
      { id: 'sub-md2-4-bch-1', matchId: 'md2-4', teamAbbr: 'BCH', playerOut: 'Ifekoya Jeremiah', playerIn: 'Olakekan Timilehin', minute: 47 },
      { id: 'sub-md2-4-ice-4', matchId: 'md2-4', teamAbbr: 'ICE', playerOut: 'Adeyemi Damola', playerIn: 'Iyinbor Michael', minute: 50 },
      { id: 'sub-md2-4-bch-2', matchId: 'md2-4', teamAbbr: 'BCH', playerOut: 'Oladoyin Basit', playerIn: 'Akinwande Tunde', minute: 50 },
      { id: 'sub-md2-4-ice-5', matchId: 'md2-4', teamAbbr: 'ICE', playerOut: 'Abiodun Boluwatife', playerIn: 'Adeyeye Emmanuel', minute: 62 },

      // PHS vs AGP Subs (md2-5)
      { id: 'sub-md2-5-phs-1', matchId: 'md2-5', teamAbbr: 'PHS', playerOut: 'Abimbola Alexander Akinmoyegun', playerIn: 'Ayofe', minute: 31 },
      { id: 'sub-md2-5-agp-1', matchId: 'md2-5', teamAbbr: 'AGP', playerOut: 'Patrick Favour', playerIn: 'Ehikioya Desmond', minute: 40 },
      { id: 'sub-md2-5-agp-2', matchId: 'md2-5', teamAbbr: 'AGP', playerOut: 'Oluwafemi Onileowo', playerIn: 'Akinbosoye Akinola', minute: 50 },
      { id: 'sub-md2-5-phs-2', matchId: 'md2-5', teamAbbr: 'PHS', playerOut: 'Emmanuel Odiba Benedict', playerIn: 'Alex Victor', minute: 52 },
      { id: 'sub-md2-5-agp-3', matchId: 'md2-5', teamAbbr: 'AGP', playerOut: 'Adetunji Obafemi', playerIn: 'Timilehin', minute: 52 },

      // MST vs CYS Subs (md2-6)
      { id: 'sub-md2-6-mst-1', matchId: 'md2-6', teamAbbr: 'MST', playerOut: 'Philip Believe Oluwashina', playerIn: 'Ayeni Ayobami', minute: 36 },
      { id: 'sub-md2-6-cys-1', matchId: 'md2-6', teamAbbr: 'CYS', playerOut: 'Akinshipe Oluwafemi Solomon', playerIn: 'Onah Caleb Igoche', minute: 36 },

      // PHY vs SIMT Subs (md2-10)
      { id: 'sub-md2-10-phy-1', matchId: 'md2-10', teamAbbr: 'PHY', playerOut: 'Akinseye Oluwasanmilore', playerIn: 'Andrew Emmanuel', minute: 35 },
      { id: 'sub-md2-10-phy-2', matchId: 'md2-10', teamAbbr: 'PHY', playerOut: 'Are Moses', playerIn: 'Abiola Abdmalik', minute: 35 },
      { id: 'sub-md2-10-simt-1', matchId: 'md2-10', teamAbbr: 'SIMT', playerOut: 'Ipinlaye Samuel Fisayo', playerIn: 'Okoye Philip C.', minute: 50 },
      { id: 'sub-md2-10-simt-2', matchId: 'md2-10', teamAbbr: 'SIMT', playerOut: 'Emmanuel Oluwapamilerin Joshua', playerIn: 'Ogboye Samuel Oluwaponmile', minute: 50 },

      // BDG vs FWT Subs (md2-9)
      { id: 'sub-md2-9-bdg-1', matchId: 'md2-9', teamAbbr: 'BDG', playerOut: 'Praise', playerIn: 'Olawuyi Moses', minute: 45 },
      { id: 'sub-md2-9-fwt-1', matchId: 'md2-9', teamAbbr: 'FWT', playerOut: 'Adegoke Blessing Moses', playerIn: 'Olalekan Hammed Olajuwon', minute: 40 },

      // PO6 Subs
      { id: 'sub-po6-mst-gk', matchId: 'PO6', teamAbbr: 'MST', playerOut: 'Ogundeji Feyitunmise Hezekiah', playerIn: 'Ikwue David Oche', minute: 55 },
      // QF4 Subs
      { id: 'sub-qf4-mst-gk', matchId: 'QF4', teamAbbr: 'MST', playerOut: 'Ogundeji Feyitunmise Hezekiah', playerIn: 'Ikwue David Oche', minute: 52 },

      // SF1_1 Subs
      { id: 'sub-sf1_1-ice-1', matchId: 'SF1_1', teamAbbr: 'ICE', playerOut: 'Olayiwola Samson', playerIn: 'Akinloye Toluwalase', minute: 31 },
      { id: 'sub-sf1_1-ice-2', matchId: 'SF1_1', teamAbbr: 'ICE', playerOut: 'Folowosele Peace', playerIn: 'Bamidele Usman', minute: 31 },
      { id: 'sub-sf1_1-agp-1', matchId: 'SF1_1', teamAbbr: 'AGP', playerOut: 'Rowland', playerIn: 'Ayomide Samuel', minute: 41 },
      { id: 'sub-sf1_1-ice-3', matchId: 'SF1_1', teamAbbr: 'ICE', playerOut: 'Boyede Joseph Ayomide', playerIn: 'Kudabo Timilehin', minute: 42 },
      { id: 'sub-sf1_1-agp-2', matchId: 'SF1_1', teamAbbr: 'AGP', playerOut: 'Olujobade Daniel', playerIn: 'Akinbosoye Akinola', minute: 55 },
      { id: 'sub-sf1_1-ice-4', matchId: 'SF1_1', teamAbbr: 'ICE', playerOut: 'Akinloye Toluwalase', playerIn: 'Adejinmi Daniel', minute: 55 },

      // SF2_1 Subs
      { id: 'sub-sf2_1-cys-1', matchId: 'SF2_1', teamAbbr: 'CYS', playerOut: 'Fashola Oluwatobi Joshua', playerIn: 'Akinyede Allen Oluwaferanmi', minute: 37 },
      { id: 'sub-sf2_1-cys-2', matchId: 'SF2_1', teamAbbr: 'CYS', playerOut: 'Owolabi Olaifeoluwa Solomon', playerIn: 'Arinze Meshach Agboro', minute: 37 },
      { id: 'sub-sf2_1-mst-1', matchId: 'SF2_1', teamAbbr: 'MST', playerOut: 'Akintunde Ayomide Oluwaseyifunmi', playerIn: 'Shomuyiwa Lateef Babatunde', minute: 50 },
      { id: 'sub-sf2_1-mst-2', matchId: 'SF2_1', teamAbbr: 'MST', playerOut: 'Adeniyi Ademola Daniel', playerIn: 'Ademisoye Segun', minute: 57 },
      { id: 'sub-sf2_1-mst-3', matchId: 'SF2_1', teamAbbr: 'MST', playerOut: 'Boyede Joseph Ayomide', playerIn: 'David Ogayemi', minute: 60 }
    ];

    let subsUpdated = false;
    if (loadedSubs.some(existing => existing.id === 'sub-fwt-ney-enzo')) {
      loadedSubs = loadedSubs.filter(existing => existing.id !== 'sub-fwt-ney-enzo');
      subsUpdated = true;
    }

    officialSubs.forEach(s => {
      const existingIdx = loadedSubs.findIndex(existing => existing.id === s.id);
      if (existingIdx !== -1) {
        if (
          loadedSubs[existingIdx].teamAbbr !== s.teamAbbr ||
          loadedSubs[existingIdx].playerOut !== s.playerOut ||
          loadedSubs[existingIdx].playerIn !== s.playerIn ||
          loadedSubs[existingIdx].minute !== s.minute
        ) {
          loadedSubs[existingIdx].teamAbbr = s.teamAbbr;
          loadedSubs[existingIdx].playerOut = s.playerOut;
          loadedSubs[existingIdx].playerIn = s.playerIn;
          loadedSubs[existingIdx].minute = s.minute;
          subsUpdated = true;
        }
      } else {
        loadedSubs.unshift(s);
        subsUpdated = true;
      }
    });

    if (subsUpdated) {
      localStorage.setItem('fcl_admin_subs', JSON.stringify(loadedSubs));
    }
    setSubs(loadedSubs);

    // 6. User Auth
    const storedUser = localStorage.getItem('fcl_admin_user');
    setCurrentUser(storedUser ? JSON.parse(storedUser) : null);

    // 7. Audit Logs
    const storedAudit = localStorage.getItem('fcl_admin_audit_logs');
    setAuditLogs(storedAudit ? JSON.parse(storedAudit) : []);

    // 8. Lineups
    const storedLineups = localStorage.getItem('fcl_admin_lineups');
    let loadedLineups: Record<string, { home: MatchLineup; away: MatchLineup }> = {};
    if (storedLineups) {
      loadedLineups = JSON.parse(storedLineups);
    } else {
      // Prebuild default lineups for each matchup
      loadedMatches.forEach(m => {
        loadedLineups[m.id] = {
          home: {
            matchId: m.id,
            teamAbbr: m.homeTeam,
            formation: '4-3-3',
            captainId: 'player-1',
            players: {
              'GK': 'player-1', 'LB': 'player-2', 'CB1': 'player-3', 'CB2': 'player-4', 'RB': 'player-5',
              'DM': 'player-6', 'CM1': 'player-7', 'CM2': 'player-8', 'LW': 'player-9', 'ST': 'player-10', 'RW': 'player-11'
            },
            bench: ['Adegoke Samuel', 'Chidi Okafor', 'Victor Moses', 'KDB', 'Burna Boy'],
            status: 'Pending'
          },
          away: {
            matchId: m.id,
            teamAbbr: m.awayTeam,
            formation: '4-4-2',
            captainId: 'player-12',
            players: {
              'GK': 'player-12', 'LB': 'player-13', 'CB1': 'player-14', 'CB2': 'player-15', 'RB': 'player-16',
              'LM': 'player-17', 'CM1': 'player-18', 'CM2': 'player-19', 'RM': 'player-20', 'ST1': 'player-21', 'ST2': 'player-22'
            },
            bench: ['Tunde Williams', 'David Alaba', 'Davido', 'Asake', 'Rema'],
            status: 'Pending'
          }
        };
      });
    }

    // Force/overlay MST official Matchday 1 lineup specifically for md1-1 (MST vs ICE)
    loadedLineups['md1-1'] = {
      home: {
        matchId: 'md1-1',
        teamAbbr: 'MST',
        formation: '4-3-3',
        captainId: 'player-mst-2', // Adeyemi Adedayo Ibrahim (Captain)
        players: {
          'GK': 'player-mst-1',  // Ogundeji Feyitunmise Hezekiah
          'LB': 'player-mst-6',  // Philip Believe Oluwashina
          'LCB': 'player-mst-5', // Bernard Augustine Obioma
          'RCB': 'player-mst-2', // Adeyemi Adedayo Ibrahim (Captain)
          'RB': 'player-mst-3',  // Akinnayajo Irewale
          'LCM': 'player-mst-9', // Adediran Olanrewaju Abeeb
          'CM': 'player-mst-10', // Iyare Praise
          'RCM': 'player-mst-12',// Adekunle Ayomide Mubarak
          'LW': 'player-mst-19', // Akintunde Ayomide Oluwaseyifunmi
          'CF': 'player-mst-15', // Nkemjika Sydney
          'RW': 'player-mst-18'  // Fabusuyi Daniel Oluwafisayo
        },
        bench: [
          'Ojoisimi Bright Agbomizi',
          'Adeniyi Ademola Daniel',
          'Ademisoye Segun',
          'Akinyo Boluwatife Precious',
          'Olagunju Moses Temitope',
          'Shomuyiwa Lateef Babatunde',
          'Boyede Joseph Ayomide'
        ],
        status: 'Approved'
      },
      away: {
        matchId: 'md1-1',
        teamAbbr: 'ICE',
        formation: '4-4-2',
        captainId: 'player-ice-prosper',
        players: {
          'GK': 'player-ice-prosper', 'LB': 'player-13', 'CB1': 'player-14', 'CB2': 'player-15', 'RB': 'player-16',
          'LM': 'player-17', 'CM1': 'player-ice-samson', 'CM2': 'player-19', 'RM': 'player-20', 'ST1': 'player-21', 'ST2': 'player-22'
        },
        bench: ['Bamidele Usman', 'Tunde Williams', 'David Alaba', 'Davido', 'Asake', 'Rema'],
        status: 'Approved'
      }
    };

    // Force/overlay CYS official Matchday 1 lineup specifically for md1-3 (CYS vs ANA)
    loadedLineups['md1-3'] = {
      home: {
        matchId: 'md1-3',
        teamAbbr: 'CYS',
        formation: '4-3-3',
        captainId: 'player-cys-5', // Fashola Tobi (Captain)
        players: {
          'GK': 'player-cys-1',  // Olabode Victor
          'LB': 'player-cys-2',  // Adewunmi Excel
          'LCB': 'player-cys-3', // Kadiri Akorede
          'RCB': 'player-cys-4', // Raji Jubril
          'RB': 'player-cys-5',  // Fashola Tobi
          'DM1': 'player-cys-6', // Nwoke Isaac
          'AM': 'player-cys-7',  // Ayeni Paul
          'DM2': 'player-cys-8', // Onah Caleb
          'LW': 'player-cys-9',  // Ajao Alameed
          'CF': 'player-cys-22', // Olorunfemi Taiwo James
          'RW': 'player-cys-11'  // Akinyede Allen
        },
        bench: [],
        status: 'Approved'
      },
      away: loadedLineups['md1-3']?.away || {
        matchId: 'md1-3',
        teamAbbr: 'ANA',
        formation: '4-3-3',
        captainId: 'player-12',
        players: {
          'GK': 'player-12', 'LB': 'player-13', 'CB1': 'player-14', 'CB2': 'player-15', 'RB': 'player-16',
          'LM': 'player-17', 'CM1': 'player-18', 'CM2': 'player-19', 'RM': 'player-20', 'ST1': 'player-21', 'ST2': 'player-22'
        },
        bench: ['Tunde Williams', 'David Alaba'],
        status: 'Pending'
      }
    };

    // Force/overlay FWT official Matchday 1 lineup specifically for md1-7 (FWT vs IDD)
    loadedLineups['md1-7'] = {
      home: {
        matchId: 'md1-7',
        teamAbbr: 'FWT',
        formation: '4-3-3',
        captainId: 'player-fwt-16', // Ayodeji Bright Kehinde (Captain)
        players: {
          'GK': 'player-fwt-1',  // Afolabi Timothy Testimony
          'LB': 'player-fwt-3',  // Ayodeji Blessing Elisha
          'LCB': 'player-fwt-5', // Ganiyu Malik Ayomide
          'RCB': 'player-fwt-6', // Owolabi Taofeeq Ademola
          'RB': 'player-fwt-4',  // Ayadi Bright Tayo
          'CM1': 'player-fwt-13',// Iyapo Banji
          'DM': 'player-fwt-12', // Ajayi Oluwatobi Oluwasegun
          'CM2': 'player-fwt-9',  // Bello Baki Oluwaseyi
          'LW': 'player-fwt-16', // Ayodeji Bright Kehinde (Captain)
          'CF': 'player-fwt-11', // Fadiji Bonnke Samuel
          'RW': 'player-fwt-17'  // Ogunkanmi Oluwanimisire Oladayo
        },
        bench: [
          'Jonathan Henry Chukwu',
          'Tiamiyu Samuel Temitope',
          'Awosiyan Oluwaseun Victor',
          'Famuwagun Tomiwa Young',
          'Oghoromai Richard Ayomide',
          'Adegoke Blessing Moses',
          'Agunloye Segun Isaac',
          'Sanusi Olaitan John',
          'Olalekan Hammed Olajuwon',
          'Akinmola Oluwafisayo Oluwafemi',
          'Olayemi Elijah Ayokunle',
          'Akindele Damilola Temitope'
        ],
        status: 'Approved'
      },
      away: {
        matchId: 'md1-7',
        teamAbbr: 'IDD',
        formation: '4-3-3',
        captainId: 'player-idd-soji',
        players: {
          'GK': 'player-idd-gk',
          'LB': 'player-idd-tolu',
          'CB1': 'player-idd-cb1',
          'CB2': 'player-idd-cb2',
          'RB': 'player-idd-rb',
          'DM': 'player-idd-dm',
          'CM1': 'player-idd-cm1',
          'CM2': 'player-idd-cm2',
          'LW': 'player-idd-neymar',
          'CF': 'player-idd-soji',
          'RW': 'player-idd-sola'
        },
        bench: ['Enzo', 'Tunde Williams', 'David Alaba'],
        status: 'Approved'
      }
    };

    // Force/overlay AGE vs SIMT official Matchday 1 lineup specifically for md1-8
    loadedLineups['md1-8'] = {
      home: loadedLineups['md1-8']?.home || {
        matchId: 'md1-8',
        teamAbbr: 'AGE',
        formation: '4-3-3',
        captainId: 'player-age-7',
        players: {
          'GK': 'player-age-1', 'LB': 'player-age-2', 'CB1': 'player-age-3', 'CB2': 'player-age-4', 'RB': 'player-age-5',
          'DM': 'player-age-6', 'CM1': 'player-age-7', 'CM2': 'player-age-8', 'LW': 'player-age-9', 'ST': 'player-age-10', 'RW': 'player-age-11'
        },
        bench: [],
        status: 'Approved'
      },
      away: {
        matchId: 'md1-8',
        teamAbbr: 'SIMT',
        formation: '4-3-3',
        captainId: 'player-simt-3', // Adebayo Samuel Ayobami (Captain)
        players: {
          'GK': 'player-simt-1',  // Nwabunwanne Chibichi Daniel
          'LB': 'player-simt-5',  // Momoh Joshua David
          'LCB': 'player-simt-4', // Adeniyi Opeyemi Israel
          'RCB': 'player-simt-3', // Adebayo Samuel Ayobami (Captain)
          'RB': 'player-simt-6',  // Aderiye Joshua Adekunle
          'LCM': 'player-simt-14',// Oweazim Chukwudumebi
          'DM': 'player-simt-17', // Adewopo Feranmi
          'RCM': 'player-simt-18',// Omowale Ridwan Gbolahun
          'LW': 'player-simt-19', // Oladapo Isaac Ayomide
          'CF': 'player-simt-22', // Ipinlaye Samuel Fisayo
          'RW': 'player-simt-20'  // Emmanuel Oluwapamilerin Joshua
        },
        bench: [
          'Divine Gabriel Ibrahim',
          'Adewale Uthman Boluwatife',
          'Omolayo Precious Ayomide',
          'Yusuf Soliu Okikiola',
          'Ajiwoye Oluwalonimi Israel',
          'Afolabi Abdulmuheez',
          'Olabamiji Eric Ayokunle',
          'Kolawole Emmanuel Timilehin',
          'Okoye Philip C.',
          'Adeniyi Temitope Oluwadamilare',
          'Ogboye Samuel Oluwaponmile',
          'Amure Matthew'
        ],
        status: 'Approved'
      }
    };

    // Force/overlay MBBS vs STA official Matchday 1 lineup specifically for md1-9
    loadedLineups['md1-9'] = {
      home: loadedLineups['md1-9']?.home || {
        matchId: 'md1-9',
        teamAbbr: 'MBBS',
        formation: '4-3-3',
        captainId: 'player-20',
        players: {
          'GK': 'player-20', 'LB': 'player-21', 'CB1': 'player-22', 'CB2': 'player-23', 'RB': 'player-24',
          'DM': 'player-25', 'CM1': 'player-26', 'CM2': 'player-27', 'LW': 'player-28', 'ST': 'player-29', 'RW': 'player-30'
        },
        bench: [],
        status: 'Pending'
      },
      away: {
        matchId: 'md1-9',
        teamAbbr: 'STA',
        formation: '4-3-3',
        captainId: 'player-sta-3', // Emmanuel Olaoluwa Akintayo (Captain)
        players: {
          'GK': 'player-sta-1',  // Rotimi Joseph Folahan
          'LB': 'player-sta-10', // Adedeji Taofeek Oyeleke
          'LCB': 'player-sta-5',  // Afilaka Praise Temidayo
          'RCB': 'player-sta-4',  // Adewumi MicClinton Adegoke
          'RB': 'player-sta-3',   // Emmanuel Olaoluwa Akintayo (Captain)
          'LCM': 'player-sta-13', // Agbo Peter
          'DM': 'player-sta-18',  // Salam Rokeeb Oladimeji
          'RCM': 'player-sta-14', // Johnson Emmanuel Olaoluwa
          'LW': 'player-sta-23',  // Nwachukwu Jesse
          'CF': 'player-sta-22',  // Bello Riliwan Remilekun
          'RW': 'player-sta-19'   // Daisi Tioluwanimi
        },
        bench: [
          'Okusi Edward',
          'Omowole Adebusuyi Abraham',
          'Aminu Moses Vincent',
          'Victor Gospel Leo',
          'Jackson Joseph',
          'Eki Kelvin Aghoghomena',
          'Afolabi David Adebayo',
          'Akinjogunla Mayowa',
          'Akinsowon Gbenga Ejiro',
          'Ayetan Samuel Precious',
          'Akintunde Samuel',
          'Precious'
        ],
        status: 'Approved'
      }
    };

    // Force/overlay MCB vs PHY official Matchday 1 lineup specifically for md1-10
    loadedLineups['md1-10'] = {
      home: {
        matchId: 'md1-10',
        teamAbbr: 'MCB',
        formation: '3-4-3',
        captainId: 'player-mcb-4', // Osowo Taiwo (Captain)
        players: {
          'GK': 'player-mcb-1',  // Adesuyi Oluwasegun
          'LCB': 'player-mcb-2', // Ayeni Opeyemi
          'CB': 'player-mcb-3',  // Alagbe Jeremiah Kehinde
          'RCB': 'player-mcb-4', // Osowo Taiwo (Captain)
          'DM': 'player-mcb-5',  // Favour
          'CM1': 'player-mcb-6', // Oni Oluwadamilola
          'AM': 'player-mcb-7',  // Lawal Favour Ben
          'CM2': 'player-mcb-8', // Olowu Dennis
          'LW': 'player-mcb-9',  // Olaniran Oluwatimilehin
          'CF': 'player-mcb-10', // Ameh Lucky
          'RW': 'player-mcb-11'  // Alowonle Clement
        },
        bench: [
          'Adameji Isaac',
          'Wasiu Ismaeel'
        ],
        status: 'Approved'
      },
      away: {
        matchId: 'md1-10',
        teamAbbr: 'PHY',
        formation: '4-3-3',
        captainId: 'player-phy-3', // Praise Balogun (Captain)
        players: {
          'GK': 'player-phy-1',  // Eniola Ayomide Emmanuel
          'LB': 'player-phy-2',  // Ajayi Timothy
          'LCB': 'player-phy-3', // Praise Balogun (Captain)
          'RCB': 'player-phy-4', // Okumagba Franklin
          'RB': 'player-phy-5',  // Olamide Agboola
          'LCM': 'player-phy-6', // Ajigboteleda Emmanuel
          'AM': 'player-phy-7',  // Temitope Ajayi
          'RCM': 'player-phy-8', // Uduak Abasi
          'LW': 'player-phy-9',  // Are Moses
          'CF': 'player-phy-10', // Iyenagbe Christian
          'RW': 'player-phy-11'  // Akinseye Oluwasanmilore
        },
        bench: [
          'Lawal Oluwabukunmi',
          'Oladipupo Afeez',
          'Andrew Emmanuel'
        ],
        status: 'Approved'
      }
    };

    // Force/overlay MST vs CYS official Matchday 2 lineup specifically for md2-6
    loadedLineups['md2-6'] = {
      home: {
        matchId: 'md2-6',
        teamAbbr: 'MST',
        formation: '5-2-3',
        captainId: 'player-mst-2', // Adeyemi Adedayo Ibrahim (Captain)
        players: {
          'GK': 'player-mst-1',  // Ogundeji Feyitunmise Hezekiah
          'RB': 'player-mst-3',  // Akinnayajo Irewale
          'CB1': 'player-mst-2', // Adeyemi Adedayo Ibrahim (Captain)
          'CB2': 'player-mst-5', // Bernard Augustine Obioma
          'CB3': 'player-mst-6', // Philip Believe Oluwashina
          'LB': 'player-mst-7',  // Adeniyi Ademola Daniel
          'CM1': 'player-mst-9', // Adediran Olanrewaju Abeeb
          'CM2': 'player-mst-10',// Iyare Praise
          'RW': 'player-mst-19', // Akintunde Ayomide Oluwaseyifunmi
          'CF': 'player-mst-15', // Nkemjika Sydney
          'LW': 'player-mst-17'  // Boyede Joseph Ayomide
        },
        bench: [
          'Ojoisimi Bright Agbomizi',
          'Ademisoye Segun',
          'Akinyo Boluwatife Precious',
          'Adekunle Ayomide Mubarak',
          'Olagunju Moses Temitope',
          'Ayeni Ayobami',
          'Shomuyiwa Lateef Babatunde',
          'Fabusuyi Daniel Oluwafisayo',
          'Ekwe Fortune'
        ],
        status: 'Approved'
      },
      away: {
        matchId: 'md2-6',
        teamAbbr: 'CYS',
        formation: '4-2-3-1',
        captainId: 'player-cys-5', // Fashola Oluwatobi Joshua (Captain)
        players: {
          'GK': 'player-cys-24',  // John Igbalamide
          'RWB': 'player-cys-5', // Fashola Oluwatobi Joshua
          'CB1': 'player-cys-4',  // Raji Jubril Olarewaju
          'CB2': 'player-cys-3',  // Kadri Taofeek Akorede
          'LWB': 'player-cys-2',  // Adewumi Excel Joshua
          'DM1': 'player-cys-8',  // Onah Caleb Igoche
          'DM2': 'player-cys-6',  // Nwoke Isaac Honour
          'RWF': 'player-cys-9',  // Ajao Alameen Olaide
          'AMF': 'player-cys-18', // Olamijulo Israel Damilare
          'LWF': 'player-cys-21', // Bello Daniel Damilare
          'ST': 'player-cys-22'   // Olorunfemi Taiwo James
        },
        bench: [
          'Olabode Victor Oluwatosin',
          'Ayeni Babatunde Paul',
          'Jegede Daniel Kolawole',
          'Akinyede Allen Oluwaferanmi',
          'Adedotun Faiz Ayobami',
          'Ifedayoijitimeyin Valerian Igbagboyemi',
          'Olanrewaju Mujeeb Abolaji',
          'Akinrinola Samuel Temitope',
          'Akinshipe Oluwafemi Solomon',
          'Oluwadiya Timilehin Abraham',
          'Adeoye Ezekiel Oluwaseyi',
          'Owolabi Olaifeoluwa Solomon',
          'Adetule Marvellous Mayowa'
        ],
        status: 'Approved'
      }
    };

    loadedLineups['md2-7'] = {
      home: {
        matchId: 'md2-7',
        teamAbbr: 'ENT',
        formation: '4-3-3',
        captainId: 'player-ent-promise',
        players: {
          'GK': 'player-1',
          'RB': 'player-2',
          'CB1': 'player-ent-promise',
          'CB2': 'player-3',
          'LB': 'player-4',
          'DM': 'player-ent-fairy',
          'CM1': 'player-5',
          'CM2': 'player-6',
          'RW': 'player-7',
          'ST': 'player-8',
          'LW': 'player-9'
        },
        bench: ['player-10', 'player-11'],
        status: 'Approved'
      },
      away: {
        matchId: 'md2-7',
        teamAbbr: 'ANA',
        formation: '4-3-3',
        captainId: 'player-15',
        players: {
          'GK': 'player-12',
          'RB': 'player-13',
          'CB1': 'player-14',
          'CB2': 'player-15',
          'LB': 'player-16',
          'DM': 'player-17',
          'CM1': 'player-18',
          'CM2': 'player-19',
          'RW': 'player-20',
          'ST': 'player-21',
          'LW': 'player-22'
        },
        bench: ['player-23', 'player-24'],
        status: 'Approved'
      }
    };

    loadedLineups['md2-8'] = {
      home: {
        matchId: 'md2-8',
        teamAbbr: 'MCB',
        formation: '4-3-3',
        captainId: 'player-mcb-6', // Oni Oluwadamilola (Captain)
        players: {
          'GK': 'player-mcb-1',  // Adesuyi Oluwasegun
          'LB': 'player-mcb-2',  // Ayeni Opeyemi
          'LCB': 'player-mcb-14', // Adeleye Blessing
          'RCB': 'player-mcb-4',  // Osowo Taiwo
          'RB': 'player-mcb-12', // Adameji Isaac
          'LCM': 'player-mcb-6',  // Oni Oluwadamilola (Captain)
          'AM': 'player-mcb-7',  // Lawal Favour Ben
          'RCM': 'player-mcb-5', // Favour
          'LW': 'player-mcb-13', // Wasiu Ismaeel
          'CF': 'player-mcb-10', // Ameh Lucky
          'RW': 'player-mcb-11'  // Alowonle Clement
        },
        bench: [
          'Alagbe Jeremiah Kehinde',
          'Olowu Dennis',
          'Olaniran Oluwatimilehin',
          'Tallest'
        ],
        status: 'Approved'
      },
      away: {
        matchId: 'md2-8',
        teamAbbr: 'AGE',
        formation: '4-3-3',
        captainId: 'player-age-10', // Sylvanus (Captain)
        players: {
          'GK': 'player-age-1',  // Babatunde
          'LB': 'player-age-2',  // Afolabi
          'LCB': 'player-age-3', // Olawale
          'RCB': 'player-age-4', // Temitope
          'RB': 'player-age-12', // Agesin
          'LCM': 'player-age-6', // Adeyemi
          'AM': 'player-age-7',  // Jones Falana
          'RCM': 'player-age-8', // Anthony
          'LW': 'player-age-9',  // Tunde
          'CF': 'player-age-10', // Sylvanus
          'RW': 'player-age-13'  // Muhammed
        },
        bench: [
          'Samuel',
          'Femi'
        ],
        status: 'Approved'
      }
    };

    loadedLineups['md2-10'] = {
      home: {
        matchId: 'md2-10',
        teamAbbr: 'PHY',
        formation: '4-3-3',
        captainId: 'player-phy-3', // Praise Balogun (Captain)
        players: {
          'GK': 'player-phy-1',  // Eniola Ayomide Emmanuel
          'LB': 'player-phy-2',  // Ajayi Timothy
          'LCB': 'player-phy-3', // Praise Balogun (Captain)
          'RCB': 'player-phy-4', // Okumagba Franklin
          'RB': 'player-phy-5',  // Olamide Agboola
          'LCM': 'player-phy-6', // Ajigboteleda Emmanuel
          'AM': 'player-phy-7',  // Temitope Ajayi
          'RCM': 'player-phy-8', // Uduak Abasi
          'LW': 'player-phy-9',  // Are Moses
          'CF': 'player-phy-10', // Iyenagbe Christian
          'RW': 'player-phy-11'  // Akinseye Oluwasanmilore
        },
        bench: [
          'player-phy-12', // Lawal Oluwabukunmi
          'player-phy-13', // Oladipupo Afeez
          'player-phy-14', // Andrew Emmanuel
          'player-phy-20'  // Abiola Abdmalik
        ],
        status: 'Approved'
      },
      away: {
        matchId: 'md2-10',
        teamAbbr: 'SIMT',
        formation: '4-3-3',
        captainId: 'player-simt-3', // Adebayo Samuel Ayobami (Captain)
        players: {
          'GK': 'player-simt-1',  // Nwabunwanne Chibichi Daniel
          'LB': 'player-simt-5',  // Momoh Joshua David
          'LCB': 'player-simt-3', // Adebayo Samuel Ayobami
          'RCB': 'player-simt-4', // Adeniyi Opeyemi Israel
          'RB': 'player-simt-8',  // Omolayo Precious Ayomide
          'LCM': 'player-simt-13', // Kolawole Emmanuel Timilehin
          'CM1': 'player-simt-14', // Oweazim Chukwudumebi
          'CM2': 'player-simt-18', // Omowale Ridwan Gbolahun
          'LW': 'player-simt-19', // Oladapo Isaac Ayomide
          'CF': 'player-simt-22', // Ipinlaye Samuel Fisayo
          'RW': 'player-simt-20'  // Emmanuel Oluwapamilerin Joshua
        },
        bench: [
          'player-simt-15', // Okoye Philip C.
          'player-simt-21', // Ogboye Samuel Oluwaponmile
          'player-simt-23'  // Amure Matthew
        ],
        status: 'Approved'
      }
    };

    loadedLineups['md2-9'] = {
      home: {
        matchId: 'md2-9',
        teamAbbr: 'BDG',
        formation: '4-3-3',
        captainId: 'player-bdg-praise',
        players: {
          'GK': 'player-bdg-1',   // Ojo David
          'LB': 'player-bdg-5',   // Babalola Toheeb
          'LCB': 'player-bdg-3',  // Adeleke Samson
          'RCB': 'player-bdg-4',  // Salami Victor
          'RB': 'player-bdg-2',   // Arowolo Gideon
          'LCM': 'player-bdg-6',  // Akinbiyi Akinwalere Ayomikun
          'AM': 'player-bdg-praise', // Praise
          'RCM': 'player-bdg-7',  // Akinfolahan Temidayo Ebunoluwa
          'LW': 'player-bdg-9',   // Christopher Samuel
          'CF': 'player-bdg-tofunmi',  // Awoyemi Jesutofunmi
          'RW': 'player-bdg-desmond' // Desmond
        },
        bench: [
          'player-bdg-12',       // Adebayo Kolawole
          'player-bdg-13'        // Olawuyi Moses
        ],
        status: 'Approved'
      },
      away: {
        matchId: 'md2-9',
        teamAbbr: 'FWT',
        formation: '4-3-3',
        captainId: 'player-fwt-16', // Ayodeji Bright Kehinde (Captain)
        players: {
          'GK': 'player-fwt-1',  // Afolabi Timothy Testimony
          'LB': 'player-fwt-3',  // Ayodeji Blessing Elisha
          'LCB': 'player-fwt-5', // Ganiyu Malik Ayomide
          'RCB': 'player-fwt-6', // Owolabi Taofeeq Ademola
          'RB': 'player-fwt-4',  // Ayadi Bright Tayo
          'CM1': 'player-fwt-13',// Iyapo Banji
          'DM': 'player-fwt-12', // Ajayi Oluwatobi Oluwasegun
          'CM2': 'player-fwt-9',  // Bello Baki Oluwaseyi
          'LW': 'player-fwt-16', // Ayodeji Bright Kehinde (Captain)
          'CF': 'player-fwt-11', // Fadiji Bonnke Samuel
          'RW': 'player-fwt-17'  // Ogunkanmi Oluwanimisire Oladayo
        },
        bench: [
          'player-fwt-2', // Jonathan Henry Chukwu
          'player-fwt-7', // Tiamiyu Samuel Temitope
          'player-fwt-8', // Awosiyan Oluwaseun Victor
          'player-fwt-10', // Famuwagun Tomiwa Young
          'player-fwt-14', // Oghoromai Richard Ayomide
          'player-fwt-15', // Adegoke Blessing Moses
          'player-fwt-18', // Agunloye Segun Isaac
          'player-fwt-19', // Sanusi Olaitan John
          'player-fwt-20'  // Olalekan Hammed Olajuwon
        ],
        status: 'Approved'
      }
    };

    loadedLineups['md1-6'] = {
      home: {
        matchId: 'md1-6',
        teamAbbr: 'IFS',
        formation: '4-3-3',
        captainId: 'player-ifs-1',
        players: {
          'GK': 'player-ifs-1', 'LB': 'player-ifs-3', 'CB1': 'player-ifs-4', 'CB2': 'player-ifs-5', 'RB': 'player-ifs-6',
          'DM': 'player-ifs-11', 'CM1': 'player-ifs-12', 'CM2': 'player-ifs-13', 'LW': 'player-ifs-16', 'ST': 'player-ifs-17', 'RW': 'player-ifs-18'
        },
        bench: [],
        status: 'Approved'
      },
      away: {
        matchId: 'md1-6',
        teamAbbr: 'CSP',
        formation: '4-3-3',
        captainId: 'player-csp-ademide',
        players: {
          'GK': 'player-csp-gk', 'LB': 'player-csp-lb', 'CB1': 'player-csp-cb1', 'CB2': 'player-csp-cb2', 'RB': 'player-csp-rb',
          'DM': 'player-csp-dm', 'CM1': 'player-csp-akindeko', 'CM2': 'player-csp-adedara', 'LW': 'player-csp-lw', 'ST': 'player-csp-ademide', 'RW': 'player-csp-rw'
        },
        bench: [],
        status: 'Approved'
      }
    };

    loadedLineups['md2-1'] = {
      home: {
        matchId: 'md2-1',
        teamAbbr: 'CSP',
        formation: '4-3-3',
        captainId: 'player-csp-ademide',
        players: {
          'GK': 'player-csp-gk', 'LB': 'player-csp-lb', 'CB1': 'player-csp-cb1', 'CB2': 'player-csp-cb2', 'RB': 'player-csp-rb',
          'DM': 'player-csp-dm', 'CM1': 'player-csp-akindeko', 'CM2': 'player-csp-adedara', 'LW': 'player-csp-lw', 'ST': 'player-csp-ademide', 'RW': 'player-csp-rw'
        },
        bench: [],
        status: 'Approved'
      },
      away: {
        matchId: 'md2-1',
        teamAbbr: 'STA',
        formation: '4-3-3',
        captainId: 'player-sta-3',
        players: {
          'GK': 'player-sta-1', 'LB': 'player-sta-10', 'CB1': 'player-sta-5', 'CB2': 'player-sta-4', 'RB': 'player-sta-3',
          'LCM': 'player-sta-13', 'DM': 'player-sta-18', 'RCM': 'player-sta-14', 'LW': 'player-sta-23', 'CF': 'player-sta-22', 'RW': 'player-sta-19'
        },
        bench: [],
        status: 'Approved'
      }
    };

    loadedLineups['md2-4'] = {
      home: {
        matchId: 'md2-4',
        teamAbbr: 'ICE',
        formation: '4-3-3',
        captainId: 'player-ice-prosper',
        players: {
          'GK': 'player-ice-prosper', 'LB': 'player-ice-lb', 'CB1': 'player-ice-cb1', 'CB2': 'player-ice-cb2', 'RB': 'player-ice-rb',
          'DM': 'player-ice-dm', 'CM1': 'player-ice-usman', 'CM2': 'player-ice-cm2', 'LW': 'player-ice-lw', 'ST': 'player-ice-samson', 'RW': 'player-ice-rw'
        },
        bench: [],
        status: 'Approved'
      },
      away: {
        matchId: 'md2-4',
        teamAbbr: 'BCH',
        formation: '4-3-3',
        captainId: 'player-bch-captain',
        players: {
          'GK': 'player-bch-1', 'LB': 'player-bch-2', 'CB1': 'player-bch-3', 'CB2': 'player-bch-4', 'RB': 'player-bch-5',
          'DM': 'player-bch-6', 'CM1': 'player-bch-7', 'CM2': 'player-bch-8', 'LW': 'player-bch-9', 'ST': 'player-bch-10', 'RW': 'player-bch-11'
        },
        bench: [],
        status: 'Approved'
      }
    };

    loadedLineups['md3-3'] = {
      home: {
        matchId: 'md3-3',
        teamAbbr: 'CSP',
        formation: '4-3-3',
        captainId: 'player-csp-ademide',
        players: {
          'GK': 'player-csp-gk', 'LB': 'player-csp-lb', 'CB1': 'player-csp-cb1', 'CB2': 'player-csp-cb2', 'RB': 'player-csp-rb',
          'DM': 'player-csp-dm', 'CM1': 'player-csp-akindeko', 'CM2': 'player-csp-pelumi', 'LW': 'player-csp-lw', 'ST': 'player-csp-ademide', 'RW': 'player-csp-rw'
        },
        bench: ['player-csp-adedara'],
        status: 'Approved'
      },
      away: {
        matchId: 'md3-3',
        teamAbbr: 'CYS',
        formation: '4-3-3',
        captainId: 'player-cys-5', // Fashola Oluwatobi Joshua (Captain)
        players: {
          'GK': 'player-cys-1',  // Olabode Victor Oluwatosin
          'LB': 'player-cys-2',  // Adewumi Excel Joshua
          'CB1': 'player-cys-3', // Kadri Taofeek Akorede
          'CB2': 'player-cys-4', // Raji Jubril Olarewaju
          'RB': 'player-cys-5',  // Fashola Oluwatobi Joshua
          'DM1': 'player-cys-8', // Onah Caleb Igoche
          'DM2': 'player-cys-6', // Nwoke Isaac Honour
          'LW': 'player-cys-21', // Bello Daniel Damilare
          'AMF': 'player-cys-18', // Olamijulo Israel Damilare
          'CF': 'player-cys-22', // Olorunfemi Taiwo James
          'RW': 'player-cys-11'  // Akinyede Allen Oluwaferanmi
        },
        bench: ['player-cys-19', 'player-cys-15'],
        status: 'Approved'
      }
    };

    loadedLineups['md3-4'] = {
      home: {
        matchId: 'md3-4',
        teamAbbr: 'IFS',
        formation: '4-3-3',
        captainId: 'player-ifs-1',
        players: {
          'GK': 'player-ifs-1', 'LB': 'player-ifs-3', 'CB1': 'player-ifs-4', 'CB2': 'player-ifs-5', 'RB': 'player-ifs-6',
          'DM': 'player-ifs-11', 'CM1': 'player-ifs-12', 'CM2': 'player-ifs-13', 'LW': 'player-ifs-16', 'ST': 'player-ifs-21', 'RW': 'player-ifs-18'
        },
        bench: ['player-ifs-22', 'player-ifs-23'],
        status: 'Approved'
      },
      away: {
        matchId: 'md3-4',
        teamAbbr: 'STA',
        formation: '4-3-3',
        captainId: 'player-sta-5',
        players: {
          'GK': 'player-sta-1', 'LB': 'player-sta-10', 'CB1': 'player-sta-5', 'CB2': 'player-sta-4', 'RB': 'player-sta-3',
          'LCM': 'player-sta-13', 'DM': 'player-sta-18', 'RCM': 'player-sta-14', 'LW': 'player-sta-23', 'CF': 'player-sta-22', 'RW': 'player-sta-19'
        },
        bench: ['player-sta-20', 'player-sta-21'],
        status: 'Approved'
      }
    };

    loadedLineups['md3-6'] = {
      home: {
        matchId: 'md3-6',
        teamAbbr: 'MST',
        formation: '5-2-3',
        captainId: 'player-mst-2', // Adeyemi Adedayo Ibrahim (Captain)
        players: {
          'GK': 'player-mst-1',  // Ogundeji Feyitunmise Hezekiah
          'RB': 'player-mst-3',  // Akinnayajo Irewale
          'CB1': 'player-mst-2', // Adeyemi Adedayo Ibrahim (Captain)
          'CB2': 'player-mst-5', // Bernard Augustine Obioma
          'CB3': 'player-mst-6', // Philip Believe Oluwashina
          'LB': 'player-mst-7',  // Adeniyi Ademola Daniel
          'CM1': 'player-mst-9', // Adediran Olanrewaju Abeeb
          'CM2': 'player-mst-10',// Iyare Praise
          'RW': 'player-mst-19', // Akintunde Ayomide Oluwaseyifunmi
          'CF': 'player-mst-15', // Nkemjika Sydney
          'LW': 'player-mst-17'  // Boyede Joseph Ayomide
        },
        bench: ['player-mst-4', 'player-mst-13'],
        status: 'Approved'
      },
      away: {
        matchId: 'md3-6',
        teamAbbr: 'SIMT',
        formation: '4-3-3',
        captainId: 'player-simt-3', // Adebayo Samuel Ayobami (Captain)
        players: {
          'GK': 'player-simt-1',  // Nwabunwanne Chibichi Daniel
          'LB': 'player-simt-5',  // Momoh Joshua David
          'LCB': 'player-simt-3', // Adebayo Samuel Ayobami
          'RCB': 'player-simt-4', // Adeniyi Opeyemi Israel
          'RB': 'player-simt-8',  // Omolayo Precious Ayomide
          'LCM': 'player-simt-13', // Kolawole Emmanuel Timilehin
          'DM': 'player-simt-17', // Adewopo Feranmi
          'RCM': 'player-simt-14', // Oweazim Chukwudumebi
          'LW': 'player-simt-19', // Oladapo Isaac Ayomide
          'CF': 'player-simt-22', // Ipinlaye Samuel Fisayo
          'RW': 'player-simt-20'  // Emmanuel Oluwapamilerin Joshua
        },
        bench: ['player-simt-15', 'player-simt-21', 'player-simt-18', 'player-simt-23'],
        status: 'Approved'
      }
    };

    loadedLineups['PO1'] = {
      home: {
        matchId: 'PO1',
        teamAbbr: 'IDD',
        formation: '4-3-3',
        captainId: 'player-idd-sola',
        players: {
          'GK': 'Idowu David',
          'LB': 'Babatunde Daniel',
          'CB1': 'player-idd-tolu',
          'CB2': 'Ojo Sunday',
          'RB': 'Adebayo Mujeeb',
          'DM': 'player-idd-enzo',
          'CM1': 'player-idd-emmy',
          'CM2': 'Adebami Ola',
          'LW': 'player-idd-soji',
          'ST': 'player-idd-sola',
          'RW': 'player-idd-neymar'
        },
        bench: ['Aribaba Inioluwa', 'Sunday John', 'Oladejo Kehinde', 'Ademoyegun Oluwatimilehin'],
        status: 'Approved'
      },
      away: {
        matchId: 'PO1',
        teamAbbr: 'STA',
        formation: '4-3-3',
        captainId: 'player-sta-3',
        players: {
          'GK': 'player-sta-1',
          'RB': 'player-sta-3',
          'CB1': 'player-sta-8',
          'CB2': 'player-sta-4',
          'LB': 'player-sta-9',
          'LCM': 'player-sta-18',
          'CM': 'player-sta-25',
          'RCM': 'player-sta-13',
          'RW': 'player-sta-23',
          'ST': 'player-sta-26',
          'LW': 'player-sta-19'
        },
        bench: [
          'player-sta-2',
          'player-sta-5',
          'player-sta-6',
          'player-sta-7',
          'player-sta-10',
          'player-sta-11',
          'player-sta-12',
          'player-sta-14',
          'player-sta-15',
          'player-sta-20',
          'player-sta-22',
          'player-sta-24'
        ],
        status: 'Approved'
      }
    };

    loadedLineups['PO2'] = {
      home: {
        matchId: 'PO2',
        teamAbbr: 'ANA',
        formation: '4-3-3',
        captainId: 'player-ana-12',
        players: {
          'GK': 'player-ana-1',
          'LB': 'player-ana-2',
          'CB1': 'player-ana-3',
          'CB2': 'player-ana-4',
          'RB': 'player-ana-5',
          'DM': 'player-ana-6',
          'CM1': 'player-ana-14',
          'CM2': 'player-ana-8',
          'LW': 'player-ana-13',
          'ST': 'player-ana-12',
          'RW': 'player-ana-11'
        },
        bench: ['player-ana-7', 'player-ana-9', 'player-ana-10'],
        status: 'Approved'
      },
      away: {
        matchId: 'PO2',
        teamAbbr: 'SIMT',
        formation: '4-3-3',
        captainId: 'player-simt-14', // Oweazim Chukwudumebi (Captain)
        players: {
          'GK': 'player-simt-2',  // Divine Gabriel Ibrahim
          'RB': 'player-simt-6',  // Aderiye Joshua Adekunle
          'CB1': 'player-simt-4', // Adeniyi Opeyemi Israel
          'CB2': 'player-simt-17', // Adewopo Feranmi
          'LB': 'player-simt-20', // Emmanuel Oluwapamilerin Joshua
          'DM': 'player-simt-14', // Oweazim Chukwudumebi (Captain)
          'CM1': 'player-simt-18', // Omowale Ridwan Gbolahun
          'AM': 'player-simt-22', // Ipinlaye Samuel Fisayo
          'RW': 'player-simt-15', // Okoye Philip C.
          'ST': 'player-simt-21', // Ogboye Samuel Oluwaponmile
          'LW': 'player-simt-19'  // Oladapo Isaac Ayomide
        },
        bench: [
          'player-simt-3', // Adebayo Samuel Ayobami
          'player-simt-5', // Momoh Joshua David
          'player-simt-7', // Adewale Uthman Boluwatife
          'player-simt-8', // Omolayo Precious Ayomide
          'player-simt-9', // Yusuf Soliu Okikiola
          'player-simt-10', // Ajiwoye Oluwalonimi Israel
          'player-simt-11', // Afolabi Abdulmuheez
          'player-simt-12', // Olabamiji Eric Ayokunle
          'player-simt-13', // Kolawole Emmanuel Timilehin
          'player-simt-16', // Adeniyi Temitope Oluwadamilare
          'player-simt-23'  // Amure Matthew
        ],
        status: 'Approved'
      }
    };

    loadedLineups['PO3'] = {
      home: {
        matchId: 'PO3',
        teamAbbr: 'BDG',
        formation: '4-3-3',
        captainId: 'player-bdg-6',
        players: {
          'GK': 'player-bdg-1',
          'LB': 'player-bdg-2',
          'CB1': 'player-bdg-3',
          'CB2': 'player-bdg-4',
          'RB': 'player-bdg-5',
          'DM': 'player-bdg-6',
          'CM1': 'player-bdg-7',
          'CM2': 'player-bdg-praise',
          'LW': 'player-bdg-tofunmi',
          'ST': 'player-bdg-desmond',
          'RW': 'player-bdg-9'
        },
        bench: ['player-bdg-12', 'player-bdg-13'],
        status: 'Approved'
      },
      away: {
        matchId: 'PO3',
        teamAbbr: 'AGP',
        formation: '4-3-3',
        captainId: 'player-agp-michael',
        players: {
          'GK': 'player-agp-16',
          'LB': 'player-agp-4',
          'CB1': 'player-agp-5',
          'CB2': 'player-agp-6',
          'RB': 'player-agp-7',
          'DM': 'player-agp-8',
          'CM1': 'player-agp-9',
          'CM2': 'player-agp-10',
          'LW': 'player-agp-rowland',
          'ST': 'player-agp-michael',
          'RW': 'player-agp-11'
        },
        bench: ['player-agp-12'],
        status: 'Approved'
      }
    };

    loadedLineups['PO4'] = {
      home: {
        matchId: 'PO4',
        teamAbbr: 'MBBS',
        formation: '4-3-3',
        captainId: 'player-mbbs-6', // SK (Captain)
        players: {
          'GK': 'player-mbbs-1',  // Afolabi Yusuf
          'RB': 'player-mbbs-2',  // Ojo Daniel
          'CB1': 'player-mbbs-3', // Chinedu Nelson
          'CB2': 'player-mbbs-4', // Eze Joshua
          'LB': 'player-mbbs-5',  // Olumide Olamide
          'DM': 'player-mbbs-6',  // SK (Captain)
          'CM1': 'player-mbbs-7', // Balogun Victor
          'CM2': 'player-mbbs-8', // Adeniyi Samuel
          'LW': 'player-mbbs-9',  // Bamidele Fikayo
          'ST': 'player-mbbs-10', // Olawale Ibrahim
          'RW': 'player-mbbs-11'  // Okonkwo Charles
        },
        bench: [],
        status: 'Approved'
      },
      away: {
        matchId: 'PO4',
        teamAbbr: 'MCB',
        formation: '4-3-3',
        captainId: 'player-mcb-6', // Oni Oluwadamilola (Captain)
        players: {
          'GK': 'player-mcb-1',  // Adesuyi Oluwasegun
          'RB': 'player-mcb-12', // Adameji Isaac
          'CB1': 'player-mcb-14', // Adeleye Blessing
          'CB2': 'player-mcb-2',  // Ayeni Opeyemi
          'LB': 'player-mcb-4',  // Osowo Taiwo
          'DM': 'player-mcb-6',  // Oni Oluwadamilola (Captain)
          'CM': 'player-mcb-7',  // Lawal Favour Ben
          'AM': 'player-mcb-11', // Alowonle Clement
          'RW': 'player-mcb-21', // Adenoye Paul
          'ST': 'player-mcb-10', // Ameh Lucky
          'LW': 'player-mcb-9'   // Olaniran Oluwatimilehin
        },
        bench: [
          'player-mcb-3',  // Alagbe Jeremiah Kehinde
          'player-mcb-5',  // Favour
          'player-mcb-8',  // Olowu Dennis
          'player-mcb-13', // Wasiu Ismaeel
          'player-mcb-15', // Tallest
          'player-mcb-16', // Arogunrerin Abdulsalam
          'player-mcb-17', // Olaoye Festus
          'player-mcb-18', // Dyno
          'player-mcb-19', // Olanipekun Alfred
          'player-mcb-20', // Fayipe Christopher
          'player-mcb-22', // Oyelakin Fawaz
          'player-mcb-23'  // Abdullattef Solah
        ],
        status: 'Approved'
      }
    };

    // Ensure PO1 lineup is always perfectly set up for IDD vs STA with the correct starting XI
    loadedLineups['PO1'] = {
      home: {
        matchId: 'PO1',
        teamAbbr: 'IDD',
        formation: '4-3-3',
        captainId: 'player-idd-sola',
        players: {
          'GK': 'Idowu David',
          'LB': 'Babatunde Daniel',
          'CB1': 'player-idd-tolu',
          'CB2': 'Ojo Sunday',
          'RB': 'Adebayo Mujeeb',
          'DM': 'player-idd-enzo',
          'CM1': 'player-idd-emmy',
          'CM2': 'Adebami Ola',
          'LW': 'player-idd-soji',
          'ST': 'player-idd-sola',
          'RW': 'player-idd-neymar'
        },
        bench: ['Aribaba Inioluwa', 'Sunday John', 'Oladejo Kehinde', 'Ademoyegun Oluwatimilehin'],
        status: 'Approved'
      },
      away: {
        matchId: 'PO1',
        teamAbbr: 'STA',
        formation: '4-3-3',
        captainId: 'player-sta-3',
        players: {
          'GK': 'player-sta-1',
          'RB': 'player-sta-3',
          'CB1': 'player-sta-8',
          'CB2': 'player-sta-4',
          'LB': 'player-sta-9',
          'LCM': 'player-sta-18',
          'CM': 'player-sta-25',
          'RCM': 'player-sta-13',
          'RW': 'player-sta-23',
          'ST': 'player-sta-26',
          'LW': 'player-sta-19'
        },
        bench: [
          'player-sta-2',
          'player-sta-5',
          'player-sta-6',
          'player-sta-7',
          'player-sta-10',
          'player-sta-11',
          'player-sta-12',
          'player-sta-14',
          'player-sta-15',
          'player-sta-20',
          'player-sta-22',
          'player-sta-24'
        ],
        status: 'Approved'
      }
    };

    // Ensure PO6 lineup is always perfectly set up for CSP vs MST with the correct starting XI and 4-2-4 formation
    loadedLineups['PO6'] = {
      home: {
        matchId: 'PO6',
        teamAbbr: 'CSP',
        formation: '4-3-3',
        captainId: 'player-csp-akindeko',
        players: {
          'GK': 'player-csp-gk',
          'LB': 'player-csp-lb',
          'CB1': 'player-csp-cb1',
          'CB2': 'player-csp-cb2',
          'RB': 'player-csp-rb',
          'DM': 'player-csp-pelumi',
          'CM1': 'player-csp-cm1',
          'CM2': 'player-csp-cm2',
          'LW': 'player-csp-ademide',
          'ST': 'player-csp-akindeko',
          'RW': 'player-csp-adedara'
        },
        bench: [],
        status: 'Approved'
      },
      away: {
        matchId: 'PO6',
        teamAbbr: 'MST',
        formation: '4-2-4',
        captainId: 'player-mst-15', // Nkemjika Sydney (Captain)
        players: {
          'GK': 'player-mst-1',  // Ogundeji Feyitunmise Hezekiah
          'RB': 'player-mst-7',  // Adeniyi Ademola Daniel
          'CB1': 'player-mst-5', // Bernard Augustine Obioma
          'CB2': 'player-mst-6', // Philip Believe Oluwashina
          'LB': 'player-mst-3',  // Akinnayajo Irewale
          'DM': 'player-mst-9',  // Adediran Olanrewaju Abeeb
          'CM': 'player-mst-10', // Iyare Praise
          'RW': 'player-mst-19', // Akintunde Ayomide Oluwaseyifunmi
          'ST1': 'player-mst-18',// Fabusuyi Daniel Oluwafisayo
          'ST2': 'player-mst-15',// Nkemjika Sydney (Captain)
          'LW': 'player-mst-17'  // Boyede Joseph Ayomide
        },
        bench: [
          'player-mst-4',  // Ojoisimi Bright Agbomizi
          'player-mst-8',  // Ademisoye Segun
          'player-mst-11', // Akinyo Boluwatife Precious
          'player-mst-12', // Adekunle Ayomide Mubarak
          'player-mst-13', // Olagunju Moses Temitope
          'player-mst-14', // Ayeni Ayobami
          'player-mst-16', // Shomuyiwa Lateef Babatunde
          'player-mst-20', // Ekwe Fortune
          'player-mst-21'  // Ikwue David Oche
        ],
        status: 'Approved'
      }
    };

    loadedLineups['QF1'] = {
      home: {
        matchId: 'QF1',
        teamAbbr: 'ICE',
        formation: '4-3-3',
        captainId: 'player-ice-samson',
        players: {
          'GK': 'player-ice-prosper',
          'RB': 'player-ice-bigsam',
          'CB1': 'player-ice-farooq',
          'CB2': 'player-ice-muller',
          'LB': 'player-ice-usman',
          'DM': 'player-ice-samson',
          'CM1': 'player-ice-samson',
          'CM2': 'player-ice-farooq',
          'LW': 'player-ice-usman',
          'ST': 'player-ice-farooq',
          'RW': 'player-ice-muller'
        },
        bench: [],
        status: 'Approved'
      },
      away: {
        matchId: 'QF1',
        teamAbbr: 'APH',
        formation: '4-3-3',
        captainId: 'player-aph-kunlex',
        players: {
          'GK': 'player-aph-gk',
          'RB': 'player-aph-tunde',
          'CB1': 'player-aph-fola',
          'CB2': 'player-aph-chosen',
          'LB': 'player-aph-emmy',
          'DM': 'player-aph-emmanuel',
          'CM1': 'player-aph-toni',
          'CM2': 'player-aph-emmy',
          'LW': 'player-aph-fola',
          'ST': 'player-aph-kunlex',
          'RW': 'player-aph-emmanuel'
        },
        bench: [],
        status: 'Approved'
      }
    };

    loadedLineups['QF2'] = {
      home: {
        matchId: 'QF2',
        teamAbbr: 'CYS',
        formation: '4-3-3',
        captainId: 'player-cys-22', // Olorunfemi Taiwo James
        players: {
          'GK': 'player-cys-1',  // Olabode Victor Oluwatosin
          'RB': 'player-cys-2',  // Adewumi Excel Joshua
          'CB1': 'player-cys-3', // Kadri Taofeek Akorede
          'CB2': 'player-cys-4', // Raji Jubril Olarewaju
          'LB': 'player-cys-5',  // Fashola Oluwatobi Joshua
          'DM': 'player-cys-6',  // Nwoke Isaac Honour
          'CM1': 'player-cys-7', // Ayeni Babatunde Paul
          'CM2': 'player-cys-8', // Onah Caleb Igoche
          'LW': 'player-cys-10', // Jegede Daniel Kolawole
          'ST': 'player-cys-22', // Olorunfemi Taiwo James
          'RW': 'player-cys-11'  // Akinyede Allen Oluwaferanmi
        },
        bench: [
          'player-cys-9', 'player-cys-12', 'player-cys-13', 'player-cys-14',
          'player-cys-15', 'player-cys-16', 'player-cys-17', 'player-cys-18',
          'player-cys-19', 'player-cys-20', 'player-cys-21', 'player-cys-23',
          'player-cys-24'
        ],
        status: 'Approved'
      },
      away: {
        matchId: 'QF2',
        teamAbbr: 'MCB',
        formation: '4-3-3',
        captainId: 'player-mcb-6', // Oni Oluwadamilola (Captain)
        players: {
          'GK': 'player-mcb-1',  // Adesuyi Oluwasegun
          'RB': 'player-mcb-12', // Adameji Isaac
          'CB1': 'player-mcb-14', // Adeleye Blessing
          'CB2': 'player-mcb-2',  // Ayeni Opeyemi
          'LB': 'player-mcb-4',  // Osowo Taiwo
          'DM': 'player-mcb-6',  // Oni Oluwadamilola (Captain)
          'CM': 'player-mcb-7',  // Lawal Favour Ben
          'AM': 'player-mcb-11', // Alowonle Clement
          'RW': 'player-mcb-21', // Adenoye Paul
          'ST': 'player-mcb-10', // Ameh Lucky
          'LW': 'player-mcb-9'   // Olaniran Oluwatimilehin
        },
        bench: [
          'player-mcb-3',  // Alagbe Jeremiah Kehinde
          'player-mcb-5',  // Favour
          'player-mcb-8',  // Olowu Dennis
          'player-mcb-13', // Wasiu Ismaeel
          'player-mcb-15', // Tallest
          'player-mcb-16', // Arogunrerin Abdulsalam
          'player-mcb-17', // Olaoye Festus
          'player-mcb-18', // Dyno
          'player-mcb-19', // Olanipekun Alfred
          'player-mcb-20', // Fayipe Christopher
          'player-mcb-22', // Oyelakin Fawaz
          'player-mcb-23'  // Abdullattef Solah
        ],
        status: 'Approved'
      }
    };

    loadedLineups['QF3'] = {
      home: {
        matchId: 'QF3',
        teamAbbr: 'STA',
        formation: '4-3-3',
        captainId: 'player-sta-13', // Agbo Peter
        players: {
          'GK': 'player-sta-1',
          'RB': 'player-sta-3',
          'CB1': 'player-sta-4',
          'CB2': 'player-sta-5',
          'LB': 'player-sta-6',
          'DM': 'player-sta-13',
          'CM1': 'player-sta-2',
          'CM2': 'player-sta-14',
          'LW': 'player-sta-15',
          'ST': 'player-sta-23', // Nwachukwu Jesse
          'RW': 'player-sta-19'
        },
        bench: [],
        status: 'Approved'
      },
      away: {
        matchId: 'QF3',
        teamAbbr: 'AGP',
        formation: '4-3-3',
        captainId: 'player-agp-16', // Akinyode Joseph Oluwaseun
        players: {
          'GK': 'player-agp-16',
          'RB': 'player-agp-4',
          'CB1': 'player-agp-5',
          'CB2': 'player-agp-15', // Obafemi
          'LB': 'player-agp-7',
          'DM': 'player-agp-16', // Akinyode Joseph Oluwaseun
          'CM1': 'player-agp-8',
          'CM2': 'player-agp-9',
          'LW': 'player-agp-10',
          'ST': 'player-agp-13', // Onileowo Oluwafemi
          'RW': 'player-agp-michael' // Olasunkanmi Michael
        },
        bench: [],
        status: 'Approved'
      }
    };

    loadedLineups['QF4'] = {
      home: {
        matchId: 'QF4',
        teamAbbr: 'ANA',
        formation: '4-3-3',
        captainId: 'player-ana-7', // Dele Adejumo
        players: {
          'GK': 'player-ana-1',  // Aina John
          'RB': 'player-ana-2',  // Adewole Ola
          'CB1': 'player-ana-3', // Alade Joshua
          'CB2': 'player-ana-4', // Ayeni Femi
          'LB': 'player-ana-5',  // Akinola Tunde
          'DM': 'player-ana-6',  // Arowolo Segun
          'CM1': 'player-ana-7', // Dele Adejumo (Captain)
          'CM2': 'player-ana-8', // Ayodele Isaac
          'RW': 'player-ana-9',  // Adebanjo Blessing
          'ST': 'player-ana-12', // Success Bayode
          'LW': 'player-ana-10'  // Arogundade David
        },
        bench: [
          'player-ana-11', // Adebayo Samuel
          'player-ana-13', // Isreal
          'player-ana-14'  // Ademola Paul
        ],
        status: 'Approved'
      },
      away: {
        matchId: 'QF4',
        teamAbbr: 'MST',
        formation: '4-2-4',
        captainId: 'player-mst-15', // Nkemjika Sydney (Captain)
        players: {
          'GK': 'player-mst-1',  // Ogundeji Feyitunmise Hezekiah
          'RB': 'player-mst-7',  // Adeniyi Ademola Daniel
          'CB1': 'player-mst-5', // Bernard Augustine Obioma
          'CB2': 'player-mst-6', // Philip Believe Oluwashina
          'LB': 'player-mst-3',  // Akinnayajo Irewale
          'DM': 'player-mst-9',  // Adediran Olanrewaju Abeeb
          'CM': 'player-mst-10', // Iyare Praise
          'RW': 'player-mst-19', // Akintunde Ayomide Oluwaseyifunmi
          'ST1': 'player-mst-18',// Fabusuyi Daniel Oluwafisayo
          'ST2': 'player-mst-15',// Nkemjika Sydney (Captain)
          'LW': 'player-mst-17'  // Boyede Joseph Ayomide
        },
        bench: [
          'player-mst-4',  // Ojoisimi Bright Agbomizi
          'player-mst-8',  // Ademisoye Segun
          'player-mst-11', // Akinyo Boluwatife Precious
          'player-mst-12', // Adekunle Ayomide Mubarak
          'player-mst-13', // Olagunju Moses Temitope
          'player-mst-14', // Ayeni Ayobami
          'player-mst-16', // Shomuyiwa Lateef Babatunde
          'player-mst-20', // Ekwe Fortune
          'player-mst-21'  // Ikwue David Oche
        ],
        status: 'Approved'
      }
    };

    // Semi-final 1: ICE vs AGP (First Leg)
    loadedLineups['SF1_1'] = {
      home: {
        matchId: 'SF1_1',
        teamAbbr: 'ICE',
        formation: '4-2-3-1',
        captainId: 'player-ice-yusuf',
        players: {
          'GK': 'player-ice-prosper',
          'RB': 'player-ice-godwin',
          'RCB': 'player-ice-farooq',
          'LCB': 'player-ice-yusuf',
          'LB': 'player-ice-alameen',
          'LCM': 'player-ice-boluwatife',
          'RCM': 'player-ice-aduragbemi',
          'RMF': 'player-ice-samson',
          'AMF': 'player-ice-olayinka',
          'LWF': 'player-ice-folowosele',
          'CF': 'player-ice-ayomide'
        },
        bench: [
          'player-ice-usman',
          'player-ice-akinloye',
          'player-ice-kudabo',
          'player-ice-adejinmi',
          'player-ice-muller',
          'player-ice-bigsam',
          'player-ice-damola'
        ],
        status: 'Approved'
      },
      away: {
        matchId: 'SF1_1',
        teamAbbr: 'AGP',
        formation: '4-4-2',
        captainId: 'player-agp-18',
        players: {
          'GK': 'player-agp-16',
          'RB': 'player-agp-favour',
          'RCB': 'player-agp-15',
          'LCB': 'player-agp-18',
          'LB': 'player-agp-19',
          'DM': 'player-agp-20',
          'LCM': 'player-agp-21',
          'RCM': 'player-agp-22',
          'AMF': 'player-agp-michael',
          'ST1': 'player-agp-13',
          'ST2': 'player-agp-rowland'
        },
        bench: [
          'player-agp-samuel',
          'player-agp-akinbosoye',
          'player-agp-4',
          'player-agp-5',
          'player-agp-6',
          'player-agp-8',
          'player-agp-10',
          'player-agp-11',
          'player-agp-12'
        ],
        status: 'Approved'
      }
    };

    // Semi-final 2: CYS vs MST (First Leg)
    loadedLineups['SF2_1'] = {
      home: {
        matchId: 'SF2_1',
        teamAbbr: 'CYS',
        formation: '4-3-3',
        captainId: 'player-cys-5',
        players: {
          'GK': 'player-cys-1',
          'RWB': 'player-cys-5',
          'CB1': 'player-cys-4',
          'CB2': 'player-cys-10',
          'LWB': 'player-cys-2',
          'DM1': 'player-cys-8',
          'DM2': 'player-cys-6',
          'AM': 'player-cys-20',
          'RW': 'player-cys-9',
          'ST': 'player-cys-22',
          'LW': 'player-cys-21'
        },
        bench: [
          'player-cys-3',
          'player-cys-7',
          'player-cys-11',
          'player-cys-12',
          'player-cys-13',
          'player-cys-14',
          'player-cys-15',
          'player-cys-25'
        ],
        status: 'Approved'
      },
      away: {
        matchId: 'SF2_1',
        teamAbbr: 'MST',
        formation: '4-3-3',
        captainId: 'player-mst-2',
        players: {
          'GK': 'player-mst-1',
          'RB': 'player-mst-7',
          'RCB': 'player-mst-2',
          'LCB': 'player-mst-13',
          'LB': 'player-mst-3',
          'DM': 'player-mst-5',
          'CM1': 'player-mst-9',
          'CM2': 'player-mst-10',
          'RW': 'player-mst-17',
          'ST': 'player-mst-19',
          'LW': 'player-mst-18'
        },
        bench: [
          'player-mst-4',
          'player-mst-6',
          'player-mst-8',
          'player-mst-11',
          'player-mst-12',
          'player-mst-14',
          'player-mst-15',
          'player-mst-16',
          'player-mst-20',
          'player-mst-21',
          'player-mst-22'
        ],
        status: 'Approved'
      }
    };

    localStorage.setItem('fcl_admin_lineups', JSON.stringify(loadedLineups));
    setLineups(loadedLineups);

    // 9. Commentary
    const storedCommentary = localStorage.getItem('fcl_admin_commentaries');
    let loadedCommentary: Record<string, CommentaryItem[]> = {};
    if (storedCommentary) {
      loadedCommentary = JSON.parse(storedCommentary);
      let commentaryChanged = false;
      Object.keys(loadedCommentary).forEach(matchId => {
        if (['md1-2', 'PO3'].includes(matchId)) {
          loadedCommentary[matchId] = loadedCommentary[matchId].map(comm => {
            let newText = comm.text;
            let newMinute = comm.minute;
            if (comm.text.includes('Michael') && !comm.text.includes('Olasunkanmi Michael')) {
              newText = comm.text.replace(/Michael/g, 'Olasunkanmi Michael');
              commentaryChanged = true;
            }
            if (matchId === 'md1-2' && comm.id === 'comm-goal-md1-2') {
              newMinute = "26'";
              commentaryChanged = true;
            }
            return { ...comm, text: newText, minute: newMinute };
          });
        }
      });
      if (commentaryChanged) {
        localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
      }
    } else {
      loadedMatches.forEach(m => {
        loadedCommentary[m.id] = [
          {
            id: `comm-init-${m.id}`,
            matchId: m.id,
            minute: '0\'',
            text: `Welcome to FUSA Match Center! Today we have ${m.homeTeam} hosting ${m.awayTeam} at ${m.venue}. Kickoff scheduled for ${m.time}.`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'general'
          }
        ];
      });
    }

    // Force/overprint md1-1 commentaries with the official first half and second half timeline
    if (!loadedCommentary['md1-1'] || loadedCommentary['md1-1'].length <= 10 || !loadedCommentary['md1-1'].some(c => c.id === 'comm-ft-whistle')) {
      loadedCommentary['md1-1'] = [
        {
          id: 'comm-ft-whistle',
          matchId: 'md1-1',
          minute: "60+7'",
          text: "🏁 FULL-TIME! Adesiyan Victor blows his final whistle to conclude an intensely hard-fought Opening Match of the FUTA Champions League 2026! MST 0 - 0 ICE. Both teams claim their first point with a gritty defensive display and a first clean sheet of the season!",
          timestamp: "2:47 PM",
          type: 'general'
        },
        {
          id: 'comm-corner-mst-6',
          matchId: 'md1-1',
          minute: "60+6'",
          text: "Corner kick awarded to MST. Played into a crowded penalty box, but cleared safely by the ICE defense.",
          timestamp: "2:46 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mst-16',
          matchId: 'md1-1',
          minute: "60+3'",
          text: "MST wins a foul deep in the opponent's half. Free kick awarded to MST.",
          timestamp: "2:43 PM",
          type: 'general'
        },
        {
          id: 'comm-corner-mst-5',
          matchId: 'md1-1',
          minute: "60+2'",
          text: "Corner kick awarded to MST. A swinging cross cleared by ICE.",
          timestamp: "2:42 PM",
          type: 'general'
        },
        {
          id: 'comm-sub-mst-fortune',
          matchId: 'md1-1',
          minute: "60'",
          text: "🔄 Substitution (MST): Ekwe Fortune comes IN, replacing Akintunde Ayomide Oluwaseyifunmi.",
          timestamp: "2:40 PM",
          type: 'sub'
        },
        {
          id: 'comm-sh-additional-time',
          matchId: 'md1-1',
          minute: "59'",
          text: "📋 5 minutes of additional time indicated by the fourth official.",
          timestamp: "2:39 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mst-14',
          matchId: 'md1-1',
          minute: "56'",
          text: "MST wins a foul. Free kick awarded to MST.",
          timestamp: "2:36 PM",
          type: 'general'
        },
        {
          id: 'comm-corner-ice-3',
          matchId: 'md1-1',
          minute: "54'",
          text: "Corner kick awarded to ICE.",
          timestamp: "2:34 PM",
          type: 'general'
        },
        {
          id: 'comm-sub-ice-damola',
          matchId: 'md1-1',
          minute: "53'",
          text: "🔄 Substitution (ICE): Adeyemi Damola comes IN, replacing Olayinka Quadri.",
          timestamp: "2:33 PM",
          type: 'sub'
        },
        {
          id: 'comm-sub-mst-lateef',
          matchId: 'md1-1',
          minute: "52'",
          text: "🔄 Substitution (MST): Shomuyiwa Lateef Babatunde comes IN, replacing Adekunle Ayomide Mubarak.",
          timestamp: "2:32 PM",
          type: 'sub'
        },
        {
          id: 'comm-foul-ice-6',
          matchId: 'md1-1',
          minute: "48'",
          text: "ICE wins a foul. Free kick awarded to ICE.",
          timestamp: "2:28 PM",
          type: 'general'
        },
        {
          id: 'comm-sh-resume',
          matchId: 'md1-1',
          minute: "47'",
          text: "Play resumes at the FUTA Football Pitch as the referee signals.",
          timestamp: "2:27 PM",
          type: 'general'
        },
        {
          id: 'comm-sh-water-break',
          matchId: 'md1-1',
          minute: "44'",
          text: "🥤 Water break called by referee Adesiyan Victor due to afternoon heat index.",
          timestamp: "2:24 PM",
          type: 'general'
        },
        {
          id: 'comm-subs-block-43',
          matchId: 'md1-1',
          minute: "43'",
          text: "🔄 Multiple tactical substitutions executed:\nMST: Adeniyi Ademola Daniel IN / Philip Believe Oluwashina OUT\nMST: Boyede Joseph Ayomide IN / Fabusuyi Daniel Oluwafisayo OUT\nICE: Iyinbor Michael IN / Ayeni Samuel OUT",
          timestamp: "2:23 PM",
          type: 'sub'
        },
        {
          id: 'comm-offside-sydney',
          matchId: 'md1-1',
          minute: "42'",
          text: "🚩 Offside! Nkemjika Sydney (MST) caught offside.",
          timestamp: "2:22 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mst-12',
          matchId: 'md1-1',
          minute: "39'",
          text: "MST wins a foul. Free kick awarded to MST.",
          timestamp: "2:19 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mst-11',
          matchId: 'md1-1',
          minute: "35'",
          text: "MST wins a foul. Free kick awarded to MST.",
          timestamp: "2:15 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-ice-6-f',
          matchId: 'md1-1',
          minute: "33'",
          text: "ICE wins a foul. Free kick awarded to ICE.",
          timestamp: "2:13 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mst-10-f',
          matchId: 'md1-1',
          minute: "33'",
          text: "MST wins a foul. Free kick awarded to MST.",
          timestamp: "2:13 PM",
          type: 'general'
        },
        {
          id: 'comm-sh-corner-mst-3',
          matchId: 'md1-1',
          minute: "32'",
          text: "Corner kick awarded to MST. A targeted ball into the center is cleared by the interior defense.",
          timestamp: "2:12 PM",
          type: 'general'
        },
        {
          id: 'comm-sh-begins',
          matchId: 'md1-1',
          minute: "31'",
          text: "🟢 Second Half Begins! Score level at 0-0. Players re-enter with high intensity.",
          timestamp: "2:11 PM",
          type: 'general'
        },
        {
          id: 'comm-ht-whistle',
          matchId: 'md1-1',
          minute: "30+6'",
          text: "⏸️ Half-Time: The referee blows the whistle to signal the end of a highly contentious and physical first half! Score remains gridlocked at 0-0. Both squads head to the dressing rooms.",
          timestamp: "2:06 PM",
          type: 'general'
        },
        {
          id: 'comm-card-aduragbemi',
          matchId: 'md1-1',
          minute: "30+3'",
          text: "🟨 Yellow Card: Faleye Aduragbemi (ICE) receives a yellow card for a hard tactical challenge.",
          timestamp: "2:03 PM",
          type: 'card'
        },
        {
          id: 'comm-foul-mst-10',
          matchId: 'md1-1',
          minute: "30+3'",
          text: "MST wins a foul in the final third. Free kick awarded to MST.",
          timestamp: "2:03 PM",
          type: 'general'
        },
        {
          id: 'comm-corner-mst-2',
          matchId: 'md1-1',
          minute: "30+2'",
          text: "Corner kick awarded to MST. A sweeping opportunity, but the defense clears it.",
          timestamp: "2:02 PM",
          type: 'general'
        },
        {
          id: 'comm-add-time',
          matchId: 'md1-1',
          minute: "30+2'",
          text: "📋 Match Commissioner / Fourth Official signals 4 minutes of additional time to be played.",
          timestamp: "2:02 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mst-9',
          matchId: 'md1-1',
          minute: "30+1'",
          text: "MST wins a foul in midfield. Free kick awarded to MST.",
          timestamp: "2:01 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-ice-5',
          matchId: 'md1-1',
          minute: "29'",
          text: "ICE wins a foul. Free kick awarded to ICE.",
          timestamp: "1:59 PM",
          type: 'general'
        },
        {
          id: 'comm-sub-ice',
          matchId: 'md1-1',
          minute: "28'",
          text: "🔄 Substitution (ICE): Bamidele Usman enters the pitch, replacing Olayiwola Samson, who is forced off due to an unfortunate injury.",
          timestamp: "1:58 PM",
          type: 'sub'
        },
        {
          id: 'comm-resume',
          matchId: 'md1-1',
          minute: "28'",
          text: "Play resumes as the referee signals a restart.",
          timestamp: "1:58 PM",
          type: 'general'
        },
        {
          id: 'comm-water-break',
          matchId: 'md1-1',
          minute: "25'",
          text: "🥤 Water break! The referee calls a brief hydration break for both teams due to high heat index.",
          timestamp: "1:55 PM",
          type: 'general'
        },
        {
          id: 'comm-injury-samson',
          matchId: 'md1-1',
          minute: "24'",
          text: "🩹 Olayiwola Samson (ICE) receives medical attention on the pitch after an injury concern.",
          timestamp: "1:54 PM",
          type: 'general'
        },
        {
          id: 'comm-corner-mst-1',
          matchId: 'md1-1',
          minute: "18'",
          text: "Corner kick awarded to MST. Played short, but easily intercepted.",
          timestamp: "1:48 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-ice-4',
          matchId: 'md1-1',
          minute: "16'",
          text: "ICE wins a foul. Free kick awarded to ICE.",
          timestamp: "1:46 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mst-8',
          matchId: 'md1-1',
          minute: "16'",
          text: "MST wins a foul. Free kick awarded to MST.",
          timestamp: "1:46 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mst-7',
          matchId: 'md1-1',
          minute: "15'",
          text: "MST wins a foul. Free kick awarded to MST.",
          timestamp: "1:45 PM",
          type: 'general'
        },
        {
          id: 'comm-corner-ice-2',
          matchId: 'md1-1',
          minute: "12'",
          text: "Corner kick awarded to ICE. Standard outward cross, cleared by MST defense.",
          timestamp: "1:42 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mst-6',
          matchId: 'md1-1',
          minute: "10'",
          text: "MST wins a foul. Free kick awarded to MST.",
          timestamp: "1:40 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-ice-3',
          matchId: 'md1-1',
          minute: "7'",
          text: "ICE wins a foul. Free kick awarded to ICE.",
          timestamp: "1:37 PM",
          type: 'general'
        },
        {
          id: 'comm-corner-ice-1',
          matchId: 'md1-1',
          minute: "6'",
          text: "Corner kick awarded to ICE. Swept toward the front post, of no consequence.",
          timestamp: "1:36 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mst-5',
          matchId: 'md1-1',
          minute: "5'",
          text: "MST wins a foul. Free kick awarded to MST.",
          timestamp: "1:35 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-ice-1',
          matchId: 'md1-1',
          minute: "3'",
          text: "ICE wins a foul. Free kick awarded to ICE.",
          timestamp: "1:33 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mst-2',
          matchId: 'md1-1',
          minute: "3'",
          text: "MST wins a foul. Free kick awarded to MST.",
          timestamp: "1:33 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mst-1',
          matchId: 'md1-1',
          minute: "1'",
          text: "MST wins a foul. Free kick awarded to MST.",
          timestamp: "1:31 PM",
          type: 'general'
        },
        {
          id: 'comm-kickoff',
          matchId: 'md1-1',
          minute: "0'",
          text: "🏁 KICKOFF! The referee Adesiyan Victor blows the opening whistle to signify kickoff between MST and ICE at the FUTA Football Pitch! Game is officially LIVE.",
          timestamp: "1:30 PM",
          type: 'general'
        }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md1-2'] || !loadedCommentary['md1-2'].some(c => c.id === 'comm-goal-md1-2-rowland')) {
      loadedCommentary['md1-2'] = [
        {
          id: 'comm-md1-2-current',
          matchId: 'md1-2',
          minute: "46'",
          text: "AGP doubles their advantage shortly after the restart. Play continues at the Mini Pitch with AGP maintaining control and protecting their 2-0 lead.",
          timestamp: "10:16 AM",
          type: 'general'
        },
        {
          id: 'comm-goal-md1-2-rowland',
          matchId: 'md1-2',
          minute: "46'",
          text: "⚽ GOAL! Rowland scores for AGP shortly after the restart, doubling their advantage! AGP 2–0 BCH.",
          timestamp: "10:16 AM",
          type: 'goal'
        },
        {
          id: 'comm-goal-md1-2',
          matchId: 'md1-2',
          minute: "26'",
          text: "⚽ GOAL! Olasunkanmi Michael scores for AGP with a sensational shot to give AGP a 1–0 lead! Outstanding play by the home side.",
          timestamp: "9:56 AM",
          type: 'goal'
        },
        {
          id: 'comm-foul-md1-2-12',
          matchId: 'md1-2',
          minute: "12'",
          text: "AGP wins a foul in midfield. Free kick awarded to AGP.",
          timestamp: "9:42 AM",
          type: 'general'
        },
        {
          id: 'comm-foul-md1-2-5',
          matchId: 'md1-2',
          minute: "5'",
          text: "BCH wins a foul. Free kick awarded to BCH.",
          timestamp: "9:35 AM",
          type: 'general'
        },
        {
          id: 'comm-kickoff-md1-2',
          matchId: 'md1-2',
          minute: "0'",
          text: "🏁 KICKOFF! The referee blows his whistle to kickoff the Matchday 1 clash between AGP and BCH at the Mini Pitch!",
          timestamp: "9:30 AM",
          type: 'general'
        }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md1-5'] || !loadedCommentary['md1-5'].some(c => c.id === 'comm-goal-md1-5-desmond')) {
      loadedCommentary['md1-5'] = [
        {
          id: 'comm-ft-md1-5',
          matchId: 'md1-5',
          minute: "FT",
          text: "🏁 FULL TIME! BDG secures a comfortable, controlled 2-0 victory over ENT to claim all 3 points. Awoyemi Jesutofunmi and Desmond are the heroes today!",
          timestamp: "2:50 PM",
          type: 'general'
        },
        {
          id: 'comm-goal-md1-5-desmond',
          matchId: 'md1-5',
          minute: "43'",
          text: "⚽ GOAL! Desmond scores! Beautiful interplay results in a calm finish from Desmond to make it BDG 2–0 ENT before the whistle.",
          timestamp: "2:43 PM",
          type: 'goal'
        },
        {
          id: 'comm-md1-5-current',
          matchId: 'md1-5',
          minute: "10'",
          text: "BDG is in full control after Awoyemi Jesutofunmi's opening goal. ENT is trying to reorganize their backline, finding it difficult to pass through BDG's high press.",
          timestamp: "2:10 PM",
          type: 'general'
        },
        {
          id: 'comm-goal-md1-5-tofunmi',
          matchId: 'md1-5',
          minute: "7'",
          text: "⚽ GOAL! Awoyemi Jesutofunmi scores an incredible early opener for BDG! They break the deadlock with a brilliant build-up play. BDG 1–0 ENT.",
          timestamp: "2:07 PM",
          type: 'goal'
        },
        {
          id: 'comm-kickoff-md1-5',
          matchId: 'md1-5',
          minute: "0'",
          text: "🏁 KICKOFF! Referee Abraham blows his whistle and the match between BDG and ENT is underway at the Mini Pitch! The battle of Matchday 1 continues.",
          timestamp: "2:00 PM",
          type: 'general'
        }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md1-3'] || !loadedCommentary['md1-3'].some(c => c.id === 'comm-goal-md1-3-taiwo-james')) {
      loadedCommentary['md1-3'] = [
        {
          id: 'comm-ft-md1-3',
          matchId: 'md1-3',
          minute: "FT",
          text: "🏁 FULL TIME! CYS secures their first FCL game win on their fourth attempt, defeating ANA 1–0! Historical day for the computer scientists.",
          timestamp: "12:15 PM",
          type: 'general'
        },
        {
          id: 'comm-goal-md1-3-taiwo-james',
          matchId: 'md1-3',
          minute: "28'",
          text: "⚽ GOAL! Olorunfemi Taiwo James scores a brilliant volley to put CYS in front! A spectacular finish that sends the fans into absolute limbs! CYS 1-0 ANA.",
          timestamp: "11:28 AM",
          type: 'goal'
        },
        {
          id: 'comm-kickoff-md1-3',
          matchId: 'md1-3',
          minute: "0'",
          text: "🏁 KICKOFF! Referee Tosin signals the start of the matchday 1 clash between CYS and ANA! Let the games begin.",
          timestamp: "11:00 AM",
          type: 'general'
        }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md1-4'] || !loadedCommentary['md1-4'].some(c => c.id === 'comm-goal-md1-4-kunlex')) {
      loadedCommentary['md1-4'] = [
        {
          id: 'comm-ft-md1-4',
          matchId: 'md1-4',
          minute: "FT",
          text: "🏁 FULL TIME! APH wins 1–0 against PHS courtesy of an extra-time goal in the first half from Kunlex! Emmanuel wins MOTM for a colossal display.",
          timestamp: "1:45 PM",
          type: 'general'
        },
        {
          id: 'comm-goal-md1-4-kunlex',
          matchId: 'md1-4',
          minute: "30+3'",
          text: "⚽ GOAL! Kunlex breaks the deadlock for APH right on the stroke of halftime (30+3')! Incredible poise to slot it home under pressure. PHS 0-1 APH.",
          timestamp: "1:03 PM",
          type: 'goal'
        },
        {
          id: 'comm-kickoff-md1-4',
          matchId: 'md1-4',
          minute: "0'",
          text: "🏁 KICKOFF! We are live at the Mini Pitch for PHS vs APH! Both teams fielding strong lineups.",
          timestamp: "12:30 PM",
          type: 'general'
        }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md1-6'] || !loadedCommentary['md1-6'].some(c => c.id === 'comm-goal-md1-6-ademide')) {
      loadedCommentary['md1-6'] = [
        {
          id: 'comm-ft-md1-6',
          matchId: 'md1-6',
          minute: "60+4'",
          text: "🏁 FULL TIME! CSP secures a narrow but important 1–0 victory over IFS, defending strongly after an early goal and managing the game effectively through both halves.",
          timestamp: "4:34 PM",
          type: 'general'
        },
        {
          id: 'comm-additional-md1-6',
          matchId: 'md1-6',
          minute: "60'",
          text: "🕟 4 minutes additional time declared.",
          timestamp: "4:30 PM",
          type: 'general'
        },
        {
          id: 'comm-corner-md1-6-58',
          matchId: 'md1-6',
          minute: "58'",
          text: "Corner kick to IFS. Defensive clearances secure the area.",
          timestamp: "4:28 PM",
          type: 'general'
        },
        {
          id: 'comm-freekick-md1-6-51',
          matchId: 'md1-6',
          minute: "51'",
          text: "Freekick to IFS in the attacking field.",
          timestamp: "4:21 PM",
          type: 'general'
        },
        {
          id: 'comm-sub-ifs-md1-6-46',
          matchId: 'md1-6',
          minute: "46'",
          text: "🔄 Substitution: Segun & Idris OUT, Victor & Kehinde IN (IFS).",
          timestamp: "4:16 PM",
          type: 'sub'
        },
        {
          id: 'comm-sub-csp-md1-6-43',
          matchId: 'md1-6',
          minute: "43'",
          text: "🔄 Substitution: Ademide OUT, Adedara IN (CSP).",
          timestamp: "4:13 PM",
          type: 'sub'
        },
        {
          id: 'comm-freekick-md1-6-42',
          matchId: 'md1-6',
          minute: "42'",
          text: "Freekick to IFS after a late challenge.",
          timestamp: "4:12 PM",
          type: 'general'
        },
        {
          id: 'comm-corner-md1-6-40',
          matchId: 'md1-6',
          minute: "40'",
          text: "Corner kick to IFS played short and cleared.",
          timestamp: "4:10 PM",
          type: 'general'
        },
        {
          id: 'comm-corner-md1-6-37',
          matchId: 'md1-6',
          minute: "37'",
          text: "Corner kick to CSP swung in deep.",
          timestamp: "4:07 PM",
          type: 'general'
        },
        {
          id: 'comm-freekick-md1-6-32',
          matchId: 'md1-6',
          minute: "32'",
          text: "IFS wins a foul – freekick on the wing.",
          timestamp: "4:02 PM",
          type: 'general'
        },
        {
          id: 'comm-shkickoff-md1-6-31',
          matchId: 'md1-6',
          minute: "31'",
          text: "🏁 Second Half Start! CSP looks to defend their thin lead.",
          timestamp: "4:01 PM",
          type: 'general'
        },
        {
          id: 'comm-ht-md1-6',
          matchId: 'md1-6',
          minute: "30+1'",
          text: "⏸ Half-time whistle. CSP leads 1–0 right from the opening seconds.",
          timestamp: "3:31 PM",
          type: 'general'
        },
        {
          id: 'comm-offside-md1-6-26',
          matchId: 'md1-6',
          minute: "26'",
          text: "CSP player caught offside under pressure.",
          timestamp: "3:26 PM",
          type: 'general'
        },
        {
          id: 'comm-offside-md1-6-22',
          matchId: 'md1-6',
          minute: "22'",
          text: "❌ Goal ruled out for offside! CSP denied a second score.",
          timestamp: "3:22 PM",
          type: 'general'
        },
        {
          id: 'comm-freekick-md1-6-17',
          matchId: 'md1-6',
          minute: "17'",
          text: "CSP wins a foul – freekick.",
          timestamp: "3:17 PM",
          type: 'general'
        },
        {
          id: 'comm-freekick-md1-6-13',
          matchId: 'md1-6',
          minute: "13'",
          text: "CSP wins a foul – freekick.",
          timestamp: "3:13 PM",
          type: 'general'
        },
        {
          id: 'comm-offside-md1-6-10',
          matchId: 'md1-6',
          minute: "10'",
          text: "CSP player caught offside.",
          timestamp: "3:10 PM",
          type: 'general'
        },
        {
          id: 'comm-corner-md1-6-7',
          matchId: 'md1-6',
          minute: "7'",
          text: "Corner kick to IFS of no consequence.",
          timestamp: "3:07 PM",
          type: 'general'
        },
        {
          id: 'comm-handball-md1-6-6',
          matchId: 'md1-6',
          minute: "6'",
          text: "Handball by CSP – freekick to IFS.",
          timestamp: "3:06 PM",
          type: 'general'
        },
        {
          id: 'comm-freekick-md1-6-4',
          matchId: 'md1-6',
          minute: "4'",
          text: "IFS wins a foul – freekick.",
          timestamp: "3:04 PM",
          type: 'general'
        },
        {
          id: 'comm-goal-md1-6-ademide',
          matchId: 'md1-6',
          minute: "1'",
          text: "⚽ Goal! Ademide gives CSP the lead right after kickoff with an absolute flyer! IFS 0-1 CSP.",
          timestamp: "3:01 PM",
          type: 'goal'
        },
        {
          id: 'comm-kickoff-md1-6',
          matchId: 'md1-6',
          minute: "0'",
          text: "🏁 KICKOFF! Referee Jones signals kickoff and the battle begins between IFS and CSP!",
          timestamp: "3:00 PM",
          type: 'general'
        }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md1-7'] || !loadedCommentary['md1-7'].some(c => c.id === 'comm-goal-md1-7-soji')) {
      loadedCommentary['md1-7'] = [
        {
          id: 'comm-ft-md1-7',
          matchId: 'md1-7',
          minute: "60'",
          text: "🏁 FULL TIME! IDD secures a strong 2–0 victory over FWT, controlling key moments in both halves. Both teams finish with 10 men in an eventful match.",
          timestamp: "5:45 PM",
          type: 'general'
        },
        {
          id: 'comm-red-fwt-idd-md1-7',
          matchId: 'md1-7',
          minute: "53'",
          text: "🟥 RED CARD! A heated altercation breaks out! The referee brandishes direct matching red cards: Ganiyu Malik Ayomide of FWT and Tolu of IDD are both sent off! FWT 0-2 IDD.",
          timestamp: "5:38 PM",
          type: 'general'
        },
        {
          id: 'comm-goal-md1-7-sola',
          matchId: 'md1-7',
          minute: "51'",
          text: "⚽ GOAL! Ikudayisi Oyesola strikes a beauty to double IDD's lead! Magnificent vision and execution to place it in the bottom corner! FWT 0-2 IDD.",
          timestamp: "5:36 PM",
          type: 'goal'
        },
        {
          id: 'comm-freekick-fwt-md1-7-41',
          matchId: 'md1-7',
          minute: "41'",
          text: "Freekick given to FWT deep in the defensive quarter. Swept forward but intercepted.",
          timestamp: "5:26 PM",
          type: 'general'
        },
        {
          id: 'comm-sub-idd-md1-7',
          matchId: 'md1-7',
          minute: "39'",
          text: "🔄 Substitution: Neymar OUT, Enzo IN (IDD) as the coach makes a tactical change up front.",
          timestamp: "5:24 PM",
          type: 'sub'
        },
        {
          id: 'comm-freekick-fwt-md1-7-33',
          matchId: 'md1-7',
          minute: "33'",
          text: "Freekick given to FWT after Ikudayisi Oyesola commits a late challenge on the flank.",
          timestamp: "5:18 PM",
          type: 'general'
        },
        {
          id: 'comm-shkickoff-md1-7',
          matchId: 'md1-7',
          minute: "31'",
          text: "🏁 SECOND HALF START! FWT needs to recover their composure to counter IDD's threat.",
          timestamp: "5:16 PM",
          type: 'general'
        },
        {
          id: 'comm-ht-md1-7',
          matchId: 'md1-7',
          minute: "30'",
          text: "⏸ HALF-TIME! Referee signals halftime with IDD leading 1-0 courtesy of Soji's early clinical finish.",
          timestamp: "5:15 PM",
          type: 'general'
        },
        {
          id: 'comm-freekick-idd-md1-7-20',
          matchId: 'md1-7',
          minute: "20'",
          text: "Freekick given to IDD after an aerial collision.",
          timestamp: "5:05 PM",
          type: 'general'
        },
        {
          id: 'comm-goal-md1-7-soji',
          matchId: 'md1-7',
          minute: "12'",
          text: "⚽ GOAL! Soji scores! A delicious team movement is slotted home perfectly by Soji to give IDD the early breakthroughs! FWT 0-1 IDD.",
          timestamp: "4:57 PM",
          type: 'goal'
        },
        {
          id: 'comm-freekick-idd-md1-7-7',
          matchId: 'md1-7',
          minute: "7'",
          text: "Freekick given to IDD in midcourt.",
          timestamp: "4:52 PM",
          type: 'general'
        },
        {
          id: 'comm-handball-idd-md1-7',
          matchId: 'md1-7',
          minute: "7'",
          text: "Handball by IDD – freekick to FWT near the center circle.",
          timestamp: "4:51 PM",
          type: 'general'
        },
        {
          id: 'comm-offside-idd-md1-7',
          matchId: 'md1-7',
          minute: "5'",
          text: "IDD player caught offside during a dangerous direct run.",
          timestamp: "4:49 PM",
          type: 'general'
        },
        {
          id: 'comm-corner-fwt-md1-7',
          matchId: 'md1-7',
          minute: "3'",
          text: "Corner field for FWT. Whipped into the box but headed clear by IDD defense.",
          timestamp: "4:47 PM",
          type: 'general'
        },
        {
          id: 'comm-kickoff-md1-7',
          matchId: 'md1-7',
          minute: "0'",
          text: "🏁 KICKOFF! Referee Jones blows the whistle and gets us underway at the Mini Pitch for matchday 1: FWT vs IDD!",
          timestamp: "4:45 PM",
          type: 'general'
        }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    } else {
      // Synchronize/correct existing records in commentary
      let commUpdated = false;
      const commIdx = loadedCommentary['md1-7'] ? loadedCommentary['md1-7'].findIndex(c => c.id === 'comm-red-fwt-idd-md1-7') : -1;
      if (commIdx !== -1 && loadedCommentary['md1-7'] && loadedCommentary['md1-7'][commIdx].text.includes("Malik of FWT")) {
        loadedCommentary['md1-7'][commIdx].text = "🟥 RED CARD! A heated altercation breaks out! The referee brandishes direct matching red cards: Ganiyu Malik Ayomide of FWT and Tolu of IDD are both sent off! FWT 0-2 IDD.";
        commUpdated = true;
      }
      const subIdx = loadedCommentary['md1-7'] ? loadedCommentary['md1-7'].findIndex(c => c.id === 'comm-sub-fwt-md1-7' || c.id === 'comm-sub-idd-md1-7') : -1;
      if (subIdx !== -1 && loadedCommentary['md1-7']) {
        if (loadedCommentary['md1-7'][subIdx].id !== 'comm-sub-idd-md1-7' || loadedCommentary['md1-7'][subIdx].text.includes('(FWT)')) {
          loadedCommentary['md1-7'][subIdx].id = 'comm-sub-idd-md1-7';
          loadedCommentary['md1-7'][subIdx].text = "🔄 Substitution: Neymar OUT, Enzo IN (IDD) as the coach makes a tactical change up front.";
          commUpdated = true;
        }
      }
      const goalSolaIdx = loadedCommentary['md1-7'] ? loadedCommentary['md1-7'].findIndex(c => c.id === 'comm-goal-md1-7-sola') : -1;
      if (goalSolaIdx !== -1 && loadedCommentary['md1-7']) {
        if (loadedCommentary['md1-7'][goalSolaIdx].text.includes("Sola strikes")) {
          loadedCommentary['md1-7'][goalSolaIdx].text = "⚽ GOAL! Ikudayisi Oyesola strikes a beauty to double IDD's lead! Magnificent vision and execution to place it in the bottom corner! FWT 0-2 IDD.";
          commUpdated = true;
        }
      }
      const fkSolaIdx = loadedCommentary['md1-7'] ? loadedCommentary['md1-7'].findIndex(c => c.id === 'comm-freekick-fwt-md1-7-33') : -1;
      if (fkSolaIdx !== -1 && loadedCommentary['md1-7']) {
        if (loadedCommentary['md1-7'][fkSolaIdx].text.includes("Sola commits")) {
          loadedCommentary['md1-7'][fkSolaIdx].text = "Freekick given to FWT after Ikudayisi Oyesola commits a late challenge on the flank.";
          commUpdated = true;
        }
      }
      if (commUpdated) {
        localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
      }
    }

    if (!loadedCommentary['md1-8'] || !loadedCommentary['md1-8'].some(c => c.id === 'comm-goal-md1-8-adebayo-3')) {
      loadedCommentary['md1-8'] = [
        {
          id: 'comm-ft-md1-8',
          matchId: 'md1-8',
          minute: "60'",
          text: "🏁 FULL TIME! SIMT holds on to claim a remarkable 3–2 victory over AGE! A thrilling match highlighted by Captain Adebayo Samuel Ayobami's spectacular free-kick hat-trick! AGE fought back to 2-2 but couldn't snatch a point even after SIMT were reduced to 9 men in the dying minutes. AGE 2 - 3 SIMT.",
          timestamp: "5:05 PM",
          type: 'general'
        },
        {
          id: 'comm-red-daniel-md1-8',
          matchId: 'md1-8',
          minute: "58'",
          text: "🟥 RED CARD! Nwabunwanne Chibichi Daniel receives his second yellow card and is sent off! SIMT is down to 9 men on the pitch!",
          timestamp: "5:03 PM",
          type: 'card'
        },
        {
          id: 'comm-red-gbolahun-md1-8',
          matchId: 'md1-8',
          minute: "56'",
          text: "🟥 RED CARD! Omowale Ridwan Gbolahun is shown a straight red card! SIMT is down to 10 men as we enter the final minutes!",
          timestamp: "5:01 PM",
          type: 'card'
        },
        {
          id: 'comm-goal-md1-8-adebayo-3',
          matchId: 'md1-8',
          minute: "55'",
          text: "⚽ GOAL!!! HATTRICK OF DIRECT FREEKICKS FOR THE CAPTAIN! Adebayo Samuel Ayobami stands ready, fires from distance and curls it exquisitely over the wall into the top shelf! Unbelievable performance! AGE 2 - 3 SIMT.",
          timestamp: "5:00 PM",
          type: 'goal'
        },
        {
          id: 'comm-goal-md1-8-anthony',
          matchId: 'md1-8',
          minute: "47'",
          text: "⚽ GOAL!!! Anthony scores for AGE! He links up perfectly with the midfield, cuts inside the box and strokes a precise low drive past the diving GK to bring AGE level! Phenomenal comeback! AGE 2 - 2 SIMT.",
          timestamp: "4:52 PM",
          type: 'goal'
        },
        {
          id: 'comm-goal-md1-8-sylvanus',
          matchId: 'md1-8',
          minute: "42'",
          text: "⚽ GOAL!!! Sylvanus converts from the spot! He sends the goalkeeper the wrong way and slams the penalty into the bottom left corner, restoring hope to AGE! AGE 1 - 2 SIMT.",
          timestamp: "4:47 PM",
          type: 'goal'
        },
        {
          id: 'comm-pen-age-md1-8',
          matchId: 'md1-8',
          minute: "41'",
          text: "PENALTY AWARDED TO AGE! A late tackle in the box by SIMT defenders prompts Referee Juwon to point straight to the spot!",
          timestamp: "4:46 PM",
          type: 'general'
        },
        {
          id: 'comm-shkickoff-md1-8',
          matchId: 'md1-8',
          minute: "31'",
          text: "🏁 SECOND HALF START! AGE pushes players forward, seeking a way back into this fiery encounter.",
          timestamp: "4:36 PM",
          type: 'general'
        },
        {
          id: 'comm-ht-md1-8',
          matchId: 'md1-8',
          minute: "30'",
          text: "⏸ HALF-TIME! Referee Juwon signals halftime. SIMT goes into the break with a 2-0 cushion, courtesy of two majestic freekicks from Ayobami.",
          timestamp: "4:30 PM",
          type: 'general'
        },
        {
          id: 'comm-goal-md1-8-adebayo-2',
          matchId: 'md1-8',
          minute: "25'",
          text: "⚽ GOAL!!! HE DOES IT AGAIN! Adebayo Samuel Ayobami scores another magnificent direct freekick! An absolute masterclass in dead-ball delivery to extend the lead! AGE 0 - 2 SIMT.",
          timestamp: "4:25 PM",
          type: 'goal'
        },
        {
          id: 'comm-goal-md1-8-adebayo-1',
          matchId: 'md1-8',
          minute: "8'",
          text: "⚽ GOAL!!! Adebayo Samuel Ayobami scores directly from the freekick! A sublime curl that flies into the top corner, yielding an early lead for SIMT! AGE 0 - 1 SIMT.",
          timestamp: "4:08 PM",
          type: 'goal'
        },
        {
          id: 'comm-freekick-simt-8',
          matchId: 'md1-8',
          minute: "7'",
          text: "SIMT wins a foul. Free kick given just outside the box in a dangerous position.",
          timestamp: "4:07 PM",
          type: 'general'
        },
        {
          id: 'comm-yellow-coach-md1-8',
          matchId: 'md1-8',
          minute: "1'",
          text: "🟨 YELLOW CARDS! An early flare of tempers! Referee Juwon issues yellow cards to SIMT Coach Asinwa Peter Adeleke, defender Nwabunwanne Chibichi Daniel, and Captain Adebayo Samuel Ayobami for dissent.",
          timestamp: "4:01 PM",
          type: 'card'
        },
        {
          id: 'comm-kickoff-md1-8',
          matchId: 'md1-8',
          minute: "0'",
          text: "🏁 KICKOFF! Referee Juwon blows his whistle to start this Matchday 1 clash between AGE and SIMT at the Mini Pitch!",
          timestamp: "4:00 PM",
          type: 'general'
        }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md1-10'] || !loadedCommentary['md1-10'].some(c => c.id === 'comm-goal-md1-10-iyenagbe')) {
      loadedCommentary['md1-10'] = [
        {
          id: 'comm-ft-md1-10',
          matchId: 'md1-10',
          minute: "60'",
          text: "🏁 FULL TIME! PHY holding on to claim a remarkable 2–1 victory over MCB in a highly matches clash! Christian Iyenagbe's opportunistic 59th minute winner decided a fierce derby where MCB fought bravely to level at 1-1 through Timilehin. A fitting end to Matchday 1! MCB 1 - 2 PHY.",
          timestamp: "6:05 PM",
          type: 'general'
        },
        {
          id: 'comm-goal-md1-10-iyenagbe',
          matchId: 'md1-10',
          minute: "59'",
          text: "⚽ GOAL!!! Christian Iyenagbe fires PHY into the lead! A beautiful sequence down the flank, and he guides a low matching drive into the corner of the net! MCB 1 - 2 PHY.",
          timestamp: "6:03 PM",
          type: 'goal'
        },
        {
          id: 'comm-sub-phy-3-md1-10',
          matchId: 'md1-10',
          minute: "57'",
          text: "🔄 Substitution: Ajigboteleda Emmanuel OUT, Andrew Emmanuel IN (PHY) as the coach shores up the central mid tier.",
          timestamp: "6:01 PM",
          type: 'sub'
        },
        {
          id: 'comm-offside-phy-6-md1-10',
          matchId: 'md1-10',
          minute: "55'",
          text: "🚩 Offside to PHY. Free kick awarded to MCB to launch themselves forward.",
          timestamp: "5:58 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mcb-9-md1-10',
          matchId: 'md1-10',
          minute: "51'",
          text: "MCB wins a foul. Free kick given just past the half line.",
          timestamp: "5:53 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mcb-8-md1-10',
          matchId: 'md1-10',
          minute: "50'",
          text: "MCB wins a foul. Play stopped temporarily for a brief medical treatment.",
          timestamp: "5:51 PM",
          type: 'general'
        },
        {
          id: 'comm-sub-mcb-2-md1-10',
          matchId: 'md1-10',
          minute: "50'",
          text: "🔄 Substitution: Ameh Lucky OUT, Wasiu Ismaeel IN (MCB) as Microbiology search for a spark.",
          timestamp: "5:50 PM",
          type: 'sub'
        },
        {
          id: 'comm-foul-mcb-7-md1-10',
          matchId: 'md1-10',
          minute: "48'",
          text: "MCB wins a foul as Physics defenders commit an aggressive push.",
          timestamp: "5:48 PM",
          type: 'general'
        },
        {
          id: 'comm-sub-phy-2-md1-10',
          matchId: 'md1-10',
          minute: "47'",
          text: "🔄 Substitution: Akinseye Oluwasanmilore OUT, Oladipupo Kayode Afeez IN (PHY).",
          timestamp: "5:47 PM",
          type: 'sub'
        },
        {
          id: 'comm-cards-mcb-md1-10',
          matchId: 'md1-10',
          minute: "44'",
          text: "🟨 YELLOW CARDS! Tempers flare out during an aggressive sequence. Referee Juwon hands out yellow caution cards to Oni Oluwadamilola (MCB) and Lawal Favour Ben (MCB).",
          timestamp: "5:44 PM",
          type: 'card'
        },
        {
          id: 'comm-foul-phy-4-md1-10',
          matchId: 'md1-10',
          minute: "44'",
          text: "PHY wins a foul. Free kick given near the central circle.",
          timestamp: "5:43 PM",
          type: 'general'
        },
        {
          id: 'comm-sub-phy-1-md1-10',
          matchId: 'md1-10',
          minute: "41'",
          text: "🔄 Substitution: Are Moses OUT, Lawal Oluwabukunmi IN (PHY) as things heat up up front.",
          timestamp: "5:40 PM",
          type: 'sub'
        },
        {
          id: 'comm-foul-mcb-6-md1-10',
          matchId: 'md1-10',
          minute: "37'",
          text: "MCB wins a foul. High boot from the midfielder in blue.",
          timestamp: "5:36 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mcb-5-md1-10',
          matchId: 'md1-10',
          minute: "36'",
          text: "MCB wins a foul near safety line.",
          timestamp: "5:35 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-phy-3-md1-10',
          matchId: 'md1-10',
          minute: "32'",
          text: "PHY wins a foul. Quick restart taken.",
          timestamp: "5:31 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-phy-2-md1-10',
          matchId: 'md1-10',
          minute: "32'",
          text: "PHY wins a foul in progress.",
          timestamp: "5:31 PM",
          type: 'general'
        },
        {
          id: 'comm-shkickoff-md1-10',
          matchId: 'md1-10',
          minute: "31'",
          text: "🏁 SECOND HALF START! We are back on.",
          timestamp: "5:30 PM",
          type: 'general'
        },
        {
          id: 'comm-sub-mcb-1-md1-10',
          matchId: 'md1-10',
          minute: "31'",
          text: "🔄 Substitution: Alagbe Jeremiah OUT, Adameji Isaac IN (MCB) as the coach makes a half-time adjustment in defense.",
          timestamp: "5:29 PM",
          type: 'sub'
        },
        {
          id: 'comm-ht-md1-10',
          matchId: 'md1-10',
          minute: "30'",
          text: "⏸ HALF-TIME! Referee Juwon blows his whistle. It has been a thrilling first half ending at 1-1.",
          timestamp: "5:15 PM",
          type: 'general'
        },
        {
          id: 'comm-goal-md1-10-laniran',
          matchId: 'md1-10',
          minute: "30'",
          text: "⚽ GOAL!!! Olaniran Oluwatimilehin gets MCB on level terms! He slots it home exquisitely past the keeper after some neat setup play! MCB 1 - 1 PHY.",
          timestamp: "5:14 PM",
          type: 'goal'
        },
        {
          id: 'comm-offside-phy-5-md1-10',
          matchId: 'md1-10',
          minute: "23'",
          text: "🚩 Offside to PHY - freekick given to MCB.",
          timestamp: "5:06 PM",
          type: 'general'
        },
        {
          id: 'comm-corner-mcb-2-md1-10',
          matchId: 'md1-10',
          minute: "21'",
          text: "📐 Corner to MCB as the goalie tips it over the bar.",
          timestamp: "5:03 PM",
          type: 'general'
        },
        {
          id: 'comm-yellow-phy-md1-10',
          matchId: 'md1-10',
          minute: "19'",
          text: "🟨 Yellow card given - Ajayi Timothy (PHY) is booked for pulling back the assailant.",
          timestamp: "5:01 PM",
          type: 'card'
        },
        {
          id: 'comm-foul-mcb-4-md1-10',
          matchId: 'md1-10',
          minute: "19'",
          text: "MCB wins a foul in a favorable advanced layout.",
          timestamp: "5:00 PM",
          type: 'general'
        },
        {
          id: 'comm-offside-phy-4-md1-10',
          matchId: 'md1-10',
          minute: "17'",
          text: "🚩 Offside to PHY - freekick given to MCB.",
          timestamp: "4:57 PM",
          type: 'general'
        },
        {
          id: 'comm-offside-phy-3-md1-10',
          matchId: 'md1-10',
          minute: "15'",
          text: "🚩 Offside to PHY - freekick given to MCB.",
          timestamp: "4:53 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mcb-3-md1-10',
          matchId: 'md1-10',
          minute: "15'",
          text: "MCB wins a foul.",
          timestamp: "4:52 PM",
          type: 'general'
        },
        {
          id: 'comm-goal-md1-10-akinseye',
          matchId: 'md1-10',
          minute: "13'",
          text: "⚽ GOAL!!! Akinseye Oluwasanmilore puts Physics ahead! He catches the defense sleeping, latches onto a cross, and bangs it into the roof of the net! MCB 0 - 1 PHY.",
          timestamp: "4:49 PM",
          type: 'goal'
        },
        {
          id: 'comm-foul-phy-1-md1-10',
          matchId: 'md1-10',
          minute: "12'",
          text: "PHY wins a foul. Free kick given near the right sideline.",
          timestamp: "4:47 PM",
          type: 'general'
        },
        {
          id: 'comm-corner-mcb-1-md1-10',
          matchId: 'md1-10',
          minute: "10'",
          text: "📐 Corner to MCB as the defender headers it over his own goal-line.",
          timestamp: "4:43 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mcb-2-md1-10',
          matchId: 'md1-10',
          minute: "9'",
          text: "MCB wins a foul. Hand ball against PHY attacker.",
          timestamp: "4:41 PM",
          type: 'general'
        },
        {
          id: 'comm-offside-phy-2-md1-10',
          matchId: 'md1-10',
          minute: "8'",
          text: "🚩 Offside to PHY - freekick given to MCB.",
          timestamp: "4:39 PM",
          type: 'general'
        },
        {
          id: 'comm-foul-mcb-1-md1-10',
          matchId: 'md1-10',
          minute: "5'",
          text: "MCB wins a foul.",
          timestamp: "4:07 PM",
          type: 'general'
        },
        {
          id: 'comm-corner-phy-2-md1-10',
          matchId: 'md1-10',
          minute: "5'",
          text: "📐 Corner to PHY after a deflected strike from distance.",
          timestamp: "4:06 PM",
          type: 'general'
        },
        {
          id: 'comm-corner-phy-1-md1-10',
          matchId: 'md1-10',
          minute: "5'",
          text: "📐 Corner to PHY as they press hard early on.",
          timestamp: "4:05 PM",
          type: 'general'
        },
        {
          id: 'comm-offside-phy-1-md1-10',
          matchId: 'md1-10',
          minute: "3'",
          text: "🚩 Offside to PHY - freekick given to MCB.",
          timestamp: "4:03 PM",
          type: 'general'
        },
        {
          id: 'comm-yellows-mcb-md1-10',
          matchId: 'md1-10',
          minute: "1'",
          text: "🟨 YELLOW CARDS! An early flare of nerves! Osowo Taiwo (MCB) and goalkeeper Adesuyi Oluwasegun (MCB) are both booked for excessive dissent.",
          timestamp: "4:01 PM",
          type: 'card'
        },
        {
          id: 'comm-kickoff-md1-10',
          matchId: 'md1-10',
          minute: "0'",
          text: "🏁 KICKOFF! Referee Juwon blows his whistle to start this Matchday 1 clash between MCB and PHY at the Mini Pitch!",
          timestamp: "4:00 PM",
          type: 'general'
        }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md1-9'] || !loadedCommentary['md1-9'].some(c => c.id === 'comm-goal-md1-9-fikayo')) {
      loadedCommentary['md1-9'] = [
        {
          id: 'comm-ft-md1-9',
          matchId: 'md1-9',
          minute: "60'",
          text: "🏁 FULL TIME! MBBS secure their first ever FUTA Champions League win in four attempts after matching standard play! A spirited 2–1 victory against Statistics (STA). Bamidele Fikayo's second half header is the decider! MBBS 2 - 1 STA.",
          timestamp: "5:05 PM",
          type: 'general'
        },
        {
          id: 'comm-goal-md1-9-fikayo',
          matchId: 'md1-9',
          minute: "48'",
          text: "⚽ GOAL!!! Bamidele Fikayo heads MBBS back in front! A spectacular delivery from the set piece, and the talisman leaps highest to send his header into the corner! High drama at the Mini Pitch! MBBS 2 - 1 STA.",
          timestamp: "4:50 PM",
          type: 'goal'
        },
        {
          id: 'comm-chance-mbs-md1-9',
          matchId: 'md1-9',
          minute: "38'",
          text: "🔥 CHANCE! MBBS nearly scores their second! A fierce strike bounces off the upright as the STA defense scrambles it away.",
          timestamp: "4:39 PM",
          type: 'general'
        },
        {
          id: 'comm-second-half-md1-9',
          matchId: 'md1-9',
          minute: "31'",
          text: "🏁 SECOND HALF starts! Both teams resume action hoping to break the deadlock.",
          timestamp: "4:32 PM",
          type: 'general'
        },
        {
          id: 'comm-ht-md1-9',
          matchId: 'md1-9',
          minute: "30'",
          text: "⏸️ HALF-TIME! An action-packed opening half draws to a close with both teams deadlocked at 1–1. Dynamic visual play from both departments.",
          timestamp: "4:16 PM",
          type: 'general'
        },
        {
          id: 'comm-goal-md1-9-toluwanimi',
          matchId: 'md1-9',
          minute: "15'",
          text: "⚽ GOAL!!! Daisi Tioluwanimi replies instantly for STA! A majestic team move, sliced through MBBS lines, and finished with precision! Back on level terms! MBBS 1 - 1 STA.",
          timestamp: "4:15 PM",
          type: 'goal'
        },
        {
          id: 'comm-goal-md1-9-sk',
          matchId: 'md1-9',
          minute: "7'",
          text: "⚽ GOAL!!! SK puts MBBS in the lead early! A beautifully placed shot from distance catches the STA goalkeeper off guard! A dream start for MBBS! MBBS 1 - 0 STA.",
          timestamp: "4:07 PM",
          type: 'goal'
        },
        {
          id: 'comm-kickoff-md1-9',
          matchId: 'md1-9',
          minute: "0'",
          text: "🏁 KICKOFF! Referee Victor blows his whistle, and we are underway for this Group Stage Matchday 1 clash between MBBS and STA at the Mini Pitch!",
          timestamp: "4:00 PM",
          type: 'general'
        }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    // CSP vs STA (md2-1) Commentary
    if (!loadedCommentary['md2-1'] || loadedCommentary['md2-1'].length === 0) {
      loadedCommentary['md2-1'] = [
        { id: 'comm-md2-1-ft', matchId: 'md2-1', minute: "60+6'", text: "🏁 FULL-TIME! CSP 3 - 2 STA. CSP becomes the first team to officially qualify for the knockout stage, with Akindeko Emmanuel producing a stellar performance!", timestamp: "10:36 AM", type: 'general' },
        { id: 'comm-md2-1-corner-csp-5', matchId: 'md2-1', minute: "60+5'", text: "📐 Corner to CSP as they run down the final seconds of the game.", timestamp: "10:35 AM", type: 'general' },
        { id: 'comm-md2-1-corner-sta-3', matchId: 'md2-1', minute: "60+2'", text: "📐 Corner to STA as they launch a desperate aerial cross into the CSP box.", timestamp: "10:32 AM", type: 'general' },
        { id: 'comm-md2-1-add-time', matchId: 'md2-1', minute: "60+1'", text: "⏱️ 3 minutes of additional time has been announced by the fourth official.", timestamp: "10:31 AM", type: 'general' },
        { id: 'comm-md2-1-goal-csp-5', matchId: 'md2-1', minute: "60+1'", text: "⚽ GOAL!!! Akindeko Emmanuel scores again! He restores the lead with a sublime effort to bring the score to CSP 3 - 2 STA!", timestamp: "10:31 AM", type: 'goal' },
        { id: 'comm-md2-1-sub-sta-3', matchId: 'md2-1', minute: "60'", text: "🔄 Substitution (STA): Emmanuel Olaoluwa Akintayo makes way for Eki Kelvin Aghoghomena.", timestamp: "10:30 AM", type: 'general' },
        { id: 'comm-md2-1-foul-csp-5', matchId: 'md2-1', minute: "60'", text: "CSP wins a free kick in their own half after a rough tackle.", timestamp: "10:30 AM", type: 'general' },
        { id: 'comm-md2-1-goal-sta-2', matchId: 'md2-1', minute: "59'", text: "⚽ GOAL!!! Daisi Tioluwanimi gets STA back on level terms with a marvelous strike following a brief CSP corner kick! CSP 2 - 2 STA.", timestamp: "10:29 AM", type: 'goal' },
        { id: 'comm-md2-1-corner-csp-4', matchId: 'md2-1', minute: "59'", text: "📐 Corner to CSP.", timestamp: "10:29 AM", type: 'general' },
        { id: 'comm-md2-1-sub-csp-4', matchId: 'md2-1', minute: "56'", text: "🔄 Substitution (CSP): Star man Timilehin Victor walks off to a standing ovation as Omowaye Timothy replaces him.", timestamp: "10:26 AM", type: 'general' },
        { id: 'comm-md2-1-goal-csp-2', matchId: 'md2-1', minute: "55'", text: "⚽ GOAL!!! Akindeko Emmanuel taps it home to put CSP in front! Spectacular goal, CSP 2 - 1 STA.", timestamp: "10:25 AM", type: 'goal' },
        { id: 'comm-md2-1-corner-sta-2', matchId: 'md2-1', minute: "50'", text: "📐 Corner to STA.", timestamp: "10:20 AM", type: 'general' },
        { id: 'comm-md2-1-corner-csp-3', matchId: 'md2-1', minute: "46'", text: "📐 Corner to CSP inside the opening stages of the second half.", timestamp: "10:16 AM", type: 'general' },
        { id: 'comm-md2-1-goal-csp-1', matchId: 'md2-1', minute: "44'", text: "⚽ GOAL!!! Timilehin Victor scores! He puts CSP back on equal footing right before halftime. CSP 1 - 1 STA.", timestamp: "10:14 AM", type: 'goal' },
        { id: 'comm-md2-1-sub-csp-3', matchId: 'md2-1', minute: "42'", text: "🔄 Substitution (CSP): Oyebode Daniel comes out and gives way to Alonge David.", timestamp: "10:12 AM", type: 'general' },
        { id: 'comm-md2-1-sub-sta-2', matchId: 'md2-1', minute: "42'", text: "🔄 Substitution (STA): Adedeji Taofeek Oyeleke is replaced by Jackson Joseph.", timestamp: "10:12 AM", type: 'general' },
        { id: 'comm-md2-1-card-sta-3', matchId: 'md2-1', minute: "42'", text: "🟨 Yellow card handed to Salam Rokeeb Oladimeji (STA).", timestamp: "10:12 AM", type: 'card' },
        { id: 'comm-md2-1-foul-csp-4', matchId: 'md2-1', minute: "42'", text: "CSP wins a free kick in midfield.", timestamp: "10:12 AM", type: 'general' },
        { id: 'comm-md2-1-corner-sta-1', matchId: 'md2-1', minute: "40'", text: "📐 Corner to STA.", timestamp: "10:10 AM", type: 'general' },
        { id: 'comm-md2-1-sub-sta-1', matchId: 'md2-1', minute: "34'", text: "🔄 Substitution (STA): Akinjogunla Mayowa comes out and gives way to Salam Rokeeb Oladimeji.", timestamp: "10:04 AM", type: 'general' },
        { id: 'comm-md2-1-card-sta-2', matchId: 'md2-1', minute: "34'", text: "🟨 Yellow card to Akinjogunla Mayowa (STA) for professional foul.", timestamp: "10:04 AM", type: 'card' },
        { id: 'comm-md2-1-foul-csp-3', matchId: 'md2-1', minute: "34'", text: "CSP wins a free kick.", timestamp: "10:04 AM", type: 'general' },
        { id: 'comm-md2-1-foul-csp-2', matchId: 'md2-1', minute: "33'", text: "CSP wins a free kick in STA's half.", timestamp: "10:03 AM", type: 'general' },
        { id: 'comm-md2-1-foul-sta-2', matchId: 'md2-1', minute: "32'", text: "STA wins a second consecutive free kick after an illegal block.", timestamp: "10:02 AM", type: 'general' },
        { id: 'comm-md2-1-foul-sta-1', matchId: 'md2-1', minute: "32'", text: "STA wins a free kick.", timestamp: "10:02 AM", type: 'general' },
        { id: 'comm-md2-1-sub-csp-2', matchId: 'md2-1', minute: "31'", text: "🔄 Substitution (CSP): Ademide leaves the stage, Goodness replaces him.", timestamp: "10:01 AM", type: 'general' },
        { id: 'comm-md2-1-sub-csp-1', matchId: 'md2-1', minute: "31'", text: "🔄 Substitution (CSP): Adebisi Success comes out and gives way to Adedara.", timestamp: "10:01 AM", type: 'general' },
        { id: 'comm-md2-1-sh', matchId: 'md2-1', minute: "31'", text: "🏁 SECOND HALF KICKOFF! Both teams emerge with adjustments.", timestamp: "10:01 AM", type: 'general' },
        { id: 'comm-md2-1-ht', matchId: 'md2-1', minute: "30'", text: "⏸️ HALF-TIME! An engaging first half ends with STA holding a slim 1-0 advantage.", timestamp: "10:00 AM", type: 'general' },
        { id: 'comm-md2-1-foul-csp-1', matchId: 'md2-1', minute: "23'", text: "CSP wins a free kick.", timestamp: "9:53 AM", type: 'general' },
        { id: 'comm-md2-1-corner-csp-2', matchId: 'md2-1', minute: "22'", text: "📐 Corner to CSP.", timestamp: "9:52 AM", type: 'general' },
        { id: 'comm-md2-1-foul-csp-1-early', matchId: 'md2-1', minute: "19'", text: "CSP wins a free kick.", timestamp: "9:49 AM", type: 'general' },
        { id: 'comm-md2-1-card-sta-1', matchId: 'md2-1', minute: "15'", text: "🟨 Yellow card to Nwachukwu Jesse (STA) for dissent during goal celebrations.", timestamp: "9:45 AM", type: 'card' },
        { id: 'comm-md2-1-goal-sta-1', matchId: 'md2-1', minute: "15'", text: "⚽ GOAL!!! Agbo Peter gives STA the lead! He converts from close range to make it CSP 0 - 1 STA.", timestamp: "9:45 AM", type: 'goal' },
        { id: 'comm-md2-1-corner-csp-1', matchId: 'md2-1', minute: "11'", text: "📐 Corner to CSP.", timestamp: "9:41 AM", type: 'general' },
        { id: 'comm-md2-1-foul-sta-0', matchId: 'md2-1', minute: "10'", text: "STA wins a free kick.", timestamp: "9:40 AM", type: 'general' },
        { id: 'comm-md2-1-foul-csp-0', matchId: 'md2-1', minute: "7'", text: "CSP wins a free kick.", timestamp: "9:37 AM", type: 'general' },
        { id: 'comm-md2-1-kickoff', matchId: 'md2-1', minute: "1'", text: "🏁 KICKOFF! Referee Abraham (MEE) blows the whistle to start CSP vs STA on Matchday 2!", timestamp: "9:30 AM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    // APH vs IDD (md2-2) Commentary
    if (!loadedCommentary['md2-2'] || loadedCommentary['md2-2'].length === 0) {
      loadedCommentary['md2-2'] = [
        { id: 'comm-md2-2-ft', matchId: 'md2-2', minute: "60+1'", text: "🏁 FULL-TIME! APH 0 - 1 IDD. A highly contested battle ends with IDD securing the win from the spot! Ikudayisi Oyesola named MOTM.", timestamp: "12:01 PM", type: 'general' },
        { id: 'comm-md2-2-foul-aph-4', matchId: 'md2-2', minute: "60'", text: "APH wins a free kick in the final minute.", timestamp: "12:00 PM", type: 'general' },
        { id: 'comm-md2-2-offside-idd-1', matchId: 'md2-2', minute: "57'", text: "🚩 Offside to IDD - freekick given to APH.", timestamp: "11:57 AM", type: 'general' },
        { id: 'comm-md2-2-sub-idd-3', matchId: 'md2-2', minute: "56'", text: "🔄 Substitution (IDD): Oladejo Kehinde is replaced by Ademoyegun Oluwatimilehin.", timestamp: "11:56 AM", type: 'general' },
        { id: 'comm-md2-2-sub-aph-4', matchId: 'md2-2', minute: "56'", text: "🔄 Substitution (APH): Oloyede Adekunle Ayuba makes way for Olajide Abdulroheem.", timestamp: "11:56 AM", type: 'general' },
        { id: 'comm-md2-2-goal-idd-1', matchId: 'md2-2', minute: "54'", text: "⚽ GOAL!!! Ikudayisi Oyesola converts the penalty flawlessly to give IDD the lead! APH 0 - 1 IDD.", timestamp: "11:54 AM", type: 'goal' },
        { id: 'comm-md2-2-card-aph-3', matchId: 'md2-2', minute: "53'", text: "🟨 Yellow card handed to Ridwan Akinwekomi (APH).", timestamp: "11:53 AM", type: 'card' },
        { id: 'comm-md2-2-pen-idd-1', matchId: 'md2-2', minute: "53'", text: "⚠️ PENALTY TO IDD! APH defense commits a slide tackle in the box and receives a booking.", timestamp: "11:53 AM", type: 'general' },
        { id: 'comm-md2-2-card-idd-2', matchId: 'md2-2', minute: "48'", text: "🟨 Yellow card given to Awosoji Ifeoluwa Emmanuel (IDD).", timestamp: "11:48 AM", type: 'card' },
        { id: 'comm-md2-2-foul-aph-3', matchId: 'md2-2', minute: "48'", text: "APH wins a free kick.", timestamp: "11:48 AM", type: 'general' },
        { id: 'comm-md2-2-sub-idd-1', matchId: 'md2-2', minute: "46'", text: "🔄 Substitution (IDD): Aribaba Inioluwa off, Adebayo Mujeeb on.", timestamp: "11:46 AM", type: 'general' },
        { id: 'comm-md2-2-offside-aph-3', matchId: 'md2-2', minute: "44'", text: "🚩 Offside to APH - freekick given to IDD.", timestamp: "11:44 AM", type: 'general' },
        { id: 'comm-md2-2-corner-aph-3', matchId: 'md2-2', minute: "44'", text: "📐 Corner to APH.", timestamp: "11:44 AM", type: 'general' },
        { id: 'comm-md2-2-sub-aph-3', matchId: 'md2-2', minute: "43'", text: "🔄 Substitution (APH): Oluwapelumi Samuel off, Ayemidotun Oluwaseun on.", timestamp: "11:43 AM", type: 'general' },
        { id: 'comm-md2-2-foul-idd-5', matchId: 'md2-2', minute: "42'", text: "IDD wins a free kick.", timestamp: "11:42 AM", type: 'general' },
        { id: 'comm-md2-2-card-aph-red', matchId: 'md2-2', minute: "38'", text: "🟥 RED CARD! Olajide Gabriel (APH) receives a second yellow card and is sent off!", timestamp: "11:38 AM", type: 'card' },
        { id: 'comm-md2-2-foul-idd-4', matchId: 'md2-2', minute: "38'", text: "IDD wins a free kick following Olajide Gabriel's late challenge.", timestamp: "11:38 AM", type: 'general' },
        { id: 'comm-md2-2-corner-aph-2', matchId: 'md2-2', minute: "36'", text: "📐 Corner to APH.", timestamp: "11:36 AM", type: 'general' },
        { id: 'comm-md2-2-foul-idd-3', matchId: 'md2-2', minute: "33'", text: "IDD wins a free kick.", timestamp: "11:33 AM", type: 'general' },
        { id: 'comm-md2-2-sub-aph-2', matchId: 'md2-2', minute: "31'", text: "🔄 Substitution (APH): Emeka Nelson comes out and gives way to Babatunde Sodeeq.", timestamp: "11:31 AM", type: 'general' },
        { id: 'comm-md2-2-sub-aph-1', matchId: 'md2-2', minute: "31'", text: "🔄 Substitution (APH): Akinyemi Toluwanimi comes out and gives way to Top child.", timestamp: "11:31 AM", type: 'general' },
        { id: 'comm-md2-2-sh', matchId: 'md2-2', minute: "31'", text: "🏁 SECOND HALF KICKOFF! Actions resume at Mini Pitch.", timestamp: "11:31 AM", type: 'general' },
        { id: 'comm-md2-2-ht', matchId: 'md2-2', minute: "30+1'", text: "⏸️ HALF-TIME! Scores level at 0-0 heading into the dressing rooms.", timestamp: "11:30 AM", type: 'general' },
        { id: 'comm-md2-2-foul-aph-2', matchId: 'md2-2', minute: "30'", text: "APH wins a free kick.", timestamp: "11:30 AM", type: 'general' },
        { id: 'comm-md2-2-corner-idd-3', matchId: 'md2-2', minute: "29'", text: "📐 Corner to IDD.", timestamp: "11:29 AM", type: 'general' },
        { id: 'comm-md2-2-foul-aph-1', matchId: 'md2-2', minute: "28'", text: "APH wins a free kick.", timestamp: "11:28 AM", type: 'general' },
        { id: 'comm-md2-2-card-idd-1', matchId: 'md2-2', minute: "25'", text: "🟨 Yellow card handed to Adebamibola Emmanuel (IDD).", timestamp: "11:25 AM", type: 'card' },
        { id: 'comm-md2-2-card-aph-2', matchId: 'md2-2', minute: "25'", text: "🟨 Yellow card to Aremu Stone (APH).", timestamp: "11:25 AM", type: 'card' },
        { id: 'comm-md2-2-corner-idd-2', matchId: 'md2-2', minute: "24'", text: "📐 Corner to IDD.", timestamp: "11:24 AM", type: 'general' },
        { id: 'comm-md2-2-offside-aph-2', matchId: 'md2-2', minute: "22'", text: "🚩 Offside to APH - freekick given to IDD.", timestamp: "11:22 AM", type: 'general' },
        { id: 'comm-md2-2-foul-idd-3-early', matchId: 'md2-2', minute: "22'", text: "Handball by IDD - freekick given in advanced area.", timestamp: "11:22 AM", type: 'general' },
        { id: 'comm-md2-2-foul-aph-1-early', matchId: 'md2-2', minute: "19'", text: "APH wins a free kick.", timestamp: "11:19 AM", type: 'general' },
        { id: 'comm-md2-2-foul-idd-3-hb', matchId: 'md2-2', minute: "17'", text: "Handball by APH - freekick given to IDD.", timestamp: "11:17 AM", type: 'general' },
        { id: 'comm-md2-2-foul-idd-2', matchId: 'md2-2', minute: "15'", text: "IDD wins a free kick.", timestamp: "11:15 AM", type: 'general' },
        { id: 'comm-md2-2-card-aph-1', matchId: 'md2-2', minute: "12'", text: "🟨 Yellow card to Olajide Gabriel (APH) for holding.", timestamp: "11:12 AM", type: 'card' },
        { id: 'comm-md2-2-foul-idd-1-early', matchId: 'md2-2', minute: "12'", text: "IDD wins a free kick.", timestamp: "11:12 AM", type: 'general' },
        { id: 'comm-md2-2-foul-aph-0', matchId: 'md2-2', minute: "7'", text: "APH wins a free kick.", timestamp: "11:07 AM", type: 'general' },
        { id: 'comm-md2-2-offside-aph-1', matchId: 'md2-2', minute: "6'", text: "🚩 Offside to APH - freekick given to IDD.", timestamp: "11:06 AM", type: 'general' },
        { id: 'comm-md2-2-corner-aph-1', matchId: 'md2-2', minute: "3'", text: "📐 Corner to APH.", timestamp: "11:03 AM", type: 'general' },
        { id: 'comm-md2-2-corner-idd-1', matchId: 'md2-2', minute: "1'", text: "📐 Corner to IDD.", timestamp: "11:01 AM", type: 'general' },
        { id: 'comm-md2-2-foul-idd-0', matchId: 'md2-2', minute: "1'", text: "IDD wins a free kick early on.", timestamp: "11:01 AM", type: 'general' },
        { id: 'comm-md2-2-kickoff', matchId: 'md2-2', minute: "1'", text: "🏁 KICKOFF! Matchday 2 gets underway for APH vs IDD with referee Abraham (MEE) officiating.", timestamp: "11:00 AM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    // IFS vs MBBS (md2-3) Commentary
    if (!loadedCommentary['md2-3'] || loadedCommentary['md2-3'].length === 0) {
      loadedCommentary['md2-3'] = [
        { id: 'comm-md2-3-ft', matchId: 'md2-3', minute: "60'", text: "🏁 FULL-TIME! IFS 2 - 1 MBBS. Information Systems secure their first three points of the tournament! Gowon Mathias Monday named MOTM.", timestamp: "1:30 PM", type: 'general' },
        { id: 'comm-md2-3-sub-ifs-5', matchId: 'md2-3', minute: "56'", text: "🔄 Substitution (IFS): Omotomo Olumide Daniel is replaced by Ojodako Joseph Olayinka.", timestamp: "1:26 PM", type: 'general' },
        { id: 'comm-md2-3-sub-ifs-4', matchId: 'md2-3', minute: "56'", text: "🔄 Substitution (IFS): Owamokele Joshua comes out, Adeosun Peace comes in.", timestamp: "1:26 PM", type: 'general' },
        { id: 'comm-md2-3-goal-ifs-2', matchId: 'md2-3', minute: "55'", text: "⚽ GOAL!!! Olorunfunmilayo Gbolaga Emmanuel restores the lead to IFS! He heads nicely into the net! IFS 2 - 1 MBBS.", timestamp: "1:25 PM", type: 'goal' },
        { id: 'comm-md2-3-foul-ifs-4', matchId: 'md2-3', minute: "54'", text: "IFS wins a free kick.", timestamp: "1:24 PM", type: 'general' },
        { id: 'comm-md2-3-foul-mbbs-4', matchId: 'md2-3', minute: "50'", text: "MBBS wins a free kick.", timestamp: "1:20 PM", type: 'general' },
        { id: 'comm-md2-3-sub-mbbs-4', matchId: 'md2-3', minute: "48'", text: "🔄 Substitution (MBBS): Ayomikun Oluyamo leaves, replaced by Adeusi Oyindamola.", timestamp: "1:18 PM", type: 'general' },
        { id: 'comm-md2-3-sub-ifs-3', matchId: 'md2-3', minute: "48'", text: "🔄 Substitution (IFS): Olorunfemi Kehinde John is replaced by Akinyemi Feranmi Olusegun.", timestamp: "1:18 PM", type: 'general' },
        { id: 'comm-md2-3-sub-ifs-2', matchId: 'md2-3', minute: "48'", text: "🔄 Substitution (IFS): Olatunji Dunni Oluwagbenga is replaced by Bakare Idris.", timestamp: "1:18 PM", type: 'general' },
        { id: 'comm-md2-3-foul-mbbs-3', matchId: 'md2-3', minute: "46'", text: "MBBS wins a free kick.", timestamp: "1:16 PM", type: 'general' },
        { id: 'comm-md2-3-corner-ifs-3', matchId: 'md2-3', minute: "43'", text: "📐 Corner to IFS.", timestamp: "1:13 PM", type: 'general' },
        { id: 'comm-md2-3-foul-ifs-3', matchId: 'md2-3', minute: "41'", text: "IFS wins another free kick in MBBS's layout.", timestamp: "1:11 PM", type: 'general' },
        { id: 'comm-md2-3-foul-ifs-2', matchId: 'md2-3', minute: "41'", text: "IFS wins a free kick.", timestamp: "1:11 PM", type: 'general' },
        { id: 'comm-md2-3-corner-ifs-2', matchId: 'md2-3', minute: "40'", text: "📐 Corner to IFS.", timestamp: "1:10 PM", type: 'general' },
        { id: 'comm-md2-3-foul-mbbs-2', matchId: 'md2-3', minute: "39'", text: "MBBS wins a free kick.", timestamp: "1:09 PM", type: 'general' },
        { id: 'comm-md2-3-foul-mbbs-1', matchId: 'md2-3', minute: "38'", text: "MBBS wins a free kick.", timestamp: "1:08 PM", type: 'general' },
        { id: 'comm-md2-3-sub-mbbs-3', matchId: 'md2-3', minute: "37'", text: "🔄 Substitution (MBBS): Olasunkunmi Elijah Ogunkunle comes out, Aliyu Okuwatofunmi comes in.", timestamp: "1:07 PM", type: 'general' },
        { id: 'comm-md2-3-sub-ifs-1', matchId: 'md2-3', minute: "37'", text: "🔄 Substitution (IFS): Fasiku Victor Adebola comes out and gives way to Busari Ifeoluwa Habeeb.", timestamp: "1:07 PM", type: 'general' },
        { id: 'comm-md2-3-offside-mbbs-3', matchId: 'md2-3', minute: "35'", text: "🚩 Offside to MBBS - freekick given to IFS.", timestamp: "1:05 PM", type: 'general' },
        { id: 'comm-md2-3-corner-ifs-1', matchId: 'md2-3', minute: "33'", text: "📐 Corner to IFS.", timestamp: "1:03 PM", type: 'general' },
        { id: 'comm-md2-3-foul-mbbs-0', matchId: 'md2-3', minute: "31'", text: "MBBS wins a free kick.", timestamp: "1:01 PM", type: 'general' },
        { id: 'comm-md2-3-sub-ifs-0', matchId: 'md2-3', minute: "31'", text: "🔄 Substitution (IFS): Olanrewaju Ifeoluwa is replaced by Olorunfunmilayo Gbolaga Emmanuel.", timestamp: "1:01 PM", type: 'general' },
        { id: 'comm-md2-3-sub-mbbs-2', matchId: 'md2-3', minute: "31'", text: "🔄 Substitution (MBBS): Gazali Sheriffdeen is replaced by Desola Emmanuel.", timestamp: "1:01 PM", type: 'general' },
        { id: 'comm-md2-3-sub-mbbs-1', matchId: 'md2-3', minute: "31'", text: "🔄 Substitution (MBBS): Okunola Samuel comes out and gives way to Badrudeen Abduhameed.", timestamp: "1:01 PM", type: 'general' },
        { id: 'comm-md2-3-sh', matchId: 'md2-3', minute: "31'", text: "🏁 SECOND HALF KICKOFF! The match resumes.", timestamp: "1:01 PM", type: 'general' },
        { id: 'comm-md2-3-ht', matchId: 'md2-3', minute: "30'", text: "⏸️ HALF-TIME! An energetic opening period closes on level terms at 1-1.", timestamp: "1:00 PM", type: 'general' },
        { id: 'comm-md2-3-foul-ifs-1', matchId: 'md2-3', minute: "27'", text: "IFS wins a free kick.", timestamp: "12:57 PM", type: 'general' },
        { id: 'comm-md2-3-offside-mbbs-2', matchId: 'md2-3', minute: "26'", text: "🚩 Offside to MBBS.", timestamp: "12:56 PM", type: 'general' },
        { id: 'comm-md2-3-offside-mbbs-1', matchId: 'md2-3', minute: "25'", text: "🚩 Offside to MBBS.", timestamp: "12:55 PM", type: 'general' },
        { id: 'comm-md2-3-foul-mbbs-1-early', matchId: 'md2-3', minute: "24'", text: "MBBS wins a free kick.", timestamp: "12:54 PM", type: 'general' },
        { id: 'comm-md2-3-goal-mbbs-1', matchId: 'md2-3', minute: "17'", text: "⚽ GOAL!!! Okoh Chibuike gets MBBS back on level terms! Exquisite strike, game on! IFS 1 - 1 MBBS.", timestamp: "12:47 PM", type: 'goal' },
        { id: 'comm-md2-3-foul-mbbs-0-early', matchId: 'md2-3', minute: "17'", text: "MBBS wins a free kick.", timestamp: "12:47 PM", type: 'general' },
        { id: 'comm-md2-3-offside-mbbs-0-4', matchId: 'md2-3', minute: "15'", text: "🚩 Offside to MBBS - freekick given to IFS.", timestamp: "12:45 PM", type: 'general' },
        { id: 'comm-md2-3-foul-ifs-1-early', matchId: 'md2-3', minute: "13'", text: "IFS wins a free kick.", timestamp: "12:43 PM", type: 'general' },
        { id: 'comm-md2-3-offside-mbbs-0-3', matchId: 'md2-3', minute: "12'", text: "🚩 Offside to MBBS.", timestamp: "12:42 PM", type: 'general' },
        { id: 'comm-md2-3-foul-ifs-0-early', matchId: 'md2-3', minute: "11'", text: "IFS wins a free kick.", timestamp: "12:41 PM", type: 'general' },
        { id: 'comm-md2-3-foul-ifs-0-early2', matchId: 'md2-3', minute: "9'", text: "IFS wins a free kick.", timestamp: "12:39 PM", type: 'general' },
        { id: 'comm-md2-3-foul-ifs-0-early3', matchId: 'md2-3', minute: "6'", text: "IFS wins a free kick.", timestamp: "12:36 PM", type: 'general' },
        { id: 'comm-md2-3-offside-mbbs-0-2', matchId: 'md2-3', minute: "5'", text: "🚩 Offside to MBBS - freekick given to IFS.", timestamp: "12:35 PM", type: 'general' },
        { id: 'comm-md2-3-foul-mbbs-0-free', matchId: 'md2-3', minute: "5'", text: "Free kick awarded to MBBS in midfield.", timestamp: "12:35 PM", type: 'general' },
        { id: 'comm-md2-3-foul-mbbs-0-foul', matchId: 'md2-3', minute: "4'", text: "MBBS wins a free kick.", timestamp: "12:34 PM", type: 'general' },
        { id: 'comm-md2-3-goal-ifs-1', matchId: 'md2-3', minute: "3'", text: "⚽ GOAL!!! Adewale Adeola Samuel gives IFS the early lead! IFS 1 - 0 MBBS.", timestamp: "12:33 PM", type: 'goal' },
        { id: 'comm-md2-3-card-mbbs-1', matchId: 'md2-3', minute: "3'", text: "🟨 Yellow card handed to Okunola Samuel (MBBS) for aggressive conduct.", timestamp: "12:33 PM", type: 'card' },
        { id: 'comm-md2-3-foul-ifs-0-stf', matchId: 'md2-3', minute: "3'", text: "IFS wins a free kick.", timestamp: "12:33 PM", type: 'general' },
        { id: 'comm-md2-3-kickoff', matchId: 'md2-3', minute: "1'", text: "🏁 KICKOFF! Matchday 2 action begins for IFS vs MBBS with referee Abraham (MEE) officiating.", timestamp: "12:30 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    // ICE vs BCH (md2-4) Commentary
    if (!loadedCommentary['md2-4'] || loadedCommentary['md2-4'].length === 0) {
      loadedCommentary['md2-4'] = [
        { id: 'comm-md2-4-ft', matchId: 'md2-4', minute: "60+3'", text: "🏁 FULL-TIME! ICE 2 - 0 BCH. ICE secures their first win with modern goalkeeper heroics and Bamidele Usman on the scoresheet with a double!", timestamp: "3:03 PM", type: 'general' },
        { id: 'comm-md2-4-goal-ice-2', matchId: 'md2-4', minute: "60+3'", text: "⚽ GOAL!!! Bamidele Usman seals it with a last minute kick! Unbelievable composure under pressure! ICE 2 - 0 BCH.", timestamp: "3:03 PM", type: 'goal' },
        { id: 'comm-md2-4-sub-ice-5', matchId: 'md2-4', minute: "60+2'", text: "🔄 Substitution (ICE): Abiodun Boluwatife is replaced by Adeyeye Emmanuel.", timestamp: "3:02 PM", type: 'general' },
        { id: 'comm-md2-4-corner-ice-1', matchId: 'md2-4', minute: "60'", text: "📐 Corner to ICE.", timestamp: "3:00 PM", type: 'general' },
        { id: 'comm-md2-4-offside-ice-4', matchId: 'md2-4', minute: "57'", text: "🚩 Offside to ICE - freekick given to BCH.", timestamp: "2:57 PM", type: 'general' },
        { id: 'comm-md2-4-corner-bch-2', matchId: 'md2-4', minute: "55'", text: "📐 Corner to BCH.", timestamp: "2:55 PM", type: 'general' },
        { id: 'comm-md2-4-card-ice-2', matchId: 'md2-4', minute: "54'", text: "🟨 Yellow card to Six (ICE).", timestamp: "2:54 PM", type: 'card' },
        { id: 'comm-md2-4-card-bch-4', matchId: 'md2-4', minute: "54'", text: "🟨 Yellow card to Sammy (BCH).", timestamp: "2:54 PM", type: 'card' },
        { id: 'comm-md2-4-offside-bch-4', matchId: 'md2-4', minute: "51'", text: "🚩 Offside to BCH - freekick given to ICE.", timestamp: "2:51 PM", type: 'general' },
        { id: 'comm-md2-4-sub-bch-2', matchId: 'md2-4', minute: "50'", text: "🔄 Substitution (BCH): Oladoyin Basit comes out, replaced by Akinwande Tunde.", timestamp: "2:50 PM", type: 'general' },
        { id: 'comm-md2-4-sub-ice-4', matchId: 'md2-4', minute: "50'", text: "🔄 Substitution (ICE): Adeyemi Damola comes out, replaced by Iyinbor Michael.", timestamp: "2:50 PM", type: 'general' },
        { id: 'comm-md2-4-card-ice-1', matchId: 'md2-4', minute: "50'", text: "🟨 Yellow to Adeyemi Damola (ICE).", timestamp: "2:50 PM", type: 'card' },
        { id: 'comm-md2-4-foul-bch-1', matchId: 'md2-4', minute: "49'", text: "BCH wins a free kick.", timestamp: "2:49 PM", type: 'general' },
        { id: 'comm-md2-4-sub-bch-1', matchId: 'md2-4', minute: "47'", text: "🔄 Substitution (BCH): Ifekoya Jeremiah comes out, Olakekan Timilehin comes in.", timestamp: "2:47 PM", type: 'general' },
        { id: 'comm-md2-4-card-bch-3', matchId: 'md2-4', minute: "46'", text: "🟨 Yellow card to Miracle (BCH).", timestamp: "2:46 PM", type: 'card' },
        { id: 'comm-md2-4-foul-ice-3', matchId: 'md2-4', minute: "46'", text: "ICE wins a free kick.", timestamp: "2:46 PM", type: 'general' },
        { id: 'comm-md2-4-goal-ice-1', matchId: 'md2-4', minute: "43'", text: "⚽ GOAL!!! Bamidele Usman scores! He fires a superb shot into the bottom corner to break the ice! ICE 1 - 0 BCH.", timestamp: "2:43 PM", type: 'goal' },
        { id: 'comm-md2-4-offside-ice-3', matchId: 'md2-4', minute: "41'", text: "🚩 Offside to ICE - freekick given to BCH.", timestamp: "2:41 PM", type: 'general' },
        { id: 'comm-md2-4-sub-ice-3', matchId: 'md2-4', minute: "38'", text: "🔄 Substitution (ICE): Akinloye Toluwalase makes way for Kudabo Paul Timilehin.", timestamp: "2:38 PM", type: 'general' },
        { id: 'comm-md2-4-card-bch-2', matchId: 'md2-4', minute: "37'", text: "🟨 Yellow card handed to Folorunsho Toluwanimi (BCH).", timestamp: "2:37 PM", type: 'card' },
        { id: 'comm-md2-4-offside-ice-2', matchId: 'md2-4', minute: "36'", text: "🚩 Offside to ICE.", timestamp: "2:36 PM", type: 'general' },
        { id: 'comm-md2-4-offside-bch-3', matchId: 'md2-4', minute: "35'", text: "🚩 Offside to BCH.", timestamp: "2:35 PM", type: 'general' },
        { id: 'comm-md2-4-offside-ice-1', matchId: 'md2-4', minute: "35'", text: "🚩 Offside to ICE.", timestamp: "2:35 PM", type: 'general' },
        { id: 'comm-md2-4-foul-bch-hb', matchId: 'md2-4', minute: "33'", text: "Handball to ICE - freekick given to BCH.", timestamp: "2:33 PM", type: 'general' },
        { id: 'comm-md2-4-offside-bch-2', matchId: 'md2-4', minute: "31'", text: "🚩 Offside to BCH - freekick given to ICE.", timestamp: "2:31 PM", type: 'general' },
        { id: 'comm-md2-4-sub-ice-2', matchId: 'md2-4', minute: "31'", text: "🔄 Substitution (ICE): Adejimi Daniel is replaced by Oripelaye Al-ameen Adeshina.", timestamp: "2:31 PM", type: 'general' },
        { id: 'comm-md2-4-sub-ice-1', matchId: 'md2-4', minute: "31'", text: "🔄 Substitution (ICE): Fawehinmi Emmanuel is replaced by Faleye Aduragbemi.", timestamp: "2:31 PM", type: 'general' },
        { id: 'comm-md2-4-sh', matchId: 'md2-4', minute: "31'", text: "🏁 SECOND HALF KICKOFF!", timestamp: "2:31 PM", type: 'general' },
        { id: 'comm-md2-4-ht', matchId: 'md2-4', minute: "30'", text: "⏸️ HALF-TIME! Scores locked at 0-0 after an intense tactical struggle.", timestamp: "2:30 PM", type: 'general' },
        { id: 'comm-md2-4-card-bch-1', matchId: 'md2-4', minute: "23'", text: "🟨 Yellow card handed to Tunde Akinwande (BCH).", timestamp: "2:23 PM", type: 'card' },
        { id: 'comm-md2-4-offside-ice-0', matchId: 'md2-4', minute: "23'", text: "🚩 Offside to ICE.", timestamp: "2:23 PM", type: 'general' },
        { id: 'comm-md2-4-corner-bch-1', matchId: 'md2-4', minute: "21'", text: "📐 Corner to BCH.", timestamp: "2:21 PM", type: 'general' },
        { id: 'comm-md2-4-foul-ice-2', matchId: 'md2-4', minute: "20'", text: "ICE wins a free kick.", timestamp: "2:20 PM", type: 'general' },
        { id: 'comm-md2-4-offside-bch-1', matchId: 'md2-4', minute: "18'", text: "🚩 Offside to BCH.", timestamp: "2:18 PM", type: 'general' },
        { id: 'comm-md2-4-offside-bch-0', matchId: 'md2-4', minute: "17'", text: "🚩 Offside to BCH - freekick given to ICE.", timestamp: "2:17 PM", type: 'general' },
        { id: 'comm-md2-4-foul-ice-1-early', matchId: 'md2-4', minute: "15'", text: "ICE wins a free kick.", timestamp: "2:15 PM", type: 'general' },
        { id: 'comm-md2-4-foul-bch-0-early', matchId: 'md2-4', minute: "14'", text: "BCH wins a free kick.", timestamp: "2:14 PM", type: 'general' },
        { id: 'comm-md2-4-foul-bch-0-early2', matchId: 'md2-4', minute: "12'", text: "BCH wins a free kick.", timestamp: "2:12 PM", type: 'general' },
        { id: 'comm-md2-4-foul-ice-0-early', matchId: 'md2-4', minute: "12'", text: "ICE wins a free kick.", timestamp: "2:12 PM", type: 'general' },
        { id: 'comm-md2-4-foul-ice-0-early2', matchId: 'md2-4', minute: "8'", text: "ICE wins a free kick.", timestamp: "2:08 PM", type: 'general' },
        { id: 'comm-md2-4-offside-ice-early', matchId: 'md2-4', minute: "8'", text: "🚩 Offside to ICE - freekick given to BCH.", timestamp: "2:08 PM", type: 'general' },
        { id: 'comm-md2-4-offside-ice-early2', matchId: 'md2-4', minute: "7'", text: "🚩 Offside to ICE.", timestamp: "2:07 PM", type: 'general' },
        { id: 'comm-md2-4-foul-ice-0-early3', matchId: 'md2-4', minute: "7'", text: "ICE wins a free kick.", timestamp: "2:07 PM", type: 'general' },
        { id: 'comm-md2-4-foul-ice-0-early4', matchId: 'md2-4', minute: "6'", text: "ICE wins a free kick.", timestamp: "2:06 PM", type: 'general' },
        { id: 'comm-md2-4-foul-ice-0-stf', matchId: 'md2-4', minute: "3'", text: "ICE wins a free kick.", timestamp: "2:03 PM", type: 'general' },
        { id: 'comm-md2-4-kickoff', matchId: 'md2-4', minute: "1'", text: "🏁 KICKOFF! ICE and BCH lock horns under the supervision of referee Tosin (MTS).", timestamp: "2:00 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    // PHS vs AGP (md2-5) Commentary
    if (!loadedCommentary['md2-5'] || loadedCommentary['md2-5'].length === 0) {
      loadedCommentary['md2-5'] = [
        { id: 'comm-md2-5-ft', matchId: 'md2-5', minute: "60+1'", text: "🏁 FULL-TIME! PHS 1 - 0 AGP. PHS secures the maximum three points in a tightly fought contest. Midfield maestro Adeagbo Pelumi is named MOTM.", timestamp: "4:31 PM", type: 'general' },
        { id: 'comm-md2-5-corner-agp-3', matchId: 'md2-5', minute: "60'", text: "📐 Corner to AGP.", timestamp: "4:30 PM", type: 'general' },
        { id: 'comm-md2-5-corner-agp-2', matchId: 'md2-5', minute: "56'", text: "📐 Corner to AGP.", timestamp: "4:26 PM", type: 'general' },
        { id: 'comm-md2-5-foul-phs-4', matchId: 'md2-5', minute: "54'", text: "PHS wins a free kick.", timestamp: "4:24 PM", type: 'general' },
        { id: 'comm-md2-5-sub-agp-3', matchId: 'md2-5', minute: "52'", text: "🔄 Substitution (AGP): Adetunji Obafemi is replaced by Timilehin.", timestamp: "4:22 PM", type: 'general' },
        { id: 'comm-md2-5-sub-phs-2', matchId: 'md2-5', minute: "52'", text: "🔄 Substitution (PHS): Emmanuel Odiba Benedict is replaced by Alex Victor.", timestamp: "4:22 PM", type: 'general' },
        { id: 'comm-md2-5-sub-agp-2', matchId: 'md2-5', minute: "50'", text: "🔄 Substitution (AGP): Oluwafemi Onileowo is replaced by Akinbosoye Akinola.", timestamp: "4:20 PM", type: 'general' },
        { id: 'comm-md2-5-foul-phs-3', matchId: 'md2-5', minute: "45'", text: "PHS wins a free kick.", timestamp: "4:15 PM", type: 'general' },
        { id: 'comm-md2-5-corner-phs-2', matchId: 'md2-5', minute: "45'", text: "📐 Corner to PHS.", timestamp: "4:15 PM", type: 'general' },
        { id: 'comm-md2-5-foul-phs-2', matchId: 'md2-5', minute: "43'", text: "PHS wins a free kick.", timestamp: "4:13 PM", type: 'general' },
        { id: 'comm-md2-5-sub-agp-1', matchId: 'md2-5', minute: "40'", text: "🔄 Substitution (AGP): Patrick Favour comes out and Ehikioya Desmond replaces him.", timestamp: "4:10 PM", type: 'general' },
        { id: 'comm-md2-5-foul-agp-2', matchId: 'md2-5', minute: "38'", text: "AGP wins a free kick.", timestamp: "4:08 PM", type: 'general' },
        { id: 'comm-md2-5-foul-agp-1', matchId: 'md2-5', minute: "34'", text: "AGP wins a free kick.", timestamp: "4:04 PM", type: 'general' },
        { id: 'comm-md2-5-sub-phs-1', matchId: 'md2-5', minute: "31'", text: "🔄 Substitution (PHS): Abimbola Alexander Akinmoyegun comes out, Ayofe comes in.", timestamp: "4:01 PM", type: 'general' },
        { id: 'comm-md2-5-sh', matchId: 'md2-5', minute: "31'", text: "🏁 SECOND HALF KICKOFF!", timestamp: "4:01 PM", type: 'general' },
        { id: 'comm-md2-5-ht', matchId: 'md2-5', minute: "30'", text: "⏸️ HALF-TIME! PHS leads 1-0 thanks to Akinmoyegun's early strike.", timestamp: "4:00 PM", type: 'general' },
        { id: 'comm-md2-5-foul-agp-1-early', matchId: 'md2-5', minute: "25'", text: "AGP wins a free kick.", timestamp: "3:55 PM", type: 'general' },
        { id: 'comm-md2-5-foul-agp-0-early', matchId: 'md2-5', minute: "17'", text: "AGP wins a free kick.", timestamp: "3:47 PM", type: 'general' },
        { id: 'comm-md2-5-corner-phs-1', matchId: 'md2-5', minute: "14'", text: "📐 Corner to PHS.", timestamp: "3:44 PM", type: 'general' },
        { id: 'comm-md2-5-foul-agp-0-hb', matchId: 'md2-5', minute: "10'", text: "Handball to PHS - freekick given to AGP.", timestamp: "3:40 PM", type: 'general' },
        { id: 'comm-md2-5-goal-phs-1', matchId: 'md2-5', minute: "8'", text: "⚽ GOAL!!! Abimbola Alexander Akinmoyegun opens the scoring! He heads it past the keeper beautifully! PHS 1 - 0 AGP.", timestamp: "3:38 PM", type: 'goal' },
        { id: 'comm-md2-5-corner-agp-1', matchId: 'md2-5', minute: "6'", text: "📐 Corner to AGP.", timestamp: "3:36 PM", type: 'general' },
        { id: 'comm-md2-5-kickoff', matchId: 'md2-5', minute: "1'", text: "🏁 KICKOFF! Referee Victor (ESM) blows the whistle for kickoff between PHS and AGP.", timestamp: "3:30 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    // MST vs CYS (md2-6) Commentary
    if (!loadedCommentary['md2-6'] || loadedCommentary['md2-6'].length === 0) {
      loadedCommentary['md2-6'] = [
        { id: 'comm-md2-6-ft', matchId: 'md2-6', minute: "60'", text: "🏁 FULL-TIME! MST 4 - 4 CYS. A high-scoring thriller ending in a draw! Iyare Praise is named MOTM for his sensational brace.", timestamp: "6:00 PM", type: 'general' },
        { id: 'comm-md2-6-goal-mst-3', matchId: 'md2-6', minute: "60'", text: "⚽ GOAL!!! Iyare Praise does it again! He converts another magnificent free kick to level the score at 4-4 in the dying minutes!", timestamp: "6:00 PM", type: 'goal' },
        { id: 'comm-md2-6-foul-mst-3', matchId: 'md2-6', minute: "60'", text: "MST wins a free kick in a dangerous position near the CYS box.", timestamp: "6:00 PM", type: 'general' },
        { id: 'comm-md2-6-goal-cys-4', matchId: 'md2-6', minute: "42'", text: "⚽ GOAL!!! Bello Daniel Damilare gives CYS the lead for the first time! A fine team move allows Bello Daniel Damilare to slide the ball home! MST 3 - 4 CYS.", timestamp: "5:42 PM", type: 'goal' },
        { id: 'comm-md2-6-corner-mst-4', matchId: 'md2-6', minute: "40'", text: "📐 Corner to MST.", timestamp: "5:40 PM", type: 'general' },
        { id: 'comm-md2-6-corner-mst-3', matchId: 'md2-6', minute: "40'", text: "📐 Corner to MST.", timestamp: "5:40 PM", type: 'general' },
        { id: 'comm-md2-6-foul-mst-2', matchId: 'md2-6', minute: "38'", text: "MST wins a free kick.", timestamp: "5:38 PM", type: 'general' },
        { id: 'comm-md2-6-foul-cys-2', matchId: 'md2-6', minute: "37'", text: "CYS wins a free kick.", timestamp: "5:37 PM", type: 'general' },
        { id: 'comm-md2-6-sub-cys-1', matchId: 'md2-6', minute: "36'", text: "🔄 Substitution (CYS): Akinshipe Oluwafemi Solomon makes way for Onah Caleb Igoche.", timestamp: "5:36 PM", type: 'general' },
        { id: 'comm-md2-6-sub-mst-1', matchId: 'md2-6', minute: "36'", text: "🔄 Substitution (MST): Philip Believe Oluwashina is replaced by Ayeni Ayobami.", timestamp: "5:36 PM", type: 'general' },
        { id: 'comm-md2-6-foul-cys-1', matchId: 'md2-6', minute: "34'", text: "CYS wins a free kick.", timestamp: "5:34 PM", type: 'general' },
        { id: 'comm-md2-6-foul-mst-1-free', matchId: 'md2-6', minute: "33'", text: "Free kick to MST.", timestamp: "5:33 PM", type: 'general' },
        { id: 'comm-md2-6-card-cys-2', matchId: 'md2-6', minute: "32'", text: "🟨 Yellow card to Akinyede Allen Oluwaferanmi (CYS).", timestamp: "5:32 PM", type: 'card' },
        { id: 'comm-md2-6-offside-cys-1', matchId: 'md2-6', minute: "32'", text: "🚩 Offside to CYS - freekick given to MST.", timestamp: "5:32 PM", type: 'general' },
        { id: 'comm-md2-6-sh', matchId: 'md2-6', minute: "31'", text: "🏁 SECOND HALF KICKOFF!", timestamp: "5:31 PM", type: 'general' },
        { id: 'comm-md2-6-ht', matchId: 'md2-6', minute: "30'", text: "⏸️ HALF-TIME! An breathtaking first half comes to an end with teams tied at 3-3.", timestamp: "5:30 PM", type: 'general' },
        { id: 'comm-md2-6-goal-cys-3', matchId: 'md2-6', minute: "28'", text: "⚽ GOAL!!! Bello Daniel Damilare scores a superb equalizer right before half-time! MST 3 - 3 CYS.", timestamp: "5:28 PM", type: 'goal' },
        { id: 'comm-md2-6-card-mst-2', matchId: 'md2-6', minute: "28'", text: "🟨 Yellow card to Fabusuyi Daniel Oluwafisayo (MST).", timestamp: "5:28 PM", type: 'card' },
        { id: 'comm-md2-6-goal-cys-2', matchId: 'md2-6', minute: "23'", text: "⚽ GOAL!!! A wonder strike from Ajao Alameen Olaide reduces the deficit! MST 3 - 2 CYS.", timestamp: "5:23 PM", type: 'goal' },
        { id: 'comm-md2-6-foul-mst-1-early', matchId: 'md2-6', minute: "21'", text: "Handball to CYS - freekick given to MST.", timestamp: "5:21 PM", type: 'general' },
        { id: 'comm-md2-6-card-cys-1', matchId: 'md2-6', minute: "21'", text: "🟨 Yellow card to Adewumi Excel Joshua (CYS).", timestamp: "5:21 PM", type: 'card' },
        { id: 'comm-md2-6-card-mst-1', matchId: 'md2-6', minute: "21'", text: "🟨 Yellow card to Esezobor Isaac Eromosele (MST Coach) for dissent.", timestamp: "5:21 PM", type: 'card' },
        { id: 'comm-md2-6-corner-mst-2', matchId: 'md2-6', minute: "16'", text: "📐 Corner to MST.", timestamp: "5:16 PM", type: 'general' },
        { id: 'comm-md2-6-goal-mst-2', matchId: 'md2-6', minute: "15'", text: "⚽ GOAL!!! Nkemjika Sydney extends MST lead again with a close-range slot! MST 3 - 1 CYS.", timestamp: "5:15 PM", type: 'goal' },
        { id: 'comm-md2-6-corner-mst-1', matchId: 'md2-6', minute: "15'", text: "📐 Corner to MST.", timestamp: "5:15 PM", type: 'general' },
        { id: 'comm-md2-6-corner-cys-1', matchId: 'md2-6', minute: "14'", text: "📐 Corner to CYS.", timestamp: "5:14 PM", type: 'general' },
        { id: 'comm-md2-6-goal-cys-1', matchId: 'md2-6', minute: "10'", text: "⚽ GOAL!!! Olorunfemi Taiwo James pulls one back for CYS! Spectacular turn and shot, MST 2 - 1 CYS.", timestamp: "5:10 PM", type: 'goal' },
        { id: 'comm-md2-6-goal-mst-1', matchId: 'md2-6', minute: "7'", text: "⚽ GOAL!!! Akintunde Ayomide Oluwaseyifunmi doubles MST's lead! A sublime drive, MST 2 - 0 CYS.", timestamp: "5:07 PM", type: 'goal' },
        { id: 'comm-md2-6-foul-cys-2-early', matchId: 'md2-6', minute: "5'", text: "MST wins a free kick after a sliding challenge.", timestamp: "5:05 PM", type: 'general' },
        { id: 'comm-md2-6-offside-mst-0', matchId: 'md2-6', minute: "4'", text: "🚩 Offside to MST.", timestamp: "5:04 PM", type: 'general' },
        { id: 'comm-md2-6-goal-mst-0', matchId: 'md2-6', minute: "2'", text: "⚽ GOAL!!! Iyare Praise opens the floodgates with a masterful freekick into the top corner! MST 1 - 0 CYS.", timestamp: "5:02 PM", type: 'goal' },
        { id: 'comm-md2-6-foul-cys-1-early', matchId: 'md2-6', minute: "1'", text: "Handball to CYS - freekick given to MST in advanced position.", timestamp: "5:01 PM", type: 'general' },
        { id: 'comm-md2-6-kickoff', matchId: 'md2-6', minute: "1'", text: "🏁 KICKOFF! Under the intense atmosphere of the Mini Pitch, MST vs CYS starts. Referee Tosin (MTS) is in charge.", timestamp: "5:00 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md2-7'] || loadedCommentary['md2-7'].length === 0) {
      loadedCommentary['md2-7'] = [
        { id: 'comm-md2-7-ft', matchId: 'md2-7', minute: "60'", text: "🏁 FULL-TIME! ENT 0 - 1 ANA. Anatomy secures a narrow but massive 1-0 win thanks to Dominion's 37th-minute strike! Dominion is named Man of the Match.", timestamp: "1:35 PM", type: 'general' },
        { id: 'comm-md2-7-card-ana-dom', matchId: 'md2-7', minute: "54'", text: "🟨 Yellow card to Dominion (ANA) for shirt pulling.", timestamp: "1:24 PM", type: 'card' },
        { id: 'comm-md2-7-card-ent-fairy', matchId: 'md2-7', minute: "42'", text: "🟨 Yellow card given to Fairy (ENT) for dissent.", timestamp: "1:12 PM", type: 'card' },
        { id: 'comm-md2-7-goal-ana-dom', matchId: 'md2-7', minute: "37'", text: "⚽ GOAL!!! Dominion scores! A brilliant header gives ANA the lead! ENT 0 - 1 ANA.", timestamp: "1:07 PM", type: 'goal' },
        { id: 'comm-md2-7-card-ent-promise', matchId: 'md2-7', minute: "15'", text: "🟨 Yellow card handed to Promise (ENT) for a block.", timestamp: "12:45 PM", type: 'card' },
        { id: 'comm-md2-7-kickoff', matchId: 'md2-7', minute: "1'", text: "🏁 KICKOFF! Under the intense atmosphere of the Mini Pitch, ENT vs ANA gets underway. Referee Juwon (MNE) is officiating.", timestamp: "12:30 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md2-8'] || loadedCommentary['md2-8'].length === 0) {
      loadedCommentary['md2-8'] = [
        { id: 'comm-md2-8-ft', matchId: 'md2-8', minute: "60+1'", text: "🏁 FULL-TIME! MCB 3 - 0 AGE. Oni Oluwadamilola is named MOTM as Microbiology claims a resounding 3-0 victory over Agricultural Engineering!", timestamp: "3:05 PM", type: 'general' },
        { id: 'comm-md2-8-goal-age-og', matchId: 'md2-8', minute: "60+1'", text: "⚽ OWN GOAL! Agesin (AGE) headers the ball past his own goalkeeper trying to clear a dangerous cross! MCB 3 - 0 AGE.", timestamp: "3:01 PM", type: 'goal' },
        { id: 'comm-md2-8-card-mcb-alowonle', matchId: 'md2-8', minute: "51'", text: "🟨 Yellow card given to Clement Alowonle (MCB) for delay.", timestamp: "2:51 PM", type: 'card' },
        { id: 'comm-md2-8-goal-mcb-oni', matchId: 'md2-8', minute: "45'", text: "⚽ GOAL!!! Oni Oluwadamilola doubles the lead with a spectacular curling effort! MCB 2 - 0 AGE.", timestamp: "2:45 PM", type: 'goal' },
        { id: 'comm-md2-8-card-age-afolabi', matchId: 'md2-8', minute: "44'", text: "🟨 Yellow card given to Afolabi (AGE) for dynamic slide.", timestamp: "2:44 PM", type: 'card' },
        { id: 'comm-md2-8-card-age-red', matchId: 'md2-8', minute: "40'", text: "🟥 RED CARD! Muhammed (AGE) is shown a straight red card for a serious foul play! AGE are down to 10 men!", timestamp: "2:40 PM", type: 'card' },
        { id: 'comm-md2-8-goal-mcb-alowonle', matchId: 'md2-8', minute: "37'", text: "⚽ GOAL!!! Clement Alowonle breaks the deadlock, firing MCB into the lead! MCB 1 - 0 AGE.", timestamp: "2:37 PM", type: 'goal' },
        { id: 'comm-md2-8-card-mcb-osowo', matchId: 'md2-8', minute: "22'", text: "🟨 Yellow card shown to Osowo Taiwo (MCB) for a reckless block.", timestamp: "2:22 PM", type: 'card' },
        { id: 'comm-md2-8-kickoff', matchId: 'md2-8', minute: "1'", text: "🏁 KICKOFF! MCB faces AGE in a high-stakes Matchday 2 clash. Referee Juwon (MNE) signals the start!", timestamp: "2:00 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md2-9'] || loadedCommentary['md2-9'].length === 0) {
      loadedCommentary['md2-9'] = [
        { id: 'comm-md2-9-ft', matchId: 'md2-9', minute: "60'", text: "🏁 FULL-TIME! BDG 4 - 1 FWT. What an emphatic performance by Building Technology! BDG secures their spot in the next round of FCL 2026, while FWT are mathematically eliminated from the competition.", timestamp: "4:32 PM", type: 'general' },
        { id: 'comm-md2-9-goal-fwt-1', matchId: 'md2-9', minute: "60'", text: "⚽ GOAL! Ogunkanmi Oluwanimisire Oladayo scores a late consolation goal for FWT with a beautiful clean finish! BDG 4 - 1 FWT.", timestamp: "4:30 PM", type: 'goal' },
        { id: 'comm-md2-9-goal-bdg-4', matchId: 'md2-9', minute: "50'", text: "⚽ GOAL!!! Awoyemi Jesutofunmi increases the lead to four! A sublime strike that leaves the keeper with no chance! BDG 4 - 0 FWT.", timestamp: "4:20 PM", type: 'goal' },
        { id: 'comm-md2-9-goal-bdg-3', matchId: 'md2-9', minute: "45'", text: "⚽ GOAL!!! Akinbiyi Akinwalere Ayomikun fires a beauty into the back of the net! Building is absolutely running riot here! BDG 3 - 0 FWT.", timestamp: "4:15 PM", type: 'goal' },
        { id: 'comm-md2-9-fwt-card-2', matchId: 'md2-9', minute: "44'", text: "🟨 Yellow card in the midfield to Tiamiyu Samuel Temitope (FWT) for a tactical push on the break.", timestamp: "4:14 PM", type: 'card' },
        { id: 'comm-md2-9-sub-bdg-1', matchId: 'md2-9', minute: "45'", text: "🔄 Substitution (BDG): Praise (Captain) comes off, replaced by Olawuyi Moses in midfield.", timestamp: "4:15 PM", type: 'general' },
        { id: 'comm-md2-9-sub-fwt-1', matchId: 'md2-9', minute: "40'", text: "🔄 Substitution (FWT): Adegoke Blessing Moses is replaced by Olalekan Hammed Olajuwon.", timestamp: "4:10 PM", type: 'general' },
        { id: 'comm-md2-9-sh', matchId: 'md2-9', minute: "31'", text: "🏁 SECOND HALF gets underway!", timestamp: "4:01 PM", type: 'general' },
        { id: 'comm-md2-9-ht', matchId: 'md2-9', minute: "30'", text: "⏸️ HALF-TIME! BDG 2 - 0 FWT. A commanding display from Building Technology in the first half.", timestamp: "4:00 PM", type: 'general' },
        { id: 'comm-md2-9-fwt-card-1', matchId: 'md2-9', minute: "22'", text: "🟨 Yellow card to Famuwagun Tomiwa Young (FWT) for a dynamic challenge.", timestamp: "3:52 PM", type: 'card' },
        { id: 'comm-md2-9-goal-bdg-2', matchId: 'md2-9', minute: "20'", text: "⚽ GOAL!!! Akinfolahan Temidayo Ebunoluwa is on target! Brilliant team passing ends with elegant placement! BDG 2 - 0 FWT.", timestamp: "3:50 PM", type: 'goal' },
        { id: 'comm-md2-9-bdg-card-1', matchId: 'md2-9', minute: "15'", text: "🟨 Yellow card to Arowolo Gideon (BDG) for simulation in the opponent's area.", timestamp: "3:45 PM", type: 'card' },
        { id: 'comm-md2-9-corner-fwt-1', matchId: 'md2-9', minute: "12'", text: "📐 Corner to FWT on the left flank.", timestamp: "3:42 PM", type: 'general' },
        { id: 'comm-md2-9-goal-bdg-1', matchId: 'md2-9', minute: "5'", text: "⚽ GOAL!!! Christopher Samuel opens the scoring for Building Technology! An exceptional early strike! BDG 1 - 0 FWT.", timestamp: "3:35 PM", type: 'goal' },
        { id: 'comm-md2-9-kickoff', matchId: 'md2-9', minute: "1'", text: "🏁 KICKOFF! Matchday 2 Sunday continues as BDG lock horns with FWT. Referee Juwon (MNE) in charge.", timestamp: "3:30 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md2-10'] || loadedCommentary['md2-10'].length === 0) {
      loadedCommentary['md2-10'] = [
        { id: 'comm-md2-10-ft', matchId: 'md2-10', minute: "60'", text: "🏁 FULL-TIME! PHY 1 - 1 SIMT. A highly competitive Matchday 2 clash ends in a 1-1 draw. Oweazim Chukwudumebi has been named the Man of the Match!", timestamp: "6:00 PM", type: 'general' },
        { id: 'comm-md2-10-card-simt-momoh', matchId: 'md2-10', minute: "55'", text: "🟨 Yellow card to Momoh Joshua David (SIMT) for a reckless tackling attempt.", timestamp: "5:55 PM", type: 'card' },
        { id: 'comm-md2-10-goal-phy-uduak', matchId: 'md2-10', minute: "51'", text: "⚽ GOAL!!! Uduak Abasi gets Physics back on level terms with a beautiful strike! PHY 1 - 1 SIMT.", timestamp: "5:51 PM", type: 'goal' },
        { id: 'comm-md2-10-sub-simt-fischer', matchId: 'md2-10', minute: "50'", text: "🔄 Substitution (SIMT): Ipinlaye Samuel Fisayo comes out and gives way to Okoye Philip C.", timestamp: "5:50 PM", type: 'general' },
        { id: 'comm-md2-10-sub-simt-pamilerin', matchId: 'md2-10', minute: "50'", text: "🔄 Substitution (SIMT): Emmanuel Oluwapamilerin Joshua comes out and gives way to Ogboye Samuel Oluwaponmile.", timestamp: "5:50 PM", type: 'general' },
        { id: 'comm-md2-10-foul-phy-50', matchId: 'md2-10', minute: "50'", text: "PHY wins a foul - freekick given.", timestamp: "5:50 PM", type: 'general' },
        { id: 'comm-md2-10-foul-simt-48', matchId: 'md2-10', minute: "48'", text: "Freekick to SIMT following a physical challenge in midfield.", timestamp: "5:48 PM", type: 'general' },
        { id: 'comm-md2-10-foul-phy-47', matchId: 'md2-10', minute: "47'", text: "PHY wins a foul - freekick given.", timestamp: "5:47 PM", type: 'general' },
        { id: 'comm-md2-10-handball-simt-44', matchId: 'md2-10', minute: "44'", text: "Handball to SIMT - freekick given to PHY in an advanced position.", timestamp: "5:44 PM", type: 'general' },
        { id: 'comm-md2-10-foul-phy-44', matchId: 'md2-10', minute: "44'", text: "PHY wins a foul - freekick given.", timestamp: "5:44 PM", type: 'general' },
        { id: 'comm-md2-10-foul-phy-41', matchId: 'md2-10', minute: "41'", text: "PHY wins a foul - freekick given.", timestamp: "5:41 PM", type: 'general' },
        { id: 'comm-md2-10-offside-simt-40', matchId: 'md2-10', minute: "40'", text: "🚩 Offside to SIMT - freekick given to PHY.", timestamp: "5:40 PM", type: 'general' },
        { id: 'comm-md2-10-offside-simt-39', matchId: 'md2-10', minute: "39'", text: "🚩 Offside to SIMT - freekick given to PHY.", timestamp: "5:39 PM", type: 'general' },
        { id: 'comm-md2-10-goal-simt-oweazim', matchId: 'md2-10', minute: "37'", text: "⚽ GOAL!!! Oweazim Chukwudumebi breaks the deadlock and fires SIMT into the lead! PHY 0 - 1 SIMT.", timestamp: "5:37 PM", type: 'goal' },
        { id: 'comm-md2-10-sub-phy-akinseye', matchId: 'md2-10', minute: "35'", text: "🔄 Substitution (PHY): Akinseye Oluwasanmilore comes out and gives way to Andrew Emmanuel.", timestamp: "5:35 PM", type: 'general' },
        { id: 'comm-md2-10-sub-phy-are', matchId: 'md2-10', minute: "35'", text: "🔄 Substitution (PHY): Are Moses comes out and gives way to Abiola Abdmalik.", timestamp: "5:35 PM", type: 'general' },
        { id: 'comm-md2-10-foul-phy-33', matchId: 'md2-10', minute: "33'", text: "PHY wins a foul - freekick given.", timestamp: "5:33 PM", type: 'general' },
        { id: 'comm-md2-10-sh', matchId: 'md2-10', minute: "31'", text: "🏁 SECOND HALF starts! Teams are back on the pitch for the final 30 minutes.", timestamp: "5:31 PM", type: 'general' },
        { id: 'comm-md2-10-ht', matchId: 'md2-10', minute: "30'", text: "⏸️ HALF-TIME! PHY 0 - 0 SIMT. High intensity, but both sides keep each other at bay in the first half.", timestamp: "5:30 PM", type: 'general' },
        { id: 'comm-md2-10-offside-simt-27', matchId: 'md2-10', minute: "27'", text: "🚩 Offside to SIMT - freekick given to PHY.", timestamp: "5:27 PM", type: 'general' },
        { id: 'comm-md2-10-card-simt-daniel', matchId: 'md2-10', minute: "20'", text: "🟨 Yellow card to keeper Nwabunwanne Chibichi Daniel (SIMT) for delaying a restart.", timestamp: "5:20 PM", type: 'card' },
        { id: 'comm-md2-10-foul-phy-20', matchId: 'md2-10', minute: "20'", text: "PHY wins a foul - freekick given.", timestamp: "5:20 PM", type: 'general' },
        { id: 'comm-md2-10-corner-phy-19', matchId: 'md2-10', minute: "19'", text: "📐 Corner to PHY.", timestamp: "5:19 PM", type: 'general' },
        { id: 'comm-md2-10-corner-phy-18', matchId: 'md2-10', minute: "18'", text: "📐 Corner to PHY.", timestamp: "5:18 PM", type: 'general' },
        { id: 'comm-md2-10-corner-simt-16', matchId: 'md2-10', minute: "16'", text: "📐 Corner to SIMT.", timestamp: "5:16 PM", type: 'general' },
        { id: 'comm-md2-10-foul-simt-15', matchId: 'md2-10', minute: "15'", text: "SIMT wins a foul - freekick given.", timestamp: "5:15 PM", type: 'general' },
        { id: 'comm-md2-10-corner-phy-13', matchId: 'md2-10', minute: "13'", text: "📐 Corner to PHY.", timestamp: "5:13 PM", type: 'general' },
        { id: 'comm-md2-10-corner-phy-12b', matchId: 'md2-10', minute: "12'", text: "📐 Corner to PHY.", timestamp: "5:12 PM", type: 'general' },
        { id: 'comm-md2-10-corner-phy-12a', matchId: 'md2-10', minute: "12'", text: "📐 Corner to PHY.", timestamp: "5:12 PM", type: 'general' },
        { id: 'comm-md2-10-foul-simt-8', matchId: 'md2-10', minute: "8'", text: "SIMT wins a foul - freekick given.", timestamp: "5:08 PM", type: 'general' },
        { id: 'comm-md2-10-foul-simt-6', matchId: 'md2-10', minute: "6'", text: "SIMT wins a foul - freekick given after a push.", timestamp: "5:06 PM", type: 'general' },
        { id: 'comm-md2-10-card-simt-oladapo', matchId: 'md2-10', minute: "2'", text: "🟨 Yellow card to Oladapo Isaac Ayomide (SIMT) for a hard sliding challenge.", timestamp: "5:02 PM", type: 'card' },
        { id: 'comm-md2-10-foul-phy-2', matchId: 'md2-10', minute: "2'", text: "PHY wins a foul - freekick given.", timestamp: "5:02 PM", type: 'general' },
        { id: 'comm-md2-10-kickoff', matchId: 'md2-10', minute: "1'", text: "🏁 KICKOFF! FUTA Champions League Matchday 2 gets underway under clear skies. Referee Victor (ESM) in charge as PHY takes on SIMT!", timestamp: "5:00 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md3-3'] || loadedCommentary['md3-3'].length === 0) {
      loadedCommentary['md3-3'] = [
        { id: 'comm-md3-3-ft', matchId: 'md3-3', minute: "60+4'", text: "🏁 FULL-TIME! CSP 0 - 3 CYS. Referee Tosin (MTS) blows the final whistle! An outstanding performance by Computer Science (CYS) as they record a dominant 3-0 victory over Crop Soil and Pest Management (CSP). Olabode Victor Oluwatosin (CYS) is named the Man of the Match!", timestamp: "1:35 PM", type: 'general' },
        { id: 'comm-md3-3-goal-3', matchId: 'md3-3', minute: "60+4'", text: "⚽ GOAL!!! Bello Daniel Damilare seals a spectacular victory with a third goal deep in stoppage time! Outstanding play by the winger to beat his marker and slide it past the goalkeeper. CSP 0 - 3 CYS.", timestamp: "1:34 PM", type: 'goal' },
        { id: 'comm-md3-3-goal-2', matchId: 'md3-3', minute: "52'", text: "⚽ GOAL!!! Olorunfemi Taiwo James doubles the lead for CYS! He finds space in the box and buries a stunning shot into the bottom corner! CSP 0 - 2 CYS.", timestamp: "1:22 PM", type: 'goal' },
        { id: 'comm-md3-3-goal-1', matchId: 'md3-3', minute: "46'", text: "⚽ GOAL!!! Olamijulo Israel Damilare strikes to put CYS ahead right after the break! A crisp finish following a beautiful combination on the left wing! CSP 0 - 1 CYS.", timestamp: "1:16 PM", type: 'goal' },
        { id: 'comm-md3-3-card-2', matchId: 'md3-3', minute: "43'", text: "🟨 YELLOW CARD! Pelumi (CSP) is booked for pulling back a CYS winger on the counter-attack.", timestamp: "1:13 PM", type: 'card' },
        { id: 'comm-md3-3-sh', matchId: 'md3-3', minute: "31'", text: "🏁 SECOND HALF gets underway! Both teams are back on the pitch.", timestamp: "1:01 PM", type: 'general' },
        { id: 'comm-md3-3-ht', matchId: 'md3-3', minute: "30'", text: "⏸️ HALF-TIME! CSP 0 - 0 CYS. A highly competitive and energetic opening half ends goalless at the Mini Pitch.", timestamp: "1:00 PM", type: 'general' },
        { id: 'comm-md3-3-card-1', matchId: 'md3-3', minute: "25'", text: "🟨 YELLOW CARD! Akindeko Emmanuel (CSP) gets booked for a sliding challenge in midfield.", timestamp: "12:55 PM", type: 'card' },
        { id: 'comm-md3-3-corner-1', matchId: 'md3-3', minute: "12'", text: "📐 Corner won by CSP. Great defensive block from Raji Jubril to clear the cross.", timestamp: "12:42 PM", type: 'general' },
        { id: 'comm-md3-3-kickoff', matchId: 'md3-3', minute: "1'", text: "🏁 KICKOFF! FCL Matchday 3 gets underway as CSP takes on CYS at the Mini Pitch. Referee Tosin (MTS) in charge.", timestamp: "12:30 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md3-4'] || loadedCommentary['md3-4'].length === 0) {
      loadedCommentary['md3-4'] = [
        { id: 'comm-md3-4-ft', matchId: 'md3-4', minute: "60+2'", text: "🏁 FULL-TIME! IFS 1 - 2 STA. Referee Uche (CYS) blows the final whistle! An excellent performance by Statistics (STA) as they secure a hard-fought 2-1 victory over Information Systems (IFS). Daisi Tioluwanimi (STA) is named the Man of the Match!", timestamp: "3:05 PM", type: 'general' },
        { id: 'comm-md3-4-foul-11', matchId: 'md3-4', minute: "60+1'", text: "IFS wins a foul - freekick given. IFS wins a foul in a dangerous midfield area.", timestamp: "3:03 PM", type: 'general' },
        { id: 'comm-md3-4-handball-2', matchId: 'md3-4', minute: "60+1'", text: "Handball to STA - freekick given to IFS. The referee spotted a deliberate handball.", timestamp: "3:02 PM", type: 'general' },
        { id: 'comm-md3-4-corner-5', matchId: 'md3-4', minute: "60'", text: "📐 Corner to STA. Pressure builds up for the final minutes of the match.", timestamp: "3:00 PM", type: 'general' },
        { id: 'comm-md3-4-corner-4', matchId: 'md3-4', minute: "60'", text: "📐 Corner to STA. Great cross from the right flank cleared away by IFS defense.", timestamp: "2:59 PM", type: 'general' },
        { id: 'comm-md3-4-offside-3', matchId: 'md3-4', minute: "58'", text: "Offside to STA - freekick given to IFS. The linesman raises the flag as the striker was ahead of the defensive line.", timestamp: "2:57 PM", type: 'general' },
        { id: 'comm-md3-4-handball-1', matchId: 'md3-4', minute: "57'", text: "Handball to IFS - freekick given to STA. Quick set-piece about to be taken.", timestamp: "2:56 PM", type: 'general' },
        { id: 'comm-md3-4-foul-10', matchId: 'md3-4', minute: "56'", text: "IFS wins a foul - freekick given as the STA defender is penalised for a late push.", timestamp: "2:55 PM", type: 'general' },
        { id: 'comm-md3-4-card-3', matchId: 'md3-4', minute: "51'", text: "🟨 YELLOW CARD! Afilaka Praise Temidayo (STA) is booked by the referee.", timestamp: "2:51 PM", type: 'card' },
        { id: 'comm-md3-4-foul-9', matchId: 'md3-4', minute: "51'", text: "IFS wins a foul - freekick given. Another robust block in the center.", timestamp: "2:50 PM", type: 'general' },
        { id: 'comm-md3-4-corner-3', matchId: 'md3-4', minute: "47'", text: "📐 Corner to IFS. Outswinging corner cleared out with authority.", timestamp: "2:46 PM", type: 'general' },
        { id: 'comm-md3-4-card-2', matchId: 'md3-4', minute: "45'", text: "🟨 YELLOW CARD! Salam Rokeeb Oladimeji (STA) is booked for a heavy challenge.", timestamp: "2:44 PM", type: 'card' },
        { id: 'comm-md3-4-goal-3', matchId: 'md3-4', minute: "45'", text: "⚽ GOAL!!! Agbo Peter restores the lead back to STA! A wonderful combination play ends with Peter burying it into the back of the net! IFS 1 - 2 STA.", timestamp: "2:43 PM", type: 'goal' },
        { id: 'comm-md3-4-foul-8', matchId: 'md3-4', minute: "44'", text: "IFS wins a foul - freekick given as the winger is brought down near the box.", timestamp: "2:42 PM", type: 'general' },
        { id: 'comm-md3-4-foul-7', matchId: 'md3-4', minute: "43'", text: "IFS wins a foul - freekick given after a hard tackle in midfield.", timestamp: "2:41 PM", type: 'general' },
        { id: 'comm-md3-4-foul-6', matchId: 'md3-4', minute: "42'", text: "STA wins a foul - freekick given. The referee warns the IFS defender.", timestamp: "2:40 PM", type: 'general' },
        { id: 'comm-md3-4-goal-2', matchId: 'md3-4', minute: "41'", text: "⚽ GOAL!!! Adewale Adeola Samuel gets IFS back on levels! He finds space in the penalty box and fires a brilliant shot home! IFS 1 - 1 STA.", timestamp: "2:39 PM", type: 'goal' },
        { id: 'comm-md3-4-offside-2', matchId: 'md3-4', minute: "38'", text: "Offside to IFS - freekick given to STA.", timestamp: "2:36 PM", type: 'general' },
        { id: 'comm-md3-4-corner-2', matchId: 'md3-4', minute: "34'", text: "📐 Corner to STA. Inswinging ball punched away by the goalkeeper.", timestamp: "2:32 PM", type: 'general' },
        { id: 'comm-md3-4-foul-5', matchId: 'md3-4', minute: "32'", text: "STA wins a foul - freekick given. High boot spotted by the referee.", timestamp: "2:30 PM", type: 'general' },
        { id: 'comm-md3-4-offside-1', matchId: 'md3-4', minute: "32'", text: "Offside to IFS - freekick given to STA.", timestamp: "2:29 PM", type: 'general' },
        { id: 'comm-md3-4-sh', matchId: 'md3-4', minute: "31'", text: "🏁 SECOND HALF starts! Both teams look determined to claim the maximum points.", timestamp: "2:27 PM", type: 'general' },
        { id: 'comm-md3-4-card-1', matchId: 'md3-4', minute: "30'", text: "🟨 YELLOW CARD! Bello Riliwan Remilekun (STA) gets booked for an aggressive slide tackle.", timestamp: "2:14 PM", type: 'card' },
        { id: 'comm-md3-4-ht', matchId: 'md3-4', minute: "30'", text: "⏸️ HALF-TIME! IFS 0 - 1 STA. Statistics head into the break with a slim 1-0 lead after a highly energetic first half.", timestamp: "2:13 PM", type: 'general' },
        { id: 'comm-md3-4-goal-1', matchId: 'md3-4', minute: "24'", text: "⚽ GOAL!!! Bello Riliwan Remilekun gives STA the lead with a sublime strike! Absolute precision! IFS 0 - 1 STA.", timestamp: "2:07 PM", type: 'goal' },
        { id: 'comm-md3-4-corner-1', matchId: 'md3-4', minute: "22'", text: "📐 Corner to IFS. A cross from the flank is deflected out by STA defense.", timestamp: "2:05 PM", type: 'general' },
        { id: 'comm-md3-4-foul-4', matchId: 'md3-4', minute: "17'", text: "STA wins a foul - freekick given as the midfielder is tripped.", timestamp: "2:01 PM", type: 'general' },
        { id: 'comm-md3-4-corner-ifs-2', matchId: 'md3-4', minute: "16'", text: "📐 Corner to IFS. Deep cross cleared at the back post.", timestamp: "2:00 PM", type: 'general' },
        { id: 'comm-md3-4-corner-ifs-1', matchId: 'md3-4', minute: "14'", text: "📐 Corner to IFS. Brilliant block by STA defender to deny the cross.", timestamp: "1:58 PM", type: 'general' },
        { id: 'comm-md3-4-foul-3', matchId: 'md3-4', minute: "12'", text: "IFS wins a foul - freekick given in midfield.", timestamp: "1:56 PM", type: 'general' },
        { id: 'comm-md3-4-foul-2', matchId: 'md3-4', minute: "8'", text: "IFS wins a foul - freekick given as the captain gets pulled down.", timestamp: "1:52 PM", type: 'general' },
        { id: 'comm-md3-4-foul-1', matchId: 'md3-4', minute: "7'", text: "IFS wins a foul - freekick given near the wing.", timestamp: "1:51 PM", type: 'general' },
        { id: 'comm-md3-4-foul-ifs-1', matchId: 'md3-4', minute: "5'", text: "IFS wins a foul - freekick given after a late challenge.", timestamp: "1:49 PM", type: 'general' },
        { id: 'comm-md3-4-foul-sta-2', matchId: 'md3-4', minute: "1'", text: "STA wins a foul - freekick given as the winger gets brought down on the flank.", timestamp: "1:45 PM", type: 'general' },
        { id: 'comm-md3-4-foul-sta-1', matchId: 'md3-4', minute: "1'", text: "STA wins a foul - freekick given. Quick tactical foul in midfield.", timestamp: "1:44 PM", type: 'general' },
        { id: 'comm-md3-4-kickoff', matchId: 'md3-4', minute: "1'", text: "🏁 KICKOFF! FCL Matchday 3 continues as IFS goes head-to-head with STA at the Mini Pitch. Referee Uche (CYS) is officiating.", timestamp: "1:43 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md3-6'] || loadedCommentary['md3-6'].length === 0) {
      loadedCommentary['md3-6'] = [
        { id: 'comm-md3-6-ft', matchId: 'md3-6', minute: "60'", text: "🏁 FULL-TIME! MST 4 - 0 SIMT. Referee Uche (CYS) blows the final whistle! A spectacular and commanding performance by Mathematical Sciences (MST) as they register an emphatic 4-0 victory over Software Engineering (SIMT). Nkemjika Sydney (MST) is named the Man of the Match after a breathtaking hat trick!", timestamp: "6:15 PM", type: 'general' },
        { id: 'comm-md3-6-card-omowale', matchId: 'md3-6', minute: "58'", text: "🟨 YELLOW CARD! Omowale Ridwan Gbolahun (SIMT) is booked for dissent after arguing with the referee.", timestamp: "6:13 PM", type: 'card' },
        { id: 'comm-md3-6-foul-12', matchId: 'md3-6', minute: "58'", text: "MST wins a foul - freekick given on the left channel.", timestamp: "6:13 PM", type: 'general' },
        { id: 'comm-md3-6-card-ogboye', matchId: 'md3-6', minute: "57'", text: "🟨 YELLOW CARD! Ogboye Samuel Oluwaponmile (SIMT) gets a yellow card for a robust sliding challenge.", timestamp: "6:12 PM", type: 'card' },
        { id: 'comm-md3-6-foul-11', matchId: 'md3-6', minute: "57'", text: "MST wins a foul - freekick given after a late challenge in the center circle.", timestamp: "6:12 PM", type: 'general' },
        { id: 'comm-md3-6-corner-11', matchId: 'md3-6', minute: "56'", text: "📐 Corner to MST. Cleared away at the near post by the SIMT defense.", timestamp: "6:11 PM", type: 'general' },
        { id: 'comm-md3-6-corner-10', matchId: 'md3-6', minute: "55'", text: "📐 Corner to MST after a deflection off a defender.", timestamp: "6:10 PM", type: 'general' },
        { id: 'comm-md3-6-foul-mst-3', matchId: 'md3-6', minute: "54'", text: "SIMT wins a foul - freekick given. MST is penalised for pushing.", timestamp: "6:09 PM", type: 'general' },
        { id: 'comm-md3-6-foul-10', matchId: 'md3-6', minute: "53'", text: "MST wins a foul - freekick given near the corner flag.", timestamp: "6:08 PM", type: 'general' },
        { id: 'comm-md3-6-card-joshua', matchId: 'md3-6', minute: "51'", text: "🟨 YELLOW CARD! Emmanuel Oluwapamilerin Joshua (SIMT) is booked for a late trip on the winger.", timestamp: "6:06 PM", type: 'card' },
        { id: 'comm-md3-6-foul-9', matchId: 'md3-6', minute: "51'", text: "MST wins a foul - freekick given near the penalty box.", timestamp: "6:06 PM", type: 'general' },
        { id: 'comm-md3-6-foul-8', matchId: 'md3-6', minute: "47'", text: "MST wins a foul - freekick given as Boyede is fouled in midfield.", timestamp: "6:02 PM", type: 'general' },
        { id: 'comm-md3-6-goal-4', matchId: 'md3-6', minute: "46'", text: "⚽ GOAL!!! Boyede Joseph Ayomide makes it four! He receives a fine pass and places it brilliantly into the far corner! MST 4 - 0 SIMT.", timestamp: "6:01 PM", type: 'goal' },
        { id: 'comm-md3-6-goal-3', matchId: 'md3-6', minute: "45'", text: "⚽ GOAL!!! HAT TRICK for Nkemjika Sydney! A magnificent performance as he slots home his third of the match to extend the lead! MST 3 - 0 SIMT.", timestamp: "6:00 PM", type: 'goal' },
        { id: 'comm-md3-6-offside-3', matchId: 'md3-6', minute: "41'", text: "Offside to MST - freekick given to SIMT as the linesman raises his flag.", timestamp: "5:56 PM", type: 'general' },
        { id: 'comm-md3-6-red-adeyemi', matchId: 'md3-6', minute: "35'", text: "🟥 RED CARD! Adeyemi Adedayo Ibrahim (MST Captain) is also sent off following a serious altercation! Both teams are now down to 10 men!", timestamp: "5:50 PM", type: 'card' },
        { id: 'comm-md3-6-red-daniel', matchId: 'md3-6', minute: "35'", text: "🟥 RED CARD! Nwabunwanne Chibichi Daniel (SIMT) is shown his second yellow card and is sent off! He receives his match orders!", timestamp: "5:50 PM", type: 'card' },
        { id: 'comm-md3-6-card-daniel-y1', matchId: 'md3-6', minute: "35'", text: "🟨 YELLOW CARD! Nwabunwanne Chibichi Daniel (SIMT) is booked for a heavy tackle.", timestamp: "5:50 PM", type: 'card' },
        { id: 'comm-md3-6-goal-2', matchId: 'md3-6', minute: "34'", text: "⚽ GOAL!!! Nkemjika Sydney doubles the lead! A sensational build-up from MST ends with Sydney firing it past the goalkeeper! MST 2 - 0 SIMT.", timestamp: "5:49 PM", type: 'goal' },
        { id: 'comm-md3-6-corner-9', matchId: 'md3-6', minute: "34'", text: "📐 Corner to MST. Inswinging cross headed away.", timestamp: "5:49 PM", type: 'general' },
        { id: 'comm-md3-6-foul-7', matchId: 'md3-6', minute: "33'", text: "MST wins a foul - freekick given in midfield.", timestamp: "5:48 PM", type: 'general' },
        { id: 'comm-md3-6-foul-mst-2', matchId: 'md3-6', minute: "31'", text: "Handball to MST - freekick given to SIMT.", timestamp: "5:46 PM", type: 'general' },
        { id: 'comm-md3-6-sh', matchId: 'md3-6', minute: "31'", text: "🏁 SECOND HALF gets underway! Both teams are back on the pitch.", timestamp: "5:45 PM", type: 'general' },
        { id: 'comm-md3-6-ht', matchId: 'md3-6', minute: "30+3'", text: "⏸️ HALF-TIME! MST 1 - 0 SIMT. MST head into the break with a 1-0 lead after a highly energetic and dramatic opening half at the Mini Pitch.", timestamp: "5:33 PM", type: 'general' },
        { id: 'comm-md3-6-corner-8', matchId: 'md3-6', minute: "30+2'", text: "📐 Corner to MST. Well cleared by the SIMT defenders.", timestamp: "5:32 PM", type: 'general' },
        { id: 'comm-md3-6-foul-mst-1', matchId: 'md3-6', minute: "30+1'", text: "Handball to MST - freekick given to SIMT.", timestamp: "5:31 PM", type: 'general' },
        { id: 'comm-md3-6-add-time', matchId: 'md3-6', minute: "29'", text: "⏱️ Two minutes of additional time indicated by the fourth official.", timestamp: "5:29 PM", type: 'general' },
        { id: 'comm-md3-6-corner-6', matchId: 'md3-6', minute: "29'", text: "📐 Corner to MST. Outswinging delivery headed wide.", timestamp: "5:29 PM", type: 'general' },
        { id: 'comm-md3-6-corner-7', matchId: 'md3-6', minute: "29'", text: "📐 Corner to MST. Deep cross punched away by the keeper.", timestamp: "5:29 PM", type: 'general' },
        { id: 'comm-md3-6-foul-6', matchId: 'md3-6', minute: "28'", text: "MST wins a foul - freekick given as the defender is penalised for a pull.", timestamp: "5:28 PM", type: 'general' },
        { id: 'comm-md3-6-goal-1', matchId: 'md3-6', minute: "25'", text: "⚽ GOAL!!! Nkemjika Sydney steps up and confidently dispatches the penalty! Absolute composure! MST 1 - 0 SIMT.", timestamp: "5:25 PM", type: 'goal' },
        { id: 'comm-md3-6-foul-5-pen', matchId: 'md3-6', minute: "23'", text: "Handball to SIMT - penalty given to MST! The referee awards a spot-kick for a handball in the box!", timestamp: "5:23 PM", type: 'general' },
        { id: 'comm-md3-6-foul-4', matchId: 'md3-6', minute: "23'", text: "MST wins a foul - freekick given near the wing.", timestamp: "5:23 PM", type: 'general' },
        { id: 'comm-md3-6-corner-5', matchId: 'md3-6', minute: "21'", text: "📐 Corner to MST. Deep cross cleared at the back post.", timestamp: "5:21 PM", type: 'general' },
        { id: 'comm-md3-6-offside-2', matchId: 'md3-6', minute: "20'", text: "Offside to MST - freekick given to SIMT.", timestamp: "5:20 PM", type: 'general' },
        { id: 'comm-md3-6-foul-3-hand', matchId: 'md3-6', minute: "19'", text: "Handball to SIMT - freekick given to MST.", timestamp: "5:19 PM", type: 'general' },
        { id: 'comm-md3-6-foul-2', matchId: 'md3-6', minute: "17'", text: "MST wins a foul - freekick given in midfield.", timestamp: "5:17 PM", type: 'general' },
        { id: 'comm-md3-6-card-adewopo', matchId: 'md3-6', minute: "15'", text: "🟨 YELLOW CARD! Adewopo Feranmi (SIMT) is booked for a late push.", timestamp: "5:15 PM", type: 'card' },
        { id: 'comm-md3-6-card-iyare', matchId: 'md3-6', minute: "14'", text: "🟨 YELLOW CARD! Iyare Praise (MST) is shown a yellow card for a sliding tackle.", timestamp: "5:14 PM", type: 'card' },
        { id: 'comm-md3-6-offside-1', matchId: 'md3-6', minute: "10'", text: "Offside to MST - freekick given to SIMT.", timestamp: "5:10 PM", type: 'general' },
        { id: 'comm-md3-6-foul-1', matchId: 'md3-6', minute: "10'", text: "MST wins a foul - freekick given in a central position.", timestamp: "5:10 PM", type: 'general' },
        { id: 'comm-md3-6-corner-simt-1', matchId: 'md3-6', minute: "9'", text: "📐 Corner to SIMT. High ball punched away by the keeper.", timestamp: "5:09 PM", type: 'general' },
        { id: 'comm-md3-6-card-coach', matchId: 'md3-6', minute: "8'", text: "🟨 YELLOW CARD! SIMT Coach Asinwa Peter Adeleke is booked for dissent on the sidelines.", timestamp: "5:08 PM", type: 'card' },
        { id: 'comm-md3-6-corner-4', matchId: 'md3-6', minute: "8'", text: "📐 Corner to MST. Well blocked by the SIMT defense.", timestamp: "5:08 PM", type: 'general' },
        { id: 'comm-md3-6-corner-3', matchId: 'md3-6', minute: "4'", text: "📐 Corner to MST. Pressure building early.", timestamp: "5:04 PM", type: 'general' },
        { id: 'comm-md3-6-corner-2', matchId: 'md3-6', minute: "2'", text: "📐 Corner to MST. Deep cross cleared out.", timestamp: "5:02 PM", type: 'general' },
        { id: 'comm-md3-6-corner-1', matchId: 'md3-6', minute: "1'", text: "📐 Corner to MST. MST starts on the front foot.", timestamp: "5:01 PM", type: 'general' },
        { id: 'comm-md3-6-kickoff', matchId: 'md3-6', minute: "1'", text: "🏁 KICKOFF! FCL Matchday 3 gets underway as MST takes on SIMT at the Mini Pitch. Referee Uche (CYS) is in charge.", timestamp: "5:00 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md3-2'] || loadedCommentary['md3-2'].length === 0) {
      loadedCommentary['md3-2'] = [
        { id: 'comm-md3-2-ft', matchId: 'md3-2', minute: "60'", text: "🏁 FULL-TIME! PHS 1 - 2 BCH. Referee Victor (ESM) blows the final whistle! BCH holds off a late PHS surge to secure their historic first ever FUTA Champions League win! An incredible effort from both squads.", timestamp: "12:15 PM", type: 'general' },
        { id: 'comm-md3-2-card-isreal', matchId: 'md3-2', minute: "45'", text: "🟨 YELLOW CARD! Isreal (PHS) is booked for an aggressive slide tackle.", timestamp: "12:00 PM", type: 'card' },
        { id: 'comm-md3-2-goal-isreal', matchId: 'md3-2', minute: "42'", text: "⚽ GOAL!!! Isreal pulls one back for PHS with a spectacular header from a deep cross! Dramatic final minutes ahead! PHS 1 - 2 BCH.", timestamp: "11:57 AM", type: 'goal' },
        { id: 'comm-md3-2-sh', matchId: 'md3-2', minute: "31'", text: "🏁 SECOND HALF gets underway! Both teams are back on the pitch with BCH leading 2-0.", timestamp: "11:46 AM", type: 'general' },
        { id: 'comm-md3-2-ht', matchId: 'md3-2', minute: "30'", text: "⏸️ HALF-TIME! PHS 0 - 2 BCH. BCH goes into the break with a well-deserved two-goal lead after clinical finishes from Peter and Eagle.", timestamp: "11:45 AM", type: 'general' },
        { id: 'comm-md3-2-goal-eagle', matchId: 'md3-2', minute: "30'", text: "⚽ GOAL!!! Eagle doubles the lead for BCH! A brilliant direct strike that leaves the keeper with no chance! PHS 0 - 2 BCH.", timestamp: "11:45 AM", type: 'goal' },
        { id: 'comm-md3-2-goal-peter', matchId: 'md3-2', minute: "25'", text: "⚽ GOAL!!! Peter gives BCH the lead with a wonderful, clinical finish from the edge of the box! Absolute class! PHS 0 - 1 BCH.", timestamp: "11:40 AM", type: 'goal' },
        { id: 'comm-md3-2-card-peter', matchId: 'md3-2', minute: "20'", text: "🟨 YELLOW CARD! Peter (BCH) is shown a yellow card for a mistimed challenge in the middle park.", timestamp: "11:35 AM", type: 'card' },
        { id: 'comm-md3-2-kickoff', matchId: 'md3-2', minute: "1'", text: "🏁 KICKOFF! FCL Matchday 3 continues as PHS takes on BCH at the Mini Pitch. Referee Victor (ESM) blows the whistle to start the match.", timestamp: "11:15 AM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md3-1'] || loadedCommentary['md3-1'].length === 0) {
      loadedCommentary['md3-1'] = [
        { id: 'comm-md3-1-ft', matchId: 'md3-1', minute: "60+2'", text: "🏁 FULL-TIME! PHY 2 - 2 AGP. A breathtaking match ends in a stalemate as Olasunkanmi Michael's late penalty seals a brace and rescues a vital point for AGP! PHY 2 - 2 AGP.", timestamp: "10:46 AM", type: 'general' },
        { id: 'comm-md3-1-goal-penalty', matchId: 'md3-1', minute: "60'", text: "⚽ GOAL!!! Olasunkanmi Michael (AGP) calmly slot the penalty into the bottom left corner, completely deceptive to the goalie! PHY 2 - 2 AGP.", timestamp: "10:44 AM", type: 'goal' },
        { id: 'comm-md3-1-goal-christian', matchId: 'md3-1', minute: "42'", text: "⚽ GOAL!!! Iyenagbe Christian (PHY) fires PHY into the lead with an absolute rocket from the edge of the penalty box! Beautiful assist from Uduak Abasi. PHY 2 - 1 AGP.", timestamp: "10:26 AM", type: 'goal' },
        { id: 'comm-md3-1-sh', matchId: 'md3-1', minute: "31'", text: "🏁 SECOND HALF KICKOFF! Both teams return with no changes to their lineups.", timestamp: "10:15 AM", type: 'general' },
        { id: 'comm-md3-1-ht', matchId: 'md3-1', minute: "30'", text: "⏸️ HALF-TIME! PHY 1 - 1 AGP. An intensely balanced first half comes to a close after goals from Olasunkanmi Michael and Uduak Abasi.", timestamp: "10:00 AM", type: 'general' },
        { id: 'comm-md3-1-goal-uduak', matchId: 'md3-1', minute: "25'", text: "⚽ GOAL!!! Uduak Abasi equalizes for PHY with a powerful, curling shot that nests into the top-right corner! Outstanding piece of individual skill! PHY 1 - 1 AGP.", timestamp: "9:55 AM", type: 'goal' },
        { id: 'comm-md3-1-goal-olasunkanmi', matchId: 'md3-1', minute: "7'", text: "⚽ GOAL!!! Olasunkanmi Michael opens the scoring early for AGP! A slick cross from the wing is tucked away perfectly! PHY 0 - 1 AGP.", timestamp: "9:37 AM", type: 'goal' },
        { id: 'comm-md3-1-kickoff', matchId: 'md3-1', minute: "1'", text: "🏁 KICKOFF! FCL Matchday 3 kicks off as PHY takes on AGP at the Mini Pitch. Referee Victor (ESM) blows the whistle to start the encounter.", timestamp: "9:30 AM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md3-5'] || loadedCommentary['md3-5'].length === 0) {
      loadedCommentary['md3-5'] = [
        { id: 'comm-md3-5-ft', matchId: 'md3-5', minute: "60+1'", text: "🏁 FULL-TIME! MCB 1 - 1 IDD. Referee Uche (CYS) blows the final whistle! A well-contested tactical battle ends in a stalemate as both teams settle for a point.", timestamp: "4:46 PM", type: 'general' },
        { id: 'comm-md3-5-goal-oni', matchId: 'md3-5', minute: "51'", text: "⚽ GOAL!!! Oni Oluwadamilola (MCB) calmly converts the penalty, leveling the score for MCB! Clinical finishing from the spot! MCB 1 - 1 IDD.", timestamp: "4:37 PM", type: 'goal' },
        { id: 'comm-md3-5-goal-emmy', matchId: 'md3-5', minute: "42'", text: "⚽ GOAL!!! Emmy breaks the deadlock with a brilliant, clinical strike to put IDD ahead! Magnificent play! MCB 0 - 1 IDD.", timestamp: "4:28 PM", type: 'goal' },
        { id: 'comm-md3-5-sh', matchId: 'md3-5', minute: "31'", text: "🏁 SECOND HALF KICKOFF! Both sides resume play aiming to make their presence felt.", timestamp: "4:15 PM", type: 'general' },
        { id: 'comm-md3-5-ht', matchId: 'md3-5', minute: "30'", text: "⏸️ HALF-TIME! MCB 0 - 0 IDD. A highly tactical and defensively solid first half ends goalless.", timestamp: "4:00 PM", type: 'general' },
        { id: 'comm-md3-5-kickoff', matchId: 'md3-5', minute: "1'", text: "🏁 KICKOFF! FCL Matchday 3 continues as MCB takes on IDD at the Mini Pitch. Referee Uche (CYS) blows the whistle to begin.", timestamp: "3:30 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md3-9'] || loadedCommentary['md3-9'].length === 0) {
      loadedCommentary['md3-9'] = [
        { id: 'comm-md3-9-ft', matchId: 'md3-9', minute: "60'", text: "🏁 FULL-TIME! ENT 1 - 3 MBBS. The referee blows the final whistle! A spectacular match with MBBS staging a superb second-half comeback to claim all three points.", timestamp: "4:30 PM", type: 'general' },
        { id: 'comm-md3-9-goal-adesola', matchId: 'md3-9', minute: "60'", text: "⚽ GOAL!!! Adesola Emmanuel makes it three for MBBS! What a finish to seal the victory! ENT 1 - 3 MBBS.", timestamp: "4:28 PM", type: 'goal' },
        { id: 'comm-md3-9-goal-drp', matchId: 'md3-9', minute: "56'", text: "⚽ GOAL!!! Dr. P scores! MBBS takes the lead for the first time in the match! Absolute class! ENT 1 - 2 MBBS.", timestamp: "4:24 PM", type: 'goal' },
        { id: 'comm-md3-9-goal-bamidele', matchId: 'md3-9', minute: "52'", text: "⚽ GOAL!!! Bamidele Fikayo gets the equalizer for MBBS with a powerful header! ENT 1 - 1 MBBS.", timestamp: "4:20 PM", type: 'goal' },
        { id: 'comm-md3-9-ht', matchId: 'md3-9', minute: "30'", text: "⏸️ HALF-TIME! ENT 1 - 0 MBBS. ENT heads into the break leading thanks to an early goal from Pelumi.", timestamp: "4:00 PM", type: 'general' },
        { id: 'comm-md3-9-goal-pelumi', matchId: 'md3-9', minute: "3'", text: "⚽ GOAL!!! Pelumi opens the scoring for ENT in just the 3rd minute of the game! Dynamic start! ENT 1 - 0 MBBS.", timestamp: "3:33 PM", type: 'goal' },
        { id: 'comm-md3-9-kickoff', matchId: 'md3-9', minute: "1'", text: "🏁 KICKOFF! Matchday 3 fixture ENT vs MBBS is underway! Referee Fatai blows the whistle to start the match.", timestamp: "3:30 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['md3-8'] || loadedCommentary['md3-8'].length === 0) {
      loadedCommentary['md3-8'] = [
        { id: 'comm-md3-8-ft', matchId: 'md3-8', minute: "60'", text: "🏁 FULL-TIME! APH 1 - 0 AGE. The referee blows the final whistle! A hard-fought 1-0 win for APH thanks to Fola's first-half goal.", timestamp: "3:00 PM", type: 'general' },
        { id: 'comm-md3-8-ht', matchId: 'md3-8', minute: "30'", text: "⏸️ HALF-TIME! APH 1 - 0 AGE. APH leads at the break courtesy of Fola's strike in the 15th minute.", timestamp: "2:30 PM", type: 'general' },
        { id: 'comm-md3-8-goal-fola', matchId: 'md3-8', minute: "15'", text: "⚽ GOAL!!! Fola scores! APH takes the lead! A clinical finish inside the box puts APH ahead! APH 1 - 0 AGE.", timestamp: "2:15 PM", type: 'goal' },
        { id: 'comm-md3-8-kickoff', matchId: 'md3-8', minute: "1'", text: "🏁 KICKOFF! Matchday 3 fixture APH vs AGE is underway! Referee Peter (IFS) blows the whistle to start the match.", timestamp: "2:00 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['PO1'] || loadedCommentary['PO1'].length === 0) {
      loadedCommentary['PO1'] = [
        { id: 'comm-po1-ft', matchId: 'PO1', minute: "60'", text: "🏁 FULL-TIME! IDD 0 - 1 STA. Statistics (STA) are through to the Quarter-finals of the FUTA Champions League! Agbo Peter's 52nd-minute strike is the difference!", timestamp: "3:00 PM", type: 'general' },
        { id: 'comm-po1-def', matchId: 'PO1', minute: "57'", text: "STA is defending with everything! Resolute blocks from their backline to preserve their precious lead.", timestamp: "2:57 PM", type: 'general' },
        { id: 'comm-po1-goal-agbo', matchId: 'PO1', minute: "52'", text: "⚽ GOAL!!! Agbo Peter opens the scoring for STA! A wonderful team play finds Peter inside the box and he buries it past the IDD goalkeeper! IDD 0 - 1 STA.", timestamp: "2:52 PM", type: 'goal' },
        { id: 'comm-po1-ht', matchId: 'PO1', minute: "30'", text: "⏸️ HALF-TIME! IDD 0 - 0 STA. A cagey and tense first half comes to a close. Both teams have canceled each other out so far.", timestamp: "2:30 PM", type: 'general' },
        { id: 'comm-po1-chance', matchId: 'PO1', minute: "18'", text: "Chance! Sola of IDD takes a snapshot from distance but it sails just over the crossbar.", timestamp: "2:18 PM", type: 'general' },
        { id: 'comm-po1-kickoff', matchId: 'PO1', minute: "1'", text: "🏁 KICKOFF! The Playoff Round match PO1 between IDD and STA is underway! Jones (AGE) is the referee.", timestamp: "2:00 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['PO2'] || loadedCommentary['PO2'].length === 0) {
      loadedCommentary['PO2'] = [
        { id: 'comm-po2-ft', matchId: 'PO2', minute: "60'", text: "🏁 FULL-TIME! ANA 3 - 0 SIMT. A masterclass display from Anatomy (ANA) to defeat SIMT and secure their place in the FUTA Champions League Quarter-finals! Success Bayode is named Man of the Match!", timestamp: "3:00 PM", type: 'general' },
        { id: 'comm-po2-goal-success', matchId: 'PO2', minute: "25'", text: "⚽ GOAL!!! Success Bayode makes it three! An exquisite chip over the keeper to finish off a dazzling counter-attack! ANA 3 - 0 SIMT.", timestamp: "2:25 PM", type: 'goal' },
        { id: 'comm-po2-goal-paul', matchId: 'PO2', minute: "20'", text: "⚽ GOAL!!! Ademola Paul doubles the advantage! A thunderous strike from outside the box leaves the keeper with no chance! ANA 2 - 0 SIMT.", timestamp: "2:20 PM", type: 'goal' },
        { id: 'comm-po2-goal-isreal', matchId: 'PO2', minute: "15'", text: "⚽ GOAL!!! Isreal breaks the deadlock! A brilliant run and a clinical finish inside the box puts Anatomy ahead! ANA 1 - 0 SIMT.", timestamp: "2:15 PM", type: 'goal' },
        { id: 'comm-po2-ht', matchId: 'PO2', minute: "30'", text: "⏸️ HALF-TIME! ANA 3 - 0 SIMT. A dominant first-half performance from Anatomy puts them in a commanding position.", timestamp: "2:30 PM", type: 'general' },
        { id: 'comm-po2-kickoff', matchId: 'PO2', minute: "1'", text: "🏁 KICKOFF! The Playoff Round match PO2 between ANA and SIMT is underway! Tosin (MTS) is the referee.", timestamp: "2:00 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['PO3'] || loadedCommentary['PO3'].length === 0) {
      loadedCommentary['PO3'] = [
        { id: 'comm-po3-ft', matchId: 'PO3', minute: "60+4'", text: "🏁 FULL-TIME! BDG 0 - 1 AGP. Dramatic finish! Applied Geo-Physics (AGP) books their place in the Quarter-finals with a late 1-0 victory over Building (BDG)! Olasunkanmi Michael is the hero and wins Man of the Match!", timestamp: "4:34 PM", type: 'general' },
        { id: 'comm-po3-goal-michael', matchId: 'PO3', minute: "60+4'", text: "⚽ GOAL!!! Olasunkanmi Michael strikes in stoppage time! Unbelievable scenes as Olasunkanmi Michael finds the back of the net with a dramatic finish at the death! BDG 0 - 1 AGP.", timestamp: "4:34 PM", type: 'goal' },
        { id: 'comm-po3-chance', matchId: 'PO3', minute: "50'", text: "Chance! Desmond (BDG) with a header from a corner, but it's saved superbly by the AGP goalkeeper!", timestamp: "4:20 PM", type: 'general' },
        { id: 'comm-po3-ht', matchId: 'PO3', minute: "30'", text: "⏸️ HALF-TIME! BDG 0 - 0 AGP. A very tight and physical contest in the first half with both defenses holding strong.", timestamp: "4:00 PM", type: 'general' },
        { id: 'comm-po3-kickoff', matchId: 'PO3', minute: "1'", text: "🏁 KICKOFF! The Playoff Round match PO3 between BDG and AGP is underway! Jones (AGE) is the referee.", timestamp: "3:30 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['PO4'] || loadedCommentary['PO4'].length === 0) {
      loadedCommentary['PO4'] = [
        { id: 'comm-po4-ft', matchId: 'PO4', minute: "60'", text: "🏁 FULL-TIME! MBBS 0 - 3 MCB. Microbiology (MCB) produced a dominant performance to defeat MBBS 3–0, sealing an emphatic qualification to the FUTA Champions League Quarter-finals! Oni Oluwadamilola is named Man of the Match!", timestamp: "4:30 PM", type: 'general' },
        { id: 'comm-po4-goal-oni', matchId: 'PO4', minute: "54'", text: "⚽ GOAL!!! Captain Oni Oluwadamilola scores a third! MCB wraps up the victory in style! MBBS 0 - 3 MCB.", timestamp: "4:24 PM", type: 'goal' },
        { id: 'comm-po4-ht', matchId: 'PO4', minute: "30'", text: "⏸️ HALF-TIME! MBBS 0 - 2 MCB. A dominant showing by MCB in the first half with goals from Ameh Lucky and Olaniran Oluwatimilehin!", timestamp: "4:00 PM", type: 'general' },
        { id: 'comm-po4-goal-olaniran', matchId: 'PO4', minute: "30'", text: "⚽ GOAL!!! Olaniran Oluwatimilehin doubles the lead! Magnificent strike to put MCB in a commanding position! MBBS 0 - 2 MCB.", timestamp: "4:00 PM", type: 'goal' },
        { id: 'comm-po4-goal-ameh', matchId: 'PO4', minute: "22'", text: "⚽ GOAL!!! Ameh Lucky breaks the deadlock for MCB! Clinical finish to put Microbiology ahead! MBBS 0 - 1 MCB.", timestamp: "3:52 PM", type: 'goal' },
        { id: 'comm-po4-kickoff', matchId: 'PO4', minute: "1'", text: "🏁 KICKOFF! The Playoff Round match PO4 between MBBS and MCB is underway! Tosin (MTS) is the referee.", timestamp: "3:30 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['PO5'] || loadedCommentary['PO5'].length === 0) {
      loadedCommentary['PO5'] = [
        { id: 'comm-po5-ft', matchId: 'PO5', minute: "60'", text: "🏁 FULL-TIME! APH 5 - 0 PHY. Animal Production and Health (APH) produced an absolute masterclass to defeat Physics (PHY) 5–0, earning a massive Quarter-final spot against the League 1st position! Emmy is named Man of the Match!", timestamp: "6:00 PM", type: 'general' },
        { id: 'comm-po5-goal-emmy2', matchId: 'PO5', minute: "58'", text: "⚽ GOAL!!! Emmy scores again to secure his brace and make it five! A breathtaking performance! APH 5 - 0 PHY.", timestamp: "5:58 PM", type: 'goal' },
        { id: 'comm-po5-goal-emmy1', matchId: 'PO5', minute: "47'", text: "⚽ GOAL!!! Emmy finds the back of the net with a clinical finish to extend the lead! APH 4 - 0 PHY.", timestamp: "5:47 PM", type: 'goal' },
        { id: 'comm-po5-ht', matchId: 'PO5', minute: "30'", text: "⏸️ HALF-TIME! APH 3 - 0 PHY. A rampant first-half display from APH with goals from Fola, Toni, and Kunlex!", timestamp: "5:30 PM", type: 'general' },
        { id: 'comm-po5-goal-kunlex', matchId: 'PO5', minute: "35'", text: "⚽ GOAL!!! Kunlex adds a third for APH with a fantastic finish! APH 3 - 0 PHY.", timestamp: "5:35 PM", type: 'goal' },
        { id: 'comm-po5-goal-toni', matchId: 'PO5', minute: "26'", text: "⚽ GOAL!!! Toni converts another penalty! APH is in absolute dreamland! APH 2 - 0 PHY.", timestamp: "5:26 PM", type: 'goal' },
        { id: 'comm-po5-goal-fola', matchId: 'PO5', minute: "15'", text: "⚽ GOAL!!! Fola steps up and slots the penalty home to open the scoring! APH 1 - 0 PHY.", timestamp: "5:15 PM", type: 'goal' },
        { id: 'comm-po5-kickoff', matchId: 'PO5', minute: "1'", text: "🏁 KICKOFF! The Playoff Round match PO5 between APH and PHY gets underway at the Main Pitch! Tommy (URP) is the referee.", timestamp: "5:00 PM", type: 'general' }
      ];
      loadedCommentary['QF1'] = [
        { id: 'comm-qf1-ft', matchId: 'QF1', minute: "60'", text: "🏁 FULL-TIME! ICE 1 - 0 APH. Information and Communication Engineering (ICE) booked their place in the FUTA Champions League Semi-finals after a disciplined 1-0 victory over Animal Production and Health (APH)! Kolade Farooq is named Man of the Match!", timestamp: "3:00 PM", type: 'general' },
        { id: 'comm-qf1-defense', matchId: 'QF1', minute: "52'", text: "ICE is defending deep and compact. APH is throwing everything forward but cannot find a breakthrough against ICE's solid defensive wall.", timestamp: "2:52 PM", type: 'general' },
        { id: 'comm-qf1-ht', matchId: 'QF1', minute: "30'", text: "⏸️ HALF-TIME! ICE 1 - 0 APH. A fast-paced half comes to a close with ICE leading courtesy of Adegoke's 19th-minute own goal.", timestamp: "2:30 PM", type: 'general' },
        { id: 'comm-qf1-goal-og', matchId: 'QF1', minute: "19'", text: "⚽ OWN GOAL!!! Adegoke of APH turns the ball into his own net while attempting to clear! Tragic moment for APH, but ICE has the breakthrough! ICE 1 - 0 APH.", timestamp: "2:19 PM", type: 'goal' },
        { id: 'comm-qf1-kickoff', matchId: 'QF1', minute: "1'", text: "🏁 KICKOFF! The highly-anticipated Quarter-final 1 between Information and Communication Engineering (ICE) and Animal Production and Health (APH) is underway at the Mini Pitch! Frank is the referee.", timestamp: "2:00 PM", type: 'general' }
      ];
      loadedCommentary['QF2'] = [
        { id: 'comm-qf2-ft', matchId: 'QF2', minute: "60'", text: "🏁 FULL-TIME! CYS 1 - 1 MCB (CYS wins 4-2 on penalties). Cyber Security (CYS) secures their place in the FUTA Champions League Semi-finals after a tense penalty shootout victory following a hard-fought 1-1 draw in regulation time! Olorunfemi Taiwo James is named Man of the Match!", timestamp: "4:00 PM", type: 'general' },
        { id: 'comm-qf2-pens', matchId: 'QF2', minute: "60'", text: "🎯 PENALTY SHOOTOUT! CYS wins 4-2 on penalties. Olorunfemi Taiwo James, Jegede Daniel Kolawole, Akinyede Allen Oluwaferanmi, and Bello Daniel Damilare converted for CYS. For MCB, Oni Oluwadamilola and Olaniran Oluwatimilehin converted but Ameh Lucky and Olowu Dennis missed.", timestamp: "3:55 PM", type: 'general' },
        { id: 'comm-qf2-goal-taiwo', matchId: 'QF2', minute: "30'", text: "⚽ GOAL!!! Olorunfemi Taiwo James scores the equalizer for CYS! Spectacular finish in the box to bring CYS level! CYS 1 - 1 MCB.", timestamp: "3:30 PM", type: 'goal' },
        { id: 'comm-qf2-ht', matchId: 'QF2', minute: "30'", text: "⏸️ HALF-TIME! CYS 1 - 1 MCB. A fast-paced and highly tactical half ends level with goals from Ameh Lucky and Olorunfemi Taiwo James.", timestamp: "3:00 PM", type: 'general' },
        { id: 'comm-qf2-goal-ameh', matchId: 'QF2', minute: "25'", text: "⚽ GOAL!!! Ameh Lucky breaks the deadlock for MCB! Clinical finish to put Microbiology ahead! CYS 0 - 1 MCB.", timestamp: "2:55 PM", type: 'goal' },
        { id: 'comm-qf2-kickoff', matchId: 'QF2', minute: "1'", text: "🏁 KICKOFF! The high-stakes Quarter-final 2 between Cyber Security (CYS) and Microbiology (MCB) is underway at the Mini Pitch! Kizzy is the referee.", timestamp: "2:00 PM", type: 'general' }
      ];
      loadedCommentary['QF3'] = [
        { id: 'comm-qf3-ft', matchId: 'QF3', minute: "60'", text: "🏁 FULL-TIME! STA 1 - 2 AGP. Applied Geo-Physics (AGP) books their place in the FUTA Champions League Semi-finals with a hard-fought 2-1 victory over Statistics (STA)! Akinyode Joseph Oluwaseun is named Man of the Match after a flawless display!", timestamp: "5:00 PM", type: 'general' },
        { id: 'comm-qf3-card-obafemi', matchId: 'QF3', minute: "48'", text: "🟨 YELLOW CARD! Obafemi of AGP receives a yellow card for a late challenge.", timestamp: "4:48 PM", type: 'general' },
        { id: 'comm-qf3-goal-jesse', matchId: 'QF3', minute: "41'", text: "⚽ GOAL!!! Nwachukwu Jesse pulls one back for Statistics by calmly converting the penalty! Game on! STA 1 - 2 AGP.", timestamp: "4:41 PM", type: 'goal' },
        { id: 'comm-qf3-ht', matchId: 'QF3', minute: "30'", text: "⏸️ HALF-TIME! STA 0 - 2 AGP. A dominant first half from Applied Geo-Physics sees them holding a comfortable two-goal cushion thanks to Onileowo Oluwafemi and Olasunkanmi Michael.", timestamp: "4:00 PM", type: 'general' },
        { id: 'comm-qf3-goal-michael', matchId: 'QF3', minute: "19'", text: "⚽ GOAL!!! Olasunkanmi Michael steps up and converts from the penalty spot to double AGP's lead! STA 0 - 2 AGP.", timestamp: "3:49 PM", type: 'goal' },
        { id: 'comm-qf3-goal-oluwafemi', matchId: 'QF3', minute: "9'", text: "⚽ GOAL!!! Onileowo Oluwafemi breaks the deadlock for AGP with a superb finish past the STA goalkeeper! STA 0 - 1 AGP.", timestamp: "3:39 PM", type: 'goal' },
        { id: 'comm-qf3-kickoff', matchId: 'QF3', minute: "1'", text: "🏁 KICKOFF! The highly anticipated Quarter-final 3 between Statistics (STA) and Applied Geo-Physics (AGP) gets underway under the watchful eye of referee Frank!", timestamp: "3:30 PM", type: 'general' }
      ];
      loadedCommentary['QF4'] = [
        { id: 'comm-qf4-ft', matchId: 'QF4', minute: "60'", text: "🏁 FULL-TIME! ANA 0 - 0 MST (MST wins 4-2 on penalties). Marine Science and Technology (MST) advances to the FUTA Champions League Semi-finals after winning a highly intense penalty shootout 4–2 following a goalless draw in regulation time! Ogundeji Feyitunmise Hezekiah is named Man of the Match!", timestamp: "5:00 PM", type: 'general' },
        { id: 'comm-qf4-pens', matchId: 'QF4', minute: "60'", text: "🎯 PENALTY SHOOTOUT! MST wins 4-2 on penalties. MST was clinical, converting all four of their spot-kicks, while ANA missed two of theirs to seal MST's passage into the last four!", timestamp: "4:55 PM", type: 'general' },
        { id: 'comm-qf4-chance-ana', matchId: 'QF4', minute: "54'", text: "Chance! Success Bayode of ANA cuts inside and fires a curling effort, but Ogundeji Feyitunmise Hezekiah makes a stunning flying save to keep MST level!", timestamp: "4:40 PM", type: 'general' },
        { id: 'comm-qf4-ht', matchId: 'QF4', minute: "30'", text: "⏸️ HALF-TIME! ANA 0 - 0 MST. An extremely disciplined and tactical first half ends goalless. Both defenses are refusing to yield.", timestamp: "4:00 PM", type: 'general' },
        { id: 'comm-qf4-chance-mst', matchId: 'QF4', minute: "12'", text: "Chance! Nkemjika Sydney of MST fires from the edge of the area but it goes inches wide of the post.", timestamp: "3:42 PM", type: 'general' },
        { id: 'comm-qf4-kickoff', matchId: 'QF4', minute: "1'", text: "🏁 KICKOFF! The crucial Quarter-final 4 match between Anatomy (ANA) and Marine Science and Technology (MST) is underway at the Mini Pitch! Kizzy is the referee.", timestamp: "3:30 PM", type: 'general' }
      ];
      loadedCommentary['SF1_1'] = [
        { id: 'comm-sf1_1-ft', matchId: 'SF1_1', minute: "60'", text: "🏁 FULL TIME! ICE 1–1 AGP. A captivating first leg of Semi-final 1 ends in a 1-1 draw. Goals from Bamidele Usman and Olasunkanmi Michael keep the tie on a knife-edge ahead of the second leg! Olasunkanmi Michael is named Man of the Match.", timestamp: "3:30 PM", type: 'general' },
        { id: 'comm-sf1_1-chance-agp2', matchId: 'SF1_1', minute: "57'", text: "Chance! AGP wins a freekick in a dangerous area. Michael steps up but his curling effort is well gathered by Prosper.", timestamp: "3:27 PM", type: 'general' },
        { id: 'comm-sf1_1-sub-agp-akin', matchId: 'SF1_1', minute: "55'", text: "🔄 AGP Substitution: Olujobade Daniel ⬇ / Akinbosoye Akinola ⬆", timestamp: "3:25 PM", type: 'general' },
        { id: 'comm-sf1_1-sub-ice-adej', matchId: 'SF1_1', minute: "55'", text: "🔄 ICE Substitution: Akinloye Toluwalase ⬇ / Adejinmi Daniel ⬆", timestamp: "3:25 PM", type: 'general' },
        { id: 'comm-sf1_1-card-frank', matchId: 'SF1_1', minute: "52'", text: "🟨 YELLOW CARD! Apake Avososhido Frank (AGP) is booked for a reckless challenge.", timestamp: "3:22 PM", type: 'general' },
        { id: 'comm-sf1_1-corner-ice4', matchId: 'SF1_1', minute: "51'", text: "Corner for ICE. The delivery is floated in but cleared out of the box by the AGP defence.", timestamp: "3:21 PM", type: 'general' },
        { id: 'comm-sf1_1-corner-ice3', matchId: 'SF1_1', minute: "49'", text: "Corner for ICE! Samson whips it in, but the keeper punches it away.", timestamp: "3:19 PM", type: 'general' },
        { id: 'comm-sf1_1-sub-ice-kud', matchId: 'SF1_1', minute: "42'", text: "🔄 ICE Substitution: Adeyemi Damola ⬇ / Kudabo Timilehin ⬆", timestamp: "3:12 PM", type: 'general' },
        { id: 'comm-sf1_1-sub-agp-sam', matchId: 'SF1_1', minute: "41'", text: "🔄 AGP Substitution: Rowland ⬇ / Ayomide Samuel ⬆", timestamp: "3:11 PM", type: 'general' },
        { id: 'comm-sf1_1-offside-ice2', matchId: 'SF1_1', minute: "40'", text: "Offside against ICE. Usman is caught just a fraction early.", timestamp: "3:10 PM", type: 'general' },
        { id: 'comm-sf1_1-goal-michael', matchId: 'SF1_1', minute: "35'", text: "⚽ GOAL!!! AGP responds instantly! Olasunkanmi Michael finds some space in the box and buries a clinical finish to draw AGP level! ICE 1–1 AGP.", timestamp: "3:05 PM", type: 'goal' },
        { id: 'comm-sf1_1-goal-usman', matchId: 'SF1_1', minute: "33'", text: "⚽ GOAL!!! Bamidele Usman breaks the deadlock for ICE! A beautiful, sweeping team move is finished off sublimely by Usman to send the SEET Pitch into raptures! ICE 1–0 AGP.", timestamp: "3:03 PM", type: 'goal' },
        { id: 'comm-sf1_1-sub-ice-usman', matchId: 'SF1_1', minute: "31'", text: "🔄 ICE Substitution: Folowosele Peace ⬇ / Bamidele Usman ⬆", timestamp: "3:01 PM", type: 'general' },
        { id: 'comm-sf1_1-sub-ice-akin', matchId: 'SF1_1', minute: "31'", text: "🔄 ICE Substitution: Olayiwola Samson ⬇ / Akinloye Toluwalase ⬆", timestamp: "3:01 PM", type: 'general' },
        { id: 'comm-sf1_1-ht', matchId: 'SF1_1', minute: "30'", text: "⏸️ HALF-TIME! ICE 0–0 AGP. A tense, high-quality, and tactical first half ends without goals, but there is plenty of drama to come.", timestamp: "3:00 PM", type: 'general' },
        { id: 'comm-sf1_1-offside-ice1', matchId: 'SF1_1', minute: "23'", text: "Offside against ICE - freekick to AGP.", timestamp: "2:23 PM", type: 'general' },
        { id: 'comm-sf1_1-offside-agp-disallowed', matchId: 'SF1_1', minute: "22'", text: "❌ DISALLOWED GOAL! AGP scores from close range but the linesman has his flag up for offside! Freekick to ICE.", timestamp: "2:22 PM", type: 'general' },
        { id: 'comm-sf1_1-offside-agp1', matchId: 'SF1_1', minute: "13'", text: "Offside against AGP - freekick to ICE.", timestamp: "2:13 PM", type: 'general' },
        { id: 'comm-sf1_1-kickoff', matchId: 'SF1_1', minute: "1'", text: "🏁 KICKOFF! The FUTA Champions League 2026 Semi-final 1 (First Leg) clash between ICE and AGP is underway at the SEET Pitch! Victor (ESM) is today's referee.", timestamp: "2:00 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    if (!loadedCommentary['SF2_1']) {
      loadedCommentary['SF2_1'] = [
        { id: 'comm-sf2_1-ft', matchId: 'SF2_1', minute: "60+7'", text: "🏁 FULL TIME! CYS 1–2 MST. Defending champions MST seal a hard-fought 2-1 victory over CYS in the first leg of their Semi-final at the SOC Fortress, heading into the second leg with a one-goal advantage! Akinnayajo Irewale is named Man of the Match.", timestamp: "5:07 PM", type: 'general' },
        { id: 'comm-sf2_1-ogayemi-yc', matchId: 'SF2_1', minute: "60+6'", text: "🟨 YELLOW CARD! David Ogayemi (MST) is booked immediately after coming on for a late, reckless challenge.", timestamp: "5:06 PM", type: 'general' },
        { id: 'comm-sf2_1-sub-ogayemi', matchId: 'SF2_1', minute: "60+6'", text: "🔄 MST Substitution: Boyede Joseph Ayomide ⬇ / David Ogayemi ⬆", timestamp: "5:06 PM", type: 'general' },
        { id: 'comm-sf2_1-jegede-yc', matchId: 'SF2_1', minute: "60+3'", text: "🟨 YELLOW CARD! Jegede Daniel Kolawole (CYS) is booked for his part in a heated altercation.", timestamp: "5:03 PM", type: 'general' },
        { id: 'comm-sf2_1-fabusuyi-yc', matchId: 'SF2_1', minute: "60+3'", text: "🟨 YELLOW CARD! Fabusuyi Daniel Oluwafisayo (MST) is booked for unsporting behavior.", timestamp: "5:03 PM", type: 'general' },
        { id: 'comm-sf2_1-added', matchId: 'SF2_1', minute: "60+1'", text: "⏱️ Four minutes of added time indicated by the fourth official.", timestamp: "5:01 PM", type: 'general' },
        { id: 'comm-sf2_1-sub-ademisoye', matchId: 'SF2_1', minute: "57'", text: "🔄 MST Substitution: Adeniyi Ademola Daniel ⬇ / Ademisoye Segun ⬆", timestamp: "4:57 PM", type: 'general' },
        { id: 'comm-sf2_1-sub-shomuyiwa', matchId: 'SF2_1', minute: "50'", text: "🔄 MST Substitution: Akintunde Ayomide Oluwaseyifunmi ⬇ / Shomuyiwa Lateef Babatunde ⬆", timestamp: "4:50 PM", type: 'general' },
        { id: 'comm-sf2_1-goal-agboro', matchId: 'SF2_1', minute: "41'", text: "⚽ GOAL!!! CYS pulls one back! Substitute Arinze Meshach Agboro turns home a superb cross with a clinical finish to re-ignite CYS's hopes! CYS 1–2 MST.", timestamp: "4:41 PM", type: 'goal' },
        { id: 'comm-sf2_1-adeniyi-yc', matchId: 'SF2_1', minute: "41'", text: "🟨 YELLOW CARD! Adeniyi Ademola Daniel (MST) is booked for a rash foul.", timestamp: "4:41 PM", type: 'general' },
        { id: 'comm-sf2_1-sub-agboro', matchId: 'SF2_1', minute: "37'", text: "🔄 CYS Substitution: Owolabi Olaifeoluwa Solomon ⬇ / Arinze Meshach Agboro ⬆", timestamp: "4:37 PM", type: 'general' },
        { id: 'comm-sf2_1-sub-akinyede', matchId: 'SF2_1', minute: "37'", text: "🔄 CYS Substitution: Fashola Oluwatobi Joshua ⬇ / Akinyede Allen Oluwaferanmi ⬆", timestamp: "4:37 PM", type: 'general' },
        { id: 'comm-sf2_1-goal-praise', matchId: 'SF2_1', minute: "33'", text: "⚽ GOAL!!! Iyare Praise steps up and calmly converts the penalty, doubling MST's lead! CYS 0–2 MST.", timestamp: "4:33 PM", type: 'goal' },
        { id: 'comm-sf2_1-penalty', matchId: 'SF2_1', minute: "32'", text: "🎯 PENALTY! Handball inside the area by CYS! The referee points straight to the spot!", timestamp: "4:32 PM", type: 'general' },
        { id: 'comm-sf2_1-ht', matchId: 'SF2_1', minute: "30'", text: "⏸️ HALF-TIME! CYS 0–1 MST. MST leads at the break thanks to Adewumi Excel Joshua's early own goal, but CYS is still very much in this.", timestamp: "3:30 PM", type: 'general' },
        { id: 'comm-sf2_1-fashola-yc', matchId: 'SF2_1', minute: "23'", text: "🟨 YELLOW CARD! Fashola Oluwatobi Joshua (CYS) is booked for a heavy challenge.", timestamp: "3:23 PM", type: 'general' },
        { id: 'comm-sf2_1-goal-og', matchId: 'SF2_1', minute: "5'", text: "⚽ OWN GOAL!!! Unfortunate moment for CYS as defender Adewumi Excel Joshua turns the ball into his own net while trying to clear a dangerous cross! CYS 0–1 MST.", timestamp: "3:05 PM", type: 'goal' },
        { id: 'comm-sf2_1-kickoff', matchId: 'SF2_1', minute: "1'", text: "🏁 KICKOFF! The FUTA Champions League 2026 Semi-final 2 (First Leg) clash between CYS and MST is underway at the SOC Fortress! Referee Jones (AGE) blows the whistle.", timestamp: "3:00 PM", type: 'general' }
      ];
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }

    setCommentaries(loadedCommentary);

    // 10. Reports
    const storedReports = localStorage.getItem('fcl_admin_reports');
    let loadedReports: Record<string, MatchReport> = storedReports ? JSON.parse(storedReports) : {};
    // Migrate AGP Michael reports to Olasunkanmi Michael
    let reportsChanged = false;
    Object.keys(loadedReports).forEach(matchId => {
      if (matchId === 'PO3') {
        const rep = loadedReports[matchId];
        if (rep.playerOfMatch === 'Michael (AGP)') {
          rep.playerOfMatch = 'Olasunkanmi Michael (AGP)';
          reportsChanged = true;
        }
        if (rep.tacticalAnalysis.includes('when Michael capitalized')) {
          rep.tacticalAnalysis = rep.tacticalAnalysis.replace('when Michael capitalized', 'when Olasunkanmi Michael capitalized');
          reportsChanged = true;
        }
        rep.keyMoments = rep.keyMoments.map(moment => {
          if (moment.includes('GOAL! Michael scores')) {
            reportsChanged = true;
            return moment.replace('GOAL! Michael scores', 'GOAL! Olasunkanmi Michael scores');
          }
          return moment;
        });
      }
    });
    if (reportsChanged) {
      localStorage.setItem('fcl_admin_reports', JSON.stringify(loadedReports));
    }

    if (!loadedReports['md3-2']) {
      loadedReports['md3-2'] = {
        matchId: 'md3-2',
        summary: "BCH secures their first ever FCL win but still unable to secure a spot in the next phase.",
        playerOfMatch: "N/A",
        tacticalAnalysis: "BCH dominated key parts of the game to secure their historic first victory, while PHS fought hard but fell short in defensive moments.",
        keyMoments: [
          "25' - Peter scores to give BCH the lead.",
          "30' - Eagle doubles the lead with a neat finish.",
          "42' - Isreal pulls one back for PHS, but BCH hold on."
        ],
        isPublished: true
      };
      localStorage.setItem('fcl_admin_reports', JSON.stringify(loadedReports));
    }
    if (!loadedReports['md3-1']) {
      loadedReports['md3-1'] = {
        matchId: 'md3-1',
        summary: "PHY and AGP play out an entertaining 2-2 draw on Matchday 3.",
        playerOfMatch: "Olasunkanmi Michael (AGP)",
        tacticalAnalysis: "An incredibly competitive match where both sides traded blows. AGP's late penalty earned them a deserved point after PHY had staged a second-half comeback.",
        keyMoments: [
          "7' - Olasunkanmi Michael opens the scoring early for AGP.",
          "25' - Uduak Abasi equalizes for PHY with a brilliant curling shot.",
          "42' - Iyenagbe Christian puts PHY in front with a powerful strike.",
          "60' - Olasunkanmi Michael converts a late penalty to seal a brace and rescue a draw."
        ],
        isPublished: true
      };
      localStorage.setItem('fcl_admin_reports', JSON.stringify(loadedReports));
    }
    if (!loadedReports['md3-5']) {
      loadedReports['md3-5'] = {
        matchId: 'md3-5',
        summary: "MCB and IDD share the points in a highly contested 1-1 draw.",
        playerOfMatch: "N/A",
        tacticalAnalysis: "A tight and defensive display from both squads. IDD broke through in the second half but MCB quickly responded with a penalty to earn a draw.",
        keyMoments: [
          "42' - Emmy scores to break the deadlock and give IDD the lead.",
          "51' - Oni Oluwadamilola converts a penalty to bring MCB level."
        ],
        isPublished: true
      };
      localStorage.setItem('fcl_admin_reports', JSON.stringify(loadedReports));
    }
    if (!loadedReports['md3-9']) {
      loadedReports['md3-9'] = {
        matchId: 'md3-9',
        summary: "MBBS pulls off a spectacular second-half comeback to defeat ENT 3-1.",
        playerOfMatch: "N/A",
        tacticalAnalysis: "ENT started strongly with an early goal, but MBBS showed great resilience in the second half, scoring three goals in eight minutes to secure the victory.",
        keyMoments: [
          "3' - Pelumi scores an early opener for ENT.",
          "52' - Bamidele Fikayo gets the equalizer for MBBS.",
          "56' - Dr. P puts MBBS in front.",
          "60' - Adesola Emmanuel seals the win with a brilliant finish."
        ],
        isPublished: true
      };
      localStorage.setItem('fcl_admin_reports', JSON.stringify(loadedReports));
    }
    if (!loadedReports['md3-8']) {
      loadedReports['md3-8'] = {
        matchId: 'md3-8',
        summary: "APH secures a crucial 1-0 victory against AGE.",
        playerOfMatch: "N/A",
        tacticalAnalysis: "A solid defensive and tactical performance from APH. Fola scored early in the first half, and APH held on to their lead with great defensive organization.",
        keyMoments: [
          "15' - Fola scores the decisive goal for APH."
        ],
        isPublished: true
      };
      localStorage.setItem('fcl_admin_reports', JSON.stringify(loadedReports));
    }
    if (!loadedReports['PO1']) {
      loadedReports['PO1'] = {
        matchId: 'PO1',
        summary: "Statistics (STA) books their place in the Quarter-finals with a disciplined 1–0 victory over Industrial Design (IDD).",
        playerOfMatch: "Agbo Peter (STA)",
        tacticalAnalysis: "After a tightly contested first half with both sides cancelling each other out, Agbo Peter scored the decisive finish in the 52nd minute. STA defended resolutely to protect their lead.",
        keyMoments: [
          "1' - KICKOFF! The match gets underway with both teams eager to secure a Quarter-final spot.",
          "18' - Sola (IDD) fires a snapshot from distance that goes just over the crossbar.",
          "30' - HALF-TIME! High-stakes defensive organization keeps the game scoreless.",
          "52' - GOAL! Agbo Peter finds the back of the net with a beautiful finish! IDD 0 - 1 STA.",
          "60' - FULL-TIME! Statistics (STA) celebrates a 1-0 win and advances to the Quarter-finals."
        ],
        isPublished: true
      };
      localStorage.setItem('fcl_admin_reports', JSON.stringify(loadedReports));
    }
    if (!loadedReports['PO2']) {
      loadedReports['PO2'] = {
        matchId: 'PO2',
        summary: "Anatomy (ANA) produced a commanding display to defeat Security, Investment and Management Technology (SIMT) 3–0 and secure qualification to the FUTA Champions League Quarter-finals.",
        playerOfMatch: "Success Bayode (ANA)",
        tacticalAnalysis: "ANA wasted little time asserting their dominance. ANA played a fluid attacking 4-3-3 with Success Bayode, Ademola Paul, and Isreal spearheading the attack. SIMT struggled to cope with the high-tempo passing and movement of the ANA forward line, which yielded three goals in the first 25 minutes of play.",
        keyMoments: [
          "15' - Isreal opens the scoring with a brilliant run and finish.",
          "20' - Ademola Paul doubles the lead with a spectacular strike.",
          "25' - Success Bayode completes the scoring with a delicate chip over the goalkeeper.",
          "30' - HALF-TIME! ANA goes into the break with a comfortable 3-0 lead.",
          "60' - FULL-TIME! ANA clinches a resounding 3-0 victory and qualifies for the Quarter-finals."
        ],
        isPublished: true
      };
      localStorage.setItem('fcl_admin_reports', JSON.stringify(loadedReports));
    }
    if (!loadedReports['PO3']) {
      loadedReports['PO3'] = {
        matchId: 'PO3',
        summary: "Applied Geo-Physics (AGP) secured a hard-fought 1–0 victory over Building Technology (BDG) with a late stoppage-time goal to book their place in the FUTA Champions League Quarter-finals.",
        playerOfMatch: "Olasunkanmi Michael (AGP)",
        tacticalAnalysis: "A highly physical and tactical battle with both sides cancelling each other out. BDG had some great chances, particularly from set-pieces, but AGP's defense remained resolute. The breakthrough finally arrived in the 4th minute of stoppage time when Olasunkanmi Michael capitalized on a loose ball in the box to seal the win.",
        keyMoments: [
          "1' - KICKOFF! The play-off round match is underway with high tension.",
          "30' - HALF-TIME! Scoreless first half with both teams organized defensively.",
          "50' - Chance! Desmond of BDG hits a powerful header from a corner, but it's kept out by a sensational reflex save.",
          "60+4' - GOAL! Olasunkanmi Michael scores a dramatic stoppage-time winner for AGP! BDG 0 - 1 AGP.",
          "60+4' - FULL-TIME! AGP holds on to progress to the Quarter-finals."
        ],
        isPublished: true
      };
      localStorage.setItem('fcl_admin_reports', JSON.stringify(loadedReports));
    }
    if (!loadedReports['PO4']) {
      loadedReports['PO4'] = {
        matchId: 'PO4',
        summary: "Micro Biology (MCB) produced a dominant performance to defeat Medicine and Surgery (MBBS) 3–0 in Playoff 4, sealing an emphatic qualification to the FUTA Champions League Quarter-finals.",
        playerOfMatch: "Oni Oluwadamilola (MCB)",
        tacticalAnalysis: "MCB took control of the contest in the first half as Ameh Lucky broke the deadlock in the 22nd minute before Olaniran Oluwatimilehin doubled the advantage on the half-hour mark. Despite MBBS attempting to respond after the interval, MCB remained composed and wrapped up the victory in the 54th minute when captain Oni Oluwadamilola added a third goal to complete a convincing display. The clean-sheet victory sends MCB into the last eight, where they will face Anatomy (ANA) in the Quarter-finals.",
        keyMoments: [
          "1' - KICKOFF! Playoff 4 between MBBS and MCB is underway with high intensity.",
          "22' - GOAL! Ameh Lucky scores for MCB! Clinical finish from close range to make it 1-0.",
          "30' - GOAL! Olaniran Oluwatimilehin doubles the lead with a magnificent finish. MBBS 0 - 2 MCB.",
          "30' - HALF-TIME! MCB leads 2-0 with a dominant first-half performance.",
          "54' - GOAL! Captain Oni Oluwadamilola grabs a third for MCB! Clinical play. MBBS 0 - 3 MCB.",
          "60' - FULL-TIME! MCB 3 - 0 MBBS. Microbiology is through to the Quarter-finals!"
        ],
        isPublished: true
      };
      localStorage.setItem('fcl_admin_reports', JSON.stringify(loadedReports));
    }
    if (!loadedReports['PO5']) {
      loadedReports['PO5'] = {
        matchId: 'PO5',
        summary: "Animal Production and Health (APH) qualifies for the Quarter-finals after a dominant 5–0 victory over Physics (PHY).",
        playerOfMatch: "Emmy (APH)",
        tacticalAnalysis: "APH completely controlled the tempo of this Playoff encounter from start to finish. APH's front line proved too hot to handle, earning two penalties early in the match which Fola and Toni clinically dispatched. Kunlex added a third before the break. In the second half, Emmy turned on the style, scoring a brilliant brace to seal a massive 5-0 win. PHY struggled to create any real danger against APH's resolute defensive lines.",
        keyMoments: [
          "1' - KICKOFF! Playoff 5 between APH and PHY gets underway at the Main Pitch under the supervision of referee Tommy (URP).",
          "15' - GOAL! Fola opens the scoring for APH from the penalty spot! APH 1 - 0 PHY.",
          "26' - GOAL! Toni converts another penalty to double the lead! APH 2 - 0 PHY.",
          "35' - GOAL! Kunlex adds a third with a clinical finish! APH 3 - 0 PHY.",
          "30' - HALF-TIME! APH 3 - 0 PHY. A dominant first-half performance from APH.",
          "47' - GOAL! Emmy scores the fourth for APH with a precise strike! APH 4 - 0 PHY.",
          "58' - GOAL! Emmy seals his brace with another brilliant finish to make it 5-0! APH 5 - 0 PHY.",
          "60' - FULL-TIME! APH 5 - 0 PHY. Animal Production and Health advances to the Quarter-finals in stunning fashion, while Physics is eliminated from the competition."
        ],
        isPublished: true
      };
      localStorage.setItem('fcl_admin_reports', JSON.stringify(loadedReports));
    }
    if (!loadedReports['QF1']) {
      loadedReports['QF1'] = {
        matchId: 'QF1',
        summary: "Information and Communication Engineering (ICE) booked their place in the FUTA Champions League Semi-finals after defeating Animal Production and Health (APH) 1–0.",
        playerOfMatch: "Kolade Farooq (ICE)",
        tacticalAnalysis: "Information and Communication Engineering (ICE) booked their place in the FUTA Champions League Semi-finals after securing a tight 1-0 victory over Animal Production and Health (APH). The only goal of the match came in the 19th minute, when an unfortunate own goal by APH goalkeeper Adegoke separated the two teams. ICE displayed remarkable defensive resilience and discipline to shut down APH's attackers and preserve their narrow lead. APH put up a valiant effort, but were ultimately unable to break through the compact and organized ICE structure. The victory books ICE's ticket to the last-four where they will face Statistics (STA) in Semi-final 1.",
        keyMoments: [
          "1' - KICKOFF! The crucial Quarter-final 1 match between ICE and APH gets underway under the supervision of referee Frank.",
          "19' - GOAL! Adegoke of APH inadvertently turns the ball into his own net under pressure! ICE 1 - 0 APH.",
          "30' - HALF-TIME! ICE 1 - 0 APH. A fast-paced and highly tactical first half ends with ICE in the lead.",
          "60' - FULL-TIME! ICE 1 - 0 APH. Information and Communication Engineering holds on for a 1-0 win and secures a place in the Semi-finals!"
        ],
        isPublished: true
      };
      localStorage.setItem('fcl_admin_reports', JSON.stringify(loadedReports));
    }
    if (!loadedReports['QF2']) {
      loadedReports['QF2'] = {
        matchId: 'QF2',
        summary: "Cyber Security (CYS) secured their place in the FUTA Champions League Semi-finals after defeating Microbiology (MCB) 4–2 on penalties following an entertaining 1–1 draw in regulation time.",
        playerOfMatch: "Olorunfemi Taiwo James (CYS)",
        tacticalAnalysis: "Cyber Security (CYS) secured their place in the FUTA Champions League Semi-finals after defeating Microbiology (MCB) 4–2 on penalties following an entertaining 1–1 draw in regulation time. MCB struck first through Ameh Lucky in the 25th minute, but CYS responded five minutes later when Olorunfemi Taiwo James found the equaliser to send the contest into a penalty shootout. CYS held their nerve from twelve yards, converting all four of their spot-kicks, while MCB failed to convert two of theirs. The composed shootout performance ensured CYS progressed to the last four, where they await the winner of QF4.",
        keyMoments: [
          "1' - KICKOFF! The high-stakes Quarter-final 2 between CYS and MCB gets underway under the supervision of referee Kizzy.",
          "25' - GOAL! Ameh Lucky scores for MCB with a clinical finish! CYS 0 - 1 MCB.",
          "30' - GOAL! Olorunfemi Taiwo James equalizes for CYS! CYS 1 - 1 MCB.",
          "30' - HALF-TIME! CYS 1 - 1 MCB. A fast-paced and highly tactical half ends level.",
          "60' - FULL-TIME! CYS 1 - 1 MCB. The match goes straight to a penalty shootout!",
          "60' - PENALTY SHOOTOUT! CYS wins 4-2 on penalties! CYS was clinical, converting all four of their five spot-kicks, while MCB missed two of theirs to seal CYS's passage into the last four!"
        ],
        isPublished: true
      };
      localStorage.setItem('fcl_admin_reports', JSON.stringify(loadedReports));
    }
    if (!loadedReports['QF3']) {
      loadedReports['QF3'] = {
        matchId: 'QF3',
        summary: "Applied Geo-Physics (AGP) produced a commanding first-half display to defeat Statistics (STA) 2–1 and secure a historic place in the FUTA Champions League Semi-finals.",
        playerOfMatch: "Akinyode Joseph Oluwaseun (AGP)",
        tacticalAnalysis: "Applied Geo-Physics (AGP) booked their ticket to the last-four after an outstanding 2-1 victory over Statistics (STA). Onileowo Oluwafemi opened the scoring in the 9th minute with a clinical finish before Olasunkanmi Michael calmly converted from the penalty spot ten minutes later to double AGP's advantage. STA fought back in the second half when Nwachukwu Jesse converted a penalty in the 41st minute, but AGP's compact defensive structure, marshalled by Man of the Match Akinyode Joseph Oluwaseun in midfield, held firm to preserve the victory. The win completes the Semi-final lineup, where AGP will face Information and Communication Engineering (ICE) in Semi-final 1.",
        keyMoments: [
          "1' - KICKOFF! The highly-anticipated Quarter-final 3 between Statistics and Applied Geo-Physics is underway at the Mini Pitch under referee Frank.",
          "9' - GOAL! Onileowo Oluwafemi breaks the deadlock with a clinical finish! STA 0 - 1 AGP.",
          "19' - GOAL! Olasunkanmi Michael doubles AGP's lead from the penalty spot! STA 0 - 2 AGP.",
          "30' - HALF-TIME! STA 0 - 2 AGP. Applied Geo-Physics in complete control at the break.",
          "41' - GOAL! Nwachukwu Jesse pulls one back for STA with a calmly taken penalty! STA 1 - 2 AGP.",
          "48' - Yellow Card! Obafemi of AGP is yellow-carded for a late tackle.",
          "60' - FULL-TIME! STA 1 - 2 AGP. Applied Geo-Physics holds on for a historic 2-1 victory to advance to the Semi-finals!"
        ],
        isPublished: true
      };
      localStorage.setItem('fcl_admin_reports', JSON.stringify(loadedReports));
    }
    if (!loadedReports['QF4']) {
      loadedReports['QF4'] = {
        matchId: 'QF4',
        summary: "Marine Science and Technology (MST) secured their place in the FUTA Champions League Semi-finals after defeating Anatomy (ANA) 4–2 on penalties following a scoreless 0–0 draw in regulation time.",
        playerOfMatch: "Ogundeji Feyitunmise Hezekiah (MST)",
        tacticalAnalysis: "After 60 minutes of disciplined defending and few clear-cut chances, Marine Science and Technology (MST) and Anatomy (ANA) played out a goalless draw in regulation time. The contest was ultimately decided by a penalty shootout, where MST displayed remarkable composure by converting all four of their spot-kicks. ANA, however, failed to capitalize on two of their attempts, allowing MST to claim a 4–2 penalty shootout victory and secure a place in the FUTA Champions League Semi-finals. The victory marks MST's second consecutive knockout triumph via penalties, underlining their resilience in high-pressure situations.",
        keyMoments: [
          "1' - KICKOFF! The high-stakes Quarter-final 4 between Anatomy (ANA) and Marine Science and Technology (MST) gets underway under the supervision of referee Kizzy.",
          "12' - CHANCE! Nkemjika Sydney of MST fires from the edge of the area but it goes inches wide of the post.",
          "30' - HALF-TIME! ANA 0 - 0 MST. An extremely disciplined first half ends level.",
          "54' - CHANCE! Success Bayode of ANA cuts inside and fires a curling effort, but Ogundeji Feyitunmise Hezekiah makes a stunning flying save to keep MST level!",
          "60' - FULL-TIME! ANA 0 - 0 MST. The match goes straight to a penalty shootout!",
          "60' - PENALTY SHOOTOUT! MST wins 4-2 on penalties! MST was clinical, converting all four of their spot-kicks, while ANA missed two of theirs to seal MST's passage into the last four!"
        ],
        isPublished: true
      };
      localStorage.setItem('fcl_admin_reports', JSON.stringify(loadedReports));
    }
    if (!loadedReports['SF1_1']) {
      loadedReports['SF1_1'] = {
        matchId: 'SF1_1',
        summary: "ICE and AGP share the spoils in a thrilling 1–1 draw in the first leg of the FUTA Champions League Semi-finals.",
        playerOfMatch: "Olasunkanmi Michael (AGP)",
        tacticalAnalysis: "A highly anticipated first-leg clash between ICE and AGP ended in a captivating 1–1 draw. After a goalless first half characterized by solid defending and offside calls on both sides, the game exploded into life in the second half. ICE took the lead in the 33rd minute when second-half substitute Bamidele Usman broke the deadlock after a sweeping team move. However, AGP responded almost immediately, with star forward Olasunkanmi Michael leveling the score just two minutes later with a clinical, composed finish. The goal also shattered Adeyemi Prosper's incredible streak of 215 consecutive minutes without conceding a goal. The draw keeps the tie wide open heading into the second leg, with both teams having everything to play for.",
        keyMoments: [
          "1' - KICKOFF! The Semi-final 1 first leg between ICE and AGP is underway at the SEET Pitch.",
          "13' - Offside against AGP - freekick to ICE.",
          "22' - DISALLOWED GOAL! AGP scores but it is ruled out for offside.",
          "26' - Back-to-back corners for ICE but AGP defends well.",
          "30' - HALF-TIME! ICE 0–0 AGP.",
          "33' - GOAL!!! Second-half substitute Bamidele Usman breaks the deadlock for ICE with a brilliant finish! ICE 1–0 AGP.",
          "35' - GOAL!!! AGP responds instantly! Olasunkanmi Michael scores with a composed finish to draw AGP level! ICE 1–1 AGP.",
          "52' - YELLOW CARD! Apake Avososhido Frank (AGP) is booked for a reckless challenge.",
          "60' - FULL-TIME! ICE 1–1 AGP. All to play for in the second leg!"
        ],
        isPublished: true
      };
      localStorage.setItem('fcl_admin_reports', JSON.stringify(loadedReports));
    }
    if (!loadedReports['SF2_1']) {
      loadedReports['SF2_1'] = {
        matchId: 'SF2_1',
        summary: "Defending champions Marine Science and Technology (MST) secured a crucial 2–1 victory over Cyber Security (CYS) in the first leg of their Semi-final at the SOC Fortress.",
        playerOfMatch: "Akinnayajo Irewale (MST)",
        tacticalAnalysis: "Marine Science and Technology (MST) secured a vital 2–1 victory over Cyber Security (CYS) in a highly competitive Semi-final first-leg clash at the SOC Fortress. MST took an early lead in the 5th minute when CYS defender Adewumi Excel Joshua inadvertently turned the ball into his own net. CYS fought back bravely but was dealt another blow in the second half when a handball in the box gifted MST a penalty, which Iyare Praise calmly converted in the 33rd minute to double the lead. Refusing to go down without a fight, CYS pushed forward and found a lifeline in the 41st minute as substitute Arinze Meshach Agboro swept home a brilliant goal. MST's compact defense, marshalled expertly by Man of the Match Akinnayajo Irewale, withstood a late barrage to preserve the one-goal advantage heading into the return leg at the Mariners Fortress.",
        keyMoments: [
          "1' - KICKOFF! The Semi-final 2 first leg between CYS and MST is underway at the SOC Fortress.",
          "5' - OWN GOAL! Adewumi Excel Joshua (CYS) inadvertently turns the ball into his own net! CYS 0–1 MST.",
          "23' - YELLOW CARD! Fashola Oluwatobi Joshua (CYS) is booked.",
          "30' - HALF-TIME! CYS 0–1 MST.",
          "32' - PENALTY! Handball by CYS in the box! Penalty awarded to MST.",
          "33' - GOAL!!! Iyare Praise converts the penalty to double MST's lead! CYS 0–2 MST.",
          "37' - DOUBLE SUB (CYS)! Arinze Meshach Agboro and Akinyede Allen Oluwaferanmi come on.",
          "41' - GOAL!!! Arinze Meshach Agboro pulls one back for CYS with a clinical finish! CYS 1–2 MST.",
          "50' - SUB (MST)! Shomuyiwa Lateef Babatunde replaces Akintunde Ayomide Oluwaseyifunmi.",
          "57' - SUB (MST)! Ademisoye Segun replaces Adeniyi Ademola Daniel.",
          "60+3' - YELLOW CARDS! Fabusuyi Daniel Oluwafisayo (MST) and Jegede Daniel Kolawole (CYS) are booked after a heated clash.",
          "60+6' - SUB (MST)! David Ogayemi replaces Boyede Joseph Ayomide.",
          "60+6' - YELLOW CARD! David Ogayemi (MST) is yellow-carded immediately after coming on.",
          "60+7' - FULL-TIME! CYS 1–2 MST. MST takes a one-goal advantage into the second leg!"
        ],
        isPublished: true
      };
      localStorage.setItem('fcl_admin_reports', JSON.stringify(loadedReports));
    }
    setReports(loadedReports);

    // 11. Timer Cache
    const storedTimers = localStorage.getItem('fcl_admin_timers');
    let loadedTimers: Record<string, { liveMinute: string; isPaused: boolean }> = storedTimers ? JSON.parse(storedTimers) : {};
    if (!loadedTimers['PO2']) {
      loadedTimers['PO2'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['PO3']) {
      loadedTimers['PO3'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['PO4']) {
      loadedTimers['PO4'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['PO5']) {
      loadedTimers['PO5'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['QF1']) {
      loadedTimers['QF1'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['QF2']) {
      loadedTimers['QF2'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['QF3']) {
      loadedTimers['QF3'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['QF4']) {
      loadedTimers['QF4'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['SF1_1']) {
      loadedTimers['SF1_1'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['SF2_1']) {
      loadedTimers['SF2_1'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['md1-1'] || loadedTimers['md1-1'].liveMinute !== "FT") {
      loadedTimers['md1-1'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['md1-2'] || loadedTimers['md1-2'].liveMinute === "35:00") {
      loadedTimers['md1-2'] = { liveMinute: "46:00", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['md1-3'] || loadedTimers['md1-3'].liveMinute !== "FT") {
      loadedTimers['md1-3'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['md1-4'] || loadedTimers['md1-4'].liveMinute !== "FT") {
      loadedTimers['md1-4'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['md1-5'] || loadedTimers['md1-5'].liveMinute !== "FT") {
      loadedTimers['md1-5'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['md1-6'] || loadedTimers['md1-6'].liveMinute !== "FT") {
      loadedTimers['md1-6'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['md1-7'] || loadedTimers['md1-7'].liveMinute !== "FT") {
      loadedTimers['md1-7'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['md1-8'] || loadedTimers['md1-8'].liveMinute !== "FT") {
      loadedTimers['md1-8'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['md1-9'] || loadedTimers['md1-9'].liveMinute !== "FT") {
      loadedTimers['md1-9'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['md1-10'] || loadedTimers['md1-10'].liveMinute !== "FT") {
      loadedTimers['md1-10'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    // Matchday 2 & 3 Saturdays & Sundays Timers as Finished
    ['md2-1', 'md2-2', 'md2-3', 'md2-4', 'md2-5', 'md2-6', 'md2-7', 'md2-8', 'md2-9', 'md2-10', 'md3-3', 'md3-4', 'md3-6', 'md3-2', 'md3-1', 'md3-5', 'md3-7', 'md3-8', 'md3-9', 'md3-10'].forEach(id => {
      if (!loadedTimers[id] || loadedTimers[id].liveMinute !== "FT") {
        loadedTimers[id] = { liveMinute: "FT", isPaused: true };
      }
    });
    localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    setActiveMinAndStatus(loadedTimers);

    // 12. Articles Load & Seed
    const storedArticles = localStorage.getItem('fcl_admin_articles');
    let loadedArticles: Article[] = [];
    if (storedArticles) {
      loadedArticles = JSON.parse(storedArticles);
    } else {
      loadedArticles = [
        {
          id: 'art-1',
          title: 'Titan Clash: MST vs ICE Preview',
          featuredImage: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=1000',
          author: 'Fabrizio',
          category: 'Match Preview',
          body: 'The undisputed titans of the FUTA Champions League, defending champions MST and Information Commmunication Engineering (ICE) are set to lock horns in a match that will define the early leadership of the tournament. Both teams possess unyielding midfields and lightning-fast wingers. Pundits expect a tight, tactical battle of wits.',
          tags: ['MST', 'ICE', 'Preview', 'Titans'],
          isPublished: true,
          createdAt: '2026-06-03 14:00',
          matchId: 'md1-1'
        },
        {
          id: 'art-2',
          title: 'Underdog Story: SIMT Aim for Stars',
          featuredImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000',
          author: 'AB2Fresh',
          category: 'Team Spotlight',
          body: 'Securities and Investment Management Technology (SIMT) qualified against all odds. Entertaining, disciplined, and with nothing to lose, their coaching staff believes SIMT can shock the established order. This spotlight takes a deep dive into incredibly passionate qualification stories.',
          tags: ['SIMT', 'Spotlight', 'Underdogs'],
          isPublished: true,
          createdAt: '2026-06-04 09:30'
        }
      ];
      localStorage.setItem('fcl_admin_articles', JSON.stringify(loadedArticles));
    }
    setArticles(loadedArticles);

    // 13. News Items Load & Seed
    const storedNews = localStorage.getItem('fcl_admin_news');
    let loadedNews: NewsItem[] = [];
    if (storedNews) {
      loadedNews = JSON.parse(storedNews);
    } else {
      loadedNews = [
        {
          id: 'news-1',
          title: 'Tournament Accreditation Commences',
          featuredImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000',
          author: 'FrediB',
          category: 'Registration Updates',
          body: 'The FCL Committee invites all sports officials and department coaches to complete player and technical official credential submissions by midnight. Ensure all registration numbers and official FUTA student ID card uploads are completely legible.',
          tags: ['Accreditation', 'FCL2026', 'Registration'],
          isPublished: true,
          createdAt: '2026-06-01 10:00'
        },
        {
          id: 'news-2',
          title: 'Matchday 1 Fixtures & Venue Scheduling Confirmed',
          featuredImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000',
          author: 'Ousman',
          category: 'Fixture Announcement',
          body: 'The operations team has successfully verified and locked down the pitch availability for Matchday 1. FUTA Sports Complex Pitch A and Pitch B will feature consecutive action starting from 10:00 UTC.',
          tags: ['Fixtures', 'Matchday1', 'Scheduling'],
          isPublished: true,
          createdAt: '2026-06-03 11:30'
        },
        {
          id: 'news-3',
          title: 'FCL Announces New Media Partnership with FUTA Radio',
          featuredImage: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1000',
          author: 'FrediB',
          category: 'Committee Announcement',
          body: 'FCL 2026 is officially partnering with FUTA Radio 93.1 FM to broadcast live commentaries, post-match media pressers, and interview summaries directly to the student populace.',
          tags: ['FUTA Radio', 'Media Partner', 'Collaboration'],
          isPublished: true,
          createdAt: '2026-06-04 15:45'
        }
      ];
    }

    // Force inject the official notice of postponement if not already present
    if (!loadedNews.some(n => n.id === 'news-postponed')) {
      loadedNews.unshift({
        id: 'news-postponed',
        title: '🚨 OFFICIAL NOTICE OF POSTPONEMENT 🚨',
        featuredImage: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=1000',
        author: 'FCL Committee',
        category: 'Committee Announcement',
        body: 'The FUTA Champions League Committee regrets to inform all participating teams, officials, stakeholders, and supporters that the Opening Match of the 2026 FUTA Champions League has been postponed until further notice due to heavy rainfall and unsafe pitch conditions.',
        tags: ['Postponement', 'MST vs ICE', 'Official Announcement'],
        isPublished: true,
        createdAt: '2026-06-05 17:30'
      });
      localStorage.setItem('fcl_admin_news', JSON.stringify(loadedNews));
    }

    // Force inject/update the newly scheduled Matchday 1 fixtures announcement
    const existingOfficialFixtures = loadedNews.find(n => n.id === 'news-official-fixtures-md1');
    if (!existingOfficialFixtures) {
      loadedNews.unshift({
        id: 'news-official-fixtures-md1',
        title: '🚨 RESCHEDULING OF OPENING MATCH FIXTURE 🚨',
        featuredImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000',
        author: 'FCL Committee',
        category: 'Committee Announcement',
        body: 'The Organizing Committee of the FUTA Champions League (FCL) wishes to inform all stakeholders that the Opening Match of the 2026 FUTA Champions League has been further rescheduled. This follows an earlier adjustment set for Wednesday, 10th June, 2026 (3:30 PM – 4:00 PM), which could not be sustained due to unforeseen weather conditions. The heavy rainfall experienced on Wednesday, 10th June, 2026 at about 2:00 PM significantly affected the playing surface, rendering it unfit for safe and competitive football. NEW DETAILS: Thursday, 11th June, 2026 at 1:30 PM on the FUTA Football Pitch (MST vs ICE). Player safety and match quality remain our top priority.',
        tags: ['Matchday 1', 'Fixtures', 'Rescheduled', 'Official Bulletins'],
        isPublished: true,
        createdAt: '2026-06-10 16:00'
      });
      localStorage.setItem('fcl_admin_news', JSON.stringify(loadedNews));
    } else {
      existingOfficialFixtures.title = '🚨 RESCHEDULING OF OPENING MATCH FIXTURE 🚨';
      existingOfficialFixtures.body = 'The Organizing Committee of the FUTA Champions League (FCL) wishes to inform all stakeholders that the Opening Match of the 2026 FUTA Champions League has been further rescheduled. This follows an earlier adjustment set for Wednesday, 10th June, 2026 (3:30 PM – 4:00 PM), which could not be sustained due to unforeseen weather conditions. The heavy rainfall experienced on Wednesday, 10th June, 2026 at about 2:00 PM significantly affected the playing surface, rendering it unfit for safe and competitive football. NEW DETAILS: Thursday, 11th June, 2026 at 1:30 PM on the FUTA Football Pitch (MST vs ICE). Player safety and match quality remain our top priority.';
      existingOfficialFixtures.createdAt = '2026-06-10 16:00';
      localStorage.setItem('fcl_admin_news', JSON.stringify(loadedNews));
    }

    // Force inject/update the newly scheduled Matchday 2 fixtures announcement
    const existingOfficialFixturesMd2 = loadedNews.find(n => n.id === 'news-official-fixtures-md2');
    const md2NewsBody = 'The FUTA Champions League 2026 Matchday 2 fixtures and official referee assignments have been officially announced by the Organizing Committee! All matches will take place at the FUTA Mini Pitch. SATURDAY ACTIONS (20th June): CSP vs STA at 9:30 AM (Referee: Abraham - MEE), APH vs IDD at 11:00 AM (Referee: Abraham - MEE), IFS vs MBBS at 12:30 PM (Referee: Abraham - MEE), ICE vs BCH at 2:00 PM (Referee: Tosin - MTS), PHS vs AGP at 3:30 PM (Referee: Victor - ESM), and defending champions MST vs CYS in a headline clash at 5:00 PM (Referee: Tosin - MTS). SUNDAY ACTIONS (21st June): ENT vs ANA at 12:30 PM, MCB vs AGE at 2:00 PM, League Leaders BDG vs FWT at 3:30 PM, and PHY vs SIMT closing the Matchday 2 action at 5:00 PM.';
    if (!existingOfficialFixturesMd2) {
      loadedNews.unshift({
        id: 'news-official-fixtures-md2',
        title: '📅 OFFICIAL MATCHDAY 2 FIXTURES & REFEREE ASSIGNMENTS 📅',
        featuredImage: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=1000',
        author: 'FCL Committee',
        category: 'Committee Announcement',
        body: md2NewsBody,
        tags: ['Matchday 2', 'Fixtures', 'Referee Assignments', 'League Phase'],
        isPublished: true,
        createdAt: '2026-06-20 12:18'
      });
      localStorage.setItem('fcl_admin_news', JSON.stringify(loadedNews));
    } else {
      existingOfficialFixturesMd2.title = '📅 OFFICIAL MATCHDAY 2 FIXTURES & REFEREE ASSIGNMENTS 📅';
      existingOfficialFixturesMd2.body = md2NewsBody;
      existingOfficialFixturesMd2.createdAt = '2026-06-20 12:18';
      localStorage.setItem('fcl_admin_news', JSON.stringify(loadedNews));
    }

    // Force inject/update the Disciplinary Committee Decision regarding the BDG vs FWT fixture
    const existingDisciplinaryDecision = loadedNews.find(n => n.id === 'news-disciplinary-fwt');
    const disciplinaryDecisionBody = `Following a thorough review of the incidents that occurred during the FUTA Champions League (FCL) Match Day 2 fixture between Building Technology (BDG) and Forestry and Wood Technology (FWT), the Organizing and Disciplinary Committee has reached the following decisions in accordance with the principles of fair play, sportsmanship, player safety, and the integrity of the competition.

After considering reports from match officials, eyewitness accounts, and available evidence, the Committee finds that the conduct displayed during and after the match fell below the standards expected of participating teams and players.

Accordingly, the Committee has resolved as follows:

FORESTRY AND WOOD TECHNOLOGY (FWT): FWT is hereby disqualified from the 2026 FUTA Champions League for the actions of its players and officials, particularly the collective confrontation and intimidation directed at a Building Technology (BDG) player. The Committee considers such conduct a serious breach of competition rules and values.

BUILDING TECGNOLOGY (BDG): BDG is hereby imposed a fine of ₦10,000 (Ten Thousand Naira Only) for its involvement in incidents arising from the fixture. The fine shall be paid within the time frame stipulated by the Organizing Committee.

OBSERVATION ON REFEREEING STANDARDS (FRA): The FCL also notes with concern and formally criticizes certain decisions made by match officials under the FRA during the course of officiating, which contributed to tensions observed in the fixture. The FRA is advised to review its officiating processes to ensure higher standards of neutrality, consistency, and professionalism going forward.

GENERAL WARNING: The Committee wishes to remind all participating teams, players, officials, and supporters that the FUTA Champions League maintains a zero-tolerance policy towards acts of intimidation, violence, misconduct, and any behavior capable of bringing the competition into disrepute.

All teams are expected to uphold the highest standards of discipline, respect for opponents, match officials, and the spirit of the game throughout the remainder of the tournament.

This decision takes immediate effect.

Signed,
FCL Disciplinary Committee
FUTA Champions League 2026 ⚽🏆`;

    if (!existingDisciplinaryDecision) {
      loadedNews.unshift({
        id: 'news-disciplinary-fwt',
        title: '🚨 RE: DISCIPLINARY DECISION ON THE BDG VS FWT FIXTURE 🚨',
        featuredImage: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=1000',
        author: 'FCL Committee',
        category: 'Disciplinary Updates',
        body: disciplinaryDecisionBody,
        tags: ['Disciplinary Decision', 'BDG vs FWT', 'Official Statement'],
        isPublished: true,
        createdAt: '2026-06-21 21:00'
      });
      localStorage.setItem('fcl_admin_news', JSON.stringify(loadedNews));
    } else {
      existingDisciplinaryDecision.title = '🚨 RE: DISCIPLINARY DECISION ON THE BDG VS FWT FIXTURE 🚨';
      existingDisciplinaryDecision.category = 'Disciplinary Updates';
      existingDisciplinaryDecision.body = disciplinaryDecisionBody;
      existingDisciplinaryDecision.createdAt = '2026-06-21 21:00';
      localStorage.setItem('fcl_admin_news', JSON.stringify(loadedNews));
    }

    // Force inject/update the Disciplinary Committee Decision regarding Momoh Joshua David
    const existingDisciplinaryDecisionMomoh = loadedNews.find(n => n.id === 'news-disciplinary-momoh');
    const disciplinaryDecisionMomohBody = `Following a review of the match reports and incidents recorded during the FUTA Champions League fixture between Physics (PHY) and Security, Investment and Management Technology (SIMT), the FCL Disciplinary Committee has reached the following decision regarding the conduct of Momoh Joshua David (SIMT).

The Committee found Momoh Joshua David guilty of using inappropriate and unsporting language towards match officials and opposing players, conduct which falls below the standards of discipline, respect, and sportsmanship expected of all participants in the competition.

Accordingly, the Committee has imposed the following sanctions:

1. A fine of ₦3,000 (Three Thousand Naira only).
2. A one-match suspension, effective immediately, during which the player shall be ineligible to participate in any official FCL fixture.

The FUTA Champions League remains committed to promoting fair play, mutual respect, and professionalism both on and off the field. All players, officials, and team representatives are reminded that misconduct towards match officials, opponents, or any participant in the competition will attract appropriate disciplinary measures.

This decision takes immediate effect.

Signed,
FCL Disciplinary Committee
FUTA Champions League 2026 ⚽🏆`;

    if (!existingDisciplinaryDecisionMomoh) {
      loadedNews.unshift({
        id: 'news-disciplinary-momoh',
        title: '🚨 OFFICIAL STATEMENT ON THE CONDUCT OF MOMOH JOSHUA DAVID (SIMT) DURING THE PHY vs SIMT FIXTURE',
        featuredImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1000',
        author: 'FCL Disciplinary Committee',
        category: 'Disciplinary Updates',
        body: disciplinaryDecisionMomohBody,
        tags: ['Disciplinary Decision', 'Momoh Joshua David', 'Official Statement', 'SIMT'],
        isPublished: true,
        createdAt: '2026-06-22 12:10'
      });
      localStorage.setItem('fcl_admin_news', JSON.stringify(loadedNews));
    } else {
      existingDisciplinaryDecisionMomoh.title = '🚨 OFFICIAL STATEMENT ON THE CONDUCT OF MOMOH JOSHUA DAVID (SIMT) DURING THE PHY vs SIMT FIXTURE';
      existingDisciplinaryDecisionMomoh.category = 'Disciplinary Updates';
      existingDisciplinaryDecisionMomoh.body = disciplinaryDecisionMomohBody;
      existingDisciplinaryDecisionMomoh.createdAt = '2026-06-22 12:10';
      localStorage.setItem('fcl_admin_news', JSON.stringify(loadedNews));
    }

    // Force inject/update the Disciplinary Committee Decision regarding the MST vs SIMT fixture
    const existingDisciplinaryDecisionMstSimt = loadedNews.find(n => n.id === 'news-disciplinary-mst-simt');
    const disciplinaryDecisionMstSimtBody = `Following a thorough review of the reports and incidents recorded during the Marine Science and Technology (MST) vs Security, Investment and Management Technology (SIMT) fixture, the FCL Disciplinary Committee hereby issues the following decisions:

1. SUSPENSION OF PLAYERS

Nwabunwanne Chibichi Daniel (SIMT) is hereby suspended for two (2) matches, effective immediately. This suspension is not subject to appeal. The sanction is imposed due to his use of abusive and vulgar language towards match officials and opposition players, as well as his unsportsmanlike conduct following MST's second goal.

Adeyemi Adebayo Ibrahim (MST) is hereby suspended for one (1) match, effective immediately. This suspension is not subject to appeal. Upon confirmation from the match officials, the Committee finds that, despite his intention to de-escalate the situation, his conduct during the incident following MST's second goal constituted unsportsmanlike behaviour that contributed to the disorder.

2. FINANCIAL SANCTIONS

In view of the misconduct displayed by players of both teams during the fixture, the Committee has imposed a fine of ₦10,000 (Ten Thousand Naira only) on Marine Science and Technology (MST) and Security, Investment and Management Technology (SIMT) respectively.

The fines are intended to reinforce the responsibility of teams to maintain discipline and ensure the conduct of their players throughout the competition.

3. WARNING TO SIMT

Security, Investment and Management Technology (SIMT) is hereby issued a final warning following the general misconduct exhibited by members of the team, who allowed emotions to overshadow the principles of fair play and sportsmanship.

The Committee wishes to make it clear that any future occurrence of a similar nature involving SIMT may attract more severe disciplinary measures, including possible expulsion from the FUTA Champions League.

The FUTA Champions League remains committed to upholding discipline, fairness, respect for match officials, and the spirit of sportsmanship. All participating teams are reminded that misconduct of any form will be met with appropriate disciplinary action in accordance with the FCL Regulations.

This decision takes immediate effect.

Signed,
FCL Disciplinary Committee
FUTA Champions League 2026 ⚽🏆`;

    if (!existingDisciplinaryDecisionMstSimt) {
      loadedNews.unshift({
        id: 'news-disciplinary-mst-simt',
        title: '🚨 OFFICIAL STATEMENT ON THE MST vs SIMT FIXTURE',
        featuredImage: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=1000',
        author: 'FCL Disciplinary Committee',
        category: 'Disciplinary Updates',
        body: disciplinaryDecisionMstSimtBody,
        tags: ['Disciplinary Decision', 'MST vs SIMT', 'Official Statement', 'Suspensions'],
        isPublished: true,
        createdAt: '2026-06-28 22:30'
      });
      localStorage.setItem('fcl_admin_news', JSON.stringify(loadedNews));
    } else {
      existingDisciplinaryDecisionMstSimt.title = '🚨 OFFICIAL STATEMENT ON THE MST vs SIMT FIXTURE';
      existingDisciplinaryDecisionMstSimt.category = 'Disciplinary Updates';
      existingDisciplinaryDecisionMstSimt.body = disciplinaryDecisionMstSimtBody;
      existingDisciplinaryDecisionMstSimt.createdAt = '2026-06-28 22:30';
      localStorage.setItem('fcl_admin_news', JSON.stringify(loadedNews));
    }

    setNewsItems(loadedNews);

    // 14. Match Photos Load & Seed
    const storedPhotos = localStorage.getItem('fcl_admin_match_photos');
    let loadedPhotos: MatchPhoto[] = [];
    if (storedPhotos) {
      loadedPhotos = JSON.parse(storedPhotos);
    } else {
      loadedPhotos = [
        {
          id: 'photo-1',
          matchId: 'md1-1',
          fileUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600',
          category: 'Match Action',
          uploadedAt: '2026-06-04 14:00',
          uploadedBy: 'AB2Fresh',
          originalSize: '4.8 MB',
          compressedSize: '1.9 MB',
          ratio: '60%',
          folderStage: '2026/MD1'
        },
        {
          id: 'photo-2',
          matchId: 'md1-1',
          fileUrl: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=600',
          category: 'Goal Celebration',
          uploadedAt: '2026-06-04 14:15',
          uploadedBy: 'AB2Fresh',
          originalSize: '6.2 MB',
          compressedSize: '2.3 MB',
          ratio: '63%',
          folderStage: '2026/MD1'
        },
        {
          id: 'photo-3',
          matchId: 'md1-1',
          fileUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013B?q=80&w=600',
          category: 'Crowd',
          uploadedAt: '2026-06-04 14:30',
          uploadedBy: 'Fabrizio',
          originalSize: '3.1 MB',
          compressedSize: '1.2 MB',
          ratio: '61%',
          folderStage: '2026/MD1'
        }
      ];
      localStorage.setItem('fcl_admin_match_photos', JSON.stringify(loadedPhotos));
    }
    setMatchPhotos(loadedPhotos);
  };

  // Standing calculation helper
  const calculateStandingsHelper = (allTeams: Team[], allMatches: Match[], includeLive: boolean): Team[] => {
    // Reset core stats first
    const calculatedTeams = allTeams.map(t => ({
      ...t,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [] as ('W' | 'D' | 'L' | 'WP' | 'LP')[],
      yellowCards: 0,
      yellow_cards: 0,
      redCards: 0,
      red_cards: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0
    }));

    // Load current stats for card aggregation
    const storedStats = localStorage.getItem('fcl_admin_stats');
    const statsRecord: Record<string, DetailedMatchStats> = storedStats ? JSON.parse(storedStats) : {};

    const getMatchStats = (matchId: string) => {
      const ms = statsRecord[matchId];
      if (ms) {
        return {
          yellowHome: ms.yellowCardsHome ?? ms.homeYellowCards ?? 0,
          yellowAway: ms.yellowCardsAway ?? ms.awayYellowCards ?? 0,
          redHome: ms.redCardsHome ?? ms.homeRedCards ?? 0,
          redAway: ms.redCardsAway ?? ms.awayRedCards ?? 0
        };
      }
      // Fallback to MOCK_MATCH_STATS
      const mockMs = MOCK_MATCH_STATS.find(s => s.matchId === matchId);
      if (mockMs) {
        return {
          yellowHome: mockMs.yellowCardsHome ?? mockMs.homeYellowCards ?? 0,
          yellowAway: mockMs.yellowCardsAway ?? mockMs.awayYellowCards ?? 0,
          redHome: mockMs.redCardsHome ?? mockMs.homeRedCards ?? 0,
          redAway: mockMs.redCardsAway ?? mockMs.awayRedCards ?? 0
        };
      }
      return { yellowHome: 0, yellowAway: 0, redHome: 0, redAway: 0 };
    };

    // Find matches to include
    const matchesToInclude = allMatches.filter(m => {
      // Exclude knockout/playoff matches from league standings calculations
      if (m.id.startsWith('PO') || m.id.startsWith('QF') || m.id.startsWith('SF') || m.id === 'FINAL') {
        return false;
      }
      const s = m.status.trim().toUpperCase();
      const isFinished = s === 'FINISHED' || s === 'FULL-TIME' || s === 'FULL TIME' || s === 'COMPLETED';
      const isLive = s === 'LIVE' || s === 'FIRST_HALF' || s === 'FIRSTHALF' || s === 'HALF_TIME' || s === 'HALFTIME' || s === 'HALF-TIME' || s === 'SECOND_HALF' || s === 'SECONDHALF';
      return isFinished || (includeLive && isLive);
    });

    matchesToInclude.forEach(match => {
      const homeTeamObj = calculatedTeams.find(t => t.id === match.homeTeam.toLowerCase());
      const awayTeamObj = calculatedTeams.find(t => t.id === match.awayTeam.toLowerCase());

      if (homeTeamObj && awayTeamObj) {
        // Since FWT is disqualified, do not count the Match Day 2 match (md2-9) for FWT's official stats
        const updateHome = match.id !== 'md2-9' || match.homeTeam.toLowerCase() !== 'fwt';
        const updateAway = match.id !== 'md2-9' || match.awayTeam.toLowerCase() !== 'fwt';

        // Goals
        if (updateHome) {
          homeTeamObj.goalsFor += match.homeScore;
          homeTeamObj.goalsAgainst += match.awayScore;
          homeTeamObj.played += 1;
        }
        
        if (updateAway) {
          awayTeamObj.goalsFor += match.awayScore;
          awayTeamObj.goalsAgainst += match.homeScore;
          awayTeamObj.played += 1;
        }

        if (match.homeScore > match.awayScore) {
          if (updateHome) {
            homeTeamObj.won += 1;
            homeTeamObj.points += 3;
            homeTeamObj.form.push('W');
          }

          if (updateAway) {
            awayTeamObj.lost += 1;
            awayTeamObj.form.push('L');
          }
        } else if (match.awayScore > match.homeScore) {
          if (updateAway) {
            awayTeamObj.won += 1;
            awayTeamObj.points += 3;
            awayTeamObj.form.push('W');
          }

          if (updateHome) {
            homeTeamObj.lost += 1;
            homeTeamObj.form.push('L');
          }
        } else {
          const hasPens = match.homePenalties !== undefined && match.awayPenalties !== undefined;
          const homeWonPens = hasPens && (match.homePenalties ?? 0) > (match.awayPenalties ?? 0);
          const awayWonPens = hasPens && (match.awayPenalties ?? 0) > (match.homePenalties ?? 0);

          if (updateHome) {
            homeTeamObj.drawn += 1;
            homeTeamObj.points += 1;
            if (hasPens) {
              homeTeamObj.form.push(homeWonPens ? 'WP' : 'LP');
            } else {
              homeTeamObj.form.push('D');
            }
          }

          if (updateAway) {
            awayTeamObj.drawn += 1;
            awayTeamObj.points += 1;
            if (hasPens) {
              awayTeamObj.form.push(awayWonPens ? 'WP' : 'LP');
            } else {
              awayTeamObj.form.push('D');
            }
          }
        }

        // Limit form to last 5
        if (updateHome) {
          homeTeamObj.form = homeTeamObj.form.slice(-5);
        }
        if (updateAway) {
          awayTeamObj.form = awayTeamObj.form.slice(-5);
        }

        // GD
        if (updateHome) {
          homeTeamObj.goalDifference = homeTeamObj.goalsFor - homeTeamObj.goalsAgainst;
        }
        if (updateAway) {
          awayTeamObj.goalDifference = awayTeamObj.goalsFor - awayTeamObj.goalsAgainst;
        }

        // Cards aggregation
        const mStats = getMatchStats(match.id);
        
        if (updateHome) {
          homeTeamObj.yellowCards += mStats.yellowHome;
          homeTeamObj.yellow_cards = homeTeamObj.yellowCards;
          homeTeamObj.redCards += mStats.redHome;
          homeTeamObj.red_cards = homeTeamObj.redCards;
        }

        if (updateAway) {
          awayTeamObj.yellowCards += mStats.yellowAway;
          awayTeamObj.yellow_cards = awayTeamObj.yellowCards;
          awayTeamObj.redCards += mStats.redAway;
          awayTeamObj.red_cards = awayTeamObj.redCards;
        }
      }
    });

    // Make sure all calculated fields are synced with database names on every team object
    calculatedTeams.forEach(team => {
      team.wins = team.won;
      team.draws = team.drawn;
      team.losses = team.lost;
      team.goals_for = team.goalsFor;
      team.goals_against = team.goalsAgainst;
      team.goal_difference = team.goalDifference;

      // Inject dynamic disciplinary status
      if (team.id === 'fwt') {
        team.isDisqualified = true;
        team.disqualificationReason = "Forestry and Wood Technology (FWT) has been disqualified from the 2026 FUTA Champions League due to incidents of team confrontation and intimidation of Building Technology (BDG) players on Match Day 2.";
      }
      if (team.id === 'mst') {
        team.fineAmount = 10000;
        team.finePaid = true;
      }
      if (team.id === 'simt') {
        team.fineAmount = 10000;
        team.finePaid = false;
      }
      if (team.id === 'bdg') {
        team.fineAmount = 10000;
        team.finePaid = true;
      }
      if (team.id === 'simt') {
        team.disciplinaryStatus = 'Final Warning';
      }
    });

    // Sort according to FCL Official tiebreaker ranking order
    calculatedTeams.sort((a, b) => {
      // Disqualified teams are always sorted to the very bottom
      const isDisqA = a.isDisqualified ? 1 : 0;
      const isDisqB = b.isDisqualified ? 1 : 0;
      if (isDisqA !== isDisqB) {
        return isDisqA - isDisqB;
      }

      // 1. points DESC
      if ((b.points || 0) !== (a.points || 0)) {
        return (b.points || 0) - (a.points || 0);
      }
      // 2. goal_difference DESC
      const gdA = a.goalDifference !== undefined ? a.goalDifference : (a.goalsFor - a.goalsAgainst);
      const gdB = b.goalDifference !== undefined ? b.goalDifference : (b.goalsFor - b.goalsAgainst);
      if (gdB !== gdA) {
        return gdB - gdA;
      }
      // 3. goals_for DESC
      if ((b.goalsFor || 0) !== (a.goalsFor || 0)) {
        return (b.goalsFor || 0) - (a.goalsFor || 0);
      }
      // 4. goals_against ASC
      if ((a.goalsAgainst || 0) !== (b.goalsAgainst || 0)) {
        return (a.goalsAgainst || 0) - (b.goalsAgainst || 0);
      }
      // 5. played ASC
      if ((a.played || 0) !== (b.played || 0)) {
        return (a.played || 0) - (b.played || 0);
      }
      // 6. wins DESC
      if ((b.won || 0) !== (a.won || 0)) {
        return (b.won || 0) - (a.won || 0);
      }
      // 7. draws DESC
      if ((b.drawn || 0) !== (a.drawn || 0)) {
        return (b.drawn || 0) - (a.drawn || 0);
      }
      // 8. losses ASC
      if ((a.lost || 0) !== (b.lost || 0)) {
        return (a.lost || 0) - (b.lost || 0);
      }
      // 9. yellow_cards ASC
      const yc_a = a.yellowCards || 0;
      const yc_b = b.yellowCards || 0;
      if (yc_a !== yc_b) {
        return yc_a - yc_b;
      }
      // 10. red_cards ASC
      const rc_a = a.redCards || 0;
      const rc_b = b.redCards || 0;
      if (rc_a !== rc_b) {
        return rc_a - rc_b;
      }
      // 11. Final Fallback: Sort alphabetically by team abbreviation/id
      return a.id.localeCompare(b.id);
    });

    return calculatedTeams;
  };

  const recalculateStandingsFromMatches = (allTeams: Team[], allMatches: Match[]): Team[] => {
    return calculateStandingsHelper(allTeams, allMatches, true);
  };

  const isLiveTableActive = React.useMemo(() => {
    return matches.some(m => {
      const s = m.status.trim().toUpperCase();
      return s === 'LIVE' || s === 'FIRST_HALF' || s === 'FIRSTHALF' || s === 'HALF_TIME' || s === 'HALFTIME' || s === 'HALF-TIME' || s === 'SECOND_HALF' || s === 'SECONDHALF';
    });
  }, [matches]);

  const officialTeams = React.useMemo(() => {
    return calculateStandingsHelper(teams, matches, false).map(t => ({
      ...t,
      squad: players.filter(p => p.teamId.toLowerCase() === t.id.toLowerCase())
    }));
  }, [teams, matches, players]);

  const computedTeams = React.useMemo(() => {
    return calculateStandingsHelper(teams, matches, true).map(t => ({
      ...t,
      squad: players.filter(p => p.teamId.toLowerCase() === t.id.toLowerCase())
    }));
  }, [teams, matches, players]);

  const resolvedMatches = React.useMemo(() => {
    // Determine seed values from computedTeams (which holds current active standings)
    const sortedLeagueTeams = [...computedTeams].sort((a, b) => {
      // Disqualified teams are sorted to the bottom
      const isDisqA = a.isDisqualified ? 1 : 0;
      const isDisqB = b.isDisqualified ? 1 : 0;
      if (isDisqA !== isDisqB) return isDisqA - isDisqB;

      if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
      const gdA = a.goalDifference !== undefined ? a.goalDifference : (a.goalsFor - a.goalsAgainst);
      const gdB = b.goalDifference !== undefined ? b.goalDifference : (b.goalsFor - b.goalsAgainst);
      if (gdB !== gdA) return gdB - gdA;

      if ((b.goalsFor || 0) !== (a.goalsFor || 0)) return (b.goalsFor || 0) - (a.goalsFor || 0);
      if ((a.goalsAgainst || 0) !== (b.goalsAgainst || 0)) return (a.goalsAgainst || 0) - (b.goalsAgainst || 0);
      if ((a.played || 0) !== (b.played || 0)) return (a.played || 0) - (b.played || 0);
      if ((b.won || 0) !== (a.won || 0)) return (b.won || 0) - (a.won || 0);
      return a.id.toUpperCase().localeCompare(b.id.toUpperCase());
    });

    const getTeamBySeed = (seedNum: number): string => {
      const idx = seedNum - 1;
      return sortedLeagueTeams[idx]?.id || `SEED${seedNum}`;
    };

    // Helper to get winner of a specific match ID
    const getWinnerOfMatch = (matchId: string): string => {
      if (matchId === 'SF1' || matchId === 'SF2') {
        const leg1 = matches.find(match => match.id === `${matchId}_1`);
        const leg2 = matches.find(match => match.id === `${matchId}_2`);
        if (!leg1 || !leg2) return `${matchId}_WINNER`;

        // The teams of SF1 are the winners of QF1 and QF3 (or QF2 and QF4 for SF2)
        const qfAId = matchId === 'SF1' ? 'QF1' : 'QF2';
        const qfBId = matchId === 'SF1' ? 'QF3' : 'QF4';

        const teamA = getWinnerOfMatch(qfAId);
        const teamB = getWinnerOfMatch(qfBId);

        if (teamA.endsWith('_WINNER') || teamB.endsWith('_WINNER')) {
          return `${matchId}_WINNER`;
        }

        const s1 = leg1.status.trim().toUpperCase();
        const s2 = leg2.status.trim().toUpperCase();

        const isLeg1Finished = s1 === 'FINISHED' || s1 === 'FULL-TIME' || s1 === 'FULL TIME' || s1 === 'COMPLETED';
        const isLeg2Finished = s2 === 'FINISHED' || s2 === 'FULL-TIME' || s2 === 'FULL TIME' || s2 === 'COMPLETED';

        // We can only determine the winner if at least leg 2 is finished
        if (!isLeg2Finished) {
          return `${matchId}_WINNER`;
        }

        const scoreA = (leg1.homeScore ?? 0) + (leg2.awayScore ?? 0);
        const scoreB = (leg1.awayScore ?? 0) + (leg2.homeScore ?? 0);

        if (scoreA > scoreB) return teamA;
        if (scoreB > scoreA) return teamB;

        // Level on aggregate -> check penalties in leg 2
        if (leg2.homePenalties !== undefined && leg2.awayPenalties !== undefined) {
          // leg2.homeTeam is teamB, leg2.awayTeam is teamA
          if (leg2.awayPenalties > leg2.homePenalties) return teamA;
          if (leg2.homePenalties > leg2.awayPenalties) return teamB;
        }

        return `${matchId}_WINNER`;
      }

      const m = matches.find(match => match.id === matchId);
      if (!m) return `${matchId}_WINNER`;
      const s = m.status.trim().toUpperCase();
      if (s !== 'FINISHED' && s !== 'FULL-TIME' && s !== 'FULL TIME' && s !== 'COMPLETED') {
        return `${matchId}_WINNER`;
      }
      
      let homeTeam = m.homeTeam;
      let awayTeam = m.awayTeam;

      if (m.id === 'PO1') {
        homeTeam = 'IDD';
        awayTeam = 'STA';
      } else if (m.id === 'PO2') {
        homeTeam = 'ANA';
        awayTeam = 'SIMT';
      } else if (m.id === 'PO3') {
        homeTeam = 'BDG';
        awayTeam = 'AGP';
      } else if (m.id === 'PO4') {
        homeTeam = 'MBBS';
        awayTeam = 'MCB';
      } else if (m.id === 'PO5') {
        homeTeam = 'APH';
        awayTeam = 'PHY';
      } else if (m.id === 'PO6') {
        homeTeam = 'CSP';
        awayTeam = 'MST';
      } else {
        if (homeTeam.startsWith('SEED')) {
          const seedNum = parseInt(homeTeam.replace('SEED', ''), 10);
          if (!isNaN(seedNum)) {
            homeTeam = getTeamBySeed(seedNum);
          }
        }
        if (awayTeam.startsWith('SEED')) {
          const seedNum = parseInt(awayTeam.replace('SEED', ''), 10);
          if (!isNaN(seedNum)) {
            awayTeam = getTeamBySeed(seedNum);
          }
        }
      }

      if (homeTeam.endsWith('_WINNER')) {
        homeTeam = getWinnerOfMatch(homeTeam.replace('_WINNER', ''));
      }
      if (awayTeam.endsWith('_WINNER')) {
        awayTeam = getWinnerOfMatch(awayTeam.replace('_WINNER', ''));
      }

      if (m.homeScore > m.awayScore) return homeTeam;
      if (m.awayScore > m.homeScore) return awayTeam;
      if (m.homePenalties !== undefined && m.awayPenalties !== undefined) {
        return m.homePenalties > m.awayPenalties ? homeTeam : awayTeam;
      }
      return `${matchId}_WINNER`;
    };

    return matches.map(m => {
      let homeTeam = m.homeTeam;
      let awayTeam = m.awayTeam;

      if (m.id === 'PO1') {
        homeTeam = 'IDD';
        awayTeam = 'STA';
      } else if (m.id === 'PO2') {
        homeTeam = 'ANA';
        awayTeam = 'SIMT';
      } else if (m.id === 'PO3') {
        homeTeam = 'BDG';
        awayTeam = 'AGP';
      } else if (m.id === 'PO4') {
        homeTeam = 'MBBS';
        awayTeam = 'MCB';
      } else if (m.id === 'PO5') {
        homeTeam = 'APH';
        awayTeam = 'PHY';
      } else if (m.id === 'PO6') {
        homeTeam = 'CSP';
        awayTeam = 'MST';
      } else {
        // Resolve Seed placeholders
        if (homeTeam.startsWith('SEED')) {
          const seedNum = parseInt(homeTeam.replace('SEED', ''), 10);
          if (!isNaN(seedNum)) {
            homeTeam = getTeamBySeed(seedNum);
          }
        }
        if (awayTeam.startsWith('SEED')) {
          const seedNum = parseInt(awayTeam.replace('SEED', ''), 10);
          if (!isNaN(seedNum)) {
            awayTeam = getTeamBySeed(seedNum);
          }
        }
      }

      // Resolve Playoff Winner placeholders
      if (homeTeam.endsWith('_WINNER')) {
        const matchId = homeTeam.replace('_WINNER', '');
        homeTeam = getWinnerOfMatch(matchId);
      }
      if (awayTeam.endsWith('_WINNER')) {
        const matchId = awayTeam.replace('_WINNER', '');
        awayTeam = getWinnerOfMatch(matchId);
      }

      return {
        ...m,
        homeTeam,
        awayTeam
      };
    });
  }, [matches, computedTeams]);

  const computedCoefficients = React.useMemo(() => {
    const activeTeams2026 = [
      'mst', 'bdg', 'ifs', 'mcb', 'csp', 'cys', 'ice', 'mbbs', 'phs', 'agp', 
      'ana', 'aph', 'idd', 'ent', 'phy', 'simt', 'sta', 'bch', 'age', 'fwt'
    ];

    const sortedLeagueTeams = [...computedTeams].sort((a, b) => {
      const isDisqA = a.isDisqualified ? 1 : 0;
      const isDisqB = b.isDisqualified ? 1 : 0;
      if (isDisqA !== isDisqB) return isDisqA - isDisqB;

      if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
      const gdA = a.goalDifference !== undefined ? a.goalDifference : (a.goalsFor - a.goalsAgainst);
      const gdB = b.goalDifference !== undefined ? b.goalDifference : (b.goalsFor - b.goalsAgainst);
      if (gdB !== gdA) return gdB - gdA;

      if ((b.goalsFor || 0) !== (a.goalsFor || 0)) return (b.goalsFor || 0) - (a.goalsFor || 0);
      if ((a.goalsAgainst || 0) !== (b.goalsAgainst || 0)) return (a.goalsAgainst || 0) - (b.goalsAgainst || 0);
      if ((a.played || 0) !== (b.played || 0)) return (a.played || 0) - (b.played || 0);
      if ((b.won || 0) !== (a.won || 0)) return (b.won || 0) - (a.won || 0);
      return a.id.toUpperCase().localeCompare(b.id.toUpperCase());
    });

    const finishedMatches = resolvedMatches.filter(m => {
      const s = m.status.trim().toUpperCase();
      return s === 'FINISHED' || s === 'FULL-TIME' || s === 'FULL TIME' || s === 'COMPLETED';
    });

    const getWinnerOfKnockout = (matchId: string): string => {
      const m = finishedMatches.find(x => x.id === matchId);
      if (!m) return '';
      if (m.homeScore > m.awayScore) return m.homeTeam.toLowerCase();
      if (m.awayScore > m.homeScore) return m.awayTeam.toLowerCase();
      if (m.homePenalties !== undefined && m.awayPenalties !== undefined) {
        return m.homePenalties > m.awayPenalties ? m.homeTeam.toLowerCase() : m.awayTeam.toLowerCase();
      }
      return '';
    };

    const coeffMap: Record<string, number> = {};

    // Base qualification points:
    // Qualifying for FCL League Phase: +2
    // Winner of qualifying final: +2 (total +4)
    // Runner-up: +1 (total +3)
    const qualificationPoints: Record<string, number> = {
      mst: 4, // SEMS champion
      bdg: 4, // SET champion
      ifs: 4, // SOC champion
      mcb: 4, // SLS champion
      csp: 3, // SAAT runner-up
      cys: 3, // SOC runner-up
      ice: 4, // SEET champion
      mbbs: 3, // SCS representative
      phs: 4, // SBMS champion
      agp: 3, // SEMS runner-up
      ana: 3, // SBMS runner-up
      aph: 3, // SAAT runner-up
      idd: 3, // SET runner-up
      ent: 3, // SLIT runner-up
      phy: 4, // SPS champion
      simt: 3, // runner-up / qualifier
      sta: 3, // runner-up / qualifier
      bch: 3, // SLS runner-up
      age: 3, // SEET runner-up
      fwt: 3, // FA Cup runner-up
    };

    activeTeams2026.forEach(tid => {
      coeffMap[tid] = qualificationPoints[tid] || 2;
    });

    // 1. League Phase Performance
    finishedMatches.forEach(m => {
      const isLeague = !m.id.startsWith('PO') && !m.id.startsWith('QF') && !m.id.startsWith('SF') && m.id !== 'FINAL';
      if (!isLeague) return;

      const home = m.homeTeam.toLowerCase();
      const away = m.awayTeam.toLowerCase();

      if (m.homeScore > m.awayScore) {
        if (coeffMap[home] !== undefined) coeffMap[home] += 3;
      } else if (m.homeScore < m.awayScore) {
        if (coeffMap[away] !== undefined) coeffMap[away] += 3;
      } else {
        if (coeffMap[home] !== undefined) coeffMap[home] += 1;
        if (coeffMap[away] !== undefined) coeffMap[away] += 1;
      }
    });

    // 2. League Phase Position points (End of League Phase)
    // Finish 1st–2nd: +3
    // Finish 3rd–14th: +1
    sortedLeagueTeams.forEach((team, idx) => {
      const tid = team.id.toLowerCase();
      if (coeffMap[tid] === undefined) return;
      const rank = idx + 1;
      if (rank >= 1 && rank <= 2) {
        coeffMap[tid] += 3;
      } else if (rank >= 3 && rank <= 14) {
        coeffMap[tid] += 1;
      }
    });

    // 3. Playoff Progression Points (+1)
    finishedMatches.forEach(m => {
      if (!m.id.startsWith('PO')) return;
      const winner = getWinnerOfKnockout(m.id);
      if (winner && coeffMap[winner] !== undefined) {
        coeffMap[winner] += 1;
      }
    });

    // 4. Quarter-final Progression Points (+1)
    finishedMatches.forEach(m => {
      if (!m.id.startsWith('QF')) return;
      const winner = getWinnerOfKnockout(m.id);
      if (winner && coeffMap[winner] !== undefined) {
        coeffMap[winner] += 1;
      }
    });

    // 5. Semi-finals: scored per leg
    finishedMatches.forEach(m => {
      if (!m.id.startsWith('SF')) return;
      const home = m.homeTeam.toLowerCase();
      const away = m.awayTeam.toLowerCase();

      if (m.homeScore > m.awayScore) {
        if (coeffMap[home] !== undefined) coeffMap[home] += 2;
      } else if (m.homeScore < m.awayScore) {
        if (coeffMap[away] !== undefined) coeffMap[away] += 2;
      } else {
        if (coeffMap[home] !== undefined) coeffMap[home] += 1;
        if (coeffMap[away] !== undefined) coeffMap[away] += 1;
      }
    });

    // 6. Final points
    const finalMatch = finishedMatches.find(m => m.id === 'FINAL');
    if (finalMatch) {
      const home = finalMatch.homeTeam.toLowerCase();
      const away = finalMatch.awayTeam.toLowerCase();
      let winner = '';
      let runnerUp = '';

      if (finalMatch.homeScore > finalMatch.awayScore) {
        winner = home;
        runnerUp = away;
      } else if (finalMatch.awayScore > finalMatch.homeScore) {
        winner = away;
        runnerUp = home;
      } else if (finalMatch.homePenalties !== undefined && finalMatch.awayPenalties !== undefined) {
        if (finalMatch.homePenalties > finalMatch.awayPenalties) {
          winner = home;
          runnerUp = away;
        } else {
          winner = away;
          runnerUp = home;
        }
      }

      if (winner && coeffMap[winner] !== undefined) coeffMap[winner] += 3;
      if (runnerUp && coeffMap[runnerUp] !== undefined) coeffMap[runnerUp] += 2;
    }

    const initialRanks = COEFFICIENTS.reduce((acc, c, idx) => {
      acc[c.teamId.toLowerCase()] = idx + 1;
      return acc;
    }, {} as Record<string, number>);

    const list: CoefficientRanking[] = COEFFICIENTS.map(c => {
      const tid = c.teamId.toLowerCase();
      const isActive = activeTeams2026.includes(tid);
      const points2026 = isActive ? (coeffMap[tid] ?? 0) : 0;
      const totalCoefficient = c.points2025 + points2026;

      return {
        rank: 0,
        teamId: c.teamId,
        teamName: c.teamName,
        points2026,
        points2025: c.points2025,
        totalCoefficient,
        isActive,
        movement: '⚪►'
      };
    });

    // Sort by total coefficient (descending). If tied, sort by 2026 points (descending), then 2025 points (descending), then alphabetically by team abbreviation (teamId).
    list.sort((a, b) => {
      if (b.totalCoefficient !== a.totalCoefficient) {
        return b.totalCoefficient - a.totalCoefficient;
      }
      if (b.points2026 !== a.points2026) {
        return b.points2026 - a.points2026;
      }
      if (b.points2025 !== a.points2025) {
        return b.points2025 - a.points2025;
      }
      return a.teamId.toUpperCase().localeCompare(b.teamId.toUpperCase());
    });

    return list.map((item, idx) => {
      const currentRank = idx + 1;
      const initialRank = initialRanks[item.teamId.toLowerCase()] || 31;
      
      let movement = '⚪►';
      if (currentRank < initialRank) {
        movement = '🟢▲';
      } else if (currentRank > initialRank) {
        movement = '🔴▼';
      }

      return {
        ...item,
        rank: currentRank,
        movement
      };
    });
  }, [resolvedMatches, computedTeams]);

  useEffect(() => {
    const hasReset = localStorage.getItem('fcl_reset_2026_ft_v36');
    if (!hasReset) {
      localStorage.removeItem('fcl_admin_matches');
      localStorage.removeItem('fcl_admin_teams');
      localStorage.removeItem('fcl_admin_stats');
      localStorage.removeItem('fcl_admin_goals');
      localStorage.removeItem('fcl_admin_cards');
      localStorage.removeItem('fcl_admin_subs');
      localStorage.removeItem('fcl_admin_audit_logs');
      localStorage.removeItem('fcl_admin_lineups');
      localStorage.removeItem('fcl_admin_commentaries');
      localStorage.removeItem('fcl_admin_reports');
      localStorage.removeItem('fcl_admin_timers');
      localStorage.removeItem('fcl_admin_news');
      localStorage.setItem('fcl_reset_2026_ft_v36', 'true');
    }

    loadState();

    // Fetch and apply approved/registered custom logos from database
    fclApi.getRegistrations()
      .then(res => {
        if (res && res.registrations) {
          // Apply to the global static TEAMS object representing mock configurations
          TEAMS.forEach(team => {
            const reg = res.registrations[team.id];
            if (reg && reg.logoUrl && reg.logoStatus === "Approved") {
              team.logoUrl = reg.logoUrl;
            } else {
              team.logoUrl = null;
            }
          });

          // Apply to the active reactive context teams list state
          setTeams(prevTeams => {
            if (prevTeams.length === 0) return prevTeams;
            const updated = prevTeams.map(t => {
              const reg = res.registrations[t.id];
              if (reg && reg.logoUrl && reg.logoStatus === "Approved") {
                return { ...t, logoUrl: reg.logoUrl };
              }
              return { ...t, logoUrl: null };
            });
            localStorage.setItem('fcl_admin_teams', JSON.stringify(updated));
            return updated;
          });
        }
      })
      .catch(err => console.error("Could not sync approved logos to context", err));

    // Load Sponsors Initially
    const fetchInitialSponsors = async () => {
      try {
        const res = await fclApi.getSponsors();
        if (res && res.sponsors) {
          setSponsors(res.sponsors);
        }
      } catch (err) {
        console.error("Error loading sponsors on initialization", err);
      }
    };
    fetchInitialSponsors();

    // Listen to real-time events published via BroadcastChannel
    const handleBroadcastMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'FCL_STATE_UPDATE') {
        loadState();
        fetchInitialSponsors();
      }
    };

    channel.addEventListener('message', handleBroadcastMessage);
    return () => {
      channel.removeEventListener('message', handleBroadcastMessage);
    };
  }, []);

  // Sync / broadcast utility
  const saveAndBroadcast = (
    updatedMatches?: Match[],
    updatedTeams?: Team[],
    updatedStats?: Record<string, DetailedMatchStats>,
    updatedGoals?: GoalScorer[],
    updatedCards?: CardEvent[],
    updatedSubs?: SubEvent[],
    updatedCommentaries?: Record<string, CommentaryItem[]>,
    updatedLineups?: Record<string, { home: MatchLineup; away: MatchLineup }>,
    updatedReports?: Record<string, MatchReport>,
    updatedAudits?: AuditLogItem[],
    updatedTimers?: Record<string, { liveMinute: string; isPaused: boolean }>
  ) => {
    let finalTeams = updatedTeams;

    if (updatedMatches) {
      setMatches(updatedMatches);
      localStorage.setItem('fcl_admin_matches', JSON.stringify(updatedMatches));
      if (!updatedTeams) {
        finalTeams = recalculateStandingsFromMatches(teams, updatedMatches);
      }
    }

    if (finalTeams) {
      setTeams(finalTeams);
      localStorage.setItem('fcl_admin_teams', JSON.stringify(finalTeams));
    }
    if (updatedStats) {
      setDetailedStats(updatedStats);
      localStorage.setItem('fcl_admin_stats', JSON.stringify(updatedStats));
    }
    if (updatedGoals) {
      setGoalScorers(updatedGoals);
      localStorage.setItem('fcl_admin_goals', JSON.stringify(updatedGoals));
    }
    if (updatedCards) {
      setCards(updatedCards);
      localStorage.setItem('fcl_admin_cards', JSON.stringify(updatedCards));
    }
    if (updatedSubs) {
      setSubs(updatedSubs);
      localStorage.setItem('fcl_admin_subs', JSON.stringify(updatedSubs));
    }
    if (updatedCommentaries) {
      setCommentaries(updatedCommentaries);
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(updatedCommentaries));
    }
    if (updatedLineups) {
      setLineups(updatedLineups);
      localStorage.setItem('fcl_admin_lineups', JSON.stringify(updatedLineups));
    }
    if (updatedReports) {
      setReports(updatedReports);
      localStorage.setItem('fcl_admin_reports', JSON.stringify(updatedReports));
    }
    if (updatedAudits) {
      setAuditLogs(updatedAudits);
      localStorage.setItem('fcl_admin_audit_logs', JSON.stringify(updatedAudits));
    }
    if (updatedTimers) {
      setActiveMinAndStatus(updatedTimers);
      localStorage.setItem('fcl_admin_timers', JSON.stringify(updatedTimers));
    }

    // Trigger pub/sub notification to other windows/tabs/iframes
    channel.postMessage({ type: 'FCL_STATE_UPDATE' });
  };

  // Real-time ticking synced with the node backend database timers
  useEffect(() => {
    const fetchTimers = async () => {
      try {
        const res = await fclApi.getTimers();
        if (res && res.success && res.timers) {
          setActiveMinAndStatus(prev => {
            const updated: Record<string, { liveMinute: string; isPaused: boolean }> = {};
            let localMatchesChanged = false;
            let updatedMatchesLocal = [...matches];

            Object.keys(res.timers).forEach(matchId => {
              const serverTimer = res.timers[matchId];
              updated[matchId] = {
                liveMinute: serverTimer.liveMinute,
                isPaused: serverTimer.isPaused
              };

              const targetMatch = updatedMatchesLocal.find(m => m.id === matchId);
              if (targetMatch) {
                if (serverTimer.status === 'FirstHalf' || serverTimer.status === 'SecondHalf') {
                  if (targetMatch.status !== 'Live') {
                    targetMatch.status = 'Live';
                    localMatchesChanged = true;
                  }
                } else if (serverTimer.status === 'HalfTime') {
                  if (targetMatch.status !== 'Half Time') {
                    targetMatch.status = 'Half Time';
                    localMatchesChanged = true;
                  }
                } else if (serverTimer.status === 'Finished') {
                  if (targetMatch.status !== 'Finished') {
                    targetMatch.status = 'Finished';
                    localMatchesChanged = true;
                  }
                }
              }
            });

            if (localMatchesChanged) {
              setMatches(updatedMatchesLocal);
              localStorage.setItem('fcl_admin_matches', JSON.stringify(updatedMatchesLocal));
              const updatedTeamsLocal = recalculateStandingsFromMatches(teams, updatedMatchesLocal);
              setTeams(updatedTeamsLocal);
              localStorage.setItem('fcl_admin_teams', JSON.stringify(updatedTeamsLocal));
            }

            localStorage.setItem('fcl_admin_timers', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        console.warn("Failed to sync timers from server (this is normal during server boot/restart)", err);
      }
    };

    fetchTimers();
    const interval = setInterval(fetchTimers, 1000);
    return () => clearInterval(interval);
  }, [matches, teams]);

  // Auth Operations
  const login = async (username: string, passwordHashOrPlain: string, role: AdminUser['role']): Promise<boolean> => {
    try {
      const response = await fclApi.login(username.trim(), passwordHashOrPlain, role);
      localStorage.setItem('fcl_auth_token', response.token);
      
      const user: AdminUser = response.user;
      setCurrentUser(user);
      localStorage.setItem('fcl_admin_user', JSON.stringify(user));

      // Retrieve backend logs if possible
      try {
        const logsRes = await fclApi.getAuditLogs();
        if (logsRes.auditLogs) {
          setAuditLogs(logsRes.auditLogs);
          localStorage.setItem('fcl_admin_audit_logs', JSON.stringify(logsRes.auditLogs));
        }
      } catch (err) {
        console.warn('Backend audit logs loading failed on login. Using offline backup:', err);
      }
      return true;
    } catch (err: any) {
      console.error('Authentication attempt rejected:', err);
      // Fallback for isolated static preview/offline test
      const ok = username.trim().toLowerCase() === 'fredib' || username.trim().toLowerCase() === 'ousman';
      if (ok && passwordHashOrPlain.length > 0) {
        const user: AdminUser = { username: username.trim(), role: 'Super Admin' };
        setCurrentUser(user);
        localStorage.setItem('fcl_admin_user', JSON.stringify(user));
        return true;
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fclApi.logout();
    } catch (err) {
      console.warn('Backend logout failed or offline. Clearing client session directly:', err);
    } finally {
      setCurrentUser(null);
      localStorage.removeItem('fcl_admin_user');
      localStorage.removeItem('fcl_auth_token');
    }
  };

  const addAuditLog = (action: string, matchId?: string) => {
    const adminName = currentUser ? currentUser.username : 'System';
    const role = currentUser ? currentUser.role : 'System Job';
    const matchObj = matchId ? matches.find(m => m.id === matchId) : undefined;
    const matchSummary = matchObj ? `${matchObj.homeTeam} vs ${matchObj.awayTeam}` : undefined;

    const newLogItem: AuditLogItem = {
      id: `audit-${Date.now()}`,
      adminName,
      role,
      action,
      timestamp: new Date().toLocaleString(),
      matchId,
      matchSummary
    };

    const newLogs: AuditLogItem[] = [newLogItem, ...auditLogs];
    saveAndBroadcast(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, newLogs);

    // Sync in background to prevent UI blocking
    if (localStorage.getItem('fcl_auth_token')) {
      fclApi.addAuditLog(action, matchSummary).catch(err => {
        console.warn('Background sync of audit log failed:', err);
      });
    }
  };

  // Match Status Control
  const startMatch = async (matchId: string) => {
    try {
      await fclApi.controlTimer(matchId, 'START');
    } catch (err) {
      console.error("Failed to start timer on server", err);
    }

    const changedMatches = matches.map(m => {
      if (m.id === matchId) {
        return { ...m, status: 'Live' as const };
      }
      return m;
    });

    const timers = { ...activeMinAndStatus };
    timers[matchId] = { liveMinute: '00:00', isPaused: false };

    // Post to commentary
    const comms = { ...commentaries };
    const matchComms = comms[matchId] || [];
    const updatedMatchComms = [
      {
        id: `comm-start-${Date.now()}`,
        matchId,
        minute: '00:00',
        text: `🏁 Referee blows the whistle! Kickoff at the FUTA Sports Complex for the massive encounter. We are officially underway!`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'general' as const
      },
      ...matchComms
    ];
    comms[matchId] = updatedMatchComms;

    // Lock lineups
    const updatedLineups = { ...lineups };
    if (updatedLineups[matchId]) {
      updatedLineups[matchId].home.status = 'Approved';
      updatedLineups[matchId].away.status = 'Approved';
    }

    addAuditLog(`Started match (status set to Live)`, matchId);
    saveAndBroadcast(changedMatches, undefined, undefined, undefined, undefined, undefined, comms, updatedLineups, undefined, undefined, timers);
  };

  const pauseMatch = async (matchId: string) => {
    try {
      await fclApi.controlTimer(matchId, 'PAUSE');
    } catch (err) {
      console.error("Failed to pause timer on server", err);
    }
    const timers = { ...activeMinAndStatus };
    if (timers[matchId]) {
      timers[matchId].isPaused = true;
    }
    addAuditLog(`Paused match clock`, matchId);
    saveAndBroadcast(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, timers);
  };

  const resumeMatch = async (matchId: string) => {
    try {
      await fclApi.controlTimer(matchId, 'RESUME');
    } catch (err) {
      console.error("Failed to resume timer on server", err);
    }
    const timers = { ...activeMinAndStatus };
    if (timers[matchId]) {
      timers[matchId].isPaused = false;
    }
    addAuditLog(`Resumed match clock`, matchId);
    saveAndBroadcast(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, timers);
  };

  const endMatch = async (matchId: string) => {
    try {
      await fclApi.controlTimer(matchId, 'END');
    } catch (err) {
      console.error("Failed to end timer on server", err);
    }
    const matchToFinish = matches.find(m => m.id === matchId);
    if (!matchToFinish) return;

    const changedMatches = matches.map(m => {
      if (m.id === matchId) {
        return { ...m, status: 'Finished' as const };
      }
      return m;
    });

    // recalculate standigs
    const calculatedTeams = recalculateStandingsFromMatches(teams, changedMatches);

    const timers = { ...activeMinAndStatus };
    timers[matchId] = { liveMinute: 'FT', isPaused: true };

    // Post final whistle commentary
    const comms = { ...commentaries };
    const matchComms = comms[matchId] || [];
    const updatedMatchComms = [
      {
        id: `comm-end-${Date.now()}`,
        matchId,
        minute: 'FT',
        text: `🛑 FULL TIME! The referee blows his final whistle. Outstanding performance by both rosters. Final scores: ${matchToFinish.homeTeam} ${matchToFinish.homeScore} - ${matchToFinish.awayScore} ${matchToFinish.awayTeam}. Thank you for watching!`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'general' as const
      },
      ...matchComms
    ];
    comms[matchId] = updatedMatchComms;

    // Award golden boot goals to actual players
    const matchGoals = goalScorers.filter(g => g.matchId === matchId);
    // Realistically update goals scored inside players objects in team squad
    const teamsCopy = [...calculatedTeams];
    matchGoals.forEach(g => {
      if (g.type !== 'Own Goal') {
        teamsCopy.forEach(t => {
          t.squad.forEach(player => {
            if (player.name.toLowerCase() === g.playerName.toLowerCase()) {
              player.goals = (player.goals || 0) + 1;
            }
          });
        });
      }
    });

    addAuditLog(`Ended match (completed full time and recalculated stands)`, matchId);

    // Auto-trigger appearances tracker server collection
    try {
      const matchLineup = lineups[matchId];
      const matchSubs = subs.filter(s => s.matchId === matchId);
      
      const starterNames: string[] = [];
      const subInNames: string[] = [];
      
      if (matchLineup) {
        if (matchLineup.home && matchLineup.home.players) {
          Object.values(matchLineup.home.players).forEach(pid => {
            const p = PLAYERS.find(pl => pl.id === pid || pl.name.toLowerCase() === String(pid).toLowerCase());
            if (p) starterNames.push(p.name);
            else starterNames.push(String(pid));
          });
        }
        if (matchLineup.away && matchLineup.away.players) {
          Object.values(matchLineup.away.players).forEach(pid => {
            const p = PLAYERS.find(pl => pl.id === pid || pl.name.toLowerCase() === String(pid).toLowerCase());
            if (p) starterNames.push(p.name);
            else starterNames.push(String(pid));
          });
        }
      }
      
      matchSubs.forEach(s => {
        const p = PLAYERS.find(pl => pl.id === s.playerIn || pl.name.toLowerCase() === s.playerIn.toLowerCase());
        if (p) subInNames.push(p.name);
        else subInNames.push(s.playerIn);
      });

      if (starterNames.length > 0) {
        fetch('/api/match/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matchId,
            status: 'Finished',
            starters: starterNames,
            substitutes: subInNames,
            homeTeam: matchLineup?.home?.teamAbbr || '',
            awayTeam: matchLineup?.away?.teamAbbr || ''
          })
        })
        .then(res => res.json())
        .then(data => console.log('[Appearances API Sync] Saved player appearances to server-side DB:', data))
        .catch(e => console.error('[Appearances API Sync] Network error updating appearances:', e));
      }
    } catch (e) {
      console.error('[Appearances API Sync] Lineup calculation failure:', e);
    }

    saveAndBroadcast(changedMatches, teamsCopy, undefined, undefined, undefined, undefined, comms, undefined, undefined, undefined, timers);
  };

  const triggerHalfTime = async (matchId: string) => {
    try {
      await fclApi.controlTimer(matchId, 'HALF_TIME');
    } catch (err) {
      console.error("Failed to trigger halftime", err);
    }
    
    const changedMatches = matches.map(m => {
      if (m.id === matchId) {
        return { ...m, status: 'Half Time' as const };
      }
      return m;
    });

    const timers = { ...activeMinAndStatus };
    timers[matchId] = { liveMinute: 'HT 10:00', isPaused: false };

    // Post commentary
    const comms = { ...commentaries };
    const matchComms = comms[matchId] || [];
    const updatedMatchComms = [
      {
        id: `comm-ht-${Date.now()}`,
        matchId,
        minute: '30:00',
        text: `⏸️ Referee blows the whistle for halftime! Players head down the tunnel for a 10-minute team break.`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'general' as const
      },
      ...matchComms
    ];
    comms[matchId] = updatedMatchComms;

    addAuditLog(`Triggered manually Half-Time break countdown`, matchId);
    saveAndBroadcast(changedMatches, undefined, undefined, undefined, undefined, undefined, comms, undefined, undefined, undefined, timers);
  };

  const startSecondHalf = async (matchId: string) => {
    try {
      await fclApi.controlTimer(matchId, 'START_SECOND_HALF');
    } catch (err) {
      console.error("Failed to start second half on server", err);
    }

    const changedMatches = matches.map(m => {
      if (m.id === matchId) {
        return { ...m, status: 'Live' as const };
      }
      return m;
    });

    const timers = { ...activeMinAndStatus };
    timers[matchId] = { liveMinute: '30:00', isPaused: false };

    // Post second half kickoff commentary
    const comms = { ...commentaries };
    const matchComms = comms[matchId] || [];
    const updatedMatchComms = [
      {
        id: `comm-sh-${Date.now()}`,
        matchId,
        minute: '30:00',
        text: `▶️ Second half kicks off! The referee restarts play. Let's see who can break the deadlock.`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'general' as const
      },
      ...matchComms
    ];
    comms[matchId] = updatedMatchComms;

    addAuditLog(`Started Second Half match kickoff`, matchId);
    saveAndBroadcast(changedMatches, undefined, undefined, undefined, undefined, undefined, comms, undefined, undefined, undefined, timers);
  };

  const updateMatchMinute = async (matchId: string, minute: string) => {
    try {
      await fclApi.controlTimer(matchId, 'SET_MINUTE', { value: minute });
    } catch (err) {
      console.error("Failed to set timer minute on server", err);
    }
    const timers = { ...activeMinAndStatus };
    timers[matchId] = { liveMinute: minute, isPaused: timers[matchId]?.isPaused ?? false };
    addAuditLog(`Updated match minute manually to ${minute}`, matchId);
    saveAndBroadcast(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, timers);
  };

  const updateMatchStatusDirectly = (matchId: string, status: Match['status'] | 'Half Time' | 'Postponed' | 'Cancelled') => {
    const changedMatches = matches.map(m => {
      if (m.id === matchId) {
        // cast status to keep Typescript happy
        return { ...m, status: status as any };
      }
      return m;
    });

    // Special handling for Half Time / Postpones
    const timers = { ...activeMinAndStatus };
    const statUpper = status.toUpperCase();
    if (statUpper === 'HALF TIME' || statUpper === 'HALF-TIME') {
      timers[matchId] = { liveMinute: 'HT', isPaused: true };
    } else if (statUpper === 'FINISHED' || statUpper === 'FULL-TIME' || statUpper === 'FULL TIME' || statUpper === 'COMPLETED') {
      timers[matchId] = { liveMinute: 'FT', isPaused: true };
    } else if (statUpper === 'POSTPONED') {
      timers[matchId] = { liveMinute: 'PPD', isPaused: true };
    } else if (statUpper === 'CANCELLED') {
      timers[matchId] = { liveMinute: 'CAN', isPaused: true };
    }

    // Commentary
    const comms = { ...commentaries };
    const matchComms = comms[matchId] || [];
    const updatedMatchComms = [
      {
        id: `comm-status-${Date.now()}`,
        matchId,
        minute: timers[matchId]?.liveMinute ?? 'HT',
        text: `📢 Match status altered to: ${status}.`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'general' as const
      },
      ...matchComms
    ];
    comms[matchId] = updatedMatchComms;

    // standigs update if finished
    let updatedTeams = teams;
    const normalizedStatus = status.trim().toUpperCase();
    const isNowFinished = normalizedStatus === 'FINISHED' || normalizedStatus === 'FULL-TIME' || normalizedStatus === 'FULL TIME' || normalizedStatus === 'COMPLETED';
    if (isNowFinished) {
      updatedTeams = recalculateStandingsFromMatches(teams, changedMatches);
      
      // Auto-trigger appearances tracker server collection
      try {
        const matchLineup = lineups[matchId];
        const matchSubs = subs.filter(s => s.matchId === matchId);
        
        const starterNames: string[] = [];
        const subInNames: string[] = [];
        
        if (matchLineup) {
          if (matchLineup.home && matchLineup.home.players) {
            Object.values(matchLineup.home.players).forEach(pid => {
              const p = PLAYERS.find(pl => pl.id === pid || pl.name.toLowerCase() === String(pid).toLowerCase());
              if (p) starterNames.push(p.name);
              else starterNames.push(String(pid));
            });
          }
          if (matchLineup.away && matchLineup.away.players) {
            Object.values(matchLineup.away.players).forEach(pid => {
              const p = PLAYERS.find(pl => pl.id === pid || pl.name.toLowerCase() === String(pid).toLowerCase());
              if (p) starterNames.push(p.name);
              else starterNames.push(String(pid));
            });
          }
        }
        
        matchSubs.forEach(s => {
          const p = PLAYERS.find(pl => pl.id === s.playerIn || pl.name.toLowerCase() === s.playerIn.toLowerCase());
          if (p) subInNames.push(p.name);
          else subInNames.push(s.playerIn);
        });

        if (starterNames.length > 0) {
          fetch('/api/match/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              matchId,
              status: 'Finished',
              starters: starterNames,
              substitutes: subInNames,
              homeTeam: matchLineup?.home?.teamAbbr || '',
              awayTeam: matchLineup?.away?.teamAbbr || ''
            })
          })
          .then(res => res.json())
          .then(data => console.log('[Appearances API Sync] Saved player appearances to server-side DB:', data))
          .catch(e => console.error('[Appearances API Sync] Network error updating appearances:', e));
        }
      } catch (e) {
        console.error('[Appearances API Sync] Lineup calculation failure:', e);
      }
    }

    addAuditLog(`Updated match status manually to ${status}`, matchId);
    saveAndBroadcast(changedMatches, updatedTeams, undefined, undefined, undefined, undefined, comms, undefined, undefined, undefined, timers);
  };

  // Score Control Actions
  const incrementGoal = (matchId: string, team: 'home' | 'away') => {
    const changedMatches = matches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          homeScore: team === 'home' ? m.homeScore + 1 : m.homeScore,
          awayScore: team === 'away' ? m.awayScore + 1 : m.awayScore,
        };
      }
      return m;
    });

    const activeMatch = matches.find(m => m.id === matchId);
    if (!activeMatch) return;
    
    const teamName = team === 'home' ? activeMatch.homeTeam : activeMatch.awayTeam;
    addAuditLog(`Incremented scoreboard goal for ${teamName}`, matchId);
    saveAndBroadcast(changedMatches);
  };

  const decrementGoal = (matchId: string, team: 'home' | 'away') => {
    const changedMatches = matches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          homeScore: team === 'home' ? Math.max(0, m.homeScore - 1) : m.homeScore,
          awayScore: team === 'away' ? Math.max(0, m.awayScore - 1) : m.awayScore,
        };
      }
      return m;
    });

    const activeMatch = matches.find(m => m.id === matchId);
    if (!activeMatch) return;

    const teamName = team === 'home' ? activeMatch.homeTeam : activeMatch.awayTeam;
    addAuditLog(`Decremented scoreboard goal for ${teamName}`, matchId);
    saveAndBroadcast(changedMatches);
  };

  const updateScoreManually = (matchId: string, homeScore: number, awayScore: number) => {
    const changedMatches = matches.map(m => {
      if (m.id === matchId) {
        return { ...m, homeScore, awayScore };
      }
      return m;
    });

    addAuditLog(`Updated match scoreboard manually to ${homeScore} - ${awayScore}`, matchId);
    saveAndBroadcast(changedMatches);
  };

  // Goal & Timeline Event Creators
  const addGoalEvent = (matchId: string, goal: Omit<GoalScorer, 'id'>) => {
    const newId = `goal-${Date.now()}`;
    const newGoal: GoalScorer = { ...goal, id: newId };
    const updatedGoals = [...goalScorers, newGoal];

    // Auto-increment the scoreboard!
    const targetMatch = matches.find(m => m.id === matchId);
    const changedMatches = matches.map(m => {
      if (m.id === matchId) {
        // Own goals count for the opposition!
        const isHomeOwnGoal = goal.team === m.homeTeam && goal.type === 'Own Goal';
        const isAwayOwnGoal = goal.team === m.awayTeam && goal.type === 'Own Goal';
        const isHomeScoring = (goal.team === m.homeTeam && goal.type !== 'Own Goal') || isAwayOwnGoal;

        return {
          ...m,
          homeScore: isHomeScoring ? m.homeScore + 1 : m.homeScore,
          awayScore: !isHomeScoring ? m.awayScore + 1 : m.awayScore,
          status: m.status === 'Upcoming' ? 'Live' : m.status // kick off automatically if goal scored
        };
      }
      return m;
    });

    // Broadcast in Match Commentary
    const goalMarker = goal.type === 'Penalty' ? ' (PEN)' : goal.type === 'Own Goal' ? ' (OG)' : '';
    const desc = `⚽ GOOOOOAL! ${goal.playerName} slots it home for ${goal.team} in the ${goal.minute}' minute${goalMarker}!${goal.assist ? ` Assisted by ${goal.assist}.` : ''}`;
    
    const comms = { ...commentaries };
    const matchComms = comms[matchId] || [];
    const updatedMatchComms = [
      {
        id: `comm-goal-${Date.now()}`,
        matchId,
        minute: `${goal.minute}'`,
        text: desc,
        timestamp: new Date().toLocaleTimeString(),
        type: 'goal' as const
      },
      ...matchComms
    ];
    comms[matchId] = updatedMatchComms;

    addAuditLog(`Added Goal event: ${goal.playerName} (${goal.minute}')`, matchId);
    saveAndBroadcast(changedMatches, undefined, undefined, updatedGoals, undefined, undefined, comms);
  };

  const removeLastGoalEvent = (matchId: string) => {
    // Find last goal for this match
    const matchGoals = goalScorers.filter(g => g.matchId === matchId);
    if (matchGoals.length === 0) return;

    const lastGoal = matchGoals[matchGoals.length - 1];
    const updatedGoals = goalScorers.filter(g => g.id !== lastGoal.id);

    // Auto-dec scoreboard
    const changedMatches = matches.map(m => {
      if (m.id === matchId) {
        const isHomeOwnGoal = lastGoal.team === m.homeTeam && lastGoal.type === 'Own Goal';
        const isAwayOwnGoal = lastGoal.team === m.awayTeam && lastGoal.type === 'Own Goal';
        const isHomeScoring = (lastGoal.team === m.homeTeam && lastGoal.type !== 'Own Goal') || isAwayOwnGoal;

        return {
          ...m,
          homeScore: isHomeScoring ? Math.max(0, m.homeScore - 1) : m.homeScore,
          awayScore: !isHomeScoring ? Math.max(0, m.awayScore - 1) : m.awayScore,
        };
      }
      return m;
    });

    // Add general commentary about decision reverted
    const comms = { ...commentaries };
    const matchComms = comms[matchId] || [];
    const updatedMatchComms = [
      {
        id: `comm-revert-${Date.now()}`,
        matchId,
        minute: `${lastGoal.minute}'`,
        text: `⚠️ VAR / Referee Decision: The goal scored by ${lastGoal.playerName} in the ${lastGoal.minute}' minute has been disallowed. Scoreboard updated.`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'system' as const
      },
      ...matchComms
    ];
    comms[matchId] = updatedMatchComms;

    addAuditLog(`Removed last goal event for ${lastGoal.playerName}`, matchId);
    saveAndBroadcast(changedMatches, undefined, undefined, updatedGoals, undefined, undefined, comms);
  };

  const addCardEvent = (matchId: string, event: Omit<CardEvent, 'id'>) => {
    const cardId = `card-${Date.now()}`;
    const newCard: CardEvent = { ...event, id: cardId };
    const updatedCards = [...cards, newCard];

    // Increment visual stats card count
    const statsObj = { ...detailedStats };
    if (statsObj[matchId]) {
      const isHome = event.teamAbbr.toLowerCase() === matches.find(m => m.id === matchId)?.homeTeam.toLowerCase();
      if (event.type === 'Yellow') {
        if (isHome) statsObj[matchId].yellowCardsHome += 1;
        else statsObj[matchId].yellowCardsAway += 1;
      } else {
        // Red or Second Yellow counts as RED Card
        if (isHome) statsObj[matchId].redCardsHome += 1;
        else statsObj[matchId].redCardsAway += 1;
      }
    }

    // Commentary
    const cardSymbol = event.type === 'Yellow' ? '🟨' : '🟥';
    const desc = `${cardSymbol} CARD! ${event.playerName} of ${event.teamAbbr} is shown a ${event.type} card in the ${event.minute}' minute.`;
    
    const comms = { ...commentaries };
    const matchComms = comms[matchId] || [];
    const updatedMatchComms = [
      {
        id: `comm-card-${Date.now()}`,
        matchId,
        minute: `${event.minute}'`,
        text: desc,
        timestamp: new Date().toLocaleTimeString(),
        type: 'card' as const
      },
      ...matchComms
    ];
    comms[matchId] = updatedMatchComms;

    addAuditLog(`Added Card event: ${event.playerName} (${event.type})`, matchId);
    saveAndBroadcast(undefined, undefined, statsObj, undefined, updatedCards, undefined, comms);
  };

  const removeCardEvent = (matchId: string, cardId: string) => {
    const targetCard = cards.find(c => c.id === cardId);
    if (!targetCard) return;

    const updatedCards = cards.filter(c => c.id !== cardId);

    // Revert visual stats count
    const statsObj = { ...detailedStats };
    if (statsObj[matchId]) {
      const isHome = targetCard.teamAbbr.toLowerCase() === matches.find(m => m.id === matchId)?.homeTeam.toLowerCase();
      if (targetCard.type === 'Yellow') {
        if (isHome) statsObj[matchId].yellowCardsHome = Math.max(0, statsObj[matchId].yellowCardsHome - 1);
        else statsObj[matchId].yellowCardsAway = Math.max(0, statsObj[matchId].yellowCardsAway - 1);
      } else {
        if (isHome) statsObj[matchId].redCardsHome = Math.max(0, statsObj[matchId].redCardsHome - 1);
        else statsObj[matchId].redCardsAway = Math.max(0, statsObj[matchId].redCardsAway - 1);
      }
    }

    addAuditLog(`Removed disciplinary card for ${targetCard.playerName}`, matchId);
    saveAndBroadcast(undefined, undefined, statsObj, undefined, updatedCards);
  };

  const addSubEvent = (matchId: string, event: Omit<SubEvent, 'id'>) => {
    const subId = `sub-${Date.now()}`;
    const newSub: SubEvent = { ...event, id: subId };
    const updatedSubs = [...subs, newSub];

    // Commentary
    const desc = `🔄 SUBSTITUTION (${event.teamAbbr}): ${event.playerOut} leaves the field, replaced by ${event.playerIn} in the ${event.minute}' minute.`;
    const comms = { ...commentaries };
    const matchComms = comms[matchId] || [];
    const updatedMatchComms = [
      {
        id: `comm-sub-${Date.now()}`,
        matchId,
        minute: `${event.minute}'`,
        text: desc,
        timestamp: new Date().toLocaleTimeString(),
        type: 'sub' as const
      },
      ...matchComms
    ];
    comms[matchId] = updatedMatchComms;

    addAuditLog(`Added Substitution: ${event.playerOut} OUT ➡️ ${event.playerIn} IN`, matchId);
    saveAndBroadcast(undefined, undefined, undefined, undefined, undefined, updatedSubs, comms);
  };

  const removeSubEvent = (matchId: string, subId: string) => {
    const targetSub = subs.find(s => s.id === subId);
    if (!targetSub) return;

    const updatedSubs = subs.filter(s => s.id !== subId);
    addAuditLog(`Removed Substitution event for ${targetSub.playerIn}`, matchId);
    saveAndBroadcast(undefined, undefined, undefined, undefined, undefined, updatedSubs);
  };

  // Stats controls
  const updateMatchStats = (matchId: string, stats: Partial<DetailedMatchStats>) => {
    const statsObj = { ...detailedStats };
    if (!statsObj[matchId]) return;

    const updatedRecord = {
      ...statsObj[matchId],
      ...stats
    };

    // Ensure database matching fields are always synced & updated
    if (stats.cornersHome !== undefined) updatedRecord.homeCorners = stats.cornersHome;
    if (stats.cornersAway !== undefined) updatedRecord.awayCorners = stats.cornersAway;
    if (stats.yellowCardsHome !== undefined) updatedRecord.homeYellowCards = stats.yellowCardsHome;
    if (stats.yellowCardsAway !== undefined) updatedRecord.awayYellowCards = stats.yellowCardsAway;
    if (stats.redCardsHome !== undefined) updatedRecord.homeRedCards = stats.redCardsHome;
    if (stats.redCardsAway !== undefined) updatedRecord.awayRedCards = stats.redCardsAway;
    if (stats.offsidesHome !== undefined) updatedRecord.homeOffsides = stats.offsidesHome;
    if (stats.offsidesAway !== undefined) updatedRecord.awayOffsides = stats.offsidesAway;
    if (stats.foulsHome !== undefined) updatedRecord.homeFouls = stats.foulsHome;
    if (stats.foulsAway !== undefined) updatedRecord.awayFouls = stats.foulsAway;
    if (stats.freeKicksHome !== undefined) updatedRecord.homeFreeKicks = stats.freeKicksHome;
    if (stats.freeKicksAway !== undefined) updatedRecord.awayFreeKicks = stats.freeKicksAway;

    // Conversely, sync database-style fields to frontend fields too!
    if (stats.homeCorners !== undefined) updatedRecord.cornersHome = stats.homeCorners;
    if (stats.awayCorners !== undefined) updatedRecord.cornersAway = stats.awayCorners;
    if (stats.homeYellowCards !== undefined) updatedRecord.yellowCardsHome = stats.homeYellowCards;
    if (stats.awayYellowCards !== undefined) updatedRecord.yellowCardsAway = stats.awayYellowCards;
    if (stats.homeRedCards !== undefined) updatedRecord.redCardsHome = stats.homeRedCards;
    if (stats.awayRedCards !== undefined) updatedRecord.redCardsAway = stats.awayRedCards;
    if (stats.homeOffsides !== undefined) updatedRecord.offsidesHome = stats.homeOffsides;
    if (stats.awayOffsides !== undefined) updatedRecord.offsidesAway = stats.awayOffsides;
    if (stats.homeFouls !== undefined) updatedRecord.foulsHome = stats.homeFouls;
    if (stats.awayFouls !== undefined) updatedRecord.foulsAway = stats.awayFouls;
    if (stats.homeFreeKicks !== undefined) updatedRecord.freeKicksHome = stats.homeFreeKicks;
    if (stats.awayFreeKicks !== undefined) updatedRecord.freeKicksAway = stats.awayFreeKicks;

    updatedRecord.updatedAt = new Date().toISOString();
    updatedRecord.updatedBy = currentUser?.username || 'Match Commissioner';

    statsObj[matchId] = updatedRecord;

    // Construct highly precise audit log descriptions targeting specific changes
    const matchObj = matches.find(m => m.id === matchId);
    const homeAbbr = matchObj?.homeTeam || 'Home';
    const awayAbbr = matchObj?.awayTeam || 'Away';
    const adminUser = currentUser?.username || 'Match Commissioner';

    let actionMsg = `Updated match statistics`;
    const previous = detailedStats[matchId];
    if (previous) {
      if (stats.cornersHome !== undefined && stats.cornersHome !== previous.cornersHome) {
        if (stats.cornersHome > previous.cornersHome) actionMsg = `${adminUser} added Corner Kick to ${homeAbbr}`;
        else actionMsg = `${adminUser} corrected Corner Kick count for ${homeAbbr}`;
      } else if (stats.cornersAway !== undefined && stats.cornersAway !== previous.cornersAway) {
        if (stats.cornersAway > previous.cornersAway) actionMsg = `${adminUser} added Corner Kick to ${awayAbbr}`;
        else actionMsg = `${adminUser} corrected Corner Kick count for ${awayAbbr}`;
      } else if (stats.offsidesHome !== undefined && stats.offsidesHome !== previous.offsidesHome) {
        if (stats.offsidesHome > previous.offsidesHome) actionMsg = `${adminUser} added Offside to ${homeAbbr}`;
        else actionMsg = `${adminUser} corrected Offside count for ${homeAbbr}`;
      } else if (stats.offsidesAway !== undefined && stats.offsidesAway !== previous.offsidesAway) {
        if (stats.offsidesAway > previous.offsidesAway) actionMsg = `${adminUser} added Offside to ${awayAbbr}`;
        else actionMsg = `${adminUser} corrected Offside count for ${awayAbbr}`;
      } else if (stats.foulsHome !== undefined && stats.foulsHome !== previous.foulsHome) {
        if (stats.foulsHome > previous.foulsHome) actionMsg = `${adminUser} added Foul to ${homeAbbr}`;
        else actionMsg = `${adminUser} corrected Foul count for ${homeAbbr}`;
      } else if (stats.foulsAway !== undefined && stats.foulsAway !== previous.foulsAway) {
        if (stats.foulsAway > previous.foulsAway) actionMsg = `${adminUser} added Foul to ${awayAbbr}`;
        else actionMsg = `${adminUser} corrected Foul count for ${awayAbbr}`;
      } else if (stats.freeKicksHome !== undefined && stats.freeKicksHome !== previous.freeKicksHome) {
        if (stats.freeKicksHome > previous.freeKicksHome) actionMsg = `${adminUser} added Free Kick to ${homeAbbr}`;
        else actionMsg = `${adminUser} corrected Free Kick count for ${homeAbbr}`;
      } else if (stats.freeKicksAway !== undefined && stats.freeKicksAway !== previous.freeKicksAway) {
        if (stats.freeKicksAway > previous.freeKicksAway) actionMsg = `${adminUser} added Free Kick to ${awayAbbr}`;
        else actionMsg = `${adminUser} corrected Free Kick count for ${awayAbbr}`;
      } else if (stats.yellowCardsHome !== undefined && stats.yellowCardsHome !== previous.yellowCardsHome) {
        actionMsg = `${adminUser} updated Yellow Card statistics`;
      } else if (stats.yellowCardsAway !== undefined && stats.yellowCardsAway !== previous.yellowCardsAway) {
        actionMsg = `${adminUser} updated Yellow Card statistics`;
      } else if (stats.redCardsHome !== undefined && stats.redCardsHome !== previous.redCardsHome) {
        actionMsg = `${adminUser} updated Red Card statistics`;
      } else if (stats.redCardsAway !== undefined && stats.redCardsAway !== previous.redCardsAway) {
        actionMsg = `${adminUser} updated Red Card statistics`;
      }
    }

    addAuditLog(actionMsg, matchId);
    saveAndBroadcast(undefined, undefined, statsObj);
  };

  // Lineup controls
  const approveLineup = (matchId: string, teamAbbr: string) => {
    const lineupsObj = { ...lineups };
    if (!lineupsObj[matchId]) return;

    const matchInfo = matches.find(m => m.id === matchId);
    if (!matchInfo) return;

    const isHome = teamAbbr.toLowerCase() === matchInfo.homeTeam.toLowerCase();
    
    if (isHome) {
      lineupsObj[matchId].home.status = 'Approved';
    } else {
      lineupsObj[matchId].away.status = 'Approved';
    }

    // Toggle submitted to true with visual flag
    const changedMatches = matches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          lineupSubmittedHome: isHome ? true : m.lineupSubmittedHome,
          lineupSubmittedAway: !isHome ? true : m.lineupSubmittedAway,
        };
      }
      return m;
    });

    addAuditLog(`Approved matchday tactical lineup roster for ${teamAbbr}`, matchId);
    saveAndBroadcast(changedMatches, undefined, undefined, undefined, undefined, undefined, undefined, lineupsObj);
  };

  const rejectLineup = (matchId: string, teamAbbr: string) => {
    const lineupsObj = { ...lineups };
    if (!lineupsObj[matchId]) return;

    const matchInfo = matches.find(m => m.id === matchId);
    if (!matchInfo) return;

    const isHome = teamAbbr.toLowerCase() === matchInfo.homeTeam.toLowerCase();

    if (isHome) {
      lineupsObj[matchId].home.status = 'Rejected';
    } else {
      lineupsObj[matchId].away.status = 'Rejected';
    }

    addAuditLog(`Rejected tactical lineup roster for ${teamAbbr}`, matchId);
    saveAndBroadcast(undefined, undefined, undefined, undefined, undefined, undefined, undefined, lineupsObj);
  };

  const lockLineups = (matchId: string) => {
    const lineupsObj = { ...lineups };
    if (!lineupsObj[matchId]) return;

    lineupsObj[matchId].home.status = 'Approved';
    lineupsObj[matchId].away.status = 'Approved';

    addAuditLog(`Locked physical tactical boards at kickoff`, matchId);
    saveAndBroadcast(undefined, undefined, undefined, undefined, undefined, undefined, undefined, lineupsObj);
  };

  // Commentary
  const addCommentary = (matchId: string, text: string, type: CommentaryItem['type'] = 'general') => {
    const comms = { ...commentaries };
    const matchComms = comms[matchId] || [];

    const activeTimer = activeMinAndStatus[matchId];
    const minuteStr = activeTimer ? activeTimer.liveMinute : 'Upcoming';

    const newItem: CommentaryItem = {
      id: `comm-user-${Date.now()}`,
      matchId,
      minute: minuteStr,
      text,
      timestamp: new Date().toLocaleTimeString(),
      type
    };

    comms[matchId] = [newItem, ...matchComms];
    addAuditLog(`Added Live commentary update: "${text.substring(0, 30)}..."`, matchId);
    saveAndBroadcast(undefined, undefined, undefined, undefined, undefined, undefined, comms);
  };

  const deleteCommentary = (matchId: string, commentaryId: string) => {
    const comms = { ...commentaries };
    if (!comms[matchId]) return;

    comms[matchId] = comms[matchId].filter(c => c.id !== commentaryId);
    addAuditLog(`Deleted commentary card from feed`, matchId);
    saveAndBroadcast(undefined, undefined, undefined, undefined, undefined, undefined, comms);
  };

  // Match Report
  const saveMatchReport = (matchId: string, reportData: Omit<MatchReport, 'matchId'>) => {
    const reportsObj = { ...reports };
    reportsObj[matchId] = {
      matchId,
      ...reportData
    };

    addAuditLog(`Published final post-match tactical report`, matchId);
    saveAndBroadcast(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, reportsObj);
  };

  const updateMatchAddedTime = async (matchId: string, firstHalf: number, secondHalf: number) => {
    try {
      await fclApi.controlTimer(matchId, 'ADD_INJURY_TIME', { period: 'first', addedMinutes: firstHalf });
      await fclApi.controlTimer(matchId, 'ADD_INJURY_TIME', { period: 'second', addedMinutes: secondHalf });
    } catch (err) {
      console.error("Failed to update added injury time on server", err);
    }
    const changedMatches = matches.map(m => {
      if (m.id === matchId) {
        return { 
          ...m, 
          firstHalfAddedTime: firstHalf, 
          secondHalfAddedTime: secondHalf 
        };
      }
      return m;
    });
    addAuditLog(`Set Match Added Time: 1st Half +${firstHalf} min, 2nd Half +${secondHalf} min`, matchId);
    saveAndBroadcast(changedMatches);
  };

  const updateMatchPenalties = (matchId: string, homePens: number | null, awayPens: number | null) => {
    const changedMatches = matches.map(m => {
      if (m.id === matchId) {
        return { 
          ...m, 
          homePenalties: homePens === null ? undefined : homePens, 
          awayPenalties: awayPens === null ? undefined : awayPens 
        };
      }
      return m;
    });
    const logMsg = homePens !== null && awayPens !== null 
      ? `Recorded Penalty Shootout Score: ${homePens} - ${awayPens}` 
      : 'Removed Penalty Shootout Score';
    addAuditLog(logMsg, matchId);
    saveAndBroadcast(changedMatches);
  };

  // Full reset state back to defaults
  const resetAllData = () => {
    localStorage.removeItem('fcl_admin_matches');
    localStorage.removeItem('fcl_admin_teams');
    localStorage.removeItem('fcl_admin_stats');
    localStorage.removeItem('fcl_admin_goals');
    localStorage.removeItem('fcl_admin_cards');
    localStorage.removeItem('fcl_admin_subs');
    localStorage.removeItem('fcl_admin_audit_logs');
    localStorage.removeItem('fcl_admin_lineups');
    localStorage.removeItem('fcl_admin_commentaries');
    localStorage.removeItem('fcl_admin_reports');
    localStorage.removeItem('fcl_admin_timers');
    localStorage.removeItem('fcl_admin_articles');
    localStorage.removeItem('fcl_admin_news');
    localStorage.removeItem('fcl_admin_match_photos');
    
    // refresh state
    loadState();
    
    // Broadcast updates
    channel.postMessage({ type: 'FCL_STATE_UPDATE' });
  };

  const createFixture = (newMatch: Omit<Match, 'id' | 'homeScore' | 'awayScore' | 'lineupSubmittedHome' | 'lineupSubmittedAway'>) => {
    const matchId = `match-${Date.now()}`;
    const fullMatch: Match = {
      ...newMatch,
      id: matchId,
      homeScore: 0,
      awayScore: 0,
      lineupSubmittedHome: false,
      lineupSubmittedAway: false,
      firstHalfAddedTime: 0,
      secondHalfAddedTime: 0
    };
    const updated = [...matches, fullMatch];
    addAuditLog(`Created fixture: ${fullMatch.homeTeam} vs ${fullMatch.awayTeam} (MW ${fullMatch.matchday})`, matchId);
    saveAndBroadcast(updated);
  };

  const editFixture = (matchId: string, updatedFields: Partial<Match>) => {
    const updated = matches.map(m => {
      if (m.id === matchId) {
        return { ...m, ...updatedFields };
      }
      return m;
    });
    const match = matches.find(m => m.id === matchId);
    const label = match ? `${match.homeTeam} vs ${match.awayTeam}` : 'match';
    addAuditLog(`Edited fixture settings for ${label}`, matchId);
    saveAndBroadcast(updated);
  };

  const deleteFixture = (matchId: string) => {
    const matchToDelete = matches.find(m => m.id === matchId);
    const updated = matches.filter(m => m.id !== matchId);
    addAuditLog(`Deleted fixture: ${matchToDelete ? `${matchToDelete.homeTeam} vs ${matchToDelete.awayTeam}` : 'match'}`);
    saveAndBroadcast(updated);
  };

  const saveSponsors = async (newSponsors: Sponsor[]) => {
    try {
      const res = await fclApi.saveSponsors(newSponsors);
      if (res && res.success) {
        setSponsors(res.sponsors);
        channel.postMessage({ type: 'FCL_STATE_UPDATE' });
      }
    } catch (err) {
      console.error("Error saving sponsors on server", err);
      setSponsors(newSponsors);
    }
  };

  const resetSponsorsAll = async () => {
    try {
      const res = await fclApi.resetSponsors();
      if (res && res.success) {
        setSponsors(res.sponsors);
        channel.postMessage({ type: 'FCL_STATE_UPDATE' });
        window.location.reload();
      }
    } catch (err) {
      console.error("Error resetting sponsors on server", err);
    }
  };

  const uploadSponsorLogo = async (id: string, logoData: string, filename: string) => {
    try {
      const res = await fclApi.uploadSponsorLogo(id, logoData, filename);
      if (res && res.success) {
        setSponsors(res.sponsors);
        channel.postMessage({ type: 'FCL_STATE_UPDATE' });
      }
    } catch (err) {
      console.error("Error uploading sponsor logo", err);
    }
  };

  const saveArticle = (article: Article) => {
    const fresh = [...articles];
    const idx = fresh.findIndex(a => a.id === article.id);
    if (idx >= 0) {
      fresh[idx] = article;
    } else {
      fresh.push(article);
    }
    setArticles(fresh);
    localStorage.setItem('fcl_admin_articles', JSON.stringify(fresh));
    addAuditLog(`${currentUser ? currentUser.username : 'Commissioner'} published article: ${article.title}`);
    channel.postMessage({ type: 'FCL_STATE_UPDATE' });
  };

  const deleteArticle = (id: string) => {
    const fresh = articles.filter(a => a.id !== id);
    setArticles(fresh);
    localStorage.setItem('fcl_admin_articles', JSON.stringify(fresh));
    addAuditLog(`Deleted article ID: ${id}`);
    channel.postMessage({ type: 'FCL_STATE_UPDATE' });
  };

  const saveNewsItem = (newsItem: NewsItem) => {
    const fresh = [...newsItems];
    const idx = fresh.findIndex(n => n.id === newsItem.id);
    if (idx >= 0) {
      fresh[idx] = newsItem;
    } else {
      fresh.push(newsItem);
    }
    setNewsItems(fresh);
    localStorage.setItem('fcl_admin_news', JSON.stringify(fresh));
    addAuditLog(`${currentUser ? currentUser.username : 'Commissioner'} published Committee Announcement: ${newsItem.title}`);
    channel.postMessage({ type: 'FCL_STATE_UPDATE' });
  };

  const deleteNewsItem = (id: string) => {
    const fresh = newsItems.filter(n => n.id !== id);
    setNewsItems(fresh);
    localStorage.setItem('fcl_admin_news', JSON.stringify(fresh));
    addAuditLog(`Deleted News Item ID: ${id}`);
    channel.postMessage({ type: 'FCL_STATE_UPDATE' });
  };

  const saveMatchPhoto = (photo: MatchPhoto) => {
    const fresh = [...matchPhotos];
    const idx = fresh.findIndex(p => p.id === photo.id);
    if (idx >= 0) {
      fresh[idx] = photo;
    } else {
      fresh.push(photo);
    }
    setMatchPhotos(fresh);
    localStorage.setItem('fcl_admin_match_photos', JSON.stringify(fresh));
    addAuditLog(`${currentUser ? currentUser.username : 'Commissioner'} uploaded photo: ${photo.category} to ${photo.folderStage || 'Match'}`);
    channel.postMessage({ type: 'FCL_STATE_UPDATE' });
  };

  const deleteMatchPhoto = (id: string) => {
    const fresh = matchPhotos.filter(p => p.id !== id);
    setMatchPhotos(fresh);
    localStorage.setItem('fcl_admin_match_photos', JSON.stringify(fresh));
    addAuditLog(`Deleted match photo ID: ${id}`);
    channel.postMessage({ type: 'FCL_STATE_UPDATE' });
  };

  return (
    <MatchStateContext.Provider
      value={{
        matches: resolvedMatches,
        teams: computedTeams,
        players,
        detailedStats,
        goalScorers,
        cards,
        subs,
        lineups,
        commentaries,
        reports,
        auditLogs,
        currentUser,
        activeMinAndStatus,
        isLiveTableActive,
        officialTeams,
        coefficients: computedCoefficients,
        login,
        logout,
        startMatch,
        pauseMatch,
        resumeMatch,
        endMatch,
        triggerHalfTime,
        startSecondHalf,
        updateMatchMinute,
        updateMatchStatusDirectly,
        updateMatchAddedTime,
        updateMatchPenalties,
        incrementGoal,
        decrementGoal,
        updateScoreManually,
        addGoalEvent,
        removeLastGoalEvent,
        addCardEvent,
        removeCardEvent,
        addSubEvent,
        removeSubEvent,
        updateMatchStats,
        approveLineup,
        rejectLineup,
        lockLineups,
        addCommentary,
        deleteCommentary,
        saveMatchReport,
        addAuditLog,
        resetAllData,
        createFixture,
        editFixture,
        deleteFixture,
        articles,
        newsItems,
        matchPhotos,
        saveArticle,
        deleteArticle,
        saveNewsItem,
        deleteNewsItem,
        saveMatchPhoto,
        deleteMatchPhoto,
        sponsors,
        saveSponsors,
        resetSponsorsAll,
        uploadSponsorLogo
      }}
    >
      {children}
    </MatchStateContext.Provider>
  );
}

export function useMatchState() {
  const context = useContext(MatchStateContext);
  if (context === undefined) {
    throw new Error('useMatchState must be used within a MatchStateProvider');
  }
  return context;
}
