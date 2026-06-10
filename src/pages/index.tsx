import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import { Trophy, ArrowRight, Star, Youtube, Play, TrendingUp, Users, Mail, Phone, Image as ImageIcon, Twitter, ExternalLink, ShieldCheck, Clock, Medal, BookOpen, ChevronRight, Search, Edit2, AlertCircle, Inbox, Trash2, Filter, Check, CheckCheck } from 'lucide-react';
import { Countdown } from '../components/Countdown';
import { MatchCard } from '../components/MatchCard';
import { PageHeader } from '../components/PageHeader';
import { NEWS, SPONSORS, PLAYERS, COEFFICIENTS, TEAMS } from '../data/mockData';
import { Match, Sponsor } from '../types';
import { cn } from '../lib/utils';
import { useMatchState } from '../context/MatchStateContext';
import { fclApi } from '../lib/api';

import { LeagueTable } from '../components/LeagueTable';
import { CoefficientTable } from '../components/CoefficientTable';
import { TeamLogo } from '../components/TeamLogo';

export { Champions } from './Champions';

interface SponsorContactModalProps {
  sponsor: Sponsor;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export const SponsorContactModal: React.FC<SponsorContactModalProps> = ({ sponsor, onClose, onSubmitSuccess }) => {
  const [name, setName] = React.useState('');
  const [organization, setOrganization] = React.useState('');
  const [intent, setIntent] = React.useState('Partnership');
  const [message, setMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  const [captchaAnswer, setCaptchaAnswer] = React.useState('');
  const [captchaInput, setCaptchaInput] = React.useState('');
  const [captchaCode, setCaptchaCode] = React.useState('');

  // Generate CAPTCHA
  React.useEffect(() => {
    generateNewCaptcha();
  }, [sponsor]);

  const generateNewCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput('');
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Sender Name is required.');
      return;
    }
    if (!message.trim() || message.trim().length < 20) {
      setErrorMessage('Message must be at least 20 characters.');
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      setErrorMessage('Verification code is incorrect.');
      return;
    }

    setIsSubmitting(true);

    try {
      // First, log the inquiry to our backend database
      await fclApi.submitInquiry({
        name: name.trim(),
        email: sponsor.email || 'futa.cl@yahoo.com',
        phone: '',
        category: 'Sponsorship Proposal',
        subject: `Sponsorship Proposal for ${sponsor.name}`,
        message: `Intent: ${intent}\nOrganization: ${organization || 'N/A'}\nMessage: ${message}`
      });

      // Construct Mailto Link
      const toEmail = sponsor.email || 'futa.cl@yahoo.com';
      const subject = encodeURIComponent(`[FCL Sponsorship Inquiry] - ${sponsor.name}`);
      const body = encodeURIComponent(
        `Dear ${sponsor.name} Team,\n\nI am reaching out regarding a sponsorship partnership opportunity through the official FUTA Champions League 2026 platform.\n\n` +
        `* SENDER DETAILS *\n` +
        `- Name: ${name.trim()}\n` +
        `- Organization: ${organization.trim() || 'N/A'}\n` +
        `- Intent: ${intent}\n\n` +
        `* MESSAGE *\n` +
        `${message}\n\n` +
        `--------------------\n` +
        `Sent via FCL 2026 Partner Portal | Timestamp: ${new Date().toLocaleString()}`
      );

      // Open mail client
      window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;

      setSuccessMessage('Your sponsorship inquiry message has been successfully generated & saved.');
      setTimeout(() => {
        if (onSubmitSuccess) onSubmitSuccess();
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to register inquiry on server, but you can still contact them via email: ' + (sponsor.email || 'futa.cl@yahoo.com'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/85 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#0e1626] border border-[#00e5ff]/20 rounded-[32px] p-6 sm:p-8 shadow-2xl relative space-y-6 text-left"
      >
        <button 
          className="absolute top-6 right-6 text-white/40 hover:text-white text-2xl font-display cursor-pointer transition-colors"
          onClick={onClose}
        >
          &times;
        </button>

        <div>
          <span className="text-[9px] bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20 px-3 py-1 rounded-full font-black uppercase tracking-widest font-mono">
            Sponsor Connect
          </span>
          <h3 className="text-2xl font-display font-black uppercase text-white mt-3 italic tracking-tight">
            CONNECT WITH {sponsor.name}
          </h3>
          <p className="text-xs text-white/50 leading-relaxed mt-1">
            Fill out your partnership intent. On submission, this registers with the FCL Admin and opens your local email client configured for <span className="text-[#00e5ff] font-mono">{sponsor.email || 'futa.cl@yahoo.com'}</span>.
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-xs text-red-400 font-bold leading-relaxed flex items-start gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl text-xs text-emerald-400 font-black leading-relaxed flex items-start gap-2 animate-bounce">
            <span>✔</span>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleConnect} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest block">Sender Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-[#00e5ff] outline-none"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest block">Organization (Optional)</label>
              <input 
                type="text" 
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Apex Brands Ltd"
                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-[#00e5ff] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-[#00e5ff] font-bold uppercase tracking-widest block">Intent Category <span className="text-red-500">*</span></label>
            <select 
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-[#00e5ff] outline-none cursor-pointer"
            >
              <option value="Partnership">Partnership</option>
              <option value="Advertising">Advertising</option>
              <option value="Media Collaboration">Media Collaboration</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest block">Inquiry Message (Min 20 Chars) <span className="text-red-500">*</span></label>
            <textarea 
              rows={4} 
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detail your request for collaboration, premium branding slots, event activations, or promotional campaigns..." 
              className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white/90 focus:border-[#00e5ff] outline-none resize-none leading-relaxed"
            />
          </div>

          {/* CAPTCHA */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#0e1626] px-4 py-2 rounded-lg font-mono font-black border border-white/10 text-white text-sm select-none tracking-widest italic line-through shadow-inner">
                {captchaCode}
              </div>
              <button 
                type="button" 
                onClick={generateNewCaptcha} 
                className="text-[10px] text-[#00e5ff] font-black uppercase tracking-wider hover:underline"
              >
                Refresh
              </button>
            </div>
            
            <div className="w-full sm:w-auto">
              <input 
                type="text" 
                required
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Verification code"
                className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-xs font-black uppercase text-white tracking-widest text-center focus:border-[#00e5ff] outline-none placeholder-white/30"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-3 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#00e5ff] hover:bg-[#00e5ff]/85 text-dark font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-[#00e5ff]/10 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Construct Email & Connect'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

interface SponsorCardProps {
  sponsor: Sponsor;
  onContactClick?: (sponsor: Sponsor) => void;
}

const SponsorCard: React.FC<SponsorCardProps> = ({ sponsor, onContactClick }) => {
  const [showPlaceholder, setShowPlaceholder] = React.useState(!sponsor.logoUrl);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word: string) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const initials = getInitials(sponsor.name);

  return (
    <div 
      className="glass group p-6 rounded-3xl border border-white/5 hover:border-[#00e5ff]/30 hover:shadow-[0_0_20px_rgba(0,229,255,0.05)] transition-all duration-300 flex flex-col justify-between items-center text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#00e5ff]/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Category Label */}
      <span className="text-[8px] font-black uppercase tracking-widest text-[#00e5ff] bg-[#00e5ff]/10 px-2.5 py-1 rounded-full mb-3 self-center border border-[#00e5ff]/15 z-10 font-mono">
        {sponsor.category || 'Sponsor'}
      </span>

      {/* Logo container */}
      <div 
        onClick={() => {
          if (sponsor.website && sponsor.website !== '#') {
            window.open(sponsor.website, '_blank', 'noopener,noreferrer');
          }
        }}
        className={cn(
          "flex-1 flex items-center justify-center w-full min-h-[64px] mb-4 z-10",
          sponsor.website && sponsor.website !== '#' ? 'cursor-pointer' : ''
        )}
        title={sponsor.website && sponsor.website !== '#' ? `Visit ${sponsor.name} website` : undefined}
      >
        {!showPlaceholder && sponsor.logoUrl ? (
          <img 
            src={sponsor.logoUrl} 
            alt={sponsor.name} 
            onError={() => setShowPlaceholder(true)}
            className="max-h-16 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
          />
        ) : (
          /* Custom FCL Sponsor Logo Placeholder Box */
          <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/10 group-hover:border-[#00e5ff]/30 text-white/30 group-hover:text-[#00e5ff]/80 font-mono flex flex-col items-center justify-center transition-all">
            <span className="text-xl font-bold tracking-tight">{initials}</span>
            <span className="text-[7px] font-bold tracking-widest uppercase opacity-60 mt-0.5">FCL PARTNER</span>
          </div>
        )}
      </div>

      {/* Sponsor Name & Details */}
      <div className="z-10 w-full mb-4">
        <h5 className="text-[13px] font-black text-gray-200 group-hover:text-white transition-colors tracking-tight line-clamp-1">{sponsor.name}</h5>
        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block transform group-hover:translate-x-1 transition-transform mt-0.5 font-semibold">
          {sponsor.tier || 'SPONSOR'} PARTNER
        </span>
      </div>

      {/* Contact Button */}
      {onContactClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContactClick(sponsor);
          }}
          className="w-full py-2.5 bg-white/5 hover:bg-[#00e5ff] text-white hover:text-dark border border-white/10 hover:border-[#00e5ff] rounded-xl font-black text-[9px] uppercase tracking-widest transition-all z-10 cursor-pointer"
        >
          Contact Sponsor
        </button>
      )}
    </div>
  );
}

export function Home() {
  const { matches, sponsors } = useMatchState();
  const [contactSponsor, setContactSponsor] = React.useState<Sponsor | null>(null);
  const featuredMatch = matches.find(m => m.id === 'md1-1') || matches[0];
  const latestNews = NEWS.slice(0, 2);
  const topPlayers = PLAYERS.slice(0, 3);
  const topTeamsTable = <LeagueTable limit={5} />;
  const topCoefficients = COEFFICIENTS.slice(0, 3);

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
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full glass border border-primary/20">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase">Opening Match • June 10 • 4:00 PM</span>
                </div>
                <Link to="/champions" className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass border border-yellow-500/30 bg-yellow-500/5 group/champ hover:bg-yellow-500/10 transition-colors">
                  <Trophy size={14} className="text-yellow-500" />
                  <span className="text-[10px] font-bold tracking-[0.2em] text-yellow-500 uppercase">Defending Champions: MST</span>
                </Link>
              </div>
              
              <h1 className="text-6xl sm:text-9xl font-display font-black leading-[0.85] mb-10 tracking-tighter italic origin-left">
                MST <span className="text-primary tracking-widest">VS</span> ICE.<br />
                <span className="text-primary italic">THE OPENER.</span> <br />
                SEASON 2026.
              </h1>
              
              <p className="text-lg text-white/50 mb-12 max-w-lg leading-relaxed font-medium">
                The defending champions return. MST faces off against ICE in the ultimate season opener. Don't miss the kickoff.
              </p>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link to="/fixtures" className="px-10 py-5 sporty-gradient rounded-full font-black text-dark text-center hover:scale-105 active:scale-95 transition-all flex items-center justify-center group shadow-[0_0_40px_rgba(0,229,255,0.3)]">
                  DON'T MISS THE KICKOFF
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
                      <p className="text-[10px] font-bold text-primary tracking-[0.2em] mb-3 uppercase">Season Opener • Starts In</p>
                      <Countdown targetDate="2026-06-10T16:00:00" />
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
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <Medal className="text-yellow-500" size={20} />
            <span className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Defending Champions</span>
          </div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass rounded-3xl p-6 border border-yellow-500/20 bg-yellow-500/5 flex items-center justify-between group"
          >
            <div className="flex items-center space-x-6">
               <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 flex items-center justify-center p-2.5">
                 <TeamLogo teamId="mst" logoUrl={TEAMS.find(t => t.id === 'mst')?.logoUrl} size="custom" className="w-[100%] h-[100%] object-contain bg-transparent border-0 shadow-none font-display text-[20px] font-black" />
               </div>
               <div>
                 <h3 className="text-2xl font-display font-black italic uppercase text-white group-hover:text-yellow-500 transition-colors">MST</h3>
                 <p className="text-sm text-white/40 font-medium">Kings of 2025. Returning to defend the throne.</p>
               </div>
            </div>
            <Link to="/teams/mst" className="px-6 py-3 bg-yellow-500 text-dark font-black text-xs rounded-xl hover:scale-105 transition-transform uppercase tracking-widest">
              Team Profile
            </Link>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-3xl font-display italic uppercase tracking-tighter">OPENING FIXTURE</h2>
                <div className="px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Live from Main Bowl</div>
              </div>
              <Link to="/fixtures" className="text-primary font-bold text-sm hover:underline">VIEW ALL</Link>
            </div>
            <div className="relative p-1 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-[42px] group">
              <div className="absolute -inset-1 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <MatchCard match={featuredMatch} />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {matches.filter(m => m.id !== featuredMatch.id).slice(0, 2).map(m => (
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

      <PotAHighlight />

      {/* Coefficient Highlights - TOP RANKED TEAMS (PRE-TOURNAMENT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-[50px] p-8 sm:p-16 border border-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] -mr-64 -mt-64 group-hover:bg-primary/10 transition-colors duration-1000" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
              <div className="max-w-2xl">
                <div className="inline-flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ShieldCheck className="text-primary w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Official Pre-Tournament Rankings</span>
                </div>
                <h2 className="text-4xl sm:text-6xl font-display font-black italic uppercase tracking-tighter leading-none mb-6">
                  TOP RANKED TEAMS <br />
                  <span className="text-primary italic">(PRE-TOURNAMENT)</span>
                </h2>
                <p className="text-white/40 text-lg leading-relaxed">
                  The FCL Coefficient Ranking measures team performance across previous seasons. It reflects consistency, historical strength, and competitive pedigree heading into the 2026 tournament.
                </p>
              </div>
              <Link to="/rankings" className="group flex items-center space-x-4 bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-2xl transition-all">
                <span className="text-xs font-black uppercase tracking-widest leading-none">Explore Final Hierarchy</span>
                <div className="p-2 bg-primary/20 rounded-lg text-primary group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={16} />
                </div>
              </Link>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-8 overflow-hidden">
                <CoefficientTable data={topCoefficients} />
              </div>
              <div className="lg:col-span-4 space-y-6">
                <div className="p-10 glass rounded-[40px] border border-primary/20 bg-primary/5 relative group/card">
                   <div className="absolute top-0 right-0 p-4 opacity-20 group-hover/card:opacity-100 transition-opacity">
                     <Medal className="text-primary w-8 h-8" />
                   </div>
                   <h4 className="text-sm font-bold text-primary mb-4 italic uppercase tracking-widest leading-tight">Prestige & Power</h4>
                   <p className="text-xs text-white/50 leading-relaxed mb-6">
                     Higher coefficient = stronger historical performance. These departments are the "Departmental Kings" of FUTA sports.
                   </p>
                   <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center space-x-3">
                     <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                     <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Calculated Pre-2026 Season</span>
                   </div>
                </div>
              </div>
            </div>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 pt-20 pb-16">
        <p className="text-center text-xs font-bold tracking-[0.3em] text-[#00e5ff] mb-16 uppercase">OFFICIAL SPONSORS & PARTNERS (2026)</p>
        
        {/* Sponsors Row */}
        <div className="space-y-6 mb-16">
          <h4 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-white/40 text-center">OFFICIAL TOURNAMENT SPONSORS</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {(sponsors && sponsors.length > 0 ? sponsors : SPONSORS)
              .filter(s => s.category === 'Sponsor')
              .map((sponsor) => (
                <SponsorCard key={sponsor.id} sponsor={sponsor} onContactClick={setContactSponsor} />
              ))}
          </div>
        </div>

        {/* Media Partners Row */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-white/40 text-center">OFFICIAL MEDIA PARTNERS</h4>
          <div className="grid grid-cols-2 md:flex md:justify-center gap-6 max-w-3xl mx-auto">
            {(sponsors && sponsors.length > 0 ? sponsors : SPONSORS)
              .filter(s => s.category === 'Media Partner')
              .map((sponsor) => (
                <div key={sponsor.id} className="w-full md:w-60">
                  <SponsorCard sponsor={sponsor} onContactClick={setContactSponsor} />
                </div>
              ))}
          </div>
        </div>
      </section>

      {contactSponsor && (
        <SponsorContactModal 
          sponsor={contactSponsor} 
          onClose={() => setContactSponsor(null)} 
        />
      )}
    </div>
  );
}
export function Fixtures() {
  const { matches, editFixture, teams } = useMatchState();
  const [activeMW, setActiveMW] = React.useState(1);
  const [viewTab, setViewTab] = React.useState<'fixtures' | 'referees'>('fixtures');
  
  // Referees search & filtering state
  const [refereeSearch, setRefereeSearch] = React.useState('');
  const [refFilterMW, setRefFilterMW] = React.useState<number | 'all'>('all');
  const [refFilterStatus, setRefFilterStatus] = React.useState<'all' | 'assigned' | 'pending'>('all');

  // Referee editing modal state
  const [editingMatchId, setEditingMatchId] = React.useState<string | null>(null);
  const [editRefName, setEditRefName] = React.useState('');
  const [editRefAssigned, setEditRefAssigned] = React.useState(false);
  const [editMatchApproved, setEditMatchApproved] = React.useState(false);
  const [editPanelText, setEditPanelText] = React.useState('');

  const matchWeeks = [1, 2, 3]; 

  const filteredMatches = matches.filter(m => m.matchday === activeMW);
  const matchdayOpeningLabel = activeMW === 1 ? 'Season Opener & Week 1 (June 5-7)' : activeMW === 2 ? 'Mid-Season Clash (June 10-11)' : 'Final League Push (June 13-15)';

  const isAdmin = !!localStorage.getItem('fcl_admin_user');

  // Find team logo helper
  const getTeamLogoUrl = (teamAbbr: string) => {
    const t = teams.find(team => team.id.toLowerCase() === teamAbbr.toLowerCase());
    return t?.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${teamAbbr}`;
  };

  const getTeamName = (teamAbbr: string) => {
    const t = teams.find(team => team.id.toLowerCase() === teamAbbr.toLowerCase());
    return t?.name || teamAbbr;
  };

  // Open Referee Editor Dialog
  const openRefereeEditor = (match: Match) => {
    setEditingMatchId(match.id);
    setEditRefName(match.referee || '');
    setEditRefAssigned(!!match.refereeAssigned);
    setEditMatchApproved(!!match.matchApproved);
    setEditPanelText(match.officialsPanel ? match.officialsPanel.join('\n') : '');
  };

  // Save Referee Settings
  const saveRefereeData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatchId) return;

    const panelList = editPanelText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const defaultPanel = panelList.length > 0 ? panelList : [
      'Kickoff supervision',
      'Foul adjudication',
      'Card issuance (Yellow/Red)',
      'Match timing control',
      'Final match report validation'
    ];

    editFixture(editingMatchId, {
      referee: editRefName.trim() || undefined,
      refereeAssigned: editRefName.trim().length > 0 ? editRefAssigned : false,
      matchApproved: editMatchApproved,
      officialsPanel: editRefName.trim().length > 0 ? defaultPanel : []
    });

    setEditingMatchId(null);
  };

  // Filter referees schedule list
  const filteredRefereesList = matches.filter(match => {
    const searchLower = refereeSearch.toLowerCase();
    const refereeMatched = match.referee?.toLowerCase().includes(searchLower);
    const homeMatched = match.homeTeam.toLowerCase().includes(searchLower) || getTeamName(match.homeTeam).toLowerCase().includes(searchLower);
    const awayMatched = match.awayTeam.toLowerCase().includes(searchLower) || getTeamName(match.awayTeam).toLowerCase().includes(searchLower);
    const venueMatched = match.venue.toLowerCase().includes(searchLower);
    
    const matchesSearch = refereeSearch === '' || refereeMatched || (homeMatched || awayMatched || venueMatched);
    const matchesMW = refFilterMW === 'all' || match.matchday === refFilterMW;
    
    let matchesStatus = true;
    if (refFilterStatus === 'assigned') {
      matchesStatus = !!match.referee;
    } else if (refFilterStatus === 'pending') {
      matchesStatus = !match.referee;
    }

    return matchesSearch && matchesMW && matchesStatus;
  });

  return (
    <div>
      <PageHeader 
        title="Fixtures & Results" 
        subtitle="3 Matches per team. Every point counts in the race for the top 2."
      />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        
        {/* Tab Selection */}
        <div className="flex justify-center mb-10">
          <div className="bg-navy-dark border border-white/10 rounded-2xl p-1.5 flex gap-2 w-full max-w-md shadow-2xl">
            <button
              onClick={() => setViewTab('fixtures')}
              className={cn(
                "flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer",
                viewTab === 'fixtures'
                  ? 'bg-primary text-dark shadow-[0_0_15px_rgba(0,229,255,0.35)]'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.02]'
              )}
            >
              <Trophy size={13} />
              <span>Fixtures Roster</span>
            </button>
            <button
              onClick={() => setViewTab('referees')}
              className={cn(
                "flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer",
                viewTab === 'referees'
                  ? 'bg-[#00e5ff] text-dark shadow-[0_0_15px_rgba(0,229,255,0.35)]'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.02]'
              )}
            >
              <ShieldCheck size={13} />
              <span>Officiating Schedule</span>
            </button>
          </div>
        </div>

        {viewTab === 'fixtures' ? (
          <>
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
          </>
        ) : (
          <div className="space-y-8">
            {/* Advanced Filters & Search Bar */}
            <div className="glass border border-white/10 rounded-[32px] p-6 bg-navy/60 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                
                {/* Search */}
                <div className="relative w-full md:flex-1">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={refereeSearch}
                    onChange={(e) => setRefereeSearch(e.target.value)}
                    placeholder="Search by referee name, team name, venue or details..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-5 py-4 text-xs font-bold font-sans tracking-wide focus:border-[#00e5ff] outline-none text-white placeholder-white/30"
                  />
                </div>

                {/* Matchday filter */}
                <div className="flex gap-2 w-full md:w-auto">
                  <span className="text-[10px] text-white/40 font-black uppercase tracking-wider self-center hidden lg:inline">Matchday:</span>
                  <select
                    value={refFilterMW}
                    onChange={(e) => setRefFilterMW(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="bg-navy border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold uppercase tracking-wider text-white focus:border-[#00e5ff] outline-none cursor-pointer flex-1 md:flex-none"
                  >
                    <option value="all">ALL MATCHDAYS</option>
                    <option value="1">MATCHDAY 1</option>
                    <option value="2">MATCHDAY 2</option>
                    <option value="3">MATCHDAY 3</option>
                  </select>
                </div>

                {/* Status filter */}
                <div className="flex gap-2 w-full md:w-auto">
                  <span className="text-[10px] text-white/40 font-black uppercase tracking-wider self-center hidden lg:inline">Status:</span>
                  <select
                    value={refFilterStatus}
                    onChange={(e) => setRefFilterStatus(e.target.value as any)}
                    className="bg-navy border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold uppercase tracking-wider text-white focus:border-[#00e5ff] outline-none cursor-pointer flex-1 md:flex-none"
                  >
                    <option value="all">ALL STATUSES</option>
                    <option value="assigned">ASSIGNED REFEREE</option>
                    <option value="pending">PENDING ASSIGNMENT</option>
                  </select>
                </div>

              </div>

              {/* Quick Info Bar */}
              <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[10px] text-white/40 font-bold uppercase tracking-wider gap-2">
                <div>
                  💡 Total matches scheduled: <span className="text-[#00e5ff] font-black">{matches.length} matches</span> (showing {filteredRefereesList.length})
                </div>
                {isAdmin && (
                  <div className="text-emerald-400 font-extrabold flex items-center gap-1">
                    <span>👑 Admin Privileges Active</span>
                    <span className="text-white/20">| Click match Edit buttons to assign referee settings</span>
                  </div>
                )}
              </div>
            </div>

            {/* Officiating Cards List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRefereesList.map((matchObj: Match) => {
                const isAssigned = !!matchObj.referee;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={matchObj.id}
                    className={cn(
                      "glass border rounded-[32px] p-6 bg-navy/40 flex flex-col justify-between space-y-4 text-left transition-all hover:scale-[1.01]",
                      isAssigned ? "border-white/10" : "border-amber-500/20 bg-amber-500/5"
                    )}
                  >
                    {/* Header: Match details */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[#00e5ff] font-semibold tracking-widest uppercase">
                          Matchday 0{matchObj.matchday}
                        </span>
                        
                        {isAssigned ? (
                          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wide flex items-center gap-1 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                            ✔ Assigned
                          </span>
                        ) : (
                          <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wide flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                            ⏳ Pending
                          </span>
                        )}
                      </div>

                      {/* Teams display */}
                      <div className="flex items-center justify-between py-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <TeamLogo src={getTeamLogoUrl(matchObj.homeTeam)} size={28} className="border border-white/10 p-0.5 rounded-md" />
                          <span className="font-sans font-bold text-sm tracking-tight text-white">{matchObj.homeTeam}</span>
                        </div>
                        <span className="text-[10px] text-white/30 lowercase font-mono">vs</span>
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-bold text-sm tracking-tight text-white">{matchObj.awayTeam}</span>
                          <TeamLogo src={getTeamLogoUrl(matchObj.awayTeam)} size={28} className="border border-white/10 p-0.5 rounded-md" />
                        </div>
                      </div>

                      {/* Venue / Timing details */}
                      <div className="pt-2 text-[10px] space-y-1 font-mono text-white/40">
                        <p>📅 Date: <span className="text-white/60 font-semibold">{matchObj.date}</span></p>
                        <p>⏰ Time: <span className="text-white/60 font-semibold">{matchObj.time}</span></p>
                        <p>🏟 Venue: <span className="text-white/60 font-semibold">{matchObj.venue}</span></p>
                      </div>

                      {/* Official Referee Area */}
                      <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
                        <span className="text-[9px] text-white/30 font-bold tracking-widest uppercase block">OFFICIAL REFEREE</span>
                        {isAssigned ? (
                          <div className="flex items-center justify-between">
                            <span className="font-sans font-black text-white text-base flex items-center gap-2">
                              <span>👮</span> {matchObj.referee}
                            </span>
                            
                            {isAdmin && (
                              <button
                                onClick={() => openRefereeEditor(matchObj)}
                                className="p-1.5 bg-[#00e5ff]/10 hover:bg-[#00e5ff] text-[#00e5ff] hover:text-dark rounded-lg transition-colors border border-[#00e5ff]/20 cursor-pointer"
                                title="Edit Referee"
                              >
                                <Edit2 size={11} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-amber-500/80 font-bold text-xs italic">Awaiting Commission Assignment</span>
                            {isAdmin ? (
                              <button
                                onClick={() => openRefereeEditor(matchObj)}
                                className="px-3 py-1 bg-[#00e5ff] hover:bg-[#00e5ff]/80 text-dark font-black text-[9px] rounded-lg transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 size={10} /> Assign
                              </button>
                            ) : null}
                          </div>
                        )}
                      </div>

                      {/* Officials Panel sub-items */}
                      {isAssigned && matchObj.officialsPanel && matchObj.officialsPanel.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <span className="text-[8px] text-white/40 font-mono tracking-widest uppercase block">OFFICIALS PANEL CHECKS</span>
                          <ul className="space-y-1 border border-white/5 rounded-xl p-3 bg-white/[0.02]">
                            {matchObj.officialsPanel.map((chk, i) => (
                              <li key={i} className="text-[10px] text-white/50 leading-relaxed font-semibold flex gap-1.5 items-start">
                                <span className="text-[#00e5ff] font-bold">•</span>
                                <span>{chk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Footer approval actions */}
                    {isAssigned && (
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-bold tracking-wider">
                        <span className={cn(
                          "uppercase",
                          matchObj.matchApproved ? "text-emerald-400" : "text-amber-400"
                        )}>
                          Status: {matchObj.matchApproved ? "✔ Match Approved for Officiating" : "⏳ Pending Match Approval"}
                        </span>
                        
                        {!matchObj.matchApproved && isAdmin && (
                          <button
                            onClick={() => {
                              editFixture(matchObj.id, { matchApproved: true });
                            }}
                            className="text-[9px] bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold uppercase px-2 py-0.5 rounded-md cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {filteredRefereesList.length === 0 && (
                <div className="col-span-full text-center py-24 glass rounded-[40px] border border-white/10 space-y-3">
                  <AlertCircle className="text-white/20 mx-auto w-10 h-10" />
                  <p className="text-lg font-display font-black text-white/40 uppercase tracking-widest italic">No match referees found</p>
                  <p className="text-xs text-white/25">
                    No schedules match your specified keywords or search queries. Try clearing some filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </section>

      {/* ADMIN EDIT MODAL / SCREEN OVERLAY */}
      {editingMatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-navy-dark border border-white/10 rounded-[32px] p-6 shadow-2xl relative space-y-6 text-left"
          >
            {/* Modal Heading */}
            <div className="pb-4 border-b border-white/5">
              <h3 className="text-lg font-display font-black uppercase text-white tracking-widest">⚙️ OFFICIATING PANEL ASSIGNMENT</h3>
              <p className="text-xs text-white/40 mt-1">
                FCL Commissioner console. Set the head referee & compliance supervision checklist.
              </p>
            </div>

            <form onSubmit={saveRefereeData} className="space-y-4">
              {/* Referee Name */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#00e5ff] font-bold tracking-widest uppercase block">REFEREE NAME</label>
                <input
                  type="text"
                  required
                  value={editRefName}
                  onChange={(e) => setEditRefName(e.target.value)}
                  placeholder="Enter Full Name (e.g. Adesiyan Victor)"
                  className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-[#00e5ff] outline-none text-white font-sans"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editRefAssigned}
                      onChange={(e) => setEditRefAssigned(e.target.checked)}
                      className="w-4 h-4 rounded text-[#00e5ff]"
                    />
                    <span className="text-[10px] text-white font-black uppercase tracking-wider">REF ASSIGNED</span>
                  </label>
                  <p className="text-[9px] text-white/40 leading-normal">Referee officially confirmed and delegated to fixture</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editMatchApproved}
                      onChange={(e) => setEditMatchApproved(e.target.checked)}
                      className="w-4 h-4 rounded text-[#00e5ff]"
                    />
                    <span className="text-[10px] text-white font-black uppercase tracking-wider">MATCH APPROVED</span>
                  </label>
                  <p className="text-[9px] text-white/40 leading-normal">FCL committee authorizes match to kickoff under standards</p>
                </div>
              </div>

              {/* Officials Panel */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#00e5ff] font-bold tracking-widest uppercase block">
                  OFFICIALS PANEL / COMPLIANCE RULES (One per line)
                </label>
                <textarea
                  value={editPanelText}
                  onChange={(e) => setEditPanelText(e.target.value)}
                  placeholder="Kickoff supervision&#13;Foul adjudication&#13;Card issuance (Yellow/Red)&#13;Match timing control&#13;Final match report validation"
                  rows={4}
                  className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-medium focus:border-[#00e5ff] outline-none text-white/80 font-mono whitespace-pre leading-relaxed"
                />
                <span className="text-[9px] text-white/30 block">
                  Leave blank to apply standard FCL tournament panel checks automatically on save.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingMatchId(null)}
                  className="px-5 py-3 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#00e5ff] hover:bg-[#00e5ff]/80 text-dark font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Save settings
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
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

export const knockoutStructure = {
  playoffs: [
    {
      id: "PO1",
      stage: "Playoffs",
      dateRange: "18th June 2026 - 20th June 2026",
      fixture: "Seeds 3/4 vs Seeds 13/14"
    },

    {
      id: "PO2",
      stage: "Playoffs",
      dateRange: "18th June 2026 - 20th June 2026",
      fixture: "Seeds 5/6 vs Seeds 11/12"
    },

    {
      id: "PO3",
      stage: "Playoffs",
      dateRange: "18th June 2026 - 20th June 2026",
      fixture: "Seeds 7/8 vs Seeds 9/10"
    },

    {
      id: "PO4",
      stage: "Playoffs",
      dateRange: "18th June 2026 - 20th June 2026",
      fixture: "Seeds 3/4 vs Seeds 13/14"
    },

    {
      id: "PO5",
      stage: "Playoffs",
      dateRange: "18th June 2026 - 20th June 2026",
      fixture: "Seeds 5/6 vs Seeds 11/12"
    },

    {
      id: "PO6",
      stage: "Playoffs",
      dateRange: "18th June 2026 - 20th June 2026",
      fixture: "Seeds 7/8 vs Seeds 9/10"
    }
  ],

  quarterFinals: [
    {
      id: "QF1",
      dateRange: "22nd June 2026 - 23rd June 2026",
      fixture: "Seed 1 vs PO1"
    },

    {
      id: "QF2",
      dateRange: "22nd June 2026 - 23rd June 2026",
      fixture: "Seed 2 vs PO2"
    },

    {
      id: "QF3",
      dateRange: "22nd June 2026 - 23rd June 2026",
      fixture: "PO3 vs PO5"
    },

    {
      id: "QF4",
      dateRange: "22nd June 2026 - 23rd June 2026",
      fixture: "PO4 vs PO6"
    }
  ],

  semiFinalsFirstLeg: [
    {
      id: "SF1",
      date: "26th June 2026",
      fixture: "QF1 vs QF3"
    },

    {
      id: "SF2",
      date: "26th June 2026",
      fixture: "QF2 vs QF4"
    }
  ],

  semiFinalsSecondLeg: [
    {
      id: "SF1",
      date: "28th June 2026",
      fixture: "QF3 vs QF1"
    },

    {
      id: "SF2",
      date: "28th June 2026",
      fixture: "QF4 vs QF2"
    }
  ],

  final: [
    {
      id: "FINAL",
      fixture: "SF1 vs SF2",
      date: "3rd July 2026"
    }
  ]
};

export function Playoffs() {
  const [activeStage, setActiveStage] = React.useState<keyof typeof knockoutStructure>('playoffs');

  const sortedTeams = [...TEAMS].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.name.localeCompare(b.name);
  });

  interface DisplayEntity {
    name: string;
    sub: string;
    teamIds: string[];
  }

  const resolveEntity = (str: string): DisplayEntity => {
    const trimmed = str.trim();
    
    // Single seeds
    if (trimmed === "Seed 1") {
      const t = sortedTeams[0];
      return { name: t?.name || "Seed 1", sub: "Group Stage Winner", teamIds: t ? [t.id] : [] };
    }
    if (trimmed === "Seed 2") {
      const t = sortedTeams[1];
      return { name: t?.name || "Seed 2", sub: "Group Stage Runner-Up", teamIds: t ? [t.id] : [] };
    }
    
    // Grouped seeds
    if (trimmed.includes("3/4")) {
      const t1 = sortedTeams[2];
      const t2 = sortedTeams[3];
      return { 
        name: `${t1?.name || "Seed 3"} / ${t2?.name || "Seed 4"}`, 
        sub: "Rank 3/4 Seeding", 
        teamIds: [t1?.id, t2?.id].filter(Boolean) as string[] 
      };
    }
    if (trimmed.includes("5/6")) {
      const t1 = sortedTeams[4];
      const t2 = sortedTeams[5];
      return { 
        name: `${t1?.name || "Seed 5"} / ${t2?.name || "Seed 6"}`, 
        sub: "Rank 5/6 Seeding", 
        teamIds: [t1?.id, t2?.id].filter(Boolean) as string[] 
      };
    }
    if (trimmed.includes("7/8")) {
      const t1 = sortedTeams[6];
      const t2 = sortedTeams[7];
      return { 
        name: `${t1?.name || "Seed 7"} / ${t2?.name || "Seed 8"}`, 
        sub: "Rank 7/8 Seeding", 
        teamIds: [t1?.id, t2?.id].filter(Boolean) as string[] 
      };
    }
    if (trimmed.includes("9/10")) {
      const t1 = sortedTeams[8];
      const t2 = sortedTeams[9];
      return { 
        name: `${t1?.name || "Seed 9"} / ${t2?.name || "Seed 10"}`, 
        sub: "Rank 9/10 Seeding", 
        teamIds: [t1?.id, t2?.id].filter(Boolean) as string[] 
      };
    }
    if (trimmed.includes("11/12")) {
      const t1 = sortedTeams[10];
      const t2 = sortedTeams[11];
      return { 
        name: `${t1?.name || "Seed 11"} / ${t2?.name || "Seed 12"}`, 
        sub: "Rank 11/12 Seeding", 
        teamIds: [t1?.id, t2?.id].filter(Boolean) as string[] 
      };
    }
    if (trimmed.includes("13/14")) {
      const t1 = sortedTeams[12];
      const t2 = sortedTeams[13];
      return { 
        name: `${t1?.name || "Seed 13"} / ${t2?.name || "Seed 14"}`, 
        sub: "Rank 13/14 Seeding", 
        teamIds: [t1?.id, t2?.id].filter(Boolean) as string[] 
      };
    }

    // Playoff/Quarter/Semi placeholders
    if (trimmed.startsWith("PO")) {
      const matchNum = trimmed.replace("PO", "");
      return { name: `Winner of Playoff ${matchNum}`, sub: "Knockout Challenger", teamIds: [] };
    }
    if (trimmed.startsWith("QF")) {
      const matchNum = trimmed.replace("QF", "");
      return { name: `Winner of Quarter ${matchNum}`, sub: "Semi-Final Contender", teamIds: [] };
    }
    if (trimmed.startsWith("SF")) {
      const matchNum = trimmed.replace("SF", "");
      return { name: `Winner of Semi ${matchNum}`, sub: "Title Finalist", teamIds: [] };
    }

    return { name: trimmed, sub: "Qualified Squad", teamIds: [] };
  };

  const stageTabs = [
    { key: 'playoffs', label: 'Playoff Round', date: 'June 18-20' },
    { key: 'quarterFinals', label: 'Quarter-Finals', date: 'June 22-23' },
    { key: 'semiFinalsFirstLeg', label: 'Semi-Finals (L1)', date: 'June 26' },
    { key: 'semiFinalsSecondLeg', label: 'Semi-Finals (L2)', date: 'June 28' },
    { key: 'final', label: 'Grand Final', date: 'July 3' }
  ] as const;

  return (
    <div>
      <PageHeader 
        title="Playoff & Knockout Bracket" 
        subtitle="The Road to Glory. Follow the elite squads as they duel for the ultimate 2026 championship title."
      />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Format Explanation */}
        <div className="glass rounded-[40px] p-8 mb-12 border border-primary/20 bg-primary/5">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h4 className="text-white font-bold italic uppercase tracking-widest text-xs">Playoff Matchups</h4>
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                3rd/4th vs 13th/14th | 5th/6th vs 11th/12th | 7th/8th vs 9th/10th. Six total single-leg elimination duels.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <h4 className="text-yellow-500 font-bold italic uppercase tracking-widest text-xs">Direct Entries</h4>
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                The absolute absolute elite seeds 1 and 2 automatically bypass the Playoff rounds and progress directly into Quarter-Final brackets.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                <h4 className="text-[#00E5FF] font-bold italic uppercase tracking-widest text-xs">Home and Away Finals</h4>
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                Semi-final matches are held over dual home/away legs to test consistent sporting excellence before the single-match Grand Finale.
              </p>
            </div>
          </div>
        </div>

        {/* Stage Selection Tabs */}
        <div className="flex flex-wrap gap-2 mb-12 border-b border-white/10 pb-4 overflow-x-auto justify-start">
          {stageTabs.map((tab) => {
            const isActive = activeStage === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveStage(tab.key)}
                className={cn(
                  "px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300 relative flex flex-col items-start min-w-[150px] border",
                  isActive 
                    ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(218,26,34,0.15)]"
                    : "bg-white/[0.02] border-white/5 text-white/50 hover:text-white hover:border-white/10"
                )}
              >
                <span className="block">{tab.label}</span>
                <span className={cn(
                  "text-[8px] font-mono tracking-wider mt-1 font-semibold",
                  isActive ? "text-primary/80" : "text-white/30"
                )}>{tab.date}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeStageGlow" 
                    className="absolute -bottom-[17px] left-4 right-4 h-[2px] bg-primary shadow-[0_0_8px_#da1a22]" 
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Current Active Stage Grid matches */}
        <div className="space-y-8 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-display font-bold italic uppercase tracking-tight text-white flex items-center space-x-2">
              <span className="text-glow text-primary">
                {stageTabs.find(t => t.key === activeStage)?.label}
              </span>
              <span className="text-xs text-white/40 capitalize font-sans not-italic font-bold tracking-normal px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
                {knockoutStructure[activeStage].length} Fixture{(knockoutStructure[activeStage].length > 1) ? 's' : ''}
              </span>
            </h3>
            <span className="text-[10px] font-mono tracking-widest text-white/30 uppercase font-black">
              {stageTabs.find(t => t.key === activeStage)?.date} • 2026 EDITION
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {knockoutStructure[activeStage].map((match: any, i: number) => {
              const parts = match.fixture.split(" vs ");
              const team1 = resolveEntity(parts[0] || "");
              const team2 = resolveEntity(parts[1] || "");

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={match.id} 
                  className="glass rounded-[32px] border border-white/10 overflow-hidden group hover:border-primary/40 transition-all duration-300 flex flex-col"
                >
                  <div className="bg-white/5 px-6 py-4.5 border-b border-white/5 flex justify-between items-center">
                    <span className="font-mono text-[9px] font-bold text-white/30 uppercase tracking-widest flex items-center space-x-1">
                      <ShieldCheck size={11} className="text-primary mr-1" />
                      <span>MATCH {match.id}</span>
                    </span>
                    <span className="text-[9px] font-bold text-primary italic uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      Upcoming
                    </span>
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
                    {/* Team 1 Panel */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex -space-x-2 flex-shrink-0">
                          {team1.teamIds.length > 0 ? (
                            team1.teamIds.map((tid, idx) => (
                              <TeamLogo key={idx} teamId={tid} logoUrl={TEAMS.find(t => t.id === tid)?.logoUrl} className="w-11 h-11" size="custom" />
                            ))
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-white/30 font-mono text-xs font-black">
                              ?
                            </div>
                          )}
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors leading-tight truncate uppercase tracking-tight">{team1.name}</h4>
                          <span className="text-[9.5px] font-mono font-medium text-white/40 block mt-0.5 uppercase tracking-wider">{team1.sub}</span>
                        </div>
                      </div>
                    </div>

                    {/* VS separator line */}
                    <div className="relative py-1 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-dashed border-white/10" />
                      </div>
                      <span className="relative z-10 text-xs font-display font-black tracking-widest text-[#00E5FF] px-4.5 py-1.5 bg-[#03050B] border border-white/10 rounded-full italic shadow-lg">
                        VS
                      </span>
                    </div>

                    {/* Team 2 Panel */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex -space-x-2 flex-shrink-0">
                          {team2.teamIds.length > 0 ? (
                            team2.teamIds.map((tid, idx) => (
                              <TeamLogo key={idx} teamId={tid} logoUrl={TEAMS.find(t => t.id === tid)?.logoUrl} className="w-11 h-11" size="custom" />
                            ))
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-white/30 font-mono text-xs font-black">
                              ?
                            </div>
                          )}
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors leading-tight truncate uppercase tracking-tight">{team2.name}</h4>
                          <span className="text-[9.5px] font-mono font-medium text-white/40 block mt-0.5 uppercase tracking-wider">{team2.sub}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Footer Date / Stage metadata */}
                  <div className="border-t border-white/5 px-6 py-4.5 bg-black/40 flex items-center justify-between text-white/40 font-mono text-[9px] tracking-wider font-bold">
                    <span className="flex items-center">
                      <Clock size={11} className="mr-1.5 text-primary" />
                      <span>{match.dateRange || match.date || "TO BE SCHEDULED"}</span>
                    </span>
                    <span className="uppercase text-white/20">FUTA CL 2026</span>
                  </div>
                </motion.div>
              );
            })}
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
                  <TeamLogo teamId={team.id} logoUrl={team.logoUrl} size="xl" className="relative z-10" />
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
  const { matches, detailedStats } = useMatchState();
  const [activeTab, setActiveTab] = React.useState<'players' | 'teams'>('players');

  const scorers = [...PLAYERS].sort((a, b) => b.goals - a.goals);
  const assists = [...PLAYERS].sort((a, b) => b.assists - a.assists);

  // Compute aggregated team stats for the FUTA Champions League
  const teamStats = React.useMemo(() => {
    const statsMap: Record<string, {
      id: string;
      name: string;
      corners: number;
      yellowCards: number;
      redCards: number;
      offsides: number;
      fouls: number;
      freeKicks: number;
      played: number;
    }> = {};

    // Initialize with all tournament teams
    TEAMS.forEach(t => {
      statsMap[t.id] = {
        id: t.id,
        name: t.name,
        corners: 0,
        yellowCards: 0,
        redCards: 0,
        offsides: 0,
        fouls: 0,
        freeKicks: 0,
        played: 0
      };
    });

    // Populate and aggregate stats from finished / played fixtures
    matches.forEach(m => {
      if (m.status === 'Finished' || m.status === 'Full Time' || m.status === 'Live' || m.status === 'Half Time') {
        const hId = m.homeTeam.toLowerCase();
        const aId = m.awayTeam.toLowerCase();
        const mStats = detailedStats[m.id];
        if (mStats) {
          if (statsMap[hId]) {
            statsMap[hId].played += 1;
            statsMap[hId].corners += mStats.cornersHome || mStats.homeCorners || 0;
            statsMap[hId].yellowCards += mStats.yellowCardsHome || mStats.homeYellowCards || 0;
            statsMap[hId].redCards += mStats.redCardsHome || mStats.homeRedCards || 0;
            statsMap[hId].offsides += mStats.offsidesHome || mStats.homeOffsides || 0;
            statsMap[hId].fouls += mStats.foulsHome || mStats.homeFouls || 0;
            statsMap[hId].freeKicks += mStats.freeKicksHome || mStats.homeFreeKicks || 0;
          }
          if (statsMap[aId]) {
            statsMap[aId].played += 1;
            statsMap[aId].corners += mStats.cornersAway || mStats.awayCorners || 0;
            statsMap[aId].yellowCards += mStats.yellowCardsAway || mStats.awayYellowCards || 0;
            statsMap[aId].redCards += mStats.redCardsAway || mStats.awayRedCards || 0;
            statsMap[aId].offsides += mStats.offsidesAway || mStats.awayOffsides || 0;
            statsMap[aId].fouls += mStats.foulsAway || mStats.awayFouls || 0;
            statsMap[aId].freeKicks += mStats.freeKicksAway || mStats.awayFreeKicks || 0;
          }
        }
      }
    });

    return Object.values(statsMap);
  }, [matches, detailedStats]);

  const [teamSortField, setTeamSortField] = React.useState<'corners' | 'yellowCards' | 'redCards' | 'offsides' | 'fouls' | 'freeKicks'>('corners');

  const sortedTeamStats = React.useMemo(() => {
    return [...teamStats].sort((a, b) => b[teamSortField] - a[teamSortField]);
  }, [teamStats, teamSortField]);

  return (
    <div>
      <PageHeader 
        title="TOURNAMENT LEADERBOARDS" 
        subtitle="Individual brilliances and official tactical team-by-team match stats ledger."
      />
      
      {/* Sub page navigation tabs switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8 flex justify-center">
        <div className="bg-navy-dark border border-white/10 p-1.5 rounded-2xl flex gap-3 shadow-xl w-full max-w-md">
          <button
            onClick={() => setActiveTab('players')}
            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'players'
                ? 'bg-primary text-dark shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                : 'text-white/40 hover:text-white/80 hover:bg-white/[0.02]'
            }`}
          >
            👤 PLAYER STATS
          </button>
          
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'teams'
                ? 'bg-primary text-dark shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                : 'text-white/40 hover:text-white/80 hover:bg-white/[0.02]'
            }`}
          >
            🛡️ TEAM STATS
          </button>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {activeTab === 'players' ? (
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
                      <img src={player.image} className="w-12 h-12 rounded-full border-2 border-white/10 object-cover" alt={player.name} />
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
                      <img src={player.image} className="w-12 h-12 rounded-full border-2 border-white/10 object-cover" alt={player.name} />
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
        ) : (
          /* FUTA Champions League Official Team Statistics Ledger */
          <div className="space-y-8">
            <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-display italic uppercase tracking-wider text-white">MANDATORY FIXTURE STATISTICS</h2>
                <p className="text-xs text-white/40 mt-1">Select any official FCL dynamic metrics category below to sort and discover the leading squads.</p>
              </div>

              {/* Dynamic statistic category selectors pill group */}
              <div className="flex flex-wrap gap-2">
                {([
                  { field: 'corners', label: '🚩 Corner Kicks' },
                  { field: 'yellowCards', label: '🟨 Yellow Warnings' },
                  { field: 'redCards', label: '🟥 Red Expulsions' },
                  { field: 'offsides', label: '🔭 Offsides' },
                  { field: 'fouls', label: '⚠️ Team Fouls' },
                  { field: 'freeKicks', label: '🎙️ Free Kicks Won' }
                ] as const).map(pill => (
                  <button
                    key={pill.field}
                    onClick={() => setTeamSortField(pill.field)}
                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      teamSortField === pill.field
                        ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                        : 'bg-white/5 border-white/5 text-white/40 hover:text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-white/10 glass bg-navy/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
                      <th className="p-4 pl-6 text-center w-16">RANK</th>
                      <th className="p-4">DEPARTMENT SQUAD</th>
                      <th className="p-4 text-center w-24">PLAYED</th>
                      <th className="p-4 text-center w-28">🚩 CORNERS</th>
                      <th className="p-4 text-center w-28">🟨 YELLOWS</th>
                      <th className="p-4 text-center w-28">🟥 REDS</th>
                      <th className="p-4 text-center w-28">🔭 OFFSIDES</th>
                      <th className="p-4 text-center w-28">⚠️ FOULS</th>
                      <th className="p-4 text-center w-28">🎙️ FREE KICKS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/85">
                    {sortedTeamStats.map((team, idx) => (
                      <tr key={team.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 pl-6 text-center font-bold text-white/40">{idx + 1}</td>
                        <td className="p-4 font-sans font-bold flex items-center gap-3">
                          <TeamLogo teamId={team.id} logoUrl={TEAMS.find(t => t.id === team.id)?.logoUrl || null} size="sm" />
                          <div>
                            <span className="text-white text-sm block">{team.name}</span>
                            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">{team.id.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center font-bold text-white/60">{team.played}</td>
                        <td className={`p-4 text-center font-bold font-mono ${teamSortField === 'corners' ? 'text-primary' : 'text-white/60'}`}>{team.corners}</td>
                        <td className={`p-4 text-center font-bold font-mono ${teamSortField === 'yellowCards' ? 'text-yellow-500' : 'text-white/60'}`}>{team.yellowCards}</td>
                        <td className={`p-4 text-center font-bold font-mono ${teamSortField === 'redCards' ? 'text-red-500' : 'text-white/60'}`}>{team.redCards}</td>
                        <td className={`p-4 text-center font-bold font-mono ${teamSortField === 'offsides' ? 'text-blue-400' : 'text-white/60'}`}>{team.offsides}</td>
                        <td className={`p-4 text-center font-bold font-mono ${teamSortField === 'fouls' ? 'text-purple-400' : 'text-white/60'}`}>{team.fouls}</td>
                        <td className={`p-4 text-center font-bold font-mono ${teamSortField === 'freeKicks' ? 'text-green-400' : 'text-white/60'}`}>{team.freeKicks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
export function Media() {
  const { matchPhotos, reports, newsItems, articles, matches } = useMatchState();
  
  // Set tab based on URL param or default
  const [activeSec, setActiveSec] = React.useState<'gallery' | 'reports' | 'news' | 'featured' | 'highlights'>('gallery');
  
  // Gallery states
  const [photoFilter, setPhotoFilter] = React.useState<string>('All');
  const [photoSearch, setPhotoSearch] = React.useState<string>('');
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  // Detail view Modal states
  const [readReportMatchId, setReadReportMatchId] = React.useState<string | null>(null);
  const [readArticleId, setReadArticleId] = React.useState<string | null>(null);
  const [readNewsId, setReadNewsId] = React.useState<string | null>(null);

  // Live video modal
  const [activeVideoUrl, setActiveVideoUrl] = React.useState<string | null>(null);

  // Photo categorization list
  const categories = [
    'All', 'Match Action', 'Goal Celebration', 'Team Photo', 'Player Profile', 'Crowd', 'Man of the Match', 'Post-match Interview'
  ];

  // Filter photos dynamically
  const filteredPhotos = matchPhotos.filter(photo => {
    const term = photoSearch.toLowerCase();
    const relatedMatch = matches.find(m => m.id === photo.matchId);
    const matchesSearch = !photoSearch || 
      photo.category.toLowerCase().includes(term) || 
      (photo.folderStage && photo.folderStage.toLowerCase().includes(term)) ||
      (relatedMatch && (relatedMatch.homeTeam.toLowerCase().includes(term) || relatedMatch.awayTeam.toLowerCase().includes(term)));
    
    if (photoFilter === 'All') return matchesSearch;
    return photo.category === photoFilter && matchesSearch;
  });

  return (
    <div className="space-y-16">
      <PageHeader 
        title="FCL Media Center" 
        subtitle="Unifying the FUTA voice. Browse matchday visual galleries, news resolutions, and athletic features."
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Sections Selection Buttons Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 border-b border-white/5 pb-8 mb-12">
          {[
            { id: 'gallery', label: '📸 Match Gallery', desc: 'Realtime Photo Reels' },
            { id: 'reports', label: '📝 Match Reports', desc: 'Tactical Game Essays' },
            { id: 'news', label: '🏛️ News & Bulletins', desc: 'Resolution updates' },
            { id: 'featured', label: '🌟 Featured Stories', desc: 'Athletes & Spotlights' },
            { id: 'highlights', label: '🏆 Highlights', desc: 'Clips & matchdays reel' }
          ].map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSec(sec.id as any)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                activeSec === sec.id 
                  ? 'bg-[#00e5ff] border-[#00e5ff] text-dark shadow-[0_4px_20px_rgba(0,229,255,0.15)]' 
                  : 'bg-navy/40 border-white/5 text-white hover:border-white/20'
              }`}
            >
              <div className="font-black text-xs uppercase tracking-wider">{sec.label}</div>
              <div className={`text-[9px] font-medium mt-1 ${activeSec === sec.id ? 'text-dark/70' : 'text-white/40'}`}>{sec.desc}</div>
            </button>
          ))}
        </div>

        {/* 1. MATCH GALLERY SECTION */}
        {activeSec === 'gallery' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/5">
              <div>
                <h3 className="text-xl font-display font-black tracking-tight uppercase italic text-white">REEL PHOTOGRAPHY ARCHIVES</h3>
                <p className="text-xs text-white/45 mt-0.5">Capturing raw campus football history under modern compression optimization pipelines.</p>
              </div>

              {/* SEARCH */}
              <div className="relative max-w-sm w-full">
                <input
                  type="text"
                  placeholder="Query department or stage e.g. MST..."
                  value={photoSearch}
                  onChange={(e) => setPhotoSearch(e.target.value)}
                  className="w-full bg-navy border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#00e5ff]"
                />
              </div>
            </div>

            {/* CATEGORY RAIL */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setPhotoFilter(cat)}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${
                    photoFilter === cat 
                      ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40' 
                      : 'bg-white/5 hover:bg-white/10 text-white/50 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* PHOTOS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredPhotos.map((photo, index) => {
                const matchInfo = matches.find(m => m.id === photo.matchId);
                return (
                  <motion.div
                    key={photo.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setLightboxIndex(index)}
                    className="group relative aspect-video md:aspect-square bg-navy/40 border border-white/10 rounded-3xl overflow-hidden cursor-pointer shadow-lg"
                  >
                    <img 
                      src={photo.fileUrl} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      alt="Game capture" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                      <span className="text-[8px] bg-[#00e5ff] text-dark font-black tracking-widest uppercase px-2 py-0.5 rounded self-start mb-2">{photo.category}</span>
                      <h4 className="font-bold text-xs truncate">{matchInfo ? `${matchInfo.homeTeam} vs ${matchInfo.awayTeam}` : 'Tournament Action'}</h4>
                      <div className="flex items-center justify-between text-[8px] text-white/50 font-mono mt-1">
                        <span>BY {photo.uploadedBy.toUpperCase()}</span>
                        <span>{photo.compressedSize || '2.1 MB'}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {filteredPhotos.length === 0 && (
                <div className="col-span-full py-20 text-center text-white/40 font-medium text-xs">No photos exist in the media vault for this selection.</div>
              )}
            </div>

            {/* LIGHTBOX SLIDER OVERLAY */}
            {lightboxIndex !== null && lightboxIndex >= 0 && lightboxIndex < filteredPhotos.length && (
              <div 
                className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md"
                onClick={() => setLightboxIndex(null)}
              >
                <button 
                  className="absolute top-6 right-6 text-white text-3xl font-display hover:text-[#00e5ff] transition-colors"
                  onClick={() => setLightboxIndex(null)}
                >
                  &times;
                </button>

                <div 
                  className="max-w-4xl w-full max-h-[80vh] flex flex-col items-center justify-center space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img 
                    src={filteredPhotos[lightboxIndex].fileUrl} 
                    className="max-h-[70vh] max-w-full rounded-2xl object-contain border border-white/10 shadow-2xl" 
                    alt="Lightbox showcase" 
                  />
                  <div className="text-center text-white space-y-1">
                    <span className="px-3 py-1 bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30 rounded-full text-[9px] font-black uppercase tracking-widest">{filteredPhotos[lightboxIndex].category}</span>
                    <h3 className="font-display font-black text-lg uppercase italic mt-1">
                      {matches.find(m => m.id === filteredPhotos[lightboxIndex].matchId) 
                        ? `${matches.find(m => m.id === filteredPhotos[lightboxIndex].matchId)?.homeTeam} vs ${matches.find(m => m.id === filteredPhotos[lightboxIndex].matchId)?.awayTeam}` 
                        : 'FUTA Champions League Frame'}
                    </h3>
                    <p className="text-[10px] text-white/40 font-mono">
                      UPLOADED BY: {filteredPhotos[lightboxIndex].uploadedBy.toUpperCase()} | STAGE: {filteredPhotos[lightboxIndex].folderStage || '2026/MD1'} | METRICS: {filteredPhotos[lightboxIndex].originalSize} DOWNSIZED TO {filteredPhotos[lightboxIndex].compressedSize} ({filteredPhotos[lightboxIndex].ratio} REDUCED)
                    </p>
                  </div>

                  {/* Navigation Slider controls */}
                  <div className="flex space-x-4 font-mono">
                    <button 
                      onClick={() => setLightboxIndex(prev => prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1)}
                      className="px-4 py-2 bg-white/10 hover:bg-[#00e5ff] hover:text-dark rounded-xl font-bold text-xs cursor-pointer"
                    >
                      &larr; Prev
                    </button>
                    <button 
                      onClick={() => setLightboxIndex(prev => prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0)}
                      className="px-4 py-2 bg-white/10 hover:bg-[#00e5ff] hover:text-dark rounded-xl font-bold text-xs cursor-pointer"
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. MATCH REPORTS TAB */}
        {activeSec === 'reports' && (
          <div className="space-y-8">
            <div className="pb-6 border-b border-white/5">
              <h3 className="text-xl font-display font-black tracking-tight uppercase italic text-white">OFFICIAL TACTICAL GAME SUMMARIES</h3>
              <p className="text-xs text-white/45 mt-0.5">Written matchday assessments detailing formations adjustments, scoring trends, and match analytics.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {matches.map(m => {
                const r = reports[m.id];
                if (!r) return null;
                return (
                  <motion.article
                    key={m.id}
                    whileHover={{ y: -6 }}
                    className="glass rounded-[32px] overflow-hidden border border-white/5 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="aspect-video relative overflow-hidden">
                        <img src={r.featuredImage} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" alt="" />
                        <div className="absolute top-4 left-4 bg-dark/80 px-3 py-1.5 rounded-full border border-white/10 flex items-center space-x-1">
                          <span className="text-[9px] font-black text-yellow-500 font-mono">&#9733; {r.excitementRating}/10</span>
                          <span className="text-[8px] text-white/40 uppercase font-bold tracking-widest">EXCITEMENT</span>
                        </div>
                      </div>

                      <div className="p-8">
                        <div className="text-[10px] text-[#00e5ff] font-bold tracking-widest uppercase mb-2">Matchday {m.matchday} Analysis • {m.venue}</div>
                        <h3 className="text-2xl font-display font-black italic tracking-tight line-clamp-2 leading-none group-hover:text-[#00e5ff] transition-colors mb-4">{r.title}</h3>
                        <p className="text-xs leading-relaxed text-white/50 font-medium mb-6">{r.subtitle}</p>
                      </div>
                    </div>

                    <div className="px-8 pb-8">
                      <button 
                        onClick={() => setReadReportMatchId(m.id)}
                        className="w-full py-3 border border-[#00e5ff]/20 bg-[#00e5ff]/5 hover:bg-[#00e5ff] group-hover:text-dark text-[#00e5ff] text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <BookOpen size={13} />
                        <span>READ DETAILED ACTION REPORT</span>
                      </button>
                    </div>
                  </motion.article>
                );
              })}

              {Object.keys(reports).length === 0 && (
                <div className="col-span-full py-20 text-center text-white/40 font-medium text-xs">No tactical match reports have been published yet.</div>
              )}
            </div>

            {/* REPORT DETAIL MODAL */}
            {readReportMatchId && (
              <div 
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto"
                onClick={() => setReadReportMatchId(null)}
              >
                <div 
                  className="bg-navy border border-white/15 my-8 max-w-2xl w-full rounded-[32px] overflow-hidden shadow-2xl relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    className="absolute top-6 right-6 text-white/50 hover:text-white text-2xl font-display z-10"
                    onClick={() => setReadReportMatchId(null)}
                  >
                    &times;
                  </button>

                  <img src={reports[readReportMatchId]?.featuredImage} className="w-full h-56 object-cover" alt="" />
                  
                  <div className="p-8 sm:p-10 space-y-6">
                    <div>
                      <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-[9px] font-black uppercase tracking-widest">TACTICAL REPORT</span>
                      <h2 className="text-3xl font-display font-black italic uppercase text-white mt-3 leading-none">{reports[readReportMatchId]?.title}</h2>
                      <p className="text-sm font-bold text-white/60 mt-2">{reports[readReportMatchId]?.subtitle}</p>
                    </div>

                    <div className="border-t border-b border-white/5 py-4 flex items-center justify-between text-xs font-mono text-white/40">
                      <span>STADIUM EXCITEMENT RATING: {reports[readReportMatchId]?.excitementRating}/10</span>
                      <span>VENUE: {matches.find(m => m.id === readReportMatchId)?.venue}</span>
                    </div>

                    <div className="text-sm leading-relaxed text-white/70 whitespace-pre-wrap font-medium font-sans">
                      {reports[readReportMatchId]?.summary}
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={() => setReadReportMatchId(null)}
                        className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase rounded-xl transition-all border border-white/10 cursor-pointer"
                      >
                        CLOSE ARTICLE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. NEWS & ANNOUNCEMENTS SECTION */}
        {activeSec === 'news' && (
          <div className="space-y-8">
            <div className="pb-6 border-b border-white/5">
              <h3 className="text-xl font-display font-black tracking-tight uppercase italic text-white">COMMITTEE RESOLUTIONS BOARD</h3>
              <p className="text-xs text-white/45 mt-0.5">Latest official rulings, registrations, scheduling tables, and logistical extensions.</p>
            </div>

            <div className="space-y-6">
              {newsItems.filter(item => item.isPublished).map(item => (
                <motion.article 
                  key={item.id}
                  whileHover={{ x: 6 }}
                  className="glass p-6 sm:p-8 rounded-[32px] border border-white/5 hover:border-[#00e5ff]/25 flex flex-col md:flex-row gap-6 items-start sm:items-center transition-all group cursor-pointer"
                  onClick={() => setReadNewsId(item.id)}
                >
                  <img src={item.featuredImage} className="w-full md:w-32 h-24 object-cover rounded-2xl flex-shrink-0" alt="" />
                  <div className="flex-grow space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-2.5 py-1 bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20 rounded-md text-[8px] font-black uppercase tracking-wider">{item.category}</span>
                      <span className="text-[9px] text-white/30 font-mono">{item.createdAt} BY {item.author.toUpperCase()}</span>
                    </div>
                    <h3 className="text-xl font-display font-bold italic text-white group-hover:text-primary transition-colors leading-tight">{item.title}</h3>
                    <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">{item.body}</p>
                  </div>
                  <ChevronRight className="text-white/20 group-hover:text-[#00e5ff] transition-colors self-center hidden md:block" />
                </motion.article>
              ))}

              {newsItems.length === 0 && (
                <div className="py-20 text-center text-white/40 font-medium text-xs">No committee announcements updated on the bulletin board.</div>
              )}
            </div>

            {/* NEWS READ POPUP */}
            {readNewsId && (
              <div 
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto"
                onClick={() => setReadNewsId(null)}
              >
                <div 
                  className="bg-navy border border-white/15 my-8 max-w-xl w-full rounded-[32px] overflow-hidden shadow-2xl relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    className="absolute top-6 right-6 text-white/50 hover:text-white text-2xl font-display z-10"
                    onClick={() => setReadNewsId(null)}
                  >
                    &times;
                  </button>

                  <img src={newsItems.find(n => n.id === readNewsId)?.featuredImage} className="w-full h-48 object-cover" alt="" />
                  
                  <div className="p-8 sm:p-10 space-y-6">
                    <div>
                      <span className="px-2.5 py-1 bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20 rounded-md text-[8px] font-black uppercase tracking-wider">{newsItems.find(n => n.id === readNewsId)?.category}</span>
                      <h2 className="text-2xl font-display font-black italic uppercase text-white mt-3 leading-none">{newsItems.find(n => n.id === readNewsId)?.title}</h2>
                      <div className="text-[9px] text-white/40 font-mono mt-1">DRAFTED BY {newsItems.find(n => n.id === readNewsId)?.author} ON {newsItems.find(n => n.id === readNewsId)?.createdAt}</div>
                    </div>

                    <div className="text-sm leading-relaxed text-white/70 whitespace-pre-wrap font-medium">
                      {newsItems.find(n => n.id === readNewsId)?.body}
                    </div>

                    {newsItems.find(n => n.id === readNewsId)?.tags && (
                      <div className="flex flex-wrap gap-1">
                        {newsItems.find(n => n.id === readNewsId)?.tags.map(t => (
                          <span key={t} className="text-[8px] bg-white/5 text-white/40 px-2.5 py-1 rounded">#{t}</span>
                        ))}
                      </div>
                    )}

                    <div className="pt-4">
                      <button 
                        onClick={() => setReadNewsId(null)}
                        className="w-full py-3 bg-white/5 hover:bg-[#00e5ff] hover:text-dark text-white font-bold text-xs uppercase rounded-xl transition-all border border-white/10 cursor-pointer"
                      >
                        CLOSE BULLETIN
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. FEATURED STORIES / SPOTLIGHTS */}
        {activeSec === 'featured' && (
          <div className="space-y-8">
            <div className="pb-6 border-b border-white/5">
              <h3 className="text-xl font-display font-black tracking-tight uppercase italic text-white">FEATURE DOCUMENTARIES & ATHLETE SPOTLIGHTS</h3>
              <p className="text-xs text-white/45 mt-0.5">Deep diving into the department qualifiers qualms, historic qualifiers records, and team previews.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {articles.filter(art => art.isPublished).map(art => (
                <motion.article 
                  key={art.id}
                  whileHover={{ y: -8 }}
                  className="glass rounded-[40px] overflow-hidden group border border-white/5 flex flex-col justify-between"
                >
                  <div className="aspect-[21/10] overflow-hidden relative">
                    <img src={art.featuredImage} className="w-full h-full object-cover transition-transform group-hover:scale-103 duration-700" alt="" />
                    <div className="absolute bottom-4 left-4">
                      <span className="px-4 py-2 glass border border-white/10 rounded-full text-[9px] font-black tracking-widest uppercase text-primary">
                        {art.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-8 sm:p-10 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="text-white/30 text-[9px] font-bold mb-4 tracking-widest uppercase">
                        {art.createdAt} BY {art.author.toUpperCase()}
                      </div>
                      <h2 className="text-2xl font-display mb-4 italic tracking-tight leading-tight group-hover:text-primary transition-colors">
                        {art.title}
                      </h2>
                      <p className="text-xs text-white/50 mb-8 leading-relaxed font-semibold line-clamp-3">
                        {art.body}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => setReadArticleId(art.id)}
                      className="flex items-center font-bold text-[10px] tracking-widest text-[#00e5ff] hover:translate-x-2 transition-transform uppercase cursor-pointer"
                    >
                      <span>READ FULL SPOTLIGHT</span>
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </motion.article>
              ))}

              {articles.length === 0 && (
                <div className="col-span-full py-20 text-center text-white/40 font-medium text-xs">No spotlight feature stories published yet.</div>
              )}
            </div>

            {/* FEATURED STORY READ POPUP */}
            {readArticleId && (
              <div 
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto"
                onClick={() => setReadArticleId(null)}
              >
                <div 
                  className="bg-navy border border-white/15 my-8 max-w-2xl w-full rounded-[32px] overflow-hidden shadow-2xl relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    className="absolute top-6 right-6 text-white/50 hover:text-white text-2xl font-display z-10"
                    onClick={() => setReadArticleId(null)}
                  >
                    &times;
                  </button>

                  <img src={articles.find(a => a.id === readArticleId)?.featuredImage} className="w-full h-64 object-cover" alt="" />
                  
                  <div className="p-8 sm:p-10 space-y-6">
                    <div>
                      <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-[9px] font-black uppercase tracking-widest">{articles.find(a => a.id === readArticleId)?.category}</span>
                      <h2 className="text-3xl font-display font-black italic uppercase text-white mt-3 leading-none">{articles.find(a => a.id === readArticleId)?.title}</h2>
                      <div className="text-[9px] text-white/40 font-mono mt-1">DRAFT REELED BY {articles.find(a => a.id === readArticleId)?.author} ON {articles.find(a => a.id === readArticleId)?.createdAt}</div>
                    </div>

                    <div className="text-sm leading-relaxed text-white/70 whitespace-pre-wrap font-medium">
                      {articles.find(a => a.id === readArticleId)?.body}
                    </div>

                    {articles.find(a => a.id === readArticleId)?.tags && (
                      <div className="flex flex-wrap gap-1">
                        {articles.find(a => a.id === readArticleId)?.tags.map(t => (
                          <span key={t} className="text-[8px] bg-white/5 text-white/40 px-2.5 py-1 rounded">#{t}</span>
                        ))}
                      </div>
                    )}

                    <div className="pt-4">
                      <button 
                        onClick={() => setReadArticleId(null)}
                        className="w-full py-3.5 bg-white/5 hover:bg-[#00e5ff] hover:text-dark text-white font-bold text-xs uppercase rounded-xl transition-all border border-white/10 cursor-pointer"
                      >
                        CLOSE ARTICLE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. TOURNAMENT HIGHLIGHT REELS */}
        {activeSec === 'highlights' && (
          <div className="space-y-8">
            <div className="pb-6 border-b border-white/5">
              <h3 className="text-xl font-display font-black tracking-tight uppercase italic text-white">REELS & MATCHDAY PLAYBACKS</h3>
              <p className="text-xs text-white/45 mt-0.5">Relive the goals, direct comments, and vocal stadiums from FCL 2026 Season openers.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                { 
                  id: 'high-1', 
                  title: 'Tournament Matchday 1 Highlights | FCL 2026', 
                  match: 'MST vs ICE', 
                  thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000' 
                },
                { 
                  id: 'high-2', 
                  title: 'Top 10 Qualifiers Goals Reel | Akure Sportscomplex', 
                  match: 'Special Collection', 
                  thumbnail: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=1000' 
                }
              ].map(v => (
                <div 
                  key={v.id} 
                  onClick={() => setActiveVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')} // Standard high-contrast embed
                  className="glass rounded-[32px] overflow-hidden border border-white/5 relative group aspect-video cursor-pointer"
                >
                  <img src={v.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:scale-102 transition-transform" alt="" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="fill-current text-dark ml-1 w-6 h-6" />
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6">
                    <span className="text-[8px] bg-red-600 text-white font-black uppercase px-2 py-0.5 rounded tracking-widest inline-block mb-2">LIVE PLAYBACK</span>
                    <h4 className="font-bold text-lg text-white">{v.title}</h4>
                    <p className="text-white/40 text-xs font-mono">{v.match}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* VIDEO PLAYER POPUP */}
            {activeVideoUrl && (
              <div 
                className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md"
                onClick={() => setActiveVideoUrl(null)}
              >
                <div 
                  className="max-w-4xl w-full aspect-video rounded-3xl overflow-hidden bg-black border border-white/10 relative shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    className="absolute top-4 right-4 bg-dark/80 px-3 py-1.5 rounded-full text-white font-bold text-xs cursor-pointer"
                    onClick={() => setActiveVideoUrl(null)}
                  >
                    CLOSE VIDEO
                  </button>
                  <iframe 
                    src={activeVideoUrl} 
                    className="w-full h-full" 
                    title="Player" 
                    allowFullScreen 
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export function News() {
  // Public news announcements simply wraps the Unified Media Center preconfigured to the bulletins tab!
  const { matchPhotos, reports, newsItems, articles, matches } = useMatchState();
  const [readNewsId, setReadNewsId] = React.useState<string | null>(null);

  return (
    <div className="space-y-16">
      <PageHeader 
        title="Bulletin Board" 
        subtitle="Matchday announcements, official rulings, registration extensions, and press releases."
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main news announcements */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black tracking-widest text-[#00e5ff] uppercase flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-ping" />
              <span>COMMITTEE RELEASES BULLETIN</span>
            </h3>

            <div className="space-y-6">
              {newsItems.filter(n => n.isPublished).map((item) => (
                <motion.article 
                  key={item.id}
                  whileHover={{ y: -4 }}
                  className="glass rounded-[32px] overflow-hidden group border border-white/5"
                >
                  <div className="aspect-[21/9] overflow-hidden relative">
                    <img src={item.featuredImage} className="w-full h-full object-cover transition-transform group-hover:scale-102 duration-700" alt="" />
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1.5 glass rounded-full text-[9px] font-black tracking-widest uppercase text-primary">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 sm:p-10">
                    <div className="text-white/30 text-xs font-mono mb-3 uppercase">
                      {item.createdAt} BY {item.author.toUpperCase()}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display mb-4 italic tracking-tight leading-none group-hover:text-primary transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-sm text-white/50 mb-8 leading-relaxed font-medium">
                      {item.body}
                    </p>
                    <button 
                      onClick={() => setReadNewsId(item.id)}
                      className="flex items-center font-bold text-xs tracking-tight text-primary hover:translate-x-2 transition-transform cursor-pointer"
                    >
                      READ FULL BOARD ARTICLE <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </motion.article>
              ))}

              {newsItems.length === 0 && (
                <div className="py-20 text-center text-white/40 font-medium text-xs">No bulletins populated on the board currently.</div>
              )}
            </div>
          </div>

          {/* Sidebar Highlights Highlights */}
          <div className="space-y-8">
            <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
              <h4 className="text-xs font-black uppercase text-white tracking-widest border-b border-white/5 pb-2">MEDIA SPECIFICATION QUICKLINKS</h4>
              <p className="text-[11px] text-white/40 leading-relaxed font-semibold">Only Match Commissioners, Super Admins, and Media Officers have credentials to publish notices onto the official boards.</p>
              <div className="flex gap-2">
                <Link to="/admin/login" className="px-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase cursor-pointer">Login to control</Link>
                <Link to="/media" className="px-4 py-2 bg-[#00e5ff] text-dark rounded-xl text-[10px] font-black uppercase cursor-pointer">Go to Gallery</Link>
              </div>
            </div>

            {/* Featured stories summary side listing */}
            <div className="glass p-6 rounded-3xl border border-[#00e5ff]/20 bg-[#00e5ff]/5 space-y-4">
              <h4 className="text-xs font-black uppercase text-[#00e5ff] tracking-widest">SPOTLIGHT FEATURE PREVIEWS</h4>
              <div className="space-y-4">
                {articles.slice(0, 3).map(art => (
                  <div key={art.id} className="space-y-1">
                    <span className="text-[8px] bg-white/5 text-[#00e5ff] border border-[#00e5ff]/20 px-2 py-0.5 rounded font-bold uppercase tracking-widest">{art.category}</span>
                    <h5 className="font-bold text-xs text-white leading-tight mt-1">{art.title}</h5>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* READING BULLETIN OVERLAY */}
      {readNewsId && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto"
          onClick={() => setReadNewsId(null)}
        >
          <div 
            className="bg-navy border border-white/15 my-8 max-w-xl w-full rounded-[32px] overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-6 right-6 text-white/50 hover:text-white text-2xl font-display z-10"
              onClick={() => setReadNewsId(null)}
            >
              &times;
            </button>

            <img src={newsItems.find(n => n.id === readNewsId)?.featuredImage} className="w-full h-52 object-cover" alt="" />
            
            <div className="p-8 sm:p-10 space-y-6">
              <div>
                <span className="px-2.5 py-1 bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20 rounded-md text-[8px] font-black uppercase tracking-wider">{newsItems.find(n => n.id === readNewsId)?.category}</span>
                <h2 className="text-2xl font-display font-black italic uppercase text-white mt-3 leading-none">{newsItems.find(n => n.id === readNewsId)?.title}</h2>
                <div className="text-[9px] text-white/40 font-mono mt-1">DRAFTED BY {newsItems.find(n => n.id === readNewsId)?.author} ON {newsItems.find(n => n.id === readNewsId)?.createdAt}</div>
              </div>

              <div className="text-sm leading-relaxed text-white/70 whitespace-pre-wrap font-medium">
                {newsItems.find(n => n.id === readNewsId)?.body}
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setReadNewsId(null)}
                  className="w-full py-3 bg-white/5 hover:bg-[#00e5ff] hover:text-dark text-white font-bold text-xs uppercase rounded-xl transition-all border border-white/10 cursor-pointer"
                >
                  CLOSE BULLETIN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export function Sponsorship() {
  const [contactSponsor, setContactSponsor] = React.useState<Sponsor | null>(null);
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

        {/* Active Partners & Sponsors Showcase */}
        <div className="mt-32 pt-20 border-t border-white/5 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] text-[#00e5ff] bg-[#00e5ff]/10 px-4 py-1.5 rounded-full font-black uppercase tracking-widest font-mono border border-[#00e5ff]/20">
              OFFICIAL PARTNERS NETWORK
            </span>
            <h2 className="text-4xl font-display italic uppercase tracking-tighter leading-none text-white mt-1">
              OUR 2026 SPONSOR & MEDIA COALITION
            </h2>
            <p className="text-white/40 text-xs sm:text-sm leading-relaxed font-sans">
              Explore our current partners supporting the FUTA Champions League. Click the contact button on any partner card to initiate a direct sponsorship or media communication pathway.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {SPONSORS.map((sponsor) => (
              <SponsorCard 
                key={sponsor.id} 
                sponsor={sponsor} 
                onContactClick={setContactSponsor} 
              />
            ))}
          </div>
        </div>
      </section>

      {contactSponsor && (
        <SponsorContactModal 
          sponsor={contactSponsor} 
          onClose={() => setContactSponsor(null)} 
        />
      )}
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
  const { currentUser } = useMatchState();
  const [activeTab, setActiveTab] = React.useState<'form' | 'admin'>('form');

  // Inquiry Form Fields
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [category, setCategory] = React.useState('General Inquiry');
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');

  // Submit Status
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [infoMessage, setInfoMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  // CAPTCHA State
  const [captchaCode, setCaptchaCode] = React.useState('');
  const [captchaInput, setCaptchaInput] = React.useState('');

  // Admin View Inquiries Database
  const [inquiries, setInquiries] = React.useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = React.useState(false);
  const [adminSearch, setAdminSearch] = React.useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = React.useState('All');
  const [adminStatusFilter, setAdminStatusFilter] = React.useState('All');
  const [expandedInquiryId, setExpandedInquiryId] = React.useState<string | null>(null);

  // Generate a random visual CAPTCHA code
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  React.useEffect(() => {
    generateCaptcha();
  }, []);

  // Fetch inquiries for administrators
  const fetchInquiries = async () => {
    if (!currentUser) return;
    setIsAdminLoading(true);
    try {
      const response = await fclApi.getInquiries();
      if (response && response.success) {
        setInquiries(response.inquiries || []);
      }
    } catch (err) {
      console.error('Failed to load admin inquiries:', err);
    } finally {
      setIsAdminLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'admin' && currentUser) {
      fetchInquiries();
    }
  }, [activeTab, currentUser]);

  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    let nextStatus: 'Unread' | 'Read' | 'Responded' = 'Read';
    if (currentStatus === 'Unread') nextStatus = 'Read';
    else if (currentStatus === 'Read') nextStatus = 'Responded';
    else nextStatus = 'Unread';

    try {
      const resp = await fclApi.updateInquiryStatus(id, nextStatus);
      if (resp && resp.success) {
        setInquiries(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus } : item));
      }
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this inquiry?')) return;
    try {
      const resp = await fclApi.deleteInquiry(id);
      if (resp && resp.success) {
        setInquiries(prev => prev.filter(item => item.id !== id));
        if (expandedInquiryId === id) setExpandedInquiryId(null);
      }
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
    }
  };

  // Submit Inquiry Form
  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setInfoMessage('');

    // Primary Validation Rules
    if (!fullName.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    const officialCategories = [
      'General Inquiry',
      'Fixture Information',
      'Ticketing / Attendance',
      'Media & Press',
      'Technical Support',
      'Complaint',
      'Sponsorship Proposal'
    ];
    if (!officialCategories.includes(category)) {
      setErrorMessage('Please select a valid message classification category.');
      return;
    }
    if (!subject.trim()) {
      setErrorMessage('Subject is required.');
      return;
    }
    if (!message.trim() || message.trim().length < 20) {
      setErrorMessage('Message must contain at least 20 characters.');
      return;
    }

    // CAPTCHA verification
    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      setErrorMessage('Verification code is incorrect. Please check and try again.');
      return;
    }

    // 30-Seconds Rate limiting anti-spam check
    const now = Date.now();
    const lastSubmit = localStorage.getItem('fcl_last_contact_submit');
    if (lastSubmit) {
      const elapsed = now - parseInt(lastSubmit);
      if (elapsed < 30000) {
        const remaining = Math.ceil((30000 - elapsed) / 1000);
        setErrorMessage(`Security Lock: Please wait ${remaining} seconds before submitting another inquiry.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fclApi.submitInquiry({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        category,
        subject: subject.trim(),
        message: message.trim()
      });

      if (response && response.success) {
        // Log submission timestamp for client side protection
        localStorage.setItem('fcl_last_contact_submit', String(now));
        
        setSuccessMessage('Your message has been successfully sent to the FUTA Champions League Committee. We will respond shortly.');
        
        // Reset inputs
        setFullName('');
        setEmail('');
        setPhone('');
        setCategory('General Inquiry');
        setSubject('');
        setMessage('');
        generateCaptcha();
      } else {
        setErrorMessage('Message could not be delivered. Please try again or contact us directly via email.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Message could not be delivered. Please try again or contact us directly via email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      item.subject.toLowerCase().includes(adminSearch.toLowerCase()) ||
      item.message.toLowerCase().includes(adminSearch.toLowerCase());
    
    const matchesCategory = adminCategoryFilter === 'All' || item.category === adminCategoryFilter;
    const matchesStatus = adminStatusFilter === 'All' || item.status === adminStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div>
      <PageHeader 
        title="Get In Touch" 
        subtitle="Official communication channel for FUTA Champions League organizers. We're here to help."
      />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Toggle Admin Feed if administrative role is detected */}
        {currentUser && (
          <div className="flex justify-center mb-12">
            <div className="bg-navy border border-white/10 p-1.5 rounded-full flex gap-2">
              <button
                onClick={() => setActiveTab('form')}
                className={cn(
                  "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer",
                  activeTab === 'form' 
                    ? "bg-[#00e5ff] text-dark shadow-md" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                Inquiry Form
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={cn(
                  "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2",
                  activeTab === 'admin' 
                    ? "bg-[#00e5ff] text-dark shadow-md" 
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                <Inbox size={14} className="animate-pulse text-[#00e5ff] group-hover:text-dark" />
                Inquiry Feed ({inquiries.length})
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'form' ? (
            <div className="grid lg:grid-cols-2 gap-16">
              <motion.div 
                key="form-container"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="glass rounded-[40px] p-8 sm:p-12 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16" />
                
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ShieldCheck className="text-primary w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Official Inquiry Form</span>
                </div>

                {errorMessage && (
                  <div className="bg-red-500/15 border border-red-500/25 p-4 rounded-2xl text-xs text-red-400 font-bold mb-6 flex items-start gap-3">
                    <span className="mt-0.5">⚠️</span>
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="bg-emerald-500/15 border border-emerald-500/25 p-4 rounded-2xl text-xs text-emerald-400 font-extrabold mb-6 flex items-start gap-3 animate-pulse">
                    <span className="mt-0.5">✔</span>
                    <span className="leading-relaxed">{successMessage}</span>
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmitInquiry}>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Full Name <span className="text-[#00e5ff]">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-[#00e5ff] outline-none transition-all text-xs font-bold" 
                        placeholder="John Doe" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Email address <span className="text-[#00e5ff]">*</span></label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-[#00e5ff] outline-none transition-all text-xs font-bold" 
                        placeholder="john@example.com" 
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Category <span className="text-[#00e5ff]">*</span></label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-[#0b1329] border border-white/10 text-white focus:border-[#00e5ff] outline-none cursor-pointer text-xs font-bold appearance-none"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Fixture Information">Fixture Information</option>
                        <option value="Ticketing / Attendance">Ticketing / Attendance</option>
                        <option value="Media & Press">Media & Press</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Complaint">Complaint</option>
                        <option value="Sponsorship Proposal">Sponsorship Proposal</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Phone Number (Optional)</label>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-[#00e5ff] outline-none transition-all text-xs font-bold" 
                        placeholder="+234..." 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Subject <span className="text-[#00e5ff]">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-[#00e5ff] outline-none transition-all text-xs font-bold" 
                      placeholder="e.g. Media pass request / Sponsor inquiry" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Message (Min 20 Characters) <span className="text-[#00e5ff]">*</span></label>
                    <textarea 
                      rows={4} 
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-[#00e5ff] outline-none transition-all text-xs resize-none font-medium leading-relaxed" 
                      placeholder="Write your detailed inquiry here..." 
                    />
                  </div>

                  {/* Verification CAPTCHA widget */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-navy px-4 py-2 rounded-lg font-mono font-black border border-white/10 text-white text-base select-none tracking-widest skew-x-3 italic line-through decoration-dotted decoration-primary shadow-inner">
                        {captchaCode}
                      </div>
                      <button 
                        type="button" 
                        onClick={generateCaptcha} 
                        className="text-[10px] text-[#00e5ff] font-black uppercase tracking-wider hover:underline"
                      >
                        Change Code
                      </button>
                    </div>
                    
                    <div className="w-full sm:w-auto">
                      <input 
                        type="text" 
                        required
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        placeholder="Enter Captcha Code"
                        className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase text-white tracking-widest text-center focus:border-[#00e5ff] outline-none placeholder-white/30"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 py-1">
                    <Clock className="text-white/20 w-4 h-4" />
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest italic">Response Expectation: 24–48 hours</span>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 sporty-gradient rounded-[20px] font-black tracking-widest text-dark text-xs uppercase hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-primary/15 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'DELIVERING MESSAGE...' : 'SEND OFFICIAL INQUIRY'}
                  </button>
                </form>
              </motion.div>

              <div className="flex flex-col justify-between space-y-12">
                <motion.div 
                  key="channels-info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-2xl font-display mb-8 italic uppercase tracking-tighter text-white font-black">Official Channels</h3>
                    <div className="space-y-4">
                      <a href="mailto:futa.cl@yahoo.com" className="flex items-center space-x-6 glass p-6 rounded-3xl border border-white/10 hover:border-[#00e5ff]/40 transition-all group">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-[#00e5ff] group-hover:scale-110 transition-transform"><Mail size={28} /></div>
                        <div>
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Email us at</div>
                          <div className="text-xl font-bold font-mono tracking-tight text-white select-all">futa.cl@yahoo.com</div>
                        </div>
                      </a>

                      <a href="tel:+2348027479363" className="flex items-center space-x-6 glass p-6 rounded-3xl border border-white/10 hover:border-[#00e5ff]/40 transition-all group">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-[#00e5ff] group-hover:scale-110 transition-transform"><Phone size={28} /></div>
                        <div>
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Call for inquiries</div>
                          <div className="text-xl font-bold font-mono tracking-tight text-white select-all">+{'(0)'}8027479363</div>
                        </div>
                      </a>

                      <a href="https://x.com/FUTA_CL" target="_blank" rel="noreferrer" className="flex items-center space-x-6 glass p-6 rounded-3xl border border-white/10 hover:border-[#00e5ff]/40 transition-all group">
                        <div className="w-14 h-14 rounded-2xl bg-blue-400/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform"><Twitter size={28} /></div>
                        <div>
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Follow on X/Twitter</div>
                          <div className="text-xl font-bold font-mono tracking-tight text-white">@FUTA_CL</div>
                        </div>
                      </a>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-[#00e5ff]/10 blur-3xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-700" />
                    <div className="relative glass rounded-[40px] p-10 border border-[#00e5ff]/25 text-center flex flex-col items-center">
                      <Trophy className="text-[#00e5ff] w-12 h-12 mb-6 animate-pulse" />
                      <h4 className="text-xl font-display italic uppercase mb-2 tracking-tighter text-white font-black">Grow Your Brand with FCL</h4>
                      <p className="text-xs text-white/50 mb-8 leading-relaxed max-w-xs font-sans">
                        Join our elite network of partners and connect with 25,000+ passionate students, faculty, and local fans.
                      </p>
                      <Link 
                        to="/sponsorship" 
                        className="w-full py-4 glass border border-white/10 hover:border-[#00e5ff]/30 rounded-2xl text-xs font-bold tracking-widest hover:bg-white/10 transition-all flex items-center justify-center uppercase text-white"
                      >
                        Become a Sponsor
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  key="trust-box"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 glass rounded-[40px] border border-white/5 bg-white/[0.01] relative"
                >
                  <div className="flex items-start space-x-4">
                    <div className="mt-1"><ShieldCheck className="text-[#00e5ff] w-5 h-5" /></div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2">Trust Statement</h4>
                      <p className="text-xs text-white/40 leading-relaxed italic font-sans font-medium">
                        “Official communication channel for FUTA Champions League organizers. All data shared via this form is handled securely according to FCL privacy standards.”
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            // Admin View inquiries panel
            <motion.div
              key="admin-container"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass rounded-[40px] p-6 sm:p-10 relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 border-b border-white/5 pb-6">
                <div>
                  <h3 className="text-2xl font-display uppercase italic text-white font-black">Inquiry Feed Panel</h3>
                  <p className="text-xs text-white/40">Real-time coordinator list of messages received through the FUTA Champions League platform.</p>
                </div>
                
                <button
                  onClick={fetchInquiries}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-[#00e5ff] hover:text-[#00e5ff] transition-all rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer"
                >
                  Refresh Data
                </button>
              </div>

              {/* Filtering Controls */}
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-white/30"><Search size={14} /></span>
                  <input
                    type="text"
                    placeholder="Search by name, subject, body..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 focus:border-[#00e5ff] rounded-2xl text-xs text-white outline-none font-medium"
                  />
                </div>

                {/* Categories Dropdown Filter */}
                <div className="relative">
                  <select
                    value={adminCategoryFilter}
                    onChange={(e) => setAdminCategoryFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0d1527] border border-white/10 text-white focus:border-[#00e5ff] rounded-2xl text-xs font-bold appearance-none cursor-pointer outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Fixture Information">Fixture Information</option>
                    <option value="Ticketing / Attendance">Ticketing / Attendance</option>
                    <option value="Media & Press">Media & Press</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Complaint">Complaint</option>
                    <option value="Sponsorship Proposal">Sponsorship Proposal</option>
                  </select>
                </div>

                {/* Status Dropdown Filter */}
                <div className="relative">
                  <select
                    value={adminStatusFilter}
                    onChange={(e) => setAdminStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0d1527] border border-white/10 text-white focus:border-[#00e5ff] rounded-2xl text-xs font-bold appearance-none cursor-pointer outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Unread">Unread</option>
                    <option value="Read">Read</option>
                    <option value="Responded">Responded</option>
                  </select>
                </div>
              </div>

              {/* Inquiries list feed container */}
              {isAdminLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-2 border-[#00e5ff] border-t-transparent animate-spin rounded-full mb-4"></div>
                  <p className="text-xs text-white/40 tracking-widest uppercase font-black">Syncing records...</p>
                </div>
              ) : filteredInquiries.length === 0 ? (
                <div className="text-center py-24 bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                  <p className="text-xs text-white/30 tracking-widest uppercase font-mono mb-2">No Records Found</p>
                  <p className="text-xs text-white/50">Your criteria did not match any stored inquiry.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInquiries.map((item) => {
                    const isExpanded = expandedInquiryId === item.id;
                    const dateFormatted = new Date(item.timestamp).toLocaleString();
                    return (
                      <div 
                        key={item.id}
                        className={cn(
                          "border rounded-3xl p-5 hover:bg-white/[0.02] transition-all relative overflow-hidden",
                          isExpanded ? "bg-white/[0.015] border-white/10 shadow-lg" : "border-white/5"
                        )}
                      >
                        {/* Status bar marker */}
                        <div className={cn(
                          "absolute top-0 bottom-0 left-0 w-1",
                          item.status === 'Unread' ? 'bg-red-500' : item.status === 'Read' ? 'bg-[#00e5ff]' : 'bg-emerald-500'
                        )} />

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <h4 className="text-sm font-black text-white">{item.name}</h4>
                              <span className="text-[9px] text-[#00e5ff] font-mono tracking-widest font-black uppercase bg-[#00e5ff]/10 px-2.5 py-1 rounded-full border border-[#00e5ff]/15">
                                {item.category}
                              </span>
                              <span className={cn(
                                "text-[9px] font-mono font-black uppercase px-2.5 py-1 rounded-full border",
                                item.status === 'Unread' 
                                  ? 'text-red-400 bg-red-500/10 border-red-500/20' 
                                  : item.status === 'Read' 
                                    ? 'text-[#00e5ff] bg-[#00e5ff]/10 border-[#00e5ff]/20' 
                                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                              )}>
                                {item.status || 'Unread'}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-white/40 font-bold">
                              <span>📧 {item.email}</span>
                              {item.phone && <span>📞 {item.phone}</span>}
                              <span>🕒 {dateFormatted}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setExpandedInquiryId(isExpanded ? null : item.id)}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-black tracking-wider rounded-xl cursor-pointer"
                            >
                              {isExpanded ? 'Collapse' : 'Expand Message'}
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(item.id, item.status)}
                              className="px-3 py-1.5 bg-[#00e5ff]/10 hover:bg-[#00e5ff]/25 text-[#00e5ff] text-[10px] uppercase font-black tracking-wider rounded-xl cursor-pointer border border-[#00e5ff]/20"
                              title="Toggle status badge between Unread, Read, and Responded"
                            >
                              Cycle Status
                            </button>
                            <button
                              onClick={() => handleDeleteInquiry(item.id)}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 text-[10px] uppercase font-black rounded-xl cursor-pointer border border-red-500/20"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Expandable detailed view of the inquiry */}
                        {isExpanded && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 pt-4 border-t border-white/5 space-y-3 block"
                          >
                            <div>
                              <span className="text-[10px] text-white/30 uppercase font-black tracking-wider block mb-1">Subject</span>
                              <h5 className="text-xs text-white font-black">{item.subject}</h5>
                            </div>
                            <div>
                              <span className="text-[10px] text-white/30 uppercase font-black tracking-wider block mb-1">Message Content</span>
                              <p className="text-xs text-white/80 leading-relaxed font-sans font-medium whitespace-pre-wrap bg-[#111827] border border-white/5 p-4 rounded-2xl">
                                {item.message}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
export function TeamProfile() {
  const { id } = useParams();
  const team = TEAMS.find(t => t.id === id);
  const teamPlayers = PLAYERS.filter(p => p.teamId === id);
  const teamCoefficient = COEFFICIENTS.find(c => c.teamId === id);

  if (!team) return <div>Team not found</div>;

  return (
    <div>
      <div className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-8 md:space-y-0 md:space-x-12">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
              <TeamLogo 
                teamId={team.id}
                logoUrl={team.logoUrl} 
                size="custom" 
                className="w-48 h-48 drop-shadow-2xl relative z-10 text-[48px] font-display font-black rounded-[36px]"
              />
              {teamCoefficient && (
                <div className="absolute -top-4 -right-4 bg-primary text-dark font-black italic px-4 py-2 rounded-xl text-xl shadow-xl z-20 border-2 border-dark">
                  #{teamCoefficient.rank}
                </div>
              )}
            </motion.div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                <div className="text-primary font-bold tracking-[0.3em] uppercase">Group {team.group}</div>
                {teamCoefficient && teamCoefficient.rank <= 3 && (
                  <div className="px-2 py-0.5 bg-primary/20 rounded border border-primary/40 text-[8px] font-black text-primary uppercase tracking-[0.2em] italic">Top Seed</div>
                )}
                {team.id === 'mst' && (
                  <div className="px-2 py-0.5 bg-yellow-500/20 rounded border border-yellow-500/40 text-[8px] font-black text-yellow-500 uppercase tracking-[0.2em] italic flex items-center">
                    <Trophy size={10} className="mr-1" />
                    Defending Champions
                  </div>
                )}
                {team.pot && (
                  <div className={cn(
                    "px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-[0.2em] italic",
                    team.pot === 'A' ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/20 text-white/40"
                  )}>
                    Pot {team.pot}
                  </div>
                )}
              </div>
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
                {teamCoefficient && (
                  <>
                    <div className="w-px h-10 bg-white/10" />
                    <div>
                      <div className="text-3xl font-display font-bold text-primary">{teamCoefficient.totalCoefficient.toFixed(2)}</div>
                      <div className="text-[10px] font-bold text-white/30 tracking-[0.2em]">COEFF</div>
                    </div>
                  </>
                )}
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

function PotAHighlight() {
  const potATeams = TEAMS.filter(t => t.pot === 'A');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full mb-4">
            <Trophy size={12} className="text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Elite Category</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-display font-black italic uppercase tracking-tighter">
            TOP SEEDED <span className="text-primary italic">TEAMS</span> <br />
            (POT A)
          </h2>
        </div>
        <Link to="/pots" className="group flex items-center space-x-3 text-white/40 hover:text-primary transition-colors">
          <span className="text-xs font-black uppercase tracking-widest">View All Seedings</span>
          <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {potATeams.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link 
              to={`/teams/${team.id}`}
              className="group block p-8 glass rounded-[40px] border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                <Medal className="text-primary w-8 h-8" />
              </div>
              <TeamLogo teamId={team.id} logoUrl={team.logoUrl} size="lg" className="mx-auto mb-6 transform group-hover:scale-110 transition-all duration-500" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white group-hover:text-primary mb-2 transition-colors">{team.id.toUpperCase()}</h3>
              {team.id === 'mst' ? (
                <p className="text-[8px] font-black text-yellow-500 uppercase tracking-[0.2em] mb-4 flex items-center justify-center">
                  <Trophy size={10} className="mr-1" />
                  Defending Champion
                </p>
              ) : (
                <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Title Contender</p>
              )}
              <div className="pt-4 border-t border-white/5">
                <div className="text-[7px] font-black text-primary uppercase tracking-[0.2em] mb-1">Match Importance Core</div>
                <div className="text-xs font-black text-white tracking-widest italic">8.5 - 10.0</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function Rankings() {
  return (
    <div>
      <PageHeader 
        title="FCL Coefficient Rankings" 
        subtitle="Departmental Power Index & Pre-Tournament Hierarchy"
      />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid lg:grid-cols-4 gap-12 mb-20">
          <aside className="lg:col-span-1 space-y-8">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full mb-4">
                <Medal size={12} className="text-primary" />
                <span className="text-[8px] font-black text-primary uppercase tracking-widest">Power Ranking Index</span>
              </div>
              <h3 className="text-2xl font-display italic uppercase tracking-tighter text-white mb-4">Historical Strength</h3>
              <p className="text-sm text-white/50 leading-relaxed italic">
                “The FCL Coefficient Ranking measures team performance across previous seasons. It reflects consistency, historical strength, and competitive pedigree heading into the 2026 tournament.”
              </p>
            </div>

            <div className="p-8 glass rounded-[32px] border border-primary/20 bg-primary/5">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Seeding Note</h4>
              <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest italic font-bold">
                *FCL Team Coefficient Ranking was calculated before the commencement of the 2026 Tournament*
              </p>
            </div>
          </aside>
          <div className="lg:col-span-3">
            <CoefficientTable data={COEFFICIENTS} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="glass rounded-[40px] p-12 border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
            <h3 className="text-2xl font-display italic mb-6 uppercase tracking-tighter text-primary">Prestige & Seeding</h3>
            <p className="text-white/60 leading-relaxed mb-8 text-sm">
              A high coefficient isn't just about pride—it has direct sporting implications. The Top 8 teams in the coefficient ranking are designated as "Top Seeds" during the Season Draws, ensuring they avoid other heavyweights in the initial group stages.
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><ShieldCheck /></div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Seeding protection for Top 8</div>
            </div>
          </div>
          <div className="glass rounded-[40px] p-12 border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
            <h3 className="text-2xl font-display italic mb-6 uppercase tracking-tighter text-white">Rising Giants</h3>
            <p className="text-white/60 leading-relaxed mb-8 text-sm">
              The 2026 season has seen a massive surge from departments like <span className="text-white font-bold">APH</span> and <span className="text-white font-bold">ICE</span>. While they lack the 2025 legacy points, their rapid accumulation in 2026 makes them the most dangerous "Lower Seeds" in the current bracket.
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><TrendingUp /></div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Tracking 2026 momentum</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Pots() {
  const pots = {
    A: {
      color: 'from-blue-600/20 to-blue-900/40',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      label: 'POT A',
      subtitle: 'Top Seeded Teams',
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.2)]',
      teams: TEAMS.filter(t => t.pot === 'A')
    },
    B: {
      color: 'from-green-600/20 to-green-900/40',
      border: 'border-green-500/30',
      text: 'text-green-400',
      label: 'POT B',
      subtitle: 'Competitive Seeds',
      glow: 'shadow-[0_0_30px_rgba(34,197,94,0.1)]',
      teams: TEAMS.filter(t => t.pot === 'B')
    },
    C: {
      color: 'from-yellow-600/20 to-yellow-900/40',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      label: 'POT C',
      subtitle: 'Mid-Tier Contenders',
      glow: 'shadow-[0_0_30px_rgba(234,179,8,0.1)]',
      teams: TEAMS.filter(t => t.pot === 'C')
    },
    D: {
      color: 'from-red-600/20 to-red-900/40',
      border: 'border-red-500/30',
      text: 'text-red-400',
      label: 'POT D',
      subtitle: 'Lower Seeded Teams',
      glow: 'shadow-[0_0_30px_rgba(239,68,68,0.1)]',
      teams: TEAMS.filter(t => t.pot === 'D')
    }
  };

  return (
    <div>
      <div className="relative h-[300px] sm:h-[400px] overflow-hidden">
        <img 
          src="/src/assets/images/regenerated_image_1777706109226.png" 
          className="w-full h-full object-cover opacity-40 scale-110"
          alt="Pots Header"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-20 px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl sm:text-8xl font-display font-black italic uppercase tracking-tighter text-white mb-2"
          >
            2026 POT <span className="text-primary italic">SEEDINGS</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]"
          >
            Tournament structure & competitive balance hierarchy
          </motion.p>
        </div>
      </div>
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 -mt-16 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12 mb-20 p-12 glass rounded-[40px] border border-white/10">
          <div className="max-w-2xl">
            <h3 className="text-3xl font-display font-black italic uppercase tracking-tighter text-white mb-6">Tournament Seeding System</h3>
            <p className="text-white/50 leading-relaxed italic">
              “The FCL Pot Seeding system categorizes teams based on historical performance and coefficient rankings to ensure competitive balance in match scheduling and tournament structure.”
            </p>
          </div>
          <div className="lg:w-1/3 p-8 bg-white/5 rounded-3xl border border-white/10">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Mechanism</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Prevents early elite clashes</span>
              </li>
              <li className="flex items-center space-x-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Rewards historic consistency</span>
              </li>
              <li className="flex items-center space-x-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Ensures diverse group stages</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(Object.entries(pots) as [keyof typeof pots, typeof pots['A']][]).map(([key, pot]) => (
            <motion.div
              key={key}
              whileHover={{ y: -8 }}
              className={`relative rounded-[40px] overflow-hidden border ${pot.border} flex flex-col h-full bg-gradient-to-br ${pot.color} p-1 ${pot.glow}`}
            >
              <div className="p-8 h-full glass rounded-[36px] flex flex-col">
                <div className="mb-8">
                  <h4 className={`text-3xl font-black italic tracking-tighter leading-none mb-2 ${pot.text}`}>{pot.label}</h4>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{pot.subtitle}</p>
                </div>

                <div className="space-y-3 flex-1">
                  {pot.teams.map((team) => (
                    <Link 
                      key={team.id}
                      to={`/teams/${team.id}`}
                      className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <TeamLogo teamId={team.id} logoUrl={team.logoUrl} size="sm" className="rounded-lg" />
                        <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors uppercase tracking-widest">
                          {team.id.toUpperCase()}
                        </span>
                      </div>
                      <ArrowRight size={14} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex -space-x-1.5 matches-glow-logos">
                    {pot.teams.slice(0, 3).map(t => (
                      <div key={t.id} className="w-6 h-6 rounded-full border border-dark overflow-hidden bg-dark flex items-center justify-center">
                        <TeamLogo teamId={t.id} logoUrl={t.logoUrl} size="xs" className="w-[100%] h-[100%] object-cover rounded-full border-0 p-0 font-bold" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Elite Contenders</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
