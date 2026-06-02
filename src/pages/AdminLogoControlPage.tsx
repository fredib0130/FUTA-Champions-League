import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMatchState } from '../context/MatchStateContext';
import { 
  ShieldCheck, AlertCircle, CheckCircle2, XCircle, Search, 
  Trash2, Download, RefreshCw, Upload, FileImage, 
  Check, X, MessageSquare, ArrowLeft, Eye, ShieldAlert
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { TEAMS } from '../data/mockData';
import { fclApi, AuditLogItem } from '../lib/api';
import { cn } from '../lib/utils';

export default function AdminLogoControlPage() {
  const navigate = useNavigate();
  const { currentUser } = useMatchState();

  // Route security
  useEffect(() => {
    if (!currentUser) {
      navigate('/admin/login');
    } else if (currentUser.role !== 'Super Admin') {
      navigate('/admin');
    }
  }, [currentUser, navigate]);

  // Registrations state from database
  const [registrations, setRegistrations] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, Pending, Approved, Rejected, missing

  // Feedback reasons modal
  const [rejectionTeamId, setRejectionTeamId] = useState<string | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [isSubmittingRejection, setIsSubmittingRejection] = useState(false);

  // Replacement logic states
  const [replacingTeamId, setReplacingTeamId] = useState<string | null>(null);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [replacementPreview, setReplacementPreview] = useState<string | null>(null);
  const [isUploadingReplacement, setIsUploadingReplacement] = useState(false);
  const replacementInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fclApi.getRegistrations();
      if (res && res.registrations) {
        setRegistrations(res.registrations);
      }
    } catch (err) {
      console.error("Error loading logos in Admin Logo Control Panel:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'Super Admin') {
      loadData();
    }
  }, [currentUser]);

  // Trigger real-time reload for standard frames
  const triggerGlobalUpdate = () => {
    window.dispatchEvent(new MessageEvent('message', {
      data: { type: 'FCL_STATE_UPDATE' }
    }));
  };

  // Logos Verification handlers
  const handleApprove = async (teamId: string) => {
    try {
      const res = await fclApi.verifyTeamLogo(teamId, 'Approved', 'Cleared by Super Admin');
      if (res && res.success) {
        setRegistrations(prev => ({
          ...prev,
          [teamId.toLowerCase()]: res.registration
        }));
        triggerGlobalUpdate();
      }
    } catch (err) {
      alert("Error approving logo: " + err);
    }
  };

  const handleOpenRejection = (teamId: string) => {
    setRejectionTeamId(teamId);
    setRejectionFeedback('');
  };

  const handleSubmittingRejection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionTeamId || !rejectionFeedback.trim()) return;

    setIsSubmittingRejection(true);
    try {
      const res = await fclApi.verifyTeamLogo(rejectionTeamId, 'Rejected', rejectionFeedback);
      if (res && res.success) {
        setRegistrations(prev => ({
          ...prev,
          [rejectionTeamId.toLowerCase()]: res.registration
        }));
        setRejectionTeamId(null);
        setRejectionFeedback('');
        triggerGlobalUpdate();
      }
    } catch (err) {
      alert("Error rejecting logo: " + err);
    } finally {
      setIsSubmittingRejection(false);
    }
  };

  const handleDeleteLogo = async (teamId: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the logo for ${teamId.toUpperCase()}? This deletes the file physically from the backend.`)) return;
    try {
      const res = await fclApi.deleteTeamLogo(teamId);
      if (res && res.success) {
        setRegistrations(prev => {
          const cloned = { ...prev };
          if (cloned[teamId.toLowerCase()]) {
            cloned[teamId.toLowerCase()] = res.registration;
          }
          return cloned;
        });
        triggerGlobalUpdate();
      }
    } catch (err) {
      alert("Error deleting logo: " + err);
    }
  };

  const handleOpenReplacement = (teamId: string) => {
    setReplacingTeamId(teamId);
    setReplacementFile(null);
    replacementPreview && URL.revokeObjectURL(replacementPreview);
    setReplacementPreview(null);
    setTimeout(() => replacementInputRef.current?.click(), 10);
  };

  const handleReplacementFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // format checks
      const allowed = ['png', 'jpg', 'jpeg', 'svg'];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !allowed.includes(ext)) {
        alert("Unsupported file format. Allowed formats: PNG, JPG, JPEG, SVG.");
        return;
      }

      // size checks (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }

      setReplacementFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        setReplacementPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadReplacement = async () => {
    if (!replacingTeamId || !replacementFile || !replacementPreview) return;

    setIsUploadingReplacement(true);
    try {
      const res = await fclApi.uploadTeamLogo(
        replacingTeamId,
        replacementPreview,
        replacementFile.name,
        'Super Admin'
      );
      if (res && res.success) {
        // Automatically approve the logo uploaded directly by Super Admin
        const autoApproveRes = await fclApi.verifyTeamLogo(
          replacingTeamId,
          'Approved',
          'Uploaded and cleared directly by Super Admin'
        );
        
        setRegistrations(prev => ({
          ...prev,
          [replacingTeamId.toLowerCase()]: autoApproveRes.registration
        }));

        setReplacingTeamId(null);
        setReplacementFile(null);
        setReplacementPreview(null);
        triggerGlobalUpdate();
      }
    } catch (err: any) {
      alert("Error uploading replacement logo: " + err.message);
    } finally {
      setIsUploadingReplacement(false);
    }
  };

  // Triggering native download triggers
  const handleDownloadLogo = async (teamId: string, logoUrl: string) => {
    try {
      const filename = `${teamId.toUpperCase()}_logo.${logoUrl.split('.').pop()}`;
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback alternative basic link open
      window.open(logoUrl, '_blank');
    }
  };

  // Compile the status mapping of the 20 teams
  const compiledTeamsList = TEAMS.map(team => {
    const reg = registrations[team.id.toLowerCase()];
    return {
      ...team,
      logoUrl: reg?.logoUrl || null,
      logoStatus: reg?.logoStatus || 'None',
      logoUploadedBy: reg?.logoUploadedBy || null,
      logoUploadedAt: reg?.logoUploadedAt || null,
      logoFeedback: reg?.logoFeedback || null,
    };
  });

  // Filter implementation
  const filteredTeams = compiledTeamsList.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          team.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'Pending') {
      matchesStatus = team.logoStatus === 'Pending';
    } else if (statusFilter === 'Approved') {
      matchesStatus = team.logoStatus === 'Approved';
    } else if (statusFilter === 'Rejected') {
      matchesStatus = team.logoStatus === 'Rejected';
    } else if (statusFilter === 'missing') {
      matchesStatus = team.logoStatus === 'None';
    }

    return matchesSearch && matchesStatus;
  });

  if (!currentUser || currentUser.role !== 'Super Admin') {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-white">
        <ShieldAlert size={48} className="text-red-500 mb-4 animate-pulse" />
        <h2 className="text-xl font-display font-medium">Access Restricted</h2>
        <p className="text-white/40 text-xs mt-2 uppercase tracking-widest font-mono">
          Redirecting to authorized clearance terminals...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark pb-36 text-white relative">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-[450px] h-[450px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-[#651FFF]/5 blur-[150px] rounded-full" />
      </div>

      <PageHeader 
        title="TEAM LOGO MANAGEMENT" 
        subtitle="Approve custom team creations, reject skewed dimensions, or swap file formats dynamically."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        
        {/* UPPER CONTROLS BAR */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.02] p-6 rounded-[25px] border border-white/5">
          <Link to="/admin" className="inline-flex items-center space-x-2 text-xs font-bold text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={14} />
            <span>BACK TO ADMINISTRATION PANEL</span>
          </Link>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
            
            {/* SEARCH */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text"
                placeholder="Search team or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#03050C] border border-white/10 rounded-xl focus:border-primary outline-none text-xs font-bold transition-colors"
              />
            </div>

            {/* STATUS FILTER */}
            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
              className="px-4 py-3 bg-[#03050C] border border-white/10 rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-primary w-full sm:w-auto text-white"
            >
              <option value="all">ALL SUBMISSIONS</option>
              <option value="Pending">PENDING APPROVAL</option>
              <option value="Approved">APPROVED CRESTS</option>
              <option value="Rejected">REJECTED CRESTS</option>
              <option value="missing">NOT SUBMITTED (MOCK DESIGN)</option>
            </select>

            <button 
              onClick={loadData}
              className="p-3.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              title="Refresh Entries"
            >
              <RefreshCw size={14} className={cn(loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* LOADING INDICATOR */}
        {loading ? (
          <div className="text-center py-20">
            <RefreshCw className="mx-auto text-primary animate-spin mb-4" size={32} />
            <p className="text-xs font-mono text-white/45 uppercase tracking-widest font-bold">Querying official team tables...</p>
          </div>
        ) : (
          /* TEAMS LOGOS GRID */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTeams.map(team => {
              const hasReplica = team.logoUrl !== null;
              return (
                <div 
                  key={team.id}
                  className={cn(
                    "glass rounded-[32px] p-6 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between",
                    team.logoStatus === 'Pending' 
                      ? "border-amber-500/20 bg-amber-500/[0.01]" 
                      : team.logoStatus === 'Approved'
                      ? "border-green-500/10 hover:border-green-500/30 bg-green-500/[0.005]"
                      : team.logoStatus === 'Rejected'
                      ? "border-red-500/10 bg-red-500/[0.005]"
                      : "border-white/5"
                  )}
                >
                  <div className="space-y-4">
                    {/* Upper Metadata Row */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-display font-black uppercase italic tracking-tight mb-1">
                          {team.name.split(' (')[0]}
                        </h4>
                        <span className="text-[10px] font-mono text-white/40 block font-semibold">
                          DEPT ACRONYM: <span className="text-white font-black">{team.id.toUpperCase()}</span>
                        </span>
                      </div>

                      {/* Status Badging */}
                      <div>
                        {team.logoStatus === 'Approved' ? (
                          <span className="text-[9px] font-black uppercase px-2.5 py-1 bg-green-500/5 text-green-500 border border-green-500/10 rounded-full">
                            APPROVED
                          </span>
                        ) : team.logoStatus === 'Rejected' ? (
                          <span className="text-[9px] font-black uppercase px-2.5 py-1 bg-red-400/5 text-red-500 border border-red-500/10 rounded-full">
                            REJECTED
                          </span>
                        ) : team.logoStatus === 'Pending' ? (
                          <span className="text-[9px] font-black uppercase px-2.5 py-1 bg-amber-500/5 text-amber-500 border border-amber-500/10 rounded-full animate-pulse">
                            PENDING
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase px-2.5 py-1 bg-white/5 text-white/30 border border-white/5 rounded-full">
                            MOCK DESIGN
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Logo Graphic Comparison Panel */}
                    <div className="flex items-center space-x-4 bg-[#03050C]/50 p-4 border border-white/5 rounded-2xl">
                      <div className="w-20 h-20 bg-black/40 border border-white/5 rounded-xl flex items-center justify-center p-2.5 relative flex-shrink-0">
                        <img 
                          src={team.logoUrl || team.logo} 
                          alt="In-use crest logo" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/default-team-logo.png';
                          }}
                        />
                      </div>

                      <div className="space-y-1.5 font-mono text-[9px] text-white/45">
                        <p className="font-bold text-white/60">SUBMISSION INFO:</p>
                        {hasReplica ? (
                          <>
                            <p>Author: <span className="text-white tracking-wide font-black">{team.logoUploadedBy}</span></p>
                            <p>Updated: <span className="text-white font-black">{team.logoUploadedAt}</span></p>
                          </>
                        ) : (
                          <p className="text-white/30">Inherits the pre-loaded static design mockup asset.</p>
                        )}
                      </div>
                    </div>

                    {/* Rejection Feedbacks display */}
                    {team.logoFeedback && (
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 text-[10px] text-red-400 leading-relaxed font-semibold">
                        <span className="text-red-500 block uppercase text-[8px] font-mono mb-0.5">Audit Comment:</span>
                        "{team.logoFeedback}"
                      </div>
                    )}
                  </div>

                  {/* BOTTOM ACTION RAIL */}
                  <div className="border-t border-white/5 pt-4 mt-6 flex justify-between gap-2.5">
                    
                    {/* Binary Status Clearances */}
                    {team.logoStatus === 'Pending' && (
                      <div className="flex space-x-1.5 w-full">
                        <button 
                          onClick={() => handleApprove(team.id)}
                          className="flex-1 py-2.5 bg-green-500 text-dark rounded-xl font-bold text-[10px] uppercase cursor-pointer hover:bg-green-400 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Check size={11} strokeWidth={2.5} />
                          <span>Approve</span>
                        </button>
                        
                        <button 
                          onClick={() => handleOpenRejection(team.id)}
                          className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-[10px] uppercase cursor-pointer hover:bg-red-400 transition-colors flex items-center justify-center space-x-1"
                        >
                          <X size={11} strokeWidth={2.5} />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {/* Secondary Actions for Verified Logos */}
                    {team.logoStatus !== 'Pending' && (
                      <div className="flex space-x-1.5 w-full justify-between items-center">
                        <div className="flex space-x-1.5">
                          {team.logoUrl && (
                            <button 
                              onClick={() => handleDownloadLogo(team.id, team.logoUrl!)}
                              className="p-2.5 bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                              title="Download Logo"
                            >
                              <Download size={13} />
                            </button>
                          )}

                          <button 
                            onClick={() => handleOpenReplacement(team.id)}
                            className="p-2.5 bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-primary hover:bg-[#00E5FF]/20 rounded-lg transition-colors cursor-pointer"
                            title="Replace Logo"
                          >
                            <Upload size={13} />
                          </button>
                        </div>

                        {team.logoUrl && (
                          <button 
                            onClick={() => handleDeleteLogo(team.id)}
                            className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/25 rounded-lg transition-colors cursor-pointer"
                            title="Delete Logo Permanently"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* REPLACEMENT UPLOAD INPUT DIALOGS */}
      <input 
        type="file"
        ref={replacementInputRef}
        accept=".png,.jpg,.jpeg,.svg"
        onChange={handleReplacementFileChange}
        className="hidden"
      />

      {/* HIDDEN MODAL FOR LOCAL REPLACEMENT PREVIEW */}
      <AnimatePresence>
        {replacingTeamId && replacementPreview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass max-w-md w-full p-8 rounded-[35px] border border-white/10 shadow-2xl relative"
            >
              <h4 className="text-md font-display font-black uppercase italic text-center mb-6">
                PROCEED TO REPLACE LOGO FOR {replacingTeamId.toUpperCase()}?
              </h4>

              <div className="w-28 h-28 bg-black/40 border border-white/5 rounded-2xl mx-auto p-3 flex items-center justify-center mb-6">
                <img src={replacementPreview} alt="Target replacement" className="w-full h-full object-contain" />
              </div>

              <div className="text-center font-mono text-[9px] text-white/40 mb-8 lowercase space-y-1">
                <p>NAME: <span className="text-white font-bold">{replacementFile?.name}</span></p>
                <p>SIZE: <span className="text-white font-bold">{replacementFile ? (replacementFile.size / (1024 * 1024)).toFixed(2) : 0} MB</span></p>
              </div>

              <div className="flex space-x-3.5">
                <button 
                  onClick={() => {
                    setReplacingTeamId(null);
                    setReplacementPreview(null);
                  }}
                  className="flex-1 py-4 bg-white/5 rounded-2xl font-bold text-xs uppercase hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Terminate
                </button>

                <button 
                  onClick={handleUploadReplacement}
                  disabled={isUploadingReplacement}
                  className="flex-1 py-4 bg-[#00E5FF] text-dark rounded-2xl font-black text-xs uppercase cursor-pointer"
                >
                  {isUploadingReplacement ? 'Saving file...' : 'Swap Logo Identity'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL WINDOW FOR REJECTION CLEARANCES */}
      <AnimatePresence>
        {rejectionTeamId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass max-w-md w-full p-8 rounded-[35px] border border-red-500/10 shadow-2xl"
            >
              <div className="text-center mb-6">
                <MessageSquare className="mx-auto text-red-500 mb-3 animate-pulse" size={24} />
                <h4 className="text-lg font-display font-black uppercase italic tracking-tight mb-2">
                  DISAPPROVE CREST: {rejectionTeamId.toUpperCase()}
                </h4>
                <p className="text-white/45 text-[10px] uppercase font-bold tracking-wider leading-relaxed">
                  Provide audit remarks detailing reasons for rejection
                </p>
              </div>

              <form onSubmit={handleSubmittingRejection} className="space-y-6">
                <div>
                  <textarea 
                    placeholder="e.g. Logo is low resolution or aspect ratio is stretched skew. Please upload high-res square logo with transparent background."
                    rows={4}
                    value={rejectionFeedback}
                    onChange={(e) => setRejectionFeedback(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-[#03050C] border border-white/10 text-white text-xs leading-relaxed focus:border-red-500 outline-none transition-colors"
                    required
                  />
                </div>

                <div className="flex space-x-3.5">
                  <button 
                    type="button"
                    onClick={() => {
                      setRejectionTeamId(null);
                      setRejectionFeedback('');
                    }}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-xs uppercase tracking-wide transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button 
                    type="submit"
                    disabled={isSubmittingRejection || !rejectionFeedback.trim()}
                    className="flex-1 py-4 bg-red-500 hover:bg-red-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    {isSubmittingRejection && <RefreshCw size={12} className="animate-spin" />}
                    <span>Confirm Audit Reject</span>
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
