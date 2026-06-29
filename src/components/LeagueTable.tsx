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
  const { teams, matches, isLiveTableActive, officialTeams } = useMatchState();

  const liveSortedTeams = React.useMemo(() => {
    return [...teams].sort((a, b) => {
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
      // 11. team_name ASC (alphabetical by team abbreviation/id)
      return a.id.localeCompare(b.id);
    });
  }, [teams]);

  const officialSortedTeams = React.useMemo(() => {
    return [...officialTeams].sort((a, b) => {
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
      // 11. team_name ASC (alphabetical by team abbreviation/id)
      return a.id.localeCompare(b.id);
    });
  }, [officialTeams]);

  const displayTeams = limit ? liveSortedTeams.slice(0, limit) : liveSortedTeams;

  return (
    <div className="space-y-4">
      {isLiveTableActive && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-white animate-pulse gap-3">
          <div className="flex items-center space-x-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="font-display font-black tracking-wider text-sm text-red-500 uppercase">
              🔴 LIVE TABLE
            </span>
          </div>
          <span className="text-xs text-white/70 italic font-medium">
            Standings are provisional and subject to change.
          </span>
        </div>
      )}

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

              if (team.isDisqualified) {
                statusColor = 'bg-red-650/40 text-red-500 border-red-500/50';
                statusLabel = 'Disqualified';
                rowBg = 'bg-red-950/25 opacity-70';
              } else if (pos <= 2) {
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
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] font-bold text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
                          {team.id.toUpperCase()}
                        </span>
                        <span className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">
                          {team.name}
                        </span>

                        {isLiveTableActive && (() => {
                          const officialIndex = officialSortedTeams.findIndex(t => t.id === team.id);
                          const officialRank = officialIndex !== -1 ? officialIndex + 1 : pos;
                          if (pos < officialRank) {
                            return (
                              <span className="inline-flex items-center text-green-500 font-bold font-mono text-xs ml-2" title="Provisional standing: Rising">
                                🟢 ▲ <span className="text-[9px] ml-1 font-sans text-green-400/80 font-medium hidden sm:inline">Rising</span>
                              </span>
                            );
                          } else if (pos > officialRank) {
                            return (
                              <span className="inline-flex items-center text-red-500 font-bold font-mono text-xs ml-2" title="Provisional standing: Falling">
                                🔴 ▼ <span className="text-[9px] ml-1 font-sans text-red-400/80 font-medium hidden sm:inline">Falling</span>
                              </span>
                            );
                          } else {
                            return (
                              <span className="inline-flex items-center text-gray-500 font-bold font-mono text-xs ml-2" title="Provisional standing: No Change">
                                ⚪ <span className="text-[9px] ml-1 font-sans text-gray-500/60 font-medium hidden sm:inline">No Change</span>
                              </span>
                            );
                          }
                        })()}
                      </div>
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
    </div>
  );
}
