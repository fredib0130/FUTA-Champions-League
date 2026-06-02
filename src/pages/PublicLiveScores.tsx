import React, { useState } from 'react';
import { useMatchState } from '../context/MatchStateContext';
import { PageHeader } from '../components/PageHeader';
import { MatchCard } from '../components/MatchCard';
import { Radio, Clock, AlertCircle, Calendar, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicLiveScores() {
  const { matches } = useMatchState();
  const [filter, setFilter] = useState<'ongoing' | 'all'>('ongoing');

  // filter streams
  const liveMatches = matches.filter(m => m.status === 'Live' || m.status === 'Half Time');
  const renderedMatches = filter === 'ongoing' ? liveMatches : matches;

  return (
    <div className="min-h-screen bg-navy text-white pb-32">
      <PageHeader 
        title="Live scores center" 
        subtitle="Stay updated with live game events, scores, and timer trackers across FUTA campuses."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-8">
        
        {/* Toggle selectors filter */}
        <div className="flex justify-center">
          <div className="bg-navy-dark border border-white/10 rounded-2xl p-1.5 flex gap-2 w-full max-w-sm shadow-xl">
            <button
              onClick={() => setFilter('ongoing')}
              className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                filter === 'ongoing'
                  ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.35)]'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.02]'
              }`}
            >
              <Radio size={13} className={filter === 'ongoing' ? 'animate-pulse' : ''} />
              <span>In Progress ({liveMatches.length})</span>
            </button>
            
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                filter === 'all'
                  ? 'bg-primary text-dark shadow-[0_0_15px_rgba(0,229,255,0.35)]'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.02]'
              }`}
            >
              <Calendar size={13} />
              <span>Full Schedule ({matches.length})</span>
            </button>
          </div>
        </div>

        {/* Real-time broadcast alerts banner */}
        {liveMatches.length > 0 ? (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 max-w-3xl mx-auto">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <p className="text-xs font-bold leading-normal uppercase tracking-wider">
              🎮 {liveMatches.length} match{liveMatches.length > 1 ? 'es are' : ' is'} currently in progress. Updates sync instantly across your screen without refreshing!
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-white/50 max-w-3xl mx-auto">
            <AlertCircle size={16} className="text-white/30 flex-shrink-0" />
            <p className="text-xs font-bold uppercase tracking-wider">
              No matches are currently in progress. Switch to "Full Schedule" to browse other fixtures.
            </p>
          </div>
        )}

        {/* Render Grid list */}
        <div className="pt-6">
          {renderedMatches.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderedMatches.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <MatchCard match={m} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-white/10 rounded-[32px] bg-navy-dark/40 max-w-xl mx-auto">
              <AlertCircle size={40} className="text-white/20 mx-auto mb-4" />
              <p className="text-lg font-display font-black text-white/40 uppercase tracking-widest italic">No matches listed</p>
              <p className="text-xs text-white/25 mt-2 max-w-xs mx-auto leading-relaxed">
                There are no matches currently running on our official server schedules.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
