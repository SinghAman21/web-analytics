"""
Data processing logic for ultrafree analytics
Fetches raw events from database and processes them into analytics metrics
"""

from core.config import supabase
from datetime import datetime, timedelta
from typing import Optional, List, Dict
from collections import defaultdict


def get_raw_events(site_hex: str, hours: int = 24) -> List[Dict]:
    """
    Fetch raw events for a site from the past N hours.
    
    Args:
        site_hex: The hex ID of the site
        hours: Number of hours to look back (default: 24)
    
    Returns:
        List of raw event records
    """
    try:
        # Calculate timestamp for N hours ago
        cutoff_time = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
        
        response = supabase.table("ultrafree_raw_events").select(
            "*"
        ).eq("site_hex", site_hex).gte("event_time", cutoff_time).execute()
        
        return response.data if response.data else []
    
    except Exception as e:
        raise Exception(f"Error fetching raw events: {str(e)}")


def process_analytics(site_hex: str, hours: int = 24) -> Dict:
    """
    Process raw events into analytics metrics.
    
    Calculates:
    - Total pageviews
    - Unique visitors (unique cookies)
    - Bounce rate
    - Top pages
    - Device breakdown
    - Referrer sources
    
    Args:
        site_hex: The hex ID of the site
        hours: Number of hours to look back
    
    Returns:
        Dictionary with processed analytics data
    """
    try:
        events = get_raw_events(site_hex, hours)
        
        if not events:
            return {
                "site_hex": site_hex,
                "period_hours": hours,
                "total_pageviews": 0,
                "unique_visitors": 0,
                "bounce_rate": 0,
                "sessions": 0,
                "top_pages": [],
                "device_breakdown": {},
                "referrers": [],
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
        
        # Group by referrer
        referrers_dict = defaultdict(int)
        for event in events:
            referrer = event.get("referrer") or "direct"
            referrers_dict[referrer] += 1
        
        referrers = sorted(
            [{"source": ref, "count": count} for ref, count in referrers_dict.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:10]
        
        # Group by date for daily chart
        daily_views = defaultdict(int)
        for event in events:
            event_time_str = event.get("event_time")
            if event_time_str:
                # Parse ISO format timestamp and extract date
                try:
                    event_dt = datetime.fromisoformat(event_time_str.replace('Z', '+00:00'))
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
        
        return {
            "site_hex": site_hex,
            "period_hours": hours,
            "total_pageviews": total_pageviews,
            "unique_visitors": unique_visitors,
            "bounce_rate": bounce_rate,
            "sessions": sessions,
            "avg_pages_per_session": round(total_pageviews / sessions, 2) if sessions > 0 else 0,
            "top_pages": top_pages,
            "device_breakdown": device_breakdown,
            "mobile_percentage": mobile_percentage,
            "desktop_percentage": desktop_percentage,
            "referrers": referrers,
            "daily_data": daily_data,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise Exception(f"Error processing analytics: {str(e)}")


def get_realtime_stats(site_hex: str) -> Dict:
    """
    Get real-time stats for the last hour.
    
    Args:
        site_hex: The hex ID of the site
    
    Returns:
        Real-time metrics
    """
    try:
        events = get_raw_events(site_hex, hours=1)
        
        return {
            "site_hex": site_hex,
            "active_visitors": len(set(e.get("unique_cookie") for e in events)),
            "pageviews_last_hour": len(events),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise Exception(f"Error getting realtime stats: {str(e)}")


def get_analytics_by_period(site_hex: str, start_date: str, end_date: str) -> Dict:
    """
    Get analytics for a specific date range.
    
    Args:
        site_hex: The hex ID of the site
        start_date: Start date in ISO format (YYYY-MM-DD)
        end_date: End date in ISO format (YYYY-MM-DD)
    
    Returns:
        Analytics data for the period
    """
    try:
        response = supabase.table("ultrafree_raw_events").select(
            "*"
        ).eq("site_hex", site_hex).gte("event_time", start_date).lte("event_time", end_date).execute()
        
        events = response.data if response.data else []
        
        if not events:
            return {
                "site_hex": site_hex,
                "period": f"{start_date} to {end_date}",
                "total_pageviews": 0,
                "unique_visitors": 0,
                "bounce_rate": 0,
                "generated_at": datetime.utcnow().isoformat()
            }
        
        # Calculate metrics
        total_pageviews = len(events)
        unique_visitors = len(set(e.get("unique_cookie") for e in events))
        sessions = len(set(e.get("session_id") for e in events))
        
        bounced = len([e for e in events if e.get("is_bounce") is True])
        bounce_rate = round((bounced / sessions * 100), 2) if sessions > 0 else 0
        
        pages = defaultdict(int)
        for event in events:
            pages[event.get("page_path", "/")] += 1
        
        top_pages = sorted(
            [{"path": path, "views": count} for path, count in pages.items()],
            key=lambda x: x["views"],
            reverse=True
        )[:10]
        
        return {
            "site_hex": site_hex,
            "period": f"{start_date} to {end_date}",
            "total_pageviews": total_pageviews,
            "unique_visitors": unique_visitors,
            "bounce_rate": bounce_rate,
            "sessions": sessions,
            "top_pages": top_pages,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise Exception(f"Error getting analytics by period: {str(e)}")