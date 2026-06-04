import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMatchState, CommentaryItem, CardEvent, SubEvent } from '../context/MatchStateContext';
import { Match, Team, GoalScorer, parseMinuteToNumeric, formatMinuteDisplay } from '../types';
import { 
  ArrowLeft, Play, Pause, Square, Check, X, Shield, Plus, Minus, Trash, Send,
  FileText, Key, Calendar, Layout, Award, Users, AlertCircle, Sparkles, Clock, List
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminMatchController() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const {
    currentUser, matches, teams, detailedStats, goalScorers, cards, subs, lineups,
    commentaries, reports, activeMinAndStatus, startMatch, pauseMatch, resumeMatch,
    endMatch, triggerHalfTime, startSecondHalf, updateMatchMinute, updateMatchStatusDirectly, incrementGoal, decrementGoal,
    updateScoreManually, addGoalEvent, removeLastGoalEvent, addCardEvent, removeCardEvent,
    addSubEvent, removeSubEvent, updateMatchStats, approveLineup, rejectLineup, lockLineups,
    addCommentary, deleteCommentary, saveMatchReport, addAuditLog, updateMatchAddedTime, updateMatchPenalties
  } = useMatchState();

  // Route security
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/admin/login');
    } else if (currentUser.role !== 'Super Admin' && currentUser.role !== 'Match Commissioner') {
      alert('Security Denial: Matchday operations desk are locked to Super Admins and Match Commissioners!');
      navigate('/admin/dashboard');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  // Find exact match
  const match = matches.find(m => m.id === matchId);
  if (!match) {
    return (
      <div className="min-h-screen bg-navy text-white flex flex-col items-center justify-center p-4">
        <AlertCircle className="text-red-500 w-16 h-16 mb-4" />
        <h2 className="text-2xl font-display font-black uppercase text-white">Fixture Not Found</h2>
        <Link to="/admin/dashboard" className="text-primary mt-4 font-bold hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const homeTeam = teams.find(t => t.id === match.homeTeam.toLowerCase());
  const awayTeam = teams.find(t => t.id === match.awayTeam.toLowerCase());

  if (!homeTeam || !awayTeam) return null;

  // Active timers
  const timer = activeMinAndStatus[match.id] || { liveMinute: '0\'', isPaused: true };

  // Match statistics ratios
  const stats = detailedStats[match.id] || {
    possessionHome: 50, possessionAway: 50,
    shotsHome: 0, shotsAway: 0,
    shotsOnTargetHome: 0, shotsOnTargetAway: 0,
    cornersHome: 0, cornersAway: 0,
    foulsHome: 0, foulsAway: 0,
    yellowCardsHome: 0, yellowCardsAway: 0,
    redCardsHome: 0, redCardsAway: 0,
    offsidesHome: 0, offsidesAway: 0,
    savesHome: 0, savesAway: 0
  };

  // Filter events
  const matchGoals = goalScorers.filter(g => g.matchId === match.id);
  const matchCards = cards.filter(c => c.matchId === match.id);
  const matchSubs = subs.filter(s => s.matchId === match.id);
  const matchCommentary = commentaries[match.id] || [];
  const matchReport = reports[match.id] || {
    summary: '', playerOfMatch: '', tacticalAnalysis: '', keyMoments: [], isPublished: false
  };

  // Dynamic Lineup setup
  const matchLineup = lineups[match.id] || {
    home: { matchId: match.id, teamAbbr: match.homeTeam, formation: '4-3-3', captainId: '', players: {}, bench: [], status: 'Pending' },
    away: { matchId: match.id, teamAbbr: match.awayTeam, formation: '4-4-2', captainId: '', players: {}, bench: [], status: 'Pending' }
  };

  // Form states
  const [goalPlayer, setGoalPlayer] = useState('');
  const [goalTeam, setGoalTeam] = useState(match.homeTeam);
  const [goalMin, setGoalMin] = useState<string | number>(timer.liveMinute.replace("'", "") || 12);
  const [goalType, setGoalType] = useState<'Goal' | 'Penalty' | 'Own Goal'>('Goal');
  const [goalAssist, setGoalAssist] = useState('');

  const [cardPlayer, setCardPlayer] = useState('');
  const [cardTeam, setCardTeam] = useState(match.homeTeam);
  const [cardMin, setCardMin] = useState<string | number>(timer.liveMinute.replace("'", "") || 24);
  const [cardType, setCardType] = useState<'Yellow' | 'Second Yellow' | 'Red'>('Yellow');

  const [subTeam, setSubTeam] = useState(match.homeTeam);
  const [subOut, setSubOut] = useState('');
  const [subIn, setSubIn] = useState('');
  const [subMin, setSubMin] = useState<string | number>(timer.liveMinute.replace("'", "") || 30);

  const [commentsInput, setCommentsInput] = useState('');
  const [commentsType, setCommentsType] = useState<CommentaryItem['type']>('general');

  // Manual minute states
  const [manualMinText, setManualMinText] = useState(timer.liveMinute);

  // Manual Score states
  const [manualHomeScore, setManualHomeScore] = useState(match.homeScore);
  const [manualAwayScore, setManualAwayScore] = useState(match.awayScore);

  // Match report states
  const [repSum, setRepSum] = useState(matchReport.summary);
  const [repPom, setRepPom] = useState(matchReport.playerOfMatch);
  const [repTactics, setRepTactics] = useState(matchReport.tacticalAnalysis);
  const [repMoments, setRepMoments] = useState(matchReport.keyMoments.join('\n'));

  // Trigger scorers add
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalPlayer.trim()) return alert('Player name required');
    addGoalEvent(match.id, {
      matchId: match.id,
      playerName: goalPlayer.trim(),
      team: goalTeam,
      minute: goalMin,
      type: goalType,
      assist: goalAssist.trim() || undefined
    });
    setGoalPlayer('');
    setGoalAssist('');
  };

  // Trigger card add
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardPlayer.trim()) return alert('Player name required');
    addCardEvent(match.id, {
      matchId: match.id,
      playerName: cardPlayer.trim(),
      teamAbbr: cardTeam,
      minute: cardMin,
      type: cardType
    });
    setCardPlayer('');
  };

  // Trigger substitution
  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subOut.trim() || !subIn.trim()) return alert('Player names required');
    addSubEvent(match.id, {
      matchId: match.id,
      teamAbbr: subTeam,
      playerOut: subOut.trim(),
      playerIn: subIn.trim(),
      minute: subMin
    });
    setSubOut('');
    setSubIn('');
  };

  // Rapid commentary publish
  const handlePublishCommentary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentsInput.trim()) return;
    addCommentary(match.id, commentsInput.trim(), commentsType);
    setCommentsInput('');
  };

  // Publish report summary
  const handlePublishReport = (e: React.FormEvent) => {
    e.preventDefault();
    const momentsList = repMoments.split('\n').map(l => l.trim()).filter(Boolean);
    saveMatchReport(match.id, {
      summary: repSum,
      playerOfMatch: repPom,
      tacticalAnalysis: repTactics,
      keyMoments: momentsList,
      isPublished: true
    });
    alert('Match Report published and synchronized successfully!');
  };

  // Calculate timelines chronologically
  const timelineEvents = [
    ...matchGoals.map(g => ({
      type: 'goal' as const,
      minute: g.minute,
      text: `⚽ GOAL (${g.team}): ${g.playerName} (${g.type})${g.assist ? ` - Assist by ${g.assist}` : ''}`,
      raw: g
    })),
    ...matchCards.map(c => ({
      type: 'card' as const,
      minute: c.minute,
      text: `${c.type === 'Yellow' ? '🟨' : '🟥'} CARD (${c.teamAbbr}): ${c.playerName} (${c.type})`,
      raw: c
    })),
    ...matchSubs.map(s => ({
      type: 'sub' as const,
      minute: s.minute,
      text: `🔄 SUB (${s.teamAbbr}): IN ➡️ ${s.playerIn} | OUT ➡️ ${s.playerOut}`,
      raw: s
    }))
  ].sort((a, b) => parseMinuteToNumeric(b.minute) - parseMinuteToNumeric(a.minute)); // Chronological desc (latest first)

  // Quick preset stats buttons
  const adjustStat = (field: keyof typeof stats, direction: 'up' | 'down') => {
    const currentVal = stats[field] as number;
    let newVal = direction === 'up' ? currentVal + 1 : Math.max(0, currentVal - 1);
    
    // Percent bounds for possession
    if (field === 'possessionHome') {
      newVal = Math.min(100, Math.max(0, newVal));
      updateMatchStats(match.id, { 
        possessionHome: newVal, 
        possessionAway: 100 - newVal 
      });
    } else if (field === 'possessionAway') {
      newVal = Math.min(100, Math.max(0, newVal));
      updateMatchStats(match.id, { 
        possessionAway: newVal, 
        possessionHome: 100 - newVal 
      });
    } else {
      updateMatchStats(match.id, { [field]: newVal });
    }
  };

  return (
    <div className="min-h-screen bg-navy text-white pb-32">
      
      {/* Upper header action bar */}
      <div className="bg-navy-dark border-b border-white/10 px-4 py-4 mb-8 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/admin/dashboard"
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center space-x-3 text-right">
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">LIVE BROADCAST DESK</p>
              <p className="text-xs text-white/50">Admin: {currentUser.username} ({currentUser.role})</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* SECTION 1: BROADCAST SCOREBOARD HEADER */}
        <div className="p-8 rounded-[40px] border border-white/10 bg-navy-dark/90 relative overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.4)]">
          {/* Animated stadium overlay lines */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            {/* Home team banner */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left flex-1 justify-end">
              <div>
                <h3 className="text-xl sm:text-2xl font-display font-black tracking-tight">{homeTeam.name}</h3>
                <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">LINEUP: {matchLineup.home.status}</span>
              </div>
              <img src={homeTeam.logo} alt={homeTeam.name} className="w-16 h-16 object-contain" />
            </div>

            {/* Scoreboard block */}
            <div className="text-center bg-navy/95 border border-white/5 rounded-3xl p-6 px-10 shadow-2xl relative min-w-[200px]">
              
              <div className="text-xs font-black uppercase tracking-[0.25em] text-primary flex items-center justify-center gap-1.5 mb-2">
                {match.status === 'Live' ? (
                  <span className="text-red-500 animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                    LIVE • {timer.liveMinute}
                  </span>
                ) : match.status === 'Half Time' ? (
                  <span className="text-yellow-400">HT - Half Time</span>
                ) : match.status === 'Finished' ? (
                  <span className="text-white/40">FT - Finished</span>
                ) : (
                  <span className="text-white/30">{match.status}</span>
                )}
              </div>

              {/* Huge Live Score display */}
              <div className="text-5xl font-display italic font-black text-white tracking-widest select-none">
                {match.status === 'Upcoming' ? '0 - 0' : `${match.homeScore} - ${match.awayScore}`}
              </div>

              <div className="text-[9px] text-white/30 tracking-widest uppercase mt-3">
                📍 {match.venue}
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {(['Upcoming', 'Live', 'Half Time', 'Finished', 'Postponed', 'Cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateMatchStatusDirectly(match.id, st as any)}
                    className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider border transition-all ${
                      match.status === st 
                        ? 'bg-primary text-dark border-primary' 
                        : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Away team banner */}
            <div className="flex flex-col sm:flex-row-reverse items-center gap-4 text-center sm:text-right flex-1 justify-end">
              <div>
                <h3 className="text-xl sm:text-2xl font-display font-black tracking-tight">{awayTeam.name}</h3>
                <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">LINEUP: {matchLineup.away.status}</span>
              </div>
              <img src={awayTeam.logo} alt={awayTeam.name} className="w-16 h-16 object-contain" />
            </div>
          </div>
        </div>

        {/* SECTION 2: WORKSPACE CONTROL SECTIONS */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLS: CONTROLS */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* PANEL 2.1: INTERACTIVE MATCH TIMER & SCOREBOARD ADJUSTMENTS */}
            <div className="glass border border-white/10 rounded-[32px] p-6 bg-navy/60 backdrop-blur-md">
              <h3 className="text-base font-display font-black uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                <Clock size={16} className="text-primary animate-pulse" />
                <span>MATCH TIMER & DIRECT SCOREBOARD DESK</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Timer Controls */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block">RUNNING MATCH TIMER CONTROL</span>
                  
                  <div className="grid grid-cols-2 gap-3 pb-3">
                    {/* 1. START MATCH */}
                    <button
                      type="button"
                      onClick={() => startMatch(match.id)}
                      disabled={match.status !== 'Upcoming'}
                      className="py-3 px-3 bg-green-500 hover:bg-green-600 disabled:opacity-20 disabled:pointer-events-none text-dark font-black text-[9px] sm:text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
                    >
                      <Play size={10} fill="currentColor" />
                      <span>START MATCH</span>
                    </button>

                    {/* 2. PAUSE MATCH */}
                    <button
                      type="button"
                      onClick={() => pauseMatch(match.id)}
                      disabled={match.status !== 'Live' || timer.isPaused}
                      className="py-3 px-3 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-20 disabled:pointer-events-none text-dark font-black text-[9px] sm:text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
                    >
                      <Pause size={10} />
                      <span>PAUSE MATCH</span>
                    </button>

                    {/* 3. RESUME MATCH */}
                    <button
                      type="button"
                      onClick={() => resumeMatch(match.id)}
                      disabled={match.status !== 'Live' || !timer.isPaused}
                      className="py-3 px-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-20 disabled:pointer-events-none text-dark font-black text-[9px] sm:text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
                    >
                      <Play size={10} fill="currentColor" />
                      <span>RESUME MATCH</span>
                    </button>

                    {/* 4. HALF TIME */}
                    <button
                      type="button"
                      onClick={() => triggerHalfTime(match.id)}
                      disabled={match.status !== 'Live'}
                      className="py-3 px-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-20 disabled:pointer-events-none text-dark font-black text-[9px] sm:text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
                    >
                      <Clock size={10} />
                      <span>HALF TIME</span>
                    </button>

                    {/* 5. START SECOND HALF */}
                    <button
                      type="button"
                      onClick={() => startSecondHalf(match.id)}
                      disabled={match.status !== 'Half Time'}
                      className="py-3 px-3 bg-fuchsia-500 hover:bg-fuchsia-600 disabled:opacity-20 disabled:pointer-events-none text-white font-black text-[9px] sm:text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
                    >
                      <Play size={10} fill="currentColor" />
                      <span>START SECOND HALF</span>
                    </button>

                    {/* 6. FULL TIME */}
                    <button
                      type="button"
                      onClick={() => endMatch(match.id)}
                      disabled={match.status !== 'Live' && match.status !== 'Half Time'}
                      className="py-3 px-3 bg-red-500 hover:bg-red-600 disabled:opacity-20 disabled:pointer-events-none text-white font-black text-[9px] sm:text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
                    >
                      <Square size={10} fill="currentColor" />
                      <span>FULL TIME</span>
                    </button>
                  </div>

                  {/* Manual minute update */}
                  <div className="pt-2 border-t border-white/5 flex gap-2">
                    <input
                      type="text"
                      value={manualMinText}
                      onChange={(e) => setManualMinText(e.target.value)}
                      placeholder="e.g. 45+2' or 67'"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 text-xs font-mono font-bold text-white uppercase"
                    />
                    <button
                      onClick={() => updateMatchMinute(match.id, manualMinText)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-bold uppercase rounded-xl transition-all border border-white/10 cursor-pointer"
                    >
                      Set Min
                    </button>
                  </div>

                  {/* Injury Time (Added Time) controls */}
                  <div className="pt-3 border-t border-white/5 space-y-3">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block">SET ADDED INJURY TIME (MINS)</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-1">First Half (+)</label>
                        <select
                          value={match.firstHalfAddedTime || 0}
                          onChange={(e) => updateMatchAddedTime(match.id, parseInt(e.target.value) || 0, match.secondHalfAddedTime || 0)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-primary/50"
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                            <option key={val} value={val} className="bg-neutral-900 text-white">+{val} min</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-1">Second Half (+)</label>
                        <select
                          value={match.secondHalfAddedTime || 0}
                          onChange={(e) => updateMatchAddedTime(match.id, match.firstHalfAddedTime || 0, parseInt(e.target.value) || 0)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-primary/50"
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                            <option key={val} value={val} className="bg-neutral-900 text-white">+{val} min</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Controls */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block font-sans">SCOREBOARD OVERRIDE CONTROLLERS</span>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => decrementGoal(match.id, 'home')}
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white cursor-pointer"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-bold text-white/70 mx-1">Home Goal</span>
                      <button
                        onClick={() => incrementGoal(match.id, 'home')}
                        className="p-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary rounded-lg cursor-pointer"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <div className="w-[1px] h-6 bg-white/10" />

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => decrementGoal(match.id, 'away')}
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white cursor-pointer"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-bold text-white/70 mx-1">Away Goal</span>
                      <button
                        onClick={() => incrementGoal(match.id, 'away')}
                        className="p-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary rounded-lg cursor-pointer"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Manual entry override */}
                  <div className="pt-2 border-t border-white/5 flex gap-2 items-center">
                    <div className="flex items-center gap-1.5 flex-1 justify-center">
                      <input
                        type="number"
                        min="0"
                        value={manualHomeScore}
                        onChange={(e) => setManualHomeScore(parseInt(e.target.value) || 0)}
                        className="w-12 bg-white/5 border border-white/10 rounded-lg py-1.5 text-center text-sm font-mono font-bold text-white"
                      />
                      <span className="text-[10px] uppercase font-bold text-white/30">Home</span>
                    </div>

                    <span className="text-white/30 font-bold">-</span>

                    <div className="flex items-center gap-1.5 flex-1 justify-center">
                      <input
                        type="number"
                        min="0"
                        value={manualAwayScore}
                        onChange={(e) => setManualAwayScore(parseInt(e.target.value) || 0)}
                        className="w-12 bg-white/5 border border-white/10 rounded-lg py-1.5 text-center text-sm font-mono font-bold text-white"
                      />
                      <span className="text-[10px] uppercase font-bold text-white/30">Away</span>
                    </div>

                    <button
                      onClick={() => updateScoreManually(match.id, manualHomeScore, manualAwayScore)}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-xs font-bold uppercase rounded-xl border border-white/10 transition-all cursor-pointer"
                    >
                      Sync Score
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => removeLastGoalEvent(match.id)}
                      disabled={matchGoals.length === 0}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-20"
                    >
                      <Trash size={10} />
                      <span>Revert Last Goal Event</span>
                    </button>
                  </div>

                  {/* Penalty Shootout section (for knockout tied matches) */}
                  <div className="pt-3 border-t border-white/5 space-y-3">
                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">PENALTY SHOOTOUT SCORES</span>
                    <div className="grid grid-cols-2 gap-3 items-end">
                      <div>
                        <label className="text-[8px] font-black text-white/30 uppercase block mb-1 font-mono">{match.homeTeam} Pens</label>
                        <input
                          type="number"
                          min="0"
                          value={match.homePenalties ?? ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? null : parseInt(e.target.value);
                            updateMatchPenalties(match.id, val, match.awayPenalties ?? 0);
                          }}
                          placeholder="0"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-white/30 uppercase block mb-1 font-mono">{match.awayTeam} Pens</label>
                        <input
                          type="number"
                          min="0"
                          value={match.awayPenalties ?? ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? null : parseInt(e.target.value);
                            updateMatchPenalties(match.id, match.homePenalties ?? 0, val);
                          }}
                          placeholder="0"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    {(match.homePenalties !== undefined || match.awayPenalties !== undefined) && (
                      <div className="flex justify-between items-center bg-amber-500/5 border border-amber-500/10 rounded-lg p-2 mt-1">
                        <span className="text-[10px] text-amber-200">Current Pen Score: {match.homeTeam} {match.homePenalties ?? 0} – {match.awayPenalties ?? 0} {match.awayTeam}</span>
                        <button
                          onClick={() => updateMatchPenalties(match.id, null, null)}
                          className="text-[9px] font-bold text-red-500 underline hover:text-red-400"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* PANEL 2.2: SQUAD EVENTS (GOALS, TIMELINE CARDS, SUBSTITUTIONS) */}
            <div className="glass border border-white/10 rounded-[32px] p-6 bg-navy/60 backdrop-blur-md space-y-6">
              <h3 className="text-base font-display font-black uppercase tracking-wider text-white border-b border-white/5 pb-4 flex items-center gap-2">
                <Plus size={18} className="text-primary" />
                <span>RAPID MATCH EVENT REGISTRARS</span>
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                
                {/* 2.2.1: GOAL INPUT PANEL */}
                <form onSubmit={handleAddGoal} className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest block">⚽ ADD GOAL EVENT</span>
                  
                  <div>
                    <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block mb-1">Scoring Player*</label>
                    <input
                      type="text"
                      value={goalPlayer}
                      onChange={(e) => setGoalPlayer(e.target.value)}
                      placeholder="e.g. Samuel Ade"
                      className="w-full bg-navy-dark border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white placeholder-white/20 focus:outline-none focus:border-primary/50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block mb-1">Scoring Team*</label>
                      <select
                        value={goalTeam}
                        onChange={(e) => setGoalTeam(e.target.value)}
                        className="w-full bg-navy-dark border border-white/10 rounded-lg px-2 py-2 text-xs font-bold text-white focus:outline-none"
                      >
                        <option value={match.homeTeam}>{match.homeTeam}</option>
                        <option value={match.awayTeam}>{match.awayTeam}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block mb-1">Match Minute*</label>
                      <input
                        type="text"
                        value={goalMin}
                        onChange={(e) => setGoalMin(e.target.value)}
                        placeholder="e.g. 12 or 30+1"
                        className="w-full bg-navy-dark border border-white/10 rounded-lg px-2 py-2 text-xs font-mono font-bold text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block mb-1">Goal Type*</label>
                      <select
                        value={goalType}
                        onChange={(e) => setGoalType(e.target.value as any)}
                        className="w-full bg-navy-dark border border-white/10 rounded-lg px-2 py-2 text-xs font-bold text-white focus:outline-none"
                      >
                        <option value="Goal">Goal (Play)</option>
                        <option value="Penalty">Penalty (P)</option>
                        <option value="Own Goal">Own Goal (OG)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block mb-1">Assist (Optional)</label>
                      <input
                        type="text"
                        value={goalAssist}
                        onChange={(e) => setGoalAssist(e.target.value)}
                        placeholder="e.g. Wiz Kid"
                        className="w-full bg-navy-dark border border-white/10 rounded-lg px-2 py-2 text-xs font-bold text-white placeholder-white/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary hover:bg-primary-hover text-dark font-black text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Save Goal Event
                  </button>
                </form>

                {/* 2.2.2: CARD INPUT PANEL */}
                <form onSubmit={handleAddCard} className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest block">🟨 ADD CARD EVENT</span>
                  
                  <div>
                    <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block mb-1">Booked Player*</label>
                    <input
                      type="text"
                      value={cardPlayer}
                      onChange={(e) => setCardPlayer(e.target.value)}
                      placeholder="e.g. Chidi Okafor"
                      className="w-full bg-navy-dark border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block mb-1">Offending Team*</label>
                      <select
                        value={cardTeam}
                        onChange={(e) => setCardTeam(e.target.value)}
                        className="w-full bg-navy-dark border border-white/10 rounded-lg px-2 py-2 text-xs font-bold text-white focus:outline-none"
                      >
                        <option value={match.homeTeam}>{match.homeTeam}</option>
                        <option value={match.awayTeam}>{match.awayTeam}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block mb-1">Offense Minute*</label>
                      <input
                        type="text"
                        value={cardMin}
                        onChange={(e) => setCardMin(e.target.value)}
                        placeholder="e.g. 24 or 60+1"
                        className="w-full bg-navy-dark border border-white/10 rounded-lg px-2 py-2 text-xs font-mono font-bold text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block mb-1">Card Type*</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['Yellow', 'Second Yellow', 'Red'] as const).map((ct) => (
                        <button
                          key={ct}
                          type="button"
                          onClick={() => setCardType(ct)}
                          className={`py-2 text-[8px] font-black uppercase tracking-wider rounded border text-center transition-all ${
                            cardType === ct
                              ? ct === 'Yellow'
                                ? 'bg-yellow-400 text-dark border-yellow-400'
                                : 'bg-red-500 text-white border-red-500'
                              : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'
                          }`}
                        >
                          {ct}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-dark font-black text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Save Card Event
                  </button>
                </form>

                {/* 2.2.3: SUBSTITUTIONS INPUT PANEL */}
                <form onSubmit={handleAddSub} className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block">🔄 ADD SUBSTITUTION</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block mb-1">Team*</label>
                      <select
                        value={subTeam}
                        onChange={(e) => setSubTeam(e.target.value)}
                        className="w-full bg-navy-dark border border-white/10 rounded-lg px-2 py-2 text-xs font-bold text-white focus:outline-none"
                      >
                        <option value={match.homeTeam}>{match.homeTeam}</option>
                        <option value={match.awayTeam}>{match.awayTeam}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block mb-1">Minute*</label>
                      <input
                        type="text"
                        value={subMin}
                        onChange={(e) => setSubMin(e.target.value)}
                        placeholder="e.g. 45 or 60+3"
                        className="w-full bg-navy-dark border border-white/10 rounded-lg px-2 py-2 text-xs font-mono font-bold text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block mb-1">Player Leavs (OUT)*</label>
                    <input
                      type="text"
                      value={subOut}
                      onChange={(e) => setSubOut(e.target.value)}
                      placeholder="e.g. KDB"
                      className="w-full bg-navy-dark border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white placeholder-white/20 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block mb-1">Player Enters (IN)*</label>
                    <input
                      type="text"
                      value={subIn}
                      onChange={(e) => setSubIn(e.target.value)}
                      placeholder="e.g. Burna Boy"
                      className="w-full bg-navy-dark border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white placeholder-white/20 focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest border border-white/15 rounded-xl transition-all cursor-pointer"
                  >
                    Save Substitution
                  </button>
                </form>

              </div>
            </div>

            {/* PANEL 2.3: STATISTICS SLIDERS PANEL */}
            <div className="glass border border-white/10 rounded-[32px] p-6 bg-navy/60 backdrop-blur-md">
              <h3 className="text-base font-display font-black uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                <Award size={16} className="text-primary" />
                <span>MATCHDAY STATISTICAL RATIOS EDITOR</span>
              </h3>

              <div className="space-y-6">
                {/* Possession slider */}
                <div className="space-y-2 p-4 rounded-xl bg-white/[0.01] border border-white/5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-primary font-mono">{stats.possessionHome}%</span>
                    <span className="uppercase text-white/40 text-[9px] tracking-widest font-black">⚽ Possession Ratio ⚽</span>
                    <span className="text-primary font-mono">{stats.possessionAway}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => adjustStat('possessionHome', 'down')} className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono flex items-center justify-center font-bold text-xs">-1%</button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stats.possessionHome}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 50;
                        updateMatchStats(match.id, { possessionHome: val, possessionAway: 100 - val });
                      }}
                      className="flex-1 accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <button onClick={() => adjustStat('possessionHome', 'up')} className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono flex items-center justify-center font-bold text-xs">+1%</button>
                  </div>
                </div>

                {/* Shorthand Stat Counters Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {([
                    { label: '🔥 Total Shots', fieldHome: 'shotsHome', fieldAway: 'shotsAway' },
                    { label: '🎯 Shots On Target', fieldHome: 'shotsOnTargetHome', fieldAway: 'shotsOnTargetAway' },
                    { label: '🚩 Corner kicks', fieldHome: 'cornersHome', fieldAway: 'cornersAway' },
                    { label: '⚠️ Team Fouls', fieldHome: 'foulsHome', fieldAway: 'foulsAway' },
                    { label: '🟨 Yellow Cards', fieldHome: 'yellowCardsHome', fieldAway: 'yellowCardsAway' },
                    { label: '🟥 Red Cards', fieldHome: 'redCardsHome', fieldAway: 'redCardsAway' },
                    { label: '🔭 Offside Rulings', fieldHome: 'offsidesHome', fieldAway: 'offsidesAway' },
                    { label: '🧤 Goalkeeper Saves', fieldHome: 'savesHome', fieldAway: 'savesAway' }
                  ] as const).map((item) => (
                    <div key={item.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4">
                      {/* Home adjustments */}
                      <div className="flex items-center gap-1">
                        <button onClick={() => adjustStat(item.fieldHome, 'down')} className="w-6 h-6 rounded bg-white/5 text-xs text-white/50 border border-white/10 hover:bg-white/10 flex items-center justify-center">-</button>
                        <span className="w-6 text-center font-mono font-bold text-sm text-white">{stats[item.fieldHome]}</span>
                        <button onClick={() => adjustStat(item.fieldHome, 'up')} className="w-6 h-6 rounded bg-primary/10 text-xs text-primary border border-primary/20 hover:bg-primary/20 flex items-center justify-center">+</button>
                      </div>

                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest text-center truncate max-w-[120px]">{item.label}</span>

                      {/* Away adjustments */}
                      <div className="flex items-center gap-1">
                        <button onClick={() => adjustStat(item.fieldAway, 'down')} className="w-6 h-6 rounded bg-white/5 text-xs text-white/50 border border-white/10 hover:bg-white/10 flex items-center justify-center">-</button>
                        <span className="w-6 text-center font-mono font-bold text-sm text-white">{stats[item.fieldAway]}</span>
                        <button onClick={() => adjustStat(item.fieldAway, 'up')} className="w-6 h-6 rounded bg-primary/10 text-xs text-primary border border-primary/20 hover:bg-primary/20 flex items-center justify-center">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PANEL 2.4: MATCH LINEUPS APPROVER STATUS */}
            <div className="glass border border-white/10 rounded-[32px] p-6 bg-navy/60 backdrop-blur-md">
              <h3 className="text-base font-display font-black uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                <Users size={16} className="text-primary" />
                <span>Lineups operational approver panel</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Home Lineup card */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-sm text-white">{match.homeTeam} Tactical Roster</h4>
                      <p className="text-[10px] text-white/40">Formation: {matchLineup.home.formation}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                      matchLineup.home.status === 'Approved' ? 'bg-green-500/20 text-green-500 border-green-500/50' :
                      matchLineup.home.status === 'Rejected' ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
                    }`}>{matchLineup.home.status}</span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <span className="text-[8px] font-black text-white/30 tracking-widest uppercase block mb-1">Starting Eleven Roster</span>
                    <div className="grid grid-cols-2 gap-1.5 text-xs text-white/70">
                      {Object.keys(matchLineup.home.players).map(spot => (
                        <div key={spot} className="flex gap-1.5 items-center bg-white/5 py-1 px-2 rounded-lg border border-white/5">
                          <span className="text-[8px] font-black text-primary uppercase font-mono">{spot}</span>
                          <span className="truncate font-medium">Player {matchLineup.home.players[spot].replace(/\D/g, '')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-white/5 text-[10px] text-white/50 block font-bold leading-normal">
                      Subs: <span className="text-gray-300 font-medium">{matchLineup.home.bench.slice(0, 4).join(', ')}...</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => approveLineup(match.id, match.homeTeam)}
                      disabled={matchLineup.home.status === 'Approved'}
                      className="flex-1 py-2 bg-green-500/25 hover:bg-green-500 text-green-300 hover:text-dark disabled:opacity-20 disabled:pointer-events-none text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-green-500/40 opacity-90 cursor-pointer"
                    >
                      Approve Lineup
                    </button>
                    <button
                      onClick={() => rejectLineup(match.id, match.homeTeam)}
                      disabled={matchLineup.home.status === 'Rejected'}
                      className="py-2 px-3 bg-red-500/15 hover:bg-red-500 text-red-300 hover:text-white disabled:opacity-20 disabled:pointer-events-none text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-red-500/40 cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* Away Lineup card */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-sm text-white">{match.awayTeam} Tactical Roster</h4>
                      <p className="text-[10px] text-white/40">Formation: {matchLineup.away.formation}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                      matchLineup.away.status === 'Approved' ? 'bg-green-500/20 text-green-500 border-green-500/50' :
                      matchLineup.away.status === 'Rejected' ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
                    }`}>{matchLineup.away.status}</span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <span className="text-[8px] font-black text-white/30 tracking-widest uppercase block mb-1">Starting Eleven Roster</span>
                    <div className="grid grid-cols-2 gap-1.5 text-xs text-white/70">
                      {Object.keys(matchLineup.away.players).map(spot => (
                        <div key={spot} className="flex gap-1.5 items-center bg-white/5 py-1 px-2 rounded-lg border border-white/5">
                          <span className="text-[8px] font-black text-primary uppercase font-mono">{spot}</span>
                          <span className="truncate font-medium">Player {matchLineup.away.players[spot].replace(/\D/g, '')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-white/5 text-[10px] text-white/50 block font-bold leading-normal">
                      Subs: <span className="text-gray-300 font-medium">{matchLineup.away.bench.slice(0, 4).join(', ')}...</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => approveLineup(match.id, match.awayTeam)}
                      disabled={matchLineup.away.status === 'Approved'}
                      className="flex-1 py-2 bg-green-500/25 hover:bg-green-500 text-green-300 hover:text-dark disabled:opacity-20 disabled:pointer-events-none text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-green-500/40 opacity-90 cursor-pointer"
                    >
                      Approve Lineup
                    </button>
                    <button
                      onClick={() => rejectLineup(match.id, match.awayTeam)}
                      disabled={matchLineup.away.status === 'Rejected'}
                      className="py-2 px-3 bg-red-500/15 hover:bg-red-500 text-red-300 hover:text-white disabled:opacity-20 disabled:pointer-events-none text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-red-500/40 cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 text-right">
                <button
                  onClick={() => lockLineups(match.id)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-black uppercase rounded-xl border border-white/10 transition-all text-gray-300 tracking-wider cursor-pointer"
                >
                  🔒 Lock lineups at kickoff
                </button>
              </div>
            </div>

            {/* PANEL 2.5: MATCH REPORT PUBLISHER SUMMARY */}
            <div className="glass border border-white/10 rounded-[32px] p-6 bg-navy/60 backdrop-blur-md">
              <h3 className="text-base font-display font-black uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <span>POST-MATCH REPORT PUBLISITION CENTER</span>
              </h3>

              <form onSubmit={handlePublishReport} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1.5">Match Tactical Summary</label>
                    <textarea
                      value={repSum}
                      onChange={(e) => setRepSum(e.target.value)}
                      placeholder="Write an impactful brief editorial summation of match proceedings..."
                      className="w-full bg-navy-dark border border-white/10 rounded-2xl p-4 text-xs font-medium text-white placeholder-white/20 h-32 focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1.5">Detailed Tactical Play Analysis</label>
                    <textarea
                      value={repTactics}
                      onChange={(e) => setRepTactics(e.target.value)}
                      placeholder="Break down squad movements, coaching tactical setups, offensive formations..."
                      className="w-full bg-navy-dark border border-white/10 rounded-2xl p-4 text-xs font-medium text-white placeholder-white/20 h-32 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1.5">Key Match Moments (one per line)</label>
                    <textarea
                      value={repMoments}
                      onChange={(e) => setRepMoments(e.target.value)}
                      placeholder="e.g. 15' Incredible save by Home goalkeeper&#10;55' Dynamic assist across penalty box..."
                      className="w-full bg-navy-dark border border-white/10 rounded-2xl p-4 text-xs font-medium text-white placeholder-white/20 h-28 focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1.5">Match MVP (Player of Match)</label>
                    <input
                      type="text"
                      value={repPom}
                      onChange={(e) => setRepPom(e.target.value)}
                      placeholder="e.g. Samuel Ade"
                      className="w-full bg-navy-dark border border-white/10 rounded-2xl px-4 py-4 text-xs font-bold text-white placeholder-white/20 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-primary hover:bg-primary-hover text-dark font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all cursor-pointer"
                  >
                    Publish Official Match Report
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* RIGHT COL: TIMELINE, RAPID COMMENTARY FEED */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* PANEL 3.1: LIVE TIMELINE DISPLAY */}
            <div className="glass border border-white/10 rounded-[32px] p-6 bg-navy/60 backdrop-blur-md">
              <h3 className="text-sm font-display font-black uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                <List size={16} className="text-primary" />
                <span>LIVE AUTOMATED MATCH TIMELINE</span>
              </h3>

              {timelineEvents.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                  <p className="text-xs text-white/30 font-bold uppercase tracking-widest mb-1 leading-loose">No active match events</p>
                  <p className="text-[9px] text-white/25 px-4 leading-normal">Goals, disciplinary cards, or substitutions, once inputted, will instantly formulate chronological rows block.</p>
                </div>
              ) : (
                <div className="relative pl-6 border-l border-white/10 space-y-6">
                  {timelineEvents.map((ev, i) => (
                    <div key={i} className="relative text-xs">
                      
                      {/* Left circular bullet indicator */}
                      <span className="absolute -left-9.5 top-0.5 w-[30px] h-6 rounded-full bg-navy border border-white/15 flex items-center justify-center font-mono font-bold text-[9px] text-primary">
                        {formatMinuteDisplay(ev.minute)}
                      </span>

                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 shadow-sm hover:bg-white/[0.04] transition-all relative flex justify-between items-start gap-2">
                        <div>
                          <p className="text-white/90 font-bold leading-normal">{ev.text}</p>
                          {ev.type === 'goal' && (
                            <p className="text-[10px] text-white/40 font-semibold mt-0.5">Scored inside live minutes</p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <button
                          onClick={() => {
                            if (ev.type === 'goal') {
                              removeLastGoalEvent(match.id);
                            } else if (ev.type === 'card') {
                              removeCardEvent(match.id, ev.raw.id);
                            } else if (ev.type === 'sub') {
                              removeSubEvent(match.id, ev.raw.id);
                            }
                          }}
                          title="Delete Event"
                          className="p-1 border border-red-500/10 hover:border-red-500/35 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded cursor-pointer"
                        >
                          <Trash size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PANEL 3.2: RAPID COMMENTARY CHAT BOARD */}
            <div className="glass border border-white/10 rounded-[32px] p-6 bg-navy/60 backdrop-blur-md">
              <h3 className="text-sm font-display font-black uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                <Send size={15} className="text-primary animate-bounce" />
                <span>Broadcast Rapid Live Commentary Feed</span>
              </h3>

              {/* Feed input comment form */}
              <form onSubmit={handlePublishCommentary} className="space-y-4 mb-6">
                <div>
                  <textarea
                    value={commentsInput}
                    onChange={(e) => setCommentsInput(e.target.value)}
                    placeholder="Enter micro updates like 'Massive stadium kickoff chance for home wingers!'"
                    className="w-full bg-navy-dark border border-white/10 rounded-2xl p-4 text-xs font-semibold text-white placeholder-white/20 h-24 focus:outline-none focus:border-primary/50"
                    required
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <select
                    value={commentsType}
                    onChange={(e) => setCommentsType(e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded-xl px-2 py-2.5 text-[10px] font-black uppercase text-white/60 focus:outline-none"
                  >
                    <option value="general">🗣️ General</option>
                    <option value="goal">⚽ Goal Update</option>
                    <option value="card">🟨 Card Alert</option>
                    <option value="sub">🔄 Substitution</option>
                  </select>

                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-dark font-black text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Transmit Feed</span>
                    <Send size={10} />
                  </button>
                </div>
              </form>

              {/* Commentary Streams list */}
              <div className="border-t border-white/5 pt-4 space-y-4 max-h-[400px] overflow-y-auto">
                <span className="text-[10px] font-black tracking-widest uppercase text-white/30 block mb-2 font-display">transmitted feed outputs</span>
                {matchCommentary.length === 0 ? (
                  <p className="text-[10px] text-white/30 text-center py-6 block font-bold leading-relaxed uppercase">No rapid live feed entries yet</p>
                ) : (
                  <div className="space-y-3">
                    {matchCommentary.map((comm) => (
                      <div key={comm.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex gap-2 justify-between items-start hover:bg-white/[0.04] transition-all">
                        <div className="text-[11px] leading-relaxed flex-1">
                          <div className="flex gap-2 items-center font-bold mb-1">
                            <span className="text-primary font-mono text-[10px]">{comm.minute}</span>
                            <span className="text-[8px] bg-white/5 px-1 py-0.5 rounded text-white/25">{comm.timestamp}</span>
                          </div>
                          <p className="text-white/80 font-medium">{comm.text}</p>
                        </div>
                        
                        <button
                          onClick={() => deleteCommentary(match.id, comm.id)}
                          className="p-1 border border-white/10 hover:border-red-500/40 text-white/30 hover:text-red-400 rounded cursor-pointer transition-colors"
                          title="Delete Commentary"
                        >
                          <Trash size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
