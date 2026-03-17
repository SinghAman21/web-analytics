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
    BACKEND_URL: 'https://wa-be.vercel.app/api/ping',
    PROXY_PATH: '/api/collect',
    COOKIE_NAME: 'ultrafree_cookie',
    SESSION_STORAGE_KEY: 'ultrafree_session',
    SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes inactivity => new session
    COOKIE_EXPIRY_DAYS: 365,
    BEACON_INTERVAL: 120000, // 2 minutes
    INTERACTION_THROTTLE_MS: 15000,
    MAX_KEEPALIVE_BYTES: 60 * 1024,
    IDLE_TIMEOUT: 5 * 60 * 1000, // 5 minutes for bounce detection
    USE_PROXY: false  // Enable if running first-party proxy at PROXY_PATH
  };

  // State
  let state = {
    siteHex: null,
    uniqueCookie: null,
    sessionId: null,
    memorySessionId: null,
    intervalId: null,
    pageStartTime: Date.now(),
    lastActivityTime: Date.now(),
    lastInteractionSentAt: 0,
    interactionCount: 0,
    isActive: true,
    pageInteracted: false,
    scrollEventCount: 0,
    lastScrollY: typeof window !== 'undefined' ? window.scrollY || 0 : 0,
    initialized: false
  };

  function safeRun(fn, label) {
    try {
      return fn();
    } catch (err) {
      console.warn('Analytics ' + label + ' failed:', err && err.message ? err.message : err);
      return null;
    }
  }

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
    const now = Date.now();

    try {
      const raw = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id && parsed.lastSeen && (now - parsed.lastSeen) < CONFIG.SESSION_TIMEOUT_MS) {
          parsed.lastSeen = now;
          sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, JSON.stringify(parsed));
          return parsed.id;
        }
      }

      const freshId = generateUUID();
      sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, JSON.stringify({ id: freshId, lastSeen: now }));
      return freshId;
    } catch (err) {
      // Private/incognito modes can throw on sessionStorage access.
      if (!state.memorySessionId) {
        state.memorySessionId = generateUUID();
      }
      return state.memorySessionId;
    }
  }

  function touchSession() {
    const now = Date.now();
    try {
      const raw = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id === state.sessionId) {
        parsed.lastSeen = now;
        sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch (err) {
      // no-op (storage unavailable)
    }
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
    const attributes = [
      'expires=' + date.toUTCString(),
      'path=/'
    ];

    if (window.location.protocol === 'https:') {
      attributes.push('SameSite=None');
      attributes.push('Secure');
    } else {
      attributes.push('SameSite=Lax');
    }

    document.cookie = name + '=' + encodeURIComponent(value) + ';' + attributes.join(';');
  }

  function getCookie(name) {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  }

  /**
   * Detect device type based on user agent and screen size
   */
  function detectDeviceType() {
    const ua = navigator.userAgent.toLowerCase();
    const isIPadOSDesktopUA = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

    if (isIPadOSDesktopUA || /ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) {
      return 'tablet';
    }

    if (/mobile|android|iphone|ipod|phone/i.test(ua)) {
      return 'mobile';
    }

    return 'desktop';
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
    if (!document.referrer) {
      return '';
    }

    try {
      const url = new URL(document.referrer);
      return url.origin;
    } catch (err) {
      return '';
    }
  }

  /**
   * Detect if user is bouncing (no interaction after idle timeout)
   */
  function isBounce() {
    const timeOnPage = Date.now() - state.pageStartTime;
    const hasMeaningfulEngagement = state.interactionCount >= 2;
    return timeOnPage < CONFIG.IDLE_TIMEOUT && !hasMeaningfulEngagement;
  }

  /**
   * Collect all event data matching schema
   */
  function collectEventData() {
    return safeRun(function() {
      touchSession();
      return {
        site_hex: state.siteHex,
        unique_cookie: state.uniqueCookie,
        session_id: state.sessionId,
        page_path: getPagePath(),
        device_type: detectDeviceType(),
        referrer: getReferrer(),
        screen_res: getScreenResolution(),
        is_bounce: isBounce()
        // event_time: handled by server
        // ip_hash: handled by server
      };
    }, 'collectEventData') || {
      site_hex: state.siteHex,
      unique_cookie: state.uniqueCookie,
      session_id: state.sessionId,
      page_path: '/'
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
   * Send event data using fetch with keepalive (avoids beacon blocking)
   * keepalive: true ensures request completes even on page unload
   */
  function getPayloadSize(payload) {
    if (window.TextEncoder) {
      return new TextEncoder().encode(payload).length;
    }
    return payload.length * 2;
  }

  function sendEvent(eventData, options) {
    const opts = options || {};
    let payload = safeRun(function() {
      return JSON.stringify(eventData);
    }, 'stringifyPayload');

    if (!payload) {
      return;
    }

    if (getPayloadSize(payload) > CONFIG.MAX_KEEPALIVE_BYTES) {
      // keepalive/sendBeacon are size-constrained, fallback to compact payload
      payload = JSON.stringify(collectEventData());
    }

    const url = getEndpointUrl();

    if (opts.preferBeacon && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      const beaconSent = navigator.sendBeacon(url, blob);
      if (beaconSent) {
        return;
      }
    }

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: !!opts.keepalive,
      mode: 'cors',
      credentials: 'omit'  // Don't send cookies - not needed and avoids CORS issues
    }).catch(function(err) {
      console.debug('Event send failed (may be blocked):', err.message);
    });
  }

  /**
   * Track page view
   */
  function trackPageView(meta) {
    safeRun(function() {
      const eventData = collectEventData();
      Object.assign(eventData, meta || {});
      sendEvent(eventData, { keepalive: false });
    }, 'trackPageView');
  }

  /**
   * Setup activity listeners to detect user interaction
   */
  function setupActivityListeners() {
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    activityEvents.forEach(function(eventName) {
      document.addEventListener(eventName, function() {
        const now = Date.now();
        state.lastActivityTime = now;

        if (eventName === 'scroll') {
          state.scrollEventCount += 1;
          const currentY = window.scrollY || 0;
          const delta = Math.abs(currentY - state.lastScrollY);
          state.lastScrollY = currentY;

          // Ignore tiny/accidental scroll touches for bounce purposes.
          if (state.scrollEventCount < 2 || delta < 120) {
            return;
          }
        }

        state.pageInteracted = true;
        state.interactionCount += 1;

        if (now - state.lastInteractionSentAt >= CONFIG.INTERACTION_THROTTLE_MS) {
          state.lastInteractionSentAt = now;
          trackPageView({ event_type: 'interaction', interaction_type: eventName });
        }
      }, { passive: true });
    });
  }

  /**
   * Setup periodic beacon sending
   */
  // function setupPeriodicBeacon() {
  //   state.intervalId = setInterval(function() {
  //     if (document.visibilityState === 'visible') {
  //       trackPageView({ event_type: 'heartbeat' });
  //     }
  //   }, CONFIG.BEACON_INTERVAL);
  // }

  /**
   * Setup unload handler to send data before page leaves
   */
  function setupUnloadHandler() {
    window.addEventListener('pagehide', function(event) {
      if (event.persisted) {
        return;
      }
      const eventData = collectEventData();
      eventData.event_type = 'page_exit';
      sendEvent(eventData, { preferBeacon: true, keepalive: true });
    });

    document.addEventListener('visibilitychange', function() {
      state.isActive = document.visibilityState === 'visible';
      if (document.visibilityState === 'hidden') {
        const eventData = collectEventData();
        eventData.event_type = 'page_hidden';
        sendEvent(eventData, { preferBeacon: true, keepalive: true });
      }
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
    // setupPeriodicBeacon();

    // Initial page view
    trackPageView({ event_type: 'page_load' });

    console.log('Analytics tracker initialized for site:', siteHex);
  }

  /**
   * Public API
   */
  window.UltrafreeAnalytics = {
    init: init,
    trackPageView: function() {
      trackPageView({ event_type: 'manual_page_view' });
    },
    trackEvent: function(customData) {
      safeRun(function() {
        const eventData = collectEventData();
        Object.assign(eventData, customData || {});
        sendEvent(eventData, { keepalive: false });
      }, 'trackEvent');
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