import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import fileUpload from "express-fileupload";

const app = express();
const PORT = 3000;
const DB_DIR = path.join(process.cwd(), "server-db");

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Ensure Team Logos local directory structure exists
const TEAMS_FOLDER_LIST = [
  'AGE', 'AGP', 'ANA', 'APH', 'BCH', 'BDG', 'CSP', 'CYS', 'ENT', 'FWT',
  'ICE', 'IDD', 'IFS', 'MBBS', 'MCB', 'MST', 'PHS', 'PHY', 'SIMT', 'STA'
];
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "team-logos");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
TEAMS_FOLDER_LIST.forEach(team => {
  const teamDir = path.join(UPLOADS_DIR, team);
  if (!fs.existsSync(teamDir)) {
    fs.mkdirSync(teamDir, { recursive: true });
  }
});

// Serve team logo static uploads directly
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// Models
interface AdminAccount {
  username: string;
  passwordHash: string;
  role: "Super Admin" | "Match Commissioner" | "Media Officer";
  createdAt: string;
}

interface AuditLog {
  id: string;
  adminName: string;
  role: string;
  action: string;
  timestamp: string;
}

// Helper to hash passwords securely
const SALT = "fcl_tournament_salt_2026_secured";
function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, "sha512").toString("hex");
}

// Initial Admin Bootstrap
const ADMINS_FILE = path.join(DB_DIR, "admins.json");
if (!fs.existsSync(ADMINS_FILE)) {
  const initialAdmins: AdminAccount[] = [
    {
      username: "FrediB",
      passwordHash: hashPassword("FrediB@FCL2026"),
      role: "Super Admin",
      createdAt: new Date().toISOString()
    },
    {
      username: "Ousman",
      passwordHash: hashPassword("Ousman@FCL2026"),
      role: "Super Admin",
      createdAt: new Date().toISOString()
    }
  ];
  fs.writeFileSync(ADMINS_FILE, JSON.stringify(initialAdmins, null, 2), "utf8");
}

// In-Memory sessions mapping
// Stores token -> user info
const SESSIONS = new Map<string, { username: string; role: "Super Admin" | "Match Commissioner" | "Media Officer" }>();

// Load / Save Helper functions
const REGISTRATIONS_FILE = path.join(DB_DIR, "registrations.json");
const AUDITS_FILE = path.join(DB_DIR, "audit_logs.json");

if (!fs.existsSync(REGISTRATIONS_FILE)) {
  const seedRegistrations: Record<string, any> = {
    mst: {
      teamId: "mst",
      status: "submitted",
      players: [
        {
          id: "p-mst-1",
          fullName: "Bertram Martial",
          matricNumber: "MST/2021/1054",
          department: "Marine Science",
          level: "300",
          position: "GK",
          passportPath: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80",
          idCardStatus: "pending"
        },
        {
          id: "p-mst-2",
          fullName: "Chidi Williams",
          matricNumber: "MST/2021/1012",
          department: "Marine Science",
          level: "400",
          position: "MID",
          passportPath: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80",
          idCardStatus: "approved"
        },
        {
          id: "p-mst-3",
          fullName: "Kelechi Nnamdi",
          matricNumber: "MST/2021/1231",
          department: "Marine Science",
          level: "500",
          position: "FWD",
          passportPath: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80",
          idCardStatus: "rejected",
          idCardFeedback: "Worn photo ID card scanned. Please re-upload a clear photograph."
        }
      ],
      coaches: [
        {
          id: "c-mst-1",
          fullName: "Coach Bertram Thompson",
          role: "Head Coach",
          phone: "08012345678",
          email: "thompson@futa.edu.ng",
          passportPath: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&q=80",
          idCardStatus: "pending"
        }
      ]
    },
    age: {
      teamId: "age",
      status: "submitted",
      players: [
        {
          id: "p-age-1",
          fullName: "Jones Falana",
          matricNumber: "AGE/2022/4021",
          department: "Agricultural Engineering",
          level: "400",
          position: "FWD",
          passportPath: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&q=80",
          idCardStatus: "pending"
        }
      ],
      coaches: [
        {
          id: "c-age-1",
          fullName: "Coach Kunle",
          role: "Assistant Coach",
          phone: "08098765432",
          email: "kunle@futa.edu.ng",
          passportPath: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&q=80",
          idCardStatus: "approved"
        }
      ]
    }
  };
  fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(seedRegistrations, null, 2), "utf8");
}

function getAdmins(): AdminAccount[] {
  try {
    if (fs.existsSync(ADMINS_FILE)) {
      return JSON.parse(fs.readFileSync(ADMINS_FILE, "utf8"));
    }
  } catch (err) {
    console.error("Error reading admins.json", err);
  }
  return [];
}

function saveAdmins(admins: AdminAccount[]) {
  fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2), "utf8");
}

function getRegistrations(): Record<string, any> {
  try {
    if (fs.existsSync(REGISTRATIONS_FILE)) {
      return JSON.parse(fs.readFileSync(REGISTRATIONS_FILE, "utf8"));
    }
  } catch (err) {
    console.error("Error reading registrations.json", err);
  }
  return {};
}

function saveRegistrations(regs: Record<string, any>) {
  fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(regs, null, 2), "utf8");
}

function getAuditLogs(): AuditLog[] {
  try {
    if (fs.existsSync(AUDITS_FILE)) {
      return JSON.parse(fs.readFileSync(AUDITS_FILE, "utf8"));
    }
  } catch (err) {
    console.error("Error reading audit_logs.json", err);
  }
  return [];
}

function saveAuditLogs(logs: AuditLog[]) {
  fs.writeFileSync(AUDITS_FILE, JSON.stringify(logs, null, 2), "utf8");
}

// Express Parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }
}));

// Express Authorization Middleware
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access denied. token missing." });
    return;
  }

  const session = SESSIONS.get(token);
  if (!session) {
    res.status(403).json({ error: "Invalid or expired session session." });
    return;
  }

  // Attach session details to req
  (req as any).user = session;
  next();
}

// Role restriction validation helpers
function requireRole(roles: Array<AdminAccount["role"]>) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: "Access Denied: Permissions not allowed for user role." });
      return;
    }
    next();
  };
}

// --- API ENDPOINTS ---

// Auth endpoints
app.post("/api/auth/login", (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    res.status(400).json({ error: "Username, password and role are required." });
    return;
  }

  const admins = getAdmins();
  const matchedAdmin = admins.find(a => a.username.toLowerCase() === username.trim().toLowerCase());

  if (!matchedAdmin) {
    res.status(401).json({ error: "Invalid credentials: User not found." });
    return;
  }

  // Check role
  if (matchedAdmin.role !== role) {
    res.status(401).json({ error: `Identified user is registered as ${matchedAdmin.role}, not ${role}.` });
    return;
  }

  // Hash and verify password
  const inputHash = hashPassword(password);
  if (inputHash !== matchedAdmin.passwordHash) {
    res.status(401).json({ error: "Invalid credentials: Secure password check failed." });
    return;
  }

  // Success: Generate secure session token
  const token = crypto.randomUUID();
  SESSIONS.set(token, {
    username: matchedAdmin.username,
    role: matchedAdmin.role
  });

  // Log audit
  const audits = getAuditLogs();
  const netAudit: AuditLog = {
    id: `audit-${Date.now()}`,
    adminName: matchedAdmin.username,
    role: matchedAdmin.role,
    action: `Supervised Sign In: Authenticated in with secure credentials.`,
    timestamp: new Date().toLocaleString()
  };
  audits.unshift(netAudit);
  saveAuditLogs(audits);

  res.json({
    token,
    user: {
      username: matchedAdmin.username,
      role: matchedAdmin.role
    }
  });
});

app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    const session = SESSIONS.get(token);
    if (session) {
      // Add logout audit log
      const audits = getAuditLogs();
      audits.unshift({
        id: `audit-${Date.now()}`,
        adminName: session.username,
        role: session.role,
        action: `Terminated Matchdesk Operations session.`,
        timestamp: new Date().toLocaleString()
      });
      saveAuditLogs(audits);
      
      SESSIONS.delete(token);
    }
  }
  res.json({ success: true });
});

app.get("/api/auth/session", authenticateToken, (req, res) => {
  res.json({ user: (req as any).user });
});

// Admin accounts management (Super Admin only)
app.get("/api/auth/admins", authenticateToken, requireRole(["Super Admin"]), (req, res) => {
  const admins = getAdmins();
  // Strip hashes out of return payload for safety
  const securePayload = admins.map(a => ({
    username: a.username,
    role: a.role,
    createdAt: a.createdAt
  }));
  res.json({ admins: securePayload });
});

app.post("/api/auth/admins", authenticateToken, requireRole(["Super Admin"]), (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    res.status(400).json({ error: "Fields username, password and role are required." });
    return;
  }

  const admins = getAdmins();
  const alreadyExists = admins.some(a => a.username.toLowerCase() === username.trim().toLowerCase());

  if (alreadyExists) {
    res.status(400).json({ error: "Administrator identifier already exists." });
    return;
  }

  const newAdmin: AdminAccount = {
    username: username.trim(),
    passwordHash: hashPassword(password),
    role: role,
    createdAt: new Date().toISOString()
  };

  admins.push(newAdmin);
  saveAdmins(admins);

  // Log action
  const operatorName = (req as any).user.username;
  const operatorRole = (req as any).user.role;
  const audits = getAuditLogs();
  audits.unshift({
    id: `audit-${Date.now()}`,
    adminName: operatorName,
    role: operatorRole,
    action: `Created administrator account "${newAdmin.username}" with role [${newAdmin.role}]`,
    timestamp: new Date().toLocaleString()
  });
  saveAuditLogs(audits);

  res.json({
    success: true,
    user: {
      username: newAdmin.username,
      role: newAdmin.role,
      createdAt: newAdmin.createdAt
    }
  });
});

app.delete("/api/auth/admins/:username", authenticateToken, requireRole(["Super Admin"]), (req, res) => {
  const { username } = req.params;
  const operatorName = (req as any).user.username;

  if (username.toLowerCase() === "fredib" || username.toLowerCase() === "ousman") {
    res.status(400).json({ error: "Protection Rule Violation: Initial bootstrapped Super Admins cannot be deleted." });
    return;
  }

  if (username.toLowerCase() === operatorName.toLowerCase()) {
    res.status(400).json({ error: "Rule violation: You cannot delete your own active session account." });
    return;
  }

  let admins = getAdmins();
  const originalLength = admins.length;
  admins = admins.filter(a => a.username.toLowerCase() !== username.toLowerCase());

  if (admins.length === originalLength) {
    res.status(410).json({ error: "Administrator not found." });
    return;
  }

  saveAdmins(admins);

  // Log action
  const audits = getAuditLogs();
  audits.unshift({
    id: `audit-${Date.now()}`,
    adminName: operatorName,
    role: (req as any).user.role,
    action: `Deleted administrator account "${username}"`,
    timestamp: new Date().toLocaleString()
  });
  saveAuditLogs(audits);

  res.json({ success: true });
});

// Accreditation and Team Registrations
app.get("/api/registrations", (req, res) => {
  res.json({ registrations: getRegistrations() });
});

app.post("/api/registrations", (req, res) => {
  // Sync endpoints - anyone can synchronize context initially
  const { registrations } = req.body;
  if (!registrations) {
    res.status(400).json({ error: "Missing registrations index map." });
    return;
  }
  saveRegistrations(registrations);
  res.json({ success: true });
});

// Multipart File Upload endpoint supporting the POST standard
app.post("/api/upload", (req, res) => {
  try {
    const files = (req as any).files;
    const team = req.body.team;

    if (!files || !files.file || !team) {
      res.status(400).json({ error: "Missing file or team" });
      return;
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    // Convert file to buffer and write it
    const buffer = file.data;
    const teamUpper = team.toUpperCase();

    // Validate if team exists in list
    if (!TEAMS_FOLDER_LIST.includes(teamUpper)) {
      res.status(400).json({ error: `Invalid team identifier: ${team}` });
      return;
    }

    const teamDir = path.join(UPLOADS_DIR, teamUpper);
    if (!fs.existsSync(teamDir)) {
      fs.mkdirSync(teamDir, { recursive: true });
    } else {
      // Clear folder first to match original cleanup behavior
      try {
        const existingFiles = fs.readdirSync(teamDir);
        for (const f of existingFiles) {
          fs.unlinkSync(path.join(teamDir, f));
        }
      } catch (err) {
        console.error("Error unlinking old file:", err);
      }
    }

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = file.name.toLowerCase().replace(/[^a-z0-9\._-]/g, "");
    const filePathOnDisk = path.join(teamDir, sanitizedFilename);
    
    fs.writeFileSync(filePathOnDisk, buffer);

    const relativePath = `/uploads/team-logos/${teamUpper}/${sanitizedFilename}`;
    console.log("Saving file:", relativePath);

    // Update registrations
    const regs = getRegistrations();
    const teamLower = team.toLowerCase();
    if (!regs[teamLower]) {
      regs[teamLower] = {
        teamId: teamLower,
        status: "pending",
        players: [],
        coaches: []
      };
    }
    
    regs[teamLower].logoUrl = relativePath;
    regs[teamLower].logoStatus = "Pending";
    regs[teamLower].logoUploadedBy = "Coach";
    regs[teamLower].logoUploadedAt = new Date().toISOString().split('T')[0];
    saveRegistrations(regs);

    // Write audit log
    const audits = getAuditLogs();
    audits.unshift({
      id: `audit-${Date.now()}`,
      adminName: "Coach",
      role: "Team Official",
      action: `Coach uploaded new logo via multipart form for ${teamUpper}`,
      timestamp: new Date().toLocaleString()
    });
    saveAuditLogs(audits);

    res.json({
      success: true,
      url: relativePath,
      registration: regs[teamLower]
    });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Team Logo Upload endpoint
app.post("/api/registrations/:teamId/logo", (req, res) => {
  const { teamId } = req.params;
  const { logoData, filename, uploadedBy } = req.body;
  
  if (!logoData || !filename || !uploadedBy) {
    res.status(400).json({ error: "Missing required upload parameters: logoData, filename, uploadedBy." });
    return;
  }
  
  const teamUpper = teamId.toUpperCase();
  if (!TEAMS_FOLDER_LIST.includes(teamUpper)) {
    res.status(400).json({ error: `Invalid team identifier: ${teamId}` });
    return;
  }
  
  // Base64 decoding and validation
  const matches = logoData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    res.status(400).json({ error: "Invalid image format. Must be base64 data URI." });
    return;
  }
  
  const mimeType = matches[1];
  const base64Content = matches[2];
  const buffer = Buffer.from(base64Content, "base64");
  
  // File size validation (5MB max)
  if (buffer.length > 5 * 1024 * 1024) {
    res.status(400).json({ error: "File exceeds 5MB limit." });
    return;
  }
  
  // Format check
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"];
  if (!allowedMimeTypes.includes(mimeType)) {
    res.status(400).json({ error: "Unsupported image format. Allowed: JPG, JPEG, PNG, SVG." });
    return;
  }
  
  // Clean folder first
  const teamDir = path.join(UPLOADS_DIR, teamUpper);
  if (!fs.existsSync(teamDir)) {
    fs.mkdirSync(teamDir, { recursive: true });
  } else {
    // Delete existing files in the directory to prevent clutter
    const files = fs.readdirSync(teamDir);
    for (const f of files) {
      try {
        fs.unlinkSync(path.join(teamDir, f));
      } catch (err) {
        console.error("Error unlinking old logo file:", err);
      }
    }
  }
  
  // Write the file
  const sanitizedFilename = filename.toLowerCase().replace(/[^a-z0-9\._-]/g, "");
  const filePath = path.join(teamDir, sanitizedFilename);
  fs.writeFileSync(filePath, buffer);
  
  // Update registrations
  const regs = getRegistrations();
  if (!regs[teamId.toLowerCase()]) {
    regs[teamId.toLowerCase()] = {
      teamId: teamId.toLowerCase(),
      status: "pending",
      players: [],
      coaches: []
    };
  }
  
  const logoUrl = `/uploads/team-logos/${teamUpper}/${sanitizedFilename}`;
  regs[teamId.toLowerCase()].logoUrl = logoUrl;
  regs[teamId.toLowerCase()].logoStatus = "Pending";
  regs[teamId.toLowerCase()].logoUploadedBy = uploadedBy;
  regs[teamId.toLowerCase()].logoUploadedAt = new Date().toISOString().split('T')[0];
  
  saveRegistrations(regs);
  
  // Write audit log
  const audits = getAuditLogs();
  audits.unshift({
    id: `audit-${Date.now()}`,
    adminName: uploadedBy,
    role: uploadedBy === "Super Admin" ? "Super Admin" : "Team Official",
    action: `${uploadedBy} uploaded new logo for ${teamUpper}`,
    timestamp: new Date().toLocaleString()
  });
  saveAuditLogs(audits);
  
  res.json({ success: true, logoUrl, registration: regs[teamId.toLowerCase()] });
});

// Super Admin Team Logo verification
app.post("/api/registrations/:teamId/logo/verify", authenticateToken, requireRole(["Super Admin"]), (req, res) => {
  const { teamId } = req.params;
  const { status, feedback } = req.body; // "Approved" | "Rejected" | "Pending"
  const operator = (req as any).user;
  
  if (!status || !["Approved", "Rejected", "Pending"].includes(status)) {
    res.status(400).json({ error: "Invalid status value: Must be Approved, Rejected, or Pending." });
    return;
  }
  
  const regs = getRegistrations();
  const teamReg = regs[teamId.toLowerCase()];
  if (!teamReg) {
    res.status(404).json({ error: `Team registration for "${teamId}" not found.` });
    return;
  }
  
  teamReg.logoStatus = status;
  if (feedback !== undefined) {
    teamReg.logoFeedback = feedback;
  }
  
  saveRegistrations(regs);
  
  // Write audit log
  const audits = getAuditLogs();
  audits.unshift({
    id: `audit-${Date.now()}`,
    adminName: operator.username,
    role: operator.role,
    action: status === "Approved" 
      ? `${operator.username} approved logo for ${teamId.toUpperCase()}`
      : `${operator.username} rejected logo for ${teamId.toUpperCase()}: "${feedback || 'No comments'}"`,
    timestamp: new Date().toLocaleString()
  });
  saveAuditLogs(audits);
  
  res.json({ success: true, registration: teamReg });
});

// Super Admin Team Logo permanent delete
app.delete("/api/registrations/:teamId/logo", authenticateToken, requireRole(["Super Admin"]), (req, res) => {
  const { teamId } = req.params;
  const operator = (req as any).user;
  const teamUpper = teamId.toUpperCase();
  
  const regs = getRegistrations();
  const teamReg = regs[teamId.toLowerCase()];
  if (teamReg) {
    delete teamReg.logoUrl;
    delete teamReg.logoStatus;
    delete teamReg.logoUploadedBy;
    delete teamReg.logoUploadedAt;
    delete teamReg.logoFeedback;
    saveRegistrations(regs);
  }
  
  // Delete the file physically from the folder
  const teamDir = path.join(UPLOADS_DIR, teamUpper);
  if (fs.existsSync(teamDir)) {
    const files = fs.readdirSync(teamDir);
    for (const f of files) {
      try {
        fs.unlinkSync(path.join(teamDir, f));
      } catch (err) {
        console.error("Error unlinking logo file:", err);
      }
    }
  }
  
  // Write audit log
  const audits = getAuditLogs();
  audits.unshift({
    id: `audit-${Date.now()}`,
    adminName: operator.username,
    role: operator.role,
    action: `${operator.username} permanently deleted logo for ${teamUpper}`,
    timestamp: new Date().toLocaleString()
  });
  saveAuditLogs(audits);
  
  res.json({ success: true, registration: teamReg });
});

// Verify whole squad level state
app.post("/api/registrations/:teamId/verify", authenticateToken, requireRole(["Super Admin"]), (req, res) => {
  const { teamId } = req.params;
  const { status, feedback } = req.body; // 'verified' | 'incomplete' | etc
  const operatorName = (req as any).user.username;

  const regs = getRegistrations();
  if (!regs[teamId]) {
    regs[teamId] = {
      teamId,
      status: "pending",
      players: [],
      coaches: []
    };
  }

  regs[teamId].status = status;
  regs[teamId].verifiedAt = new Date().toISOString();
  if (feedback !== undefined) {
    regs[teamId].adminFeedback = feedback;
  }

  saveRegistrations(regs);

  // Write audit
  const audits = getAuditLogs();
  audits.unshift({
    id: `audit-${Date.now()}`,
    adminName: operatorName,
    role: (req as any).user.role,
    action: status === "verified" 
      ? `Approved squad registration sheet for ${teamId.toUpperCase()}`
      : `Flagged squad registration sheet for ${teamId.toUpperCase()} with mistakes: "${feedback || 'No remarks provided'}"`,
    timestamp: new Date().toLocaleString()
  });
  saveAuditLogs(audits);

  res.json({ success: true, registration: regs[teamId] });
});

// Verify individual player/coach accreditation (Super Admin only!)
app.post("/api/registrations/:teamId/verify-member", authenticateToken, requireRole(["Super Admin"]), (req, res) => {
  const { teamId } = req.params;
  const { memberId, type, status, feedback } = req.body; // type: 'player' | 'coach', status: 'Approved' | 'Rejected' | 'Pending'
  const operator = (req as any).user;

  if (!memberId || !type || !status) {
    res.status(400).json({ error: "Missing required params: memberId, type, status." });
    return;
  }

  const regs = getRegistrations();
  const teamReg = regs[teamId];

  if (!teamReg) {
    res.status(404).json({ error: `Registration for team ${teamId} not found.` });
    return;
  }

  let memberName = "";
  if (type === "player") {
    const player = teamReg.players?.find((p: any) => p.id === memberId);
    if (!player) {
      res.status(404).json({ error: "Player registration record not found in squad listing." });
      return;
    }
    player.idCardStatus = status.toLowerCase() === "approved" ? "approved" : "rejected";
    player.idCardFeedback = feedback || "";
    memberName = player.fullName;
  } else {
    const coach = teamReg.coaches?.find((c: any) => c.id === memberId);
    if (!coach) {
      res.status(404).json({ error: "Coach official record not found in staff list." });
      return;
    }
    coach.idCardStatus = status.toLowerCase() === "approved" ? "approved" : "rejected";
    coach.idCardFeedback = feedback || "";
    memberName = coach.fullName;
  }

  saveRegistrations(regs);

  // Audit
  const audits = getAuditLogs();
  audits.unshift({
    id: `audit-${Date.now()}`,
    adminName: operator.username,
    role: operator.role,
    action: `${operator.username} ${status.toLowerCase() === "approved" ? "approved" : "rejected"} accreditation for ${memberName} (${teamId.toUpperCase()})`,
    timestamp: new Date().toLocaleString()
  });
  saveAuditLogs(audits);

  res.json({ success: true, registration: teamReg });
});

// Audit log services
app.get("/api/audit-logs", (req, res) => {
  res.json({ auditLogs: getAuditLogs() });
});

app.post("/api/audit-logs", authenticateToken, (req, res) => {
  const { action, matchSummary } = req.body;
  const user = (req as any).user;

  const audits = getAuditLogs();
  const newLog = {
    id: `audit-${Date.now()}`,
    adminName: user.username,
    role: user.role,
    action: action,
    timestamp: new Date().toLocaleString(),
    matchSummary
  };
  audits.unshift(newLog);
  saveAuditLogs(audits);

  res.json({ success: true, log: newLog });
});

// Clean and Reset all registrations
app.post("/api/registrations/reset", authenticateToken, requireRole(["Super Admin"]), (req, res) => {
  saveRegistrations({});
  const audits = getAuditLogs();
  audits.unshift({
    id: `audit-${Date.now()}`,
    adminName: (req as any).user.username,
    role: (req as any).user.role,
    action: `Reset and wiped all team registration databases.`,
    timestamp: new Date().toLocaleString()
  });
  saveAuditLogs(audits);
  res.json({ success: true });
});

// Vite Server Configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FCL Backend Server actively running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
