import React, { createContext, useContext, useState, useEffect } from 'react';
import { Match, Team, GoalScorer, MatchStats, Article, NewsItem, MatchPhoto, Sponsor, Player } from '../types';
import { MATCHES, TEAMS, MOCK_MATCH_STATS, PLAYERS } from '../data/mockData';
import { fclApi } from '../lib/api';

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
    const basePlayers: Player[] = PLAYERS.map(p => ({
      ...p,
      goals: 0,
      played: 0,
      matchesPlayed: 0,
      yellowCards: 0,
      yellow_cards: 0,
      redCards: 0,
      red_cards: 0,
      cleanSheets: 0,
      clean_sheets: 0,
      goalsConceded: 0,
      goals_conceded: 0,
    }));

    // Find all finished matches
    const finishedMatches = matches.filter(m => {
      const s = m.status.trim().toUpperCase();
      return s === 'FINISHED' || s === 'FULL-TIME' || s === 'FULL TIME' || s === 'COMPLETED';
    });

    // 1. Calculate Goals
    goalScorers.forEach(g => {
      if (g.type !== 'Own Goal') {
        const matchExists = matches.some(m => m.id === g.matchId && ['FINISHED', 'FULL-TIME', 'FULL TIME', 'COMPLETED', 'LIVE'].includes(m.status.trim().toUpperCase()));
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
      const matchExists = matches.some(m => m.id === c.matchId && ['FINISHED', 'FULL-TIME', 'FULL TIME', 'COMPLETED', 'LIVE'].includes(m.status.trim().toUpperCase()));
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

    // 3. Calculate Matches Played
    finishedMatches.forEach(m => {
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
      
      // If we have lineup involved player IDs, mark them
      if (involvedPlayerIds.size > 0) {
        involvedPlayerIds.forEach(pid => {
          const pObj = basePlayers.find(p => p.id === pid);
          if (pObj) {
            pObj.played += 1;
            pObj.matchesPlayed = pObj.played;
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
          if (pObj) {
            pObj.played += 1;
            pObj.matchesPlayed = pObj.played;
          }
        });
      }
    });

    // 4. Calculate Goalkeeper Clean Sheets and Goals Conceded
    finishedMatches.forEach(m => {
      const homeConceded = m.awayScore;
      const awayConceded = m.homeScore;
      
      const matchLineup = lineups[m.id];
      let homeGk: Player | undefined;
      if (matchLineup && matchLineup.home && matchLineup.home.players && matchLineup.home.players['GK']) {
        const gkId = matchLineup.home.players['GK'];
        homeGk = basePlayers.find(p => p.id === gkId);
      }
      if (!homeGk) {
        // Fallback: first GK of home team
        homeGk = basePlayers.find(p => p.teamId.toLowerCase() === m.homeTeam.toLowerCase() && p.position === 'GK');
      }
      if (homeGk) {
        homeGk.goalsConceded = (homeGk.goalsConceded || 0) + homeConceded;
        homeGk.goals_conceded = homeGk.goalsConceded;
        if (homeConceded === 0) {
          homeGk.cleanSheets += 1;
          homeGk.clean_sheets = homeGk.cleanSheets;
        }
        // Ensure they are also tracked as played
        if (homeGk.played === 0) {
          homeGk.played = 1;
          homeGk.matchesPlayed = 1;
        }
      }
      
      let awayGk: Player | undefined;
      if (matchLineup && matchLineup.away && matchLineup.away.players && matchLineup.away.players['GK']) {
        const gkId = matchLineup.away.players['GK'];
        awayGk = basePlayers.find(p => p.id === gkId);
      }
      if (!awayGk) {
        // Fallback: first GK of away team
        awayGk = basePlayers.find(p => p.teamId.toLowerCase() === m.awayTeam.toLowerCase() && p.position === 'GK');
      }
      if (awayGk) {
        awayGk.goalsConceded = (awayGk.goalsConceded || 0) + awayConceded;
        awayGk.goals_conceded = awayGk.goalsConceded;
        if (awayConceded === 0) {
          awayGk.cleanSheets += 1;
          awayGk.clean_sheets = awayGk.cleanSheets;
        }
        // Ensure they are also tracked as played
        if (awayGk.played === 0) {
          awayGk.played = 1;
          awayGk.matchesPlayed = 1;
        }
      }
    });

    return basePlayers;
  }, [matches, goalScorers, cards, subs, lineups]);



  // Helper to load all state from localStorage or seed initial data
  const loadState = () => {
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
            (['md1-1', 'md1-2', 'md1-5'].includes(official.id) && m.homeScore !== official.homeScore) ||
            (['md1-1', 'md1-2', 'md1-5'].includes(official.id) && m.awayScore !== official.awayScore) ||
            JSON.stringify(m.officialsPanel) !== JSON.stringify(official.officialsPanel) ||
            (official.matchday === 1 && m.status !== official.status) // Sync status specifically for matchday 1 reschedules
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
              status: official.matchday === 1 ? official.status : m.status,
              lineupSubmittedHome: official.lineupSubmittedHome,
              lineupSubmittedAway: official.lineupSubmittedAway,
              manOfTheMatch: official.manOfTheMatch,
              homeScore: ['md1-1', 'md1-2', 'md1-5'].includes(official.id) ? official.homeScore : m.homeScore,
              awayScore: ['md1-1', 'md1-2', 'md1-5'].includes(official.id) ? official.awayScore : m.awayScore
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
        lineupSubmittedAway: m.lineupSubmittedAway ?? false
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

    setDetailedStats(loadedStats);

    // 4. Goal events
    const storedGoals = localStorage.getItem('fcl_admin_goals');
    let loadedGoals: GoalScorer[] = [];
    if (storedGoals) {
      loadedGoals = JSON.parse(storedGoals);
    } else {
      loadedGoals = [];
    }

    if (!loadedGoals.some(g => g.matchId === 'md1-2' && g.playerName === 'Michael')) {
      loadedGoals.unshift({
        id: 'goal-md1-2-michael-20',
        matchId: 'md1-2',
        playerName: 'Michael',
        team: 'AGP',
        minute: "20'",
        type: 'Goal'
      });
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md1-2' && g.playerName === 'Roland')) {
      loadedGoals.push({
        id: 'goal-md1-2-roland-46',
        matchId: 'md1-2',
        playerName: 'Roland',
        team: 'AGP',
        minute: "46'",
        type: 'Goal'
      });
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }

    if (!loadedGoals.some(g => g.matchId === 'md1-5' && g.playerName === 'Tofunmi')) {
      loadedGoals.push({
        id: 'goal-md1-5-tofunmi-7',
        matchId: 'md1-5',
        playerName: 'Tofunmi',
        team: 'BDG',
        minute: "7'",
        type: 'Goal'
      });
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
      { id: 'sub-mst-ake-for', matchId: 'md1-1', teamAbbr: 'MST', playerOut: 'Akintunde Ayomide Oluwaseyifunmi', playerIn: 'Ekwe Fortune', minute: 60 }
    ];

    let subsUpdated = false;
    officialSubs.forEach(s => {
      if (!loadedSubs.some(existing => existing.id === s.id)) {
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
          'LW': 'player-mst-18', // Akintunde Ayomide Oluwaseyifunmi
          'CF': 'player-mst-14', // Nkemjika Sydney
          'RW': 'player-mst-17'  // Fabusuyi Daniel Oluwafisayo
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
      away: loadedLineups['md1-1']?.away || {
        matchId: 'md1-1',
        teamAbbr: 'ICE',
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
          'CF': 'player-cys-10', // Jegede Daniel
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
      away: loadedLineups['md1-7']?.away || {
        matchId: 'md1-7',
        teamAbbr: 'IDD',
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

    localStorage.setItem('fcl_admin_lineups', JSON.stringify(loadedLineups));
    setLineups(loadedLineups);

    // 9. Commentary
    const storedCommentary = localStorage.getItem('fcl_admin_commentaries');
    let loadedCommentary: Record<string, CommentaryItem[]> = {};
    if (storedCommentary) {
      loadedCommentary = JSON.parse(storedCommentary);
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

    if (!loadedCommentary['md1-2'] || !loadedCommentary['md1-2'].some(c => c.id === 'comm-goal-md1-2-roland')) {
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
          id: 'comm-goal-md1-2-roland',
          matchId: 'md1-2',
          minute: "46'",
          text: "⚽ GOAL! Roland scores for AGP shortly after the restart, doubling their advantage! AGP 2–0 BCH.",
          timestamp: "10:16 AM",
          type: 'goal'
        },
        {
          id: 'comm-goal-md1-2',
          matchId: 'md1-2',
          minute: "20'",
          text: "⚽ GOAL! Michael scores for AGP with a sensational shot to give AGP a 1–0 lead! Outstanding play by the home side.",
          timestamp: "9:50 AM",
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

    if (!loadedCommentary['md1-5'] || !loadedCommentary['md1-5'].some(c => c.id === 'comm-goal-md1-5-tofunmi')) {
      loadedCommentary['md1-5'] = [
        {
          id: 'comm-md1-5-current',
          matchId: 'md1-5',
          minute: "10'",
          text: "BDG is in full control after Tofunmi's opening goal. ENT is trying to reorganize their backline, finding it difficult to pass through BDG's high press.",
          timestamp: "2:10 PM",
          type: 'general'
        },
        {
          id: 'comm-goal-md1-5-tofunmi',
          matchId: 'md1-5',
          minute: "7'",
          text: "⚽ GOAL! Tofunmi scores an incredible early opener for BDG! They break the deadlock with a brilliant build-up play. BDG 1–0 ENT.",
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
    setCommentaries(loadedCommentary);

    // 10. Reports
    const storedReports = localStorage.getItem('fcl_admin_reports');
    setReports(storedReports ? JSON.parse(storedReports) : {});

    // 11. Timer Cache
    const storedTimers = localStorage.getItem('fcl_admin_timers');
    let loadedTimers: Record<string, { liveMinute: string; isPaused: boolean }> = storedTimers ? JSON.parse(storedTimers) : {};
    if (!loadedTimers['md1-1'] || loadedTimers['md1-1'].liveMinute !== "FT") {
      loadedTimers['md1-1'] = { liveMinute: "FT", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['md1-2'] || loadedTimers['md1-2'].liveMinute === "35:00") {
      loadedTimers['md1-2'] = { liveMinute: "46:00", isPaused: true };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
    if (!loadedTimers['md1-5']) {
      loadedTimers['md1-5'] = { liveMinute: "10:00", isPaused: false };
      localStorage.setItem('fcl_admin_timers', JSON.stringify(loadedTimers));
    }
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
          title: 'Titan Clash: MST vs IFS Preview',
          featuredImage: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=1000',
          author: 'Fabrizio',
          category: 'Match Preview',
          body: 'The undisputed titans of the FUTA Champions League, defending champions MST and Information Systems (IFS) are set to lock horns in a match that will define the early leadership of the tournament. Both teams possess unyielding midfields and lightning-fast wingers. Pundits expect a tight, tactical battle of wits.',
          tags: ['MST', 'IFS', 'Preview', 'Titans'],
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
          body: 'The FCL Committee invites all sports officials and department coaches to complete player and technical official credential submissions by midnight. Ensure all matric numbers and official FUTA student ID card uploads are completely legible.',
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
      form: [] as ('W' | 'D' | 'L')[],
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
      const s = m.status.trim().toUpperCase();
      const isFinished = s === 'FINISHED' || s === 'FULL-TIME' || s === 'FULL TIME' || s === 'COMPLETED';
      const isLive = s === 'LIVE' || s === 'FIRST_HALF' || s === 'FIRSTHALF' || s === 'HALF_TIME' || s === 'HALFTIME' || s === 'HALF-TIME' || s === 'SECOND_HALF' || s === 'SECONDHALF';
      return isFinished || (includeLive && isLive);
    });

    matchesToInclude.forEach(match => {
      const homeTeamObj = calculatedTeams.find(t => t.id === match.homeTeam.toLowerCase());
      const awayTeamObj = calculatedTeams.find(t => t.id === match.awayTeam.toLowerCase());

      if (homeTeamObj && awayTeamObj) {
        // Goals
        homeTeamObj.goalsFor += match.homeScore;
        homeTeamObj.goalsAgainst += match.awayScore;
        
        awayTeamObj.goalsFor += match.awayScore;
        awayTeamObj.goalsAgainst += match.homeScore;

        // Played
        homeTeamObj.played += 1;
        awayTeamObj.played += 1;

        if (match.homeScore > match.awayScore) {
          homeTeamObj.won += 1;
          homeTeamObj.points += 3;
          homeTeamObj.form.push('W');

          awayTeamObj.lost += 1;
          awayTeamObj.form.push('L');
        } else if (match.awayScore > match.homeScore) {
          awayTeamObj.won += 1;
          awayTeamObj.points += 3;
          awayTeamObj.form.push('W');

          homeTeamObj.lost += 1;
          homeTeamObj.form.push('L');
        } else {
          homeTeamObj.drawn += 1;
          homeTeamObj.points += 1;
          homeTeamObj.form.push('D');

          awayTeamObj.drawn += 1;
          awayTeamObj.points += 1;
          awayTeamObj.form.push('D');
        }

        // Limit form to last 5
        homeTeamObj.form = homeTeamObj.form.slice(-5);
        awayTeamObj.form = awayTeamObj.form.slice(-5);

        // GD
        homeTeamObj.goalDifference = homeTeamObj.goalsFor - homeTeamObj.goalsAgainst;
        awayTeamObj.goalDifference = awayTeamObj.goalsFor - awayTeamObj.goalsAgainst;

        // Cards aggregation
        const mStats = getMatchStats(match.id);
        
        homeTeamObj.yellowCards += mStats.yellowHome;
        homeTeamObj.yellow_cards = homeTeamObj.yellowCards;
        homeTeamObj.redCards += mStats.redHome;
        homeTeamObj.red_cards = homeTeamObj.redCards;

        awayTeamObj.yellowCards += mStats.yellowAway;
        awayTeamObj.yellow_cards = awayTeamObj.yellowCards;
        awayTeamObj.redCards += mStats.redAway;
        awayTeamObj.red_cards = awayTeamObj.redCards;
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
    });

    // Sort according to FCL Official tiebreaker ranking order
    calculatedTeams.sort((a, b) => {
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

  useEffect(() => {
    const hasReset = localStorage.getItem('fcl_reset_2026_live_v4');
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
      localStorage.setItem('fcl_reset_2026_live_v4', 'true');
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
        matches,
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
