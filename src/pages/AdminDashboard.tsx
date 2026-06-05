import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMatchState, AuditLogItem } from '../context/MatchStateContext';
import { 
  Trophy, LogOut, Radio, Play, Calendar, CheckCircle, Shield, 
  Settings, Users, ClipboardList, Activity, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck, Camera
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fclApi } from '../lib/api';

export default function AdminDashboard() {
  const { 
    currentUser, logout, matches, teams, goalScorers, cards, auditLogs, resetAllData,
    createFixture, editFixture, deleteFixture
  } = useMatchState();
  const navigate = useNavigate();

  // Create fixture form states
  const [isCreating, setIsCreating] = React.useState(false);
  const [newMatchday, setNewMatchday] = React.useState(1);
  const [newHomeTeam, setNewHomeTeam] = React.useState('');
  const [newAwayTeam, setNewAwayTeam] = React.useState('');
  const [newDate, setNewDate] = React.useState('June 8, 2026');
  const [newTime, setNewTime] = React.useState('16:00');
  const [newVenue, setNewVenue] = React.useState('FUTA Sports Complex');

  // Edit fixture states
  const [editingMatchId, setEditingMatchId] = React.useState<string | null>(null);
  const [editMatchday, setEditMatchday] = React.useState(1);
  const [editHomeTeam, setEditHomeTeam] = React.useState('');
  const [editAwayTeam, setEditAwayTeam] = React.useState('');
  const [editDate, setEditDate] = React.useState('');
  const [editTime, setEditTime] = React.useState('');
  const [editVenue, setEditVenue] = React.useState('');

  const handleCreateFixture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHomeTeam || !newAwayTeam) {
      alert('Please select both home and away departments!');
      return;
    }
    if (newHomeTeam === newAwayTeam) {
      alert('Error: A department cannot play against itself!');
      return;
    }
    createFixture({
      homeTeam: newHomeTeam,
      awayTeam: newAwayTeam,
      matchday: Number(newMatchday),
      date: newDate,
      time: newTime,
      venue: newVenue,
      status: 'Upcoming'
    });
    setIsCreating(false);
    alert(`Successfully scheduled fixture: ${newHomeTeam} vs ${newAwayTeam}!`);
    setNewHomeTeam('');
    setNewAwayTeam('');
  };

  const handleSaveEditFixture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatchId) return;
    if (editHomeTeam === editAwayTeam) {
      alert('Error: A department cannot play against itself!');
      return;
    }
    editFixture(editingMatchId, {
      homeTeam: editHomeTeam,
      awayTeam: editAwayTeam,
      matchday: Number(editMatchday),
      date: editDate,
      time: editTime,
      venue: editVenue
    });
    setEditingMatchId(null);
    alert('Fixture updated successfully!');
  };

  const handleDeleteFixture = (matchId: string, summary: string) => {
    if (confirm(`⚠️ Are you sure you want to delete the fixture: ${summary}? This cannot be undone.`)) {
      deleteFixture(matchId);
      alert('Fixture has been successfully deleted!');
    }
  };

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
    if (currentUser?.role !== 'Super Admin') {
      alert('Violation Check: Only Super Administrators can clear and reset all tournament data settings!');
      return;
    }
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
            {currentUser?.role === 'Super Admin' && (
              <button
                onClick={handleResetData}
                title="Reset All Live State to Default Seed Schedules"
                className="px-3.5 py-1.5 rounded-lg border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={11} />
                <span>Full Reset</span>
              </button>
            )}
            
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
              {currentUser?.role === 'Super Admin' && "SUPER ADMINISTRATOR CONTROL CENTER"}
              {currentUser?.role === 'Match Commissioner' && "MATCH COMMISSIONER CONTROL DESK"}
              {currentUser?.role === 'Media Officer' && "MEDIA OPERATIONS DESK"}
              {currentUser?.role === 'Team Official' && "TEAM OFFICIALS CENTRAL PORTAL"}
            </h2>
            <p className="text-sm font-medium text-white/60 max-w-2xl leading-relaxed">
              {currentUser?.role === 'Super Admin' && "Welcome back to the FUTA Champions League command cockpit. You have full global administrative authority to manage fixtures, create credentials, approve registrations, reset tables, and supervise tournament settings."}
              {currentUser?.role === 'Match Commissioner' && "Welcome back to the operations cockpit. Here you can start live matches, progressive minutes, control scores, issue cards, record substitutions, and approve tactical lineups in real-time."}
              {currentUser?.role === 'Media Officer' && "Welcome back, Media Officer. Use the dashboard to publish live commentaries, edit public schedules, compile match reports, and manage public communications."}
              {currentUser?.role === 'Team Official' && "Welcome back to the team delegation workspace. Here you can configure your department's roster, edit lineups, upload official logos, and track your accredited student players."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 flex-wrap justify-end">
            <Link
              to="/admin/accreditation"
              className="flex-shrink-0 px-5 py-4 bg-primary hover:bg-primary-hover text-dark font-black tracking-widest text-[9px] uppercase rounded-2xl shadow-[0_4px_20px_rgba(0,229,255,0.25)] hover:shadow-[0_4px_30px_rgba(0,229,255,0.35)] hover:scale-102 active:scale-98 transition-all flex items-center justify-center space-x-2 group cursor-pointer"
            >
              <ShieldCheck size={16} className="text-dark group-hover:rotate-12 transition-transform" />
              <span>ACCREDITATION DESK</span>
            </Link>
            
            {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Team Official') && (
              <>
                <Link
                  to="/registration"
                  className="flex-shrink-0 px-5 py-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border border-white/10 text-white font-black tracking-widest text-[9px] uppercase rounded-2xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Users size={16} className="text-primary" />
                  <span>SQUAD REGISTER PORTAL</span>
                </Link>
                <Link
                  to="/portal/team"
                  className="flex-shrink-0 px-5 py-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-white/10 text-white font-black tracking-widest text-[9px] uppercase rounded-2xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Trophy size={16} className="text-primary" />
                  <span>TEAM HUB</span>
                </Link>
              </>
            )}

            {currentUser?.role === 'Super Admin' && (
              <Link
                to="/admin/team-logos"
                className="flex-shrink-0 px-5 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black tracking-widest text-[9px] uppercase rounded-2xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Trophy size={16} className="text-primary" />
                <span>LOGO OPERATIONS</span>
              </Link>
            )}

            {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Match Commissioner' || currentUser?.role === 'Media Officer') && (
              <Link
                to="/admin/media"
                className="flex-shrink-0 px-5 py-4 bg-[#00e5ff] text-dark hover:bg-opacity-95 font-black tracking-widest text-[9px] uppercase rounded-2xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-[0_4px_20px_rgba(0,229,255,0.15)]"
              >
                <Camera size={16} className="text-dark" />
                <span>MEDIA OPERATIONS</span>
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
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-gray-400 font-bold uppercase">{matches.length} fixtures total</span>
                  {currentUser?.role === 'Super Admin' && (
                    <button
                      onClick={() => setIsCreating(!isCreating)}
                      className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-dark text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      {isCreating ? 'Close Form' : '+ New Fixture'}
                    </button>
                  )}
                </div>
              </div>

              {/* Create fixture form */}
              {isCreating && currentUser?.role === 'Super Admin' && (
                <form 
                  onSubmit={handleCreateFixture}
                  className="mb-6 p-5 rounded-2xl bg-white/[0.03] border border-primary/20 space-y-4 animate-in fade-in duration-200"
                >
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary">
                    Create New Tournament Match Fixture
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-white/40 block mb-1">Matchday</label>
                      <select 
                        value={newMatchday} 
                        onChange={(e) => setNewMatchday(Number(e.target.value))}
                        className="w-full bg-navy border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primary/50"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(mw => (
                          <option key={mw} value={mw} className="bg-navy">Matchday {mw}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-white/40 block mb-1">Home Department</label>
                      <select 
                        value={newHomeTeam} 
                        onChange={(e) => setNewHomeTeam(e.target.value)}
                        className="w-full bg-navy border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primary/50"
                        required
                      >
                        <option value="" className="bg-navy">-- Select home team --</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.name} className="bg-navy">{t.name}</option>
                        ))}
                        {teams.length === 0 && (
                          <>
                            <option value="Mechanical Engineering" className="bg-navy">Mechanical Engineering</option>
                            <option value="Computer Science" className="bg-navy">Computer Science</option>
                            <option value="Electrical Engineering" className="bg-navy">Electrical Engineering</option>
                            <option value="Civil Engineering" className="bg-navy">Civil Engineering</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-white/40 block mb-1">Away Department</label>
                      <select 
                        value={newAwayTeam} 
                        onChange={(e) => setNewAwayTeam(e.target.value)}
                        className="w-full bg-navy border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primary/50"
                        required
                      >
                        <option value="" className="bg-navy">-- Select away team --</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.name} className="bg-navy">{t.name}</option>
                        ))}
                        {teams.length === 0 && (
                          <>
                            <option value="Mechanical Engineering" className="bg-navy">Mechanical Engineering</option>
                            <option value="Computer Science" className="bg-navy">Computer Science</option>
                            <option value="Electrical Engineering" className="bg-navy">Electrical Engineering</option>
                            <option value="Civil Engineering" className="bg-navy">Civil Engineering</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-white/40 block mb-1">Kickoff Date</label>
                      <input 
                        type="text"
                        value={newDate} 
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full bg-navy border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primary/50"
                        placeholder="e.g. June 8, 2026"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-white/40 block mb-1">Kickoff Time</label>
                      <input 
                        type="text"
                        value={newTime} 
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full bg-navy border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primary/50"
                        placeholder="e.g. 16:00"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-white/40 block mb-1">Venue Venue</label>
                      <input 
                        type="text"
                        value={newVenue} 
                        onChange={(e) => setNewVenue(e.target.value)}
                        className="w-full bg-navy border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primary/50"
                        placeholder="e.g. FUTA Sports Complex"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                    <button 
                      type="button" 
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold uppercase transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-5 py-2 bg-primary hover:bg-primary-hover text-dark text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                    >
                      Schedule Fixture
                    </button>
                  </div>
                </form>
              )}

              {/* Match Table rows */}
              <div className="space-y-4">
                {matches.map((m) => {
                  const getStatusLabel = (status: string) => {
                    if (status === 'Live') return <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-500 border border-red-500/50 text-[8px] font-black uppercase tracking-widest animate-pulse">Live</span>;
                    if (status === 'Half Time') return <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 text-[8px] font-black uppercase tracking-widest">HT</span>;
                    if (status === 'Finished') return <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-500 border border-green-500/50 text-[8px] font-black uppercase tracking-widest">Finished</span>;
                    if (status === 'Postponed') return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/50 text-[8px] font-black uppercase tracking-widest animate-pulse">Postponed</span>;
                    if (status === 'Cancelled') return <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[8px] font-black uppercase tracking-widest">Cancelled</span>;
                    return <span className="px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/10 text-[8px] font-black uppercase tracking-widest">Upcoming</span>;
                  };

                  // Inline Row Editing Layout
                  if (editingMatchId === m.id) {
                    return (
                      <form 
                        key={m.id} 
                        onSubmit={handleSaveEditFixture}
                        className="p-5 rounded-2xl bg-white/[0.03] border border-yellow-500/30 space-y-4 flex flex-col animate-in fade-in duration-200"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-xs font-black text-yellow-400 uppercase tracking-wider">EDIT FIXTURE SETTINGS</span>
                          <button 
                            type="button" 
                            onClick={() => setEditingMatchId(null)}
                            className="text-white/40 hover:text-white text-xs font-bold uppercase"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-[10px] font-black uppercase text-white/40 block mb-1">Matchday</label>
                            <select 
                              value={editMatchday} 
                              onChange={(e) => setEditMatchday(Number(e.target.value))}
                              className="w-full bg-navy border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primary/50"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(mw => (
                                <option key={mw} value={mw} className="bg-navy">Matchday {mw}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-white/40 block mb-1">Home Team</label>
                            <select 
                              value={editHomeTeam} 
                              onChange={(e) => setEditHomeTeam(e.target.value)}
                              className="w-full bg-navy border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                            >
                              {teams.map(t => (
                                <option key={t.id} value={t.name} className="bg-navy">{t.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-white/40 block mb-1">Away Team</label>
                            <select 
                              value={editAwayTeam} 
                              onChange={(e) => setEditAwayTeam(e.target.value)}
                              className="w-full bg-navy border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                            >
                              {teams.map(t => (
                                <option key={t.id} value={t.name} className="bg-navy">{t.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-[10px] font-black uppercase text-white/40 block mb-1">Kickoff Date</label>
                            <input 
                              type="text"
                              value={editDate} 
                              onChange={(e) => setEditDate(e.target.value)}
                              placeholder="e.g. June 8, 2026"
                              className="w-full bg-navy border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-white/40 block mb-1">Kickoff Time</label>
                            <input 
                              type="text"
                              value={editTime} 
                              onChange={(e) => setEditTime(e.target.value)}
                              placeholder="e.g. 15:45"
                              className="w-full bg-navy border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-white/40 block mb-1">Venue</label>
                            <input 
                              type="text"
                              value={editVenue} 
                              onChange={(e) => setEditVenue(e.target.value)}
                              placeholder="Venue"
                              className="w-full bg-navy border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                          <button 
                            type="button" 
                            onClick={() => setEditingMatchId(null)}
                            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold uppercase transition-all"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-dark text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    );
                  }

                  return (
                    <div 
                      key={m.id} 
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 hover:bg-white/[0.04] transition-all flex flex-col md:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-3 text-xs font-bold text-white/40">
                        <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded font-mono">MW {m.matchday}</span>
                        <span>{m.time}</span>
                      </div>

                      <div className="flex items-center justify-center space-x-6 flex-1 max-w-sm w-full">
                        <div className="text-right flex-1 font-bold text-sm text-white truncate max-w-[120px]">{m.homeTeam}</div>
                        
                        <div className="flex items-center space-x-3 bg-navy-dark/90 px-4 py-1.5 rounded-xl border border-white/5 font-mono text-base font-black text-primary">
                          {(m.status === 'Upcoming' || m.status === 'Postponed' || m.status === 'Cancelled') ? (
                            <span className="text-white/20 text-xs">VS</span>
                          ) : (
                            <span>{m.homeScore} - {m.awayScore}</span>
                          )}
                        </div>

                        <div className="text-left flex-1 font-bold text-sm text-white truncate max-w-[120px]">{m.awayTeam}</div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
                        {getStatusLabel(m.status)}
                        
                        <div className="flex gap-2">
                          <Link
                            to={`/admin/matches/${m.id}`}
                            className="px-4 py-2 bg-primary hover:bg-primary-hover text-dark text-xs font-black uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>Manage Desk</span>
                            <ArrowRight size={12} />
                          </Link>

                          {currentUser?.role === 'Super Admin' && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingMatchId(m.id);
                                  setEditMatchday(m.matchday);
                                  setEditHomeTeam(m.homeTeam);
                                  setEditAwayTeam(m.awayTeam);
                                  setEditDate(m.date);
                                  setEditTime(m.time);
                                  setEditVenue(m.venue);
                                }}
                                className="px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                                title="Edit Fixture Profile"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteFixture(m.id, `${m.homeTeam} vs ${m.awayTeam}`)}
                                className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                                title="Delete Fixture"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
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
