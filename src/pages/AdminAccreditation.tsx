import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMatchState } from '../context/MatchStateContext';
import { 
  ShieldCheck, AlertCircle, CheckCircle2, XCircle, Search, 
  Building2, UserPlus, FileSpreadsheet, Printer, ArrowLeft, 
  Trash2, User, Calendar, Eye, Download, Info, Users, 
  PlusCircle, UsersRound, Settings, RefreshCw, KeyRound, Lock, EyeOff
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PageHeader } from '../components/PageHeader';
import { TEAMS } from '../data/mockData';
import { fclApi, AdminUser, AuditLogItem } from '../lib/api';
import { APP_LOGO } from '../constants';
import { cn } from '../lib/utils';
import { TeamLogo } from '../components/TeamLogo';

// --- ACCREDITATION CONSTS ---
const POSITION_LABELS: Record<string, string> = {
  GK: 'Goalkeeper',
  DEF: 'Defender',
  MID: 'Midfielder',
  FWD: 'Forward'
};

// --- TEAM ACCREDIATION CONFIGS ---
interface TeamTheme {
  primary: string;
  glow: string;
}

const getTeamColor = (teamId: string): TeamTheme => {
  const mapping: Record<string, TeamTheme> = {
    mst: { primary: '#00E5FF', glow: 'rgba(0, 229, 255, 0.35)' },
    ifs: { primary: '#D042FF', glow: 'rgba(208, 66, 255, 0.35)' },
    bdg: { primary: '#FFA000', glow: 'rgba(255, 160, 0, 0.35)' },
    mcb: { primary: '#00E676', glow: 'rgba(0, 230, 118, 0.35)' },
    cys: { primary: '#FF1744', glow: 'rgba(255, 23, 68, 0.35)' },
    age: { primary: '#1DE9B6', glow: 'rgba(29, 233, 182, 0.35)' },
    ana: { primary: '#2979FF', glow: 'rgba(41, 121, 255, 0.35)' },
    aph: { primary: '#FF9100', glow: 'rgba(255, 145, 0, 0.35)' },
    bch: { primary: '#E040FB', glow: 'rgba(224, 64, 251, 0.35)' },
    csp: { primary: '#76FF03', glow: 'rgba(118, 255, 3, 0.35)' },
    ent: { primary: '#00B0FF', glow: 'rgba(0, 176, 255, 0.35)' },
    fwt: { primary: '#C6FF00', glow: 'rgba(198, 255, 0, 0.35)' },
    ice: { primary: '#651FFF', glow: 'rgba(101, 31, 255, 0.35)' },
    idd: { primary: '#FFE082', glow: 'rgba(255, 224, 130, 0.35)' },
    mbbs: { primary: '#F50057', glow: 'rgba(245, 0, 87, 0.35)' },
    phy: { primary: '#E65100', glow: 'rgba(230, 81, 0, 0.35)' },
    phs: { primary: '#29B6F6', glow: 'rgba(41, 182, 246, 0.35)' },
    simt: { primary: '#FFEB3B', glow: 'rgba(255, 235, 59, 0.35)' },
    sta: { primary: '#CDDC39', glow: 'rgba(205, 220, 57, 0.35)' },
  };
  return mapping[teamId.toLowerCase()] || { primary: '#00E5FF', glow: 'rgba(0, 229, 255, 0.35)' };
};

// Vector QR Code Component
const StaticQR = ({ code }: { code: string }) => {
  return (
    <svg className="w-10 h-10 bg-white p-0.5 rounded flex-shrink-0" viewBox="0 0 29 29" shapeRendering="crispEdges">
      <path fill="#ffffff" d="M0,0 h29 v29 h-29 z" />
      <path fill="#000000" d="M1,1 h7 v1 h-7 z M1,2 h1 v5 h-1 z M7,2 h1 v5 h-1 z M1,7 h7 v1 h-7 z M3,3 h3 v3 h-3 z" />
      <path fill="#000000" d="M21,1 h7 v1 h-7 z M21,2 h1 v5 h-1 z M27,2 h1 v5 h-1 z M21,7 h7 v1 h-7 z M23,3 h3 v3 h-3 z" />
      <path fill="#000000" d="M1,21 h7 v1 h-7 z M1,22 h1 v5 h-1 z M7,22 h1 v5 h-1 z M1,27 h7 v1 h-7 z M3,23 h3 v3 h-3 z" />
      <path fill="#000000" d="M22,22 h3 v1 h-3 z M22,23 h1 v2 h-1 z M24,23 h1 v2 h-1 z M22,25 h3 v1 h-3 z" />
      <path fill="#000000" d="M9,3 h2 v1 h-2 z M13,5 h1 v2 h-1 z M15,3 h2 v1 h-2 z M17,5 h2 v1 h-2 z M13,9 h2 v2 h-2 z" />
      <path fill="#000000" d="M3,9 h1 v1 h-1 z M5,11 h2 v1 h-2 z M9,13 h3 v1 h-3 z M16,13 h3 v1 h-3 z M22,13 h2 v1 h-2 z" />
    </svg>
  );
};

export default function AdminAccreditation() {
  const navigate = useNavigate();
  const { currentUser, auditLogs, addAuditLog } = useMatchState();

  // Authentication validation
  useEffect(() => {
    if (!currentUser) {
      navigate('/admin/login');
    }
  }, [currentUser, navigate]);

  // States
  const [registrations, setRegistrations] = useState<Record<string, any>>({});
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [localAuditLogs, setLocalAuditLogs] = useState<AuditLogItem[]>([]);
  const [activeTab, setActiveTab] = useState<'members' | 'teams' | 'admins' | 'logs'>('members');
  
  // Search / Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all'); // all, player, coach

  // Feedbacks
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [selectedMemberForReject, setSelectedMemberForReject] = useState<{ teamId: string; memberId: string; type: 'player' | 'coach'; name: string } | null>(null);

  // Card view modal
  const [previewMember, setPreviewMember] = useState<{ member: any; type: 'player' | 'coach'; teamId: string } | null>(null);

  // Admin registers state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRole, setAdminRole] = useState<'Super Admin' | 'Match Commissioner' | 'Media Officer' | 'Team Official'>('Match Commissioner');
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [loading, setLoading] = useState(true);

  // Fetch registers
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const regRes = await fclApi.getRegistrations();
      if (regRes && regRes.registrations) {
        setRegistrations(regRes.registrations);
      }

      if (currentUser?.role === 'Super Admin') {
        const adminRes = await fclApi.getAdmins();
        if (adminRes && adminRes.admins) {
          setAdminsList(adminRes.admins);
        }
      }

      const logRes = await fclApi.getAuditLogs();
      if (logRes && logRes.auditLogs) {
        setLocalAuditLogs(logRes.auditLogs);
      }
    } catch (err) {
      console.warn('Backend API disconnected or loading failed. Operating with secure local states.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  // Actions
  const handleVerifyMember = async (teamId: string, memberId: string, type: 'player' | 'coach', status: 'Approved' | 'Rejected', feedback?: string) => {
    if (currentUser?.role !== 'Super Admin') {
      alert('Security Protection: Only Super Administrators can approve or reject tournament accreditations!');
      return;
    }

    try {
      await fclApi.verifyMemberAccreditation(teamId, memberId, type, status, feedback);
      
      // Update local state registrations
      const updatedRegs = { ...registrations };
      const teamReg = updatedRegs[teamId];
      if (teamReg) {
        if (type === 'player') {
          const player = teamReg.players?.find((p: any) => p.id === memberId);
          if (player) {
            player.idCardStatus = status.toLowerCase();
            if (status === 'Rejected') {
              player.idCardFeedback = feedback;
            }
          }
        } else {
          const coach = teamReg.coaches?.find((c: any) => c.id === memberId);
          if (coach) {
            coach.idCardStatus = status.toLowerCase();
            if (status === 'Rejected') {
              coach.idCardFeedback = feedback;
            }
          }
        }
      }
      setRegistrations(updatedRegs);
      
      // Append audit logs and sync
      const logMsg = status === 'Approved' 
        ? `Accredited and approved registration card for ${type === 'player' ? 'player' : 'coach'} on squad ${teamId.toUpperCase()}`
        : `Accreditation REJECTED for ${type === 'player' ? 'player' : 'coach'} on squad ${teamId.toUpperCase()}: "${feedback}"`;
      
      addAuditLog(logMsg);
      
      // Re-fetch latest logs
      setTimeout(async () => {
        const logsRes = await fclApi.getAuditLogs();
        if (logsRes.auditLogs) {
          setLocalAuditLogs(logsRes.auditLogs);
        }
      }, 500);

      setSelectedMemberForReject(null);
      setRejectionFeedback('');
    } catch (err: any) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  // Create sub admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');

    if (!adminUsername.trim() || !adminPassword.trim()) {
      setAdminError('Please fill in both the username and password fields.');
      return;
    }

    if (adminPassword.length < 6) {
      setAdminError('For enhanced crypt-security, admin credentials must be at least 6 characters.');
      return;
    }

    try {
      await fclApi.createAdmin(adminUsername.trim(), adminPassword, adminRole);
      setAdminSuccess(`Successfully registered ${adminUsername.trim()} as [${adminRole}]!`);
      
      // Append audit
      addAuditLog(`Registered new admin account "${adminUsername.trim()}" with role ${adminRole}`);
      
      // Reset keys
      setAdminUsername('');
      setAdminPassword('');
      loadDashboardData();
    } catch (err: any) {
      setAdminError(err.message || 'Creation rejected by secure database layer.');
    }
  };

  // Remove sub admin
  const handleDeleteAdmin = async (username: string) => {
    if (currentUser?.role !== 'Super Admin') return;
    if (username.toLowerCase() === 'fredib' || username.toLowerCase() === 'ousman') {
      alert('Secure Rule: Initial root Super Admins cannot be modified or deleted!');
      return;
    }

    if (!confirm(`Safety check: Are you absolutely sure you want to delete administrator "${username}"?`)) {
      return;
    }

    try {
      await fclApi.deleteAdmin(username);
      addAuditLog(`Removed administrator profile for "${username}"`);
      loadDashboardData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // PDF Generation
  const cardPreviewRef = useRef<HTMLDivElement>(null);

  const downloadAccreditationCard = async (member: any, teamId: string, type: 'player' | 'coach') => {
    if (currentUser?.role !== 'Super Admin') {
      alert('Rule violation: Only Super Admins may generate and download tournament accreditation cards.');
      return;
    }

    const cardElement = document.getElementById(`accreditation-card-print-${member.id}`);
    if (!cardElement) {
      alert('Fatal visual failure: Card print engine could not locate the printable node details.');
      return;
    }

    try {
      // Append download activity to logs
      const filename = `FCL2026-ACC-${teamId.toUpperCase()}-${member.fullName.replace(/\s+/g, '_')}`;
      
      const canvas = await html2canvas(cardElement, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: '#070A1A'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 85.6; // ID-1 CR80 credit card horizontal dimension in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);

      // Log download to audits
      const logAction = `${currentUser.username} generated accreditation card for ${member.fullName} (${teamId.toUpperCase()})`;
      await fclApi.addAuditLog(logAction);
      
      // Update logs in view
      const logsRes = await fclApi.getAuditLogs();
      if (logsRes.auditLogs) {
        setLocalAuditLogs(logsRes.auditLogs);
      }
    } catch (error) {
      console.error('PDF creation rejected by context:', error);
      alert('Card generation interrupted: Canvas renderer failed.');
    }
  };

  // Compile members across all team registrations list
  const getCompiledMembersList = () => {
    const list: any[] = [];
    Object.keys(registrations).forEach((tId) => {
      const reg = registrations[tId];
      const teamMeta = TEAMS.find(t => t.id.toLowerCase() === tId.toLowerCase());
      if (!teamMeta) return;

      if (reg.players) {
        reg.players.forEach((p: any) => {
          list.push({
            ...p,
            type: 'player',
            teamId: tId,
            teamName: teamMeta.name,
            teamLogo: teamMeta.logoUrl
          });
        });
      }

      if (reg.coaches) {
        reg.coaches.forEach((c: any) => {
          list.push({
            ...c,
            type: 'coach',
            teamId: tId,
            teamName: teamMeta.name,
            teamLogo: teamMeta.logoUrl
          });
        });
      }
    });

    // Run filters
    return list.filter((m) => {
      const matchSearch = m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (m.matricNumber && m.matricNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchTeam = teamFilter === 'all' || m.teamId === teamFilter;
      const matchStatus = statusFilter === 'all' || (m.idCardStatus || 'pending') === statusFilter;
      const matchRole = roleFilter === 'all' || m.type === roleFilter;

      return matchSearch && matchTeam && matchStatus && matchRole;
    });
  };

  const compiledMembers = getCompiledMembersList();
  const sortedAuditLogs = [...localAuditLogs];

  const playersCount = compiledMembers.filter(m => m.type === 'player').length;
  const approvedCount = compiledMembers.filter(m => (m.idCardStatus || 'pending') === 'approved').length;
  const pendingCount = compiledMembers.filter(m => (m.idCardStatus || 'pending') === 'pending').length;

  return (
    <div className="min-h-screen bg-navy py-12">
      <PageHeader 
        title="Admin Accreditation Desk" 
        subtitle="Role-Based Credentials & Player card verification system"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-8">
        
        {/* Navigation Admin Controls Panel Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 glass p-6 rounded-[28px] border border-white/10">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/20 text-primary border border-primary/40 rounded-2xl">
              <ShieldCheck size={28} />
            </div>
            <div>
              <p className="text-white text-lg font-display font-black uppercase tracking-tight">System Operator: {currentUser?.username}</p>
              <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] tracking-widest font-black uppercase">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                <span className="text-primary">Role: {currentUser?.role}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={loadDashboardData}
              className="px-4.5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold font-mono transition-all border border-white/5 flex items-center space-x-2"
              title="Refresh DB"
            >
              <RefreshCw size={13} className="animate-spin-slow" />
              <span>SYNC SERVICES</span>
            </button>
            <Link
              to="/admin/dashboard"
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center space-x-2 transition-all"
            >
              <ArrowLeft size={13} />
              <span>MATCH CONTROL</span>
            </Link>
          </div>
        </div>

        {/* METRIC SLABS GENERAL SCREEN */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="glass p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Departments registered</span>
            <span className="text-3xl font-display font-black text-white mt-2 italic">{Object.keys(registrations).length} <span className="text-xs text-white/30 not-italic">TEAMS</span></span>
          </div>
          <div className="glass p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Total participants</span>
            <span className="text-3xl font-display font-black text-primary mt-2 italic">{compiledMembers.length} <span className="text-xs text-primary/40 not-italic">MEMBERS</span></span>
          </div>
          <div className="glass p-5 rounded-2xl border border-[#00E676]/10 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-widest">Accreditations approved</span>
            <span className="text-3xl font-display font-black text-[#00E676] mt-2 italic">{approvedCount} <span className="text-xs text-[#00E676]/40 not-italic">CARDS</span></span>
          </div>
          <div className="glass p-5 rounded-2xl border border-yellow-500/10 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Reviews pending</span>
            <span className="text-3xl font-display font-black text-yellow-500 mt-2 italic">{pendingCount} <span className="text-xs text-yellow-500/40 not-italic">CARDS</span></span>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION SYSTEM TAB */}
        <div className="flex border-b border-white/10 gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'members', label: 'Accreditation Grid', icon: Users },
            { id: 'teams', label: 'Registered Squads', icon: Building2 },
            currentUser?.role === 'Super Admin' && { id: 'admins', label: 'Administrator Accounts', icon: Settings },
            { id: 'logs', label: 'Security Audits', icon: FileSpreadsheet }
          ].filter(Boolean).map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-4 rounded-t-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 relative flex items-center space-x-2 border-t border-x border-transparent",
                activeTab === tab.id
                  ? 'bg-navy-dark border-white/10 text-primary'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.02]'
              )}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute -bottom-px left-0 right-0 h-[2px] bg-primary shadow-[0_0_10px_#00E5FF]" />
              )}
            </button>
          ))}
        </div>

        {/* WORKSPACE CONTENTS */}
        <div className="glass p-6 sm:p-8 rounded-[32px] border border-white/10 bg-navy-dark/40">
          
          {/* TAB 1: MEMBERS REGISTRY PANEL */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              {/* Filter inputs panel */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/[0.01] p-4 rounded-2xl border border-white/5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={14} className="text-white/30" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by Name or Matric..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div>
                  <select
                    value={teamFilter}
                    onChange={(e) => setTeamFilter(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white/70 focus:outline-none focus:border-primary/50"
                  >
                    <option value="all" className="bg-navy">All Departments</option>
                    {TEAMS.map(team => (
                      <option key={team.id} value={team.id} className="bg-navy">{team.name} ({team.id.toUpperCase()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white/70 focus:outline-none focus:border-primary/50"
                  >
                    <option value="all" className="bg-navy">All Roles</option>
                    <option value="player" className="bg-navy">Players Only</option>
                    <option value="coach" className="bg-navy">Coaches / Officials</option>
                  </select>
                </div>

                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white/70 focus:outline-none focus:border-primary/50"
                  >
                    <option value="all" className="bg-navy">All Accreditation Statuses</option>
                    <option value="pending" className="bg-navy text-yellow-500 font-bold">● Pending Accreditation</option>
                    <option value="approved" className="bg-navy text-green-500 font-bold">● Active Validated</option>
                    <option value="rejected" className="bg-navy text-red-500 font-bold">● Rejected Sheets</option>
                  </select>
                </div>
              </div>

              {/* Members Data Listing Table */}
              {loading ? (
                <div className="flex justify-center py-20 items-center">
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : compiledMembers.length === 0 ? (
                <div className="text-center py-16 text-white/20 border border-dashed border-white/10 rounded-3xl">
                  <p className="text-xs uppercase font-black font-mono">No matching участников matching credentials found.</p>
                  <p className="text-[10px] text-white/20 mt-1">Begin submitting squads representing departments on the client portal to display participants.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-[9.5px] uppercase font-bold text-white/40 tracking-wider">
                        <th className="pb-3 pl-3">Participant</th>
                        <th className="pb-3">Department</th>
                        <th className="pb-3">Role / Seeding</th>
                        <th className="pb-3">Accreditation Card</th>
                        <th className="pb-3 pr-3 text-right">Verification Commands</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-white/80">
                      {compiledMembers.map((member) => {
                        const status = member.idCardStatus || 'pending';
                        const teamIdUpper = member.teamId.toUpperCase();
                        const teamAccent = getTeamColor(member.teamId);

                        return (
                          <tr key={member.id} className="hover:bg-white/[0.01] transition-all">
                            {/* Photo / Passport details */}
                            <td className="py-4 pl-3">
                              <div className="flex items-center space-x-3.5">
                                <img
                                  src={member.passportPath || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"}
                                  className="w-10 h-10 rounded-lg object-cover border border-white/10 bg-white/5"
                                  alt=""
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80";
                                  }}
                                />
                                <div>
                                  <p className="font-semibold text-white uppercase">{member.fullName}</p>
                                  <span className="font-mono text-[9px] text-[#00E5FF]">{member.type === 'player' ? member.matricNumber : 'ACC_STAFF'}</span>
                                </div>
                              </div>
                            </td>

                            {/* Department detail */}
                            <td>
                              <div className="flex items-center space-x-2">
                                <TeamLogo teamId={member.teamId} logoUrl={member.teamLogo} size="custom" className="w-5 h-5 object-contain bg-transparent border-0 shadow-none font-bold text-[6px]" />
                                <span className="font-semibold uppercase text-white/90">{member.teamName}</span>
                              </div>
                            </td>

                            {/* Position Role details */}
                            <td>
                              <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/5 border border-white/5">
                                {member.type === 'player' 
                                  ? (POSITION_LABELS[member.position] || member.position) 
                                  : member.role}
                              </span>
                            </td>

                            {/* Badges Status */}
                            <td>
                              <div className="space-y-1">
                                <span className={cn(
                                  "px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider font-mono inline-block",
                                  status === 'approved' && "bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20",
                                  status === 'pending' && "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
                                  status === 'rejected' && "bg-red-500/10 text-red-500 border border-red-500/20"
                                )}>
                                  {status.toUpperCase()}
                                </span>
                                {status === 'rejected' && member.idCardFeedback && (
                                  <p className="text-[9px] text-red-400 font-medium max-w-[200px] leading-snug truncate" title={member.idCardFeedback}>
                                    Note: {member.idCardFeedback}
                                  </p>
                                )}
                              </div>
                            </td>

                            {/* Command controls */}
                            <td className="py-4 pr-3 text-right">
                              {currentUser?.role === 'Super Admin' ? (
                                <div className="flex justify-end gap-1.5">
                                  {status !== 'approved' && (
                                    <button
                                      onClick={() => handleVerifyMember(member.teamId, member.id, member.type, 'Approved')}
                                      className="p-1.5 bg-[#00E676] hover:bg-green-500 text-dark font-extrabold rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      title="Approve Accreditation"
                                    >
                                      <CheckCircle2 size={13} />
                                    </button>
                                  )}
                                  
                                  {status !== 'rejected' && (
                                    <button
                                      onClick={() => setSelectedMemberForReject({
                                        teamId: member.teamId,
                                        memberId: member.id,
                                        type: member.type,
                                        name: member.fullName
                                      })}
                                      className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      title="Reject Accreditation"
                                    >
                                      <XCircle size={13} />
                                    </button>
                                  )}

                                  {status === 'approved' ? (
                                    <button
                                      onClick={() => setPreviewMember({
                                        member,
                                        type: member.type,
                                        teamId: member.teamId
                                      })}
                                      className="px-2.5 py-1.5 sporty-gradient text-dark font-bold rounded-lg text-[9px] tracking-widest uppercase flex items-center space-x-1 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                    >
                                      <Printer size={10} />
                                      <span>GEN BADGE</span>
                                    </button>
                                  ) : (
                                    <button
                                      disabled
                                      className="px-2.5 py-1.5 bg-white/5 overflow-hidden text-white/20 rounded-lg text-[9px] tracking-widest uppercase flex items-center space-x-1 cursor-not-allowed border border-white/5"
                                      title="Only approved participants receive credentials card."
                                    >
                                      <Printer size={10} />
                                      <span>LOCKED</span>
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-white/30 italic">Read-only permissions</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REGISTERED SQUADS OVERVIEW */}
          {activeTab === 'teams' && (
            <div className="space-y-6">
              <p className="text-xs text-white/40 leading-relaxed font-mono uppercase tracking-widest mb-6">Verified Squad Lists by Departmental organizing committee</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TEAMS.map((team) => {
                  const reg = registrations[team.id];
                  const playersCount = reg?.players?.length || 0;
                  const coachesCount = reg?.coaches?.length || 0;
                  const squadStatus = reg?.status || 'pending';

                  return (
                    <div key={team.id} className="glass p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-primary/30 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/5 rounded-xl border border-white/10 w-11 h-11 flex items-center justify-center">
                            <TeamLogo teamId={team.id} logoUrl={team.logoUrl} size="custom" className="w-[100%] h-[100%] object-contain bg-transparent border-0 shadow-none font-bold text-[8px]" />
                          </div>
                          <div>
                            <h4 className="font-bold uppercase text-white leading-tight">{team.name}</h4>
                            <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest mt-0.5 block">{team.id}</span>
                          </div>
                        </div>
                        <span className={cn(
                          "px-2 px-1 text-[8.5px] font-mono tracking-widest uppercase font-extrabold rounded-full",
                          squadStatus === 'verified' && "bg-green-500/10 text-green-500",
                          squadStatus === 'submitted' && "bg-blue-500/10 text-blue-500 animate-pulse",
                          squadStatus === 'incomplete' && "bg-amber-500/10 text-amber-500",
                          squadStatus === 'pending' && "bg-white/5 text-white/33"
                        )}>
                          {squadStatus}
                        </span>
                      </div>

                      {/* Squad lists numbers summary */}
                      <div className="grid grid-cols-2 gap-4 mt-6 border-y border-white/5 py-4 text-xs font-mono">
                        <div>
                          <p className="text-white/40 uppercase text-[9px] tracking-wider leading-none">Registered Squad</p>
                          <p className="text-lg text-primary font-black mt-1 leading-none">{playersCount}/23 <span className="text-[10px] text-white/30 not-italic">PL</span></p>
                        </div>
                        <div>
                          <p className="text-white/40 uppercase text-[9px] tracking-wider leading-none">Officials staff</p>
                          <p className="text-lg text-primary font-black mt-1 leading-none">{coachesCount}/2 <span className="text-[10px] text-white/30 not-italic">CO</span></p>
                        </div>
                      </div>

                      {/* Administrative fast verify controls */}
                      <div className="mt-5 flex items-center justify-between gap-3">
                        {currentUser?.role === 'Super Admin' ? (
                          <>
                            <button
                              onClick={async () => {
                                if (confirm(`Authorize Excel sheet and approve ${team.name} squad for the 2026 tournament?`)) {
                                  try {
                                    await fclApi.verifySquad(team.id, 'verified');
                                    loadDashboardData();
                                    addAuditLog(`Admin approved entire squad list excel for department: ${team.name} (${team.id.toUpperCase()})`);
                                  } catch (err: any) {
                                    alert(err.message);
                                  }
                                }
                              }}
                              disabled={squadStatus === 'verified'}
                              className="flex-1 py-2 bg-[#00E676] disabled:bg-white/5 disabled:text-white/20 hover:bg-green-500 text-dark font-extrabold text-[10px] tracking-widest uppercase rounded-lg transition-all"
                            >
                              SQUAD APPROVED
                            </button>
                            <button
                              onClick={() => {
                                const feedback = prompt(`Input squad missing details warning for ${team.name} organizing committee:`, 'Player student status incorrect.');
                                if (feedback) {
                                  fclApi.verifySquad(team.id, 'incomplete', feedback)
                                    .then(() => {
                                      loadDashboardData();
                                      addAuditLog(`Flagged team ${team.id.toUpperCase()} squad as incomplete: "${feedback}"`);
                                    })
                                    .catch(err => alert(err.message));
                                }
                              }}
                              className="px-3.5 py-2 bg-red-500 hover:bg-red-600 font-extrabold text-white text-[10px] tracking-widest uppercase rounded-lg transition-all"
                            >
                              FLAG ERROR
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-white/30 italic block w-full text-center">Verify permission locked to Super Administrators</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN ACCOUNTS REGISTRY (Super Admin only!) */}
          {activeTab === 'admins' && currentUser?.role === 'Super Admin' && (
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Creator form card */}
              <div className="lg:col-span-1 p-6 rounded-2xl bg-white/[0.01] border border-white/5 h-max space-y-6">
                <h4 className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                  <UserPlus size={14} />
                  <span>REGISTRATION NEW DEPUTY</span>
                </h4>

                {adminError && (
                  <div className="p-3 text-[11px] font-bold text-red-400 bg-red-400/10 border border-red-500/25 rounded-lg leading-normal flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                {adminSuccess && (
                  <div className="p-3 text-[11px] font-bold text-green-400 bg-green-500/10 border border-green-500/25 rounded-lg leading-normal flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                    <span>{adminSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-bold mb-1.5">Staff Identifier (Unique)</label>
                    <input
                      type="text"
                      placeholder="e.g. Commissioner Bertram"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-bold mb-1.5">Credential Security Key</label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-xs text-white focus:outline-none focus:border-primary/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 cursor-pointer hover:text-white"
                      >
                        {showAdminPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-bold mb-1.5">Operational role assignment</label>
                    <select
                      value={adminRole}
                      onChange={(e: any) => setAdminRole(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white/80 focus:outline-none focus:border-primary/50"
                    >
                      <option value="Match Commissioner" className="bg-navy">Match Commissioner</option>
                      <option value="Media Officer" className="bg-navy">Media Officer</option>
                      <option value="Team Official" className="bg-navy">Team Official</option>
                      <option value="Super Admin" className="bg-navy text-primary font-bold">Super Admin</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-hover text-dark py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer shadow-[0_4px_15px_rgba(0,229,255,0.25)]"
                  >
                    DEPLOY CREDENTIALS
                  </button>
                </form>
              </div>

              {/* Administrators overview deck */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">ACTIVE ORGANIZING ADMINISTRATIVE COMMISSIONS ({adminsList.length})</h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-[9.5px] uppercase font-bold text-white/30 tracking-widest">
                        <th className="pb-2.5">Identifier</th>
                        <th className="pb-2.5">Role Designation</th>
                        <th className="pb-2.5">Setup Date</th>
                        <th className="pb-2.5 text-right">Protection Commands</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[11px]">
                      {adminsList.map((admin: any) => (
                        <tr key={admin.username} className="hover:bg-white/[0.005]">
                          <td className="py-3 font-semibold text-white uppercase flex items-center space-x-2">
                            <span>👤</span>
                            <span>{admin.username}</span>
                          </td>
                          <td className="py-3">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider",
                              admin.role === 'Super Admin' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white/5 text-white/60'
                            )}>
                              {admin.role}
                            </span>
                          </td>
                          <td className="py-3 text-white/40 font-mono text-[9px]">
                            {new Date(admin.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 text-right">
                            {admin.username.toLowerCase() === 'fredib' || admin.username.toLowerCase() === 'ousman' ? (
                              <span className="text-[9.5px] font-bold text-yellow-500 font-mono uppercase tracking-wider">ROOT SECURED</span>
                            ) : (
                              <button
                                onClick={() => handleDeleteAdmin(admin.username)}
                                className="p-1 text-red-400 hover:bg-red-400/10 hover:text-red-500 border border-transparent hover:border-red-500/25 rounded transition-all cursor-pointer"
                                title="Revoke Authorization Credentials"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: AUDIT SECURITY LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-primary/20 pb-4">
                <h4 className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-1.5">
                  <span>🛠️ CHRONOLOGICAL LOG EVENTS SYSTEM</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono text-[9px] animate-pulse">LIVE INSPECTION</span>
                </h4>
                <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Chronological Index Ledger</div>
              </div>

              {sortedAuditLogs.length === 0 ? (
                <div className="text-center py-12 text-white/30 border border-dashed border-white/10 rounded-2xl">
                  <p className="text-xs font-bold uppercase tracking-widest">No Security Audit logs recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
                  {sortedAuditLogs.map((log: any) => (
                    <div 
                      key={log.id} 
                      className="p-4 rounded-xl bg-white/[0.01] border border-white/5 text-xs flex justify-between items-center gap-4 hover:bg-white/[0.02] transition-all"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2 font-bold">
                          <span className="text-primary uppercase">👤 {log.adminName}</span>
                          <span className="px-2 py-0.5 rounded-full bg-white/5 text-[8.5px] text-white/40 uppercase tracking-wider font-medium">{log.role}</span>
                        </div>
                        <p className="text-white/80 font-medium leading-relaxed">{log.action}</p>
                      </div>
                      
                      <div className="text-right flex-shrink-0 text-[10px] text-white/30 font-mono">
                        {log.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* MODAL 1: ACCREDITATION SHEET REJECTION DIALOG */}
      {selectedMemberForReject && (
        <div className="fixed inset-0 bg-[#000]/80 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0b0f24] rounded-[28px] border border-red-500/20 p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 text-red-500 text-lg font-display font-medium uppercase tracking-tight">
              <AlertCircle size={22} />
              <span>REJECTION DECISION ERROR DIALOG</span>
            </div>

            <p className="text-xs text-white/50 leading-relaxed uppercase font-mono">
              Provide feedback warning for participant <strong className="text-white text-bold">{selectedMemberForReject.name}</strong> list. This information will trigger corrective action requests back on the squad management page.
            </p>

            <div>
              <label className="block text-[9.5px] text-white/40 uppercase font-black tracking-widest mb-2">Report feedback (Reason for rejection)</label>
              <textarea
                placeholder="e.g. Blurry photo ID card upload; Student matriculation profile incorrect, or passport photograph does not exist."
                value={rejectionFeedback}
                onChange={(e) => setRejectionFeedback(e.target.value)}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-red-500/50"
              />
            </div>

            <div className="flex gap-3 pt-2 text-xs">
              <button
                onClick={() => handleVerifyMember(
                  selectedMemberForReject.teamId, 
                  selectedMemberForReject.memberId, 
                  selectedMemberForReject.type, 
                  'Rejected', 
                  rejectionFeedback.trim() || 'Accreditation details does not verify.'
                )}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3.5 font-bold uppercase rounded-xl transition-all cursor-pointer"
              >
                SUBMIT REJECTION
              </button>
              <button
                onClick={() => {
                  setSelectedMemberForReject(null);
                  setRejectionFeedback('');
                }}
                className="px-5 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase transition-all cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BADGE PRINT PREVIEW MODAL */}
      {previewMember && (() => {
        const teamMeta = TEAMS.find(t => t.id === previewMember.teamId) || TEAMS[0];
        const teamColor = getTeamColor(previewMember.teamId);
        const { member, type } = previewMember;
        const isPlayer = type === 'player';
        
        // Match Serial
        const memberSerial = isPlayer 
          ? (member.matricNumber ? member.matricNumber.split('/').pop() : '000') 
          : 'STAFF';
        const accId = `FCL26-${teamMeta.id.toUpperCase()}-${isPlayer ? 'PL' : 'CO'}-${memberSerial}`;
        
        const mainRole = isPlayer ? 'PLAYER' : 'OFFICIAL';
        const specificRole = isPlayer 
          ? (POSITION_LABELS[member.position] || member.position).toUpperCase()
          : (member.role || 'COACH OFFICIAL').toUpperCase();

        return (
          <div className="fixed inset-0 bg-[#000]/85 backdrop-blur-md z-[99] flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4.5 mb-6 text-xs text-white">
              <div>
                <p className="font-extrabold text-glow">Accreditation Card Builder</p>
                <p className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wider font-mono">Status: Verified Approved</p>
              </div>
              <button 
                onClick={() => setPreviewMember(null)}
                className="p-1 px-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all font-black uppercase text-[10px] tracking-widest cursor-pointer"
              >
                CLOSE
              </button>
            </div>

            {/* --- ACTUAL BADGE CARD CONTAINER FOR RENDERING --- */}
            <div className="shadow-2xl scale-100 hover:scale-102 transition-transform duration-500 select-none pb-2">
              <div 
                id={`accreditation-card-print-${member.id}`}
                className="relative w-72 h-[456px] rounded-2xl overflow-hidden bg-[#070A1A] border flex flex-col justify-between shadow-2xl transition-all duration-300"
                style={{
                  boxShadow: `0 24px 48px -12px rgba(0, 0, 0, 0.95), 0 0 35px -5px ${teamColor.glow}, inset 0 1px 2px rgba(255, 255, 255, 0.15), inset 0 -3px 12px rgba(0, 0, 0, 0.8)`,
                  borderColor: `${teamColor.primary}55`
                }}
              >
                {/* Specular highlights simulated plastic laminate sheet */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.15] pointer-events-none z-30 mix-blend-overlay" />
                <div className="absolute inset-1.5 rounded-xl border border-white/[0.04] pointer-events-none z-20" />
                
                {/* Lanyard punced slot indicator */}
                <div className="pt-4 px-5 relative z-10 flex flex-col items-center">
                  <div className="w-12 h-3 rounded-full bg-[#03050B] border border-white/15 mb-2.5 shadow-inner flex items-center justify-center">
                    <div className="w-6 h-0.5 bg-black" />
                  </div>

                  {/* Header bar branding */}
                  <div className="w-full flex justify-between items-center border-b border-white/10 pb-2 relative">
                    <div className="flex items-center space-x-1.5">
                      <img src={APP_LOGO} className="w-6 h-6 object-contain" alt="" />
                      <div>
                        <span className="font-display font-black italic uppercase text-white text-[12px] leading-none tracking-tighter block text-glow">FCL 2026</span>
                        <span className="text-[5.5px] font-black tracking-widest uppercase text-white/35 block font-sans">Organizing Commission</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-mono text-[7px] font-black text-primary leading-none tracking-widest">SEASON 2026</span>
                      <span className="block text-[5.5px] text-white/30 uppercase tracking-widest mt-0.5">Verified Accreditation</span>
                    </div>
                  </div>
                </div>

                {/* Team Sidebar Glowing Strips */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" style={{ backgroundColor: teamColor.primary }} />
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary" style={{ backgroundColor: teamColor.primary }} />

                {/* Participant details row */}
                <div className="px-6 flex flex-col items-center relative z-10 space-y-3 pb-4">
                  {/* Avatar framing in laminated sports visual */}
                  <div className="relative">
                    {/* Glowing outer box */}
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr opacity-75 blur-sm" style={{ background: `linear-gradient(45deg, ${teamColor.primary}, transparent)` }} />
                    <div className="w-24 h-24 rounded-xl border border-white/10 overflow-hidden relative z-10 bg-[#0c102a]">
                      <img 
                        src={member.passportPath || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80"} 
                        className="w-full h-full object-cover" 
                        alt="" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80";
                        }}
                      />
                    </div>
                  </div>

                  {/* Member Name */}
                  <div className="text-center">
                    <h3 className="text-base font-display font-black italic uppercase tracking-tight text-white leading-tight">{member.fullName}</h3>
                    <p className="text-[10px] font-bold text-primary tracking-widest uppercase inline-block mt-1 font-mono">{teamMeta.name}</p>
                  </div>

                  {/* Position Role badge */}
                  <div className="w-full grid grid-cols-2 gap-3.5 border border-white/5 bg-white/[0.015] p-2.5 rounded-xl text-center relative overflow-hidden">
                    <div>
                      <span className="block text-[6.5px] text-white/30 uppercase font-mono tracking-widest font-black leading-none">ROLE GROUP</span>
                      <span className="block text-[10.5px] font-black text-white uppercase tracking-tight mt-1 truncate leading-none">{mainRole}</span>
                    </div>
                    <div className="border-l border-white/5">
                      <span className="block text-[6.5px] text-white/30 uppercase font-mono tracking-widest font-black leading-none">CHALLENGED</span>
                      <span className="block text-[10.5px] font-black text-[#00E5FF] uppercase tracking-tight mt-1 truncate leading-none" style={{ color: teamColor.primary }}>{specificRole}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Stripe with credentials serial and QR Code */}
                <div className="bg-[#03050B] border-t border-white/5 px-5 py-3.5 flex items-center justify-between relative z-10">
                  <div className="text-left space-y-1">
                    <span className="text-[6.5px] text-white/30 uppercase font-mono tracking-widest block font-bold">ACCREDITATION CODE</span>
                    <span className="font-mono text-[9px] font-black text-[#00E5FF] block tracking-normal uppercase" style={{ color: teamColor.primary }}>{accId}</span>

                    {/* Verified badge */}
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full inline-block bg-[#00E676] animate-pulse" />
                      <span className="text-[7.5px] font-mono tracking-widest font-black text-[#00E676] uppercase">VERIFIED ACTIVE</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="relative w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-yellow-300 border border-white/10 opacity-75 shadow-inner overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 flex items-center justify-center text-white/30">
                        <span className="font-mono text-[5px] tracking-tighter uppercase font-black text-slate-950 leading-none">SECURE</span>
                      </div>
                    </div>
                    <StaticQR code={`fcl://verify/2026/${accId}`} />
                  </div>
                </div>

              </div>
            </div>

            {/* Print control */}
            <button
              onClick={() => downloadAccreditationCard(member, previewMember.teamId, previewMember.type)}
              className="mt-6 w-full max-w-xs bg-primary hover:bg-primary-hover text-dark py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_4px_25px_rgba(0,229,255,0.4)] flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Download size={14} />
              <span>DOWNLOAD VERIFICATION CARD</span>
            </button>
          </div>
        );
      })()}

    </div>
  );
}
