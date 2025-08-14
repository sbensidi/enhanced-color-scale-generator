/**
 * Web Vitals Monitoring
 * Measures and reports Core Web Vitals for performance monitoring
 */

class WebVitalsMonitor {
    constructor() {
        this.metrics = {};
        this.isSupported = this.checkSupport();
        this.init();
    }

    checkSupport() {
        return 'PerformanceObserver' in window && 'performance' in window;
    }

    init() {
        if (!this.isSupported) {
            console.warn('Web Vitals monitoring not supported in this browser');
            return;
        }

        // Measure all Core Web Vitals
        this.measureLCP(); // Largest Contentful Paint
        this.measureFID(); // First Input Delay  
        this.measureCLS(); // Cumulative Layout Shift
        this.measureFCP(); // First Contentful Paint
        this.measureTTFB(); // Time to First Byte

        // Send metrics when page becomes hidden
        this.setupReporting();
    }

    /**
     * Largest Contentful Paint (LCP)
     * Good: < 2.5s, Needs improvement: 2.5-4s, Poor: > 4s
     */
    measureLCP() {
        try {
            const observer = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.metrics.lcp = {
                    value: lastEntry.startTime,
                    rating: this.rateLCP(lastEntry.startTime),
                    element: lastEntry.element?.tagName || 'unknown',
                    timestamp: Date.now()
                };
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
            console.warn('LCP measurement failed:', error);
        }
    }

    /**
     * First Input Delay (FID)
     * Good: < 100ms, Needs improvement: 100-300ms, Poor: > 300ms
     */
    measureFID() {
        try {
            const observer = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach((entry) => {
                    if (entry.processingStart) {
                        const fid = entry.processingStart - entry.startTime;
                        
                        this.metrics.fid = {
                            value: fid,
                            rating: this.rateFID(fid),
                            eventType: entry.name,
                            timestamp: Date.now()
                        };
                    }
                });
            });
            
            observer.observe({ entryTypes: ['first-input'] });
        } catch (error) {
            console.warn('FID measurement failed:', error);
        }
    }

    /**
     * Cumulative Layout Shift (CLS)
     * Good: < 0.1, Needs improvement: 0.1-0.25, Poor: > 0.25
     */
    measureCLS() {
        try {
            let clsValue = 0;
            const observer = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                
                entries.forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });

                this.metrics.cls = {
                    value: clsValue,
                    rating: this.rateCLS(clsValue),
                    timestamp: Date.now()
                };
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
            console.warn('CLS measurement failed:', error);
        }
    }

    /**
     * First Contentful Paint (FCP)
     * Good: < 1.8s, Needs improvement: 1.8-3s, Poor: > 3s
     */
    measureFCP() {
        try {
            const observer = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach((entry) => {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.fcp = {
                            value: entry.startTime,
                            rating: this.rateFCP(entry.startTime),
                            timestamp: Date.now()
                        };
                    }
                });
            });
            
            observer.observe({ entryTypes: ['paint'] });
        } catch (error) {
            console.warn('FCP measurement failed:', error);
        }
    }

    /**
     * Time to First Byte (TTFB)
     * Good: < 600ms, Needs improvement: 600-1500ms, Poor: > 1500ms
     */
    measureTTFB() {
        try {
            const observer = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach((entry) => {
                    if (entry.entryType === 'navigation') {
                        const ttfb = entry.responseStart - entry.requestStart;
                        
                        this.metrics.ttfb = {
                            value: ttfb,
                            rating: this.rateTTFB(ttfb),
                            timestamp: Date.now()
                        };
                    }
                });
            });
            
            observer.observe({ entryTypes: ['navigation'] });
        } catch (error) {
            console.warn('TTFB measurement failed:', error);
        }
    }

    // Rating functions
    rateLCP(value) {
        if (value < 2500) return 'good';
        if (value < 4000) return 'needs-improvement';
        return 'poor';
    }

    rateFID(value) {
        if (value < 100) return 'good';
        if (value < 300) return 'needs-improvement';
        return 'poor';
    }

    rateCLS(value) {
        if (value < 0.1) return 'good';
        if (value < 0.25) return 'needs-improvement';
        return 'poor';
    }

    rateFCP(value) {
        if (value < 1800) return 'good';
        if (value < 3000) return 'needs-improvement';
        return 'poor';
    }

    rateTTFB(value) {
        if (value < 600) return 'good';
        if (value < 1500) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Setup reporting when page becomes hidden
     */
    setupReporting() {
        // Report when page becomes hidden
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.reportMetrics();
            }
        });

        // Report on page unload as fallback
        window.addEventListener('beforeunload', () => {
            this.reportMetrics();
        });

        // Report after a delay to catch late metrics
        setTimeout(() => {
            this.reportMetrics();
        }, 5000);
    }

    /**
     * Get current metrics summary
     */
    getMetrics() {
        return {
            ...this.metrics,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: Date.now(),
            performance: {
                memory: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                } : null,
                connection: navigator.connection ? {
                    effectiveType: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt
                } : null
            }
        };
    }

    /**
     * Report metrics (customize this for your analytics service)
     */
    reportMetrics() {
        const metrics = this.getMetrics();
        
        // Console reporting for development
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' ||
                             window.location.search.includes('debug=true');
        
        if (isDevelopment) {
            console.group('🔬 Web Vitals Report');
            console.table(Object.fromEntries(
                Object.entries(metrics)
                    .filter(([key]) => ['lcp', 'fid', 'cls', 'fcp', 'ttfb'].includes(key))
                    .map(([key, value]) => [key.toUpperCase(), `${Math.round(value.value)}${key === 'cls' ? '' : 'ms'} (${value.rating})`])
            ));
            console.log('Full metrics:', metrics);
            console.groupEnd();
        }

        // Send to analytics service (uncomment and configure for your service)
        /*
        if (typeof gtag !== 'undefined') {
            // Google Analytics 4
            Object.entries(metrics).forEach(([key, value]) => {
                if (value && value.value !== undefined) {
                    gtag('event', key, {
                        custom_parameter_value: value.value,
                        custom_parameter_rating: value.rating
                    });
                }
            });
        }
        */

        // Custom analytics endpoint
        /*
        fetch('/api/web-vitals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metrics)
        }).catch(err => console.warn('Failed to report Web Vitals:', err));
        */

        // Store locally for debugging
        if (typeof localStorage !== 'undefined') {
            try {
                const existing = JSON.parse(localStorage.getItem('webVitals') || '[]');
                existing.push(metrics);
                // Keep only last 10 entries
                localStorage.setItem('webVitals', JSON.stringify(existing.slice(-10)));
            } catch (error) {
                console.warn('Failed to store Web Vitals locally:', error);
            }
        }
    }

    /**
     * Get performance score (0-100)
     */
    getPerformanceScore() {
        const scores = {
            lcp: this.metrics.lcp ? (this.metrics.lcp.rating === 'good' ? 100 : this.metrics.lcp.rating === 'needs-improvement' ? 50 : 0) : 50,
            fid: this.metrics.fid ? (this.metrics.fid.rating === 'good' ? 100 : this.metrics.fid.rating === 'needs-improvement' ? 50 : 0) : 50,
            cls: this.metrics.cls ? (this.metrics.cls.rating === 'good' ? 100 : this.metrics.cls.rating === 'needs-improvement' ? 50 : 0) : 50,
            fcp: this.metrics.fcp ? (this.metrics.fcp.rating === 'good' ? 100 : this.metrics.fcp.rating === 'needs-improvement' ? 50 : 0) : 50,
            ttfb: this.metrics.ttfb ? (this.metrics.ttfb.rating === 'good' ? 100 : this.metrics.ttfb.rating === 'needs-improvement' ? 50 : 0) : 50
        };

        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
        return Math.round(totalScore / Object.keys(scores).length);
    }
}

// Initialize Web Vitals monitoring
const webVitalsMonitor = new WebVitalsMonitor();

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebVitalsMonitor;
} else if (typeof window !== 'undefined') {
    window.WebVitalsMonitor = webVitalsMonitor;
}