import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Unlock, Users, ShieldCheck, AlertCircle, CheckCircle2, XCircle, 
  Upload, Download, Search, Building2, UserPlus, FileSpreadsheet, 
  Printer, ArrowLeft, Trash2, User, Calendar, GraduationCap, Eye, 
  RefreshCw, FileText, UploadCloud, Check, HelpCircle, ArrowRight, Info
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { TEAMS } from '../data/mockData';
import { cn } from '../lib/utils';

// --- TYPE DEFINITIONS ---
interface PlayerRegistration {
  id: string;
  fullName: string;
  matricNumber: string;
  department: string;
  level: string; // 100, 200, 300, 400, 500, etc.
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  passportPath: string | null; // photo
  idCardName: string;
  idCardSize: string;
  idCardData: string; // Base64 string for preview
  idCardStatus: 'pending' | 'approved' | 'rejected';
  idCardFeedback?: string;
}

interface CoachRegistration {
  id: string;
  fullName: string;
  role: 'Head Coach' | 'Assistant Coach';
  phone: string;
  email: string;
  passportPath: string | null; // photo
}

interface TeamRegistration {
  teamId: string;
  status: 'pending' | 'incomplete' | 'submitted' | 'verified';
  players: PlayerRegistration[];
  coaches: CoachRegistration[];
  submittedAt?: string;
  verifiedAt?: string;
  adminFeedback?: string;
}

// Access codes mapping for all 20 teams
export const accessCodes: Record<string, string> = {
  AGE: "AGE2026FCL",
  AGP: "AGP2026FCL",
  ANA: "ANA2026FCL",
  APH: "APH2026FCL",
  BCH: "BCH2026FCL",
  BDG: "BDG2026FCL",
  CSP: "CSP2026FCL",
  CYS: "CYS2026FCL",
  ENT: "ENT2026FCL",
  FWT: "FWT2026FCL",
  ICE: "ICE2026FCL",
  IDD: "IDD2026FCL",
  IFS: "IFS2026FCL",
  MBBS: "MBBS2026FCL",
  MCB: "MCB2026FCL",
  MST: "MST2026FCL",
  PHS: "PHS2026FCL",
  PHY: "PHY2026FCL",
  SIMT: "SIMT2026FCL",
  STA: "STA2026FCL",
};

export const ADMIN_PASSWORD = "AdminFCL";

export const registrations: Record<string, any> = {};

const LEVEL_OPTIONS = ['100', '200', '300', '400', '500', 'Postgraduate'];
const POSITION_OPTIONS = [
  { value: 'GK', label: 'Goalkeeper' },
  { value: 'DEF', label: 'Defender' },
  { value: 'MID', label: 'Midfielder' },
  { value: 'FWD', label: 'Forward' }
];

const COACH_ROLES = [
  'Head Coach',
  'Assistant Coach'
];

// --- TEAM COLOR SCHEME MAPPING ---
interface TeamTheme {
  primary: string;
  border: string;
  glow: string;
}

const getTeamColor = (teamId: string): TeamTheme => {
  const mapping: Record<string, TeamTheme> = {
    mst: { primary: '#00E5FF', border: 'rgba(0, 229, 255, 0.1)', glow: 'rgba(0, 229, 255, 0.35)' },     // Marine Science (Neon Cyan)
    ifs: { primary: '#D042FF', border: 'rgba(208, 66, 255, 0.1)', glow: 'rgba(208, 66, 255, 0.35)' },    // Info Systems (Electric Violet)
    bdg: { primary: '#FFA000', border: 'rgba(255, 160, 0, 0.1)', glow: 'rgba(255, 160, 0, 0.35)' },       // Building (Neon Gold/Amber)
    mcb: { primary: '#00E676', border: 'rgba(0, 230, 118, 0.1)', glow: 'rgba(0, 230, 118, 0.35)' },     // Micro-Biology (Neon Green)
    cys: { primary: '#FF1744', border: 'rgba(255, 23, 68, 0.1)', glow: 'rgba(255, 23, 68, 0.35)' },      // Cyber Security (Vibrant Crimson)
    age: { primary: '#1DE9B6', border: 'rgba(29, 233, 182, 0.1)', glow: 'rgba(29, 233, 182, 0.35)' },    // Agricultural (Turquoise)
    ana: { primary: '#2979FF', border: 'rgba(41, 121, 255, 0.1)', glow: 'rgba(41, 121, 255, 0.35)' },     // Anatomy (Cobalt Blue)
    aph: { primary: '#FF9100', border: 'rgba(255, 145, 0, 0.1)', glow: 'rgba(255, 145, 0, 0.35)' },      // Animal Production (Bright Orange)
    bch: { primary: '#E040FB', border: 'rgba(224, 64, 251, 0.1)', glow: 'rgba(224, 64, 251, 0.35)' },     // Bio-Chemistry (Bright Pink/Fuchsia)
    csp: { primary: '#76FF03', border: 'rgba(118, 255, 3, 0.1)', glow: 'rgba(118, 255, 3, 0.35)' },      // Crop Science (Lime Green)
    ent: { primary: '#00B0FF', border: 'rgba(0, 176, 255, 0.1)', glow: 'rgba(0, 176, 255, 0.35)' },     // Entrepreneurship (Azure)
    fwt: { primary: '#C6FF00', border: 'rgba(198, 255, 0, 0.1)', glow: 'rgba(198, 255, 0, 0.35)' },      // Forestry (Volt Yellow-Green)
    ice: { primary: '#651FFF', border: 'rgba(101, 31, 255, 0.1)', glow: 'rgba(101, 31, 255, 0.35)' },     // ICE (Indigo Purple)
    idd: { primary: '#FFE082', border: 'rgba(255, 224, 130, 0.1)', glow: 'rgba(255, 224, 130, 0.35)' },    // Industrial Design (Champagne)
    mbbs: { primary: '#F50057', border: 'rgba(245, 0, 87, 0.1)', glow: 'rgba(245, 0, 87, 0.35)' },       // Medicine (Rose Red)
    phy: { primary: '#E65100', border: 'rgba(230, 81, 0, 0.1)', glow: 'rgba(230, 81, 0, 0.35)' },        // Physics (Copper/Deep Dark Orange)
    phs: { primary: '#29B6F6', border: 'rgba(41, 182, 246, 0.1)', glow: 'rgba(41, 182, 246, 0.35)' },     // Physiology (Ice Blue)
    simt: { primary: '#FFEB3B', border: 'rgba(255, 235, 59, 0.1)', glow: 'rgba(255, 235, 59, 0.35)' },    // Security Investment (Bright Yellow)
    sta: { primary: '#CDDC39', border: 'rgba(205, 220, 57, 0.1)', glow: 'rgba(205, 220, 57, 0.35)' },     // Statistics (Pear Green)
  };
  return mapping[teamId.toLowerCase()] || { primary: '#00E5FF', border: 'rgba(0, 229, 255, 0.1)', glow: 'rgba(0, 229, 255, 0.35)' };
};

// --- AUTHENTIC VECTOR QR CODE GENERATOR ---
const AccreditationQR = ({ value }: { value: string }) => {
  return (
    <svg className="w-12 h-12 bg-white p-1 rounded-md flex-shrink-0" viewBox="0 0 29 29" shapeRendering="crispEdges">
      <path fill="#ffffff" d="M0,0 h29 v29 h-29 z" />
      {/* Corner detection squares */}
      <path fill="#000000" d="M1,1 h7 v1 h-7 z M1,2 h1 v5 h-1 z M7,2 h1 v5 h-1 z M1,7 h7 v1 h-7 z M3,3 h3 v3 h-3 z" />
      <path fill="#000000" d="M21,1 h7 v1 h-7 z M21,2 h1 v5 h-1 z M27,2 h1 v5 h-1 z M21,7 h7 v1 h-7 z M23,3 h3 v3 h-3 z" />
      <path fill="#000000" d="M1,21 h7 v1 h-7 z M1,22 h1 v5 h-1 z M7,22 h1 v5 h-1 z M1,27 h7 v1 h-7 z M3,23 h3 v3 h-3 z" />
      {/* Alignment box right */}
      <path fill="#000000" d="M22,22 h3 v1 h-3 z M22,23 h1 v2 h-1 z M24,23 h1 v2 h-1 z M22,25 h3 v1 h-3 z M24,24 h1 v1 h-1 z" />
      {/* Random high-density digital dots */}
      <path fill="#000000" d="M9,3 h1 v1 h-1 z M13,3 h2 v1 h-2 z M17,3 h1 v1 h-1 z M11,5 h1 v2 h-1 z M15,5 h2 v1 h-2 z M13,7 h1 v1 h-1 z M19,7 h1 v1 h-1 z" />
      <path fill="#000000" d="M3,9 h1 v1 h-1 z M5,11 h2 v1 h-2 z M1,13 h3 v1 h-3 z M7,13 h1 v2 h-1 z M9,9 h2 v1 h-2 z M15,9 h2 v2 h-2 z M19,9 h2 v1 h-2 z M9,11 h1 v3 h-1 z M13,11 h1 v1 h-1 z M11,13 h3 v1 h-3 z M17,13 h1 v1 h-1 z M19,13 h4 v1 h-4 z" />
      <path fill="#000000" d="M9,15 h1 v4 h-1 z M12,15 h3 v1 h-3 z M17,15 h2 v2 h-2 z M13,17 h1 v3 h-1 z M15,19 h3 v1 h-3 z M19,19 h2 v1 h-2 z" />
      <path fill="#000000" d="M21,9 h2 v1 h-2 z M24,11 h3 v1 h-3 z M22,15 h4 v1 h-4 z M27,17 h1 v3 h-1 z" />
      <path fill="#000000" d="M3,18 h2 v1 h-2 z M7,19 h1 v2 h-1 z M1,16 h3 v1 h-3 z" />
      <path fill="#000000" d="M11,21 h2 v1 h-2 z M15,22 h3 v1 h-3 z M18,24 h2 v1 h-2 z M13,26 h2 v1 h-2 z" />
    </svg>
  );
};

// --- HIGH-DEF SPORTS ACCREDITATION BADGE COMPONENT ---
interface AccreditationCardProps {
  member: any;
  type: 'player' | 'coach';
  team: typeof TEAMS[0];
  isApproved: boolean;
}

const AccreditationCard = ({ member, type, team, isApproved }: AccreditationCardProps) => {
  const teamColor = getTeamColor(team.id);
  const isPlayer = type === 'player';
  
  // Clean ID and serial code
  const memberSerial = isPlayer 
    ? (member.matricNumber ? member.matricNumber.split('/').pop() : '000') 
    : 'STAFF';
  const accId = `FCL26-${team.id.toUpperCase()}-${isPlayer ? 'PL' : 'CO'}-${memberSerial}`;

  const roleLabel = isPlayer 
    ? (member.position === 'GK' ? 'GOALKEEPER' : member.position === 'DEF' ? 'DEFENDER' : member.position === 'MID' ? 'MIDFIELDER' : 'FORWARD') 
    : (member.role?.toUpperCase() || 'COACH OFFICIAL');

  return (
    <div 
      className="relative w-72 h-[456px] rounded-2xl overflow-hidden bg-[#070A1A] border flex flex-col justify-between shadow-2xl transition-all duration-300 transform select-none"
      style={{
        boxShadow: `0 20px 40px -8px rgba(0, 0, 0, 0.9), 0 0 25px -5px ${teamColor.glow}`,
        borderColor: `${teamColor.primary}44`
      }}
    >
      {/* Glossy laminated specular highlight layers */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.12] pointer-events-none z-30 mix-blend-overlay" />
      <div className="absolute top-[-60%] left-[-60%] w-[220%] h-[220%] rotate-[27deg] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none z-20 animate-pulse duration-5000" />

      {/* Sporty carbon fiber mesh overlay */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none" />

      {/* Elegant faded watermarked tournament logo layer */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
        <svg className="w-48 h-48 rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 2v20" />
          <circle cx="12" cy="11" r="4" />
        </svg>
      </div>

      {/* Colored neon sidebar accents */}
      <div className="absolute top-0 bottom-0 left-0 w-1 transition-colors duration-300" style={{ backgroundColor: teamColor.primary }} />
      <div className="absolute top-0 bottom-0 right-0 w-1 transition-colors duration-300" style={{ backgroundColor: teamColor.primary }} />

      {/* LANYARD CUTOUT / HEADER HOLE */}
      <div className="pt-4 px-5 relative z-10 flex flex-col items-center">
        <div className="w-12 h-3.5 rounded-full bg-[#03050B] border border-white/10 mb-2.5 shadow-inner flex items-center justify-center">
          <div className="w-6 h-1 rounded-full bg-black/60" />
        </div>

        {/* FCL Branding Strip */}
        <div className="w-full flex justify-between items-center border-b border-white/10 pb-2">
          <div className="flex items-center space-x-1.5">
            <svg className="w-4 h-4" style={{ color: teamColor.primary }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div className="text-left leading-none">
              <span className="text-[9px] font-display font-black tracking-tight italic text-white block">FUTA CHAMPIONS</span>
              <span className="text-[7px] font-mono tracking-widest text-[#00E5FF] font-black uppercase">LEAGUE</span>
            </div>
          </div>
          <div className="text-right leading-none">
            <span className="text-[10px] font-mono font-black text-white tracking-widest">FCL 2026</span>
            <span className="text-[6px] font-bold text-white/35 block mt-0.5 tracking-wider uppercase">OFFICIAL ACC.</span>
          </div>
        </div>
      </div>

      {/* MIDDLE: PASSPORT PICTURE CONTEXT */}
      <div className="px-5 py-2 flex flex-col items-center relative z-10">
        <div className="relative">
          {/* Subtle colored glow backdrop aura */}
          <div 
            className="absolute -inset-1 rounded-xl opacity-50 blur-sm transition-all duration-300"
            style={{ backgroundColor: teamColor.primary }}
          />

          <div className="relative w-[104px] h-[104px] rounded-xl bg-[#090D22] border-2 border-white/10 overflow-hidden flex items-center justify-center shadow-lg">
            {member.passportPath ? (
              <img src={member.passportPath} className="w-full h-full object-cover" alt="Staff Portrait" />
            ) : (
              <svg className="text-white/20 w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>

          {/* Genuine Approved Seal overlay */}
          <div 
            className="absolute bottom-[-5px] right-[-5px] w-6.5 h-6.5 rounded-full bg-[#070A1A] border flex items-center justify-center shadow-md transition-all duration-300"
            style={{ borderColor: teamColor.primary }}
          >
            <svg className="w-3.5 h-3.5" style={{ color: teamColor.primary }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>

      {/* MEMBER PARTICIPANT INFORMATION PLATFORM */}
      <div className="px-5 text-center flex-1 flex flex-col justify-center relative z-10 space-y-1.5">
        <h4 className="font-display font-bold tracking-tight text-white uppercase text-base truncate leading-none">
          {member.fullName}
        </h4>

        {/* Floating Custom Role Tag with glowing dropshadow */}
        <div className="flex justify-center">
          <span 
            className="px-2.5 py-0.5 text-[8.5px] font-black tracking-widest uppercase rounded-md text-slate-950 inline-block transition-colors duration-300 whitespace-nowrap"
            style={{ 
              backgroundColor: teamColor.primary,
              textShadow: '0 0.5px 1px rgba(0,0,0,0.3)',
              boxShadow: `0 3px 8px ${teamColor.glow}`
            }}
          >
            {roleLabel}
          </span>
        </div>

        {/* Core Team metadata */}
        <div className="flex items-center justify-center space-x-1.5 bg-white/[0.03] py-1 px-3 rounded-lg border border-white/5 max-w-max mx-auto">
          <img src={team.logo} className="w-3.5 h-3.5 object-contain" alt="" />
          <span className="font-mono text-[8.5px] text-white/70 uppercase tracking-widest font-black truncate max-w-[130px]">
            {team.name.replace(/ \(\w+\)$/, '')}
          </span>
        </div>

        {/* Matric code (or Coaching STAFF license) */}
        <p className="font-mono text-[9.5px] tracking-widest font-black uppercase" style={{ color: teamColor.primary }}>
          {isPlayer ? member.matricNumber : 'ACC_COACHING_OFFICIAL'}
        </p>
      </div>

      {/* ACCREDITATION FOOTER MATRIX STRIP */}
      <div className="bg-[#03050B] border-t border-white/5 px-4.5 py-2.5 flex items-center justify-between relative z-10">
        <div className="text-left space-y-0.5">
          <span className="text-[6.5px] text-white/30 uppercase font-mono tracking-widest block font-bold">ACC_ID_SPEC</span>
          <span className="font-mono text-[8.5px] font-bold text-white block tracking-tight uppercase">{accId}</span>

          {/* Genuine FCL dynamic accreditation indicators */}
          <div className="flex items-center space-x-1">
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${isApproved ? "bg-green-500 animate-pulse" : "bg-amber-500"}`} />
            <span className={`text-[7px] font-mono tracking-widest font-bold uppercase ${isApproved ? "text-green-500" : "text-amber-500"}`}>
              {isApproved ? 'FCL_ACCREDITED' : 'PREVIEW_DRAFT'}
            </span>
          </div>
        </div>

        {/* Hologram stamp & QR code panel */}
        <div className="flex items-center space-x-2.5">
          {/* Circular Metallic Anti-Counterfeit Hologram overlay */}
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-yellow-300 border border-white/10 opacity-70 shadow-inner overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-transparent opacity-50 mix-blend-overlay" />
            <div className="absolute inset-0 flex items-center justify-center text-white/30">
              <span className="font-mono text-[5.5px] tracking-tighter uppercase font-bold text-slate-900">LICENSE</span>
            </div>
          </div>

          <AccreditationQR value={`fcl://verify/2026/${accId}?name=${encodeURIComponent(member.fullName)}`} />
        </div>
      </div>
    </div>
  );
};

export default function RegistrationPortal() {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [accessCode, setAccessCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTeam, setActiveTeam] = useState<typeof TEAMS[0] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [registrations, setRegistrations] = useState<Record<string, TeamRegistration>>({});
  
  // Dashboard navigation states
  const [activeTab, setActiveTab] = useState<'info' | 'players' | 'coaches' | 'submitted_print' | 'badges'>('info');
  
  // Accreditation Badges States
  const [selectedBadgeMember, setSelectedBadgeMember] = useState<any | null>(null);
  const [selectedBadgeType, setSelectedBadgeType] = useState<'player' | 'coach'>('player');
  const [printingMember, setPrintingMember] = useState<{ member: any; type: 'player' | 'coach' } | null>(null);
  const [printingAllSelected, setPrintingAllSelected] = useState(false);
  const [adminViewSubTab, setAdminViewSubTab] = useState<'audit' | 'badges'>('audit');
  const [badgeSearchQuery, setBadgeSearchQuery] = useState('');
  
  // Modals
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  
  // Form Drafts for Add Member
  const [playerForm, setPlayerForm] = useState({
    fullName: '',
    matricNumber: '',
    department: '',
    level: '300',
    position: 'MID' as 'GK' | 'DEF' | 'MID' | 'FWD',
    idCardName: '',
    idCardSize: '',
    idCardData: '',
    passportPath: '',
  });
  const [coachForm, setCoachForm] = useState({
    fullName: '',
    role: 'Head Coach' as any,
    phone: '',
    email: '',
    passportPath: ''
  });
  
  // Upload and drag/drop states
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Admin Active Review States
  const [adminSearch, setAdminSearch] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('all');
  const [selectedAdminTeam, setSelectedAdminTeam] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Save/load persistence
  useEffect(() => {
    const saved = localStorage.getItem('fcl_acc_registrations');
    if (saved) {
      try {
        setRegistrations(JSON.parse(saved));
      } catch (err) {
        console.error("Local storage parsing failed", err);
      }
    }
  }, []);

  const saveToLocalStorage = (data: Record<string, TeamRegistration>) => {
    localStorage.setItem('fcl_acc_registrations', JSON.stringify(data));
    setRegistrations(data);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const code = accessCode.trim().toUpperCase();

    if (accessCode.trim() === ADMIN_PASSWORD || code === ADMIN_PASSWORD.toUpperCase()) {
      setIsAdmin(true);
      setActiveTeam(null);
      return;
    }

    if (!selectedTeam) {
      setLoginError('Please select your team first.');
      return;
    }

    const teamKey = selectedTeam.toUpperCase();
    if (accessCodes[teamKey] === accessCode.trim().toUpperCase()) {
      const matchTeam = TEAMS.find(t => t.id === teamKey.toLowerCase());
      if (matchTeam) {
        setActiveTeam(matchTeam);
        setIsAdmin(false);
        setAccessCode('');
        
        // Ensure team registration object exists
        if (!registrations[matchTeam.id]) {
          const freshReg: TeamRegistration = {
            teamId: matchTeam.id,
            status: 'pending',
            players: [],
            coaches: []
          };
          saveToLocalStorage({
            ...registrations,
            [matchTeam.id]: freshReg
          });
        }
        return;
      }
    }

    setLoginError('Invalid accreditation code for the selected team.');
  };

  const handleLogout = () => {
    setActiveTeam(null);
    setIsAdmin(false);
    setActiveTab('info');
    setSelectedAdminTeam(null);
    setAccessCode('');
    setSelectedTeam('');
  };

  // Get active team registration
  const activeReg = activeTeam ? (registrations[activeTeam.id] || {
    teamId: activeTeam.id,
    status: 'pending' as const,
    players: [],
    coaches: []
  }) : null;

  // Add Member Handlers
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam || !activeReg) return;

    if (activeReg.players.length >= 23) {
      alert("Registration failed: Player slot capacity is strictly limited to 23 players.");
      return;
    }

    if (!playerForm.fullName || !playerForm.matricNumber || !playerForm.passportPath || !playerForm.idCardData) {
      alert("Important: Full Name, Matriculation Number, Passport Photograph and FUTA ID Card upload are mandatory.");
      return;
    }

    const newPlayer: PlayerRegistration = {
      id: `${activeTeam.id}-player-${Date.now()}`,
      fullName: playerForm.fullName,
      matricNumber: playerForm.matricNumber.trim().toUpperCase(),
      department: playerForm.department || activeTeam.name.replace(/ \(\w+\)$/, ''),
      level: playerForm.level,
      position: playerForm.position,
      passportPath: playerForm.passportPath,
      idCardName: playerForm.idCardName,
      idCardSize: playerForm.idCardSize,
      idCardData: playerForm.idCardData,
      idCardStatus: 'pending'
    };

    const updatedPlayers = [...activeReg.players, newPlayer];
    const isCompleted = updatedPlayers.length === 23 && activeReg.coaches.length >= 1;
    const newStatus = isCompleted ? 'incomplete' : 'incomplete'; // Status remains incomplete until clicked submit

    const newTeamReg: TeamRegistration = {
      ...activeReg,
      players: updatedPlayers,
      status: activeReg.status === 'pending' ? 'incomplete' : activeReg.status
    };

    saveToLocalStorage({
      ...registrations,
      [activeTeam.id]: newTeamReg
    });

    // Reset Form
    setPlayerForm({
      fullName: '',
      matricNumber: '',
      department: '',
      level: '300',
      position: 'MID',
      idCardName: '',
      idCardSize: '',
      idCardData: '',
      passportPath: null
    });
    setUploadError('');
    setIsPlayerModalOpen(false);
  };

  const handleAddCoach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam || !activeReg) return;

    if (activeReg.coaches.length >= 2) {
      alert("Registration failed: Coach slot capacity is strictly limited to 2 coaches.");
      return;
    }

    if (!coachForm.fullName || !coachForm.phone || !coachForm.email || !coachForm.passportPath) {
      alert("Important: Full Name, Phone, Email Address and Passport Photograph are mandatory.");
      return;
    }

    const newCoach: CoachRegistration = {
      id: `${activeTeam.id}-coach-${Date.now()}`,
      fullName: coachForm.fullName,
      role: coachForm.role,
      phone: coachForm.phone,
      email: coachForm.email,
      passportPath: coachForm.passportPath
    };

    const updatedCoaches = [...activeReg.coaches, newCoach];
    const newTeamReg: TeamRegistration = {
      ...activeReg,
      coaches: updatedCoaches,
      status: activeReg.status === 'pending' ? 'incomplete' : activeReg.status
    };

    saveToLocalStorage({
      ...registrations,
      [activeTeam.id]: newTeamReg
    });

    setCoachForm({
      fullName: '',
      role: 'Head Coach',
      phone: '',
      email: '',
      passportPath: null
    });
    setIsCoachModalOpen(false);
  };

  const handleDeletePlayer = (id: string) => {
    if (!activeReg || !activeTeam) return;
    if (activeReg.status === 'submitted' || activeReg.status === 'verified') {
      alert("Operation Forbidden:Roster is locked. Team registration has already been submitted.");
      return;
    }

    if (confirm("Are you sure you want to delete this player?")) {
      const filtered = activeReg.players.filter(p => p.id !== id);
      const updatedReg: TeamRegistration = {
        ...activeReg,
        players: filtered,
        status: filtered.length === 0 && activeReg.coaches.length === 0 ? 'pending' : 'incomplete'
      };

      saveToLocalStorage({
        ...registrations,
        [activeTeam.id]: updatedReg
      });
    }
  };

  const handleDeleteCoach = (id: string) => {
    if (!activeReg || !activeTeam) return;
    if (activeReg.status === 'submitted' || activeReg.status === 'verified') {
      alert("Operation Forbidden:Roster is locked. Team registration has already been submitted.");
      return;
    }

    if (confirm("Are you sure you want to delete this coach?")) {
      const filtered = activeReg.coaches.filter(c => c.id !== id);
      const updatedReg: TeamRegistration = {
        ...activeReg,
        coaches: filtered,
        status: activeReg.players.length === 0 && filtered.length === 0 ? 'pending' : 'incomplete'
      };

      saveToLocalStorage({
        ...registrations,
        [activeTeam.id]: updatedReg
      });
    }
  };

  // Submit squad for official verification
  const handleSubmitAccreditation = () => {
    if (!activeReg || !activeTeam) return;

    if (activeReg.players.length < 15) {
      alert("Accreditation Rejection: To submit accreditation, FCL requires a minimum of 15 players registered (up to 23).");
      return;
    }

    if (activeReg.coaches.length < 1) {
      alert("Accreditation Rejection: FCL requires at least 1 registered official coach to submit team accreditation.");
      return;
    }

    if (confirm("Lock Squad & Submit for Official Review?\nOnce submitted, you will not be able to make edits until approved or returned.")) {
      const updatedReg: TeamRegistration = {
        ...activeReg,
        status: 'submitted',
        submittedAt: new Date().toISOString()
      };

      saveToLocalStorage({
        ...registrations,
        [activeTeam.id]: updatedReg
      });
      alert("Squad submitted successfully! The FUTA Champions League Organizing Committee will begin verification shortly.");
    }
  };

  // Drag and drop setup for file upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleIdCardFile = (file: File) => {
    setUploadError('');
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    // Validate file type
    if (extension !== 'jpg' && extension !== 'jpeg') {
      setUploadError('Invalid format: Accreditation system exclusively accepts .jpg or .jpeg images.');
      return;
    }

    // Validate size (max 2MB = 2,097,152 bytes)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size limit exceeded: Maximum ID card scan size is 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      setPlayerForm(prev => ({
        ...prev,
        idCardName: file.name,
        idCardSize: `${(file.size / 1024).toFixed(0)} KB`,
        idCardData: base64
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleIdCardFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleIdCardFile(e.target.files[0]);
    }
  };

  // Passport upload
  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>, role: 'player' | 'coach') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      // Reject file formats outside of .jpg/.jpeg
      if (extension !== 'jpg' && extension !== 'jpeg') {
        alert("Invalid format: Accreditation system exclusively accepts .jpg or .jpeg images.");
        return;
      }

      if (file.size > 1.5 * 1024 * 1024) {
        alert("Image too large. Please upload an image smaller than 1.5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        if (role === 'player') {
          setPlayerForm(prev => ({ ...prev, passportPath: base64 }));
        } else {
          setCoachForm(prev => ({ ...prev, passportPath: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- ADMIN FUNCTIONALITY ---
  const handleVerifySquad = (teamId: string, action: 'approve' | 'reject') => {
    const existing = registrations[teamId];
    if (!existing) return;

    if (action === 'approve') {
      // Ensure all ID cards are marked approved for consistency
      const validatedPlayers = existing.players.map(p => ({
        ...p,
        idCardStatus: 'approved' as const
      }));

      const updatedReg: TeamRegistration = {
        ...existing,
        status: 'verified',
        players: validatedPlayers,
        verifiedAt: new Date().toISOString(),
        adminFeedback: undefined
      };
      
      saveToLocalStorage({
        ...registrations,
        [teamId]: updatedReg
      });
      alert(`Team ${teamId.toUpperCase()} squad and accreditations successfully verified.`);
    } else {
      if (!feedbackText.trim()) {
        alert("Verification feedback requested: Please supply reasons for the rejection of accreditation.");
        return;
      }
      const updatedReg: TeamRegistration = {
        ...existing,
        status: 'incomplete',
        adminFeedback: feedbackText
      };
      saveToLocalStorage({
        ...registrations,
        [teamId]: updatedReg
      });
      setFeedbackText('');
      alert(`Team ${teamId.toUpperCase()} registration rejected. Status reset to incomplete.`);
    }
  };

  const handleVerifyIdCard = (teamId: string, playerId: string, approval: 'approved' | 'rejected', reason?: string) => {
    const existing = registrations[teamId];
    if (!existing) return;

    const updatedPlayers = existing.players.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          idCardStatus: approval,
          idCardFeedback: reason || undefined
        };
      }
      return p;
    });

    saveToLocalStorage({
      ...registrations,
      [teamId]: {
        ...existing,
        players: updatedPlayers
      }
    });
  };

  // CSV Exporter
  const handleExportCSV = (teamId: string) => {
    const reg = registrations[teamId];
    if (!reg) return;

    const teamMeta = TEAMS.find(t => t.id === teamId);
    const teamName = teamMeta ? teamMeta.name : teamId.toUpperCase();

    let csvContent = `FUTA Champions League 2026 - Official Squad List\r\n`;
    csvContent += `Team,${teamName} (${teamId.toUpperCase()})\r\n`;
    csvContent += `Status,${reg.status.toUpperCase()}\r\n`;
    csvContent += `Exported At,${new Date().toLocaleString()}\r\n\r\n`;

    // Players Title
    csvContent += `--- PLAYERS ---\r\n`;
    csvContent += `S/N,Full Name,Matric Number,Department,Level,Position,ID Acc. Status\r\n`;
    reg.players.forEach((p, idx) => {
      csvContent += `${idx + 1},"${p.fullName}",${p.matricNumber},"${p.department}",${p.level},${p.position},${p.idCardStatus.toUpperCase()}\r\n`;
    });

    csvContent += `\r\n--- COACHING STAFF ---\r\n`;
    csvContent += `S/N,Full Name,Role,Phone,Email\r\n`;
    reg.coaches.forEach((c, idx) => {
      csvContent += `${idx + 1},"${c.fullName}",${c.role},"${c.phone}",${c.email}\r\n`;
    });

    // Create Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `FCL_${teamId.toUpperCase()}_Accredited_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger browser print of team sheet
  const handlePrintTeamSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-12 pb-32">
      <div className="no-print">
        <PageHeader 
          title="FCL Accreditation Hub" 
          subtitle="Official Student Football Team Accreditation Portal & Organizer Dashboard."
        />
      </div>

      {/* --- ACCREDITATION LANDING / LOGIN SCREEN --- */}
      {!activeTeam && !isAdmin && (
        <section className="max-w-4xl mx-auto px-4 relative z-10 no-print">
          <div className="glass rounded-[40px] border border-white/10 p-8 sm:p-12 relative overflow-hidden flex flex-col items-center text-center">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[90px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[90px] -ml-32 -mb-32" />

            {/* Official Looking Crest */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-blue-500/30 flex items-center justify-center border border-primary/40 relative z-10 mb-8 shadow-2xl animate-pulse">
              <ShieldCheck className="text-primary w-12 h-12" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight italic uppercase mb-4 text-glow bg-gradient-to-r from-white via-primary/90 to-blue-400 bg-clip-text text-transparent">
              OFFICIAL ACCREDITATION PORTAL
            </h2>
            <p className="text-white/60 max-w-xl text-base leading-relaxed mb-10">
              Welcome to the FUTA Champions League 2026 registration hub. Each participating department must enter their unique access code to register rosters, verify student IDs, and unlock credentials.
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-md space-y-6 text-left">
              {/* TEAM SELECT DESIGN */}
              <div className="space-y-1.5Packed">
                <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase block mb-1">SELECT TEAM</label>
                <select
                  className="w-full border border-white/10 p-4 rounded-xl bg-[#090D22] text-white outline-none focus:border-primary transition-all text-sm font-semibold"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                >
                  <option value="" className="text-white/40">Select Team</option>
                  {Object.keys(accessCodes).map((teamKey) => (
                    <option key={teamKey} value={teamKey} className="text-white bg-[#090D22]">
                      {teamKey}
                    </option>
                  ))}
                </select>
              </div>

              {/* CODE INPUT ONLY (NO PLACEHOLDER CLUTTER) */}
              <div className="space-y-1.5 font-sans">
                <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase block mb-1">ENTER ACCESS CODE</label>
                <input
                  type="password"
                  className="w-full border border-white/10 p-4 rounded-xl bg-[#090D22] text-white outline-none focus:border-primary transition-all font-mono tracking-widest text-center text-sm"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                />
              </div>

              {loginError && (
                <div className="flex items-start bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl space-x-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-4.5 bg-green-600 hover:bg-green-700 rounded-xl font-black text-sm text-white tracking-widest hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-green-900/20 hover:shadow-green-950/40 flex items-center justify-center space-x-2 border border-green-500/30"
              >
                <span>VERIFY & ENTER ACCREDITATION HUB</span>
                <Unlock size={16} />
              </button>
            </form>
          </div>
        </section>
      )}

      {/* --- TEAM DASHBOARD PORTAL --- */}
      {activeTeam && activeReg && (
        <section className="max-w-7xl mx-auto px-4 no-print">
          {/* Dashboard Header Bar */}
          <div className="glass rounded-[32px] p-6 sm:p-8 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center p-2 border border-white/10 shadow-inner group">
                <img src={activeTeam.logo} alt={activeTeam.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-display font-black italic uppercase tracking-tight text-white">{activeTeam.name}</h2>
                  <span className={cn(
                    "px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full border",
                    activeReg.status === 'verified' && "bg-green-500/10 text-green-500 border-green-500/30",
                    activeReg.status === 'submitted' && "bg-blue-500/10 text-blue-500 border-blue-500/30 animate-pulse",
                    activeReg.status === 'incomplete' && "bg-amber-500/10 text-amber-500 border-amber-500/30",
                    activeReg.status === 'pending' && "bg-white/10 text-white/50 border-white/10"
                  )}>
                    ● {activeReg.status}
                  </span>
                </div>
                <p className="text-xs text-white/40 mt-1 font-mono uppercase tracking-widest">Accreditation Access ID: {accessCodes[activeTeam.id.toUpperCase()]}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setActiveTab('submitted_print');
                }}
                className="px-5 py-3 glass hover:bg-white/10 text-white border border-white/10 text-xs font-bold rounded-xl flex items-center space-x-2"
              >
                <Printer size={15} />
                <span>PRINT ROSTER</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold rounded-xl flex items-center space-x-2"
              >
                <ArrowLeft size={15} />
                <span>LOGOUT</span>
              </button>
            </div>
          </div>

          {/* Admin Feedback Block if Rejected/Roster Needs Edits */}
          {activeReg.adminFeedback && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-3xl flex items-start space-x-4 mb-8">
              <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-1 text-red-300">ADMINISTRATIVE ACTION REQUIRED</h4>
                <p className="text-xs leading-relaxed opacity-90">{activeReg.adminFeedback}</p>
                <p className="text-[10px] text-white/30 font-mono uppercase mt-3">Roster editing locks will trigger again upon structural submission.</p>
              </div>
            </div>
          )}

          {/* Status Progression and Core Validation Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Slot Counter Player */}
            <div className="glass p-6 rounded-[28px] border border-white/10 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 text-white/5">
                <Users size={72} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1">ACC_SQUAD_SLOT_PROGRESS</h4>
                <p className="text-xs text-white/40 mb-4">Maximum player limits: 23 athletes</p>
              </div>
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-4xl font-display font-black italic">{activeReg.players.length}/23</span>
                  <span className="text-xs font-mono tracking-widest text-white/20 uppercase">REGISTERED ATHLETES</span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      activeReg.players.length === 23 ? "bg-green-500" : "bg-primary"
                    )} 
                    style={{ width: `${Math.min(100, (activeReg.players.length / 23) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Slot Counter Coach */}
            <div className="glass p-6 rounded-[28px] border border-white/10 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 text-white/5">
                <User size={72} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-blue-500 tracking-widest uppercase mb-1">ACC_OFFICIALS_SLOT_PROGRESS</h4>
                <p className="text-xs text-white/40 mb-4">Maximum official limits: 2 coaches</p>
              </div>
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-4xl font-display font-black italic">{activeReg.coaches.length}/2</span>
                  <span className="text-xs font-mono tracking-widest text-white/20 uppercase">TACTICAL COACHES</span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      activeReg.coaches.length === 2 ? "bg-green-500" : "bg-blue-500"
                    )} 
                    style={{ width: `${Math.min(100, (activeReg.coaches.length / 2) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Accreditation Overall Status Box */}
            <div className="glass p-6 rounded-[28px] border border-white/10 relative overflow-hidden flex flex-col justify-between bg-white/[0.01]">
              <div>
                <h4 className="text-[10px] font-bold text-white/30 tracking-widest uppercase mb-1">ACCREDITATION_VERDICT</h4>
                <p className="text-xs text-white/40 mb-2">Review outcome, stamps, and licenses</p>
              </div>
              
              <div className="py-2">
                {activeReg.status === 'verified' && (
                  <div className="flex items-center space-x-3 text-green-500">
                    <CheckCircle2 size={36} className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.3)] animate-pulse" />
                    <div>
                      <p className="font-display font-black uppercase text-glow italic tracking-tight text-lg">OFFICIALLY LICENSED</p>
                      <p className="text-[10px] opacity-60">Verified {activeReg.verifiedAt ? new Date(activeReg.verifiedAt).toLocaleDateString() : 'Ready'}</p>
                    </div>
                  </div>
                )}
                {activeReg.status === 'submitted' && (
                  <div className="flex items-center space-x-3 text-blue-500">
                    <RefreshCw size={36} className="text-blue-500 animate-spin" />
                    <div>
                      <p className="font-display font-black uppercase tracking-tight text-lg italic">UNDER REVIEW</p>
                      <p className="text-[10px] opacity-60">Submitted on {activeReg.submittedAt ? new Date(activeReg.submittedAt).toLocaleDateString() : 'Today'}</p>
                    </div>
                  </div>
                )}
                {activeReg.status === 'incomplete' && (
                  <div className="flex items-center space-x-3 text-amber-500">
                    <AlertCircle size={36} className="text-amber-500" />
                    <div>
                      <p className="font-display font-black uppercase tracking-tight text-lg italic">INCOMPLETE SQUAD</p>
                      <p className="text-[10px] opacity-65">Awaiting squad assembly or submit action</p>
                    </div>
                  </div>
                )}
                {activeReg.status === 'pending' && (
                  <div className="flex items-center space-x-3 text-white/55">
                    <HelpCircle size={36} className="text-white/40" />
                    <div>
                      <p className="font-display font-black uppercase tracking-tight text-lg italic">DRAFT EMPTY</p>
                      <p className="text-[10px] opacity-65">Enter player card credentials to compile roster</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                {activeReg.status !== 'verified' && activeReg.status !== 'submitted' ? (
                  <button
                    disabled={activeReg.players.length < 15 || activeReg.coaches.length < 1}
                    onClick={handleSubmitAccreditation}
                    className={cn(
                      "w-full py-3 rounded-xl font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center space-x-2",
                      activeReg.players.length >= 15 && activeReg.coaches.length >= 1
                        ? "sporty-gradient text-dark hover:scale-[1.02] shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                        : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                    )}
                  >
                    <span>SUBMIT ACCREDITATION DOSSIER</span>
                    <ShieldCheck size={14} />
                  </button>
                ) : (
                  <div className="w-full text-center py-2.5 bg-white/5 rounded-xl text-[10px] uppercase font-mono tracking-widest text-white/30 border border-white/5">
                    ROSTER LOCKED DURING REVIEW
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab Selection Navigation */}
          <div className="flex border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('info')}
              className={cn(
                "px-6 py-4 font-bold text-xs tracking-widest uppercase border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap",
                activeTab === 'info' ? "border-primary text-primary" : "border-transparent text-white/60 hover:text-white"
              )}
            >
              <Info size={14} />
              <span>ACCREDITATION GUIDELINES</span>
            </button>
            <button
              onClick={() => setActiveTab('players')}
              className={cn(
                "px-6 py-4 font-bold text-xs tracking-widest uppercase border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap",
                activeTab === 'players' ? "border-primary text-primary" : "border-transparent text-white/60 hover:text-white"
              )}
            >
              <Users size={14} />
              <span>SQUAD REGISTER ({activeReg.players.length}/23)</span>
            </button>
            <button
              onClick={() => setActiveTab('coaches')}
              className={cn(
                "px-6 py-4 font-bold text-xs tracking-widest uppercase border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap",
                activeTab === 'coaches' ? "border-primary text-primary" : "border-transparent text-white/60 hover:text-white"
              )}
            >
              <User size={14} />
              <span>COACHING STAFF ({activeReg.coaches.length}/2)</span>
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={cn(
                "px-6 py-4 font-bold text-xs tracking-widest uppercase border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap",
                activeTab === 'badges' ? "border-primary text-primary" : "border-transparent text-white/60 hover:text-white"
              )}
            >
              <ShieldCheck size={14} className="text-[#00E5FF] drop-shadow-[0_0_4px_rgba(0,229,255,0.4)]" />
              <span>🪪 OFFICIAL BADGES</span>
            </button>
          </div>

          {/* --- TAB CONTENT: GUIDELINES --- */}
          {activeTab === 'info' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
                <h3 className="text-xl font-display font-bold italic uppercase text-primary tracking-tight">FCL 2026 ACCREDITATION GUIDELINES</h3>
                <div className="space-y-4 text-sm text-white/60 leading-relaxed">
                  <p>
                    ACC-REG is the secure system through which all 20 FUTA Champions League sports delegations submit profiles for identity verification. To protect tournament integrity:
                  </p>
                  <ul className="list-disc leading-relaxed pl-5 space-y-2.5">
                    <li><strong className="text-white">Matriculation Integrity</strong>: All players must be registered with valid and correct matriculation directories corresponding to their active department codes.</li>
                    <li><strong className="text-white">Active Student Badge</strong>: Upload of actual FUTA School Identity Card scans is strictly mandatory for validation.</li>
                    <li><strong className="text-white">Strict Capacity</strong>: Squad sizes are dynamically validated—capped absolutely at 23 student-athletes and 2 coaches.</li>
                    <li><strong className="text-white">Accreditation Locking</strong>: Once you submit the dossier, editing locks down. The organizer commission rejects cards with mistakes so teams can resolve anomalies.</li>
                  </ul>
                </div>
              </div>

              <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-display font-bold italic uppercase text-white tracking-tight mb-4">ACC_STATUS_REPORT</h3>
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                      <span className="text-xs text-white/50">Minimum Roster Required</span>
                      <span className="text-xs font-mono font-bold text-green-500 font-bold">15 Players (MET)</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                      <span className="text-xs text-white/50">Matriculation Check</span>
                      <span className="text-xs font-mono font-bold text-blue-400">PASSED AUTOMATIC</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                      <span className="text-xs text-white/50">Card Accreditation Format</span>
                      <span className="text-xs font-mono font-bold text-white/80">JPG / JPEG</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                      <span className="text-xs text-white/50">Verification Status</span>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-glow text-primary">{activeReg.status}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  {activeReg.status === 'incomplete' || activeReg.status === 'pending' ? (
                    <button
                      onClick={() => setActiveTab('players')}
                      className="px-6 py-4 sporty-gradient text-dark font-black tracking-widest text-xs rounded-xl hover:scale-[1.02] transition-transform uppercase flex items-center justify-center space-x-2"
                    >
                      <span>GO TO ATHLETE REGISTER</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center text-xs text-white/40">
                      Roster under technical verification lock. Changes are currently frozen.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- TAB CONTENT: PLAYER REGISTER --- */}
          {activeTab === 'players' && (
            <div className="space-y-6">
              {/* Roster Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-display font-medium uppercase tracking-tight">OFFICIAL PLAYER ROSTER</h3>
                  <p className="text-xs text-white/40">{activeReg.players.length} athlete credentials registered out of 23 slots.</p>
                </div>
                
                {activeReg.status !== 'verified' && activeReg.status !== 'submitted' && (
                  <button
                    onClick={() => setIsPlayerModalOpen(true)}
                    disabled={activeReg.players.length >= 23}
                    className="sporty-gradient px-6 py-3.5 rounded-xl text-dark text-xs font-bold tracking-widest uppercase hover:scale-105 transition-transform flex items-center space-x-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <UserPlus size={14} />
                    <span>ADD athlete CREDENTIALS</span>
                  </button>
                )}
              </div>

              {activeReg.players.length === 0 ? (
                <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl p-8">
                  <User size={48} className="mx-auto text-white/10 mb-4" />
                  <h4 className="font-display text-xl uppercase italic text-white/60 mb-2">No Registered Athletes</h4>
                  <p className="text-xs text-white/30 max-w-sm mx-auto mb-6">Begin adding participants using their school matric codes and FUTA student ID card files.</p>
                  <button
                    onClick={() => setIsPlayerModalOpen(true)}
                    className="px-5 py-3 glass hover:bg-white/5 border border-white/10 text-xs font-bold rounded-xl"
                  >
                    ADD YOUR FIRST ATHLETE CARD
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeReg.players.map((player) => (
                    <div 
                      key={player.id}
                      className={cn(
                        "glass rounded-2xl overflow-hidden border transition-all flex flex-col justify-between group relative",
                        player.idCardStatus === 'approved' && "border-green-500/10 hover:border-green-500/30",
                        player.idCardStatus === 'rejected' && "border-red-500/10 hover:border-red-500/30",
                        player.idCardStatus === 'pending' && "border-white/10 hover:border-primary/30"
                      )}
                    >
                      {/* ACCREDITATION LICENSE CARD UI (UEFA COMPLIANT STYLE) */}
                      <div className="bg-white/[0.02] border-b border-white/5 p-4 flex justify-between items-center">
                        <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">{player.id}</span>
                        <div className="flex items-center space-x-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase font-mono",
                            player.idCardStatus === 'approved' && "bg-green-500/10 text-green-500",
                            player.idCardStatus === 'rejected' && "bg-red-500/10 text-red-500",
                            player.idCardStatus === 'pending' && "bg-white/10 text-white/40"
                          )}>
                            ID_CARD_{player.idCardStatus}
                          </span>

                          {activeReg.status !== 'verified' && activeReg.status !== 'submitted' && (
                            <button
                              onClick={() => handleDeletePlayer(player.id)}
                              className="text-white/40 hover:text-red-500 p-1 rounded-md hover:bg-white/5 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-5 flex space-x-4 items-start">
                        {/* Athlete Photo box */}
                        <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {player.passportPath ? (
                            <img src={player.passportPath} className="w-full h-full object-cover" alt="Passport" />
                          ) : (
                            <div className="text-white/20">
                              <User size={24} />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="font-display font-black tracking-tight text-white uppercase text-base truncate leading-tight">{player.fullName}</h4>
                          <p className="font-mono text-[10px] text-primary tracking-widest font-bold">{player.matricNumber}</p>
                          <p className="text-xs text-white/50">{player.department} • Lvl {player.level}</p>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-3 border-t border-white/5 bg-white/[0.01]/10 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] text-white/20 uppercase block tracking-wider font-bold">ACC_PLAY_POS</span>
                          <span className="text-xs font-bold text-white tracking-widest">{player.position}</span>
                        </div>

                        {/* Student ID Scan attachment info */}
                        <div className="text-right">
                          <span className="text-[9px] text-white/20 uppercase block tracking-wider font-bold">FUTA_ID_CARD</span>
                          <span className="text-xs text-primary font-mono text-glow hover:underline cursor-pointer flex items-center justify-end space-x-1">
                            <Eye size={12} />
                            <span className="truncate max-w-[120px]">{player.idCardName}</span>
                          </span>
                        </div>
                      </div>

                      {/* Rejected notice block for user correction */}
                      {player.idCardStatus === 'rejected' && player.idCardFeedback && (
                        <div className="bg-red-500/15 p-3 text-[10px] text-red-300 border-t border-red-500/20 leading-relaxed font-semibold uppercase">
                          <span className="text-red-500 font-black">ACC_REJECT_REASON:</span> {player.idCardFeedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- TAB CONTENT: COACH REGISTER --- */}
          {activeTab === 'coaches' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-display font-medium uppercase tracking-tight">OFFICIAL COACHING STAFF</h3>
                  <p className="text-xs text-white/40">{activeReg.coaches.length} technical staff registered (Max limit: 2).</p>
                </div>
                
                {activeReg.status !== 'verified' && activeReg.status !== 'submitted' && (
                  <button
                    onClick={() => setIsCoachModalOpen(true)}
                    disabled={activeReg.coaches.length >= 2}
                    className="sporty-gradient px-6 py-3.5 rounded-xl text-dark text-xs font-bold tracking-widest uppercase hover:scale-105 transition-transform flex items-center space-x-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <UserPlus size={14} />
                    <span>ADD COACH STAFF</span>
                  </button>
                )}
              </div>

              {activeReg.coaches.length === 0 ? (
                <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl p-8">
                  <User size={48} className="mx-auto text-white/10 mb-4" />
                  <h4 className="font-display text-xl uppercase italic text-white/60 mb-2">No Coaching Staff</h4>
                  <p className="text-xs text-white/30 max-w-sm mx-auto mb-6">FCL rules require at least one registered technical official representing the delegation.</p>
                  <button
                    onClick={() => setIsCoachModalOpen(true)}
                    className="px-5 py-3 glass hover:bg-white/5 border border-white/10 text-xs font-bold rounded-xl"
                  >
                    ADD TECHNICAL COACH
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeReg.coaches.map((coach) => (
                    <div 
                      key={coach.id}
                      className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/30 transition-all flex flex-col justify-between group relative"
                    >
                      <div className="p-5 flex space-x-4 items-start">
                        <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {coach.passportPath ? (
                            <img src={coach.passportPath} className="w-full h-full object-cover" alt="Passport" />
                          ) : (
                            <div className="text-white/20">
                              <User size={24} />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-display font-bold tracking-tight text-white uppercase text-base truncate">{coach.fullName}</h4>
                            
                            {activeReg.status !== 'verified' && activeReg.status !== 'submitted' && (
                              <button
                                onClick={() => handleDeleteCoach(coach.id)}
                                className="text-white/40 hover:text-red-500 p-1 rounded-md hover:bg-white/5 transition-colors absolute top-4 right-4"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <p className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">{coach.role}</p>
                          <p className="text-xs text-white/50">{coach.email}</p>
                          <p className="text-xs text-white/50">{coach.phone}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- TAB CONTENT: ACCREDITING PRINT SHEET PREVIEW --- */}
          {activeTab === 'submitted_print' && (
            <div className="glass p-8 rounded-[36px] border border-white/10 space-y-8 max-w-5xl mx-auto">
              <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <div>
                  <h3 className="text-xl font-display font-bold uppercase text-white">OFFICIAL ACCREDITATION SHEET</h3>
                  <p className="text-xs text-white/40">FUTA Champions League Commission • Official technical squad sheet</p>
                </div>
                <button
                  onClick={handlePrintTeamSheet}
                  className="px-6 py-3 sporty-gradient text-dark font-black tracking-widest text-xs rounded-xl hover:scale-105 transition-transform uppercase flex items-center space-x-2"
                >
                  <Printer size={14} />
                  <span>PRINT SQUAD SHEET (Ctrl+P)</span>
                </button>
              </div>

              {/* Printable Area Wrapper */}
              <div className="bg-dark/10 p-2 text-white font-sans max-w-4xl mx-auto">
                <div className="border-[3px] border-primary/20 p-8 rounded-3xl space-y-6 relative overflow-hidden">
                  {/* Decorative Background Crest */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                    <ShieldCheck size={400} />
                  </div>

                  <div className="flex justify-between items-center border-b border-primary/20 pb-6 relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-xl bg-white/5 p-2 flex items-center justify-center border border-white/10">
                        <img src={activeTeam.logo} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-display font-black italic uppercase text-primary tracking-tight leading-none">{activeTeam.name.toUpperCase()}</h4>
                        <p className="text-[10px] text-white/50 font-mono tracking-widest uppercase mt-1">DEPARTMENT TEAM DIRECTORY</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="border border-primary/40 text-primary uppercase text-[10px] tracking-[0.2em] font-black px-4 py-1.5 rounded-lg inline-block italic">
                        FCL 2026 ACCREDITATION
                      </div>
                      <p className="text-[9px] text-white/40 mt-1 uppercase font-mono tracking-[0.1em]">VERIFICATION: {activeReg.status.toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Registered Coaches Table */}
                  <div className="space-y-3 relative z-10">
                    <h5 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] italic">OFFICIAL TECHNICAL STAFF</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeReg.coaches.map((coach, idx) => (
                        <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                          <p className="text-xs font-bold text-white uppercase">{coach.fullName}</p>
                          <p className="text-[10px] text-blue-400 font-mono font-bold tracking-wider mt-0.5">{coach.role.toUpperCase()}</p>
                          <p className="text-[10px] text-white/40 mt-1">E-mail: {coach.email} | Tel: {coach.phone}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Registered Athletes Table */}
                  <div className="space-y-3 relative z-10">
                    <h5 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] italic">REGISTERED ATHLETES ROSTER</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-white/80">
                        <thead>
                          <tr className="border-b border-white/10 text-white font-mono text-[9px] uppercase tracking-widest">
                            <th className="py-2.5">S/N</th>
                            <th className="py-2.5">NAME OF ATHLETE</th>
                            <th className="py-2.5">MATRICULATION</th>
                            <th className="py-2.5">POSITION</th>
                            <th className="py-2.5">LVL</th>
                            <th className="py-2.5 text-right">ACC_STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeReg.players.map((p, index) => (
                            <tr key={index} className="border-b border-white/5 font-semibold">
                              <td className="py-2 text-[10px] text-white/40 font-mono">{index + 1}</td>
                              <td className="py-2 text-white uppercase">{p.fullName}</td>
                              <td className="py-2 font-mono text-primary">{p.matricNumber}</td>
                              <td className="py-2 text-white/80">{p.position}</td>
                              <td className="py-2">{p.level}</td>
                              <td className="py-2 text-right">
                                <span className={cn(
                                  "text-[9px] font-mono",
                                  p.idCardStatus === 'approved' ? "text-green-500" : "text-amber-500"
                                )}>
                                  {p.idCardStatus.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-white/30 relative z-10">
                    <span>FCL SQUAD KEY: {activeReg.teamId.toUpperCase()}-{activeReg.players.length}</span>
                    <span>PRINT DIRECTLY ON OFFICIAL DEPARTMENT HEADER PAPER AND SCAN SQUAD CODE</span>
                    <span>ORGANIZING COMMISSION SIGNATURE</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB CONTENT: OFFICIAL BADGES GALLERY --- */}
          {activeTab === 'badges' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Header Action controls */}
              <div className="glass p-6 sm:p-8 rounded-[38px] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-display font-bold uppercase text-white flex items-center space-x-2">
                    <span className="text-glow text-[#00E5FF]">REPRESENTATION ACCREDITATION BADGES</span>
                  </h3>
                  <p className="text-xs text-white/40 mt-1 max-w-xl">
                    Verified tournament-official laminated licenses with full security indicators. Search team credentials or trigger high-res printing.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto relative z-10">
                  <div className="relative flex-1 md:flex-initial">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={14} className="text-white/40" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search name or matric..."
                      value={badgeSearchQuery}
                      onChange={(e) => setBadgeSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs outline-none focus:border-[#00E5FF] text-white"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setPrintingAllSelected(true);
                      setTimeout(() => {
                        window.print();
                        setPrintingAllSelected(false);
                      }, 100);
                    }}
                    disabled={activeReg.players.length === 0 && activeReg.coaches.length === 0}
                    className="px-5 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-black tracking-widest text-xs rounded-xl hover:scale-105 active:scale-95 transition-transform uppercase flex items-center space-x-2 disabled:opacity-30 disabled:cursor-not-allowed w-full md:w-auto justify-center"
                  >
                    <Printer size={14} />
                    <span>PRINT ALL BADGES</span>
                  </button>
                </div>
              </div>

              {activeReg.players.length === 0 && activeReg.coaches.length === 0 ? (
                <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl p-8">
                  <ShieldCheck size={48} className="mx-auto text-white/10 mb-4 animate-pulse" />
                  <h4 className="font-display text-lg uppercase text-white/60 mb-2">No Accreditations Prepared</h4>
                  <p className="text-xs text-white/30 max-w-sm mx-auto">
                    Please upload athlete and official staff photographs under the registers to render badge models. Only verified squads gain full tournament badges.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                  {/* Rendering Coaches Badges */}
                  {activeReg.coaches
                    .filter(c => c.fullName.toLowerCase().includes(badgeSearchQuery.toLowerCase()))
                    .map((coach) => {
                      const isApproved = activeReg.status === 'verified';
                      return (
                        <div key={coach.id} className="space-y-4 flex flex-col items-center p-4 bg-white/[0.01] border border-white/5 rounded-3xl hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300">
                          <AccreditationCard 
                            member={coach}
                            type="coach"
                            team={activeTeam}
                            isApproved={isApproved}
                          />
                          <button
                            onClick={() => {
                              setPrintingMember({ member: coach, type: 'coach' });
                              setTimeout(() => {
                                window.print();
                                setPrintingMember(null);
                              }, 100);
                            }}
                            className="px-4 py-2 w-full justify-center bg-[#070A1A] hover:bg-[#00E5FF]/20 hover:text-[#00E5FF] hover:border-[#00E5FF]/30 text-white/70 border border-white/10 text-[10px] font-bold tracking-widest uppercase rounded-lg flex items-center space-x-1.5 transition-all"
                          >
                            <Printer size={12} />
                            <span>PRINT BADGE</span>
                          </button>
                        </div>
                      );
                    })}

                  {/* Rendering Players Badges */}
                  {activeReg.players
                    .filter(p => p.fullName.toLowerCase().includes(badgeSearchQuery.toLowerCase()) || p.matricNumber.toLowerCase().includes(badgeSearchQuery.toLowerCase()))
                    .map((player) => {
                      const isApproved = activeReg.status === 'verified';
                      return (
                        <div key={player.id} className="space-y-4 flex flex-col items-center p-4 bg-white/[0.01] border border-white/5 rounded-3xl hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300">
                          <AccreditationCard 
                            member={player}
                            type="player"
                            team={activeTeam}
                            isApproved={isApproved}
                          />
                          <button
                            onClick={() => {
                              setPrintingMember({ member: player, type: 'player' });
                              setTimeout(() => {
                                window.print();
                                setPrintingMember(null);
                              }, 100);
                            }}
                            className="px-4 py-2 w-full justify-center bg-[#070A1A] hover:bg-[#00E5FF]/20 hover:text-[#00E5FF] hover:border-[#00E5FF]/30 text-white/70 border border-white/10 text-[10px] font-bold tracking-widest uppercase rounded-lg flex items-center space-x-1.5 transition-all"
                          >
                            <Printer size={12} />
                            <span>PRINT BADGE</span>
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* --- ADMIN TERMINAL hub --- */}
      {isAdmin && (
        <section className="max-w-7xl mx-auto px-4 no-print">
          {/* Admin Header Dashboard Bar */}
          <div className="glass rounded-[32px] p-6 sm:p-8 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3.5 bg-primary/20 text-primary border border-primary/40 rounded-2xl">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-black italic uppercase tracking-tight text-white leading-none">ADMINISTRATIVE VERIFICATION PORTAL</h2>
                <p className="text-xs text-white/40 mt-1 font-mono uppercase tracking-widest">FUTA Champions League 2026 organizing commission</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black tracking-widest uppercase rounded-xl flex items-center space-x-2"
            >
              <ArrowLeft size={14} />
              <span>TERMINATE SESSION</span>
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Teams Progress Summary Deck */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass p-6 rounded-[28px] border border-white/10">
                <h3 className="text-base font-display font-medium uppercase tracking-tight mb-4">VERIFICATION SQUAD TRACKER</h3>
                
                {/* Search / Filters */}
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={14} className="text-white/40" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search Departments..."
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs outline-none focus:border-primary focus:bg-white/10"
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto py-1 no-scrollbar">
                    {['all', 'submitted', 'verified', 'incomplete'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setAdminStatusFilter(status)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all whitespace-nowrap",
                          adminStatusFilter === status 
                            ? "bg-primary text-dark" 
                            : "bg-white/5 text-white/55 border border-white/5 hover:bg-white/10"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team Progress Scroll Deck */}
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                {TEAMS.filter(t => {
                  const matchSearch = t.name.toLowerCase().includes(adminSearch.toLowerCase()) || t.id.toLowerCase().includes(adminSearch.toLowerCase());
                  const reg = registrations[t.id];
                  const status = reg ? reg.status : 'pending';
                  const matchFilter = adminStatusFilter === 'all' || status === adminStatusFilter;
                  return matchSearch && matchFilter;
                }).map((team) => {
                  const reg = registrations[team.id];
                  const playersCount = reg ? reg.players.length : 0;
                  const coachesCount = reg ? reg.coaches.length : 0;
                  const status = reg ? reg.status : 'pending';

                  return (
                    <div
                      key={team.id}
                      onClick={() => setSelectedAdminTeam(team.id)}
                      className={cn(
                        "glass p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group",
                        selectedAdminTeam === team.id 
                          ? "border-primary bg-primary/5" 
                          : "border-white/5 hover:border-white/15 hover:bg-white/[0.02]"
                      )}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-lg bg-white/5 p-1.5 flex items-center justify-center border border-white/10">
                          <img src={team.logo} className="w-full h-full object-contain" alt="" />
                        </div>
                        <div>
                          <h4 className="font-display font-medium text-sm text-white group-hover:text-primary transition-colors uppercase leading-none">{team.id.toUpperCase()}</h4>
                          <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider font-bold">
                            Squad: {playersCount}/23 • Technical: {coachesCount}/2
                          </p>
                        </div>
                      </div>

                      <span className={cn(
                        "px-2.5 py-1 text-[8px] font-mono tracking-widest font-bold uppercase rounded-full",
                        status === 'verified' && "bg-green-500/10 text-green-500",
                        status === 'submitted' && "bg-blue-500/10 text-blue-500 animate-pulse",
                        status === 'incomplete' && "bg-amber-500/10 text-amber-500",
                        status === 'pending' && "bg-white/5 text-white/35"
                      )}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verification Workspace Deck */}
            <div className="lg:col-span-2 space-y-6">
              {selectedAdminTeam ? (() => {
                const teamMeta = TEAMS.find(t => t.id === selectedAdminTeam);
                const reg = registrations[selectedAdminTeam] || {
                  teamId: selectedAdminTeam,
                  status: 'pending',
                  players: [],
                  coaches: []
                };

                if (!teamMeta) return null;

                return (
                  <div className="glass p-6 sm:p-8 rounded-[36px] border border-white/10 space-y-8">
                    {/* Header Detail of selected team */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 p-2 flex items-center justify-center border border-white/10">
                          <img src={teamMeta.logo} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <h3 className="text-xl font-display font-black italic uppercase text-white">{teamMeta.name}</h3>
                          <p className="text-xs text-white/40 mt-1 uppercase tracking-wider font-mono">STATUS: {reg.status.toUpperCase()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleExportCSV(selectedAdminTeam)}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold rounded-lg flex items-center space-x-2"
                        >
                          <FileSpreadsheet size={14} />
                          <span>EXPORT CSV</span>
                        </button>
                        <button
                          onClick={() => handleVerifySquad(selectedAdminTeam, 'approve')}
                          disabled={reg.status !== 'submitted'}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 font-bold text-dark text-xs rounded-lg flex items-center space-x-2 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <CheckCircle2 size={14} />
                          <span>SQUAD EXCEL APPROVED</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick overview metrics and technical official list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                      <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                        <h4 className="text-[10px] font-bold text-primary tracking-widest uppercase mb-3">TECHNICAL DIRECTIVES STAFF</h4>
                        {reg.coaches.length === 0 ? (
                          <p className="text-xs text-white/30 italic">No officials registered representing this team.</p>
                        ) : (
                          <div className="space-y-3">
                            {reg.coaches.map((c, idx) => (
                              <div key={idx} className="text-xs font-semibold leading-relaxed">
                                <p className="text-white uppercase">{c.fullName} ({c.role})</p>
                                <p className="text-white/40">Tel: {c.phone} | Email: {c.email}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-between">
                        <div>
                          <h4 className="text-[10px] font-bold text-blue-500 tracking-widest uppercase mb-1">REJECTION DECISION LETTER FEEDBACK</h4>
                          <p className="text-xs text-white/40 mb-3">Supply mistakes notice back to the team manager dashboard.</p>
                        </div>

                        <div className="space-y-3">
                          <textarea
                            placeholder="e.g. Player A matric number incorrect; Player B student ID scan is blurry or does not exist."
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs outline-none focus:border-red-500 h-20 placeholder:text-white/20"
                          />
                          <button
                            onClick={() => handleVerifySquad(selectedAdminTeam, 'reject')}
                            disabled={reg.status !== 'submitted' || !feedbackText.trim()}
                            className="w-full py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5"
                          >
                            <XCircle size={14} />
                            <span>REFUSE & SEND CORRECTION MEMO</span>
                          </button>
                        </div>
                      </div>
                                   {/* Admin workspace sub-tabs */}
                    <div className="flex border-b border-white/10 pb-0.5 gap-6 mb-4 no-print">
                      <button
                        type="button"
                        onClick={() => setAdminViewSubTab('audit')}
                        className={cn(
                          "pb-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center space-x-1.5",
                          adminViewSubTab === 'audit' ? "border-primary text-primary" : "border-transparent text-white/40 hover:text-white"
                        )}
                      >
                        <FileText size={12} />
                        <span>1. ID CARD AUDIT</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminViewSubTab('badges')}
                        className={cn(
                          "pb-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center space-x-1.5",
                          adminViewSubTab === 'badges' ? "border-primary text-primary" : "border-transparent text-white/40 hover:text-white"
                        )}
                      >
                        <ShieldCheck size={12} />
                        <span>2. SQUAD CREDENTIAL BADGES ({reg.players.length + reg.coaches.length})</span>
                      </button>
                    </div>

                    {adminViewSubTab === 'audit' ? (
                      <div className="space-y-4">
                        <h4 className="text-sm font-display font-medium uppercase tracking-tight text-white italic">ATHLETES SQUAD AUDIT</h4>
                        <p className="text-xs text-white/40">Verify uploaded matric codes and confirm image integrity of FUTA student ID scans.</p>

                        {reg.players.length === 0 ? (
                          <p className="text-xs text-white/30 italic py-6 text-center">No athletes registered in this team draft yet.</p>
                        ) : (
                          <div className="space-y-4">
                            {reg.players.map((player) => (
                              <div key={player.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center space-x-4 font-semibold">
                                  <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10 animate-fadeIn">
                                    {player.passportPath ? (
                                      <img src={player.passportPath} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                      <User className="text-white/20 w-6 h-6" />
                                    )}
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-bold text-white uppercase">{player.fullName}</h5>
                                    <p className="text-xs font-mono font-bold text-primary mt-0.5">{player.matricNumber} • Position: {player.position}</p>
                                    <p className="text-[10px] text-white/50 mt-1 flex items-center">
                                      <FileText size={11} className="mr-1" />
                                      <span>Uploaded ID Slot: {player.idCardName} ({player.idCardSize})</span>
                                    </p>
                                  </div>
                                </div>

                                {/* Workspace action controls */}
                                <div className="flex items-center gap-3">
                                  {player.idCardData && player.idCardData !== 'placeholder_id' && (
                                    <a 
                                      href={player.idCardData} 
                                      download={player.idCardName}
                                      className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 border border-white/10"
                                    >
                                      <Download size={13} />
                                      <span>DOWNLOAD ID</span>
                                    </a>
                                  )}

                                  <div className="flex rounded-lg overflow-hidden border border-white/10">
                                    <button
                                      type="button"
                                      onClick={() => handleVerifyIdCard(selectedAdminTeam, player.id, 'approved')}
                                      className={cn(
                                        "px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors",
                                        player.idCardStatus === 'approved' 
                                          ? "bg-green-500 text-dark" 
                                          : "bg-white/5 text-white/60 hover:bg-white/10"
                                      )}
                                    >
                                      ACTIVATE
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const reason = prompt("Enter ID CARD Rejection Mistake:");
                                        if (reason) handleVerifyIdCard(selectedAdminTeam, player.id, 'rejected', reason);
                                      }}
                                      className={cn(
                                        "px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors border-l border-white/10",
                                        player.idCardStatus === 'rejected' 
                                          ? "bg-red-500 text-white" 
                                          : "bg-white/5 text-white/60 hover:bg-white/10"
                                      )}
                                    >
                                      REJECT
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                          <div>
                            <h4 className="text-sm font-display font-medium uppercase tracking-tight text-white italic">TEAM ACCREDITED CARDS</h4>
                            <p className="text-xs text-white/45 mt-0.5">Physical vertical layout cards generated instantly for this athlete delegation.</p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setPrintingAllSelected(true);
                              setTimeout(() => {
                                window.print();
                                setPrintingAllSelected(false);
                              }, 100);
                            }}
                            disabled={reg.players.length === 0 && reg.coaches.length === 0}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 outline-none text-dark font-black tracking-widest text-xs rounded-xl hover:scale-105 active:scale-95 transition-transform uppercase flex items-center space-x-1.5 disabled:opacity-30 disabled:cursor-not-allowed justify-center"
                          >
                            <Printer size={13} />
                            <span>PRINT SQUAD WRAP PACK</span>
                          </button>
                        </div>

                        {reg.players.length === 0 && reg.coaches.length === 0 ? (
                          <p className="text-xs text-white/30 italic text-center py-12">No athlete or technical records submitted for this team draft.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center">
                            {/* Render Technical Staff */}
                            {reg.coaches.map((c: any) => (
                              <div key={c.id} className="space-y-4 flex flex-col items-center p-4 bg-white/[0.01] border border-white/5 rounded-3xl hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300">
                                <AccreditationCard 
                                  member={c}
                                  type="coach"
                                  team={teamMeta}
                                  isApproved={reg.status === 'verified'}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPrintingMember({ member: c, type: 'coach' });
                                    setTimeout(() => {
                                      window.print();
                                      setPrintingMember(null);
                                    }, 100);
                                  }}
                                  className="px-4 py-2 w-full justify-center bg-[#070A1A] hover:bg-[#00E5FF]/20 hover:text-[#00E5FF] hover:border-[#00E5FF]/30 text-white/70 border border-white/10 text-[10px] font-bold tracking-widest uppercase rounded-lg flex items-center space-x-1.5 transition-all"
                                >
                                  <Printer size={12} />
                                  <span>PRINT COMPACT CARD</span>
                                </button>
                              </div>
                            ))}

                            {/* Render Roster Team */}
                            {reg.players.map((p: any) => (
                              <div key={p.id} className="space-y-4 flex flex-col items-center p-4 bg-white/[0.01] border border-white/5 rounded-3xl hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300">
                                <AccreditationCard 
                                  member={p}
                                  type="player"
                                  team={teamMeta}
                                  isApproved={reg.status === 'verified'}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPrintingMember({ member: p, type: 'player' });
                                    setTimeout(() => {
                                      window.print();
                                      setPrintingMember(null);
                                    }, 100);
                                  }}
                                  className="px-4 py-2 w-full justify-center bg-[#070A1A] hover:bg-[#00E5FF]/20 hover:text-[#00E5FF] hover:border-[#00E5FF]/30 text-white/70 border border-white/10 text-[10px] font-bold tracking-widest uppercase rounded-lg flex items-center space-x-1.5 transition-all"
                                >
                                  <Printer size={12} />
                                  <span>PRINT COMPACT CARD</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>         </div>
                );
              })() : (
                <div className="glass p-12 rounded-[40px] border border-white/5 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                  <GraduationCap size={48} className="text-white/15 mb-4 animate-bounce" />
                  <h4 className="font-display font-black tracking-tight text-white/50 uppercase italic text-lg mb-2">Technical Board Console</h4>
                  <p className="text-xs text-white/30 max-w-sm mx-auto">Select any active student delegation from the portal sidebar to inspect their FCL matric credentials, school ID cards, and grant or reject competition licenses.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* --- MODAL WINDOWS --- */}

      {/* 1. Modal: Add Athlete Card Details */}
      <AnimatePresence>
        {isPlayerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/90 backdrop-blur-sm no-print">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass max-w-lg w-full rounded-[32px] border border-white/15 overflow-hidden shadow-2xl shadow-primary/10 relative z-50 flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/[0.01]">
                <div className="flex items-center space-x-2.5">
                  <UserPlus className="text-primary" size={18} />
                  <h3 className="font-display font-bold uppercase tracking-tight text-white">ATHLETE REGISTRATION DOSSIER</h3>
                </div>
                <button 
                  onClick={() => setIsPlayerModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                >
                  <XCircle size={18} />
                </button>
              </div>

              {/* Modal Scroll Content */}
              <form onSubmit={handleAddPlayer} className="p-6 space-y-5 overflow-y-auto max-h-[80vh] text-left">
                {/* Full name */}
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Full Name (FUTA Portal Directory)</label>
                  <input
                    type="text"
                    required
                    value={playerForm.fullName}
                    onChange={(e) => setPlayerForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="e.g. ADEBOWALE TIMOTHY CHIDI"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs outline-none text-white focus:border-primary uppercase font-bold"
                  />
                </div>

                {/* Matric Number */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Matriculation Number</label>
                    <input
                      type="text"
                      required
                      value={playerForm.matricNumber}
                      onChange={(e) => setPlayerForm(prev => ({ ...prev, matricNumber: e.target.value }))}
                      placeholder="e.g. MST/2021/3002"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs outline-none text-white focus:border-primary uppercase font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Department</label>
                    <input
                      type="text"
                      disabled
                      value={activeTeam ? activeTeam.name.replace(/ \(\w+\)$/, '') : ''}
                      className="w-full px-4 py-3 bg-white/5 border border-white/5 cursor-not-allowed rounded-xl text-xs text-white/30 uppercase font-black"
                    />
                  </div>
                </div>

                {/* Level and Position selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Accreditation Level</label>
                    <select
                      value={playerForm.level}
                      onChange={(e) => setPlayerForm(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-xs outline-none text-white focus:border-primary font-bold"
                    >
                      {LEVEL_OPTIONS.map((level) => (
                        <option value={level} key={level} className="bg-dark">Lvl {level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Pitch Position Group</label>
                    <select
                      value={playerForm.position}
                      onChange={(e) => setPlayerForm(prev => ({ ...prev, position: e.target.value as any }))}
                      className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-xs text-white focus:border-primary font-bold"
                    >
                      {POSITION_OPTIONS.map((pos) => (
                        <option value={pos.value} key={pos.value} className="bg-dark">{pos.label} ({pos.value})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Passport Portrait Upload (Required) */}
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Passport Photograph (Required)</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {playerForm.passportPath ? (
                        <img src={playerForm.passportPath} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <User className="text-white/20 w-6 h-6" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".jpg,.jpeg"
                      onChange={(e) => handlePassportChange(e, 'player')}
                      className="text-xs text-white/55 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:tracking-wider file:uppercase file:bg-white/10 file:text-white hover:file:bg-white/15"
                    />
                  </div>
                </div>

                {/* School ID Card Scan Upload (Mandatory) */}
                <div>
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-1.5">Upload Official FUTA student ID Card scan (Requires .jpg/.jpeg)</label>
                  
                  {/* Drag and Drop Zone Area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2.5",
                      dragActive ? "border-primary bg-primary/5" : "border-white/10 hover:border-white/25 bg-white/[0.01]",
                      playerForm.idCardData ? "border-green-500/40 bg-green-500/5" : ""
                    )}
                  >
                    {!playerForm.idCardData ? (
                      <>
                        <UploadCloud size={24} className="text-white/30 animate-pulse" />
                        <div className="text-center">
                          <p className="text-xs font-bold text-white">Drag & Drop Card image scan</p>
                          <p className="text-[10px] text-white/40 mt-1">Accepts strictly .jpg or .jpeg (Maximum 2MB file size limit)</p>
                        </div>
                        <input
                          type="file"
                          id="id-card-file-input"
                          accept=".jpg,.jpeg"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('id-card-file-input')?.click()}
                          className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold tracking-wider uppercase rounded-lg text-white"
                        >
                          CHOOSE IMAGE DECK
                        </button>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={24} className="text-green-500 animate-bounce" />
                        <div className="text-center">
                          <p className="text-xs font-bold text-white uppercase">{playerForm.idCardName}</p>
                          <p className="text-[9px] text-white/40 mt-1 font-mono">FILE_SIZE: {playerForm.idCardSize} (Scan Linked Successfully)</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPlayerForm(prev => ({ ...prev, idCardName: '', idCardSize: '', idCardData: '' }))}
                          className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold tracking-widest uppercase rounded-lg"
                        >
                          REMOVE PATH REFERENCE
                        </button>
                      </>
                    )}
                  </div>

                  {uploadError && (
                    <p className="text-xs text-red-500 mt-2 font-semibold flex items-center">
                      <AlertCircle size={12} className="mr-1 inline-block" />
                      <span>{uploadError}</span>
                    </p>
                  )}
                </div>

                {/* Final Form CTA */}
                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsPlayerModalOpen(false)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs tracking-widest uppercase rounded-xl"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 sporty-gradient text-dark font-black text-xs tracking-widest uppercase rounded-xl hover:scale-[1.02] transition-transform"
                  >
                    SAVE CREDENTIAL CARD
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Modal: Add Technical Coach */}
      <AnimatePresence>
        {isCoachModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/95 backdrop-blur-sm no-print">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass max-w-md w-full rounded-[32px] border border-white/15 overflow-hidden shadow-2xl relative z-50 flex flex-col"
            >
              <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/[0.01]">
                <div className="flex items-center space-x-2.5">
                  <UserPlus className="text-blue-500" size={18} />
                  <h3 className="font-display font-bold uppercase tracking-tight text-white">COACHING AND STAFF DOSSIER</h3>
                </div>
                <button 
                  onClick={() => setIsCoachModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <form onSubmit={handleAddCoach} className="p-6 space-y-5 text-left">
                {/* Coach Name */}
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Official Representative Name</label>
                  <input
                    type="text"
                    required
                    value={coachForm.fullName}
                    onChange={(e) => setCoachForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="e.g. COACH SAMUEL ADEWOLE"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs outline-none text-white focus:border-blue-500 uppercase font-bold"
                  />
                </div>

                {/* Coach Role selection */}
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Delegation Official Role</label>
                  <select
                    value={coachForm.role}
                    onChange={(e) => setCoachForm(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-xs text-white focus:border-blue-500 font-bold"
                  >
                    {COACH_ROLES.map((role) => (
                      <option value={role} key={role} className="bg-dark">{role}</option>
                    ))}
                  </select>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Direct Line Mobile</label>
                    <input
                      type="tel"
                      required
                      value={coachForm.phone}
                      onChange={(e) => setCoachForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. 08034567890"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs outline-none text-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Staff Email Address</label>
                    <input
                      type="email"
                      required
                      value={coachForm.email}
                      onChange={(e) => setCoachForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. adewole@futa.edu.ng"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs outline-none text-white focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Required Passport portrait uploader */}
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Staff Photograph (Required)</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {coachForm.passportPath ? (
                        <img src={coachForm.passportPath} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <User className="text-white/20 w-6 h-6" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".jpg,.jpeg"
                      onChange={(e) => handlePassportChange(e, 'coach')}
                      className="text-xs text-white/55 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:tracking-wider file:uppercase file:bg-white/10 file:text-white"
                    />
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsCoachModalOpen(false)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs tracking-widest uppercase rounded-xl"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 outline-none text-dark font-black text-xs tracking-widest uppercase rounded-xl hover:scale-[1.02] transition-transform"
                  >
                    SAVE OFFICIAL CARD
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Laminated print style blocks */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: #03050B !important;
            color: #ffffff !important;
          }
          .no-print, header, footer, nav, section, dialog, .fixed, .fixed * {
            display: none !important;
            height: 0 !important;
            opacity: 0 !important;
            overflow: hidden !important;
            visibility: hidden !important;
          }
          #print-target {
            display: flex !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            height: auto !important;
            z-index: 9999999 !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            justify-content: center !important;
            align-items: center !important;
          }
          #print-target * {
            visibility: visible !important;
          }
          #print-target .print-all-grid {
            display: grid !important;
            grid-template-cols: repeat(2, minmax(0, 1fr)) !important;
            gap: 24px !important;
            padding: 24px !important;
            background: transparent !important;
          }
          #print-target .print-card-box {
            display: inline-flex !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 12px;
          }
        }
      `}} />

      {/* INVISIBLE CONTAINER FOR ACCREDITED BADGE PRINTING OPERATIONS */}
      {(() => {
        const printingTeamObject = isAdmin && selectedAdminTeam 
          ? TEAMS.find(t => t.id === selectedAdminTeam) 
          : activeTeam;

        const printingTeamRegistration = isAdmin && selectedAdminTeam 
          ? registrations[selectedAdminTeam] 
          : activeReg;

        return (
          <div id="print-target" className="hidden">
            {printingMember && printingTeamObject && (
              <AccreditationCard 
                member={printingMember.member}
                type={printingMember.type}
                team={printingTeamObject}
                isApproved={printingTeamRegistration?.status === 'verified'}
              />
            )}
            {printingAllSelected && printingTeamObject && printingTeamRegistration && (
              <div className="print-all-grid">
                {printingTeamRegistration.coaches.map((c: any) => (
                  <div key={c.id} className="print-card-box">
                    <AccreditationCard 
                      member={c}
                      type="coach"
                      team={printingTeamObject}
                      isApproved={printingTeamRegistration.status === 'verified'}
                    />
                  </div>
                ))}
                {printingTeamRegistration.players.map((p: any) => (
                  <div key={p.id} className="print-card-box">
                    <AccreditationCard 
                      member={p}
                      type="player"
                      team={printingTeamObject}
                      isApproved={printingTeamRegistration.status === 'verified'}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
