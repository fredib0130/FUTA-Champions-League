import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMatchState } from '../context/MatchStateContext';
import { parseMinuteToNumeric, formatMinuteDisplay } from '../types';
import { PLAYERS } from '../data/mockData';
import { TeamLogo } from '../components/TeamLogo';
import { 
  ArrowLeft, Radio, Trophy, Calendar, Sparkles, Award, Shield, FileText, Send, Clock, List, Users, X, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
  id: string;
  type: 'goal' | 'status-change';
  title: string;
  message: string;
  matchId?: string;
  timestamp: number;
}

export default function PublicMatchCenter() {
  const { matchId } = useParams<{ matchId: string }>();
  const { 
    matches, teams, detailedStats, goalScorers, cards, subs, commentaries, reports, activeMinAndStatus, lineups, players
  } = useMatchState();

  const [toasts, setToasts] = useState<Toast[]>([]);
  const prevGoalScorersRef = useRef<any[]>([]);
  const prevMatchesRef = useRef<any[]>([]);
  const isFirstMountRef = useRef(true);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isMcbReleased = () => {
    // Release at 2:30 PM on match day 2026-07-05 (which is 14:30:00 UTC-7 or PDT)
    const releaseTime = new Date('2026-07-05T14:30:00-07:00');
    return currentTime >= releaseTime;
  };

  const getTeamName = (teamIdCode: string) => {
    const t = teams.find(team => team.id.toLowerCase() === teamIdCode.toLowerCase() || team.name.toLowerCase() === teamIdCode.toLowerCase());
    return t ? t.name : teamIdCode.toUpperCase();
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToast = (toast: Omit<Toast, 'id' | 'timestamp'>) => {
    const id = `${toast.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { ...toast, id, timestamp: Date.now() };
    setToasts(prev => [...prev, newToast]);
    
    // Auto dismiss after 6 seconds
    setTimeout(() => {
      removeToast(id);
    }, 6000);
  };

  useEffect(() => {
    if (isFirstMountRef.current) {
      prevGoalScorersRef.current = goalScorers;
      prevMatchesRef.current = matches;
      isFirstMountRef.current = false;
      return;
    }

    // Goal detection update
    const prevGoalScorers = prevGoalScorersRef.current;
    const newGoals = goalScorers.filter(cg => !prevGoalScorers.some(pg => pg.id === cg.id));

    newGoals.forEach(g => {
      const associatedMatch = matches.find(m => m.id === g.matchId);
      if (!associatedMatch) return;

      const isCurrentMatch = g.matchId === matchId;
      const scoringTeamName = getTeamName(g.team);
      const opposingTeamId = associatedMatch.homeTeam.toLowerCase() === g.team.toLowerCase() ? associatedMatch.awayTeam : associatedMatch.homeTeam;
      const opposingTeamName = getTeamName(opposingTeamId);

      const title = isCurrentMatch ? "⚽ GOAL SCORED!" : "⚽ GOAL AT ANOTHER VENUE";
      const message = `${scoringTeamName} has scored against ${opposingTeamName}! Scored by ${g.playerName} (${g.minute}')`;

      addToast({
        type: 'goal',
        title,
        message,
        matchId: g.matchId
      });
    });

    // Match Status detection update
    const prevMatches = prevMatchesRef.current;
    matches.forEach(cm => {
      const pm = prevMatches.find(x => x.id === cm.id);
      if (pm && pm.status !== cm.status) {
        const isCurrentMatch = cm.id === matchId;
        const homeName = getTeamName(cm.homeTeam);
        const awayName = getTeamName(cm.awayTeam);

        let statusTextValue = cm.status;
        if (cm.status === 'Live') statusTextValue = 'Started/In Progress';
        if (cm.status === 'Finished') statusTextValue = 'Finished/Full Time';

        const title = isCurrentMatch ? "🕒 MATCH STATUS UPDATE" : "🕒 DISPATCH FROM OTHER VENUE";
        const message = `${homeName} vs ${awayName} is now ${statusTextValue}!`;

        addToast({
          type: 'status-change',
          title,
          message,
          matchId: cm.id
        });
      }
    });

    // Update refs to latest verified values
    prevGoalScorersRef.current = goalScorers;
    prevMatchesRef.current = matches;
  }, [goalScorers, matches, matchId, teams]);

  const match = matches.find(m => m.id === matchId);

  if (!match) {
    return (
      <div className="min-h-screen bg-navy text-white flex flex-col items-center justify-center p-4">
        <ArrowLeft size={32} className="text-white/20 mb-3" />
        <h2 className="text-xl font-display font-black text-white">Match Center Not Found</h2>
        <Link to="/fixtures" className="text-primary mt-2 font-bold hover:underline">Return to Fixtures</Link>
      </div>
    );
  }

  const homeTeam = teams.find(t => t.id === match.homeTeam.toLowerCase());
  const awayTeam = teams.find(t => t.id === match.awayTeam.toLowerCase());

  if (!homeTeam || !awayTeam) return null;

  // Active timer settings
  const timer = activeMinAndStatus[match.id] || { liveMinute: '0\'', isPaused: true };

  // Score details
  const isFinished = match.status === 'Finished' || match.status === 'Full Time';
  const isUpcoming = match.status === 'Upcoming';

  // Stats
  const stats = detailedStats[match.id] || {
    cornersHome: 0, cornersAway: 0,
    foulsHome: 0, foulsAway: 0,
    yellowCardsHome: 0, yellowCardsAway: 0,
    redCardsHome: 0, redCardsAway: 0,
    offsidesHome: 0, offsidesAway: 0,
    freeKicksHome: 0, freeKicksAway: 0
  };

  const matchGoals = goalScorers.filter(g => g.matchId === match.id);
  const matchCards = cards.filter(c => c.matchId === match.id);
  const matchSubs = subs.filter(s => s.matchId === match.id);
  const matchCommentary = commentaries[match.id] || [];
  const publishedReport = reports[match.id];

  // Dynamic timelines
  const timelineEvents = [
    ...matchGoals.map(g => ({
      type: 'goal' as const,
      minute: g.minute,
      text: `⚽ GOOOAL! ${g.playerName} (${g.type})${g.assist ? ` - Assist by ${g.assist}` : ''}`,
      team: g.team
    })),
    ...matchCards.map(c => ({
      type: 'card' as const,
      minute: c.minute,
      text: `${c.type === 'Yellow' ? '🟨' : '🟥'} CARD Shown to ${c.playerName} (${c.type})`,
      team: c.teamAbbr
    })),
    ...matchSubs.map(s => ({
      type: 'sub' as const,
      minute: s.minute,
      text: `🔄 SUB: ${s.playerIn} IN | ${s.playerOut} OUT`,
      team: s.teamAbbr
    }))
  ].sort((a, b) => parseMinuteToNumeric(b.minute) - parseMinuteToNumeric(a.minute));

  // Home vs Away scorers lists block
  const homeScorers = matchGoals.filter(g => {
    const isHome = g.team.toLowerCase() === match.homeTeam.toLowerCase();
    // Own Goals scored by away team count for home scoreboard, but belong to away scorers section
    if (g.type === 'Own Goal') {
      return !isHome;
    }
    return isHome;
  });

  const awayScorers = matchGoals.filter(g => {
    const isAway = g.team.toLowerCase() === match.awayTeam.toLowerCase();
    if (g.type === 'Own Goal') {
      return !isAway;
    }
    return isAway;
  });

  // Structural details
  const getMatchChronologicalWeight = React.useCallback((m: any): number => {
    let stageWeight = 0;
    if (m.stage === 'Playoff Round' || m.id.startsWith('PO')) stageWeight = 4;
    else if (m.stage === 'Quarter-finals' || m.id.startsWith('QF')) stageWeight = 5;
    else if (m.stage === 'Semi-finals' || m.id.startsWith('SF')) stageWeight = 6;
    else if (m.stage === 'Third Place' || m.id === 'TP') stageWeight = 7;
    else if (m.stage === 'Final' || m.id === 'FINAL' || m.id === 'F') stageWeight = 8;
    else stageWeight = m.matchday || 1;

    let subWeight = 0;
    if (m.id.startsWith('md1-')) subWeight = parseInt(m.id.split('-')[1]) || 0;
    else if (m.id.startsWith('md2-')) subWeight = parseInt(m.id.split('-')[1]) || 0;
    else if (m.id.startsWith('md3-')) subWeight = parseInt(m.id.split('-')[1]) || 0;
    else if (m.id.startsWith('PO')) subWeight = parseInt(m.id.replace('PO', '')) || 0;
    else if (m.id.startsWith('QF')) subWeight = parseInt(m.id.replace('QF', '')) || 0;
    else if (m.id.startsWith('SF')) subWeight = parseInt(m.id.replace('SF', '')) || 0;

    return stageWeight * 1000 + subWeight;
  }, []);

  const sortedFinishedMatches = React.useMemo(() => {
    return [...matches]
      .filter(m => m.status === 'Finished')
      .sort((a, b) => getMatchChronologicalWeight(b) - getMatchChronologicalWeight(a));
  }, [matches, getMatchChronologicalWeight]);

  const getFormForTeam = React.useCallback((teamId: string) => {
    const teamMatches = sortedFinishedMatches.filter(m => 
      m.homeTeam.toLowerCase() === teamId.toLowerCase() || 
      m.awayTeam.toLowerCase() === teamId.toLowerCase()
    );

    const rows = teamMatches.slice(0, 5).map(m => {
      const isHome = m.homeTeam.toLowerCase() === teamId.toLowerCase();
      const opponentId = isHome ? m.awayTeam : m.homeTeam;
      const opponentName = getTeamName(opponentId);
      const teamScore = isHome ? m.homeScore : m.awayScore;
      const oppScore = isHome ? m.awayScore : m.homeScore;

      let outcome: 'W' | 'D' | 'L' = 'D';
      let outcomeCircle = '🟡';
      let detail = '';

      if (teamScore > oppScore) {
        outcome = 'W';
        outcomeCircle = '🟢';
      } else if (teamScore < oppScore) {
        outcome = 'L';
        outcomeCircle = '🔴';
      } else {
        outcome = 'D';
        outcomeCircle = '🟡';
        if (m.homePenalties !== undefined && m.awayPenalties !== undefined) {
          const teamPens = isHome ? m.homePenalties : m.awayPenalties;
          const oppPens = isHome ? m.awayPenalties : m.homePenalties;
          if (teamPens > oppPens) {
            outcomeCircle = '🟢';
            detail = ` (Won ${teamPens}–${oppPens} Pens)`;
          } else {
            outcomeCircle = '🔴';
            detail = ` (Lost ${oppPens}–${teamPens} Pens)`;
          }
        }
      }

      let compDisplay = m.stage || '';
      if (m.id.startsWith('md')) {
        compDisplay = `MD${m.matchday}`;
      } else if (m.id.startsWith('PO')) {
        compDisplay = m.id;
      } else if (m.id.startsWith('QF')) {
        compDisplay = m.id;
      } else if (m.id.startsWith('SF')) {
        compDisplay = m.id;
      } else if (m.id === 'FINAL' || m.id === 'F') {
        compDisplay = 'FINAL';
      }

      return {
        comp: compDisplay,
        opponent: opponentName,
        opponentId: opponentId,
        resultText: `${outcome} ${teamScore}–${oppScore}${detail}`,
        circle: outcomeCircle
      };
    });

    const displayRows = [...rows];
    while (displayRows.length < 5) {
      displayRows.push({
        comp: '—',
        opponent: '—',
        opponentId: '',
        resultText: '—',
        circle: ''
      });
    }

    const activeCircles = rows.map(r => r.circle);

    return { rows: displayRows, formCircles: activeCircles };
  }, [sortedFinishedMatches, getTeamName]);

  const homeForm = React.useMemo(() => getFormForTeam(match.homeTeam), [getFormForTeam, match.matchday, match.homeTeam]);
  const awayForm = React.useMemo(() => getFormForTeam(match.awayTeam), [getFormForTeam, match.matchday, match.awayTeam]);

  const sortedStandings = React.useMemo(() => {
    return [...teams].sort((a, b) => {
      const isDisqA = a.isDisqualified ? 1 : 0;
      const isDisqB = b.isDisqualified ? 1 : 0;
      if (isDisqA !== isDisqB) return isDisqA - isDisqB;

      if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
      const gdA = a.goalDifference !== undefined ? a.goalDifference : ((a.goalsFor || 0) - (a.goalsAgainst || 0));
      const gdB = b.goalDifference !== undefined ? b.goalDifference : ((b.goalsFor || 0) - (b.goalsAgainst || 0));
      if (gdB !== gdA) return gdB - gdA;

      if ((b.goalsFor || 0) !== (a.goalsFor || 0)) return (b.goalsFor || 0) - (a.goalsFor || 0);
      if ((a.goalsAgainst || 0) !== (b.goalsAgainst || 0)) return (a.goalsAgainst || 0) - (b.goalsAgainst || 0);
      if ((a.played || 0) !== (b.played || 0)) return (a.played || 0) - (b.played || 0);
      if ((b.won || 0) !== (a.won || 0)) return (b.won || 0) - (a.won || 0);
      return a.id.toUpperCase().localeCompare(b.id.toUpperCase());
    });
  }, [teams]);

  const getStandingIndex = React.useCallback((teamIdCode: string) => {
    const idx = sortedStandings.findIndex(t => t.id.toLowerCase() === teamIdCode.toLowerCase());
    return idx !== -1 ? idx + 1 : '—';
  }, [sortedStandings]);

  const liveImpactData = React.useMemo(() => {
    const homeId = match.homeTeam.toLowerCase();
    const awayId = match.awayTeam.toLowerCase();

    const simulateRank = (targetTeamId: string) => {
      const simulatedTeams = sortedStandings.map(t => {
        if (t.id.toLowerCase() === targetTeamId) {
          const currentPts = t.points || 0;
          const currentGF = t.goalsFor || 0;
          const currentGA = t.goalsAgainst || 0;
          const currentPlayed = t.played || 0;
          const currentWon = t.won || 0;

          return {
            ...t,
            points: currentPts + 3,
            played: currentPlayed + 1,
            won: currentWon + 1,
            goalsFor: currentGF + 1,
            goalsAgainst: currentGA,
            goalDifference: (currentGF + 1) - currentGA
          };
        } else {
          const otherTeamId = targetTeamId === homeId ? awayId : homeId;
          if (t.id.toLowerCase() === otherTeamId) {
            const currentPts = t.points || 0;
            const currentGF = t.goalsFor || 0;
            const currentGA = t.goalsAgainst || 0;
            const currentPlayed = t.played || 0;
            const currentLost = t.lost || 0;

            return {
              ...t,
              played: currentPlayed + 1,
              lost: currentLost + 1,
              goalsFor: currentGF,
              goalsAgainst: currentGA + 1,
              goalDifference: currentGF - (currentGA + 1)
            };
          }
        }
        return t;
      });

      const sortedSim = [...simulatedTeams].sort((a, b) => {
        const isDisqA = a.isDisqualified ? 1 : 0;
        const isDisqB = b.isDisqualified ? 1 : 0;
        if (isDisqA !== isDisqB) return isDisqA - isDisqB;

        if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
        const gdA = a.goalDifference !== undefined ? a.goalDifference : ((a.goalsFor || 0) - (a.goalsAgainst || 0));
        const gdB = b.goalDifference !== undefined ? b.goalDifference : ((b.goalsFor || 0) - (b.goalsAgainst || 0));
        if (gdB !== gdA) return gdB - gdA;

        if ((b.goalsFor || 0) !== (a.goalsFor || 0)) return (b.goalsFor || 0) - (a.goalsFor || 0);
        if ((a.goalsAgainst || 0) !== (b.goalsAgainst || 0)) return (a.goalsAgainst || 0) - (b.goalsAgainst || 0);
        if ((a.played || 0) !== (b.played || 0)) return (a.played || 0) - (b.played || 0);
        if ((b.won || 0) !== (a.won || 0)) return (b.won || 0) - (a.won || 0);
        return a.id.toUpperCase().localeCompare(b.id.toUpperCase());
      });

      const newIndex = sortedSim.findIndex(t => t.id.toLowerCase() === targetTeamId);
      return newIndex !== -1 ? newIndex + 1 : '—';
    };

    const homeSimRank = simulateRank(homeId);
    const awaySimRank = simulateRank(awayId);

    return {
      homeSimRank,
      awaySimRank
    };
  }, [sortedStandings, match.homeTeam, match.awayTeam]);

  const getQualificationScenario = React.useCallback(() => {
    if (match.stage === 'Playoff Round' || match.id.startsWith('PO')) {
      let opponentText = "the Quarter-finals";
      if (match.id === 'PO4') opponentText = "Anatomy (ANA) in the Quarter-finals";
      else if (match.id === 'PO6') opponentText = "the Quarter-finals";
      
      return `Knockout tie: The winner of this match qualifies directly to face ${opponentText}. In case of a draw at full-time, the tie will be decided by a penalty shootout.`;
    }
    
    if (match.stage === 'Quarter-finals' || match.id.startsWith('QF')) {
      return "Knockout tie: The winner of this match qualifies directly for the Semi-finals. In case of a draw at full-time, the tie will be decided by a penalty shootout.";
    }
    
    if (match.stage === 'Semi-finals' || match.id.startsWith('SF')) {
      return "Knockout tie: The winner of this match qualifies directly for the Final. In case of a draw at full-time, the tie will be decided by a penalty shootout.";
    }
    
    if (match.stage === 'Final' || match.id === 'FINAL' || match.id === 'F' || match.id === 'FT') {
      return "Championship match: The winner of this match is crowned the FUTA Champions League 2026 Champion! In case of a draw at full-time, a penalty shootout will decide the champion.";
    }
    
    const homePos = getStandingIndex(match.homeTeam);
    const awayPos = getStandingIndex(match.awayTeam);
    
    let scenario = "League Phase: Teams are competing for positions in the FCL Standings. ";
    scenario += "The Top 2 teams qualify directly to the Quarter-finals, while teams ranked 3rd to 14th will enter the Playoff Round.";
    
    if (homePos !== '—' && awayPos !== '—') {
      scenario += ` Currently, ${homeTeam.name} is ranked #${homePos} and ${awayTeam.name} is ranked #${awayPos}.`;
      if (liveImpactData) {
        scenario += ` LIVE IMPACT: A win for ${homeTeam.name} would elevate them to #${liveImpactData.homeSimRank} in the standings, while a win for ${awayTeam.name} would hoist them to #${liveImpactData.awaySimRank}.`;
      }
    }
    return scenario;
  }, [match.id, match.stage, match.homeTeam, match.awayTeam, homeTeam.name, awayTeam.name, getStandingIndex, liveImpactData]);

  const topScorersData = React.useMemo(() => {
    const homeTeamId = match.homeTeam.toLowerCase();
    const awayTeamId = match.awayTeam.toLowerCase();

    const homeList = players.filter(p => p.teamId.toLowerCase() === homeTeamId && p.goals > 0)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 3)
      .map(p => ({ name: p.name, goals: p.goals }));

    const awayList = players.filter(p => p.teamId.toLowerCase() === awayTeamId && p.goals > 0)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 3)
      .map(p => ({ name: p.name, goals: p.goals }));

    return { homeList, awayList };
  }, [match.homeTeam, match.awayTeam, players]);

  const goalkeeperCleanSheets = React.useMemo(() => {
    const homeTeamId = match.homeTeam.toLowerCase();
    const awayTeamId = match.awayTeam.toLowerCase();

    const homeGKs = players.filter(p => p.teamId.toLowerCase() === homeTeamId && p.position === 'GK')
      .map(p => ({ name: p.name, cleanSheets: p.cleanSheets || p.clean_sheets || 0 }));
      
    const awayGKs = players.filter(p => p.teamId.toLowerCase() === awayTeamId && p.position === 'GK')
      .map(p => ({ name: p.name, cleanSheets: p.cleanSheets || p.clean_sheets || 0 }));

    return { homeGKs, awayGKs };
  }, [match.homeTeam, match.awayTeam, players]);

  const teamDisciplineAndMedical = React.useMemo(() => {
    const homeTeamId = match.homeTeam.toLowerCase();
    const awayTeamId = match.awayTeam.toLowerCase();

    const currentWeight = getMatchChronologicalWeight(match);
    const prevMatchesList = matches.filter(m => 
      m.status === 'Finished' && getMatchChronologicalWeight(m) < currentWeight
    );
    const prevMatchIds = new Set(prevMatchesList.map(m => m.id));

    const homeYellowCount: Record<string, number> = {};
    const awayYellowCount: Record<string, number> = {};

    cards.forEach(c => {
      if (!prevMatchIds.has(c.matchId)) return;
      
      const pName = c.playerName;
      if (c.teamAbbr.toLowerCase() === homeTeamId && c.type === 'Yellow') {
        homeYellowCount[pName] = (homeYellowCount[pName] || 0) + 1;
      } else if (c.teamAbbr.toLowerCase() === awayTeamId && c.type === 'Yellow') {
        awayYellowCount[pName] = (awayYellowCount[pName] || 0) + 1;
      }
    });

    const homeOneBookingAway = Object.entries(homeYellowCount)
      .filter(([_, count]) => count === 1)
      .map(([name]) => name);

    const awayOneBookingAway = Object.entries(awayYellowCount)
      .filter(([_, count]) => count === 1)
      .map(([name]) => name);

    const homeInjured = players.filter(p => p.teamId.toLowerCase() === homeTeamId && (p.isInactive || p.isFormer))
      .map(p => p.name);

    const awayInjured = players.filter(p => p.teamId.toLowerCase() === awayTeamId && (p.isInactive || p.isFormer))
      .map(p => p.name);

    return {
      homeOneBookingAway,
      awayOneBookingAway,
      homeInjured,
      awayInjured
    };
  }, [matches, match, cards, getMatchChronologicalWeight, players]);

  const headToHeadData = React.useMemo(() => {
    const hId = match.homeTeam.toLowerCase();
    const aId = match.awayTeam.toLowerCase();

    const h2hMatches = matches.filter(m => 
      m.status === 'Finished' &&
      ((m.homeTeam.toLowerCase() === hId && m.awayTeam.toLowerCase() === aId) ||
       (m.homeTeam.toLowerCase() === aId && m.awayTeam.toLowerCase() === hId))
    ).sort((a, b) => getMatchChronologicalWeight(b) - getMatchChronologicalWeight(a)); // sorted newest first

    let played = h2hMatches.length;
    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;
    let homePensWins = 0;
    let awayPensWins = 0;
    let homeGoals = 0;
    let awayGoals = 0;

    h2hMatches.forEach(m => {
      const isHomeForM = m.homeTeam.toLowerCase() === hId;
      const scoreH = isHomeForM ? m.homeScore : m.awayScore;
      const scoreA = isHomeForM ? m.awayScore : m.homeScore;

      homeGoals += scoreH;
      awayGoals += scoreA;

      if (scoreH > scoreA) {
        homeWins++;
      } else if (scoreA > scoreH) {
        awayWins++;
      } else {
        draws++;
        if (m.homePenalties !== undefined && m.awayPenalties !== undefined) {
          const pensH = isHomeForM ? m.homePenalties : m.awayPenalties;
          const pensA = isHomeForM ? m.awayPenalties : m.homePenalties;
          if (pensH > pensA) {
            homePensWins++;
          } else if (pensA > pensH) {
            awayPensWins++;
          }
        }
      }
    });

    return {
      matchesList: h2hMatches,
      played,
      homeWins,
      awayWins,
      draws,
      homePensWins,
      awayPensWins,
      homeGoals,
      awayGoals
    };
  }, [matches, match.homeTeam, match.awayTeam, getMatchChronologicalWeight]);

  const suspensionsData = React.useMemo(() => {
    const homeTeamId = match.homeTeam.toLowerCase();
    const awayTeamId = match.awayTeam.toLowerCase();

    // Get all finished matches sorted chronologically oldest to newest
    const cronMatches = [...matches]
      .filter(m => m.status === 'Finished')
      .sort((a, b) => getMatchChronologicalWeight(a) - getMatchChronologicalWeight(b));

    // Find the chronological weight of the current match
    const currentWeight = getMatchChronologicalWeight(match);

    // Filter matches played by home/away teams BEFORE the current match
    const prevHomeMatches = cronMatches.filter(m => 
      getMatchChronologicalWeight(m) < currentWeight &&
      (m.homeTeam.toLowerCase() === homeTeamId || m.awayTeam.toLowerCase() === homeTeamId)
    );

    const prevAwayMatches = cronMatches.filter(m => 
      getMatchChronologicalWeight(m) < currentWeight &&
      (m.homeTeam.toLowerCase() === awayTeamId || m.awayTeam.toLowerCase() === awayTeamId)
    );

    // Immediate previous match for each team
    const lastHomeMatch = prevHomeMatches[prevHomeMatches.length - 1];
    const lastAwayMatch = prevAwayMatches[prevAwayMatches.length - 1];

    const homeSuspensions: { playerName: string; reason: string }[] = [];
    const awaySuspensions: { playerName: string; reason: string }[] = [];

    // Map of playerName -> cumulative yellow cards (before current match)
    const homeYellows: Record<string, number> = {};
    const awayYellows: Record<string, number> = {};

    // Map of playerName -> got red in last match
    const homeRedInLast = new Set<string>();
    const awayRedInLast = new Set<string>();

    // Process all cards in previous matches
    cards.forEach(c => {
      const cardMatch = matches.find(m => m.id === c.matchId);
      if (!cardMatch || getMatchChronologicalWeight(cardMatch) >= currentWeight) return;

      const isHomeTeam = c.teamAbbr.toLowerCase() === homeTeamId;
      const isAwayTeam = c.teamAbbr.toLowerCase() === awayTeamId;

      if (isHomeTeam) {
        if (c.type === 'Yellow') {
          homeYellows[c.playerName] = (homeYellows[c.playerName] || 0) + 1;
        }
        if (c.type === 'Red' && lastHomeMatch && c.matchId === lastHomeMatch.id) {
          homeRedInLast.add(c.playerName);
        }
      } else if (isAwayTeam) {
        if (c.type === 'Yellow') {
          awayYellows[c.playerName] = (awayYellows[c.playerName] || 0) + 1;
        }
        if (c.type === 'Red' && lastAwayMatch && c.matchId === lastAwayMatch.id) {
          awayRedInLast.add(c.playerName);
        }
      }
    });

    // Check home suspensions (cumulative 2 Yellows or last-match Red)
    Object.keys(homeYellows).forEach(player => {
      if (homeYellows[player] >= 2) {
        homeSuspensions.push({ playerName: player, reason: `Suspended (Accumulated ${homeYellows[player]} Yellow Cards)` });
      }
    });
    homeRedInLast.forEach(player => {
      if (!homeSuspensions.some(s => s.playerName === player)) {
        homeSuspensions.push({ playerName: player, reason: "Suspended (Red Card in previous fixture)" });
      }
    });

    // Check away suspensions
    Object.keys(awayYellows).forEach(player => {
      if (awayYellows[player] >= 2) {
        awaySuspensions.push({ playerName: player, reason: `Suspended (Accumulated ${awayYellows[player]} Yellow Cards)` });
      }
    });
    awayRedInLast.forEach(player => {
      if (!awaySuspensions.some(s => s.playerName === player)) {
        awaySuspensions.push({ playerName: player, reason: "Suspended (Red Card in previous fixture)" });
      }
    });

    return { homeSuspensions, awaySuspensions };
  }, [matches, match, cards, getMatchChronologicalWeight]);

  const getProgressWidths = (h: number, a: number) => {
    const total = h + a;
    if (total === 0) return { homePercent: 50, awayPercent: 50 };
    return {
      homePercent: Math.round((h / total) * 100),
      awayPercent: Math.round((a / total) * 100)
    };
  };

  return (
    <div className="min-h-screen bg-navy text-white pb-32">
      
      {/* Real-time Dynamic Notification Overlay Layer */}
      <div id="toast-overlay" className="fixed top-6 right-6 z-50 flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, x: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="pointer-events-auto w-full border border-white/10 bg-[#0B0F19]/95 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.6)] rounded-2xl p-4 flex gap-3.5 items-start overflow-hidden relative group"
              id={`toast-${toast.id}`}
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${toast.type === 'goal' ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-primary shadow-[0_0_12px_#00E5FF]'}`} />
              
              <div className={`flex-shrink-0 p-2 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center ${toast.type === 'goal' ? 'text-emerald-400' : 'text-primary'}`}>
                {toast.type === 'goal' ? (
                  <Trophy size={18} className="animate-bounce" />
                ) : (
                  <Clock size={18} />
                )}
              </div>

              <div className="flex-grow min-w-0 pr-4 text-left">
                <h4 className="text-[9px] font-black tracking-widest uppercase font-display text-white/40 mb-0.5">
                  {toast.title}
                </h4>
                <p className="text-xs font-sans font-medium text-white/90 leading-relaxed">
                  {toast.message}
                </p>
                {toast.matchId && matches.some(m => m.id === toast.matchId) && (
                  <Link 
                    to={`/matches/${toast.matchId}`}
                    className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-primary hover:text-white transition-colors uppercase tracking-wider font-mono"
                  >
                    <span>View Match Live</span>
                    <span>→</span>
                  </Link>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 text-white/30 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer flex-shrink-0"
                id={`dismiss-${toast.id}`}
              >
                <X size={14} className="stroke-[2.5]" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Upper header */}
      <section className="bg-navy-dark py-4 px-4 border-b border-white/5 mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/fixtures"
            className="px-4 py-2 bg-white/5 border border-white/10 text-xs font-bold font-sans uppercase rounded-xl hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            <span>Fixtures & Results</span>
          </Link>

          <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
            <Radio size={12} />
            <span>FCL Live Center</span>
          </span>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* BIG HERO SCOREBOARD */}
        <div className="relative p-8 md:p-12 rounded-[40px] border border-white/10 bg-gradient-to-br from-navy-dark to-navy/40 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-primary/5 blur-[120px] rounded-full" />
          </div>

          <div className="relative z-10 grid md:grid-cols-3 items-center gap-8 text-center md:text-left">
            
            {/* Home Team */}
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-right flex-1 justify-end">
              <div>
                <h2 className="text-2xl font-display font-black leading-tight uppercase">{homeTeam.name}</h2>
                <p className="text-[10px] font-bold text-white/45 uppercase tracking-widest mt-1">
                  FCL Standings Rank: #{getStandingIndex(match.homeTeam)}
                </p>
                
                {/* Scorers on Home */}
                {homeScorers.length > 0 && (
                  <div className="text-[10px] text-white/60 space-y-0.5 mt-2 font-mono">
                    {homeScorers.map((scorer, idx) => (
                      <div key={idx}>
                        ⚽ {scorer.playerName} {formatMinuteDisplay(scorer.minute)}{scorer.type === 'Penalty' ? ' (P)' : scorer.type === 'Own Goal' ? ' (OG)' : ''}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Penalty Shootout Home */}
                {match.penaltyShootoutHome && match.penaltyShootoutHome.length > 0 && (
                  <div className="text-[10px] text-white/60 space-y-1 mt-4 font-mono border-t border-white/5 pt-2 text-left">
                    <div className="text-[9px] font-bold uppercase text-[#00e5ff] tracking-widest mb-1.5 flex items-center gap-1.5">
                      <span>🎯 Shootout Takers</span>
                    </div>
                    {match.penaltyShootoutHome.map((attempt, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 py-0.5">
                        <span className="w-4 text-center">{attempt.isScored ? '⚽' : '❌'}</span>
                        <span className={attempt.isScored ? 'text-white/90 font-medium' : 'text-white/30 line-through'}>
                          {attempt.playerName}
                        </span>
                        {!attempt.isScored && (
                          <span className="text-[7px] font-black uppercase text-red-400 bg-red-400/10 px-1 py-0.2 rounded tracking-wider border border-red-400/20">
                            Missed
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <TeamLogo teamId={match.homeTeam} logoUrl={homeTeam.logoUrl} size="lg" className="w-20 h-20 object-contain flex-shrink-0" />
            </div>

            {/* Main center score block */}
            <div className="text-center md:border-l md:border-r border-white/10 px-8">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary flex items-center justify-center gap-1 mb-2">
                {match.status === 'Live' ? (
                  <span className="text-red-500 animate-pulse font-mono font-bold flex items-center gap-1">
                    <span className="w-1 px-1 h-3 rounded-full bg-red-500 inline-block" />
                    LIVE • {timer.liveMinute}
                  </span>
                ) : match.status === 'Half Time' ? (
                  <span className="text-yellow-400 font-mono font-bold">
                    HALF TIME • {timer.liveMinute && timer.liveMinute.startsWith('HT') ? timer.liveMinute.replace("HT ", "") : "10:00"}
                  </span>
                ) : match.walkover ? (
                  <span className="text-amber-500 font-mono font-bold">ADMINISTRATIVE WALKOVER</span>
                ) : match.status === 'Finished' ? (
                  <span className="text-white/40 font-mono font-bold">FT - FULL TIME</span>
                ) : match.status === 'Interrupted' ? (
                  <span className="text-amber-500 font-mono font-bold flex items-center justify-center gap-1.5 animate-pulse">
                    🟠 INTERRUPTED (50')
                  </span>
                ) : (
                  <span className="text-white/30 font-bold">{match.time} • SCHEDULED</span>
                )}
              </span>

              <div className="text-6xl font-display italic font-black text-white px-2 tracking-widest drop-shadow-lg">
                {isUpcoming ? 'VS' : `${match.homeScore} - ${match.awayScore}`}
              </div>

              {(match.homePenalties !== undefined && match.awayPenalties !== undefined) && (
                <div className="mt-3 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 inline-block text-amber-400 font-display font-black text-xs uppercase tracking-wider">
                  {match.homeTeam} {match.homePenalties}–{match.awayPenalties} {match.awayTeam} (Penalties)
                </div>
              )}

              <div className="text-xs text-white/40 font-bold uppercase mt-4 tracking-wider space-y-1 font-sans">
                <div>🏟️ Stadium: {match.venue}</div>
                {match.referee && (
                  <div className="text-primary text-[10px] font-black tracking-widest uppercase mt-1">
                    👮 Referee: {match.referee}
                  </div>
                )}
                {match.note && (
                  <div className="text-amber-400 text-[10px] font-black tracking-widest uppercase mt-1">
                    ⚠️ Note: {match.note}
                  </div>
                )}
                {match.manOfTheMatch && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-black text-[9px] uppercase tracking-widest rounded-full shadow-sm">
                    🏅 MOTM: {match.manOfTheMatch}
                  </div>
                )}
              </div>

              <div className="text-[9px] text-white/20 uppercase font-bold tracking-widest mt-1.5 leading-normal">
                Officially Administered Event
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-4 text-center md:text-left flex-1 justify-start">
              <TeamLogo teamId={match.awayTeam} logoUrl={awayTeam.logoUrl} size="lg" className="w-20 h-20 object-contain flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-display font-black leading-tight uppercase">{awayTeam.name}</h2>
                <p className="text-[10px] font-bold text-white/45 uppercase tracking-widest mt-1">
                  FCL Standings Rank: #{getStandingIndex(match.awayTeam)}
                </p>
                
                {/* Scorers on Away */}
                {awayScorers.length > 0 && (
                  <div className="text-[10px] text-white/60 space-y-0.5 mt-2 font-mono">
                    {awayScorers.map((scorer, idx) => (
                      <div key={idx}>
                        ⚽ {scorer.playerName} {formatMinuteDisplay(scorer.minute)}{scorer.type === 'Penalty' ? ' (P)' : scorer.type === 'Own Goal' ? ' (OG)' : ''}
                      </div>
                    ))}
                  </div>
                )}

                {/* Penalty Shootout Away */}
                {match.penaltyShootoutAway && match.penaltyShootoutAway.length > 0 && (
                  <div className="text-[10px] text-white/60 space-y-1 mt-4 font-mono border-t border-white/5 pt-2 text-left">
                    <div className="text-[9px] font-bold uppercase text-[#00e5ff] tracking-widest mb-1.5 flex items-center gap-1.5">
                      <span>🎯 Shootout Takers</span>
                    </div>
                    {match.penaltyShootoutAway.map((attempt, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 py-0.5">
                        <span className="w-4 text-center">{attempt.isScored ? '⚽' : '❌'}</span>
                        <span className={attempt.isScored ? 'text-white/90 font-medium' : 'text-white/30 line-through'}>
                          {attempt.playerName}
                        </span>
                        {!attempt.isScored && (
                          <span className="text-[7px] font-black uppercase text-red-400 bg-red-400/10 px-1 py-0.2 rounded tracking-wider border border-red-400/20">
                            Missed
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* 🏆 QUALIFICATION SCENARIO & RULESET BANNER */}
        <div className="glass border border-[#00E5FF]/20 rounded-[28px] p-5 bg-[#00E5FF]/5 text-left flex items-start gap-4 shadow-lg mb-8">
          <div className="p-2.5 rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] shrink-0">
            <Trophy size={20} className="animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-[#00E5FF] tracking-widest font-mono">
              FUTA Champions League • Tournament Qualification Scenario
            </span>
            <p className="text-xs text-white/85 leading-relaxed font-medium">
              {getQualificationScenario()}
            </p>
          </div>
        </div>

        {match.walkover && (
          <div className="glass border border-amber-500/30 rounded-[32px] p-6 bg-amber-500/5 mb-8 text-left max-w-4xl mx-auto">
            <h3 className="text-lg font-display font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 pb-3 border-b border-white/5 mb-4">
              <span>⚠️ ADMINISTRATIVE WALKOVER AWARDED</span>
            </h3>
            <p className="text-sm font-sans font-medium text-white/85 leading-relaxed">
              This fixture was officially decided via an administrative walkover. Under competition rules, 
              <strong> {match.homeScore === 3 ? homeTeam.name : awayTeam.name}</strong> has been awarded a <strong>3-0 win</strong> over 
              <strong> {match.homeScore === 3 ? awayTeam.name : homeTeam.name}</strong>.
            </p>
            <p className="text-xs font-mono text-white/40 mt-3 leading-normal">
              Note: No individual player statistics (goals, assists, cards, clean sheets, or appearances) are recorded for walkover fixtures. {match.homeScore === 3 ? match.homeTeam : match.awayTeam} has been awarded 3 League Phase coefficient points, while {match.homeScore === 3 ? match.awayTeam : match.homeTeam} receives 0.
            </p>
          </div>
        )}

        {/* 📊 TEAM FORM & 🤝 HEAD-TO-HEAD PRE-MATCH ANALYSIS SECTION */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          
          {/* 📊 TEAM FORM (LAST FIVE MATCHES) CARD */}
          <div className="glass border border-white/10 rounded-[32px] p-6 bg-navy/60 text-left flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-display font-black uppercase tracking-wider text-white mb-6 flex items-center gap-2 pb-4 border-b border-white/5">
                <Sparkles size={15} className="text-primary" />
                <span>📊 TEAM FORM (LAST FIVE COMPETITIVE MATCHES)</span>
              </h3>

              <div className="space-y-6">
                {/* Home Team Form */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-2">
                      <TeamLogo teamId={match.homeTeam} logoUrl={homeTeam.logoUrl} size="sm" className="w-5 h-5 object-contain" />
                      <span>{homeTeam.name}</span>
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider mr-1">Form:</span>
                      {homeForm.formCircles.length === 0 ? (
                        <span className="text-[10px] text-white/30 italic">No matches played</span>
                      ) : (
                        homeForm.formCircles.map((circle, idx) => (
                          <span 
                            key={idx} 
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] ${
                              circle === '🟢' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              circle === '🟡' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                            title={circle === '🟢' ? 'Win' : circle === '🟡' ? 'Draw' : 'Loss'}
                          >
                            {circle === '🟢' ? 'W' : circle === '🟡' ? 'D' : 'L'}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01]">
                    <table className="w-full text-left text-[11px] font-sans">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/5 text-[8px] font-black uppercase tracking-widest text-white/30">
                          <th className="py-2 px-3">Comp</th>
                          <th className="py-2 px-3">Opponent</th>
                          <th className="py-2 px-3 text-right">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/80">
                        {homeForm.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02]">
                            <td className="py-2 px-3 font-mono font-bold text-[10px] text-white/50">{row.comp}</td>
                            <td className="py-2 px-3 font-medium text-white/80">{row.opponent}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-white/95">
                              <span className="inline-flex items-center gap-1.5">
                                <span>{row.resultText}</span>
                                {row.circle && (
                                  <span className={`w-2 h-2 rounded-full ${
                                    row.circle === '🟢' ? 'bg-emerald-400' :
                                    row.circle === '🟡' ? 'bg-yellow-400' : 'bg-red-400'
                                  }`} />
                                )}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Away Team Form */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-yellow-400 tracking-wider flex items-center gap-2">
                      <TeamLogo teamId={match.awayTeam} logoUrl={awayTeam.logoUrl} size="sm" className="w-5 h-5 object-contain" />
                      <span>{awayTeam.name}</span>
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider mr-1">Form:</span>
                      {awayForm.formCircles.length === 0 ? (
                        <span className="text-[10px] text-white/30 italic">No matches played</span>
                      ) : (
                        awayForm.formCircles.map((circle, idx) => (
                          <span 
                            key={idx} 
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] ${
                              circle === '🟢' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              circle === '🟡' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                            title={circle === '🟢' ? 'Win' : circle === '🟡' ? 'Draw' : 'Loss'}
                          >
                            {circle === '🟢' ? 'W' : circle === '🟡' ? 'D' : 'L'}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01]">
                    <table className="w-full text-left text-[11px] font-sans">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/5 text-[8px] font-black uppercase tracking-widest text-white/30">
                          <th className="py-2 px-3">Comp</th>
                          <th className="py-2 px-3">Opponent</th>
                          <th className="py-2 px-3 text-right">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/80">
                        {awayForm.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02]">
                            <td className="py-2 px-3 font-mono font-bold text-[10px] text-white/50">{row.comp}</td>
                            <td className="py-2 px-3 font-medium text-white/80">{row.opponent}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-white/95">
                              <span className="inline-flex items-center gap-1.5">
                                <span>{row.resultText}</span>
                                {row.circle && (
                                  <span className={`w-2 h-2 rounded-full ${
                                    row.circle === '🟢' ? 'bg-emerald-400' :
                                    row.circle === '🟡' ? 'bg-yellow-400' : 'bg-red-400'
                                  }`} />
                                )}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex gap-4 text-[9px] font-mono text-white/40">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> 🟢 Win / Shootout Win
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" /> 🟡 Draw
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> 🔴 Loss / Shootout Loss
              </span>
            </div>
          </div>

          {/* 🤝 HEAD-TO-HEAD CARD */}
          <div className="glass border border-white/10 rounded-[32px] p-6 bg-navy/60 text-left flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-display font-black uppercase tracking-wider text-white mb-6 flex items-center gap-2 pb-4 border-b border-white/5">
                <Users size={15} className="text-primary" />
                <span>🤝 HEAD-TO-HEAD HISTORIC MEETINGS</span>
              </h3>

              <div className="space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-white/60 mb-2 flex justify-between items-center">
                  <span>PREVIOUS FCL MEETINGS</span>
                  <span className="text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                    {headToHeadData.played} Played
                  </span>
                </div>

                {headToHeadData.matchesList.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl text-white/40 italic font-medium text-xs">
                    No previous FCL competitive meetings recorded.<br />
                    <span className="text-[10px] text-primary not-italic font-black uppercase tracking-widest mt-1 block">First Ever Meeting</span>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] max-h-[140px] overflow-y-auto">
                    <table className="w-full text-left text-[11px] font-sans">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/5 text-[8px] font-black uppercase tracking-widest text-white/30">
                          <th className="py-2 px-3">Season</th>
                          <th className="py-2 px-3">Stage</th>
                          <th className="py-2 px-3">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/80">
                        {headToHeadData.matchesList.map((m, idx) => {
                          let stageDisplay = m.stage || '';
                          if (m.id.startsWith('md')) stageDisplay = `MD${m.matchday}`;
                          else if (m.id.startsWith('PO')) stageDisplay = m.id;
                          else if (m.id.startsWith('QF')) stageDisplay = m.id;

                          // Format outcome nicely
                          const isHCurrent = m.homeTeam.toLowerCase() === match.homeTeam.toLowerCase();
                          const homeWonPens = m.homePenalties !== undefined && m.awayPenalties !== undefined && m.homePenalties > m.awayPenalties;
                          const penaltyWinner = homeWonPens ? m.homeTeam : m.awayTeam;
                          const resultDisplay = `${isHCurrent ? m.homeTeam : m.awayTeam} ${m.homeScore}–${m.awayScore} ${isHCurrent ? m.awayTeam : m.homeTeam}${
                            (m.homePenalties !== undefined && m.awayPenalties !== undefined) 
                              ? ` (${penaltyWinner} won ${m.homePenalties}–${m.awayPenalties} on penalties)` 
                              : ''
                          }`;

                          return (
                            <tr key={idx} className="hover:bg-white/[0.02]">
                              <td className="py-2 px-3 font-mono font-bold text-[10px] text-white/50">2026</td>
                              <td className="py-2 px-3 font-semibold text-primary">{stageDisplay}</td>
                              <td className="py-2 px-3 font-mono font-bold text-white/90">{resultDisplay}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Overall H2H stats block */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">
                    OVERALL HEAD-TO-HEAD STATISTICS
                  </span>

                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1.5 bg-white/[0.01] border border-white/5 p-3 rounded-2xl">
                      <div className="flex justify-between items-center text-white/60">
                        <span>Played:</span>
                        <span className="text-white font-black">{headToHeadData.played}</span>
                      </div>
                      <div className="flex justify-between items-center text-white/60">
                        <span>{match.homeTeam} Wins:</span>
                        <span className="text-emerald-400 font-black">{headToHeadData.homeWins}</span>
                      </div>
                      <div className="flex justify-between items-center text-white/60">
                        <span>{match.awayTeam} Wins:</span>
                        <span className="text-yellow-400 font-black">{headToHeadData.awayWins}</span>
                      </div>
                      <div className="flex justify-between items-center text-white/60">
                        <span>Draws:</span>
                        <span className="text-white/80 font-black">{headToHeadData.draws}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-white/[0.01] border border-white/5 p-3 rounded-2xl">
                      <div className="text-[8px] font-black text-white/30 uppercase tracking-widest pb-0.5 border-b border-white/5">
                        Penalty Shootouts
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-white/60 pt-0.5">
                        <span>{match.homeTeam} Wins:</span>
                        <span className="text-emerald-400 font-black">{headToHeadData.homePensWins}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-white/60">
                        <span>{match.awayTeam} Wins:</span>
                        <span className="text-yellow-400 font-black">{headToHeadData.awayPensWins}</span>
                      </div>
                      
                      <div className="text-[8px] font-black text-white/30 uppercase tracking-widest pb-0.5 border-b border-white/5 pt-1.5">
                        Goals Scored
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-white/60 pt-0.5">
                        <span>{match.homeTeam}:</span>
                        <span className="text-white font-black">{headToHeadData.homeGoals}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-white/60">
                        <span>{match.awayTeam}:</span>
                        <span className="text-white font-black">{headToHeadData.awayGoals}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* THREE COLUMN GRID: STATS, TIMELINE & LINEUPS, COMMENTARY & REPORT */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* COL 1: MATCH STATISTICS & OFFICIATING DETAILS */}
          <div className="space-y-8 lg:col-span-1">
            <div className="glass border border-white/10 rounded-[32px] p-6 bg-navy/60">
            <h3 className="text-sm font-display font-black uppercase tracking-wider text-white mb-6 flex items-center gap-2 pb-4 border-b border-b-white/5">
              <Award size={15} className="text-primary" />
              <span>MATCH DAY SCIENTIFIC METRICS</span>
            </h3>

            {isUpcoming ? (
              <div className="text-center py-20 text-white/35">
                <Clock className="w-12 h-12 mx-auto text-white/15 mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest">Awaiting Kickoff</p>
                <p className="text-[10px] text-white/20 px-4 mt-2 leading-relaxed">Statistics will generate proportionally as soon as match begins.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Shorthand Stat Bars */}
                {([
                  { label: '🚩 CORNER KICKS', home: stats.cornersHome, away: stats.cornersAway },
                  { label: '🟨 YELLOW WARNINGS', home: stats.yellowCardsHome, away: stats.yellowCardsAway },
                  { label: '🟥 RED EXPULSIONS', home: stats.redCardsHome, away: stats.redCardsAway },
                  { label: '🔭 OFFSIDE RULINGS', home: stats.offsidesHome ?? 0, away: stats.offsidesAway ?? 0 },
                  { label: '⚠️ SQUAD FOULS', home: stats.foulsHome, away: stats.foulsAway },
                  { label: '🎙️ FREE KICKS AWARDED', home: stats.freeKicksHome ?? 0, away: stats.freeKicksAway ?? 0 }
                ] as const).map((statRow, idx) => {
                  const widths = getProgressWidths(statRow.home, statRow.away);
                  return (
                    <div key={idx} className="space-y-1.5 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="font-mono font-black text-white/90">{statRow.home}</span>
                        <span className="text-[8px] tracking-widest uppercase text-white/30">{statRow.label}</span>
                        <span className="font-mono font-black text-white/90">{statRow.away}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 flex overflow-hidden">
                        <div style={{ width: `${widths.homePercent}%` }} className="bg-primary/90 h-full transition-all duration-500" />
                        <div style={{ width: `${widths.awayPercent}%` }} className="bg-yellow-400/90 h-full transition-all duration-500" />
                      </div>
                    </div>
                  );
                })}

                {/* Player Sanctions Section with explicit Yellow/Red card tracking log */}
                <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                    <span>🎴 TOURNAMENT SANCTIONS BOOK</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500 block mb-2">
                        🟨 Yellow Cards ({matchCards.filter(c => c.type === 'Yellow').length})
                      </span>
                      <div className="space-y-2 bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
                        {matchCards.filter(c => c.type === 'Yellow').length === 0 ? (
                          <span className="text-[10px] text-white/30 italic block">No bookings active</span>
                        ) : (
                          matchCards.filter(c => c.type === 'Yellow').map((c, idx) => (
                            <div key={idx} className="text-white/80 flex justify-between">
                              <span>🟨 {c.playerName}</span>
                              <span className="text-yellow-500 ml-1.5">— {formatMinuteDisplay(c.minute)}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-red-500 block mb-2">
                        🟥 Red Cards ({matchCards.filter(c => c.type !== 'Yellow').length})
                      </span>
                      <div className="space-y-2 bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
                        {matchCards.filter(c => c.type !== 'Yellow').length === 0 ? (
                          <span className="text-[10px] text-white/30 italic block">No red cards recorded</span>
                        ) : (
                          matchCards.filter(c => c.type !== 'Yellow').map((c, idx) => (
                            <div key={idx} className="text-white/85 flex justify-between">
                              <span>🟥 {c.playerName}</span>
                              <span className="text-red-500 ml-1.5">— {formatMinuteDisplay(c.minute)}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* Official match referee & rules panel card */}
            {match.referee && (
              <div className="glass border border-[#00e5ff]/20 rounded-[32px] p-6 bg-[#00e5ff]/5 space-y-5 text-left">
                <h3 className="text-sm font-display font-black uppercase tracking-wider text-white flex items-center gap-2 pb-4 border-b border-white/5">
                  <ShieldCheck size={16} className="text-[#00e5ff]" />
                  <span>OFFICIATING & SUPERVISION</span>
                </h3>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3.5">
                  <div>
                    <span className="text-[8px] text-[#00e5ff] font-bold tracking-widest uppercase block mb-1">OFFICIAL REFEREE</span>
                    <p className="font-sans font-black text-white text-base">{match.referee}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
                    {match.refereeAssigned && (
                      <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        <span className="text-emerald-400">✔</span>
                        <span>Referee Assigned</span>
                      </div>
                    )}
                    {match.matchApproved && (
                      <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        <span className="text-emerald-400">✔</span>
                        <span>Match Approved for Officiating</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {match.officialsPanel && match.officialsPanel.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="text-[9px] text-white/50 font-bold tracking-widest uppercase block">MATCH OFFICIALS PANEL</span>
                    <ul className="space-y-2">
                      {match.officialsPanel.map((std, index) => (
                        <li key={index} className="flex gap-2.5 text-[11px] font-semibold text-white/70 leading-relaxed font-sans">
                          <span className="text-[#00e5ff] font-bold">•</span>
                          <span>{std}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="pt-2 border-t border-white/5 text-[9px] text-white/30 font-semibold uppercase tracking-wider">
                  STATUS: ✔ REFEREE ASSIGNED | ✔ MATCH APPROVED
                </div>
              </div>
            )}

            {/* MATCH CLOCK CONFIGURATION & EXPECTED TIMELINE CARD */}
            <div className="glass border border-white/10 rounded-[32px] p-6 bg-navy/60 space-y-5 text-left">
              <h3 className="text-sm font-display font-black uppercase tracking-wider text-white flex items-center gap-2 pb-4 border-b border-white/5">
                <Clock size={16} className="text-primary" />
                <span>OFFICIAL CLOCK CONFIGURATION</span>
              </h3>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3.5">
                <span className="text-[9px] text-primary font-bold tracking-widest uppercase block border-b border-white/5 pb-1">MATCH SCHEDULING RULESET</span>
                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono leading-relaxed text-white/50">
                  <div>
                    <span className="text-white font-bold block">First Half Kick-off</span>
                    <span className="text-primary text-xs font-black">1:30 PM</span>
                  </div>
                  <div>
                    <span className="text-white font-bold block">First Half Duration</span>
                    <span className="text-primary text-xs font-black">30 Minutes</span>
                  </div>
                  <div>
                    <span className="text-white font-bold block">Half-Time Break</span>
                    <span className="text-primary text-xs font-black">10 Minutes</span>
                  </div>
                  <div>
                    <span className="text-white font-bold block">Second Half Duration</span>
                    <span className="text-primary text-xs font-black">30 Minutes</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/5 text-[9px] text-[#00e5ff] font-bold uppercase tracking-wider leading-relaxed">
                  👮 Additional Time and breaks determined solely by the Match Commissioner / Referee panel as necessary.
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-4 space-y-3 mb-1">
                <span className="text-[9px] text-primary font-bold tracking-widest uppercase block border-b border-primary/10 pb-1">EXPECTED LIVE TIMELINE</span>
                <div className="space-y-2 text-[11px] font-sans">
                  <div className="flex justify-between items-center bg-white/[0.03] p-1.5 px-2.5 rounded-lg">
                    <span className="text-white/60 font-medium">🕒 First Half</span>
                    <span className="font-mono font-black text-white">1:30 PM – 2:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/[0.01] p-1.5 px-2.5 rounded-lg border border-dashed border-white/5">
                    <span className="text-white/40 font-medium">☕ Half-Time Break</span>
                    <span className="font-mono font-bold text-white/50">2:00 PM – 2:10 PM</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/[0.03] p-1.5 px-2.5 rounded-lg">
                    <span className="text-white/60 font-medium">🕒 Second Half</span>
                    <span className="font-mono font-black text-white">2:10 PM – 2:40 PM</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/[0.01] p-1.5 px-2.5 rounded-lg border border-dashed border-white/5">
                    <span className="text-white/40 font-medium">✨ Additional Time</span>
                    <span className="font-mono font-bold text-yellow-500 text-[9px] uppercase tracking-wider">Pending Decision</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COL 2: TIMELINE SYSTEM & SQUAD LINEUPS */}
          <div className="space-y-8 lg:col-span-1">
            
            {/* Timeline component */}
            <div className="glass border border-white/10 rounded-[32px] p-6 bg-navy/60">
              <h3 className="text-sm font-display font-black uppercase tracking-wider text-white mb-6 flex items-center gap-2 pb-4 border-b border-b-white/5">
                <List size={15} className="text-primary" />
                <span>OFFICIAL TIMELINE RECORD</span>
              </h3>

              {timelineEvents.length === 0 ? (
                <div className="text-center py-16 text-white/30 border border-dashed border-white/15 rounded-2xl">
                  <p className="text-xs font-bold uppercase tracking-widest">No major events yet</p>
                  <p className="text-[10px] mt-1.5 leading-normal text-white/20">The timeline is automatically updated in real time as events transpire.</p>
                </div>
              ) : (
                <div className="relative pl-6 border-l border-white/10 space-y-6">
                  {timelineEvents.map((ev, i) => (
                    <div key={i} className="relative text-xs">
                      <span className="absolute -left-9.5 top-0 w-[30px] h-6 rounded-full bg-navy border border-white/10 text-primary flex items-center justify-center font-mono font-bold text-[9px]">
                        {formatMinuteDisplay(ev.minute)}
                      </span>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <p className="text-white/80 font-bold leading-normal">{ev.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lineups displays */}
            <div className="glass border border-white/10 rounded-[32px] p-6 bg-navy/60 space-y-6">
              <h3 className="text-sm font-display font-black uppercase tracking-wider text-white flex items-center justify-between pb-4 border-b border-b-white/5">
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-primary" />
                  <span>COMBAT SQUAD SATELLITE</span>
                </div>
                {lineups[match.id] && (
                  <span className="text-[9px] font-black tracking-widest font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase">
                    ACTIVE ROSTER
                  </span>
                )}
              </h3>

              {lineups[match.id] ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Home starting */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black tracking-widest uppercase text-primary font-display">
                          {match.homeTeam} XI
                        </span>
                        <span className="text-[8px] font-mono font-bold text-white/30">
                          {lineups[match.id].home.formation}
                        </span>
                      </div>
                      <div className="space-y-1.5 font-sans">
                        {Object.entries(lineups[match.id].home.players).map(([pos, pid]) => {
                          const playerObj = players.find(p => p.id === pid);
                          const isCaptain = lineups[match.id].home.captainId === pid;
                          return (
                            <div key={pos} className="bg-white/[0.02] hover:bg-white/[0.04] p-1.5 px-3 rounded-xl text-[10px] text-white/80 flex items-center justify-between gap-2 border border-white/5 transition-all">
                              <div className="flex items-center gap-2 min-w-0 truncate font-sans">
                                <span className="text-primary font-mono font-bold tracking-wider shrink-0 w-8">{pos}</span>
                                <div className="flex flex-col min-w-0">
                                  <span className="truncate font-medium text-white/90">
                                    {playerObj ? playerObj.name : pid}
                                  </span>
                                  {playerObj?.regNumber && (
                                    <span className="text-[7.5px] font-mono text-white/35 tracking-wider uppercase">
                                      {playerObj.regNumber}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isCaptain && (
                                <span className="text-[7px] font-black bg-yellow-500/20 text-yellow-400 border border-yellow-500/35 px-1 py-0.2 rounded font-mono uppercase tracking-widest shrink-0 animate-pulse">
                                  C
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Away starting */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black tracking-widest uppercase text-yellow-400 font-display">
                          {match.awayTeam} XI
                        </span>
                        <span className="text-[8px] font-mono font-bold text-white/30">
                          {lineups[match.id].away.formation}
                        </span>
                      </div>
                      {match.id === 'PO4' && match.awayTeam === 'MCB' && !isMcbReleased() ? (
                        <div className="bg-yellow-500/5 border border-yellow-500/15 p-4 rounded-2xl text-center space-y-2 py-8">
                          <Clock size={20} className="mx-auto text-yellow-400 animate-pulse" />
                          <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest leading-normal">
                            MCB Starting XI will be released at 2:30 PM.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 font-sans">
                          {Object.entries(lineups[match.id].away.players).map(([pos, pid]) => {
                            const playerObj = players.find(p => p.id === pid);
                            const isCaptain = lineups[match.id].away.captainId === pid;
                            return (
                              <div key={pos} className="bg-white/[0.02] hover:bg-white/[0.04] p-1.5 px-3 rounded-xl text-[10px] text-white/80 flex items-center justify-between gap-2 border border-white/5 transition-all">
                                <div className="flex items-center gap-2 min-w-0 truncate font-sans">
                                  <span className="text-yellow-400 font-mono font-bold tracking-wider shrink-0 w-8">{pos}</span>
                                  <div className="flex flex-col min-w-0">
                                    <span className="truncate font-medium text-white/90">
                                      {playerObj ? playerObj.name : pid}
                                    </span>
                                    {playerObj?.regNumber && (
                                      <span className="text-[7.5px] font-mono text-white/35 tracking-wider uppercase">
                                        {playerObj.regNumber}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {isCaptain && (
                                  <span className="text-[7px] font-black bg-yellow-500/20 text-yellow-400 border border-yellow-500/35 px-1 py-0.2 rounded font-mono uppercase tracking-widest shrink-0 animate-pulse">
                                    C
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bench Roster */}
                  <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-[9px] font-sans">
                    <div className="space-y-1.5">
                      <span className="font-bold tracking-wider text-white/40 block pb-1 uppercase font-display">SUBS / BENCH</span>
                      <div className="flex flex-wrap gap-1 leading-normal">
                        {lineups[match.id].home.bench.map((benchPlayer, idx) => {
                          const resolvedName = players.find(p => p.id === benchPlayer)?.name || benchPlayer;
                          return (
                            <span key={idx} className="bg-white/[0.02] border border-white/5 text-white/60 px-2 py-1 rounded-sm text-[9px]">
                              {resolvedName}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-bold tracking-wider text-white/40 block pb-1 uppercase font-display">SUBS / BENCH</span>
                      {match.id === 'PO4' && match.awayTeam === 'MCB' && !isMcbReleased() ? (
                        <div className="bg-white/[0.01] border border-white/5 text-white/30 text-[9px] p-3 rounded-xl italic text-center">
                          Bench rosters are locked until release.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1 leading-normal">
                          {lineups[match.id].away.bench.map((benchPlayer, idx) => {
                            const resolvedName = players.find(p => p.id === benchPlayer)?.name || benchPlayer;
                            return (
                              <span key={idx} className="bg-white/[0.02] border border-white/5 text-white/60 px-2 py-1 rounded-sm text-[9px]">
                                {resolvedName}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {/* Home starting */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black tracking-widest uppercase text-primary font-display">{match.homeTeam} PREDICTED XI (PENDING CONFIRMATION)</span>
                    <div className="space-y-1">
                      {['GK', 'LB', 'CB1', 'CB2', 'RB', 'LW', 'ST', 'RW'].map(s => (
                        <div key={s} className="bg-white/5 p-1 px-2 rounded font-mono text-[10px] text-white/70 truncate border border-white/5">
                          <span className="text-primary font-bold mr-1.5">{s}</span>
                          Player {s === 'GK' ? '1' : s === 'LB' ? '2' : s === 'CB1' ? '3' : '4'}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Away starting */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black tracking-widest uppercase text-yellow-400 font-display">{match.awayTeam} PREDICTED XI (PENDING CONFIRMATION)</span>
                    <div className="space-y-1">
                      {['GK', 'LB', 'CB1', 'CB2', 'RB', 'LM', 'CM1', 'RM', 'ST1'].map(s => (
                        <div key={s} className="bg-white/5 p-1 px-2 rounded font-mono text-[10px] text-white/70 truncate border border-white/5">
                          <span className="text-yellow-400 font-bold mr-1.5">{s}</span>
                          Player {s === 'GK' ? '12' : s === 'LB' ? '13' : '14'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Combined Medical, Disciplinary & Leaderboards section */}
              <div className="pt-5 border-t border-white/5 mt-5 space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase text-red-400 tracking-widest block font-mono mb-3">
                    🏥 TEAM DISCIPLINARY & MEDICAL REPORT
                  </span>
                  
                  <div className="space-y-4">
                    {/* 1. SUSPENDED / BANNED PLAYERS */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block">
                        🚨 Active Disciplinary Bans
                      </span>
                      {(suspensionsData.homeSuspensions.length === 0 && suspensionsData.awaySuspensions.length === 0) ? (
                        <p className="text-[9px] text-white/35 italic">
                          No active suspensions or bans recorded for either squad.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {suspensionsData.homeSuspensions.map((susp, idx) => (
                            <div key={idx} className="bg-red-500/5 border border-red-500/10 p-2 rounded-lg text-[9.5px] flex justify-between items-center gap-2">
                              <span className="font-bold text-white/90">{susp.playerName} ({match.homeTeam})</span>
                              <span className="text-[8px] font-bold text-red-400 font-mono text-right">{susp.reason}</span>
                            </div>
                          ))}
                          {suspensionsData.awaySuspensions.map((susp, idx) => (
                            <div key={idx} className="bg-red-500/5 border border-red-500/10 p-2 rounded-lg text-[9.5px] flex justify-between items-center gap-2">
                              <span className="font-bold text-white/90">{susp.playerName} ({match.awayTeam})</span>
                              <span className="text-[8px] font-bold text-red-400 font-mono text-right">{susp.reason}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 2. PLAYERS ONE BOOKING AWAY FROM BAN */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block">
                        🟨 One Yellow Card From Suspension
                      </span>
                      {(teamDisciplineAndMedical.homeOneBookingAway.length === 0 && teamDisciplineAndMedical.awayOneBookingAway.length === 0) ? (
                        <p className="text-[9px] text-white/35 italic">
                          No players are currently one warning away from suspension.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {teamDisciplineAndMedical.homeOneBookingAway.map((name, idx) => (
                            <div key={idx} className="bg-yellow-500/5 border border-yellow-500/10 p-2 rounded-lg text-[9.5px] flex justify-between items-center gap-2">
                              <span className="font-bold text-white/90">{name} ({match.homeTeam})</span>
                              <span className="text-[8.5px] font-bold text-yellow-400 font-mono">1 Yellow Card (Suspension on next booking)</span>
                            </div>
                          ))}
                          {teamDisciplineAndMedical.awayOneBookingAway.map((name, idx) => (
                            <div key={idx} className="bg-yellow-500/5 border border-yellow-500/10 p-2 rounded-lg text-[9.5px] flex justify-between items-center gap-2">
                              <span className="font-bold text-white/90">{name} ({match.awayTeam})</span>
                              <span className="text-[8.5px] font-bold text-yellow-400 font-mono">1 Yellow Card (Suspension on next booking)</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 3. INJURY & AVAILABILITY REPORT */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block">
                        🤕 Medical & Availability Report
                      </span>
                      {(teamDisciplineAndMedical.homeInjured.length === 0 && teamDisciplineAndMedical.awayInjured.length === 0) ? (
                        <p className="text-[9px] text-white/35 italic">
                          No medical exclusions or long-term unavailable players listed.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {teamDisciplineAndMedical.homeInjured.map((name, idx) => (
                            <div key={idx} className="bg-white/[0.02] border border-white/5 p-2 rounded-lg text-[9.5px] flex justify-between items-center gap-2">
                              <span className="font-medium text-white/70">{name} ({match.homeTeam})</span>
                              <span className="text-[8px] font-bold text-white/40 font-mono uppercase">Inactive / Out</span>
                            </div>
                          ))}
                          {teamDisciplineAndMedical.awayInjured.map((name, idx) => (
                            <div key={idx} className="bg-white/[0.02] border border-white/5 p-2 rounded-lg text-[9.5px] flex justify-between items-center gap-2">
                              <span className="font-medium text-white/70">{name} ({match.awayTeam})</span>
                              <span className="text-[8px] font-bold text-white/40 font-mono uppercase">Inactive / Out</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SCORERS & GOALKEEPERS LEADERBOARD BOX */}
                <div className="pt-5 border-t border-white/5 space-y-4">
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest block font-mono">
                    📊 FIXTURE METRICS & LEADERBOARD
                  </span>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Top Scorers */}
                    <div className="space-y-2 bg-white/[0.01] border border-white/5 p-3 rounded-2xl">
                      <span className="text-[8.5px] font-bold text-white/40 uppercase tracking-wider block pb-1 border-b border-white/5">
                        ⚽ Top Squad Scorers
                      </span>
                      
                      <div className="space-y-1.5">
                        <span className="text-[7.5px] font-mono text-primary font-bold block uppercase">{match.homeTeam} Goals:</span>
                        {topScorersData.homeList.length === 0 ? (
                          <span className="text-[8px] text-white/30 italic block">No goals recorded</span>
                        ) : (
                          topScorersData.homeList.map((sc, idx) => (
                            <div key={idx} className="text-[9px] flex justify-between text-white/80">
                              <span className="truncate pr-1">{sc.name}</span>
                              <span className="font-bold text-primary font-mono">{sc.goals}</span>
                            </div>
                          ))
                        )}

                        <span className="text-[7.5px] font-mono text-yellow-400 font-bold block uppercase mt-2">{match.awayTeam} Goals:</span>
                        {topScorersData.awayList.length === 0 ? (
                          <span className="text-[8px] text-white/30 italic block">No goals recorded</span>
                        ) : (
                          topScorersData.awayList.map((sc, idx) => (
                            <div key={idx} className="text-[9px] flex justify-between text-white/80">
                              <span className="truncate pr-1">{sc.name}</span>
                              <span className="font-bold text-yellow-400 font-mono">{sc.goals}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* GK Clean Sheets */}
                    <div className="space-y-2 bg-white/[0.01] border border-white/5 p-3 rounded-2xl">
                      <span className="text-[8.5px] font-bold text-white/40 uppercase tracking-wider block pb-1 border-b border-white/5">
                        🧤 Goalkeeper Sheets
                      </span>
                      
                      <div className="space-y-1.5">
                        <span className="text-[7.5px] font-mono text-primary font-bold block uppercase">{match.homeTeam} GKs:</span>
                        {goalkeeperCleanSheets.homeGKs.length === 0 ? (
                          <span className="text-[8px] text-white/30 italic block">No GKs listed</span>
                        ) : (
                          goalkeeperCleanSheets.homeGKs.map((gk, idx) => (
                            <div key={idx} className="text-[9px] flex justify-between text-white/80">
                              <span className="truncate pr-1">{gk.name}</span>
                              <span className="font-bold text-primary font-mono">{gk.cleanSheets}</span>
                            </div>
                          ))
                        )}

                        <span className="text-[7.5px] font-mono text-yellow-400 font-bold block uppercase mt-2">{match.awayTeam} GKs:</span>
                        {goalkeeperCleanSheets.awayGKs.length === 0 ? (
                          <span className="text-[8px] text-white/30 italic block">No GKs listed</span>
                        ) : (
                          goalkeeperCleanSheets.awayGKs.map((gk, idx) => (
                            <div key={idx} className="text-[9px] flex justify-between text-white/80">
                              <span className="truncate pr-1">{gk.name}</span>
                              <span className="font-bold text-yellow-400 font-mono">{gk.cleanSheets}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* COL 3: LIVE COMMENTARY & STATISTICAL REPORTS */}
          <div className="space-y-8 lg:col-span-1">
            
            {/* Live commentary display */}
            <div className="glass border border-white/10 rounded-[32px] p-6 bg-navy/60">
              <h3 className="text-sm font-display font-black uppercase tracking-wider text-white mb-6 flex items-center gap-2 pb-4 border-b border-b-white/5">
                <Send size={14} className="text-primary animate-pulse" />
                <span>RAPID TRANSMISSION COMMENTARY FEED</span>
              </h3>

              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                {matchCommentary.length === 0 ? (
                  <p className="text-center text-xs text-white/30 font-bold uppercase tracking-widest py-10">No live feed postings</p>
                ) : (
                  matchCommentary.map((comm) => (
                    <div key={comm.id} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-left hover:bg-white/[0.04] transition-all">
                      <div className="flex gap-2 items-center font-bold font-mono text-[10px] mb-1.5 text-primary">
                        <span>{comm.minute}</span>
                        <span className="text-white/20 text-[8px] font-sans">{comm.timestamp}</span>
                      </div>
                      <p className="text-white/80 font-medium leading-relaxed">{comm.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Published Match Report panel */}
            {publishedReport && publishedReport.isPublished && (
              <div className="glass border border-yellow-500/20 rounded-[32px] p-6 bg-yellow-500/5 shadow-lg space-y-4 relative">
                <div className="absolute top-0 right-6 -translate-y-1/2 px-2.5 py-0.5 bg-yellow-500 rounded font-black text-dark text-[8px] uppercase tracking-widest">
                  Official Match Report Published
                </div>

                <h3 className="text-xs font-display font-black uppercase tracking-wider text-yellow-500 flex items-center gap-2 mb-2">
                  <FileText size={15} />
                  <span>POST-MATCH SUMMARY ANALYSIS</span>
                </h3>

                <div className="space-y-3.5 text-xs leading-relaxed text-white/80 font-medium">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-yellow-500 mb-1">MVP Player of Match</h4>
                    <span className="bg-yellow-500/25 border border-yellow-500/30 text-yellow-400 px-3 py-1 rounded font-bold text-xs inline-block">
                      🏆 {publishedReport.playerOfMatch}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-white/50 mb-1">Match Overview</h4>
                    <p className="leading-relaxed font-sans">{publishedReport.summary}</p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-white/50 mb-1">Tactical Play Analysis</h4>
                    <p className="leading-relaxed font-sans">{publishedReport.tacticalAnalysis}</p>
                  </div>

                  {publishedReport.keyMoments && publishedReport.keyMoments.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-white/50 mb-1">Highlight Highlights</h4>
                      <ul className="list-disc pl-5 space-y-1 text-white/70">
                        {publishedReport.keyMoments.map((mom, idx) => (
                          <li key={idx} className="font-sans font-medium">{mom}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Official Match Statistics Table */}
                  <div className="pt-4 border-t border-yellow-500/10">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-yellow-500 mb-2">OFFICIAL FIXTURE STATISTICS (2026)</h4>
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-navy/40">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="bg-white/5 border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-white/40">
                            <th className="p-2 pl-3">STATISTIC NAME</th>
                            <th className="p-2 text-center">{match.homeTeam}</th>
                            <th className="p-2 text-center">{match.awayTeam}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-white/80">
                          {[
                            { label: '🚩 Corner Kicks', h: stats.cornersHome, a: stats.cornersAway },
                            { label: '🟨 Yellow Cards', h: stats.yellowCardsHome, a: stats.yellowCardsAway },
                            { label: '🟥 Red Cards', h: stats.redCardsHome, a: stats.redCardsAway },
                            { label: '🔭 Offside Rulings', h: stats.offsidesHome ?? 0, a: stats.offsidesAway ?? 0 },
                            { label: '⚠️ Team Fouls', h: stats.foulsHome, a: stats.foulsAway },
                            { label: '🎙️ Free Kicks Awarded', h: stats.freeKicksHome ?? 0, a: stats.freeKicksAway ?? 0 }
                          ].map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-white/[0.02]">
                              <td className="p-2 pl-3 font-sans font-bold text-[11px] text-white/60">{row.label}</td>
                              <td className="p-2 text-center font-bold text-yellow-500">{row.h}</td>
                              <td className="p-2 text-center font-bold text-yellow-500">{row.a}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
