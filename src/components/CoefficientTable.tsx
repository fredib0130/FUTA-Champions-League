import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoefficientRanking } from '../types';
import { ChevronUp, ChevronDown, Info, Medal, TrendingUp, History, Search } from 'lucide-react';

interface CoefficientTableProps {
  data: CoefficientRanking[];
  limit?: number;
  highlightTop?: boolean;
}

export const CoefficientTable: React.FC<CoefficientTableProps> = ({ data, limit, highlightTop = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof CoefficientRanking; direction: 'asc' | 'desc' } | null>({
    key: 'totalCoefficient',
    direction: 'desc'
  });

  const sortedData = React.useMemo(() => {
    let sortableItems = data.filter(item => 
      item.teamName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return limit ? sortableItems.slice(0, limit) : sortableItems;
  }, [data, sortConfig, limit, searchTerm]);

  const requestSort = (key: keyof CoefficientRanking) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof CoefficientRanking) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="space-y-6">
      {/* Search Filter */}
      {!limit && (
        <div className="relative max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text" 
            placeholder="Search teams..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary transition-colors text-sm font-bold"
          />
        </div>
      )}

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">
              <th className="px-6 py-4">S/N</th>
              <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('teamName')}>
                <div className="flex items-center space-x-2">
                  <span>Team</span>
                  {getSortIcon('teamName')}
                </div>
              </th>
              <th className="px-6 py-4 text-center cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('points2026')}>
                <div className="flex items-center justify-center space-x-2">
                  <TrendingUp size={12} className="text-primary" />
                  <span>2026 Pts</span>
                  {getSortIcon('points2026')}
                </div>
              </th>
              <th className="px-6 py-4 text-center cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('points2025')}>
                <div className="flex items-center justify-center space-x-2">
                  <History size={12} className="text-white/40" />
                  <span>2025 Pts</span>
                  {getSortIcon('points2025')}
                </div>
              </th>
              <th className="px-6 py-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('totalCoefficient')}>
                <div className="flex items-center justify-end space-x-2">
                  <span>Total Coeff</span>
                  {getSortIcon('totalCoefficient')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {sortedData.map((ranking, index) => {
                const isTop5 = highlightTop && ranking.rank <= 5;
                const isTop3 = highlightTop && ranking.rank <= 3;
                
                return (
                  <motion.tr
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    key={ranking.teamId}
                    className={`glass group transition-all duration-500 hover:scale-[1.01] hover:bg-white/[0.05] relative ${isTop5 ? 'after:content-[""] after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-primary' : ''} ${isTop3 ? 'shadow-[0_0_20px_rgba(255,200,0,0.05)]' : ''}`}
                  >
                    <td className="px-6 py-5">
                      <span className={`text-sm font-black italic ${isTop5 ? 'text-primary' : 'text-white/40'}`}>
                        #{ranking.rank.toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col">
                          <span className="font-bold tracking-tight text-white group-hover:text-primary transition-colors">{ranking.teamName}</span>
                          {isTop5 && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Medal size={10} className="text-primary" />
                              <span className="text-[8px] font-black uppercase text-primary tracking-widest">
                                {ranking.rank === 1 ? 'Departmental King' : 'Power Index Leader'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-mono font-bold text-white/80">
                      {ranking.points2026.toFixed(2)}
                    </td>
                    <td className="px-6 py-5 text-center font-mono text-white/40">
                      {ranking.points2025.toFixed(2)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <span className="text-lg font-black font-mono italic text-white leading-none">
                          {ranking.totalCoefficient.toFixed(2)}
                        </span>
                        <div className="relative group/tooltip">
                          <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${ranking.isActive ? 'bg-green-500 animate-pulse ring-2 ring-green-500/20' : 'bg-red-500 ring-2 ring-red-500/20'}`} />
                          <div className="absolute right-0 bottom-full mb-3 hidden group-hover/tooltip:block z-50 animate-in fade-in slide-in-from-bottom-2">
                            <div className="glass px-4 py-3 rounded-2xl text-[10px] font-bold whitespace-nowrap border border-white/10 uppercase tracking-[0.2em] shadow-2xl">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${ranking.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className={ranking.isActive ? 'text-green-500' : 'text-red-500'}>
                                  {ranking.isActive ? 'Active & Improving' : 'Legacy Factor'}
                                </span>
                              </div>
                              <div className="text-white/40">
                                {ranking.isActive ? 'Strong 2026 Contribution' : 'Base on Historic Strength'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between p-8 glass rounded-[32px] border border-white/5 bg-white/[0.01] gap-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <Info className="text-primary w-5 h-5" />
          </div>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">
            *FCL Team Coefficient Ranking was calculated before the commencement of the 2026 Tournament. <br />
            Higher coefficient = stronger historical performance and elite seeding.
          </p>
        </div>
        <div className="flex space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">2026 Contributor</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Legacy Points</span>
          </div>
        </div>
      </div>
    </div>
  );
};
