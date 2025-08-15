/**
 * Analytics and User Tracking
 * Privacy-focused analytics for Color Scale Generator
 */

class Analytics {
    constructor() {
        this.isEnabled = this.shouldEnableAnalytics();
        this.sessionId = this.getSessionId();
        this.pageLoadTime = Date.now();
        
        if (this.isEnabled) {
            this.init();
        }
    }

    shouldEnableAnalytics() {
        // Check if user has opted out
        if (localStorage.getItem('analytics_opt_out') === 'true') {
            return false;
        }
        
        // Disable in development
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') {
            return false;
        }
        
        // Check Do Not Track header
        if (navigator.doNotTrack === '1') {
            return false;
        }
        
        return true;
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('analytics_session');
        if (!sessionId) {
            sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            sessionStorage.setItem('analytics_session', sessionId);
        }
        return sessionId;
    }

    init() {
        // Initialize Google Analytics 4 if available
        this.initializeGA4();
        
        // Track page view
        this.trackPageView();
        
        // Setup automatic event tracking
        this.setupEventTracking();
        
        // Track performance metrics
        this.setupPerformanceTracking();
    }

    initializeGA4() {
        // Check if gtag is available
        if (typeof gtag === 'undefined') {
            // Load Google Analytics 4
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=G-0VY3JCRCX8';
            document.head.appendChild(script);

            // Initialize gtag
            window.dataLayer = window.dataLayer || [];
            window.gtag = function() { dataLayer.push(arguments); };
            gtag('js', new Date());
            gtag('config', 'G-0VY3JCRCX8', {
                anonymize_ip: true,
                allow_google_signals: false,
                allow_ad_personalization_signals: false
            });
        }
    }

    trackPageView() {
        this.trackEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href,
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`
        });
    }

    setupEventTracking() {
        // Track color scale generations
        document.addEventListener('colorScaleGenerated', (event) => {
            this.trackEvent('generate_color_scale', {
                scale_type: event.detail.scaleConfiguration,
                enhanced_algorithms: event.detail.useEnhancedAlgorithms,
                accessibility_mode: event.detail.accessibilityMode,
                generation_time_ms: event.detail.generationTime
            });
        });

        // Track export actions
        document.addEventListener('exportCopied', (event) => {
            this.trackEvent('copy_export', {
                export_format: event.detail.format,
                content_length: event.detail.contentLength,
                include_dark_mode: event.detail.includeDarkMode,
                include_original: event.detail.includeOriginal
            });
        });

        // Track download actions
        document.addEventListener('exportDownloaded', (event) => {
            this.trackEvent('download_export', {
                export_format: event.detail.format,
                file_size: event.detail.fileSize
            });
        });

        // Track theme changes
        document.addEventListener('themeChanged', (event) => {
            this.trackEvent('change_theme', {
                theme: event.detail.theme
            });
        });

        // Track enhanced algorithm usage
        document.addEventListener('enhancedAlgorithmToggled', (event) => {
            this.trackEvent('toggle_enhanced_algorithms', {
                enabled: event.detail.enabled,
                algorithm: event.detail.algorithm
            });
        });
    }

    setupPerformanceTracking() {
        // Track Web Vitals if available
        if (typeof window.WebVitalsMonitor !== 'undefined') {
            setTimeout(() => {
                const metrics = window.WebVitalsMonitor.getMetrics();
                
                // Track Core Web Vitals
                if (metrics.lcp) {
                    this.trackEvent('web_vital_lcp', {
                        value: Math.round(metrics.lcp.value),
                        rating: metrics.lcp.rating
                    });
                }
                
                if (metrics.fid) {
                    this.trackEvent('web_vital_fid', {
                        value: Math.round(metrics.fid.value),
                        rating: metrics.fid.rating
                    });
                }
                
                if (metrics.cls) {
                    this.trackEvent('web_vital_cls', {
                        value: Math.round(metrics.cls.value * 1000) / 1000,
                        rating: metrics.cls.rating
                    });
                }
            }, 3000);
        }

        // Track page load time
        window.addEventListener('load', () => {
            const loadTime = Date.now() - this.pageLoadTime;
            this.trackEvent('page_load_time', {
                load_time_ms: loadTime
            });
        });
    }

    trackEvent(eventName, parameters = {}) {
        if (!this.isEnabled) return;

        // Add common parameters
        const eventData = {
            ...parameters,
            session_id: this.sessionId,
            timestamp: Date.now(),
            page_url: window.location.href
        };

        // Send to Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
        }

        // Custom analytics endpoint (uncomment if you have one)
        /*
        fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: eventName,
                data: eventData
            })
        }).catch(() => {
            // Silently fail
        });
        */

        // Store locally for debugging
        if (window.location.hostname === 'localhost') {
            console.log('📊 Analytics Event:', eventName, eventData);
        }
    }

    // Track custom events
    trackColorGeneration(options) {
        this.trackEvent('color_generation', {
            base_color: options.baseColor,
            scale_configuration: options.scaleConfiguration,
            enhanced_algorithms: options.enhancedAlgorithms,
            accessibility_mode: options.accessibilityMode,
            generation_time: options.generationTime
        });
    }

    trackExportAction(format, options = {}) {
        this.trackEvent('export_action', {
            format: format,
            include_dark_mode: options.includeDarkMode || false,
            include_original: options.includeOriginal || false,
            action_type: options.actionType || 'copy' // copy or download
        });
    }

    trackError(errorType, errorMessage, context = {}) {
        this.trackEvent('application_error', {
            error_type: errorType,
            error_message: errorMessage,
            context: JSON.stringify(context),
            user_agent: navigator.userAgent
        });
    }

    trackFeatureUsage(feature, details = {}) {
        this.trackEvent('feature_usage', {
            feature_name: feature,
            ...details
        });
    }

    // User consent management
    enableAnalytics() {
        localStorage.removeItem('analytics_opt_out');
        this.isEnabled = true;
        this.init();
        this.trackEvent('analytics_enabled');
    }

    disableAnalytics() {
        localStorage.setItem('analytics_opt_out', 'true');
        this.isEnabled = false;
        this.trackEvent('analytics_disabled');
    }

    isAnalyticsEnabled() {
        return this.isEnabled;
    }
}

// Helper function to dispatch custom events
function dispatchAnalyticsEvent(eventType, detail) {
    const event = new CustomEvent(eventType, { detail });
    document.dispatchEvent(event);
}

// Initialize analytics
const analytics = new Analytics();

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Analytics, dispatchAnalyticsEvent };
} else if (typeof window !== 'undefined') {
    window.Analytics = analytics;
    window.dispatchAnalyticsEvent = dispatchAnalyticsEvent;
}

// Privacy notice helpers
function showPrivacyNotice() {
    const notice = document.createElement('div');
    notice.id = 'privacy-notice';
    notice.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        max-width: 500px;
        margin: 0 auto;
        background: #1f2937;
        color: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 14px;
        line-height: 1.4;
    `;
    
    notice.innerHTML = `
        <p style="margin: 0 0 12px 0;">
            We use privacy-focused analytics to improve our service. 
            No personal data is collected.
        </p>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="privacy-decline" style="background: transparent; border: 1px solid #6b7280; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                Decline
            </button>
            <button id="privacy-accept" style="background: #3b82f6; border: none; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                Accept
            </button>
        </div>
    `;
    
    document.body.appendChild(notice);
    
    // Handle user choice
    document.getElementById('privacy-accept').onclick = () => {
        analytics.enableAnalytics();
        notice.remove();
        localStorage.setItem('privacy_notice_shown', 'true');
    };
    
    document.getElementById('privacy-decline').onclick = () => {
        analytics.disableAnalytics();
        notice.remove();
        localStorage.setItem('privacy_notice_shown', 'true');
    };
}

// Show privacy notice if not shown before
if (!localStorage.getItem('privacy_notice_shown') && 
    window.location.hostname !== 'localhost') {
    setTimeout(showPrivacyNotice, 2000);
}