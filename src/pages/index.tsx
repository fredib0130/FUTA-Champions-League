import React from 'react';
import { motion } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import { Trophy, ArrowRight, Star, Youtube, Play, TrendingUp, Users, Mail, Phone, Image as ImageIcon, Twitter, ExternalLink, ShieldCheck, Clock } from 'lucide-react';
import { Countdown } from '../components/Countdown';
import { MatchCard } from '../components/MatchCard';
import { PageHeader } from '../components/PageHeader';
import { MATCHES, NEWS, SPONSORS, PLAYERS, TEAMS } from '../data/mockData';
import { Match } from '../types';
import { cn } from '../lib/utils';

import { LeagueTable } from '../components/LeagueTable';

export function Home() {
  const featuredMatch = MATCHES.find(m => m.id === 'md1-1') || MATCHES[0];
  const latestNews = NEWS.slice(0, 2);
  const topPlayers = PLAYERS.slice(0, 3);
  const topTeamsTable = <LeagueTable limit={5} />;

  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center pt-20 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full glass border border-primary/20 mb-8">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase">FCL Season Opener • June 5</span>
              </div>
              
              <h1 className="text-6xl sm:text-9xl font-display font-black leading-[0.85] mb-10 tracking-tighter italic origin-left">
                20 TEAMS.<br />
                <span className="text-primary italic">3 MATCHES.</span> <br />
                ONE CHAMPION.
              </h1>
              
              <p className="text-lg text-white/50 mb-12 max-w-lg leading-relaxed font-medium">
                The high-stakes university league is back. Every match is a final. 20 teams battle through a limited league format for the ultimate crown.
              </p>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link to="/fixtures" className="px-10 py-5 sporty-gradient rounded-full font-black text-dark text-center hover:scale-105 active:scale-95 transition-all flex items-center justify-center group shadow-[0_0_40px_rgba(0,229,255,0.3)]">
                  MATCHDAY 1 FIXTURES
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/table" className="px-10 py-5 glass border border-white/10 rounded-full font-black text-center hover:bg-white/10 active:scale-95 transition-all">
                  LEAGUE TABLE
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
              <div className="relative glass p-4 rounded-[40px] border border-white/10 shadow-2xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-700">
                <div className="rounded-[32px] overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1510567198467-d78887b28c4a?q=80&w=2000" 
                    alt="Stadium Atmosphere" 
                    className="w-full aspect-[4/5] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent flex flex-col justify-end p-8">
                    <div className="glass p-6 rounded-3xl backdrop-blur-md">
                      <p className="text-[10px] font-bold text-primary tracking-[0.2em] mb-3 uppercase">Opening Match • Starts In</p>
                      <Countdown targetDate="2026-06-05T16:00:00" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mini Table & Next Match Hub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-display italic uppercase tracking-tighter">FEATURED ACTION</h2>
              <Link to="/fixtures" className="text-primary font-bold text-sm hover:underline">VIEW ALL</Link>
            </div>
            <MatchCard match={featuredMatch} />
            <div className="grid sm:grid-cols-2 gap-6">
              {MATCHES.filter(m => m.id !== featuredMatch.id).slice(0, 2).map(m => (
                <div key={m.id}>
                  <MatchCard match={m} />
                </div>
              ))}
            </div>
          </div>
          
          <aside className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display italic uppercase">STANDINGS</h2>
              <Link to="/table" className="text-primary font-bold text-xs hover:underline uppercase tracking-widest">FULL TABLE</Link>
            </div>
            {topTeamsTable}
            <div className="glass rounded-[32px] p-8 border border-primary/20 bg-primary/5">
              <h4 className="text-sm font-bold text-primary mb-4 italic uppercase tracking-widest leading-tight">BECOME A PARTNER</h4>
              <p className="text-xs text-white/50 mb-6 leading-relaxed">Boost your brand presence at FUTA's biggest sporting spectacle.</p>
              <Link 
                to="/sponsorship" 
                className="block text-center py-4 glass border border-white/10 rounded-2xl text-xs font-bold hover:bg-white/5"
              >
                SPONSORSHIP TIERS
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Top Scorers Spotlight */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-white/[0.02]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-6xl font-display font-black mb-6 italic tracking-tight">THE ELITE SNIPERS</h2>
            <p className="text-white/40 max-w-xl mx-auto text-lg">Tracking the golden boot race as the university's finest finishers battle for individual glory.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {topPlayers.map((player, i) => (
              <motion.div 
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-[40px] p-8 border border-white/10 hover:border-primary/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-0 group-hover:scale-100 transition-transform" />
                    <img src={player.image} alt={player.name} className="w-20 h-20 rounded-3xl relative z-10" />
                  </div>
                  <span className="text-6xl font-display font-black text-white/5 italic">0{i+1}</span>
                </div>
                <h4 className="text-2xl font-display font-bold italic mb-1 group-hover:text-primary transition-colors">{player.name}</h4>
                <p className="text-xs text-white/40 font-bold uppercase tracking-[0.2em] mb-6">
                  {TEAMS.find(t => t.id === player.teamId)?.name}
                </p>
                <div className="flex items-center space-x-6 pt-6 border-t border-white/5">
                  <div>
                    <div className="text-3xl font-display font-black text-primary leading-none">{player.goals}</div>
                    <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">Goals</div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                    <div className="text-3xl font-display font-black text-white/60 leading-none">{player.assists}</div>
                    <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">Assists</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/stats" className="inline-flex items-center font-bold text-primary group">
              FULL PLAYER STATISTICS 
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Media Highlight Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[40px] overflow-hidden group border border-white/10">
          <img 
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000" 
            alt="Highlights" 
            className="w-full aspect-video sm:aspect-[21/9] object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-primary/50 group"
            >
              <Play className="fill-current text-dark ml-1 w-8 h-8" />
            </motion.button>
            <h2 className="text-4xl sm:text-6xl font-display font-black mb-4">WATCH HIGHLIGHTS</h2>
            <p className="text-xl text-white/80 max-w-lg mx-auto">
              Re-live the magic moments, every scream-worthy goal, and every match-defining save.
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="glass rounded-[40px] p-8 sm:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -mr-32 -mt-32" />
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl font-display mb-4 italic tracking-tighter uppercase">STAY IN THE GAME</h2>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Join 5,000+ FCL fans. Get match notifications, results, and exclusive team news delivered straight to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-6 py-5 rounded-2xl bg-white/5 border border-white/10 focus:border-primary outline-none font-bold"
              />
              <button className="px-8 py-5 sporty-gradient rounded-2xl font-bold tracking-tight hover:scale-105 transition-transform">
                SUBSCRIBE NOW
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 pt-20">
        <p className="text-center text-xs font-bold tracking-[0.3em] text-white/30 mb-12 uppercase">OFFICIAL SPONSORS & PARTNERS</p>
        <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
          {SPONSORS.map((sponsor) => (
            <img key={sponsor.id} src={sponsor.logo} alt={sponsor.name} className="h-10 sm:h-12 w-auto object-contain" />
          ))}
        </div>
      </section>
    </div>
  );
}
export function Fixtures() {
  const [activeMW, setActiveMW] = React.useState(1);
  const matchWeeks = [1, 2, 3]; 

  const filteredMatches = MATCHES.filter(m => m.matchday === activeMW);
  const matchdayOpeningLabel = activeMW === 1 ? 'Opening Weekend (June 5-7)' : activeMW === 2 ? 'Mid-Season Clash (June 10-11)' : 'Final League Push (June 13-15)';

  return (
    <div>
      <PageHeader 
        title="Fixtures & Results" 
        subtitle="3 Matches per team. Every point counts in the race for the top 2."
      />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Matchweek Selector */}
        <div className="flex overflow-x-auto space-x-4 mb-4 py-4 no-scrollbar">
          {matchWeeks.map((mw) => (
            <button
              key={mw}
              onClick={() => setActiveMW(mw)}
              className={cn(
                "px-8 py-4 rounded-2xl font-black text-xs tracking-widest flex-shrink-0 transition-all border uppercase",
                activeMW === mw 
                  ? "bg-primary text-dark border-primary shadow-[0_0_20px_rgba(0,229,255,0.3)]" 
                  : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
              )}
            >
              MATCHDAY {mw < 10 ? `0${mw}` : mw}
            </button>
          ))}
        </div>

        <div className="mb-12 text-center py-6 glass rounded-3xl border border-white/5 bg-white/[0.02]">
          <h3 className="text-xl font-display italic uppercase text-primary tracking-tighter">{matchdayOpeningLabel}</h3>
        </div>

        <div className="space-y-12">
          {filteredMatches.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map((match: Match) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={match.id}
                >
                  <MatchCard match={match} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass rounded-[40px]">
              <p className="text-white/30 font-display italic text-2xl uppercase tracking-widest">No fixtures scheduled yet for MW{activeMW}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function Table() {
  return (
    <div>
      <PageHeader 
        title="The Standings" 
        subtitle="20 Teams. 3 Matchdays. The definitive guide to the FUTA Champions League 2026 qualification battle."
      />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4 text-xs font-bold tracking-widest text-white/30 uppercase">
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2" /> QF QUALIFIED</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-500 mr-2" /> PLAYOFFS</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2" /> ELIMINATED</span>
          </div>
          <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Live Updates Enabled</div>
        </div>
        <LeagueTable showFull />

        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-3xl border border-white/5">
            <h4 className="text-[10px] font-bold text-green-500 tracking-widest uppercase mb-2">QUARTER-FINALS</h4>
            <p className="text-xs text-white/40">1st and 2nd place qualify automatically.</p>
          </div>
          <div className="glass p-6 rounded-3xl border border-white/5">
            <h4 className="text-[10px] font-bold text-yellow-500 tracking-widest uppercase mb-2">PLAYOFFS</h4>
            <p className="text-xs text-white/40">3rd to 14th place battle for 6 remaining QF spots.</p>
          </div>
          <div className="glass p-6 rounded-3xl border border-white/5">
            <h4 className="text-[10px] font-bold text-red-500 tracking-widest uppercase mb-2">ELIMINATION</h4>
            <p className="text-xs text-white/40">15th to 20th place are eliminated from the competition.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Playoffs() {
  const playoffMatchups = [
    { seed1: 3, seed2: 14 },
    { seed1: 4, seed2: 13 },
    { seed1: 5, seed2: 12 },
    { seed1: 6, seed2: 11 },
    { seed1: 7, seed2: 10 },
    { seed1: 8, seed2: 9 },
  ];

  const sortedTeams = [...TEAMS].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.name.localeCompare(b.name);
  });

  return (
    <div>
      <PageHeader 
        title="Playoff Bracket" 
        subtitle="The Road to Glory. 12 Teams enter the playoff round, only 6 advance to the Quarter-Finals."
      />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Format Explanation */}
        <div className="glass rounded-[40px] p-8 mb-16 border border-primary/20 bg-primary/5">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h4 className="text-white font-bold italic uppercase tracking-widest text-xs">Playoff Matchups</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">3rd vs 14th | 4th vs 13th | 5th vs 12th | 6th vs 11th | 7th vs 10th | 8th vs 9th</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-primary font-bold italic uppercase tracking-widest text-xs">Direct Entries</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">1st and 2nd seeds bypass playoffs directly into Quarter-Finals.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-yellow-500 font-bold italic uppercase tracking-widest text-xs">Advancement</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Winners join the Top 2 seeds in the knockout Quarter-Finals phase.</p>
            </div>
          </div>
        </div>

        {/* Playoff Round */}
        <div className="space-y-8">
          <div className="flex items-center space-x-4 mb-2">
            <h2 className="text-2xl font-display italic uppercase tracking-tighter">Playoff Round</h2>
            <div className="h-px flex-1 bg-white/10" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">June 18 - 20</span>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Single Leg Elimination</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {playoffMatchups.map((match, i) => {
              const team1 = sortedTeams[match.seed1 - 1];
              const team2 = sortedTeams[match.seed2 - 1];
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  key={i} 
                  className="glass rounded-3xl border border-white/10 overflow-hidden group hover:border-primary/30 transition-all"
                >
                  <div className="bg-white/5 px-6 py-3 border-b border-white/10 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Match {i + 1}</span>
                    <span className="text-[10px] font-bold text-primary italic uppercase tracking-widest">Upcoming</span>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-center">
                        <img src={team1.logo} className="w-10 h-10 object-contain mb-2" alt={team1.name} />
                        <span className="text-[10px] font-bold uppercase text-white/30">Seed {match.seed1}</span>
                        <span className="font-bold text-xs mt-1">{team1.name}</span>
                      </div>
                      <span className="text-2xl font-display font-black text-white/5 italic">VS</span>
                      <div className="flex flex-col items-center">
                        <img src={team2.logo} className="w-10 h-10 object-contain mb-2" alt={team2.name} />
                        <span className="text-[10px] font-bold uppercase text-white/30">Seed {match.seed2}</span>
                        <span className="font-bold text-xs mt-1">{team2.name}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Final Phase Visual */}
        <div className="mt-32 opacity-30 pointer-events-none">
          <div className="flex items-center space-x-4 mb-16">
            <h2 className="text-4xl font-display italic uppercase tracking-tighter">Grand Finals Phase</h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
             <div className="glass p-12 rounded-[40px] border border-white/10 text-center w-64">
                <div className="text-[10px] font-bold text-primary tracking-widest uppercase mb-4 text-white/30">June 22 - 23</div>
                <div className="text-[10px] font-bold text-primary tracking-widest uppercase mb-4">Quarter-Finals</div>
                <div className="h-12 w-px bg-white/10 mx-auto mb-4" />
                <div className="text-xl font-display italic">8 TEAMS</div>
             </div>
             <div className="glass p-12 rounded-[40px] border border-white/10 text-center w-64 translate-y-8">
                <div className="text-[10px] font-bold text-primary tracking-widest uppercase mb-4 text-white/30">June 26 & 28</div>
                <div className="text-[10px] font-bold text-primary tracking-widest uppercase mb-4">Semi-Finals</div>
                <div className="h-12 w-px bg-white/10 mx-auto mb-4" />
                <div className="text-xl font-display italic">4 TEAMS</div>
             </div>
             <div className="glass p-12 rounded-[40px] border border-primary/40 bg-primary/5 text-center w-64 translate-y-16">
                <div className="text-[10px] font-bold text-primary tracking-widest uppercase mb-4 text-white/30">July 3</div>
                <div className="text-[10px] font-bold text-primary tracking-widest uppercase mb-4">The Grand Finale</div>
                <Trophy className="mx-auto text-primary w-12 h-12 mb-4" />
                <div className="text-xl font-display italic">CHAMPION</div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Teams() {
  return (
    <div>
      <PageHeader 
        title="The Teams" 
        subtitle="Meet the 20 elite squads competing for the 2026 FUTA Champions League trophy."
      />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAMS.map((team) => (
            <Link 
              key={team.id} 
              to={`/teams/${team.id}`}
              className="group"
            >
              <motion.div 
                whileHover={{ y: -8 }}
                className="glass rounded-3xl p-8 flex flex-col items-center text-center transition-all group-hover:border-primary/50"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-0 group-hover:scale-100 transition-transform" />
                  <img src={team.logo} alt={team.name} className="w-24 h-24 relative z-10" />
                </div>
                <div className="text-[10px] font-bold text-primary mb-1 tracking-widest uppercase italic">Group {team.group}</div>
                <h3 className="text-xl font-display mb-4">{team.name}</h3>
                
                <div className="grid grid-cols-3 gap-4 w-full border-t border-white/5 pt-4">
                  <div>
                    <div className="text-sm font-bold">{team.won}</div>
                    <div className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Wins</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-primary">{team.points}</div>
                    <div className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Pts</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold">{team.played}</div>
                    <div className="text-[8px] font-bold text-white/30 uppercase tracking-widest">PL</div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
export function Stats() {
  const scorers = [...PLAYERS].sort((a, b) => b.goals - a.goals);
  const assists = [...PLAYERS].sort((a, b) => b.assists - a.assists);

  return (
    <div>
      <PageHeader 
        title="Player Stats" 
        subtitle="Individual brilliance on display. Track the leaders in goals, assists, and clean sheets."
      />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Top Scorers */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-primary pb-4">
              <h2 className="text-2xl font-display italic">TOP SCORERS</h2>
              <TrendingUp className="text-primary" />
            </div>
            <div className="space-y-4">
              {scorers.map((player, i) => (
                <div key={player.id} className="glass rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-4">
                    <span className="text-xl font-display font-bold text-white/20 w-8">{i + 1}</span>
                    <img src={player.image} className="w-12 h-12 rounded-full border-2 border-white/10" alt={player.name} />
                    <div>
                      <h4 className="font-bold group-hover:text-primary transition-colors">{player.name}</h4>
                      <p className="text-xs text-white/40 uppercase tracking-widest">
                        {TEAMS.find(t => t.id === player.teamId)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-display font-bold text-primary">{player.goals}</div>
                    <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Goals</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assists Leaderboard */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-blue-500 pb-4">
              <h2 className="text-2xl font-display italic">TOP ASSISTS</h2>
              <Star className="text-blue-500" />
            </div>
            <div className="space-y-4">
              {assists.map((player, i) => (
                <div key={player.id} className="glass rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-4">
                    <span className="text-xl font-display font-bold text-white/20 w-8">{i + 1}</span>
                    <img src={player.image} className="w-12 h-12 rounded-full border-2 border-white/10" alt={player.name} />
                    <div>
                      <h4 className="font-bold group-hover:text-blue-500 transition-colors">{player.name}</h4>
                      <p className="text-xs text-white/40 uppercase tracking-widest">
                        {TEAMS.find(t => t.id === player.teamId)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-display font-bold text-blue-500">{player.assists}</div>
                    <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Assists</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
export function Media() {
  const images = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000',
    'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=1000',
    'https://images.unsplash.com/photo-1510567198467-d78887b28c4a?q=80&w=1000',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1000',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000',
    'https://images.unsplash.com/photo-1431324155629-1a6eda1eedfa?q=80&w=1000'
  ];

  return (
    <div>
      <PageHeader 
        title="Media Gallery" 
        subtitle="Capture the intensity. Explore top moments, photo reels, and match highlights."
      />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              className="aspect-video sm:aspect-square rounded-3xl overflow-hidden glass relative group"
            >
              <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Action" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ImageIcon className="text-white w-12 h-12" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20">
          <h2 className="text-2xl font-display mb-12 italic border-b border-white/10 pb-4">VIDEO HIGHLIGHTS</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((v) => (
              <div key={v} className="glass rounded-[32px] overflow-hidden relative group aspect-video">
                <img src={images[v]} className="w-full h-full object-cover opacity-50" alt="Video" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="fill-current text-dark ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6">
                  <h4 className="font-bold text-lg">Matchday {v} Highlights</h4>
                  <p className="text-white/40 text-sm">AGE vs AGP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
export function News() {
  return (
    <div>
      <PageHeader 
        title="Latest News" 
        subtitle="Match reports, official statements, and behind-the-scenes stories from FCL 2026."
      />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid lg:grid-cols-2 gap-12">
          {NEWS.map((post) => (
            <motion.article 
              key={post.id}
              whileHover={{ y: -8 }}
              className="glass rounded-[40px] overflow-hidden group"
            >
              <div className="aspect-[21/9] overflow-hidden relative">
                <img src={post.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={post.title} />
                <div className="absolute bottom-4 left-4">
                  <span className="px-4 py-2 glass rounded-full text-[10px] font-bold tracking-widest uppercase text-primary">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-8 sm:p-10">
                <div className="text-white/30 text-xs font-bold mb-4 tracking-widest uppercase">
                  {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <h2 className="text-3xl font-display mb-4 italic tracking-tight leading-tight group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-white/50 mb-8 leading-relaxed">
                  {post.excerpt}
                </p>
                <button className="flex items-center font-bold text-sm tracking-tight text-primary hover:translate-x-2 transition-transform">
                  READ ARTICLE <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
export function Sponsorship() {
  const tiers = [
    {
      name: 'GOLDEN PARTNER',
      price: '₦2,500,000+',
      color: 'text-yellow-400',
      description: 'Maximum brand resonance and category exclusivity.',
      features: [
        'Main Jersey Front Placement',
        'Pitch-side Digital LED Rotation',
        'Direct Student Email Blast (25K)',
        'VIP Awards Night Headline',
        'Full Digital Ecosystem Takeover'
      ]
    },
    {
      name: 'REGIONAL PARTNER',
      price: '₦1,000,000',
      color: 'text-white',
      description: 'High visibility across physical and digital touchpoints.',
      features: [
        'Sleeve Branding on Jerseys',
        'Physical Perimeter Banners',
        'Social Media Matchday Takeover',
        '50 VIP Season Passes',
        'Logo on Match Interview Backdrop'
      ]
    },
    {
      name: 'OFFICIAL SUPPLIER',
      price: '₦350,000',
      color: 'text-blue-400',
      description: 'Targeted reach for niche brands and local businesses.',
      features: [
        'Digital Program Logo',
        'On-Campus Activation Stall',
        '10 Season Passes',
        'Group Phase Social Shoutouts',
        'Brand Placement in App'
      ]
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Partner With FCL" 
        subtitle="Unite your brand with the most engaged student audience in Akure. 20 Teams, 25,000+ Fans, 1 Unforgettable Season."
      />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Audience Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32">
          {[
            { label: 'Total Reach', value: '25K+' },
            { label: 'Weekly Attendance', value: '4.5K+' },
            { label: 'Social Engagement', value: '85%' },
            { label: 'Brand Loyalty', value: 'High' }
          ].map((stat, i) => (
            <div key={i} className="glass p-8 rounded-[32px] text-center border border-white/5">
              <div className="text-4xl font-display font-black text-primary mb-2 italic tracking-tighter">{stat.value}</div>
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-24 items-center mb-32">
          <div className="space-y-8">
            <h2 className="text-5xl font-display italic uppercase tracking-tighter leading-none">THE MOST ENGAGED <br /> <span className="text-primary italic">YOUTH AUDIENCE</span></h2>
            <p className="text-white/50 text-lg leading-relaxed">
              FCL isn't just about football. It's a cultural phenomenon. Our partners gain direct access to the next generation of Nigeria's leaders, innovators, and consumers.
            </p>
            <div className="space-y-4">
              {[
                { title: 'Brand Credibility', desc: 'Associate with excellence and fair play.' },
                { title: 'Digital Footprint', desc: 'Aggressive social media marketing and app placement.' },
                { title: 'Raw Engagement', desc: 'Deep emotional connection with department fans.' }
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="mt-1"><Star size={16} className="text-primary" /></div>
                  <div>
                    <h4 className="font-bold text-white">{item.title}</h4>
                    <p className="text-sm text-white/40">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full" />
            <div className="relative glass rounded-[40px] p-12 border border-primary/20 text-center">
              <TrendingUp className="text-primary w-16 h-16 mx-auto mb-8 animate-bounce" />
              <h3 className="text-2xl font-display italic uppercase mb-4 tracking-tighter leading-tight">DOWNLOAD THE 2026 PARTNERSHIP PROSPECTUS</h3>
              <p className="text-xs text-white/40 mb-10 leading-relaxed uppercase tracking-widest italic">A detailed guide to demographics, value propositions, and tier customization.</p>
              <button className="w-full py-5 sporty-gradient rounded-[20px] font-black text-dark text-center hover:scale-105 transition-transform flex items-center justify-center group uppercase">
                GET THE FULL PDF
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div key={tier.name} className="glass rounded-[40px] p-10 flex flex-col items-center text-center group hover:border-primary/50 transition-all">
              <h3 className={cn("text-2xl font-display mb-2 uppercase tracking-tighter italic", tier.color)}>{tier.name}</h3>
              <div className="text-sm font-bold text-white/20 uppercase tracking-[0.2em] mb-4">STARTING FROM</div>
              <div className="text-2xl font-mono font-bold text-white mb-6 bg-white/5 px-6 py-2 rounded-full">{tier.price}</div>
              <p className="text-xs text-white/40 mb-8 italic">{tier.description}</p>
              <ul className="space-y-4 mb-10 flex-1 border-y border-white/5 py-8 w-full">
                {tier.features.map((f, i) => (
                  <li key={i} className="text-xs text-white/60 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-3 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 glass border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest group-hover:bg-primary group-hover:text-dark transition-all">
                REQUEST {tier.name}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
export function About() {
  return (
    <div>
      <PageHeader 
        title="About FCL" 
        subtitle="The history, the mission, and the vision of the premier football league in Akure."
      />
      
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="prose prose-invert prose-lg max-w-none">
          <h2 className="text-3xl font-display italic">THE VISION</h2>
          <p className="text-white/60 leading-relaxed mb-12">
            The FUTA Champions League (FCL) was founded with a singular purpose: to bridge the gap between academic excellence and sporting prowess. We believe that football is more than just a game; it's a vehicle for leadership, teamwork, and community building.
          </p>

          <img 
            src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1500" 
            className="w-full h-96 object-cover rounded-[40px] mb-12" 
            alt="FUTA Sports"
          />

          <div className="grid sm:grid-cols-2 gap-12 mb-20">
            <div>
              <h3 className="text-xl font-display text-primary mb-4 italic">OUR MISSION</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                To provide a professional platform for student-athletes to showcase their skills, while fostering a healthy inter-departmental rivalry that unites the entire university.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-display text-primary mb-4 italic">THE COMPETITION</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                20 Teams compete in a rigorous league format. The top 2 advance to Quarter-Finals, while seeds 3-14 enter a high-stakes playoff round. The bottom 6 are eliminated.
              </p>
            </div>
          </div>

          <div className="glass rounded-[40px] p-12 text-center">
            <h3 className="text-2xl font-display mb-2 italic">THE ORGANIZERS</h3>
            <p className="text-white/40 italic mb-0">Managed by FUTA Sports Committee & Alumni Sports Network</p>
          </div>
        </div>
      </section>
    </div>
  );
}
export function Contact() {
  return (
    <div>
      <PageHeader 
        title="Get In Touch" 
        subtitle="Official communication channel for FUTA Champions League organizers. We're here to help."
      />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-[40px] p-8 sm:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16" />
            
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShieldCheck className="text-primary w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Official Inquiry Form</span>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Full Name</label>
                  <input type="text" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-all" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Email Address</label>
                  <input type="email" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-all" placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Subject (Optional)</label>
                <select className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary outline-none appearance-none cursor-pointer">
                  <option>General Inquiry</option>
                  <option>Sponsorship & Partnership</option>
                  <option>Media & Press</option>
                  <option>Complaints & Feedback</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Message</label>
                <textarea rows={5} className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-all resize-none" placeholder="How can we help the FCL organizers today?" />
              </div>
              
              <div className="flex items-center space-x-3 py-2">
                <Clock className="text-white/20 w-4 h-4" />
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest italic">Response Expectation: 24–48 hours</span>
              </div>

              <button className="w-full py-5 sporty-gradient rounded-2xl font-black tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
                SEND OFFICIAL MESSAGE
              </button>
            </form>
          </motion.div>

          <div className="flex flex-col justify-between space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-display mb-8 italic uppercase tracking-tighter">Official Channels</h3>
                <div className="space-y-4">
                  <a href="mailto:futa.cl@yahoo.com" className="flex items-center space-x-6 glass p-6 rounded-3xl border border-white/10 hover:border-primary/40 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Mail size={28} /></div>
                    <div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Email us at</div>
                      <div className="text-xl font-bold font-mono tracking-tight">futa.cl@yahoo.com</div>
                    </div>
                  </a>

                  <a href="tel:+2348027479363" className="flex items-center space-x-6 glass p-6 rounded-3xl border border-white/10 hover:border-primary/40 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Phone size={28} /></div>
                    <div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Call for inquiries</div>
                      <div className="text-xl font-bold font-mono tracking-tight">+234 802 747 9363</div>
                    </div>
                  </a>

                  <a href="https://x.com/FUTA_CL" target="_blank" rel="noreferrer" className="flex items-center space-x-6 glass p-6 rounded-3xl border border-white/10 hover:border-blue-400/40 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-blue-400/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform"><Twitter size={28} /></div>
                    <div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Follow on X/Twitter</div>
                      <div className="text-xl font-bold font-mono tracking-tight">@FUTA_CL</div>
                    </div>
                  </a>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-700" />
                <div className="relative glass rounded-[40px] p-10 border border-primary/20 text-center flex flex-col items-center">
                  <Trophy className="text-primary w-12 h-12 mb-6 animate-pulse" />
                  <h4 className="text-xl font-display italic uppercase mb-2 tracking-tighter">Grow Your Brand with FCL</h4>
                  <p className="text-xs text-white/50 mb-8 leading-relaxed max-w-xs">
                    Join our elite network of partners and connect with 25,000+ passionate students and fans.
                  </p>
                  <Link 
                    to="/sponsorship" 
                    className="w-full py-4 glass border border-white/10 rounded-2xl text-xs font-bold tracking-widest hover:bg-white/10 transition-all flex items-center justify-center uppercase"
                  >
                    Become a Sponsor
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4 }}
               className="p-8 glass rounded-[40px] border border-white/5 bg-white/[0.01] relative"
            >
              <div className="flex items-start space-x-4">
                <div className="mt-1"><ShieldCheck className="text-primary w-5 h-5" /></div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Trust Statement</h4>
                  <p className="text-xs text-white/40 leading-relaxed italic">
                    “Official communication channel for FUTA Champions League organizers. All data shared via this form is handled securely according to FCL privacy standards.”
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
export function TeamProfile() {
  const { id } = useParams();
  const team = TEAMS.find(t => t.id === id);
  const teamPlayers = PLAYERS.filter(p => p.teamId === id);

  if (!team) return <div>Team not found</div>;

  return (
    <div>
      <div className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-8 md:space-y-0 md:space-x-12">
            <motion.img 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={team.logo} 
              alt={team.name} 
              className="w-48 h-48 drop-shadow-2xl"
            />
            <div className="text-center md:text-left">
              <div className="text-primary font-bold tracking-[0.3em] uppercase mb-2">Group {team.group}</div>
              <h1 className="text-5xl sm:text-7xl font-display font-black italic tracking-tighter uppercase mb-6">{team.name}</h1>
              <div className="flex space-x-8 justify-center md:justify-start">
                <div>
                  <div className="text-3xl font-display font-bold">{team.points}</div>
                  <div className="text-[10px] font-bold text-white/30 tracking-[0.2em]">PTS</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <div className="text-3xl font-display font-bold">{team.won}</div>
                  <div className="text-[10px] font-bold text-white/30 tracking-[0.2em]">WINS</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <div className="text-3xl font-display font-bold">{team.goalsFor}</div>
                  <div className="text-[10px] font-bold text-white/30 tracking-[0.2em]">GOALS</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-2xl font-display italic mb-8 border-b border-white/10 pb-4 uppercase">THE SQUAD</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {teamPlayers.map((player) => (
                  <div key={player.id} className="glass p-4 rounded-2xl flex items-center space-x-4">
                    <img src={player.image} alt={player.name} className="w-12 h-12 rounded-xl" />
                    <div>
                      <h4 className="font-bold">{player.name}</h4>
                      <p className="text-[10px] font-bold text-primary uppercase italic">{player.position}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass p-8 rounded-[40px]">
              <h3 className="text-lg font-bold mb-4 italic uppercase">TEAM BIO</h3>
              <p className="text-white/50 leading-relaxed text-sm">
                {team.description}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
