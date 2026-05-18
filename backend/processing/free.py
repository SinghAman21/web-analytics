def process_analytics(site_hex: str, hours: int = 24) -> Dict:
    """
    Process raw events into analytics metrics.
    
    Calculates:
    - Total pageviews
    - Unique visitors (unique cookies)
    - Bounce rate
    - Top pages
    - Device breakdown
    
    Args:
        site_hex: The hex ID of the site
        hours: Number of hours to look back
    
    Returns:
        Dictionary with processed analytics data
    """
    try:
        logger.info(f"Processing analytics for site_hex={site_hex}")
        
        events = get_raw_events(site_hex, hours)
        
        if not events:
            logger.info(f"No events found for {site_hex}")
            return {
                "site_hex": site_hex,
                "period_hours": hours,
                "total_pageviews": 0,
                "unique_visitors": 0,
                "bounce_rate": 0,
                "sessions": 0,
                "avg_pages_per_session": 0,
                "top_pages": [],
                "device_breakdown": {},
                "mobile_percentage": 0,
                "desktop_percentage": 0,
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
        
        # Country breakdown (top countries by views)
        countries = defaultdict(int)
        for event in events:
            country = (event.get("country") or "Unknown")
            countries[country] += 1

        total_country_views = sum(countries.values()) if countries else 0
        country_breakdown = []
        for name, cnt in sorted(countries.items(), key=lambda x: x[1], reverse=True)[:10]:
            pct = round((cnt / total_country_views * 100)) if total_country_views > 0 else 0
            country_breakdown.append({"name": name, "visitors": cnt, "percentage": pct, "sparkline": []})

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
            "daily_data": daily_data,
            "country_breakdown": country_breakdown,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise Exception(f"Error processing analytics: {str(e)}")