import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Star, Award, UserCheck, Shield, Sparkles, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { TEAMS } from '../data/mockData';
import { TeamLogo } from '../components/TeamLogo';
import { Link } from 'react-router-dom';

export interface AwardWinner {
  id: string;
  category: string;
  icon: any;
  winnerName: string;
  teamId: string;
  teamAbbr: string;
  teamName: string;
  statBadge: string;
  statDescription: string;
  description: string;
  color: string;
  borderColor: string;
  badgeBg: string;
  image?: string;
}

export const AWARDS_2026: AwardWinner[] = [
  {
    id: 'pott-2026',
    category: 'Player of the Tournament',
    icon: Star,
    winnerName: 'Olorunfemi Taiwo James',
    teamId: 'cys',
    teamAbbr: 'CYS',
    teamName: 'Cyber Security',
    statBadge: '30.40% Overall Votes',
    statDescription: 'Highest vote tally in tournament fan poll',
    description: "The CYS forward produced outstanding performances throughout the tournament, playing a pivotal role in his team's journey to the semi-finals. His consistency, goals, and overall influence earned him the highest number of votes.",
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  },
  {
    id: 'golden-boot-2026',
    category: 'Highest Goal Scorer',
    icon: Trophy,
    winnerName: 'Olasunkunmi Michael',
    teamId: 'agp',
    teamAbbr: 'AGP',
    teamName: 'Applied Geophysics',
    statBadge: '6 Goals',
    statDescription: 'Golden Boot Winner',
    description: "AGP's talisman finished as the tournament's leading scorer, displaying remarkable composure in front of goal and ending the campaign as the winner of the Golden Boot.",
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    badgeBg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  },
  {
    id: 'golden-glove-2026',
    category: 'Goalkeeper of the Tournament',
    icon: Shield,
    winnerName: 'Adeyemi Prosper',
    teamId: 'ice',
    teamAbbr: 'ICE',
    teamName: 'Information and Communication Engineering',
    statBadge: '5 Clean Sheets',
    statDescription: 'Most Shutouts in FCL 2026',
    description: "The ICE shot-stopper enjoyed an exceptional tournament, producing numerous match-winning saves and recording five clean sheets on his way to helping ICE lift the championship.",
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  {
    id: 'manager-2026',
    category: 'Manager of the Tournament',
    icon: UserCheck,
    winnerName: 'Oghenekeno Israel Okoh',
    teamId: 'ice',
    teamAbbr: 'ICE',
    teamName: 'Information and Communication Engineering',
    statBadge: 'Title Winner',
    statDescription: 'Guided ICE to 1st FCL Trophy',
    description: "The ICE manager guided his side to an impressive title-winning unbeaten campaign with disciplined tactics, strong defensive organization, and consistent performances throughout the competition.",
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  }
];

export function Awards() {
  return (
    <div className="pb-32 min-h-screen">
      {/* Header Banner */}
      <div className="relative h-[380px] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2000')] bg-cover bg-center opacity-20 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-16 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-4 bg-primary/20 rounded-full border border-primary/40"
          >
            <Award size={44} className="text-primary animate-pulse" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-7xl font-display font-black italic uppercase tracking-tighter text-white mb-2"
          >
            FCL 2026 <span className="text-primary italic">AWARDS</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-white/70 font-medium max-w-2xl text-base sm:text-lg mt-2"
          >
            Honouring the individual brilliance, goalscoring masterclasses, heroic goalkeeping, 
            and tactical leadership that defined the 2026 FUTA Champions League.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 space-y-16">
        
        {/* Official Announcement Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 sm:p-8 border border-primary/30 relative overflow-hidden bg-gradient-to-r from-primary/10 via-dark/80 to-primary/5"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="p-3 bg-primary/20 rounded-2xl border border-primary/30 text-primary">
                <Sparkles size={24} />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Official Announcement</span>
                <h2 className="text-xl sm:text-2xl font-display font-black italic uppercase text-white">
                  FCL 2026 Award Winners Announced
                </h2>
                <p className="text-xs text-white/50 font-mono mt-0.5">Published: 24th July, 2026 • 6:30 PM</p>
              </div>
            </div>
            <Link 
              to="/news"
              className="px-5 py-2.5 bg-primary text-dark font-black text-xs uppercase rounded-xl hover:scale-105 transition-transform shrink-0"
            >
              Read Full Bulletin
            </Link>
          </div>
        </motion.div>

        {/* Award Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Trophy className="text-primary" size={28} />
              <h2 className="text-2xl sm:text-3xl font-display font-black italic uppercase tracking-tight text-white">
                Individual & Management Honours
              </h2>
            </div>
            <span className="text-xs font-mono text-white/40 uppercase tracking-widest">4 Major Category Winners</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {AWARDS_2026.map((award, idx) => {
              const IconComponent = award.icon;
              const team = TEAMS.find(t => t.id === award.teamId);

              return (
                <motion.div
                  key={award.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`glass rounded-3xl p-6 sm:p-8 border ${award.borderColor} relative overflow-hidden group hover:border-primary/50 transition-all duration-300 flex flex-col justify-between`}
                >
                  {/* Subtle Background Glow */}
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                    <IconComponent size={220} />
                  </div>

                  <div>
                    {/* Top Row: Category & Stat Badge */}
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <span className={`p-2 rounded-xl bg-white/5 ${award.color}`}>
                          <IconComponent size={20} />
                        </span>
                        <span className="text-xs font-black uppercase tracking-widest text-white/60">
                          {award.category}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${award.badgeBg}`}>
                        {award.statBadge}
                      </span>
                    </div>

                    {/* Winner Name & Team */}
                    <div className="flex items-start space-x-4 mb-6">
                      <TeamLogo 
                        teamId={award.teamId} 
                        logoUrl={team?.logoUrl} 
                        size="md"
                        className="w-14 h-14 shrink-0 rounded-2xl bg-white/5 p-2 border border-white/10"
                      />
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-display font-black italic uppercase text-white tracking-tight leading-none group-hover:text-primary transition-colors">
                          {award.winnerName}
                        </h3>
                        <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">
                          {award.teamName} ({award.teamAbbr})
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-white/70 leading-relaxed mb-6 font-medium">
                      "{award.description}"
                    </p>
                  </div>

                  {/* Footer stat highlight */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40 font-mono">
                    <span className="flex items-center space-x-1.5">
                      <CheckCircle2 size={14} className="text-primary" />
                      <span>{award.statDescription}</span>
                    </span>
                    <span className="text-primary/80 font-bold uppercase tracking-wider">FCL 2026 Winner</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Official Summary Table */}
        <div className="mt-12">
          <div className="flex items-center space-x-3 mb-6">
            <Medal className="text-primary" size={24} />
            <h2 className="text-xl sm:text-2xl font-display font-black italic uppercase tracking-tight text-white">
              🏆 2026 FCL Award Winners Summary
            </h2>
          </div>

          <div className="glass rounded-3xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Award Category</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Winner</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Key Achievement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-amber-400 flex items-center space-x-2">
                      <Star size={16} />
                      <span>Player of the Tournament</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">Olorunfemi Taiwo James</div>
                      <div className="text-xs text-white/50">Cyber Security Science (CYS)</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-primary font-bold">
                      30.40% of total fan votes
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-yellow-400 flex items-center space-x-2">
                      <Trophy size={16} />
                      <span>Highest Goal Scorer</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">Olasunkunmi Michael</div>
                      <div className="text-xs text-white/50">Applied Geophysics (AGP)</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-primary font-bold">
                      6 Goals (Golden Boot)
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-emerald-400 flex items-center space-x-2">
                      <Shield size={16} />
                      <span>Goalkeeper of the Tournament</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">Adeyemi Prosper</div>
                      <div className="text-xs text-white/50">Information & Comm. Eng. (ICE)</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-primary font-bold">
                      5 Clean Sheets
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-cyan-400 flex items-center space-x-2">
                      <UserCheck size={16} />
                      <span>Manager of the Tournament</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">Oghenekeno Israel Okoh</div>
                      <div className="text-xs text-white/50">Information & Comm. Eng. (ICE)</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-primary font-bold">
                      Title-Winning Manager
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
