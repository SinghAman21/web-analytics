/**
 * API interfaces and functions for Ultrafree Analytics
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============ Interfaces ============

export interface EventData {
  site_hex: string;
  unique_cookie: string;
  session_id: string;
  page_path: string;
  device_type: string;
  referrer?: string;
  screen_res?: string;
}

export interface SiteInfo {
  id: number;
  hex_share_id: string;
  name: string;
  site_url: string;
  created_at: string;
}

export interface TopPage {
  path: string;
  views: number;
}

export interface Referrer {
  source: string;
  count: number;
}

export interface DailyData {
  date: string;
  views: number;
}

export interface DeviceBreakdown {
  mobile?: number;
  desktop?: number;
  [key: string]: number | undefined;
}

export interface AnalyticsData {
  site_hex: string;
  period_hours: number;
  total_pageviews: number;
  unique_visitors: number;
  bounce_rate: number;
  sessions: number;
  avg_pages_per_session: number;
  top_pages: TopPage[];
  device_breakdown: DeviceBreakdown;
  mobile_percentage: number;
  desktop_percentage: number;
  referrers: Referrer[];
  daily_data: DailyData[];
  generated_at: string;
}

export interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsData;
}

export interface EventLogResponse {
  success: boolean;
  data: unknown;
  message: string;
}

// ============ API Functions ============

/**
 * Get site information by hex ID
 * @param hexId - The hex share ID of the site
 * @returns Site information
 */
export async function getSiteInfo(hexId: string): Promise<SiteInfo> {
  try {
    const response = await fetch(`${API_URL}/api/ultrafree/${hexId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch site info';
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
    console.error('Error fetching site info:', error);
    throw error;
  }
}

/**
 * Get analytics data for a specific site by hex ID
 * Ultrafree analytics always shows last 30 days of data
 * @param hexId - The hex share ID of the site
 * @returns Analytics data for the site
 */
export async function getAnalytics(hexId: string): Promise<AnalyticsData> {
  try {
    const response = await fetch(`${API_URL}/api/analytics/${hexId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch analytics';
      try {
        const error = await response.json();
        errorMessage = error.detail || errorMessage;
      } catch (e) {
        errorMessage = `${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result: AnalyticsResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}

/**
 * Log an analytics event for a site
 * @param event - The event data to log
 * @returns Response from the server
 */
export async function logEvent(event: EventData): Promise<EventLogResponse> {
  try {
    const response = await fetch(`${API_URL}/api/ping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to log event';
      try {
        const error = await response.json();
        errorMessage = error.detail || errorMessage;
      } catch (e) {
        errorMessage = `${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result: EventLogResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error logging event:', error);
    throw error;
  }
}

/**
 * Generate a unique cookie ID for tracking
 */
export function generateUniqueCookie(): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';
  const randomValues = new Uint8Array(16);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < 16; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

/**
 * Generate a session ID for tracking
 */
export function generateSessionId(): string {
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
 * Get or create unique cookie from localStorage
 */
export function getOrCreateUniqueCookie(): string {
  if (typeof window === 'undefined') return '';
  
  const cookieKey = 'pulse_tracking_id';
  let cookie = localStorage.getItem(cookieKey);
  
  if (!cookie) {
    cookie = generateUniqueCookie();
    localStorage.setItem(cookieKey, cookie);
  }
  
  return cookie;
}

/**
 * Get or create session ID from sessionStorage
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  const sessionKey = 'pulse_session_id';
  let sessionId = sessionStorage.getItem(sessionKey);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(sessionKey, sessionId);
  }
  
  return sessionId;
}

/**
 * Detect device type
 */
export function detectDeviceType(): string {
  if (typeof window === 'undefined') return 'desktop';
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /mobile|android|iphone|ipad|tablet|blackberry|windows phone/.test(userAgent);
  
  return isMobile ? 'mobile' : 'desktop';
}

/**
 * Get screen resolution
 */
export function getScreenResolution(): string {
  if (typeof window === 'undefined') return '';
  
  return `${window.screen.width}x${window.screen.height}`;
}
