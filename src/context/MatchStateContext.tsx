import React, { createContext, useContext, useState, useEffect } from 'react';
import { Match, Team, GoalScorer, MatchStats } from '../types';
import { MATCHES, TEAMS, MOCK_MATCH_STATS } from '../data/mockData';
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
  possessionHome: number;
  possessionAway: number;
  shotsHome: number;
  shotsAway: number;
  shotsOnTargetHome: number;
  shotsOnTargetAway: number;
  foulsHome: number;
  foulsAway: number;
  offsidesHome: number;
  offsidesAway: number;
  savesHome: number;
  savesAway: number;
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
  role: 'Super Admin' | 'Match Commissioner' | 'Media Officer';
}

interface MatchStateContextType {
  matches: Match[];
  teams: Team[];
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

  // Helper to load all state from localStorage or seed initial data
  const loadState = () => {
    // 1. Matches
    const storedMatches = localStorage.getItem('fcl_admin_matches');
    let loadedMatches: Match[] = [];
    if (storedMatches) {
      loadedMatches = JSON.parse(storedMatches);
    } else {
      loadedMatches = MATCHES.map(m => ({
        ...m,
        status: m.status || 'Upcoming',
        homeScore: m.homeScore ?? 0,
        awayScore: m.awayScore ?? 0,
        lineupSubmittedHome: m.lineupSubmittedHome ?? false,
        lineupSubmittedAway: m.lineupSubmittedAway ?? false
      }));
      localStorage.setItem('fcl_admin_matches', JSON.stringify(loadedMatches));
    }
    setMatches(loadedMatches);

    // 2. Teams
    const storedTeams = localStorage.getItem('fcl_admin_teams');
    let loadedTeams: Team[] = [];
    if (storedTeams) {
      loadedTeams = JSON.parse(storedTeams);
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
        loadedStats[m.id] = {
          matchId: m.id,
          cornersHome: mockStat?.cornersHome ?? 0,
          cornersAway: mockStat?.cornersAway ?? 0,
          yellowCardsHome: mockStat?.yellowCardsHome ?? 0,
          yellowCardsAway: mockStat?.yellowCardsAway ?? 0,
          redCardsHome: mockStat?.redCardsHome ?? 0,
          redCardsAway: mockStat?.redCardsAway ?? 0,
          possessionHome: 50 + (charSum % 10) - 5,
          possessionAway: 50 - ((charSum % 10) - 5),
          shotsHome: 8 + (charSum % 6),
          shotsAway: 6 + (charSum % 5),
          shotsOnTargetHome: 3 + (charSum % 4),
          shotsOnTargetAway: 2 + (charSum % 3),
          foulsHome: 10 + (charSum % 8),
          foulsAway: 11 + (charSum % 7),
          offsidesHome: charSum % 4,
          offsidesAway: charSum % 3,
          savesHome: 2 + (charSum % 5),
          savesAway: 3 + (charSum % 4)
        };
      });
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
      localStorage.setItem('fcl_admin_goals', JSON.stringify(loadedGoals));
    }
    setGoalScorers(loadedGoals);

    // 5. Cards & Subs
    const storedCards = localStorage.getItem('fcl_admin_cards');
    setCards(storedCards ? JSON.parse(storedCards) : []);

    const storedSubs = localStorage.getItem('fcl_admin_subs');
    setSubs(storedSubs ? JSON.parse(storedSubs) : []);

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
            captainId: 'p-1',
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
      localStorage.setItem('fcl_admin_lineups', JSON.stringify(loadedLineups));
    }
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
      localStorage.setItem('fcl_admin_commentaries', JSON.stringify(loadedCommentary));
    }
    setCommentaries(loadedCommentary);

    // 10. Reports
    const storedReports = localStorage.getItem('fcl_admin_reports');
    setReports(storedReports ? JSON.parse(storedReports) : {});

    // 11. Timer Cache
    const storedTimers = localStorage.getItem('fcl_admin_timers');
    setActiveMinAndStatus(storedTimers ? JSON.parse(storedTimers) : {});
  };

  // Standing calculation helper
  const recalculateStandingsFromMatches = (allTeams: Team[], allMatches: Match[]): Team[] => {
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
      form: [] as ('W' | 'D' | 'L')[]
    }));

    // Find all matches finished
    const finishedMatches = allMatches.filter(m => m.status === 'Finished');

    finishedMatches.forEach(match => {
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
      }
    });

    return calculatedTeams;
  };

  useEffect(() => {
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

    // Listen to real-time events published via BroadcastChannel
    const handleBroadcastMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'FCL_STATE_UPDATE') {
        loadState();
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
    if (updatedMatches) {
      setMatches(updatedMatches);
      localStorage.setItem('fcl_admin_matches', JSON.stringify(updatedMatches));
    }
    if (updatedTeams) {
      setTeams(updatedTeams);
      localStorage.setItem('fcl_admin_teams', JSON.stringify(updatedTeams));
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
        console.error("Failed to sync timers from server", err);
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
    if (status === 'Half Time') {
      timers[matchId] = { liveMinute: 'HT', isPaused: true };
    } else if (status === 'Finished') {
      timers[matchId] = { liveMinute: 'FT', isPaused: true };
    } else if (status === 'Postponed') {
      timers[matchId] = { liveMinute: 'PPD', isPaused: true };
    } else if (status === 'Cancelled') {
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
    if (status === 'Finished') {
      updatedTeams = recalculateStandingsFromMatches(teams, changedMatches);
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

    statsObj[matchId] = {
      ...statsObj[matchId],
      ...stats
    };

    addAuditLog(`Updated match statistical ratios`, matchId);
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
    
    // refresh state
    loadState();
    
    // Broadcast updates
    channel.postMessage({ type: 'FCL_STATE_UPDATE' });
  };

  return (
    <MatchStateContext.Provider
      value={{
        matches,
        teams,
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
        resetAllData
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
