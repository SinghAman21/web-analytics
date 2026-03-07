"""
Public routes for tracker script distribution
"""
from fastapi import APIRouter, Query
from fastapi.responses import FileResponse, PlainTextResponse
import os

router = APIRouter(
    prefix="/public",
    tags=["public"]
)

# Read tracker template
TRACKER_SCRIPT_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "tracker.js")

@router.get("/ultrafree")
async def get_tracker_script(site_hex: str = Query(...)):
    """
    Returns the ultrafree tracker script with site_hex injected
    Usage: GET /public/ultrafree?site_hex=abc123xyz789
    
    Returns JavaScript code that can be embedded on any website
    """
    
    # Validate site_hex format (12 alphanumeric characters)
    if not site_hex or len(site_hex) != 12 or not site_hex.isalnum():
        return PlainTextResponse(
            "console.error('Invalid site_hex parameter. Expected 12 alphanumeric characters.');",
            status_code=400
        )
    
    # Tracker code with site_hex injected
    tracker_code = f'''/**
 * Ultrafree Analytics - Tracker Script
 * Site ID: {site_hex}
 * Generated on: {__import__('datetime').datetime.now().isoformat()}
 */

(function() {{
  'use strict';

  // Configuration
  const CONFIG = {{
    BACKEND_URL: '/api/ultrafreeevents',
    COOKIE_NAME: 'ultrafree_cookie',
    SESSION_STORAGE_KEY: 'ultrafree_session',
    COOKIE_EXPIRY_DAYS: 365,
    BEACON_INTERVAL: 30000,
    IDLE_TIMEOUT: 1800000
  }};

  // State
  let state = {{
    siteHex: '{site_hex}',
    uniqueCookie: null,
    sessionId: null,
    pageStartTime: Date.now(),
    lastActivityTime: Date.now(),
    isActive: true,
    pageInteracted: false
  }};

  function getOrCreateCookie() {{
    let cookie = getCookie(CONFIG.COOKIE_NAME);
    if (!cookie) {{
      cookie = generateUUID();
      setCookie(CONFIG.COOKIE_NAME, cookie, CONFIG.COOKIE_EXPIRY_DAYS);
    }}
    return cookie;
  }}

  function getOrCreateSessionId() {{
    let sessionId = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
    if (!sessionId) {{
      sessionId = generateUUID();
      sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, sessionId);
    }}
    return sessionId;
  }}

  function generateUUID() {{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {{
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }});
  }}

  function setCookie(name, value, days) {{
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + value + ';' + expires + ';path=/;SameSite=Lax';
  }}

  function getCookie(name) {{
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {{
      const cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {{
        return cookie.substring(nameEQ.length);
      }}
    }}
    return null;
  }}

  function detectDeviceType() {{
    const ua = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|phone/i.test(ua)) {{
      return window.innerWidth < 768 ? 'mobile' : 'tablet';
    }}
    return window.innerWidth < 768 ? 'mobile' : 'desktop';
  }}

  function getScreenResolution() {{
    return window.screen.width + 'x' + window.screen.height;
  }}

  function getPagePath() {{
    return window.location.pathname;
  }}

  function getReferrer() {{
    return document.referrer || '';
  }}

  function isBounce() {{
    const timeOnPage = Date.now() - state.pageStartTime;
    return timeOnPage < CONFIG.IDLE_TIMEOUT && !state.pageInteracted;
  }}

  function collectEventData() {{
    return {{
      site_hex: state.siteHex,
      unique_cookie: state.uniqueCookie,
      session_id: state.sessionId,
      page_path: getPagePath(),
      device_type: detectDeviceType(),
      referrer: getReferrer(),
      screen_res: getScreenResolution()
    }};
  }}

  function sendBeacon(eventData) {{
    const payload = JSON.stringify(eventData);
    if (navigator.sendBeacon) {{
      const blob = new Blob([payload], {{ type: 'application/json' }});
      navigator.sendBeacon(CONFIG.BACKEND_URL, blob);
    }} else {{
      fetch(CONFIG.BACKEND_URL, {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: payload,
        keepalive: true
      }}).catch(err => console.error('Analytics send failed:', err));
    }}
  }}

  function trackPageView() {{
    const eventData = collectEventData();
    sendBeacon(eventData);
  }}

  function setupActivityListeners() {{
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {{
      document.addEventListener(event, function() {{
        state.pageInteracted = true;
        state.lastActivityTime = Date.now();
      }}, {{ once: true }});
    }});
  }}

  function setupPeriodicBeacon() {{
    setInterval(function() {{
      trackPageView();
    }}, CONFIG.BEACON_INTERVAL);
  }}

  function setupUnloadHandler() {{
    window.addEventListener('beforeunload', function() {{
      trackPageView();
    }});
    window.addEventListener('pagehide', function() {{
      trackPageView();
    }});
  }}

  function init() {{
    state.uniqueCookie = getOrCreateCookie();
    state.sessionId = getOrCreateSessionId();
    setupActivityListeners();
    setupUnloadHandler();
    setupPeriodicBeacon();
    trackPageView();
    console.log('Ultrafree Analytics initialized for site: {site_hex}');
  }}

  // Auto-initialize when script loads
  if (document.readyState === 'loading') {{
    document.addEventListener('DOMContentLoaded', init);
  }} else {{
    init();
  }}

}})();
'''
    
    return PlainTextResponse(tracker_code, media_type="application/javascript")


@router.get("/ultrafree.js")
async def get_tracker_script_alt(site_hex: str = Query(...)):
    """
    Alternative endpoint: /ultrafree.js?site_hex=abc123xyz789
    Same functionality as /ultrafree endpoint
    """
    return await get_tracker_script(site_hex=site_hex)
