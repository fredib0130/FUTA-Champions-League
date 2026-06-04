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

function validateDatabaseConnectivity(): { success: boolean; error?: string } {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const testFile = path.join(DB_DIR, ".connection_test_fcl");
    fs.writeFileSync(testFile, "test-connection-" + Date.now(), "utf8");
    fs.readFileSync(testFile, "utf8");
    fs.unlinkSync(testFile);
    return { success: true };
  } catch (err: any) {
    console.error("Database (local files) connectivity check failed:", err);
    return { success: false, error: err.message };
  }
}

function validateStorageConnectivity(): { success: boolean; error?: string } {
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "team-logos");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const testFile = path.join(uploadDir, ".bucket_test_fcl");
    fs.writeFileSync(testFile, "test-bucket-connection-" + Date.now(), "utf8");
    fs.readFileSync(testFile, "utf8");
    fs.unlinkSync(testFile);
    return { success: true };
  } catch (err: any) {
    console.error("Storage folder connectivity check failed:", err);
    return { success: false, error: err.message };
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log("[API Route Log] GET request received at /api/admin/create");
    
    // Validate backends connectivity
    const dbStatus = validateDatabaseConnectivity();
    const storageStatus = validateStorageConnectivity();
    
    const admins = getAdmins();
    
    return NextResponse.json({
      success: true,
      message: "FCL Tournament Administrator Bootstrap endpoint is ready.",
      instruction: "Send a POST request with 'identifier' (or 'username'), 'password', and 'role' to create or update an administrator.",
      connections: {
        database: dbStatus.success ? "Connected (Writable)" : `Error: ${dbStatus.error}`,
        storage: storageStatus.success ? "Connected (Writable)" : `Error: ${storageStatus.error}`
      },
      existingAdminsCount: admins.length
    });
  } catch (error: any) {
    console.error("[API Error] Failed GET admin/create info:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("[API Route Log] POST request received at /api/admin/create");
    
    // Validate databases on entry
    const dbStatus = validateDatabaseConnectivity();
    if (!dbStatus.success) {
      console.error("[Database Connection Error] cannot write persistent database: ", dbStatus.error);
      return NextResponse.json(
        { error: `Database persistent store link is broken: ${dbStatus.error}` },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { identifier, username, password, role } = body;
    const adminUsername = (identifier || username || "").trim();

    if (!adminUsername || !password || !role) {
      console.warn("[API Validation Warning] Missing fields for administrator creation:", { adminUsername, hasPassword: !!password, role });
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

      console.log(`[API Log] Successfully updated administrator credit for: ${adminUsername}`);
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

    console.log(`[API Log] Successfully registered fresh administrator account: ${adminUsername}`);
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
