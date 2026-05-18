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
 * - referrer: full referrer URL with query parameters
 * - screen_res: screen resolution
 * - browser: browser name (Chrome, Firefox, Safari, Edge, Opera, etc)
 * - browser_version: browser version number
 * - os: operating system (Windows, macOS, Linux, Android, iOS)
 * - os_version: OS version number
 * - utm_source: UTM source parameter
 * - utm_medium: UTM medium parameter
 * - utm_campaign: UTM campaign parameter
 * - utm_content: UTM content parameter
 * - utm_term: UTM term parameter
 * - page_load_time: total page load time in milliseconds
 * - dom_interactive_time: DOM interactive time in milliseconds
 * - first_paint_time: first paint time in milliseconds
 * - first_contentful_paint_time: first contentful paint time in milliseconds
 * - country: country name (from geolocation)
 * - country_code: ISO country code
 * - city: city name (from geolocation)
 * - timezone: timezone name
 * - is_bounce: whether user bounced (no meaningful engagement)
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    BACKEND_URL: 'https://wa-be.vercel.app/api/ping',
    PROXY_PATH: '/api/collect',
    COOKIE_NAME: 'free_cookie',
    SESSION_STORAGE_KEY: 'free_session',
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
    initialized: false,
    geoData: null,
    geoFetched: false,
    performanceData: null
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
   * Get viewport resolution
   */
  function getViewportResolution() {
    return window.innerWidth + 'x' + window.innerHeight;
  }

  /**
   * Get the current page title
   */
  function getPageTitle() {
    return document.title || '';
  }

  /**
   * Get the full current URL
   */
  function getPageUrl() {
    return window.location.href;
  }

  /**
   * Get the current hostname
   */
  function getHostname() {
    return window.location.hostname || '';
  }

  /**
   * Get the browser language
   */
  function getLanguage() {
    return navigator.language || navigator.userLanguage || '';
  }

  /**
   * Get the browser timezone
   */
  function getTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch (err) {
      return '';
    }
  }

  /**
   * Get the current network connection type if available
   */
  function getConnectionInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (!connection) {
      return {
        connection_type: null,
        connection_effective_type: null
      };
    }

    return {
      connection_type: connection.type || null,
      connection_effective_type: connection.effectiveType || null
    };
  }

  /**
   * Estimate scroll depth as a percentage of the document height
   */
  function getScrollDepth() {
    try {
      const documentElement = document.documentElement;
      const scrollTop = window.scrollY || documentElement.scrollTop || 0;
      const viewportHeight = window.innerHeight || documentElement.clientHeight || 0;
      const documentHeight = Math.max(documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0, 1);
      const progress = ((scrollTop + viewportHeight) / documentHeight) * 100;
      return Math.max(0, Math.min(100, Math.round(progress)));
    } catch (err) {
      return null;
    }
  }

  /**
   * Get current page path
   */
  function getPagePath() {
    return window.location.pathname;
  }

  /**
   * Get full referrer URL with query parameters
   */
  function getReferrer() {
    if (!document.referrer) {
      return '';
    }

    try {
      // Return full URL including path and query string
      return document.referrer;
    } catch (err) {
      return '';
    }
  }

  /**
   * Extract UTM parameters from current URL
   */
  function extractUTMParameters() {
    const utm = {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null
    };

    try {
      const params = new URLSearchParams(window.location.search);
      Object.keys(utm).forEach(key => {
        const value = params.get(key);
        if (value) {
          utm[key] = value;
        }
      });
    } catch (err) {
      // URL parsing failed, return empty UTM params
    }

    return utm;
  }

  /**
   * Parse user agent to detect browser and OS
   */
  function getBrowserAndOS() {
    const ua = navigator.userAgent;
    const browserOS = {
      browser: 'unknown',
      browser_version: 'unknown',
      os: 'unknown',
      os_version: 'unknown'
    };

    try {
      // Detect OS
      if (/windows/i.test(ua)) {
        browserOS.os = 'Windows';
        const winMatch = ua.match(/windows nt ([\d.]+)/i);
        if (winMatch) {
          const version = winMatch[1];
          browserOS.os_version = version;
          if (version === '10.0') browserOS.os = 'Windows 10/11';
          else if (version === '6.3') browserOS.os = 'Windows 8.1';
          else if (version === '6.2') browserOS.os = 'Windows 8';
          else if (version === '6.1') browserOS.os = 'Windows 7';
        }
      } else if (/macintosh/i.test(ua)) {
        browserOS.os = 'macOS';
        const macMatch = ua.match(/os x ([\d._]+)/i);
        if (macMatch) {
          browserOS.os_version = macMatch[1].replace(/_/g, '.');
        }
      } else if (/linux/i.test(ua) && !/android/i.test(ua)) {
        browserOS.os = 'Linux';
        const linuxMatch = ua.match(/linux ([\w]+)/i);
        if (linuxMatch) {
          browserOS.os_version = linuxMatch[1];
        }
      } else if (/android/i.test(ua)) {
        browserOS.os = 'Android';
        const androidMatch = ua.match(/android ([\d.]+)/i);
        if (androidMatch) {
          browserOS.os_version = androidMatch[1];
        }
      } else if (/iphone|ipad|ipod/i.test(ua)) {
        browserOS.os = 'iOS';
        const iosMatch = ua.match(/os ([\d_]+)/i);
        if (iosMatch) {
          browserOS.os_version = iosMatch[1].replace(/_/g, '.');
        }
      }

      // Detect Browser
      if (/edg/i.test(ua)) {
        browserOS.browser = 'Edge';
        const edgeMatch = ua.match(/edg.([\d.]+)/i);
        if (edgeMatch) browserOS.browser_version = edgeMatch[1];
      } else if (/chrome/i.test(ua) && !/chromium/i.test(ua)) {
        browserOS.browser = 'Chrome';
        const chromeMatch = ua.match(/chrome\/([\d.]+)/i);
        if (chromeMatch) browserOS.browser_version = chromeMatch[1];
      } else if (/safari/i.test(ua)) {
        browserOS.browser = 'Safari';
        const safariMatch = ua.match(/version\/([\d.]+)/i);
        if (safariMatch) browserOS.browser_version = safariMatch[1];
      } else if (/firefox/i.test(ua)) {
        browserOS.browser = 'Firefox';
        const firefoxMatch = ua.match(/firefox\/([\d.]+)/i);
        if (firefoxMatch) browserOS.browser_version = firefoxMatch[1];
      } else if (/opera|opr/i.test(ua)) {
        browserOS.browser = 'Opera';
        const operaMatch = ua.match(/(?:opera|opr|opios)\/([\d.]+)/i);
        if (operaMatch) browserOS.browser_version = operaMatch[1];
      }
    } catch (err) {
      // If parsing fails, return defaults
    }

    return browserOS;
  }

  /**
   * Get page performance metrics using Performance API
   */
  function getPagePerformance() {
    const perfData = {
      page_load_time: null,
      dom_interactive_time: null,
      first_paint_time: null,
      first_contentful_paint_time: null
    };

    try {
      if (!window.performance || !window.performance.timing) {
        return perfData;
      }

      const timing = window.performance.timing;
      const navigation = window.performance.navigation;
      
      // Total page load time
      if (timing.loadEventEnd && timing.navigationStart) {
        perfData.page_load_time = Math.round(timing.loadEventEnd - timing.navigationStart);
      }

      // DOM Interactive time
      if (timing.domInteractive && timing.navigationStart) {
        perfData.dom_interactive_time = Math.round(timing.domInteractive - timing.navigationStart);
      }

      // First Paint and First Contentful Paint (newer API)
      if (window.performance.getEntriesByType) {
        const paintEntries = window.performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
          if (entry.name === 'first-paint') {
            perfData.first_paint_time = Math.round(entry.startTime);
          } else if (entry.name === 'first-contentful-paint') {
            perfData.first_contentful_paint_time = Math.round(entry.startTime);
          }
        });
      }
    } catch (err) {
      // Performance API not available
    }

    return perfData;
  }

  /**
   * Fetch geolocation data from IP
   * Using free ipapi.co service (no API key required)
   */
  function fetchGeoData() {
    if (state.geoFetched || state.geoData) {
      return;
    }

    state.geoFetched = true;

    safeRun(function() {
      fetch('https://ipapi.co/json/', {
        mode: 'cors',
        credentials: 'omit',
        timeout: 5000
      })
      .then(response => response.json())
      .then(data => {
        state.geoData = {
          country: data.country_name || null,
          country_code: data.country_code || null,
          city: data.city || null,
          region: data.region || null,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          timezone: data.timezone || null,
          isp: data.org || null
        };
      })
      .catch(err => {
        // Geo fetch failed, will use null values
        state.geoData = null;
      });
    }, 'fetchGeoData');
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
      const browserOS = getBrowserAndOS();
      const utmParams = extractUTMParameters();
      const perfData = getPagePerformance();
      const connectionInfo = getConnectionInfo();
      const geoData = state.geoData || {};

      const eventData = {
        event_type: 'page_view',
        site_hex: state.siteHex,
        unique_cookie: state.uniqueCookie,
        session_id: state.sessionId,
        page_url: getPageUrl(),
        page_path: getPagePath(),
        page_title: getPageTitle(),
        page_hostname: getHostname(),
        device_type: detectDeviceType(),
        viewport_res: getViewportResolution(),
        referrer: getReferrer(),
        screen_res: getScreenResolution(),
        language: getLanguage(),
        timezone: getTimezone() || geoData.timezone || null,
        connection_type: connectionInfo.connection_type,
        connection_effective_type: connectionInfo.connection_effective_type,
        is_bounce: isBounce(),
        interaction_count: state.interactionCount,
        scroll_depth: getScrollDepth(),
        browser: browserOS.browser,
        browser_version: browserOS.browser_version,
        os: browserOS.os,
        os_version: browserOS.os_version,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_content: utmParams.utm_content,
        utm_term: utmParams.utm_term,
        page_load_time: perfData.page_load_time,
        dom_interactive_time: perfData.dom_interactive_time,
        first_paint_time: perfData.first_paint_time,
        first_contentful_paint_time: perfData.first_contentful_paint_time,
        country: geoData.country || null,
        country_code: geoData.country_code || null,
        region: geoData.region || null,
        city: geoData.city || null,
        latitude: geoData.latitude || null,
        longitude: geoData.longitude || null,
        isp: geoData.isp || null
      };

      return eventData;
    }, 'collectEventData') || {
      event_type: 'page_view',
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

    // Fetch geo data asynchronously (non-blocking)
    fetchGeoData();

    // Initial page view
    trackPageView({ event_type: 'page_load' });

    console.log('Analytics tracker initialized for site:', siteHex);
  }

  /**
   * Public API
   */
  window.FreeAnalytics = {
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

  window.FreeAnalytics = window.FreeAnalytics;

  function autoInitFromScriptTag() {
    const scripts = document.querySelectorAll('script[data-site-hex]');
    scripts.forEach(script => {
      const siteHex = script.getAttribute('data-site-hex');
      if (siteHex) {
        window.FreeAnalytics.init(siteHex);
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

// document.cookie.includes('free_cookie=')
// sessionStorage.getItem('free_session') 
// window.FreeAnalytics 
// Network tab: confirm POSTs to /api/freeevents with unique_cookie and session_id