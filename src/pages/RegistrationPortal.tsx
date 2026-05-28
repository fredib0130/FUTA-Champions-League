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
  passportPath: string | null; // Optional base64 photo
  idCardName: string;
  idCardSize: string;
  idCardData: string; // Base64 string for preview
  idCardStatus: 'pending' | 'approved' | 'rejected';
  idCardFeedback?: string;
}

interface CoachRegistration {
  id: string;
  fullName: string;
  role: 'Head Coach' | 'Assistant Coach' | 'Technical Director' | 'Team Manager';
  phone: string;
  email: string;
  passportPath: string | null; // Optional base64 photo
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
const TEAM_CODES: Record<string, string> = {
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

const LEVEL_OPTIONS = ['100', '200', '300', '400', '500', 'Postgraduate'];
const POSITION_OPTIONS = [
  { value: 'GK', label: 'Goalkeeper' },
  { value: 'DEF', label: 'Defender' },
  { value: 'MID', label: 'Midfielder' },
  { value: 'FWD', label: 'Forward' }
];

const COACH_ROLES = [
  'Head Coach',
  'Assistant Coach',
  'Technical Director',
  'Team Manager'
];

// Seed initial mock data so they do not start entirely from scratch
const INITIAL_REGISTRATIONS: Record<string, TeamRegistration> = {
  mst: {
    teamId: 'mst',
    status: 'incomplete',
    players: [
      {
        id: 'mst-p1',
        fullName: 'Adekunle Jones',
        matricNumber: 'MST/2019/1004',
        department: 'Marine Science',
        level: '500',
        position: 'FWD',
        passportPath: null,
        idCardName: 'futa_card_ade.jpg',
        idCardSize: '185 KB',
        idCardData: 'placeholder_id',
        idCardStatus: 'approved'
      },
      {
        id: 'mst-p2',
        fullName: 'Tunde Bakare',
        matricNumber: 'MST/2021/4102',
        department: 'Marine Science',
        level: '300',
        position: 'MID',
        passportPath: null,
        idCardName: 'futa_card_tunde.jpg',
        idCardSize: '142 KB',
        idCardData: 'placeholder_id',
        idCardStatus: 'approved'
      },
      {
        id: 'mst-p3',
        fullName: 'Chisom Okoro',
        matricNumber: 'MST/2020/2156',
        department: 'Marine Science',
        level: '400',
        position: 'DEF',
        passportPath: null,
        idCardName: 'chisom_id_card.jpeg',
        idCardSize: '210 KB',
        idCardData: 'placeholder_id',
        idCardStatus: 'pending'
      }
    ],
    coaches: [
      {
        id: 'mst-c1',
        fullName: 'Professor O. A. Adebayo',
        role: 'Head Coach',
        phone: '08034567891',
        email: 'adebayo.mst@futa.edu.ng',
        passportPath: null
      }
    ]
  },
  ifs: {
    teamId: 'ifs',
    status: 'submitted',
    submittedAt: '2026-05-27T08:14:22.000Z',
    players: Array.from({ length: 23 }, (_, idx) => ({
      id: `ifs-p${idx + 1}`,
      fullName: `IFS Star ${idx + 1}`,
      matricNumber: `IFS/202${idx % 4}/${1000 + idx}`,
      department: 'Information Systems',
      level: '300',
      position: ['GK', 'DEF', 'MID', 'FWD'][idx % 4] as any,
      passportPath: null,
      idCardName: `ifs_student_card_${idx + 1}.jpeg`,
      idCardSize: '190 KB',
      idCardData: 'placeholder_id',
      idCardStatus: idx % 6 === 0 ? 'pending' : 'approved'
    })),
    coaches: [
      {
        id: 'ifs-c1',
        fullName: 'Dr. Stella Gbagbe',
        role: 'Head Coach',
        phone: '09012345678',
        email: 's.gbagbe@futa.edu.ng',
        passportPath: null
      },
      {
        id: 'ifs-c2',
        fullName: 'Coach Festus',
        role: 'Assistant Coach',
        phone: '08122334455',
        email: 'festus.coaching@gmail.com',
        passportPath: null
      }
    ]
  }
};

export default function RegistrationPortal() {
  const [accessCode, setAccessCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTeam, setActiveTeam] = useState<typeof TEAMS[0] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [registrations, setRegistrations] = useState<Record<string, TeamRegistration>>(INITIAL_REGISTRATIONS);
  
  // Dashboard navigation states
  const [activeTab, setActiveTab] = useState<'info' | 'players' | 'coaches' | 'submitted_print'>('info');
  
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
    passportPath: null as string | null
  });
  const [coachForm, setCoachForm] = useState({
    fullName: '',
    role: 'Head Coach' as any,
    phone: '',
    email: '',
    passportPath: null as string | null
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

    if (code === 'ADMIN2026') {
      setIsAdmin(true);
      setActiveTeam(null);
      return;
    }

    // Check if code matches any team
    const matchedAbbr = Object.keys(TEAM_CODES).find(abbr => TEAM_CODES[abbr] === code);
    if (matchedAbbr) {
      const matchTeam = TEAMS.find(t => t.id === matchedAbbr.toLowerCase());
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

    setLoginError('Invalid accreditation access code. Please check and try again.');
  };

  const handleLogout = () => {
    setActiveTeam(null);
    setIsAdmin(false);
    setActiveTab('info');
    setSelectedAdminTeam(null);
    setAccessCode('');
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

    if (!playerForm.fullName || !playerForm.matricNumber || !playerForm.idCardData) {
      alert("Important: Full Name, Matriculation Number, and FUTA ID Card upload are mandatory.");
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

    if (!coachForm.fullName || !coachForm.phone || !coachForm.email) {
      alert("Important: Full Name, Phone, and Email Address are mandatory.");
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

  // Optional Passport upload
  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>, role: 'player' | 'coach') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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

            <form onSubmit={handleLogin} className="w-full max-w-md space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-white/40 w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="ENTER ACCESS CODE (e.g. MST2026FCL)"
                  className="w-full pl-12 pr-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-center font-mono font-bold tracking-[0.2em] outline-none text-white focus:border-primary focus:bg-white/[0.08] transition-all uppercase placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                />
              </div>

              {loginError && (
                <div className="flex items-start bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-left p-4 rounded-xl space-x-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-5 sporty-gradient rounded-2xl font-black text-sm text-dark tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center space-x-2"
              >
                <span>VERIFY & ENTER ACCREDITATION HUB</span>
                <Unlock size={16} />
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-white/5 w-full">
              <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-4 flex items-center justify-center space-x-1.5">
                <HelpCircle size={14} className="text-primary" />
                <span>DEMO ASSISTANCE / QUICK CODES</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button 
                  onClick={() => { setAccessCode('MST2026FCL'); setLoginError(''); }}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10 hover:border-white/20 transition-all font-mono text-white/70"
                >
                  Marine Science (MST)
                </button>
                <button 
                  onClick={() => { setAccessCode('IFS2026FCL'); setLoginError(''); }}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10 hover:border-white/20 transition-all font-mono text-white/70"
                >
                  Info Systems (IFS)
                </button>
                <button 
                  onClick={() => { setAccessCode('ADMIN2026'); setLoginError(''); }}
                  className="px-4 py-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl text-xs hover:bg-primary/20 transition-all font-semibold"
                >
                  Admin Terminal Access
                </button>
              </div>
            </div>
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
                <p className="text-xs text-white/40 mt-1 font-mono uppercase tracking-widest">Accreditation Access ID: {TEAM_CODES[activeTeam.id.toUpperCase()]}</p>
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
                    </div>

                    {/* Athletes ID Scan Verification workstation */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-display font-medium uppercase tracking-tight text-white italic">ATHLETES SQUAD AUDIT</h4>
                      <p className="text-xs text-white/40">Verify uploaded matric codes and confirm image integrity of FUTA student ID scans.</p>

                      {reg.players.length === 0 ? (
                        <p className="text-xs text-white/30 italic py-6 text-center">No athletes registered in this team draft yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {reg.players.map((player) => (
                            <div key={player.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10">
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
                  </div>
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

                {/* Passport Portrait Upload (Optional) */}
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Passport Photograph (Optional)</label>
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
                      accept="image/*"
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

                {/* Optional Passport portrait uploader */}
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Staff Photograph (Optional)</label>
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
                      accept="image/*"
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
    </div>
  );
}
