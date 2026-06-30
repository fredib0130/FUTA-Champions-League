import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Match, Team } from '../types';
import { COEFFICIENTS } from '../data/mockData';
import { cn } from '../lib/utils';
import { Trophy, ChevronDown, ChevronUp, Radio } from 'lucide-react';
import { useMatchState } from '../context/MatchStateContext';
import { Link } from 'react-router-dom';
import { TeamLogo } from './TeamLogo';

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match: initialMatch }: MatchCardProps) {
  const { teams, detailedStats, activeMinAndStatus, matches } = useMatchState();
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch from live state list
  const match = matches.find(m => m.id === initialMatch.id) || initialMatch;

  const getDisplayTeam = (teamId: string) => {
    const existing = teams.find(t => t.id.toLowerCase() === teamId.toLowerCase());
    if (existing) return existing;

    const idUpper = teamId.toUpperCase();
    if (idUpper.startsWith('SEED')) {
      const num = idUpper.replace('SEED', '');
      return {
        id: teamId,
        name: `Seed ${num}`,
        logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=S${num}`,
        group: '',
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        form: [],
        description: 'Knockout Seed'
      } as Team;
    }
    if (idUpper.endsWith('_WINNER')) {
      const matchId = idUpper.replace('_WINNER', '');
      return {
        id: teamId,
        name: `Winner of ${matchId}`,
        logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${matchId}`,
        group: '',
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        form: [],
        description: 'Tournament Challenger'
      } as Team;
    }

    return {
      id: teamId,
      name: teamId,
      logoUrl: null,
      group: '',
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [],
      description: 'Placeholder'
    } as Team;
  };

  // Aggregate score calculation helper for two-legged semi-finals
  const getSemiFinalAggregate = () => {
    if (!match.id.startsWith('SF')) return null;
    const sfPrefix = match.id.split('_')[0];
    const leg1 = matches.find(m => m.id === sfPrefix + '_1');
    const leg2 = matches.find(m => m.id === sfPrefix + '_2');
    if (!leg1 || !leg2) return null;

    const teamA = getDisplayTeam(leg1.homeTeam);
    const teamB = getDisplayTeam(leg1.awayTeam);

    const isLeg1Played = leg1.status !== 'Upcoming' && leg1.status !== 'Postponed' && leg1.status !== 'Cancelled';
    const isLeg2Played = leg2.status !== 'Upcoming' && leg2.status !== 'Postponed' && leg2.status !== 'Cancelled';

    if (!isLeg1Played && !isLeg2Played) return null;

    const scoreA1 = isLeg1Played ? leg1.homeScore : 0;
    const scoreB1 = isLeg1Played ? leg1.awayScore : 0;
    const scoreB2 = isLeg2Played ? leg2.homeScore : 0;
    const scoreA2 = isLeg2Played ? leg2.awayScore : 0;

    const totalA = scoreA1 + scoreA2;
    const totalB = scoreB1 + scoreB2;

    let aggregateText = `Agg: ${teamA.name} ${totalA} - ${totalB} ${teamB.name}`;
    
    const isLeg2Finished = leg2.status === 'Finished' || leg2.status === 'Full Time' || leg2.status === 'Full-Time';
    if (isLeg2Finished && totalA === totalB && leg2.homePenalties !== undefined && leg2.awayPenalties !== undefined) {
      aggregateText += ` (${leg2.awayPenalties} - ${leg2.homePenalties} pens)`;
    }

    return { text: aggregateText, isSecondLeg: match.id.endsWith('_2') };
  };

  const aggregateInfo = getSemiFinalAggregate();

  const homeTeam = getDisplayTeam(match.homeTeam);
  const awayTeam = getDisplayTeam(match.awayTeam);
  const homeCoeff = homeTeam ? COEFFICIENTS.find(c => c.teamId === homeTeam.id) : undefined;
  const awayCoeff = awayTeam ? COEFFICIENTS.find(c => c.teamId === awayTeam.id) : undefined;

  const stats = detailedStats[match.id];
  const liveTimer = activeMinAndStatus[match.id];
  const liveMinute = liveTimer ? liveTimer.liveMinute : 'Live';

  const homePot = homeTeam.pot;
  const awayPot = awayTeam.pot;

  const getNarrativeLabel = (hRank: number | undefined, aRank: number | undefined, hPot: string | undefined, aPot: string | undefined) => {
    if (!hRank || !aRank) return null;
    
    // Pot based narratives
    if (hPot === 'A' && aPot === 'A') return { label: 'Top Seed Clash', class: 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_15px_rgba(255,200,0,0.1)]' };
    if ((hPot === 'A' && aPot === 'D') || (aPot === 'A' && hPot === 'D')) return { label: 'Upset Watch', class: 'bg-red-500/10 text-red-400 border-red-500/30' };
    if ((hPot === 'B' && aPot === 'C') || (aPot === 'B' && hPot === 'C')) return { label: 'Balanced Fixture', class: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };

    // Elite vs Underdog (Coefficient based)
    if ((hRank <= 5 && aRank >= 20) || (aRank <= 5 && hRank >= 20)) {
      return { label: 'Underdog vs Elite', class: 'bg-orange-500/10 text-orange-400 border-orange-500/30' };
    }
    
    // High Coefficient Clash
    if (hRank <= 8 && aRank <= 8) {
      return { label: 'High Coefficient Clash', class: 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_15px_rgba(255,200,0,0.1)]' };
    }

    return null;
  };

  const narrativeLabel = getNarrativeLabel(homeCoeff?.rank, awayCoeff?.rank, homePot, awayPot);

  const getSeedLabel = (rank: number | undefined, pot: string | undefined) => {
    if (pot) return { label: `Pot ${pot}`, class: pot === 'A' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 text-white/40 border-white/10' };
    if (!rank) return null;
    if (rank <= 5) return { label: 'Top Seed', class: 'bg-primary/20 text-primary border-primary/30' };
    if (rank >= 20) return { label: 'Underdog', class: 'bg-white/5 text-white/40 border-white/10' };
    return null;
  };

  const homeLabel = getSeedLabel(homeCoeff?.rank, homePot);
  const awayLabel = getSeedLabel(awayCoeff?.rank, awayPot);

  const higherSeedAdvantage = (homePot === 'A' && awayPot !== 'A') ? homeTeam.name : (awayPot === 'A' && homePot !== 'A') ? awayTeam.name : null;

  // Advanced Logic: Match Importance Score & Fixture Difficulty
  const getMatchMetrics = () => {
    const potValues = { A: 4, B: 3, C: 2, D: 1 };
    const hVal = potValues[homePot as keyof typeof potValues] || 0;
    const aVal = potValues[awayPot as keyof typeof potValues] || 0;
    
    // Importance: higher pots = higher importance
    const importance = (hVal + aVal) * 1.25; 
    // Difficulty: average of pot strengths
    const difficulty = (hVal + aVal) / 2;
    
    return { 
      importance: importance.toFixed(1), 
      difficulty: difficulty.toFixed(1),
      isHighStakes: importance >= 7.5
    };
  };

  const metrics = getMatchMetrics();
  const isOpeningMatch = match.id === 'md1-1';

  const getStageBadge = () => {
    const idUpper = match.id.toUpperCase();
    if (idUpper.startsWith('PO') || match.stage === 'Playoff Round') {
      return { label: 'Playoff Round', emoji: '🟧', class: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    }
    if (idUpper.startsWith('QF') || match.stage === 'Quarter-finals') {
      return { label: 'Quarter-finals', emoji: '🟪', class: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    }
    if (idUpper.startsWith('SF') || match.stage === 'Semi-finals') {
      return { label: 'Semi-finals', emoji: '🟥', class: 'bg-red-500/10 text-red-400 border-red-500/20' };
    }
    if (idUpper === 'FINAL' || match.stage === 'Final') {
      return { label: 'Final', emoji: '🟨', class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    }
    return { label: 'League Phase', emoji: '🟦', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
  };

  const stageBadge = getStageBadge();

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={cn(
        "glass rounded-3xl p-6 relative overflow-hidden group",
        isOpeningMatch && "border-primary/40 bg-primary/5 shadow-[0_0_30px_rgba(0,229,255,0.1)]"
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {stageBadge && (
        <div className={cn(
          "absolute top-4 left-4 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5 z-20",
          stageBadge.class
        )}>
          <span>{stageBadge.emoji}</span>
          <span>{stageBadge.label}</span>
          {(match.id.startsWith('PO') || match.id.startsWith('QF') || match.id.startsWith('SF')) && (
            <span className="font-mono font-black opacity-80 border-l border-white/20 pl-1.5 ml-1">{match.id}</span>
          )}
        </div>
      )}

      {isOpeningMatch && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-primary text-dark rounded-b-2xl text-[10px] font-black uppercase tracking-[0.2em] z-30 shadow-lg">
          Season Opener
        </div>
      )}

      {narrativeLabel && !isOpeningMatch && (
        <div className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-xl text-[8px] font-black uppercase tracking-widest border border-t-0 z-20",
          narrativeLabel.class
        )}>
          {narrativeLabel.label}
        </div>
      )}

      {match.status === 'Live' && (
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-xs font-bold text-red-500">LIVE</span>
        </div>
      )}

      <div className="flex items-center justify-between space-x-4 mt-8">
        {/* Home Team */}
        <div className="flex flex-col items-center flex-1 text-center">
          <div className="relative mb-3">
            {homeTeam ? (
              <TeamLogo teamId={homeTeam.id} logoUrl={homeTeam.logoUrl} size="lg" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white/30 font-mono text-xl font-black">?</div>
            )}
            {homeTeam && homeTeam.id === 'mst' && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1 border border-dark animate-bounce">
                <Trophy size={10} className="text-dark" />
              </div>
            )}
            {homeLabel && (
              <div className={cn(
                "absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded border text-[7px] font-black uppercase tracking-tighter whitespace-nowrap",
                homeLabel.class
              )}>
                {homeLabel.label}
              </div>
            )}
          </div>
          <h3 className="font-bold text-sm tracking-tight">{homeTeam.name}</h3>
        </div>

        {/* Score/VS */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-black uppercase tracking-widest text-primary mb-1 flex items-center gap-1">
            {match.status === 'Live' ? (
              <span className="flex items-center gap-1.5 text-red-500 animate-pulse font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                {liveMinute}
              </span>
            ) : match.status === 'Half Time' ? (
              <span className="text-yellow-400 font-mono">
                {liveMinute && liveMinute.startsWith('HT') ? `HT • ${liveMinute.replace("HT ", "")}` : 'HALFTIME'}
              </span>
            ) : match.walkover ? (
              <span className="text-amber-500 font-bold tracking-wider text-[10px]">WALKOVER</span>
            ) : match.status === 'Finished' ? (
              <span className="text-white/40 font-mono">FT</span>
            ) : match.status === 'Interrupted' ? (
              <span className="text-amber-500 font-black tracking-wider text-[10px] animate-pulse flex items-center gap-1">🟠 INTERRUPTED (50')</span>
            ) : match.status === 'Postponed' ? (
              <span className="text-amber-500 font-bold tracking-wider animate-pulse text-[10px]">POSTPONED</span>
            ) : match.status === 'Cancelled' ? (
              <span className="text-red-500 font-bold tracking-wider text-[10px]">CANCELLED</span>
            ) : (
              <span className="text-white/40">{match.time}</span>
            )}
          </div>
          <div className={cn(
             "font-display text-4xl font-bold px-4 tracking-tighter flex flex-col items-center",
             (match.status === 'Finished' || match.status === 'Interrupted') ? "text-white" : "text-primary"
          )}>
            <span>{(match.status === 'Upcoming' || match.status === 'Postponed' || match.status === 'Cancelled') ? 'VS' : `${match.homeScore} - ${match.awayScore}`}</span>
            {(match.homePenalties !== undefined && match.awayPenalties !== undefined) && (
              <span className="text-[10px] text-amber-400 font-sans font-black tracking-widest uppercase mt-1 leading-none">
                ({match.homePenalties}-{match.awayPenalties} pens)
              </span>
            )}
            {aggregateInfo && (
              <span className={cn(
                "text-[9px] font-sans font-black tracking-widest uppercase mt-2 px-2.5 py-1 rounded-md text-center inline-block",
                aggregateInfo.isSecondLeg ? "bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/20" : "bg-white/5 text-white/40 border border-white/5"
              )}>
                {aggregateInfo.text}
              </span>
            )}
          </div>
          <div className="text-[10px] font-bold text-white/20 mt-2 tracking-widest">
            {match.date === 'TBA' ? 'DATE: TBA' : match.date} • {match.venue}
          </div>
          
          {match.referee && (
            <div className="mt-1.5 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md text-[8px] font-black tracking-widest text-primary uppercase inline-block">
              👮 Ref: {match.referee}
            </div>
          )}
          
          <div className="mt-4 flex flex-col items-center space-y-2">
            {higherSeedAdvantage && (
              <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20 animate-pulse">
                <span className="text-[7px] font-black text-primary uppercase tracking-widest whitespace-nowrap">Higher Seed Advantage: {higherSeedAdvantage}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-center">
                <span className="text-[6px] font-black text-white/20 uppercase tracking-tighter">Match Importance</span>
                <span className={cn(
                  "text-[10px] font-black italic",
                  metrics.isHighStakes ? "text-primary" : "text-white/40"
                )}>{metrics.importance}/10</span>
              </div>
              <div className="w-[1px] h-4 bg-white/5" />
              <div className="flex flex-col items-center">
                <span className="text-[6px] font-black text-white/20 uppercase tracking-tighter">Difficulty Rating</span>
                <span className="text-[10px] font-black text-white/40 italic">{metrics.difficulty}/4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center flex-1 text-center">
          <div className="relative mb-3">
            {awayTeam ? (
              <TeamLogo teamId={awayTeam.id} logoUrl={awayTeam.logoUrl} size="lg" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white/30 font-mono text-xl font-black">?</div>
            )}
            {awayTeam && awayTeam.id === 'mst' && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1 border border-dark animate-bounce">
                <Trophy size={10} className="text-dark" />
              </div>
            )}
            {awayLabel && (
              <div className={cn(
                "absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded border text-[7px] font-black uppercase tracking-tighter whitespace-nowrap",
                awayLabel.class
              )}>
                {awayLabel.label}
              </div>
            )}
          </div>
          <h3 className="font-bold text-sm tracking-tight">{awayTeam.name}</h3>
        </div>
      </div>

      {/* Expanded Match Stats */}
      {isExpanded && stats && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 pt-6 border-t border-white/5 space-y-4"
        >
          <p className="text-[10px] font-bold text-center tracking-widest text-primary uppercase">
            Match Statistics
          </p>
          
          <div className="grid grid-cols-3 gap-y-4 items-center text-center">
            {/* Corners */}
            <div className="text-sm font-mono font-bold text-white">
              {stats.cornersHome}
            </div>
            <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center justify-center gap-1">
              <span>🚩</span> Corners
            </div>
            <div className="text-sm font-mono font-bold text-white">
              {stats.cornersAway}
            </div>

            {/* Yellow Cards */}
            <div className="text-sm font-mono font-bold text-white">
              {stats.yellowCardsHome}
            </div>
            <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span className="w-2 h-3 bg-yellow-400 rounded-sm inline-block shadow-sm" /> Yellows
            </div>
            <div className="text-sm font-mono font-bold text-white">
              {stats.yellowCardsAway}
            </div>

            {/* Red Cards */}
            <div className="text-sm font-mono font-bold text-white">
              {stats.redCardsHome}
            </div>
            <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span className="w-2 h-3 bg-red-500 rounded-sm inline-block shadow-sm" /> Red Cards
            </div>
            <div className="text-sm font-mono font-bold text-white">
              {stats.redCardsAway}
            </div>
          </div>
        </motion.div>
      )}

      {match.note && (
        <div className="mt-4 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-sans font-medium uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm">
          <span>⚠️ Note: {match.note}</span>
        </div>
      )}

      {match.manOfTheMatch && (
        <div className="mt-4 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-yellow-500/10 via-[#00e5ff]/10 to-yellow-500/10 border border-yellow-500/20 flex items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-[14px]">🏅</span>
            <div>
              <span className="text-[7px] font-black text-yellow-400 uppercase tracking-widest block">MAN OF THE MATCH (MOTM)</span>
              <span className="text-xs font-black text-white">{match.manOfTheMatch}</span>
            </div>
          </div>
          <span className="text-[8px] font-bold text-white/55 font-mono bg-yellow-500/20 px-2.5 py-0.5 rounded-full border border-yellow-500/20 animate-pulse uppercase tracking-widest">
            MVP
          </span>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-3">
          <Link
            to={`/matches/${match.id}`}
            className="text-[10px] font-black bg-white/5 border border-white/10 hover:border-primary/50 text-white hover:text-primary transition-all duration-300 px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5"
          >
            <Radio size={10} className="text-primary" />
            <span>Match Center</span>
          </Link>
          
          {localStorage.getItem('fcl_admin_user') && (
            <Link
              to={`/admin/matches/${match.id}`}
              className="text-[10px] font-black bg-primary/10 border border-primary/20 hover:bg-primary text-primary hover:text-dark transition-all duration-300 px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1"
            >
              <span>Admin Desk ⚙️</span>
            </Link>
          )}
        </div>

        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="text-[9px] font-black text-white/40 hover:text-primary transition-colors flex items-center space-x-1 uppercase tracking-widest cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Match Stats' : 'View Match Stats'}</span>
          {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>
      </div>
    </motion.div>
  );
}
