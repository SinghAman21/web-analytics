import { getAuthHeaders } from '@/lib/session-token';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface FreeSite {
  id: number;
  user_id: number;
  site_name: string;
  site_url: string;
  hex_share_id: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface FreeSitesListResponse {
  success: boolean;
  data: FreeSite[];
  count: number;
  total: number;
}

interface FreeSiteCreateResponse {
  success: boolean;
  data: FreeSite;
  message: string;
}

export async function getFreeSites(): Promise<FreeSite[]> {
  const response = await fetch(`${API_URL}/api/free/free-sites`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to fetch free sites';
    try {
      const payload = await response.json();
      errorMessage = payload?.detail || errorMessage;
    } catch {
      errorMessage = `${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const payload: FreeSitesListResponse = await response.json();
  return payload.data || [];
}

export async function createFreeSite(site_name: string, site_url: string): Promise<FreeSite> {
  const response = await fetch(`${API_URL}/api/free/free-sites`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ site_name, site_url }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to create free site';
    try {
      const payload = await response.json();
      errorMessage = payload?.detail || errorMessage;
    } catch {
      errorMessage = `${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const payload: FreeSiteCreateResponse = await response.json();
  return payload.data;
}
