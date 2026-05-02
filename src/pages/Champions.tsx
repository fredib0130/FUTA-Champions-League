import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Crown, Star, ArrowRight, History } from 'lucide-react';
import { CHAMPIONS, TEAMS } from '../data/mockData';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Champions() {
  const latestChampion = CHAMPIONS[0]; // Sort by year latest first if more
  
  return (
    <div className="pb-32">
      {/* Header */}
      <div className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1510133769068-ad05001a10b1?q=80&w=2000')] bg-cover bg-center opacity-30 scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-20 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-primary/20 rounded-full border border-primary/40"
          >
            <Crown size={48} className="text-primary animate-pulse" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl sm:text-8xl font-display font-black italic uppercase tracking-tighter text-white mb-2"
          >
            WALL OF <span className="text-primary italic">CHAMPIONS</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 font-medium max-w-2xl text-lg mt-4"
          >
            The Wall of Champions celebrates the history of FUTA Champions League winners, 
            honoring the teams that have achieved greatness.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        {/* Latest Champion Card */}
        <div className="mb-20">
          <div className="flex items-center space-x-3 mb-8">
            <Trophy className="text-primary" size={24} />
            <h2 className="text-2xl font-display font-black italic uppercase tracking-tight text-white">Current Title Holder</h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[50px] p-8 sm:p-16 border border-primary/30 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Trophy size={400} />
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
              <div className="relative">
                <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center relative">
                  <img 
                    src={TEAMS.find(t => t.id === latestChampion.winnerId.toLowerCase())?.logo} 
                    alt={latestChampion.winnerName} 
                    className="w-32 h-32 sm:w-44 sm:h-44 object-contain transform group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-dashed animate-spin-slow" />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary px-6 py-2 rounded-full font-black text-xs text-dark tracking-widest uppercase">
                  Champions {latestChampion.year}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full mb-6 border border-primary/20">
                  <Medal size={12} className="text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Defending Champions</span>
                </div>
                <h3 className="text-5xl sm:text-7xl font-display font-black italic uppercase tracking-tighter text-white mb-4">
                  {latestChampion.winnerName.split(' (')[0]}
                </h3>
                <p className="text-xl text-white/60 mb-8 max-w-xl">
                  Defeated <span className="text-white font-bold">{latestChampion.runnerUpName}</span> ({latestChampion.score})
                </p>
                <Link 
                  to={`/teams/${latestChampion.winnerId}`}
                  className="inline-flex items-center space-x-3 px-8 py-4 sporty-gradient rounded-full font-black text-sm tracking-widest uppercase hover:scale-105 transition-transform"
                >
                  <span>View Team Profile</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Historical Table */}
        <div className="mt-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/5 rounded-full mb-4 border border-white/10">
                <History size={12} className="text-white/40" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Hall of Fame</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-display font-black italic uppercase tracking-tighter text-white">Historical <span className="text-primary italic">Record</span></h2>
            </div>
          </div>

          <div className="glass rounded-[40px] border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Year</th>
                    <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Winner</th>
                    <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Runner-up</th>
                    <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Final Score</th>
                  </tr>
                </thead>
                <tbody>
                  {CHAMPIONS.sort((a, b) => b.year - a.year).map((record) => (
                    <motion.tr 
                      key={record.year}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                      className="group border-b border-white/5 last:border-0 transition-colors"
                    >
                      <td className="px-8 py-8">
                        <span className="text-2xl font-display font-black italic text-white/20 group-hover:text-primary/50 transition-colors">
                          {record.year}
                        </span>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0">
                            <Trophy size={20} className="text-yellow-500" />
                          </div>
                          <div>
                            <div className="text-lg font-black text-yellow-500 uppercase tracking-tight">{record.winnerName}</div>
                            <div className="text-[10px] font-black text-yellow-500/40 uppercase tracking-widest italic">Champions</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <Medal size={20} className="text-white/40" />
                          </div>
                          <div>
                            <div className="text-lg font-black text-white/60 uppercase tracking-tight">{record.runnerUpName}</div>
                            <div className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">Runners-up</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="text-sm font-medium text-white/40 italic">
                          {record.score}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
