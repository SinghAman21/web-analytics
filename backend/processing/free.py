"""
Data processing logic for free analytics (authenticated users)
Fetches raw events from free_sites_raw_event table and processes them into analytics metrics
"""

from core.config import supabase
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict
from collections import defaultdict
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)


def _parse_event_time(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None

    try:
        parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
        if parsed.tzinfo is not None:
            return parsed.astimezone(timezone.utc).replace(tzinfo=None)
        return parsed
    except (ValueError, AttributeError):
        return None


def _safe_name(value: Optional[str], fallback: str = 'Unknown') -> str:
    if value and str(value).strip():
        return str(value).strip()
    return fallback


def _normalize_referrer(event: Dict) -> tuple[str, str]:
    """
    Extract source name and type from event.
    This function now uses the pre-computed source_type and source_name from the tracker.
    Falls back to old logic if not provided.
    """
    source_name = event.get('source_name')
    source_type = event.get('source_type')
    
    if source_name and source_type:
        return source_name, source_type
    
    # Fallback to old logic for backward compatibility
    utm_source = _safe_name(event.get('utm_source'), '')
    utm_medium = _safe_name(event.get('utm_medium'), 'none')
    utm_campaign = _safe_name(event.get('utm_campaign'), '')
    referrer = _safe_name(event.get('referrer'), '')

    if utm_source:
        source = utm_source
    elif referrer and referrer not in {'direct', '(direct)', 'none', 'null'}:
        try:
            source = urlparse(referrer).hostname or referrer
        except Exception:
            source = referrer
    else:
        source = 'Direct'

    # For backward compatibility, return source as second value
    return source, ''


def _format_live_age(event_time: Optional[datetime]) -> str:
    if not event_time:
        return 'just now'

    delta = datetime.utcnow() - event_time.replace(tzinfo=None)
    seconds = max(int(delta.total_seconds()), 0)
    if seconds < 60:
        return f'{seconds}s'

    minutes = seconds // 60
    if minutes < 60:
        return f'{minutes}m'

    hours = minutes // 60
    return f'{hours}h'


def _build_ranked_breakdown(counter: Dict[str, set], total: int, limit: int = 10) -> List[Dict]:
    items = []
    for name, sessions in sorted(counter.items(), key=lambda item: len(item[1]), reverse=True)[:limit]:
        count = len(sessions)
        items.append({
            'name': name,
            'sessions': count,
            'share': round((count / total * 100)) if total > 0 else 0,
        })
    return items


def get_raw_events(site_hex: str, days: int = 30) -> List[Dict]:
    """
    Fetch raw events for a site from the past N days.
    
    Args:
        site_hex: The hex ID of the site (from free_sites.hex_share_id)
        days: Number of days to look back (default: 30)
    
    Returns:
        List of raw event records
    """
    try:
        logger.info(f"Fetching raw events for site_hex={site_hex}, days={days}")
        
        if supabase is None:
            logger.error("Supabase client is not initialized")
            return []
        
        # Calculate timestamp for N days ago
        cutoff_time = (datetime.utcnow() - timedelta(days=days)).isoformat()
        logger.info(f"Cutoff time: {cutoff_time}")
        
        # Query from free_sites_raw_event table (the new raw events table)
        response = supabase.table("free_sites_raw_event").select(
            "*"
        ).eq("site_hex", site_hex).gte("event_time", cutoff_time).execute()
        
        logger.info(f"Retrieved {len(response.data) if response.data else 0} events")
        return response.data if response.data else []
    
    except Exception as e:
        logger.error(f"Error fetching raw events: {str(e)}", exc_info=True)
        raise Exception(f"Error fetching raw events: {str(e)}")


def process_analytics(site_hex: str, days: int = 30) -> Dict:
    """
    Process raw events into analytics metrics for a free site.
    
    Calculates:
    - Total pageviews
    - Unique visitors (unique cookies)
    - Bounce rate
    - Top pages
    - Device breakdown
    - Daily data for current month
    
    Args:
        site_hex: The hex ID of the site (from free_sites.hex_share_id)
        days: Number of days to look back (default: 30)
    
    Returns:
        Dictionary with processed analytics data
    """
    try:
        logger.info(f"Processing analytics for site_hex={site_hex}, days={days}")
        
        events = get_raw_events(site_hex, days)
        
        if not events:
            logger.info(f"No events found for {site_hex}")
            return {
                "site_hex": site_hex,
                "period_hours": days * 24,
                "total_pageviews": 0,
                "unique_visitors": 0,
                "bounce_rate": 0,
                "sessions": 0,
                "avg_pages_per_session": 0,
                "top_pages": [],
                "device_breakdown": {},
                "mobile_percentage": 0,
                "desktop_percentage": 0,
                "referrers": [],
                "browsers": [],
                "operating_systems": [],
                "country_breakdown": [],
                "live_users": 0,
                "live_sessions": [],
                "daily_data": [],
                "generated_at": datetime.utcnow().isoformat()
            }
        
        # Calculate metrics
        total_pageviews = len(events)  # Sum of all route views
        unique_visitors = len(set(e.get("unique_cookie") for e in events))
        unique_sessions = set(e.get("session_id") for e in events)
        sessions = len(unique_sessions)
        
        # Calculate bounce rate: sessions with only one pageview
        session_pageviews = defaultdict(int)
        for event in events:
            session_id = event.get("session_id")
            if session_id:
                session_pageviews[session_id] += 1
            
        bounced_sessions = sum(1 for count in session_pageviews.values() if count == 1)
        bounce_rate = round((bounced_sessions / sessions * 100)) if sessions > 0 else 0
        
        # Group by page path
        pages = defaultdict(int)
        for event in events:
            pages[event.get("page_path", "/")] += 1
        
        top_pages = sorted(
            [{"path": path, "views": count} for path, count in pages.items()],
            key=lambda x: x["views"],
            reverse=True
        )[:10]
        
        # Group by device
        devices = defaultdict(int)
        for event in events:
            devices[event.get("device_type", "unknown")] += 1
        
        device_breakdown = dict(devices)
        
        # Calculate device percentages
        total_device_events = sum(devices.values())
        mobile_count = devices.get("mobile", 0) + devices.get("tablet", 0)
        desktop_count = devices.get("desktop", 0)
        mobile_percentage = round((mobile_count / total_device_events * 100)) if total_device_events > 0 else 0
        desktop_percentage = round((desktop_count / total_device_events * 100)) if total_device_events > 0 else 0
        
        # Group by date for daily chart
        daily_views = defaultdict(int)
        for event in events:
            event_dt = _parse_event_time(event.get("event_time"))
            if event_dt:
                # Parse ISO format timestamp and extract date
                try:
                    date_key = event_dt.strftime("%Y-%m-%d")
                    daily_views[date_key] += 1
                except (ValueError, AttributeError):
                    continue
        
        # Fill in all days of the current month with 0 for missing days
        now = datetime.utcnow()
        # Get first day of current month
        first_day = datetime(now.year, now.month, 1)
        # Use today as the last day (not end of month)
        last_day = now
        
        # Create list of all days from 1st to today
        daily_data = []
        current_day = first_day
        while current_day.date() <= last_day.date():
            date_key = current_day.strftime("%Y-%m-%d")
            daily_data.append({
                "date": date_key,
                "views": daily_views.get(date_key, 0)
            })
            current_day += timedelta(days=1)
        
        # Country breakdown (top countries by unique sessions)
        countries = defaultdict(set)
        for event in events:
            country = (event.get("country") or "Unknown")
            session_id = _safe_name(event.get("session_id"), '')
            if session_id:
                countries[country].add(session_id)

        total_country_views = sum(len(session_ids) for session_ids in countries.values()) if countries else 0
        country_breakdown = []
        country_trends = defaultdict(lambda: defaultdict(int))
        live_cutoff = datetime.utcnow() - timedelta(minutes=5)
        live_sessions_by_id: Dict[str, Dict] = {}

        referrers = defaultdict(set)
        browsers = defaultdict(set)
        operating_systems = defaultdict(set)

        for event in events:
            event_dt = _parse_event_time(event.get("event_time"))
            if event_dt:
                event_date_key = event_dt.strftime("%Y-%m-%d")
                country_key = _safe_name(event.get("country"))
                country_trends[country_key][event_date_key] += 1

                if event_dt >= live_cutoff:
                    session_id = _safe_name(event.get("session_id"), '')
                    if session_id:
                        existing = live_sessions_by_id.get(session_id)
                        if not existing or (existing.get('_event_dt') and event_dt > existing['_event_dt']):
                            live_sessions_by_id[session_id] = {
                                '_event_dt': event_dt,
                                'location': ', '.join([part for part in [event.get('city'), event.get('region'), event.get('country')] if part]) or 'Unknown',
                                'page': event.get('page_path') or '/',
                                'browser': ' '.join([part for part in [_safe_name(event.get('browser'), ''), _safe_name(event.get('browser_version'), '')] if part]).strip() or 'Unknown',
                                'os': ' '.join([part for part in [_safe_name(event.get('os'), ''), _safe_name(event.get('os_version'), '')] if part]).strip() or 'Unknown',
                                'time': _format_live_age(event_dt),
                            }

            referrer_source, referrer_type = _normalize_referrer(event)
            session_id = _safe_name(event.get("session_id"), '')
            if session_id:
                referrers[(referrer_source, referrer_type)].add(session_id)

            browser_name = ' '.join([part for part in [_safe_name(event.get("browser"), 'Unknown'), _safe_name(event.get("browser_version"), '')] if part]).strip()
            if session_id:
                browsers[browser_name].add(session_id)

            os_name = ' '.join([part for part in [_safe_name(event.get("os"), 'Unknown'), _safe_name(event.get("os_version"), '')] if part]).strip()
            if session_id:
                operating_systems[os_name].add(session_id)

        total_referrer_visits = sum(len(session_ids) for session_ids in referrers.values()) or 0
        referrer_breakdown = []
        for (source_name, source_type), session_ids in sorted(referrers.items(), key=lambda item: len(item[1]), reverse=True)[:10]:
            visits = len(session_ids)
            referrer_breakdown.append({
                'source_name': source_name,
                'source_type': source_type,
                'visits': visits,
                'percentage': round((visits / total_referrer_visits * 100)) if total_referrer_visits > 0 else 0,
            })

        total_browser_visits = sum(len(session_ids) for session_ids in browsers.values()) or 0
        browser_breakdown = []
        for item in _build_ranked_breakdown(browsers, total_browser_visits, limit=10):
            browser_breakdown.append({
                'name': item['name'],
                'sessions': item['sessions'],
                'share': item['share'],
            })

        total_os_visits = sum(len(session_ids) for session_ids in operating_systems.values()) or 0
        operating_system_breakdown = []
        for item in _build_ranked_breakdown(operating_systems, total_os_visits, limit=10):
            operating_system_breakdown.append({
                'name': item['name'],
                'sessions': item['sessions'],
                'share': item['share'],
            })

        live_sessions = list(live_sessions_by_id.values())
        live_sessions.sort(key=lambda item: item['_event_dt'], reverse=True)
        live_sessions_payload = [
            {
                'location': item['location'],
                'page': item['page'],
                'browser': item['browser'],
                'os': item['os'],
                'time': item['time'],
            }
            for item in live_sessions
        ]

        for name, session_ids in sorted(countries.items(), key=lambda x: len(x[1]), reverse=True)[:10]:
            cnt = len(session_ids)
            pct = round((cnt / total_country_views * 100)) if total_country_views > 0 else 0
            sparkline = []
            for i in range(6, -1, -1):
                date_key = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
                sparkline.append(country_trends[name].get(date_key, 0))
            country_breakdown.append({"name": name, "visitors": cnt, "percentage": pct, "sparkline": sparkline})

        return {
            "site_hex": site_hex,
            "period_hours": days * 24,
            "total_pageviews": total_pageviews,
            "unique_visitors": unique_visitors,
            "bounce_rate": bounce_rate,
            "sessions": sessions,
            "avg_pages_per_session": round(total_pageviews / sessions, 2) if sessions > 0 else 0,
            "top_pages": top_pages,
            "device_breakdown": device_breakdown,
            "mobile_percentage": mobile_percentage,
            "desktop_percentage": desktop_percentage,
            "referrers": referrer_breakdown,
            "browsers": browser_breakdown,
            "operating_systems": operating_system_breakdown,
            "country_breakdown": country_breakdown,
            "live_users": len(live_sessions_payload),
            "live_sessions": live_sessions_payload,
            "daily_data": daily_data,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise Exception(f"Error processing analytics: {str(e)}")


def get_realtime_stats(site_hex: str) -> Dict:
    """
    Get real-time stats for a site (last 24 hours).
    
    Args:
        site_hex: The hex ID of the site
    
    Returns:
        Dictionary with real-time metrics
    """
    try:
        logger.info(f"Fetching real-time stats for site_hex={site_hex}")
        
        if supabase is None:
            logger.error("Supabase client is not initialized")
            return {}
        
        cutoff_time = (datetime.utcnow() - timedelta(hours=24)).isoformat()
        
        # Get last 24h events
        response = supabase.table("free_sites_raw_event").select(
            "unique_cookie, session_id, event_time, page_path, device_type"
        ).eq("site_hex", site_hex).gte("event_time", cutoff_time).execute()
        
        if not response.data:
            return {
                "site_hex": site_hex,
                "live_visitors": 0,
                "views_24h": 0,
                "top_pages": []
            }
        
        events = response.data
        live_cutoff = (datetime.utcnow() - timedelta(minutes=30)).isoformat()
        live_visitors = len(set(
            e["unique_cookie"] for e in events 
            if e.get("event_time", "") >= live_cutoff
        ))
        
        pages_24h = defaultdict(int)
        for event in events:
            pages_24h[event.get("page_path", "/")] += 1
        
        top_pages = sorted(
            [{"path": path, "views": count} for path, count in pages_24h.items()],
            key=lambda x: x["views"],
            reverse=True
        )[:5]
        
        return {
            "site_hex": site_hex,
            "live_visitors": live_visitors,
            "views_24h": len(events),
            "top_pages": top_pages,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error fetching real-time stats: {str(e)}", exc_info=True)
        raise Exception(f"Error fetching real-time stats: {str(e)}")