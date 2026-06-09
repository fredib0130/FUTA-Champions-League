import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, CheckCircle2, AlertCircle, ShieldAlert, ArrowLeft,
  FileImage, ShieldCheck, RefreshCw, Download, Layers, Users, Trash2, PlusCircle
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { TEAMS } from '../data/mockData';
import { fclApi } from '../lib/api';
import { cn } from '../lib/utils';
import { accessCodes } from '../constants';
import { TeamLogo } from '../components/TeamLogo';

const getTeamColor = (teamId: string) => {
  const mapping: Record<string, string> = {
    mst: '#00E5FF',     // Marine Science (Neon Cyan)
    ifs: '#D042FF',    // Info Systems (Electric Violet)
    bdg: '#FFA000',       // Building (Neon Gold/Amber)
    mcb: '#00E676',     // Micro-Biology (Neon Green)
    cys: '#FF1744',      // Cyber Security (Vibrant Crimson)
    age: '#1DE9B6',    // Agricultural (Turquoise)
    ana: '#2979FF',     // Anatomy (Cobalt Blue)
    aph: '#FF9100',      // Animal Production (Bright Orange)
    bch: '#E040FB',     // Bio-Chemistry (Bright Pink/Fuchsia)
    csp: '#76FF03',      // Crop Science (Lime Green)
    ent: '#00B0FF',     // Entrepreneurship (Azure)
    fwt: '#C6FF00',      // Forestry (Volt Yellow-Green)
    ice: '#651FFF',     // ICE (Indigo Purple)
    idd: '#FFE082',    // Industrial Design (Champagne)
    mbbs: '#F50057',       // Medicine (Rose Red)
    phy: '#E65100',        // Physics (Copper/Deep Dark Orange)
    phs: '#29B6F6',     // Physiology (Ice Blue)
    simt: '#FFEB3B',    // Security Investment (Bright Yellow)
    sta: '#CDDC39',     // Statistics (Pear Green)
  };
  return mapping[teamId.toLowerCase()] || '#00E5FF';
};

export default function TeamRegisterPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [activeTeam, setActiveTeam] = useState<typeof TEAMS[0] | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);

  // Logo Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [validationError, setValidationError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Registration backend state
  const [registration, setRegistration] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (teamId) {
      const team = TEAMS.find(t => t.id.toLowerCase() === teamId.toLowerCase());
      if (team) {
        setActiveTeam(team);
        // Check if there is already a team portal session stored in localStorage
        const storedAuth = localStorage.getItem(`fcl_portal_auth_${team.id}`);
        if (storedAuth === 'true') {
          setIsAuthenticated(true);
          fetchRegistrationData(team.id);
        }
      }
    }
  }, [teamId]);

  const fetchRegistrationData = async (tid: string) => {
    try {
      const res = await fclApi.getRegistrations();
      if (res && res.registrations && res.registrations[tid.toLowerCase()]) {
        setRegistration(res.registrations[tid.toLowerCase()]);
      }
    } catch (err) {
      console.error("Error fetching registrations:", err);
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmittingCode(true);

    if (!activeTeam) return;

    const correctCode = accessCodes[activeTeam.id.toUpperCase()];
    if (correctCode && accessCode.trim().toUpperCase() === correctCode.toUpperCase()) {
      setIsAuthenticated(true);
      localStorage.setItem(`fcl_portal_auth_${activeTeam.id}`, 'true');
      fetchRegistrationData(activeTeam.id);
    } else {
      setError('Incorrect team authorization access code.');
    }
    setIsSubmittingCode(false);
  };

  const handleLogout = () => {
    if (activeTeam) {
      localStorage.removeItem(`fcl_portal_auth_${activeTeam.id}`);
    }
    setIsAuthenticated(false);
    setAccessCode('');
    setRegistration(null);
    setSelectedFile(null);
    setFilePreview(null);
    setDimensions(null);
  };

  // Drag & Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setValidationError('');
    setUploadSuccess(false);

    // 1. Format check
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'svg'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      setValidationError('Unsupported format. Allowed formats: JPG, JPEG, PNG, SVG.');
      return;
    }

    // 2. Maximum file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('File size exceeds the 5MB limit.');
      return;
    }

    setSelectedFile(file);

    // 3. Create preview & Validate dimensions
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFilePreview(dataUrl);

      // Create an image object to verify dimensions
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
        // Minimum dimensions: 300 x 300 pixels
        if (img.width < 300 || img.height < 300) {
          setValidationError(`Dimensions of ${img.width}x${img.height}px are too small. Min: 300x300px.`);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleUploadLogo = async () => {
    if (!activeTeam || !selectedFile || !filePreview) return;
    if (validationError) return;

    setIsUploading(true);
    try {
      const res = await fclApi.uploadTeamLogo(
        activeTeam.id,
        filePreview,
        selectedFile.name,
        'Coach'
      );
      if (res && res.success) {
        setUploadSuccess(true);
        setSelectedFile(null);
        setFilePreview(null);
        setDimensions(null);
        setRegistration(res.registration);
        // Refresh context
        window.dispatchEvent(new MessageEvent('message', {
          data: { type: 'FCL_STATE_UPDATE' }
        }));
      }
    } catch (err: any) {
      setValidationError(err.message || 'Error occurred while saving your logo to the server.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!activeTeam) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-dark relative text-white">
        <div className="absolute inset-0 bg-radial-gradient from-primary/10 via-transparent to-transparent opacity-50" />
        <div className="glass p-12 max-w-md w-full rounded-[35px] border border-white/10 text-center relative z-10">
          <ShieldAlert className="mx-auto w-16 h-16 text-primary mb-6 animate-pulse" />
          <h2 className="text-2xl font-display font-black uppercase italic mb-2 tracking-tight">Team Not Found</h2>
          <p className="text-white/50 text-sm mb-8 leading-relaxed">
            The selected department acronym is not registered within the official FUTA Champions League structure.
          </p>
          <Link to="/registration" className="px-6 py-3 bg-primary text-dark font-black tracking-widest text-[10px] rounded-xl uppercase hover:scale-105 transition-transform">
            Back to Portal
          </Link>
        </div>
      </div>
    );
  }

  const teamColor = getTeamColor(activeTeam.id);

  return (
    <div className="min-h-screen bg-dark pb-32 text-white relative">
      {/* Team Glow Accent Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-0 left-1/4 w-[600px] h-[600px] blur-[180px] rounded-full opacity-10 transition-colors duration-1000"
          style={{ backgroundColor: teamColor }}
        />
        <div className="absolute bottom-1/4 right-[5%] w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <PageHeader 
        title={`${activeTeam.name.toUpperCase()} REGISTRATION`} 
        subtitle="Manage team details, upload logo identity, and complete official squad clearance."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-12">
        <div className="mb-8">
          <Link to="/registration" className="inline-flex items-center space-x-2 text-xs font-bold text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={14} />
            <span>BACK TO REGISTRATION PORTAL ENTRY</span>
          </Link>
        </div>

        {!isAuthenticated ? (
          /* AUTHORIZATION LOCK SCREEN */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto glass p-10 rounded-[35px] border border-white/10 shadow-2xl relative"
            style={{ borderColor: `${teamColor}44`, boxShadow: `0 20px 40px -15px rgba(0,0,0,0.8), 0 0 25px -10px ${teamColor}33` }}
          >
            <div className="text-center mb-10">
              <div 
                className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center p-3.5 mb-6"
                style={{ backgroundColor: `${teamColor}10`, border: `1px solid ${teamColor}33` }}
              >
                <TeamLogo teamId={activeTeam.id} logoUrl={registration?.logoUrl} size="custom" className="w-[100%] h-[100%] object-contain bg-transparent border-0 shadow-none font-bold text-[18px]" />
              </div>
              <h3 className="text-2xl font-display font-black uppercase italic text-white tracking-tight">REP AUTHORIZATION</h3>
              <p className="text-white/40 text-xs mt-2 leading-relaxed uppercase tracking-wider font-semibold">
                ENTER {activeTeam.id.toUpperCase()}'S MATCH COMMISSIONER SECURE ACCESS CODE
              </p>
            </div>

            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div>
                <label className="block text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2.5">
                  Clearance Access Code
                </label>
                <input 
                  type="password"
                  placeholder="e.g. XXX2026FCL"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 focus:border-white outline-none font-bold tracking-widest text-center text-sm uppercase transition-colors"
                  style={{ focusBorderColor: teamColor }}
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-3 text-red-500 text-xs font-medium">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmittingCode || !accessCode}
                className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-dark flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
                style={{ 
                  backgroundColor: teamColor,
                  boxShadow: `0 4px 20px ${teamColor}44` 
                }}
              >
                {isSubmittingCode && <RefreshCw size={13} className="animate-spin" />}
                <span>VERIFY & ACCESS ACCOUNT</span>
              </button>
            </form>
          </motion.div>
        ) : (
          /* AUTHENTICATED PORTAL WORKSPACE */
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            
            {/* LEFT COLUMN: LOGO UPLOAD STATUS & ACTION */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* CURRENT LOGO STATUS PANEL */}
              <div 
                className="glass rounded-[35px] p-8 border border-white/10 relative overflow-hidden"
                style={{ borderColor: `${teamColor}33` }}
              >
                <h4 className="text-xs font-bold text-glow italic uppercase tracking-widest leading-none mb-6" style={{ color: teamColor }}>
                  Current Logo Identity
                </h4>

                <div className="flex items-center space-x-6 bg-white/[0.02] p-5 rounded-3xl border border-white/5">
                  <div className="w-24 h-24 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center p-3 relative flex-shrink-0">
                    <TeamLogo teamId={activeTeam.id} logoUrl={registration?.logoUrl} size="custom" className="w-[100%] h-[100%] object-contain bg-transparent border-0 shadow-none font-bold text-[24px]" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block font-mono">STATUS BADGE</span>
                    <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border">
                      {registration?.logoStatus === 'Approved' ? (
                        <div className="flex items-center space-x-1.5 text-green-500 bg-green-500/5 border-green-500/20">
                          <CheckCircle2 size={12} />
                          <span>Approved</span>
                        </div>
                      ) : registration?.logoStatus === 'Rejected' ? (
                        <div className="flex items-center space-x-1.5 text-red-500 bg-red-400/5 border-red-500/20">
                          <AlertCircle size={12} />
                          <span>Rejected</span>
                        </div>
                      ) : registration?.logoUrl ? (
                        <div className="flex items-center space-x-1.5 text-amber-500 bg-amber-500/5 border-amber-500/20 animate-pulse">
                          <RefreshCw size={12} className="animate-spin" />
                          <span>Pending Approval</span>
                        </div>
                      ) : (
                        <div className="text-white/40 bg-white/5 border-white/10">
                          <span>NOT UPLOADED YET</span>
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] text-white/50 space-y-1 block font-mono pt-1">
                      {registration?.logoUploadedAt && (
                        <p>Uploaded: <span className="text-white font-bold">{registration.logoUploadedAt}</span></p>
                      )}
                      {registration?.logoUploadedBy && (
                        <p>By: <span className="text-white font-bold">{registration.logoUploadedBy}</span></p>
                      )}
                    </div>
                  </div>
                </div>

                {registration?.logoFeedback && (
                  <div className="mt-5 p-4.5 rounded-2xl bg-red-500/5 border border-red-500/10 text-xs leading-relaxed text-red-400">
                    <span className="font-bold text-[10px] uppercase block mb-1 font-mono text-red-500">Super Admin Feedback:</span>
                    "{registration.logoFeedback}"
                  </div>
                )}
              </div>

              {/* TEAM LOGO REGISTRATION FILE UPLOADER */}
              <div 
                className="glass rounded-[35px] p-8 border border-white/10 relative"
                style={{ borderColor: `${teamColor}22` }}
              >
                <div className="mb-6 flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white italic uppercase tracking-widest leading-none">
                    Upload New Logo
                  </h4>
                  <span className="text-[9px] font-mono text-white/30 font-bold uppercase">MAX FILE: 5MB</span>
                </div>

                {/* Requirements specification card */}
                <div className="mb-6 p-4.5 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] text-white/40 space-y-2 font-mono">
                  <p className="font-bold text-white/60 tracking-wider">LOGO REQUIREMENTS SUMMARY:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Accepted Formats: <span className="text-primary font-bold">JPG, JPEG, PNG, SVG</span></li>
                    <li>Resolution Range: <span className="text-white">Min 300 x 300px</span> (Rec: 1000x1000px)</li>
                    <li>Sizing preference: <span className="text-white">Transparent square back preferred</span></li>
                  </ul>
                </div>

                {/* DRAG AND DROP BOX */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all",
                    dragActive 
                      ? "border-primary bg-primary/5 scale-[1.02]" 
                      : "border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]"
                  )}
                  style={dragActive ? { borderColor: teamColor, backgroundColor: `${teamColor}08` } : {}}
                >
                  <input 
                    type="file"
                    ref={fileInputRef}
                    accept=".png,.jpg,.jpeg,.svg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {filePreview ? (
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-black/30 border border-white/10 rounded-2xl p-2 mx-auto flex items-center justify-center">
                        <img src={filePreview} alt="Selected preview" className="w-[85%] h-[85%] object-contain" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white max-w-[220px] truncate mx-auto">{selectedFile?.name}</p>
                        <p className="text-[9px] font-mono text-white/40">
                          Size: {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : 0} MB
                          {dimensions && ` • Dimensions: ${dimensions.width}x${dimensions.height}px`}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 bg-white/10 border border-white/5 rounded-full inline-block">
                        Click to Replace file
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto text-white/30">
                        <UploadCloud size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Drag & Drop Logo File Here</p>
                        <p className="text-[9px] text-white/40 mt-1 uppercase tracking-wider font-semibold">Or click to select from file system</p>
                      </div>
                    </div>
                  )}
                </div>

                {validationError && (
                  <div className="mt-5 p-4 rounded-xl bg-red-400/5 border border-red-500/15 flex items-center space-x-2.5 text-xs text-red-500">
                    <AlertCircle size={14} />
                    <span>{validationError}</span>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="mt-5 p-4 rounded-xl bg-green-500/5 border border-green-500/15 flex items-center space-x-2.5 text-xs text-green-500">
                    <CheckCircle2 size={14} />
                    <span>Team Logo uploaded successfully and queued for approval!</span>
                  </div>
                )}

                {/* ACTION TRIGGER UPLOAD */}
                {selectedFile && !validationError && (
                  <button 
                    onClick={handleUploadLogo}
                    disabled={isUploading}
                    className="w-full mt-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-[#03050B] shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                    style={{ 
                      backgroundColor: teamColor,
                      boxShadow: `0 4px 15px ${teamColor}33`
                    }}
                  >
                    {isUploading ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <UploadCloud size={13} />
                    )}
                    <span>{isUploading ? 'SAVING FILE TO DISK...' : 'UPLOAD LOGO SECURELY'}</span>
                  </button>
                )}
              </div>

              {/* LOCK SIGN-OUT FOOTER */}
              <div className="text-center">
                <button 
                  onClick={handleLogout}
                  className="px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl font-bold text-[10px] tracking-widest uppercase transition-colors"
                >
                  Terminate Manager Session
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN: COMPLETE SQUAD REG_PORTAL LINK */}
            <div className="lg:col-span-7 space-y-8">
              <div className="glass rounded-[35px] p-8 sm:p-12 border border-white/10 text-left relative overflow-hidden">
                <div 
                  className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-[80px] opacity-10 pointer-events-none" 
                  style={{ backgroundColor: teamColor }} 
                />
                
                <h3 className="text-3xl font-display font-black uppercase italic tracking-tight mb-2">
                  ROSTER CLEARED SHEET
                </h3>
                <p className="text-white/40 text-sm mb-8 leading-relaxed max-w-xl">
                  Clearance for players and technical coaches. After updating your Team Logo, verify the roster clearance sheet. Registered athletes automatically sync onto live matches and rankings.
                </p>

                <div className="grid sm:grid-cols-2 gap-6 mb-10">
                  <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center space-x-4">
                    <div className="p-3.5 rounded-xl bg-primary/10 text-primary">
                      <Users size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-white/30 block font-bold uppercase">PLAYERS CREDS</span>
                      <span className="text-2xl font-display font-black text-white italic">
                        {registration?.players?.length || 0} / 23
                      </span>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center space-x-4">
                    <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-400">
                      <Layers size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-white/30 block font-bold uppercase">COACHES CREDS</span>
                      <span className="text-2xl font-display font-black text-white italic">
                        {registration?.coaches?.length || 0} / 2
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/registration" 
                    className="flex-1 py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-center font-black tracking-widest text-xs uppercase rounded-2xl hover:scale-102 transition-transform shadow-inner inline-block"
                  >
                    GO TO REGISTRATION PORTAL
                  </Link>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
