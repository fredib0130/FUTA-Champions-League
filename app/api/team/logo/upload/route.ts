import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "server-db");
const REGISTRATIONS_FILE = path.join(DB_DIR, "registrations.json");
const AUDITS_FILE = path.join(DB_DIR, "audit_logs.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "team-logos");

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
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(regs, null, 2), "utf8");
}

function getAuditLogs() {
  try {
    if (fs.existsSync(AUDITS_FILE)) {
      return JSON.parse(fs.readFileSync(AUDITS_FILE, "utf8"));
    }
  } catch (err) {
    console.error("Error reading audit_logs.json", err);
  }
  return [];
}

function saveAuditLogs(logs: any[]) {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  fs.writeFileSync(AUDITS_FILE, JSON.stringify(logs, null, 2), "utf8");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const team = formData.get("team") as string | null;

    if (!file || !team) {
      return NextResponse.json(
        { error: "Missing uploaded file or team parameter." },
        { status: 400 }
      );
    }

    const teamUpper = team.toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    if (!teamUpper) {
      return NextResponse.json(
        { error: "Invalid team identifier." },
        { status: 400 }
      );
    }

    // Ensure upload folder exists
    const teamDir = path.join(UPLOADS_DIR, teamUpper);
    if (!fs.existsSync(teamDir)) {
      fs.mkdirSync(teamDir, { recursive: true });
    } else {
      // Clean up previous files
      try {
        const existingFiles = fs.readdirSync(teamDir);
        for (const f of existingFiles) {
          fs.unlinkSync(path.join(teamDir, f));
        }
      } catch (err) {
        console.error("Error unlinking old file:", err);
      }
    }

    // Write file to disk
    const filename = file.name.toLowerCase().replace(/[^a-z0-9\._-]/g, "");
    const filePathOnDisk = path.join(teamDir, filename);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(filePathOnDisk, buffer);

    const relativePath = `/uploads/team-logos/${teamUpper}/${filename}`;
    
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

    const hasExistingLogo = !!(regs[teamLower].logoUrl);
    regs[teamLower].logoUrl = relativePath;
    regs[teamLower].logoStatus = "Approved";
    regs[teamLower].logoUploadedBy = "Coach";
    regs[teamLower].logoUploadedAt = new Date().toISOString().split("T")[0];
    
    saveRegistrations(regs);

    const actionText = hasExistingLogo
      ? `${teamUpper} replaced existing logo`
      : `${teamUpper} uploaded new team logo`;

    // Log audit
    const audits = getAuditLogs();
    audits.unshift({
      id: `audit-${Date.now()}`,
      adminName: "Coach",
      role: "Team Official",
      action: actionText,
      timestamp: new Date().toLocaleString()
    });
    saveAuditLogs(audits);

    return NextResponse.json({
      success: true,
      url: relativePath,
      registration: regs[teamLower]
    });

  } catch (error: any) {
    console.error("Upload failed in API route:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed." },
      { status: 500 }
    );
  }
}
