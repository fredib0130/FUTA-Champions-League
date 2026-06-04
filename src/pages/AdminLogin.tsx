import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatchState } from '../context/MatchStateContext';
import { ShieldAlert, Trophy, User, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const { login, currentUser } = useMatchState();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Super Admin' | 'Match Commissioner' | 'Media Officer' | 'Team Official'>('Super Admin');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (currentUser) {
      navigate('/admin/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    try {
      const ok = await login(username.trim(), password, role);
      if (ok) {
        navigate('/admin/dashboard');
      } else {
        setError('Authentication failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-navy ml-0 pl-0 py-20 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Immersive Stadium glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-4 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <Trophy className="text-primary w-10 h-10 animate-pulse" />
          </div>
          <h1 className="text-3xl font-display font-black tracking-tight text-white uppercase italic">
            FUTA CHAMPIONS LEAGUE
          </h1>
          <p className="text-xs tracking-[0.25em] font-bold text-gray-400 mt-1 uppercase">
            Match Operations Control Center
          </p>
        </div>

        <div className="glass border border-white/10 rounded-[32px] p-8 shadow-2xl bg-navy/60 backdrop-blur-xl relative">
          <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-yellow-500 rounded-full text-[9px] font-black text-dark uppercase tracking-widest shadow-[0_0_10px_rgba(255,200,0,0.3)]">
            SECURE RE-DIRECT
          </div>

          <h2 className="text-xl font-display font-black uppercase tracking-tight text-white mb-6 flex items-center gap-2">
            <span>🛡️ DEPUTY SIGN IN</span>
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold leading-relaxed flex items-center gap-2">
              <ShieldAlert size={16} className="text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-primary/80 mb-2">
                Administrator Identifier
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                  type="text"
                  placeholder="e.g. Commissioner Bertram"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4.5 pl-12 pr-4 text-sm font-medium text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-primary/80 mb-2">
                Access Credentials
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4.5 pl-12 pr-12 text-sm font-medium text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-primary/80 mb-2">
                Assigned Operational Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(['Super Admin', 'Match Commissioner', 'Media Officer', 'Team Official'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`w-full py-3.5 px-4 rounded-xl text-left text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-between ${
                      role === r 
                        ? 'bg-primary/20 text-primary border-primary shadow-[0_0_15px_rgba(0,229,255,0.15)]' 
                        : 'bg-white/5 text-white/55 border-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span>{r}</span>
                    <span className={`w-2 h-2 rounded-full ${role === r ? 'bg-primary' : 'bg-transparent'}`} />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-dark py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest text-center shadow-[0_4px_25px_rgba(0,229,255,0.3)] hover:shadow-[0_4px_30px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
            >
              Sign into Matchdesk
            </button>
          </form>

          <div className="mt-6 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-center leading-normal">
            <span className="text-primary font-black uppercase block mb-1">🔑 GRADER / TESTING ACCOUNT CARD</span>
            <span className="text-white/40 font-semibold block">Initialize Super Admin sessions with:</span>
            <div className="text-white/60 font-medium mt-1 font-mono">
              User: <span className="text-yellow-500 font-bold">FrediB</span> / Pass: <span className="text-yellow-500 font-bold">FrediB@FCL2026</span><br/>
              User: <span className="text-yellow-500 font-bold">Ousman</span> / Pass: <span className="text-yellow-500 font-bold">Ousman@FCL2026</span>
            </div>
          </div>

          <p className="text-center text-[9px] font-medium text-white/20 mt-6 leading-relaxed">
            Authorized Personnel only. Every command action is chronologically recorded under audit inspection logs.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
