import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMatchState } from '../context/MatchStateContext';
import { fclApi } from '../lib/api';
import { 
  Camera, FileText, Newspaper, Trash2, Plus, UploadCloud, 
  CheckCircle, Image as ImageIcon, ArrowLeft, ChevronRight, 
  AlertCircle, Eye, RefreshCw, Send, ImagePlus, Sparkles, BookOpen
} from 'lucide-react';
import { Article, NewsItem, MatchPhoto } from '../types';

interface AdminMediaProps {
  defaultTab?: string;
}

export default function AdminMedia({ defaultTab }: AdminMediaProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    currentUser, matches, articles, newsItems, matchPhotos,
    saveArticle, deleteArticle, saveNewsItem, deleteNewsItem,
    saveMatchPhoto, deleteMatchPhoto, saveMatchReport, reports
  } = useMatchState();

  // Tab management: 'photos' | 'reports' | 'news' | 'articles'
  const [activeTab, setActiveTab] = useState<string>(defaultTab || searchParams.get('tab') || 'photos');

  // Route Guard
  useEffect(() => {
    if (!currentUser) {
      navigate('/admin/login');
    } else {
      const allowedRoles = ['Super Admin', 'Match Commissioner', 'Media Officer'];
      if (!allowedRoles.includes(currentUser.role)) {
        alert('Permission Denied: Your administrative role lacks access to Media Management!');
        navigate('/admin/dashboard');
      }
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  // 1. STATE FOR PHOTO UPLOADER
  const [photoMatchId, setPhotoMatchId] = useState<string>(matches[0]?.id || '');
  const [photoCategory, setPhotoCategory] = useState<string>('Match Action');
  const [folderStage, setFolderStage] = useState<string>('2026/MD1');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [photoUploadLogs, setPhotoUploadLogs] = useState<Array<{ msg: string; type: 'info' | 'success' | 'detail' }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // 2. STATE FOR MATCH REPORT
  const [reportMatchId, setReportMatchId] = useState<string>(matches[0]?.id || '');
  const [reportTitle, setReportTitle] = useState<string>('');
  const [reportSubtitle, setReportSubtitle] = useState<string>('');
  const [reportSummary, setReportSummary] = useState<string>('');
  const [reportExcitement, setReportExcitement] = useState<number>(8);
  const [reportFeaturedImg, setReportFeaturedImg] = useState<string>('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000');
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);

  // Sync edit existing report if selected match changes
  useEffect(() => {
    const existing = reports[reportMatchId];
    if (existing) {
      setReportTitle(existing.title || '');
      setReportSubtitle(existing.subtitle || '');
      setReportSummary(existing.summary || '');
      setReportExcitement(existing.excitementRating || 8);
      setReportFeaturedImg(existing.featuredImage || 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=1000');
    } else {
      const matched = matches.find(m => m.id === reportMatchId);
      if (matched) {
        setReportTitle(`Matchday Report: ${matched.homeTeam} vs ${matched.awayTeam}`);
        setReportSubtitle(`Thrilling tactical faceoff ending ${matched.homeScore}-${matched.awayScore}`);
      } else {
        setReportTitle('');
        setReportSubtitle('');
      }
      setReportSummary('');
      setReportExcitement(8);
      setReportFeaturedImg('https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=1000');
    }
  }, [reportMatchId, matches, reports]);

  // 3. STATE FOR FEATURED ARTICLES
  const [articleId, setArticleId] = useState<string>('');
  const [articleTitle, setArticleTitle] = useState<string>('');
  const [articleCategory, setArticleCategory] = useState<string>('Match Preview');
  const [articleFeaturedImg, setArticleFeaturedImg] = useState<string>('https://images.unsplash.com/photo-1517649763962-0c623066013B?q=80&w=1000');
  const [articleBody, setArticleBody] = useState<string>('');
  const [articleTags, setArticleTags] = useState<string>('');
  const [articleMatchId, setArticleMatchId] = useState<string>('');
  const [articleIsPublished, setArticleIsPublished] = useState<boolean>(true);

  // 4. STATE FOR NEWS ITEMS
  const [newsId, setNewsId] = useState<string>('');
  const [newsTitle, setNewsTitle] = useState<string>('');
  const [newsCategory, setNewsCategory] = useState<string>('Committee Announcement');
  const [newsFeaturedImg, setNewsFeaturedImg] = useState<string>('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000');
  const [newsBody, setNewsBody] = useState<string>('');
  const [newsTags, setNewsTags] = useState<string>('');
  const [newsIsPublished, setNewsIsPublished] = useState<boolean>(true);

  // Helper to load file to base64
  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("Validation Error: File exceeds maximum size limit of 10MB!");
      return;
    }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert("Unsupported Format: Only JPG, JPEG, PNG, and WEBP formats are accepted.");
      return;
    }
    setPhotoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Photo Submission with Compression Logging Simulator
  const handlePhotoUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile || !photoBase64) {
      alert("Please select or drop an image file first.");
      return;
    }

    // 50 images check per match
    const currentMatchPhotos = matchPhotos.filter(p => p.matchId === photoMatchId);
    if (currentMatchPhotos.length >= 50) {
      alert(`Upload Blocked: Maximum uploads limit of 50 images per match reached for Match ID ${photoMatchId}!`);
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoUploadLogs([
      { msg: `Staging upload: ${photoFile.name} (Size: ${(photoFile.size / (1024 * 1024)).toFixed(2)} MB)`, type: 'info' }
    ]);

    try {
      // Direct call to node backend optimizer API
      const res = await fclApi.uploadMediaFile(photoBase64, photoFile.name, 'match-photos', folderStage);
      
      if (res && res.success) {
        setPhotoUploadLogs(prev => [
          ...prev,
          { msg: `Optimization Complete: Running native pipeline... Saved inside public/uploads/match-photos/${folderStage}`, type: 'detail' },
          { msg: `Weight Reduction: Original size ${res.originalSize} scaled down to ${res.compressedSize} (Saved ${res.ratio})`, type: 'detail' },
          { msg: `File link registered: ${res.url}`, type: 'success' }
        ]);

        const newPhoto: MatchPhoto = {
          id: `photo-${Date.now()}`,
          matchId: photoMatchId,
          fileUrl: res.url,
          category: photoCategory as any,
          uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          uploadedBy: currentUser.username,
          originalSize: res.originalSize,
          compressedSize: res.compressedSize,
          ratio: res.ratio,
          folderStage
        };

        // Update context & sync
        saveMatchPhoto(newPhoto);

        // Reset file form
        setPhotoFile(null);
        setPhotoBase64('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setPhotoUploadLogs(prev => [
        ...prev,
        { msg: `Upload failed: ${err.message || 'Server error'}`, type: 'info' }
      ]);
      alert("Upload failed: " + (err.message || "Endpoint error"));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Match Report Submission
  const handlePublishReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle || !reportSummary) {
      alert("Title and summary breakdown are required.");
      return;
    }

    setIsSubmittingReport(true);
    saveMatchReport(reportMatchId, {
      title: reportTitle,
      subtitle: reportSubtitle,
      summary: reportSummary,
      excitementRating: Number(reportExcitement),
      featuredImage: reportFeaturedImg
    });

    setTimeout(() => {
      setIsSubmittingReport(false);
      alert("Post-match tactical analysis report published successfully!");
    }, 600);
  };

  // Feature Stories Submit
  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle || !articleBody) {
      alert("Title and body copy are required.");
      return;
    }

    const item: Article = {
      id: articleId || `art-${Date.now()}`,
      title: articleTitle,
      featuredImage: articleFeaturedImg,
      author: currentUser.username,
      category: articleCategory as any,
      body: articleBody,
      tags: articleTags.split(',').map(t => t.trim()).filter(Boolean),
      isPublished: articleIsPublished,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      matchId: articleMatchId || undefined
    };

    saveArticle(item);
    
    // Clear forms
    setArticleId('');
    setArticleTitle('');
    setArticleBody('');
    setArticleTags('');
    setArticleMatchId('');
    
    alert("Spotlight feature story published successfully!");
  };

  // News Announcements Submit
  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsBody) {
      alert("Title and body text are required.");
      return;
    }

    const item: NewsItem = {
      id: newsId || `news-${Date.now()}`,
      title: newsTitle,
      featuredImage: newsFeaturedImg,
      author: currentUser.username,
      category: newsCategory as any,
      body: newsBody,
      tags: newsTags.split(',').map(t => t.trim()).filter(Boolean),
      isPublished: newsIsPublished,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    saveNewsItem(item);

    // Clear forms
    setNewsId('');
    setNewsTitle('');
    setNewsBody('');
    setNewsTags('');

    alert("Committee board update successfully published.");
  };

  return (
    <div className="min-h-screen bg-navy text-white pb-32">
      {/* Admin header rail */}
      <div className="bg-navy-dark border-b border-white/10 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors text-xs font-black uppercase cursor-pointer">
            <ArrowLeft size={16} />
            <span>Return to cockpit</span>
          </Link>
          <div className="text-right">
            <span className="text-xs font-black uppercase tracking-widest text-[#00e5ff]">FCL MEDIA DESK</span>
            <p className="text-[10px] text-white/40">Logged in: {currentUser.username} ({currentUser.role})</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Banner with style */}
        <div className="p-8 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 to-indigo-500/5 mb-10 flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-[#00e5ff] tracking-widest uppercase">Akure Sports Hub Controls</span>
            <h1 className="text-4xl font-display font-black tracking-tight uppercase italic text-white mt-1">MEDIA OPERATIONS WORKSPACE</h1>
            <p className="text-sm text-white/60 mt-1 max-w-2xl">Publish photography reels, record tactical summaries, broadcast committee resolutions, and feed the live FCL media ecosystem.</p>
          </div>
          <Camera className="w-16 h-16 text-primary/20 hidden md:block" />
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 mb-8 overflow-x-auto scroller-hidden">
          {[
            { id: 'photos', label: '📸 Photo Upload Hub', desc: 'Publish JPG/PNG' },
            { id: 'reports', label: '📝 Match Reports', desc: 'Game highlights & analysis' },
            { id: 'news', label: '📰 News & Announcements', desc: 'Committee and schedules' },
            { id: 'articles', label: '🌟 Featured Spotlight Stories', desc: 'Interactive previews' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-6 border-b-2 font-black text-xs uppercase tracking-wider flex-shrink-0 flex flex-col items-start transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'border-primary text-white' 
                  : 'border-transparent text-white/45 hover:text-white/80'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[9px] font-medium text-white/30 capitalize tracking-normal mt-0.5">{tab.desc}</span>
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLUMNS: CORE FORMS */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. PHOTO HUB TAB */}
            {activeTab === 'photos' && (
              <div className="glass rounded-3xl border border-white/10 p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-display font-black text-white uppercase italic">UPLOAD NEW GAME PHOTOGRAPHY</h3>
                  <p className="text-xs text-white/50 mt-1">Files are optimized on the container backend automatically. JPG, JPEG, PNG, WEBP limit 10MB.</p>
                </div>

                <form onSubmit={handlePhotoUploadSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/40 mb-2">TARGET MATCH FIXTURE</label>
                      <select
                        value={photoMatchId}
                        onChange={(e) => setPhotoMatchId(e.target.value)}
                        className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary focus:outline-none"
                      >
                        {matches.map(m => (
                          <option key={m.id} value={m.id}>{m.homeTeam} vs {m.awayTeam} (MW{m.matchday})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/40 mb-2">CATEGORY / STAGE</label>
                      <select
                        value={photoCategory}
                        onChange={(e) => setPhotoCategory(e.target.value)}
                        className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary focus:outline-none"
                      >
                        <option value="Match Action">⚽ Match Action Shooting</option>
                        <option value="Goal Celebration">🔥 Goal Celebration</option>
                        <option value="Team Photo">🛡️ Team Alignment Photograph</option>
                        <option value="Player Profile">👤 Player Spotlight Portrait</option>
                        <option value="Crowd">📣 Campus Crowd & Support</option>
                        <option value="Man of the Match">🏆 Man of the Match Frame</option>
                        <option value="Post-match Interview">🎤 Post-Match Interview</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/40 mb-2">FOLDER PATH (SUBFOLDER)</label>
                      <input
                        type="text"
                        placeholder="e.g. 2026/MD1"
                        value={folderStage}
                        onChange={(e) => setFolderStage(e.target.value)}
                        className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Drag and Drop Box */}
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleUploadClick}
                    className={`border-2 border-dashed rounded-3xl p-10 cursor-pointer flex flex-col items-center justify-center transition-all ${
                      dragActive ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/25 bg-navy/50'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                      className="hidden" 
                      accept="image/*"
                    />
                    
                    {photoFile ? (
                      <div className="text-center space-y-3">
                        <ImageIcon className="w-12 h-12 text-[#00e5ff] mx-auto animate-bounce" />
                        <p className="text-xs font-bold text-white">{photoFile.name}</p>
                        <p className="text-[10px] text-white/40">File Size: {(photoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); setPhotoFile(null); setPhotoBase64(''); }}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-[9px] font-black uppercase cursor-pointer"
                        >
                          Clear File
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <UploadCloud className="w-12 h-12 text-white/30 mx-auto" />
                        <p className="text-xs font-bold">Drag & drop your photograph here, or <span className="text-primary italic">browse files</span></p>
                        <p className="text-[9px] text-white/30">Supports JPEG, JPG, PNG, WEBP — Max file size 10MB</p>
                      </div>
                    )}
                  </div>

                  {/* Upload logs / optimization terminal */}
                  {photoUploadLogs.length > 0 && (
                    <div className="bg-dark/90 rounded-2xl p-5 border border-white/5 font-mono text-[10px] space-y-1.5 text-white/70">
                      <div className="text-primary border-b border-white/5 pb-1 uppercase font-bold tracking-widest text-[9px]">Compressor Core Console Logs</div>
                      {photoUploadLogs.map((log, i) => (
                        <div key={i} className={
                          log.type === 'success' ? 'text-green-400' : 
                          log.type === 'detail' ? 'text-blue-300 italic' : 'text-yellow-400'
                        }>
                          &gt; {log.msg}
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUploadingPhoto || !photoFile}
                    className="w-full py-4 bg-primary hover:bg-primary-hover text-dark font-black tracking-widest text-xs uppercase rounded-xl transition-all flex items-center justify-center space-x-2 disabled:bg-white/5 disabled:text-white/30 disabled:border disabled:border-white/5 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <RefreshCw className="animate-spin w-4 h-4" />
                        <span>OPTIMIZING & UPLOADING REALTIME IMAGE...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>PUBLISH PHOTO TO CORRESPONDING MATCH REEL</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* 2. MATCH REPORTS TAB */}
            {activeTab === 'reports' && (
              <div className="glass rounded-3xl border border-white/10 p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-display font-black text-white uppercase italic">WRITE GAME TACTICAL MATCH REPORT</h3>
                  <p className="text-xs text-white/50 mt-1">Construct detailed matches summaries and record excitement analytics. Real state updates instantly.</p>
                </div>

                <form onSubmit={handlePublishReport} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/40 mb-2">SELECT MATCH FIXTURE</label>
                      <select
                        value={reportMatchId}
                        onChange={(e) => setReportMatchId(e.target.value)}
                        className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary focus:outline-none"
                      >
                        {matches.map(m => (
                          <option key={m.id} value={m.id}>{m.homeTeam} vs {m.awayTeam} (MW{m.matchday})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/40 mb-2">EXCITEMENT INDEX (1-10 STARS)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={reportExcitement}
                        onChange={(e) => setReportExcitement(Number(e.target.value))}
                        className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-white/40 mb-2">ARTICLE HEADLINE TITLE</label>
                    <input
                      type="text"
                      placeholder="e.g. Total Domination: MST Clinch 3 Points Over ICE"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-white/40 mb-2">SECONDARY HOOK SUBTITLE / INTRO</label>
                    <input
                      type="text"
                      placeholder="A brilliant volley by captain Ojo secured a 1-0 victory in front of 3,000 students"
                      value={reportSubtitle}
                      onChange={(e) => setReportSubtitle(e.target.value)}
                      className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-white/40 mb-2">TACTICAL MATCH BODY / ANALYSIS (MARKDOWN SUPPORTED)</label>
                    <textarea
                      rows={8}
                      placeholder="Discuss tactical setups (4-3-3 vs 4-4-2), yellow cautions, weather status, player performances, goals timelines, and committee announcements..."
                      value={reportSummary}
                      onChange={(e) => setReportSummary(e.target.value)}
                      className="w-full bg-navy border border-white/10 rounded-xl p-4 text-xs font-medium text-white focus:border-primary focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-white/40 mb-2">FEATURED PHOTO URL</label>
                    <input
                      type="text"
                      value={reportFeaturedImg}
                      onChange={(e) => setReportFeaturedImg(e.target.value)}
                      className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="w-full py-4 bg-[#00e5ff] hover:bg-opacity-90 text-dark font-black tracking-widest text-xs uppercase rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Send size={15} />
                    <span>{isSubmittingReport ? "SAVING AND BROADCASTING REPORT..." : "PUBLISH POST-GAME TACTICAL REPORT"}</span>
                  </button>
                </form>
              </div>
            )}

            {/* 3. NEWS & UPDATES TAB */}
            {activeTab === 'news' && (
              <div className="glass rounded-3xl border border-white/10 p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-display font-black text-white uppercase italic">CREATE NEWS OR COMMITTEE Resolution</h3>
                  <p className="text-xs text-white/50 mt-1">Publish operational fixtures adjustments, accreditation mandates, or general updates here.</p>
                </div>

                <form onSubmit={handleSaveNews} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/40 mb-2">NEWS LEVEL / CATEGORY</label>
                      <select
                        value={newsCategory}
                        onChange={(e) => setNewsCategory(e.target.value)}
                        className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary focus:outline-none"
                      >
                        <option value="Committee Announcement">🏛️ Official FCL Committee Release</option>
                        <option value="Registration Updates">📋 Squad Accreditation & Registrations</option>
                        <option value="Fixture Announcement">⚽ Fixture Updates & Scheduling</option>
                        <option value="General News">🌟 General Campus Sports Highlights</option>
                        <option value="Partner News">🤝 Partners & Sponsors Updates</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/40 mb-2">FEATURED BANNER IMAGE URL</label>
                      <input
                        type="text"
                        value={newsFeaturedImg}
                        onChange={(e) => setNewsFeaturedImg(e.target.value)}
                        className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-white/40 mb-2">NEWS ANNOUNCEMENT TITLE</label>
                    <input
                      type="text"
                      placeholder="Matric submission credentials deadline extended to Wednesday"
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-white/40 mb-2">BODY AND DETAIL DESCRIPTION</label>
                    <textarea
                      rows={6}
                      placeholder="Publish official statement or bulletin updates here..."
                      value={newsBody}
                      onChange={(e) => setNewsBody(e.target.value)}
                      className="w-full bg-navy border border-white/10 rounded-xl p-4 text-xs font-medium text-white focus:border-primary focus:outline-none font-sans"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/40 mb-2">KEYWORDS / TAGS (COMMA SEPARATED)</label>
                      <input
                        type="text"
                        placeholder="Accreditation, Extention, Registration"
                        value={newsTags}
                        onChange={(e) => setNewsTags(e.target.value)}
                        className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/40 mb-2">PUBLISH STATUS</label>
                      <div className="flex items-center space-x-3 mt-3">
                        <input
                          type="checkbox"
                          id="newsIsPublished"
                          checked={newsIsPublished}
                          onChange={(e) => setNewsIsPublished(e.target.checked)}
                          className="w-4 h-4 text-primary bg-navy border-white/10 rounded focus:ring-primary"
                        />
                        <label htmlFor="newsIsPublished" className="text-xs font-bold uppercase text-white/80">Make news public instantly</label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-primary hover:bg-primary-hover text-dark font-black tracking-widest text-xs uppercase rounded-xl transition-all cursor-pointer"
                  >
                    <span>{newsId ? "UPDATE RESOLUTION" : "PUBLISH TO COMMITTEE BULLETIN BOARD"}</span>
                  </button>
                </form>
              </div>
            )}

            {/* 4. FEATURED STORIES SPOTLIGHTS TAB */}
            {activeTab === 'articles' && (
              <div className="glass rounded-3xl border border-white/10 p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-display font-black text-white uppercase italic">CREATE FEATURE STORY & SPOTLIGHT</h3>
                  <p className="text-xs text-white/50 mt-1">Perfect for deep previews, player profile spotlights, or historical tournament analysis.</p>
                </div>

                <form onSubmit={handleSaveArticle} className="space-y-6">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/40 mb-2">ARTICLE GENRE / CATEGORY</label>
                      <select
                        value={articleCategory}
                        onChange={(e) => setArticleCategory(e.target.value)}
                        className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary focus:outline-none"
                      >
                        <option value="Match Preview">🔮 Detailed Match Preview</option>
                        <option value="Team Spotlight">🛡️ Team Profile Spotlight</option>
                        <option value="Tactical Analysis">🧠 Advanced Tactical Chessboard</option>
                        <option value="Historical">🏆 Historical FCL Archives</option>
                        <option value="Player Spotlight">👤 Star Athlete Profile</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/40 mb-2">FEATURED MAIN BANNER URL</label>
                      <input
                        type="text"
                        value={articleFeaturedImg}
                        onChange={(e) => setArticleFeaturedImg(e.target.value)}
                        className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/40 mb-2">LINK TO CORRESPONDING MATCH FIXTURE</label>
                      <select
                        value={articleMatchId}
                        onChange={(e) => setArticleMatchId(e.target.value)}
                        className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary focus:outline-none"
                      >
                        <option value="">-- None (General Article) --</option>
                        {matches.map(m => (
                          <option key={m.id} value={m.id}>{m.homeTeam} vs {m.awayTeam} (MW{m.matchday})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-white/40 mb-2">FEATURE ARTICLE CAPTION HEADLINE</label>
                    <input
                      type="text"
                      placeholder="e.g. Underdog Rise: How SIMT Redefined Akure Campus Football Tactics"
                      value={articleTitle}
                      onChange={(e) => setArticleTitle(e.target.value)}
                      className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-white/40 mb-2">MAIN EDITORIAL BODY CONTENT (MARKDOWN COMPLIANT)</label>
                    <textarea
                      rows={10}
                      placeholder="Start writing the story here with generous spacing..."
                      value={articleBody}
                      onChange={(e) => setArticleBody(e.target.value)}
                      className="w-full bg-navy border border-white/10 rounded-xl p-4 text-xs font-medium text-white focus:border-primary focus:outline-none font-sans"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/40 mb-2">COMMA SPLIT METADATA SEARCH TAGS</label>
                      <input
                        type="text"
                        placeholder="SIMT, Spotlight, Tactical"
                        value={articleTags}
                        onChange={(e) => setArticleTags(e.target.value)}
                        className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/40 mb-2">ARTICLE PUBLISHING STATUS</label>
                      <div className="flex items-center space-x-3 mt-3">
                        <input
                          type="checkbox"
                          id="artIsPublished"
                          checked={articleIsPublished}
                          onChange={(e) => setArticleIsPublished(e.target.checked)}
                          className="w-4 h-4 text-primary bg-navy border-white/10 rounded focus:ring-primary"
                        />
                        <label htmlFor="artIsPublished" className="text-xs font-bold uppercase text-white/80">Make spotlight public instantly</label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#00e5ff] hover:bg-opacity-90 text-dark font-black tracking-widest text-xs uppercase rounded-xl transition-all cursor-pointer"
                  >
                    <span>{articleId ? "UPDATE SPOTLIGHT PIECE" : "PUBLISH FEATURE ARTICLE STORY"}</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: RECENT DIGITAL ASSETS / SYSTEM METADATA PREVIEWS */}
          <div className="space-y-6">
            
            {/* Realtime stats card */}
            <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
              <h4 className="text-xs font-black uppercase text-[#00e5ff] tracking-widest">REALTIME MEDIA METADATA COUNTS</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-navy p-4 rounded-2xl border border-white/5">
                  <span className="text-[9px] font-black text-white/35 block uppercase">GALLERY WEIGHT</span>
                  <div className="flex items-baseline space-x-1.5 mt-1">
                    <span className="text-2xl font-display font-black text-white">{matchPhotos.length}</span>
                    <span className="text-[9px] text-white/40">images</span>
                  </div>
                </div>
                <div className="bg-navy p-4 rounded-2xl border border-white/5">
                  <span className="text-[9px] font-black text-white/35 block uppercase">PUBLISHED REPORTS</span>
                  <div className="flex items-baseline space-x-1.5 mt-1">
                    <span className="text-2xl font-display font-black text-white">{Object.keys(reports).length}</span>
                    <span className="text-[9px] text-white/40">articles</span>
                  </div>
                </div>
                <div className="bg-navy p-4 rounded-2xl border border-white/5">
                  <span className="text-[9px] font-black text-white/35 block uppercase">COMMITTEE ADVISES</span>
                  <div className="flex items-baseline space-x-1.5 mt-1">
                    <span className="text-2xl font-display font-black text-white">{newsItems.length}</span>
                    <span className="text-[9px] text-white/40 font-mono">releases</span>
                  </div>
                </div>
                <div className="bg-navy p-4 rounded-2xl border border-white/5">
                  <span className="text-[9px] font-black text-white/35 block uppercase">FEATURED SPOTLIGHTS</span>
                  <div className="flex items-baseline space-x-1.5 mt-1">
                    <span className="text-2xl font-display font-black text-white">{articles.length}</span>
                    <span className="text-[9px] text-[#00e5ff] font-bold">stories</span>
                  </div>
                </div>
              </div>
            </div>

            {/* List match photos uploaded */}
            {activeTab === 'photos' && (
              <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h4 className="text-xs font-black uppercase text-white tracking-widest">RECENT MATCH PHOTOGRAPHS</h4>
                  <span className="text-[9px] bg-white/10 text-white px-2 py-0.5 rounded font-mono font-bold">{matchPhotos.length}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
                  {matchPhotos.map((photo) => (
                    <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square border border-white/5 bg-dark">
                      <img src={photo.fileUrl} className="w-full h-full object-cover" alt="Uploaded asset" />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="text-[8px] font-bold text-white/50 uppercase leading-tight font-mono">
                          {photo.category}<br />
                          {photo.compressedSize || '1.8 MB'}
                        </div>
                        <button
                          onClick={() => {
                            if (confirm("Delete this photograph from media vault?")) {
                              deleteMatchPhoto(photo.id);
                            }
                          }}
                          className="w-full text-center py-1 bg-red-500/80 hover:bg-red-500 text-white rounded text-[8px] font-black uppercase flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Trash2 size={10} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {matchPhotos.length === 0 && (
                    <div className="col-span-2 text-center text-xs text-white/40 py-10 font-medium">No photos in match vault yet.</div>
                  )}
                </div>
              </div>
            )}

            {/* List articles preview */}
            {activeTab === 'articles' && (
              <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h4 className="text-xs font-black uppercase text-white tracking-widest">ACTIVE SPECIAL FEATURES</h4>
                  <span className="text-[9px] bg-primary/25 text-primary px-2 py-0.5 rounded font-bold">{articles.length}</span>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {articles.map((art) => (
                    <div key={art.id} className="bg-navy p-3 rounded-2xl border border-white/5 flex items-center justify-between gap-3 hover:border-primary/25 transition-all">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <img src={art.featuredImage} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" alt="" />
                        <div className="overflow-hidden">
                          <h5 className="font-bold text-xs text-white truncate">{art.title}</h5>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-primary tracking-wider uppercase inline-block mt-0.5 font-bold">{art.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Delete article: ${art.title}?`)) {
                            deleteArticle(art.id);
                          }
                        }}
                        className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List news items */}
            {activeTab === 'news' && (
              <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h4 className="text-xs font-black uppercase text-white tracking-widest">COMMITTEE BULLETIN CARDS</h4>
                  <span className="text-[9px] bg-primary/25 text-primary px-2 py-0.5 rounded font-bold">{newsItems.length}</span>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {newsItems.map((n) => (
                    <div key={n.id} className="bg-navy p-3 rounded-2xl border border-white/5 flex items-center justify-between gap-3 hover:border-[#00e5ff]/25 transition-all">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <img src={n.featuredImage} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" alt="" />
                        <div className="overflow-hidden">
                          <h5 className="font-bold text-xs text-white truncate">{n.title}</h5>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#00e5ff]/10 text-[#00e5ff] inline-block mt-0.5 font-bold tracking-wider uppercase">{n.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Delete bulletin: ${n.title}?`)) {
                            deleteNewsItem(n.id);
                          }
                        }}
                        className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List match reports */}
            {activeTab === 'reports' && (
              <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
                <h4 className="text-xs font-black uppercase text-white tracking-widest border-b border-white/5 pb-3">ACTIVE GAME RELEASES</h4>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {matches.map(m => {
                    const r = reports[m.id];
                    return (
                      <div key={m.id} className="bg-navy p-3 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div>
                          <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Matchday {m.matchday}</div>
                          <h5 className="font-bold text-xs text-white mt-0.5">{m.homeTeam} vs {m.awayTeam}</h5>
                          {r ? (
                            <span className="text-[8px] text-green-400 font-bold uppercase tracking-wider mt-1 inline-flex items-center gap-1">
                              <CheckCircle size={10} /> Published Report
                            </span>
                          ) : (
                            <span className="text-[8px] text-yellow-500 italic mt-1 block">Awaiting Report draft</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
