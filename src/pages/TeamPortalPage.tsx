import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, CheckCircle2, AlertCircle, RefreshCw, 
  Trash2, FileImage, ShieldCheck, ArrowRight, CornerDownRight, LogOut 
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { TEAMS } from '../data/mockData';
import { fclApi } from '../lib/api';
import { cn } from '../lib/utils';
import { accessCodes } from './RegistrationPortal';

const getTeamColor = (teamId: string) => {
  const mapping: Record<string, string> = {
    mst: '#00E5FF',     // Marine Science
    ifs: '#D042FF',    // Info Systems
    bdg: '#FFA000',       // Building
    mcb: '#00E676',     // Micro-Biology
    cys: '#FF1744',      // Cyber
    age: '#1DE9B6',    // Agricultural
    ana: '#2979FF',     // Anatomy
    aph: '#FF9100',      // Animal
    bch: '#E040FB',     // Bio-Chemistry
    csp: '#76FF03',      // Crop Science
    ent: '#00B0FF',     // Entrepreneurship
    fwt: '#C6FF00',      // Forestry
    ice: '#651FFF',     // ICE
    idd: '#FFE082',    // Industrial Design
    mbbs: '#F50057',       // Medicine
    phy: '#E65100',        // Physics
    phs: '#29B6F6',     // Physiology
    simt: '#FFEB3B',    // Security Investment
    sta: '#CDDC39',     // Statistics
  };
  return mapping[teamId.toLowerCase()] || '#00E5FF';
};

export default function TeamPortalPage() {
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTeamId, setActiveTeamId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Logo uploader states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [validationError, setValidationError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Backend registration data
  const [registration, setRegistration] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if team portal login is cached in localStorage
    const cachedTeam = localStorage.getItem('fcl_team_portal_id');
    const cachedAuth = localStorage.getItem('fcl_team_portal_auth');
    if (cachedTeam && cachedAuth === 'true') {
      setActiveTeamId(cachedTeam);
      setSelectedTeamId(cachedTeam);
      setIsAuthenticated(true);
      fetchRegistrationData(cachedTeam);
    }
  }, []);

  const fetchRegistrationData = async (tid: string) => {
    try {
      const res = await fclApi.getRegistrations();
      if (res && res.registrations && res.registrations[tid.toLowerCase()]) {
        setRegistration(res.registrations[tid.toLowerCase()]);
      } else {
        setRegistration(null);
      }
    } catch (err) {
      console.error("Error fetching registrations for Team Portal:", err);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!selectedTeamId) {
      setError('Please select your department team root.');
      setIsSubmitting(false);
      return;
    }

    const teamRoot = TEAMS.find(t => t.id.toLowerCase() === selectedTeamId.toLowerCase());
    if (!teamRoot) {
      setError('Selected team is invalid.');
      setIsSubmitting(false);
      return;
    }

    const correctCode = accessCodes[teamRoot.id.toUpperCase()];
    if (correctCode && accessCode.trim().toUpperCase() === correctCode.toUpperCase()) {
      setIsAuthenticated(true);
      setActiveTeamId(teamRoot.id);
      localStorage.setItem('fcl_team_portal_id', teamRoot.id);
      localStorage.setItem('fcl_team_portal_auth', 'true');
      fetchRegistrationData(teamRoot.id);
    } else {
      setError('Incorrect team authorization access code.');
    }
    setIsSubmitting(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('fcl_team_portal_id');
    localStorage.removeItem('fcl_team_portal_auth');
    setIsAuthenticated(false);
    setActiveTeamId('');
    setAccessCode('');
    setRegistration(null);
    setSelectedFile(null);
    setFilePreview(null);
    setDimensions(null);
  };

  // Drag & drop handlers
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

      // Verify dimensions
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
        // Minimum dimensions: 300 x 300 pixels
        if (img.width < 300 || img.height < 300) {
          setValidationError(`Dimensions of ${img.width}x${img.height}px are too small. Minimum size is 300x300px.`);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleUploadLogo = async () => {
    if (!activeTeamId || !selectedFile || !filePreview) return;
    if (validationError) return;

    setIsUploading(true);
    try {
      const res = await fclApi.uploadTeamLogo(
        activeTeamId,
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
        
        // Trigger a real-time reload so changes propagate instantly
        window.dispatchEvent(new MessageEvent('message', {
          data: { type: 'FCL_STATE_UPDATE' }
        }));
      }
    } catch (err: any) {
      setValidationError(err.message || 'Error occurred while saving your logo online.');
    } finally {
      setIsUploading(false);
    }
  };

  const activeTeamObj = TEAMS.find(t => t.id.toLowerCase() === activeTeamId.toLowerCase());
  const activeColor = activeTeamObj ? getTeamColor(activeTeamObj.id) : '#00E5FF';

  return (
    <div className="min-h-screen bg-dark pb-32 text-white relative">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] blur-[150px] rounded-full opacity-10 transition-colors duration-1000"
          style={{ backgroundColor: activeColor }}
        />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <PageHeader 
        title="TEAM REPRESENTATIVE PORTAL" 
        subtitle="Manage official identity logo, check approvals, and submit team badge configurations."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        
        {!isAuthenticated ? (
          /* PORTAL SECURE LOGIN BOX */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto glass p-10 rounded-[35px] border border-white/10 shadow-2xl relative"
          >
            <div className="text-center mb-10">
              <div className="w-14 h-14 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <ShieldCheck size={26} />
              </div>
              <h3 className="text-xl font-display font-black uppercase italic text-white tracking-tight">TEAM LOG-IN</h3>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mt-1.5">
                Authorized Match representative secure lock
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              
              {/* SELECT FIELD */}
              <div>
                <label className="block text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2.5">
                  Choose Department Team
                </label>
                <select 
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-6 py-4.5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm outline-none cursor-pointer transition-colors focus:border-primary"
                >
                  <option value="" className="bg-[#03050B] text-white/40">-- SELECT THE DEPT --</option>
                  {TEAMS.map(team => (
                    <option key={team.id} value={team.id} className="bg-[#03050B] text-white">
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* ACCESS CODE ACCESS */}
              <div>
                <label className="block text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2.5">
                  CLEARANCE DEPT CODE
                </label>
                <input 
                  type="password"
                  placeholder="e.g. XXX2026FCL"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full px-6 py-4.5 rounded-2xl bg-white/5 border border-white/10 focus:border-primary outline-none font-bold tracking-widest text-center text-sm uppercase transition-colors"
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-400/5 border border-red-500/15 flex items-center space-x-2.5 text-xs text-red-500">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting || !selectedTeamId || !accessCode}
                className="w-full py-5 bg-primary text-dark rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer hover:scale-102 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isSubmitting && <RefreshCw size={13} className="animate-spin" />}
                <span>ACCESS SQUAD PORTAL</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </motion.div>
        ) : (
          /* SQUAD PORTAL LOGO WORKSPACE */
          <div className="grid lg:grid-cols-12 gap-12 items-start mt-6">
            
            {/* PORTAL NAVIGATION SIDEBAR */}
            <div className="lg:col-span-4 space-y-6">
              
              <div 
                className="glass rounded-[30px] p-8 border border-white/10 relative overflow-hidden"
                style={{ borderColor: `${activeColor}33` }}
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center p-3 relative"
                    style={{ backgroundColor: `${activeColor}10`, border: `1px solid ${activeColor}22` }}
                  >
                    <img 
                      src={registration?.logoUrl || activeTeamObj?.logo} 
                      alt="Team Crest" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/default-team-logo.png';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-md font-display font-black leading-tight uppercase italic">{activeTeamObj?.name.split(' (')[0]}</h4>
                    <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-primary/10 border border-primary/20 text-primary rounded-full mt-1 inline-block">
                      {activeTeamId.toUpperCase()} OFFICIAL
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-5 mt-5 space-y-4">
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block font-mono">PORTAL ACTIONS</span>
                  
                  <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5 text-[11px] text-white/60 space-mono font-medium flex items-center space-x-2">
                    <CornerDownRight size={12} className="text-primary" />
                    <span>Manage Team Details</span>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="w-full mt-4 py-3.5 bg-red-500/10 border border-red-500/20 hover:bg-red-400/15 text-red-500 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>TEMINATE SESSION</span>
                  </button>
                </div>
              </div>

            </div>

            {/* MAIN LOGO STATUS & ACTION SCREEN */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* STATUS INDICATOR CARD */}
              <div className="glass rounded-[35px] p-8 sm:p-10 border border-white/10 relative">
                <h3 className="text-xl font-display font-black uppercase italic tracking-tight mb-2">
                  TEAM CREST STANDING
                </h3>
                <p className="text-white/40 text-xs mb-8 uppercase tracking-wider font-semibold">
                  Official logo clearance details recorded on the database
                </p>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  
                  <div className="p-5.5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-1.5">
                    <span className="text-[9px] font-bold text-white/30 uppercase block font-mono">CURRENT FLAG</span>
                    <div className="w-12 h-14 bg-black/40 border border-white/5 rounded-xl p-2 flex items-center justify-center">
                      <img 
                        src={registration?.logoUrl || activeTeamObj?.logo} 
                        alt="Logo" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/default-team-logo.png';
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-5.5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
                    <span className="text-[9px] font-bold text-white/30 uppercase block font-mono">LOGO CLEAR STATUS</span>
                    <div className="inline-flex">
                      {registration?.logoStatus === 'Approved' ? (
                        <span className="px-3 py-1 bg-green-500/5 text-green-500 border border-green-500/20 rounded-full text-[9px] font-black uppercase tracking-wider">
                          APPROVED
                        </span>
                      ) : registration?.logoStatus === 'Rejected' ? (
                        <span className="px-3 py-1 bg-red-400/5 text-red-500 border border-red-500/20 rounded-full text-[9px] font-black uppercase tracking-wider">
                          REJECTED
                        </span>
                      ) : registration?.logoUrl ? (
                        <span className="px-3 py-1 bg-amber-500/5 text-amber-500 border border-amber-500/20 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                          PENDING REVIEW
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-white/5 text-white/40 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          AWAITING UPLOAD
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5.5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
                    <span className="text-[9px] font-bold text-white/30 uppercase block font-mono">TIMELINE UPDATE</span>
                    <p className="text-xs font-bold text-white">
                      {registration?.logoUploadedAt || 'No modifications logged'}
                    </p>
                  </div>

                </div>

                {registration?.logoFeedback && (
                  <div className="mt-8 p-5 rounded-2xl bg-red-500/5 border border-red-500/15 text-xs text-red-400 font-medium">
                    <span className="font-bold text-[9px] uppercase tracking-wider block font-mono text-red-500 mb-1">
                      SUPER ADMIN AUDIT REASON:
                    </span>
                    "{registration.logoFeedback}"
                  </div>
                )}
              </div>

              {/* ACTION UPLOADER OR WARNING IF APPROVED */}
              {registration?.logoStatus === 'Approved' ? (
                /* APPROVED REPLACEMENT RULE SCREEN */
                <div className="glass rounded-[35px] p-8 sm:p-10 border border-green-500/10 bg-green-500/[0.01] relative">
                  <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-5 border border-green-500/20">
                    <CheckCircle2 size={22} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-display font-black text-green-500 uppercase italic tracking-tight mb-2">
                    Crest Clearance Approved
                  </h3>
                  <p className="text-white/50 text-xs leading-relaxed max-w-xl">
                    Your team logo has been fully cleared and verified by the Super Admin team, and is currently visible across all platform views. Only approved team representatives or Super Admins may replace this asset if an explicit change is required. To replace, upload a clean asset below.
                  </p>

                  <div className="border-t border-white/5 pt-8 mt-8">
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-white/10 rounded-3xl p-8 text-center cursor-pointer hover:bg-white/[0.01] hover:border-white/20 transition-all"
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
                          <img src={filePreview} alt="Selected override preview" className="w-20 h-20 object-contain mx-auto" />
                          <p className="text-xs font-bold text-white leading-none">{selectedFile?.name}</p>
                          <p className="text-[9px] font-mono text-white/40">
                            Size: {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : 0} MB
                            {dimensions && ` • Dimensions: ${dimensions.width}x${dimensions.height}px`}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-white/40">
                          <UploadCloud size={18} className="mx-auto" />
                          <p className="text-xs font-bold text-white">Click here to select replacement logo</p>
                          <p className="text-[8.5px] uppercase font-mono tracking-wider font-semibold">Will overwrite and queue for review</p>
                        </div>
                      )}
                    </div>

                    {validationError && (
                      <div className="mt-4 p-4 rounded-xl bg-red-400/5 border border-red-500/15 flex items-center space-x-2 text-xs text-red-500">
                        <AlertCircle size={14} />
                        <span>{validationError}</span>
                      </div>
                    )}

                    {uploadSuccess && (
                      <div className="mt-4 p-4 rounded-xl bg-green-500/5 border border-green-500/15 flex items-center space-x-2 text-xs text-green-500">
                        <CheckCircle2 size={14} />
                        <span>Logo updated successfully and queued for review!</span>
                      </div>
                    )}

                    {selectedFile && !validationError && (
                      <button 
                        onClick={handleUploadLogo}
                        disabled={isUploading}
                        className="w-full mt-4.5 py-4 bg-primary text-dark rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer hover:scale-101 transition-all"
                      >
                        {isUploading ? 'SAVING LOGO REPLACEMENT...' : 'COMMIT LOGO OVERWRITE'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* RAW IDENTITY UPLOADER SCREEN */
                <div className="glass rounded-[35px] p-8 sm:p-10 border border-white/10 relative">
                  <div className="mb-6 flex justify-between items-center">
                    <h4 className="text-xs font-bold text-white italic uppercase tracking-widest leading-none">
                      Drag and Drop File Upload
                    </h4>
                    <span className="text-[9px] font-mono text-white/30 font-bold uppercase">PNG, JPG, SVG allowed</span>
                  </div>

                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all",
                      dragActive ? "border-primary bg-primary/5 shadow-2" : "border-white/10 hover:border-white/20 bg-white/[0.01]"
                    )}
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
                        <div className="w-20 h-20 bg-black/40 border border-white/10 rounded-2xl p-2 mx-auto flex items-center justify-center">
                          <img src={filePreview} alt="Selected preview file" className="w-[85%] h-[85%] object-contain" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white max-w-[260px] truncate mx-auto">{selectedFile?.name}</p>
                          <p className="text-[9px] font-mono text-white/40">
                            Size: {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : 0} MB
                            {dimensions && ` • Dimensions: ${dimensions.width}x${dimensions.height}px`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        <div className="w-12 h-12 bg-white/[0.03] text-white/30 rounded-2xl flex items-center justify-center mx-auto">
                          <UploadCloud size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Drag & drop logo identity files here</p>
                          <p className="text-[9px] text-white/40 uppercase tracking-wider font-bold mt-1.5">Or click to select from finder</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {validationError && (
                    <div className="mt-5 p-4 rounded-xl bg-red-400/5 border border-red-500/15 flex items-center space-x-2 text-xs text-red-500">
                      <AlertCircle size={14} />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {uploadSuccess && (
                    <div className="mt-5 p-4 rounded-xl bg-green-500/5 border border-green-500/15 flex items-center space-x-2 text-xs text-green-500">
                      <CheckCircle2 size={14} />
                      <span>Team Logo uploaded successfully and queued for approval!</span>
                    </div>
                  )}

                  {selectedFile && !validationError && (
                    <button 
                      onClick={handleUploadLogo}
                      disabled={isUploading}
                      className="w-full mt-6 py-4.5 bg-primary text-dark rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer hover:scale-101 transition-transform"
                    >
                      {isUploading ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : (
                        <UploadCloud size={13} />
                      )}
                      <span>{isUploading ? 'SAVING GRAPHIC FILE...' : 'SUBMIT TEAM CREST'}</span>
                    </button>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
