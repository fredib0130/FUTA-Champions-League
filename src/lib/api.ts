// FUTA Champions League 2026 Admin APIs module

export interface AdminUser {
  username: string;
  role: 'Super Admin' | 'Match Commissioner' | 'Media Officer' | 'Team Official';
}

export interface AuditLogItem {
  id: string;
  adminName: string;
  role: string;
  action: string;
  timestamp: string;
  matchSummary?: string;
}

// Fetch helper wrapper that automatically appends auth token headers
async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem('fcl_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!response.ok) {
    let errorMsg = `HTTP error ${response.status}`;
    if (contentType.includes('application/json')) {
      try {
        const errorData = JSON.parse(text);
        errorMsg = errorData.error || errorMsg;
      } catch (e) {}
    }
    throw new Error(errorMsg);
  }

  const isHtml = text.trim().startsWith('<!') || text.trim().startsWith('<html') || text.trim().startsWith('<doctype');

  if (isHtml || (!contentType.includes('application/json') && !text.trim().startsWith('{') && !text.trim().startsWith('['))) {
    throw new Error(`Expected JSON response, but received HTML or plain text (the server may be booting up or in maintenance)`);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Failed to parse API JSON response`);
  }
}

export const fclApi = {
  // Authentication
  async login(username: string, password: string, role: string): Promise<{ token: string; user: AdminUser }> {
    return fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role })
    });
  },

  async logout(): Promise<void> {
    try {
      await fetchApi('/api/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('fcl_auth_token');
      localStorage.removeItem('fcl_admin_user');
    }
  },

  async getSession(): Promise<{ user: AdminUser }> {
    return fetchApi('/api/auth/session');
  },

  // Admin Account Register (Super Admin only)
  async getAdmins(): Promise<{ admins: Array<{ username: string; role: string; createdAt: string }> }> {
    return fetchApi('/api/auth/admins');
  },

  async createAdmin(username: string, passwordHash: string, role: string): Promise<any> {
    return fetchApi('/api/auth/admins', {
      method: 'POST',
      body: JSON.stringify({ username, password: passwordHash, role })
    });
  },

  async deleteAdmin(username: string): Promise<any> {
    return fetchApi(`/api/auth/admins/${encodeURIComponent(username)}`, {
      method: 'DELETE'
    });
  },

  // Team Registrations & Accreditations
  async getRegistrations(): Promise<{ registrations: Record<string, any> }> {
    return fetchApi('/api/registrations');
  },

  async syncRegistrations(registrations: Record<string, any>): Promise<any> {
    return fetchApi('/api/registrations', {
      method: 'POST',
      body: JSON.stringify({ registrations })
    });
  },

  async verifySquad(teamId: string, status: string, feedback?: string): Promise<any> {
    return fetchApi(`/api/registrations/${teamId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status, feedback })
    });
  },

  async verifyMemberAccreditation(teamId: string, memberId: string, type: 'player' | 'coach', status: 'Approved' | 'Rejected' | 'Pending', feedback?: string): Promise<any> {
    return fetchApi(`/api/registrations/${teamId}/verify-member`, {
      method: 'POST',
      body: JSON.stringify({ memberId, type, status, feedback })
    });
  },

  async uploadTeamLogo(teamId: string, logoData: string, filename: string, uploadedBy: string): Promise<any> {
    return fetchApi(`/api/registrations/${teamId}/logo`, {
      method: 'POST',
      body: JSON.stringify({ logoData, filename, uploadedBy })
    });
  },

  async verifyTeamLogo(teamId: string, status: 'Approved' | 'Rejected' | 'Pending', feedback?: string): Promise<any> {
    return fetchApi(`/api/registrations/${teamId}/logo/verify`, {
      method: 'POST',
      body: JSON.stringify({ status, feedback })
    });
  },

  async deleteTeamLogo(teamId: string): Promise<any> {
    return fetchApi(`/api/registrations/${teamId}/logo`, {
      method: 'DELETE'
    });
  },

  async resetRegistrations(): Promise<any> {
    return fetchApi('/api/registrations/reset', { method: 'POST' });
  },

  // Audit Logs
  async getAuditLogs(): Promise<{ auditLogs: AuditLogItem[] }> {
    return fetchApi('/api/audit-logs');
  },

  async addAuditLog(action: string, matchSummary?: string): Promise<any> {
    return fetchApi('/api/audit-logs', {
      method: 'POST',
      body: JSON.stringify({ action, matchSummary })
    });
  },

  // FCL Match Timers Endpoints
  async getTimers(): Promise<{ success: boolean; timers: Record<string, any> }> {
    return fetchApi('/api/timers');
  },

  async getTimerForMatch(matchId: string): Promise<{ success: boolean; timer: any }> {
    return fetchApi(`/api/timers/${matchId}`);
  },

  async controlTimer(matchId: string, action: string, body: { period?: 'first' | 'second'; addedMinutes?: number; value?: string } = {}): Promise<any> {
    return fetchApi(`/api/timers/${matchId}/control`, {
      method: 'POST',
      body: JSON.stringify({ action, ...body })
    });
  },

  async uploadMediaFile(fileData: string, filename: string, bucket: 'match-photos' | 'article-images' | 'news-images' | 'committee-announcements', subfolder?: string): Promise<{ success: boolean; url: string; originalSize: string; compressedSize: string; ratio: string }> {
    return fetchApi('/api/media/upload-file', {
      method: 'POST',
      body: JSON.stringify({ fileData, filename, bucket, subfolder })
    });
  }
};
