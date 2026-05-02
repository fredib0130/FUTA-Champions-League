import React from 'react';
import { motion } from 'motion/react';
import { Match, Team } from '../types';
import { TEAMS, COEFFICIENTS } from '../data/mockData';
import { cn } from '../lib/utils';
import { Trophy } from 'lucide-react';

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const homeTeam = TEAMS.find(t => t.id === match.homeTeamId);
  const awayTeam = TEAMS.find(t => t.id === match.awayTeamId);
  const homeCoeff = COEFFICIENTS.find(c => c.teamId === match.homeTeamId);
  const awayCoeff = COEFFICIENTS.find(c => c.teamId === match.awayTeamId);
  const homePot = homeTeam.pot;
  const awayPot = awayTeam.pot;

  if (!homeTeam || !awayTeam) return null;

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

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="glass rounded-3xl p-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {narrativeLabel && (
        <div className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-xl text-[8px] font-black uppercase tracking-widest border border-t-0 z-20",
          narrativeLabel.class
        )}>
          {narrativeLabel.label}
        </div>
      )}

      {match.status === 'LIVE' && (
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-xs font-bold text-red-500">LIVE</span>
        </div>
      )}

      <div className="flex items-center justify-between space-x-4">
        {/* Home Team */}
        <div className="flex flex-col items-center flex-1 text-center">
          <div className="relative mb-3">
            <img src={homeTeam.logo} alt={homeTeam.name} className="w-16 h-16" />
            {homeTeam.id === 'mst' && (
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
          <div className="text-sm font-bold text-white/40 mb-1">{match.time}</div>
          <div className={cn(
            "font-display text-4xl font-bold px-4 tracking-tighter",
            match.status === 'FINISHED' ? "text-white" : "text-primary"
          )}>
            {match.status === 'UPCOMING' ? 'VS' : `${match.homeScore} - ${match.awayScore}`}
          </div>
          <div className="text-[10px] font-bold text-white/20 mt-2 tracking-widest">{match.venue}</div>
          
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
            <img src={awayTeam.logo} alt={awayTeam.name} className="w-16 h-16" />
            {awayTeam.id === 'mst' && (
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
    </motion.div>
  );
}
