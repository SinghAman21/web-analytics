/**
 * Web Analytics Tracker
 * Collects user data and sends it to backend using Beacon API
 * 
 * Schema fields tracked:
 * - site_hex: unique site identifier
 * - event_time: automatic timestamp
 * - unique_cookie: persistent user identifier
 * - session_id: current session identifier
 * - page_path: current page URL path
 * - device_type: desktop/mobile/tablet
 * - referrer: document referrer
 * - screen_res: screen resolution
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    BACKEND_URL: 'https://wa-be.vercel.app/api/e',
    COOKIE_NAME: 'ultrafree_cookie',
    SESSION_STORAGE_KEY: 'ultrafree_session',
    COOKIE_EXPIRY_DAYS: 365,
    BEACON_INTERVAL: 30000, // 30 seconds
    IDLE_TIMEOUT: 600000, // 10 minutes for bounce detection
    // First-party proxy fallback (less likely to be blocked)
    USE_PROXY: true,
    PROXY_PATH: '/api/collect'
  };

  // State
  let state = {
    siteHex: null,
    uniqueCookie: null,
    sessionId: null,
    pageStartTime: Date.now(),
    lastActivityTime: Date.now(),
    isActive: true,
    pageInteracted: false,
    initialized: false
  };

  /**
   * Get or create a unique cookie for the user
   */
  function getOrCreateCookie() {
    let cookie = getCookie(CONFIG.COOKIE_NAME);
    
    if (!cookie) {
      cookie = generateUUID();
      setCookie(CONFIG.COOKIE_NAME, cookie, CONFIG.COOKIE_EXPIRY_DAYS);
    }
    
    return cookie;
  }

  /**
   * Get or create a session ID
   */
  function getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
    
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, sessionId);
    }
    
    return sessionId;
  }

  /**
   * Generate UUID v4
   */
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Cookie management functions
   */
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + date.toUTCString();
    // Add Secure flag for HTTPS sites
    const secure = window.location.protocol === 'https:' ? ';Secure' : '';
    document.cookie = name + '=' + value + ';' + expires + ';path=/;SameSite=Lax' + secure;
  }

  function getCookie(name) {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  }

  /**
   * Detect device type based on user agent and screen size
   */
function detectDeviceType() {
    const ua = navigator.userAgent.toLowerCase();
    return /mobile|android|iphone|phone/i.test(ua) ? 'mobile' : 'desktop';
}

  /**
   * Get screen resolution
   */
  function getScreenResolution() {
    return window.screen.width + 'x' + window.screen.height;
  }

  /**
   * Get current page path
   */
  function getPagePath() {
    return window.location.pathname;
  }

  /**
   * Get document referrer
   */
  function getReferrer() {
    return document.referrer || '';
  }

  /**
   * Detect if user is bouncing (no interaction after idle timeout)
   */
  function isBounce() {
    const timeOnPage = Date.now() - state.pageStartTime;
    return timeOnPage < CONFIG.IDLE_TIMEOUT && !state.pageInteracted;
  }

  /**
   * Collect all event data matching schema
   */
  function collectEventData() {
    return {
      site_hex: state.siteHex,
      unique_cookie: state.uniqueCookie,
      session_id: state.sessionId,
      page_path: getPagePath(),
      device_type: detectDeviceType(),
      referrer: getReferrer(),
      screen_res: getScreenResolution()
      // event_time: handled by server
      // ip_hash: handled by server
    };
  }

  /**
   * Get the endpoint URL - prefer first-party proxy if configured
   */
  function getEndpointUrl() {
    if (CONFIG.USE_PROXY && CONFIG.PROXY_PATH) {
      // Use same-origin proxy path (bypasses ad blockers)
      return CONFIG.PROXY_PATH;
    }
    return CONFIG.BACKEND_URL;
  }

  /**
   * Send event data using Beacon API (reliable even on page unload)
   */
  function sendBeacon(eventData) {
    const payload = JSON.stringify(eventData);
    const url = getEndpointUrl();
    
    // Use Beacon API for reliable delivery
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      const sent = navigator.sendBeacon(url, blob);
      if (!sent) {
        // Fallback if beacon queue is full
        sendFetch(payload);
      }
    } else {
      sendFetch(payload);
    }
  }

  /**
   * Fallback fetch method
   */
  function sendFetch(payload) {
    const url = getEndpointUrl();
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true
    }).catch(function(err) {
      // Silently fail - ad blocker likely blocked it
      console.debug('Event send failed (may be blocked):', err.message);
    });
  }

  /**
   * Track page view
   */
  function trackPageView() {
    const eventData = collectEventData();
    sendBeacon(eventData);
  }

  /**
   * Setup activity listeners to detect user interaction
   */
  function setupActivityListeners() {
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, function() {
        state.pageInteracted = true;
        state.lastActivityTime = Date.now();
      }, { once: true }); // Only needs to fire once
    });
  }

  /**
   * Setup periodic beacon sending
   */
  function setupPeriodicBeacon() {
    setInterval(function() {
      trackPageView();
    }, CONFIG.BEACON_INTERVAL);
  }

  /**
   * Setup unload handler to send data before page leaves
   */
  function setupUnloadHandler() {
    window.addEventListener('beforeunload', function() {
      trackPageView();
    });

    window.addEventListener('pagehide', function() {
      trackPageView();
    });
  }

  /**
   * Initialize tracker with site hex ID
   * Must be called before any tracking
   */
  function init(siteHex) {
    if (!siteHex) {
      console.error('Analytics: siteHex is required');
      return;
    }

    if (state.initialized) {
      return;
    }

    state.siteHex = siteHex;
    state.uniqueCookie = getOrCreateCookie();
    state.sessionId = getOrCreateSessionId();
    state.initialized = true;

    setupActivityListeners();
    setupUnloadHandler();
    setupPeriodicBeacon();

    // Initial page view
    trackPageView();

    console.log('Analytics tracker initialized for site:', siteHex);
  }

  /**
   * Public API
   */
  window.UltrafreeAnalytics = {
    init: init,
    trackPageView: trackPageView,
    trackEvent: function(customData) {
      const eventData = collectEventData();
      Object.assign(eventData, customData);
      sendBeacon(eventData);
    }
  };

  function autoInitFromScriptTag() {
    const scripts = document.querySelectorAll('script[data-site-hex]');
    scripts.forEach(script => {
      const siteHex = script.getAttribute('data-site-hex');
      if (siteHex) {
        window.UltrafreeAnalytics.init(siteHex);
      }
    });
  }

  // Auto-init if data attribute is present
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitFromScriptTag);
  } else {
    autoInitFromScriptTag();
  }

})();

// document.cookie.includes('ultrafree_cookie=')
// sessionStorage.getItem('ultrafree_session') 
// window.UltrafreeAnalytics 
// Network tab: confirm POSTs to /api/ultrafreeevents with unique_cookie and session_id