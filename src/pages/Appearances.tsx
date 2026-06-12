import React, { useState, useEffect, useMemo } from 'react';
import { Search, Shield, Award, User, RefreshCw, BarChart2, Hash, Calendar, Trophy, Zap, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ServerPlayer {
  id: number;
  name: string;
  team: string;
  position: string;
  matric_number: string;
  appearances: number;
}

export function Appearances() {
  const [players, setPlayers] = useState<ServerPlayer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState<number>(5);

  // Load instances from `/api/players/appearances`
  const loadAppearances = async (showLoadingIndicator = false) => {
    if (showLoadingIndicator) setLoading(true);
    try {
      const res = await fetch('/api/players/appearances');
      if (!res.ok) throw new Error('Failed to reach appearances database server');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPlayers(data);
        setError(null);
      } else {
        throw new Error('Invalid format returned from appearances server');
      }
    } catch (err: any) {
      console.error('[Appearances Tracker] Fetch failed:', err);
      setError(err.message || 'Appearances database connection offline');
    } finally {
      if (showLoadingIndicator) setLoading(false);
      setLastRefreshed(new Date());
      setCountdown(5);
    }
  };

  // Poll server-side every 5 seconds + countdown ticker
  useEffect(() => {
    loadAppearances(true);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadAppearances(false);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
    };
  }, []);

  // Compute stats lists
  const availableTeams = useMemo(() => {
    const list = new Set<string>();
    players.forEach(p => { if (p.team) list.add(p.team.toUpperCase()); });
    return ['ALL', ...Array.from(list).sort()];
  }, [players]);

  const stats = useMemo(() => {
    if (players.length === 0) return { totalPlayers: 0, totalApps: 0, topPlayer: { name: 'N/A', team: '', apps: 0 }, mostActiveTeam: 'N/A' };
    
    let totalApps = 0;
    let topPlayer = { name: 'N/A', team: 'N/A', apps: 0 };
    const teamAppCounter: Record<string, number> = {};

    players.forEach(p => {
      totalApps += p.appearances;
      
      if (p.appearances > topPlayer.apps) {
        topPlayer = { name: p.name, team: p.team, apps: p.appearances };
      }

      if (p.team) {
        teamAppCounter[p.team] = (teamAppCounter[p.team] || 0) + p.appearances;
      }
    });

    let topTeam = 'N/A';
    let topTeamApps = -1;
    Object.entries(teamAppCounter).forEach(([team, sum]) => {
      if (sum > topTeamApps) {
        topTeamApps = sum;
        topTeam = team;
      }
    });

    return {
      totalPlayers: players.length,
      totalApps,
      topPlayer,
      mostActiveTeam: topTeamApps > 0 ? `${topTeam} (${topTeamApps} apps)` : 'N/A'
    };
  }, [players]);

  // Filters calculation
  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      const matchSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.matric_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.team.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchTeam = selectedTeam === 'ALL' || p.team.toUpperCase() === selectedTeam.toUpperCase();
      const matchPos = selectedPosition === 'ALL' || p.position.toUpperCase() === selectedPosition.toUpperCase();

      return matchSearch && matchTeam && matchPos;
    });
  }, [players, searchQuery, selectedTeam, selectedPosition]);

  return (
    <div id="appearances-container" className="relative min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1d] to-[#04060d] text-white pt-12">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1500&auto=format&fit=crop')] bg-cover bg-center opacity-[0.02] pointer-events-none" />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                Live Sync Active
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                Refresh in {countdown}s
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display italic font-black uppercase tracking-tight leading-none text-glow mb-3">
              FCL 2026 <span className="text-primary italic">Appearances Tracker</span>
            </h1>
            <p className="text-sm text-white/50 max-w-xl">
              Dynamically monitoring every player who officially sets foot on the field—either as a starter or active substitution. Unused bench reserves are excluded automatically.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl md:self-center">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <RefreshCw className={cn("w-5 h-5 text-primary", loading && "animate-spin")} onClick={() => loadAppearances(true)} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Database Status</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Synchronized Storage
              </div>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-300 text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold">Sync Alert: </span> {error}. Using client caching fallback.
            </div>
          </div>
        )}

        {/* Stats Summary Bento Layer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <div className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-[#00e5ff]/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] pointer-events-none transition-all duration-300 group-hover:scale-110" />
            <User className="w-5 h-5 text-white/40 mb-4" />
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Players Logged</div>
            <div className="text-3xl font-display font-black tracking-tight">{stats.totalPlayers}</div>
            <div className="text-[10px] text-white/30 mt-2">Unique squad rosters registered</div>
          </div>

          <div className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-[#00e5ff]/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] pointer-events-none transition-all duration-300 group-hover:scale-110" />
            <Calendar className="w-5 h-5 text-white/40 mb-4" />
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Total Appearances</div>
            <div className="text-3xl font-display font-black tracking-tight text-glow-primary text-primary">{stats.totalApps}</div>
            <div className="text-[10px] text-white/30 mt-2">Combined cumulative player games</div>
          </div>

          <div className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300 col-span-1 sm:col-span-1 lg:col-span-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[150px] pointer-events-none transition-all duration-300 group-hover:scale-110" />
            <Trophy className="w-5 h-5 text-amber-500 mb-4" />
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Most Resilient Outing</div>
            <div className="text-lg font-display italic uppercase font-black tracking-tight text-amber-400 mt-1 leading-snug truncate">
              {stats.topPlayer.name}
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold">Team {stats.topPlayer.team}</span>
              <span className="text-xs font-mono font-bold text-white/70">{stats.topPlayer.apps} Appearances</span>
            </div>
          </div>
          
        </div>

        {/* Filters Panel Container */}
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search by player name, matric / jersey, team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/40 border border-white/5 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/20 text-white font-medium"
            />
          </div>

          {/* Quick Dropdown Selectors */}
          <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
            
            {/* Team Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 hidden sm:inline">Team</span>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full sm:w-32 bg-slate-950/40 border border-white/5 px-3 py-3 rounded-xl text-xs font-black uppercase text-glow-primary tracking-wide focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                {availableTeams.map(team => (
                  <option key={team} value={team} className="bg-slate-900 font-bold uppercase py-2">
                    {team === 'ALL' ? 'ALL TEAMS' : team}
                  </option>
                ))}
              </select>
            </div>

            {/* Position Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 hidden sm:inline">Pos</span>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full sm:w-32 bg-slate-950/40 border border-white/5 px-3 py-3 rounded-xl text-xs font-black uppercase tracking-wide focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 py-2">ALL ROLES</option>
                <option value="GK" className="bg-slate-900 py-2">GOALKEEPER (GK)</option>
                <option value="DEF" className="bg-slate-900 py-2">DEFENDER (DEF)</option>
                <option value="MID" className="bg-slate-900 py-2">MIDFIELDER (MID)</option>
                <option value="FWD" className="bg-slate-900 py-2">FORWARD (FWD)</option>
              </select>
            </div>
            
          </div>
        </div>

        {/* Players Appearances Grid Table */}
        <div className="glass rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="py-5 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest text-center w-20">Rank</th>
                  <th className="py-5 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest text-left">Player Info</th>
                  <th className="py-5 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest text-center w-32">Team Badge</th>
                  <th className="py-5 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest text-center w-32">Position</th>
                  <th className="py-5 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest text-left w-48">Registry Matric ID</th>
                  <th className="py-5 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest text-center w-36">Appearances</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {loading && players.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                        <span className="text-sm font-sans text-white/40">Querying real-time FCL database records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20 text-white/30 font-display italic text-lg uppercase tracking-wide">
                      No matching player appearances discovered
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((player, idx) => {
                    const originalRank = players.findIndex(p => p.id === player.id) + 1;
                    const isTop3 = originalRank <= 3;
                    
                    return (
                      <motion.tr
                        key={player.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                        className="hover:bg-white/[0.015] transition-colors"
                      >
                        {/* Rank */}
                        <td className="py-4.5 px-6 text-center">
                          <div className="flex justify-center items-center">
                            {isTop3 ? (
                              <div className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center font-display italic font-black text-xs relative",
                                originalRank === 1 && "bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
                                originalRank === 2 && "bg-slate-300/10 border border-slate-300/30 text-slate-300",
                                originalRank === 3 && "bg-amber-700/10 border border-amber-700/30 text-amber-600"
                              )}>
                                {originalRank}
                              </div>
                            ) : (
                              <span className="font-mono text-sm font-bold text-white/30">{originalRank}</span>
                            )}
                          </div>
                        </td>

                        {/* Player name */}
                        <td className="py-4.5 px-6 font-display font-bold uppercase tracking-tight text-white group-hover:text-primary leading-tight">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-xs uppercase text-white/50 shrink-0">
                              {player.name.substring(0, 2)}
                            </div>
                            <div>
                              <span className="text-sm block md:text-base">{player.name}</span>
                              <span className="text-[9px] text-[#00e5ff] font-mono leading-none tracking-widest font-black uppercase inline-block border border-[#00e5ff]/20 bg-[#00e5ff]/5 px-1 py-0.5 mt-1 rounded md:hidden">
                                {player.team} • {player.position}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* TeamBadge */}
                        <td className="py-4.5 px-6 text-center">
                          <span className={cn(
                            "px-3 py-1 border rounded-lg text-xs font-black font-mono tracking-widest shadow-sm uppercase inline-block",
                            player.team === 'MST' ? 'bg-[#ffc107]/10 text-[#ffc107] border-[#ffc107]/20' : 
                            player.team === 'ICE' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                            player.team === 'AGE' ? 'bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/20' :
                            'bg-white/5 text-white/70 border-white/10'
                          )}>
                            {player.team || 'FCL'}
                          </span>
                        </td>

                        {/* Position */}
                        <td className="py-4.5 px-6 text-center">
                          <span className={cn(
                            "text-[10px] font-black uppercase px-2.5 py-1 rounded-md border",
                            player.position === 'GK' && 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                            player.position === 'DEF' && 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                            player.position === 'MID' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                            player.position === 'FWD' && 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          )}>
                            {player.position}
                          </span>
                        </td>

                        {/* Matric Number */}
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-white/50 tracking-normal select-all">
                              {player.matric_number || 'N/A'}
                            </span>
                          </div>
                        </td>

                        {/* Appearances */}
                        <td className="py-4.5 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={cn(
                              "text-base md:text-lg font-display italic font-black text-glow",
                              player.appearances > 0 ? "text-primary" : "text-white/20"
                            )}>
                              {player.appearances}
                            </span>
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest hidden sm:inline">matches</span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Rules section */}
        <div className="mt-12 bg-white/[0.01] border border-white/5 rounded-3xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#00e5ff] mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Official FCL Appearances Directive Rules
          </h3>
          <ul className="space-y-2.5 text-xs text-white/40 list-disc list-inside">
            <li><strong className="text-white/70">Participation Threshold:</strong> One appearance is mapped automatically if a player completes a minimum of one second of active play.</li>
            <li><strong className="text-white/70">Unused Sub Rules:</strong> Players listed on the secondary bench roster but who never enter the sandbox of play are NOT credited with appearances.</li>
            <li><strong className="text-white/70">Subbed Out Players:</strong> Players who started the match and are subsequently substituted off maintain their full game credit (+1) of the match appearances.</li>
            <li><strong className="text-white/70">Auto-Update Cycle:</strong> App sync is triggered directly from matchday commissioner consoles upon setting state of play to finished.</li>
          </ul>
        </div>
        
      </section>
    </div>
  );
}
