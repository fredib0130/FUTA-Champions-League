import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMatchState, AuditLogItem } from '../context/MatchStateContext';
import { 
  Trophy, LogOut, Radio, Play, Calendar, CheckCircle, Shield, 
  Settings, Users, ClipboardList, Activity, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { 
    currentUser, logout, matches, teams, goalScorers, cards, auditLogs, resetAllData 
  } = useMatchState();
  const navigate = useNavigate();

  // Route guarding
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/admin/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  // Calculatings
  const liveMatches = matches.filter(m => m.status === 'Live' || m.status === 'Half Time');
  const upcomingMatches = matches.filter(m => m.status === 'Upcoming');
  const completedMatches = matches.filter(m => m.status === 'Finished' || m.status === 'Full Time');

  const totalGoals = matches.reduce((acc, curr) => {
    if (curr.status !== 'Upcoming') {
      return acc + (curr.homeScore || 0) + (curr.awayScore || 0);
    }
    return acc;
  }, 0);

  const totalCards = cards.length;

  const handleResetData = () => {
    if (confirm('⚠️ WARNING: This will reset all scores, cards, commentaries, lineups and standing table recalculations back to default opening schedules. Are you absolutely sure?')) {
      resetAllData();
      alert('All matches and standings have been reset successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-navy text-white pb-32">
      {/* Dynamic top bar */}
      <div className="bg-navy-dark border-b border-white/10 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <Shield size={16} className="text-primary animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase text-white tracking-widest">FCL Admin Desk</span>
                <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-md font-bold uppercase">{currentUser.role}</span>
              </div>
              <p className="text-[10px] font-medium text-white/40">Logged in as: {currentUser.username}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleResetData}
              title="Reset All Live State to Default Seed Schedules"
              className="px-3.5 py-1.5 rounded-lg border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={11} />
              <span>Full Reset</span>
            </button>
            
            <button
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              className="p-2.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-black uppercase cursor-pointer"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Banner */}
        <div className="mb-10 p-8 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 to-blue-500/5 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="relative">
            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none">
              <Trophy className="w-full h-full text-primary" />
            </div>
            <h2 className="text-3xl font-display font-black uppercase italic tracking-tight text-white mb-2">
              Match commissioner panel
            </h2>
            <p className="text-sm font-medium text-white/60 max-w-2xl leading-relaxed">
              Welcome back to the operations cockpit. Here you can start live matches, progressive minutes, control scores, issue cards, record substitutions, and approve tactical lineups list in real-time. Standings automatically calculate when a match completes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              to="/admin/accreditation"
              className="flex-shrink-0 px-6 py-4.5 bg-primary hover:bg-primary-hover text-dark font-black tracking-widest text-[10px] uppercase rounded-2xl shadow-[0_4px_20px_rgba(0,229,255,0.25)] hover:shadow-[0_4px_30px_rgba(0,229,255,0.35)] hover:scale-102 active:scale-98 transition-all flex items-center justify-center space-x-2 group cursor-pointer"
            >
              <ShieldCheck size={16} className="text-dark group-hover:rotate-12 transition-transform" />
              <span>ACCREDITATION DESK</span>
            </Link>
            {currentUser?.role === 'Super Admin' && (
              <Link
                to="/admin/team-logos"
                className="flex-shrink-0 px-6 py-4.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black tracking-widest text-[10px] uppercase rounded-2xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Trophy size={16} className="text-primary" />
                <span>LOGO OPERATIONS</span>
              </Link>
            )}
          </div>
        </div>

        {/* Bento Grid Stats Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {/* Live matches widget */}
          <div className="glass rounded-[24px] border border-white/10 p-5 flex flex-col justify-between hover:border-primary/30 transition-all bg-navy/50 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-red-500 animate-pulse">
              <Radio size={18} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">LIVE MATCHES</span>
              <p className="text-3xl font-display font-black text-red-500 mt-2 font-mono">{liveMatches.length}</p>
            </div>
            <div className="text-[10px] text-white/40 mt-4 leading-normal">
              Matches currently ticking in game minutes.
            </div>
          </div>

          {/* Upcoming matches widget */}
          <div className="glass rounded-[24px] border border-white/10 p-5 flex flex-col justify-between hover:border-primary/30 transition-all bg-navy/50 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-primary">
              <Calendar size={18} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">UPCOMING</span>
              <p className="text-3xl font-display font-black text-primary mt-2 font-mono">{upcomingMatches.length}</p>
            </div>
            <div className="text-[10px] text-white/40 mt-4 leading-normal">
              Matches awaiting kickoff confirmation.
            </div>
          </div>

          {/* Completed matches widget */}
          <div className="glass rounded-[24px] border border-white/10 p-5 flex flex-col justify-between hover:border-primary/30 transition-all bg-navy/50 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-green-400">
              <CheckCircle size={18} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">COMPLETED</span>
              <p className="text-3xl font-display font-black text-green-400 mt-2 font-mono">{completedMatches.length}</p>
            </div>
            <div className="text-[10px] text-white/40 mt-4 leading-normal">
              Final-timed matches calculated into table rates.
            </div>
          </div>

          {/* Total Goals widget */}
          <div className="glass rounded-[24px] border border-white/10 p-5 flex flex-col justify-between hover:border-primary/30 transition-all bg-navy/50 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-yellow-400">
              <Trophy size={18} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">TOTAL GOALS</span>
              <p className="text-3xl font-display font-black text-yellow-400 mt-2 font-mono">{totalGoals}</p>
            </div>
            <div className="text-[10px] text-white/40 mt-4 leading-normal">
              Netted ball counts this season.
            </div>
          </div>

          {/* Total Cards widget */}
          <div className="glass rounded-[24px] border border-white/10 p-5 flex flex-col justify-between hover:border-primary/30 transition-all bg-navy/50 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-orange-400 flex gap-0.5">
              <span className="w-1.5 h-3 bg-yellow-400 rounded-sm" />
              <span className="w-1.5 h-3 bg-red-500 rounded-sm" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">DISCIPLINE CARDS</span>
              <p className="text-3xl font-display font-black text-orange-400 mt-2 font-mono">{totalCards}</p>
            </div>
            <div className="text-[10px] text-white/40 mt-4 leading-normal">
              Yellow and Red cards indexed.
            </div>
          </div>
        </div>

        {/* Dashboard Split: Matches controller & Audit Logs */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Matches lists column (wide) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass border border-white/10 rounded-[32px] p-6 bg-navy/60 backdrop-blur-md">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h3 className="text-lg font-display font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <Activity size={18} className="text-primary" />
                  <span>ACTIVE MATCH INTEGRATION REGISTER</span>
                </h3>
                <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-gray-400 font-bold uppercase">{matches.length} fixtures total</span>
              </div>

              {/* Match Table rows */}
              <div className="space-y-4">
                {matches.map((m) => {
                  const getStatusLabel = (status: string) => {
                    if (status === 'Live') return <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-500 border border-red-500/50 text-[8px] font-black uppercase tracking-widest animate-pulse">Live</span>;
                    if (status === 'Half Time') return <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 text-[8px] font-black uppercase tracking-widest">HT</span>;
                    if (status === 'Finished') return <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-500 border border-green-500/50 text-[8px] font-black uppercase tracking-widest">Finished</span>;
                    return <span className="px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/10 text-[8px] font-black uppercase tracking-widest">Upcoming</span>;
                  };

                  return (
                    <div 
                      key={m.id} 
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 hover:bg-white/[0.04] transition-all flex flex-col md:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-3 text-xs font-bold text-white/40">
                        <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded font-mono">MW {m.matchday}</span>
                        <span>{m.time}</span>
                      </div>

                      <div className="flex items-center justify-center space-x-6 flex-1 max-w-sm">
                        <div className="text-right flex-1 font-bold text-sm text-white truncate max-w-[120px]">{m.homeTeam}</div>
                        
                        <div className="flex items-center space-x-3 bg-navy-dark/90 px-4 py-1.5 rounded-xl border border-white/5 font-mono text-base font-black text-primary">
                          {m.status === 'Upcoming' ? (
                            <span className="text-white/20 text-xs">VS</span>
                          ) : (
                            <span>{m.homeScore} - {m.awayScore}</span>
                          )}
                        </div>

                        <div className="text-left flex-1 font-bold text-sm text-white truncate max-w-[120px]">{m.awayTeam}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusLabel(m.status)}
                        
                        <Link
                          to={`/admin/matches/${m.id}`}
                          className="px-4 py-2 bg-primary hover:bg-primary-hover text-dark text-xs font-black uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>Manage Desk</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Audit Logs Column (narrow) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass border border-white/10 rounded-[32px] p-6 bg-navy/60 backdrop-blur-md">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-b-white/5">
                <h3 className="text-sm font-display font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <ClipboardList size={16} className="text-primary" />
                  <span>SAFETY AUDIT TRAIL</span>
                </h3>
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-ping" />
              </div>

              {auditLogs.length === 0 ? (
                <div className="text-center py-12 text-white/30 border border-dashed border-white/10 rounded-2xl">
                  <AlertTriangle size={32} className="mx-auto text-white/20 mb-3" />
                  <p className="text-xs font-bold uppercase tracking-widest leading-loose">No Events logged yet</p>
                  <p className="text-[10px] text-white/25 mt-1 leading-normal px-4">Begin running matches, recording scoring values, or altering squads to generate log entries.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {auditLogs.map((log: AuditLogItem) => (
                    <div 
                      key={log.id} 
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] leading-relaxed relative hover:bg-white/[0.04] transition-all"
                    >
                      <div className="flex justify-between items-start gap-1 font-bold">
                        <span className="text-primary truncate">
                          👤 {log.adminName}
                        </span>
                        <span className="text-[9px] text-white/30 tracking-tight whitespace-nowrap">
                          {log.timestamp.split(',')[1] || log.timestamp}
                        </span>
                      </div>
                      
                      <div className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-0.5">
                        Role: {log.role}
                      </div>

                      <div className="text-white/80 font-medium mt-2 leading-normal">
                        {log.action}
                      </div>

                      {log.matchSummary && (
                        <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold bg-navy-dark px-1.5 py-0.5 rounded border border-white/5 text-yellow-500 uppercase tracking-wider w-max max-w-full">
                          ⚽ {log.matchSummary}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
