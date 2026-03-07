export interface PublicSite {
  id?: number;
  hex_share_id: string;
  name: string;
  site_url: string;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Generate a random 12-character alphanumeric hex code
 */
function generateHexCode(): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';
  const randomValues = new Uint8Array(12);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < 12; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

/**
 * Fetch all public ultrafree sites from the backend
 */
export async function getPublicSites(): Promise<PublicSite[]> {
  try {
    const response = await fetch(`${API_URL}/api/ultrafree`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch sites:', response.status, response.statusText);
      return [];
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching public sites:', error);
    return [];
  }
}

/**
 * Create a new ultrafree public site in Supabase
 */
export async function createPublicSite(
  siteName: string,
  siteUrl: string
): Promise<PublicSite> {
  const hexId = generateHexCode();
  
  try {
    const response = await fetch(`${API_URL}/api/ultrafree`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        site_name: siteName,
        site_url: siteUrl,
        hex_share_id: hexId,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create site';
      try {
        const error = await response.json();
        errorMessage = error.detail || errorMessage;
      } catch (e) {
        errorMessage = `${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating public site:', error);
    throw error;
  }
}
