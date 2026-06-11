import React from 'react';
import { motion } from 'motion/react';
import { Team } from '../types';
import { useMatchState } from '../context/MatchStateContext';
import { TeamLogo } from './TeamLogo';

interface LeagueTableProps {
  limit?: number;
  showFull?: boolean;
}

export function LeagueTable({ limit, showFull = false }: LeagueTableProps) {
  const { teams } = useMatchState();
  const sortedTeams = [...teams].sort((a, b) => {
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
    // 11. team_name ASC (alphabetical by team abbreviation/id)
    return a.id.localeCompare(b.id);
  });

  const displayTeams = limit ? sortedTeams.slice(0, limit) : sortedTeams;

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-navy/50 backdrop-blur-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 bg-white/5 uppercase text-[10px] font-bold tracking-widest text-gray-400">
            <th className="px-4 py-4 text-center">Pos</th>
            <th className="px-4 py-4">Team</th>
            <th className="px-4 py-4 text-center">P</th>
            {showFull && (
              <>
                <th className="px-4 py-4 text-center">W</th>
                <th className="px-4 py-4 text-center">D</th>
                <th className="px-4 py-4 text-center">L</th>
                <th className="px-4 py-4 text-center">GF</th>
                <th className="px-4 py-4 text-center">GA</th>
                <th className="px-4 py-4 text-center">GD</th>
                <th className="px-4 py-4 text-center text-yellow-500 font-bold">YC</th>
                <th className="px-4 py-4 text-center text-red-500 font-bold">RC</th>
              </>
            )}
            <th className="px-4 py-4 text-center font-bold text-white">PTS</th>
            {showFull && (
              <>
                <th className="px-4 py-4 text-center">Form</th>
                <th className="px-4 py-4 text-left">Status</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {displayTeams.map((team, index) => {
            const pos = index + 1;
            let statusColor = 'text-gray-400';
            let statusLabel = '';
            let rowBg = '';

            if (pos <= 2) {
              statusColor = 'bg-green-500/20 text-green-500 border-green-500/50';
              statusLabel = 'Quarter-Finals';
              rowBg = 'bg-green-500/[0.02]';
            } else if (pos <= 14) {
              statusColor = 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
              statusLabel = 'Playoff Zone';
              rowBg = 'bg-yellow-500/[0.02]';
            } else if (pos >= 15) {
              statusColor = 'bg-red-500/20 text-red-500 border-red-500/50';
              statusLabel = 'Eliminated';
              rowBg = 'bg-red-500/[0.02]';
            }

            return (
              <motion.tr
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={team.id}
                className={`hover:bg-white/5 transition-colors group ${rowBg}`}
              >
                <td className="px-4 py-4 text-center font-mono font-bold">
                  <span className={`
                    inline-flex items-center justify-center w-6 h-6 rounded-full text-xs border
                    ${statusColor}
                  `}>
                    {pos}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <TeamLogo teamId={team.id} logoUrl={team.logoUrl} size="sm" />
                    <span className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">
                      {team.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center font-mono text-sm text-gray-400">{team.played}</td>
                {showFull && (
                  <>
                    <td className="px-4 py-4 text-center font-mono text-sm text-gray-400">{team.won}</td>
                    <td className="px-4 py-4 text-center font-mono text-sm text-gray-400">{team.drawn}</td>
                    <td className="px-4 py-4 text-center font-mono text-sm text-gray-400">{team.lost}</td>
                    <td className="px-4 py-4 text-center font-mono text-sm text-gray-400">{team.goalsFor}</td>
                    <td className="px-4 py-4 text-center font-mono text-sm text-gray-400">{team.goalsAgainst}</td>
                    <td className="px-4 py-4 text-center font-mono text-sm text-gray-400">
                      <span className={team.goalDifference > 0 ? 'text-green-500' : team.goalDifference < 0 ? 'text-red-500' : ''}>
                        {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-sm text-yellow-500 font-bold">{team.yellowCards || 0}</td>
                    <td className="px-4 py-4 text-center font-mono text-sm text-red-500 font-bold">{team.redCards || 0}</td>
                  </>
                )}
                <td className="px-4 py-4 text-center font-mono font-bold text-white">{team.points}</td>
                {showFull && (
                  <>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center space-x-1">
                        {team.form.map((res, i) => (
                          <span
                            key={i}
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white
                              ${res === 'W' ? 'bg-green-500' : res === 'D' ? 'bg-gray-500' : 'bg-red-500'}
                            `}
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </td>
                  </>
                )}
              </motion.tr>
            );
          })}
        </tbody>
      </table>
      {showFull && (
        <div className="p-4 bg-white/5 border-t border-white/10 flex flex-wrap gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Quarter-Finals (1-2)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Playoff Zone (3-14)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Eliminated (15-20)</span>
          </div>
        </div>
      )}
    </div>
  );
}
