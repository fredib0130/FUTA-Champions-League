import React from 'react';
import { motion } from 'motion/react';
import { Match, Team } from '../types';
import { TEAMS } from '../data/mockData';
import { cn } from '../lib/utils';

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const homeTeam = TEAMS.find(t => t.id === match.homeTeamId);
  const awayTeam = TEAMS.find(t => t.id === match.awayTeamId);

  if (!homeTeam || !awayTeam) return null;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="glass rounded-3xl p-6 relative overflow-hidden"
    >
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
          <img src={homeTeam.logo} alt={homeTeam.name} className="w-16 h-16 mb-3" />
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
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center flex-1 text-center">
          <img src={awayTeam.logo} alt={awayTeam.name} className="w-16 h-16 mb-3" />
          <h3 className="font-bold text-sm tracking-tight">{awayTeam.name}</h3>
        </div>
      </div>
    </motion.div>
  );
}
