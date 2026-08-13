export interface GrpcEventData {
  site_hex: string;
  unique_cookie: string;
  session_id: string;
  page_path: string;
  device_type: string;
  event_type?: string;
  event_time?: string;
  lamport_ts?: string | number;
  process_id?: string;
  received_at?: string;
}

export interface GrpcLogEventRequest {
  event: GrpcEventData;
  client_ip?: string;
}

export interface GrpcTopPage {
  path: string;
  views: string | number;
}

export interface GrpcDailyDataPoint {
  date: string;
  views: string | number;
}

export interface GrpcAnalytics {
  site_hex: string;
  period_hours: string | number;
  total_pageviews: string | number;
  unique_visitors: string | number;
  bounce_rate: string | number;
  sessions: string | number;
  avg_pages_per_session: string | number;
  top_pages: GrpcTopPage[];
  device_breakdown: Record<string, string | number>;
  mobile_percentage: string | number;
  desktop_percentage: string | number;
  daily_data: GrpcDailyDataPoint[];
  generated_at: string;
}

export interface GrpcSite {
  id: string | number;
  hex_share_id: string;
  name: string;
  site_url: string;
  created_at: string;
}

export interface GrpcListSitesResponse {
  sites: GrpcSite[];
  count: string | number;
  total: string | number;
}

export interface GrpcGetAnalyticsRequest {
  hex_share_id: string;
  hours: number;
}

export interface GrpcGetSiteRequest {
  hex_share_id: string;
}

export interface GrpcListSitesRequest {
  limit: number;
  offset: number;
}

export interface GrpcCreateSiteRequest {
  site_name: string;
  site_url: string;
  hex_share_id: string;
}

export interface GrpcLogEventResponse {
  success: boolean;
  message: string;
  site_hex: string;
  event_id: string | number;
  lamport_ts?: string | number;
}
