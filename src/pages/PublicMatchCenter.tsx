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
    matches, teams, detailedStats, goalScorers, cards, subs, commentaries, reports, activeMinAndStatus, lineups
  } = useMatchState();

  const [toasts, setToasts] = useState<Toast[]>([]);
  const prevGoalScorersRef = useRef<any[]>([]);
  const prevMatchesRef = useRef<any[]>([]);
  const isFirstMountRef = useRef(true);

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
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Defending Rank: #1</p>
                
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
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Status: Registered</p>
                
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
              </div>
            </div>

          </div>
        </div>

        {match.walkover && (
          <div className="glass border border-amber-500/30 rounded-[32px] p-6 bg-amber-500/5 mb-8 text-left max-w-4xl mx-auto">
            <h3 className="text-lg font-display font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 pb-3 border-b border-white/5 mb-4">
              <span>⚠️ ADMINISTRATIVE WALKOVER AWARDED</span>
            </h3>
            <p className="text-sm font-sans font-medium text-white/85 leading-relaxed">
              This fixture was officially decided via an administrative walkover. Under competition rules, 
              <strong> {awayTeam.name} ({match.awayTeam})</strong> has been awarded a <strong>3-0 win</strong> over 
              <strong> {homeTeam.name} ({match.homeTeam})</strong>.
            </p>
            <p className="text-xs font-mono text-white/40 mt-3 leading-normal">
              Note: No individual player statistics (goals, assists, cards, clean sheets, or appearances) are recorded for walkover fixtures. ANA has been awarded 3 League Phase coefficient points, while BDG receives 0.
            </p>
          </div>
        )}

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
                          const playerObj = PLAYERS.find(p => p.id === pid);
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
                      <div className="space-y-1.5 font-sans">
                        {Object.entries(lineups[match.id].away.players).map(([pos, pid]) => {
                          const playerObj = PLAYERS.find(p => p.id === pid);
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
                    </div>
                  </div>

                  {/* Bench Roster */}
                  <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-[9px] font-sans">
                    <div className="space-y-1.5">
                      <span className="font-bold tracking-wider text-white/40 block pb-1 uppercase font-display">SUBS / BENCH</span>
                      <div className="flex flex-wrap gap-1 leading-normal">
                        {lineups[match.id].home.bench.map((benchPlayer, idx) => {
                          const resolvedName = PLAYERS.find(p => p.id === benchPlayer)?.name || benchPlayer;
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
                      <div className="flex flex-wrap gap-1 leading-normal">
                        {lineups[match.id].away.bench.map((benchPlayer, idx) => {
                          const resolvedName = PLAYERS.find(p => p.id === benchPlayer)?.name || benchPlayer;
                          return (
                            <span key={idx} className="bg-white/[0.02] border border-white/5 text-white/60 px-2 py-1 rounded-sm text-[9px]">
                              {resolvedName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {/* Home starting */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black tracking-widest uppercase text-primary font-display">{match.homeTeam} XI</span>
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
                    <span className="text-[9px] font-black tracking-widest uppercase text-yellow-400 font-display">{match.awayTeam} XI</span>
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
