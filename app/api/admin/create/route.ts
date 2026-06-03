import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const DB_DIR = path.join(process.cwd(), "server-db");
const ADMINS_FILE = path.join(DB_DIR, "admins.json");
const AUDITS_FILE = path.join(DB_DIR, "audit_logs.json");

interface AdminAccount {
  username: string;
  passwordHash: string;
  role: "Super Admin" | "Match Commissioner" | "Media Officer";
  createdAt: string;
}

const SALT = "fcl_tournament_salt_2026_secured";

function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, "sha512").toString("hex");
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
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2), "utf8");
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
    const body = await req.json();
    const { identifier, username, password, role } = body;
    const adminUsername = (identifier || username || "").trim();

    if (!adminUsername || !password || !role) {
      return NextResponse.json(
        { error: "Fields identifier/username, password and role are required." },
        { status: 400 }
      );
    }

    let mappedRole: "Super Admin" | "Match Commissioner" | "Media Officer" = "Super Admin";
    const normalizedRole = role.toLowerCase().replace(/\s+/g, "");
    if (normalizedRole === "superadmin" || normalizedRole === "super admin") {
      mappedRole = "Super Admin";
    } else if (normalizedRole === "matchcommissioner" || normalizedRole === "match commissioner") {
      mappedRole = "Match Commissioner";
    } else if (normalizedRole === "mediaofficer" || normalizedRole === "media officer") {
      mappedRole = "Media Officer";
    }

    const admins = getAdmins();
    const matchedIdx = admins.findIndex(a => a.username.toLowerCase() === adminUsername.toLowerCase());

    if (matchedIdx >= 0) {
      admins[matchedIdx].passwordHash = hashPassword(password);
      admins[matchedIdx].role = mappedRole;
      saveAdmins(admins);

      const audits = getAuditLogs();
      audits.unshift({
        id: `audit-${Date.now()}`,
        adminName: "System Bootstrap",
        role: "System",
        action: `Updated administrator account "${adminUsername}" with role [${mappedRole}] via /api/admin/create`,
        timestamp: new Date().toLocaleString()
      });
      saveAuditLogs(audits);

      return NextResponse.json({
        success: true,
        message: "Administrator account updated successfully.",
        user: {
          username: adminUsername,
          role: mappedRole
        }
      });
    }

    const newAdmin: AdminAccount = {
      username: adminUsername,
      passwordHash: hashPassword(password),
      role: mappedRole,
      createdAt: new Date().toISOString()
    };

    admins.push(newAdmin);
    saveAdmins(admins);

    const audits = getAuditLogs();
    audits.unshift({
      id: `audit-${Date.now()}`,
      adminName: "System Bootstrap",
      role: "System",
      action: `Created administrator account "${newAdmin.username}" with role [${newAdmin.role}] via /api/admin/create`,
      timestamp: new Date().toLocaleString()
    });
    saveAuditLogs(audits);

    return NextResponse.json({
      success: true,
      user: {
        username: newAdmin.username,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt
      }
    });

  } catch (error: any) {
    console.error("API error in admin/create:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
