/**
 * Advanced Error Handling System
 * Centralized error handling, reporting, and user feedback
 */

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 50; // Keep last 50 errors
        this.reportingEnabled = true;
        this.debugMode = this.isDebugMode();
        
        this.init();
    }

    init() {
        // Global error handlers
        this.setupGlobalHandlers();
        
        // Create error reporting UI
        this.createErrorUI();
        
        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    isDebugMode() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.search.includes('debug=true');
    }

    setupGlobalHandlers() {
        // JavaScript errors
        window.addEventListener('error', (event) => {
            try {
                this.handleError({
                    type: 'javascript',
                    message: event.message || 'Unknown error',
                    filename: event.filename || 'unknown',
                    lineno: event.lineno || 0,
                    colno: event.colno || 0,
                    error: event.error,
                    stack: event.error?.stack,
                    timestamp: Date.now(),
                    url: window.location.href,
                    userAgent: navigator.userAgent
                });
            } catch (handlerError) {
                console.error('Error in error handler:', handlerError);
            }
        });

        // Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            try {
                const reason = event.reason;
                const message = reason && typeof reason === 'object' && reason.message ?
                    reason.message :
                    typeof reason === 'string' ? reason : 'Unhandled Promise Rejection';
                
                this.handleError({
                    type: 'promise',
                    message: message,
                    reason: event.reason,
                    stack: reason?.stack,
                    timestamp: Date.now(),
                    url: window.location.href,
                    userAgent: navigator.userAgent
                });
            } catch (handlerError) {
                console.error('Error in promise rejection handler:', handlerError);
            }
        });

        // Network errors
        this.setupNetworkErrorHandling();
    }

    setupNetworkErrorHandling() {
        // Intercept fetch errors
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                
                if (!response.ok) {
                    this.handleError({
                        type: 'network',
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        url: args[0],
                        status: response.status,
                        statusText: response.statusText,
                        timestamp: Date.now()
                    });
                }
                
                return response;
            } catch (error) {
                this.handleError({
                    type: 'network',
                    message: `Network error: ${error.message}`,
                    url: args[0],
                    error: error,
                    stack: error.stack,
                    timestamp: Date.now()
                });
                
                throw error; // Re-throw to maintain original behavior
            }
        };
    }

    setupPerformanceMonitoring() {
        // Monitor memory usage
        if (performance.memory) {
            setInterval(() => {
                const memory = performance.memory;
                const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
                const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
                const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
                
                // Warn if memory usage is high
                if (usedMB > limitMB * 0.8) {
                    this.handleError({
                        type: 'performance',
                        message: `High memory usage: ${usedMB}MB / ${limitMB}MB`,
                        severity: 'warning',
                        memory: { used: usedMB, total: totalMB, limit: limitMB },
                        timestamp: Date.now()
                    });
                }
            }, 30000); // Check every 30 seconds
        }

        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.duration > 50) {
                            this.handleError({
                                type: 'performance',
                                message: `Long task detected: ${Math.round(entry.duration)}ms`,
                                severity: 'warning',
                                duration: entry.duration,
                                startTime: entry.startTime,
                                timestamp: Date.now()
                            });
                        }
                    });
                });
                
                observer.observe({ entryTypes: ['longtask'] });
            } catch (error) {
                // Silently fail if longtask is not supported
            }
        }
    }

    handleError(errorInfo) {
        // Validate errorInfo
        if (!errorInfo || typeof errorInfo !== 'object') {
            console.warn('Invalid error info passed to handleError:', errorInfo);
            return;
        }
        
        // Ensure required fields
        errorInfo.message = errorInfo.message || 'Unknown error';
        errorInfo.type = errorInfo.type || 'unknown';
        errorInfo.timestamp = errorInfo.timestamp || Date.now();
        
        // Add to error log
        this.errors.push(errorInfo);
        
        // Keep only recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }

        // Log to console in debug mode
        if (this.debugMode) {
            console.group(`🚨 ${errorInfo.type.toUpperCase()} Error`);
            console.error('Message:', errorInfo.message);
            console.error('Full info:', errorInfo);
            if (errorInfo.stack) {
                console.error('Stack:', errorInfo.stack);
            }
            console.groupEnd();
        }

        // Show user-friendly notification for critical errors
        this.showUserNotification(errorInfo);

        // Report to external service
        this.reportError(errorInfo);

        // Store locally for debugging
        this.storeErrorLocally(errorInfo);
    }

    showUserNotification(errorInfo) {
        // Only show notifications for critical errors
        if (errorInfo.type === 'javascript' || 
            (errorInfo.type === 'network' && errorInfo.status >= 500) ||
            (errorInfo.type === 'performance' && errorInfo.severity !== 'warning')) {
            
            const message = this.getUserFriendlyMessage(errorInfo);
            this.showToast(message, 'error');
        }
    }

    getUserFriendlyMessage(errorInfo) {
        const messages = {
            javascript: 'Something went wrong. Please refresh the page and try again.',
            network: 'Network connection issue. Please check your internet connection.',
            promise: 'An unexpected error occurred. The application will continue to work.',
            performance: 'The application is running slowly. Some features may be affected.'
        };

        return messages[errorInfo.type] || 'An unexpected error occurred.';
    }

    showToast(message, type = 'error') {
        // Use existing toast system if available
        if (typeof showToast === 'function') {
            showToast(message, type);
            return;
        }

        // Fallback toast implementation
        const toast = document.createElement('div');
        toast.className = `error-toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc2626' : '#f59e0b'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    reportError(errorInfo) {
        if (!this.reportingEnabled) return;

        // Skip reporting for development
        if (this.debugMode && errorInfo.type === 'performance') return;

        // Prepare error report
        const report = {
            ...errorInfo,
            sessionId: this.getSessionId(),
            pageLoadTime: Date.now() - (window.performance?.timing?.navigationStart || Date.now()),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            colorGeneratorState: this.getAppState()
        };

        // Send to external service (configure for your error tracking service)
        /*
        // Example: Sentry
        if (typeof Sentry !== 'undefined') {
            Sentry.captureException(new Error(errorInfo.message), {
                tags: {
                    errorType: errorInfo.type,
                    severity: errorInfo.severity || 'error'
                },
                extra: report
            });
        }
        */

        // Custom error reporting endpoint
        /*
        fetch('/api/errors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
        }).catch(() => {
            // Silently fail if reporting fails
        });
        */
    }

    storeErrorLocally(errorInfo) {
        try {
            const key = 'colorGenerator_errors';
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push(errorInfo);
            
            // Keep only last 20 errors locally
            const recent = existing.slice(-20);
            localStorage.setItem(key, JSON.stringify(recent));
        } catch (error) {
            // Silently fail if localStorage is not available
        }
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('colorGenerator_sessionId');
        if (!sessionId) {
            sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            sessionStorage.setItem('colorGenerator_sessionId', sessionId);
        }
        return sessionId;
    }

    getAppState() {
        try {
            // Capture relevant app state for debugging
            return {
                currentColor: window.AppState?.selectedColor || null,
                scaleConfig: window.AppState?.scaleConfiguration || null,
                enhancedMode: window.AppState?.useEnhancedAlgorithms || null,
                darkMode: document.body.classList.contains('dark-theme'),
                minimalView: document.body.classList.contains('minimal-view')
            };
        } catch (error) {
            return null;
        }
    }

    createErrorUI() {
        // Create debug panel for development
        if (!this.debugMode) return;

        const panel = document.createElement('div');
        panel.id = 'error-debug-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            width: 300px;
            max-height: 200px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 10px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            overflow-y: auto;
            z-index: 9999;
            display: none;
        `;

        const toggle = document.createElement('button');
        toggle.textContent = '🐛';
        toggle.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            width: 40px;
            height: 40px;
            border: none;
            border-radius: 50%;
            background: #dc2626;
            color: white;
            font-size: 16px;
            cursor: pointer;
            z-index: 10000;
        `;

        toggle.onclick = () => {
            const isVisible = panel.style.display !== 'none';
            panel.style.display = isVisible ? 'none' : 'block';
            if (!isVisible) {
                this.updateDebugPanel();
            }
        };

        document.body.appendChild(panel);
        document.body.appendChild(toggle);

        this.debugPanel = panel;
    }

    updateDebugPanel() {
        if (!this.debugPanel) return;

        const recentErrors = this.errors.slice(-10);
        this.debugPanel.innerHTML = `
            <strong>Recent Errors (${this.errors.length})</strong><br>
            ${recentErrors.map(error => `
                <div style="margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1);">
                    <strong>${error.type}</strong>: ${error.message}<br>
                    <small>${new Date(error.timestamp).toLocaleTimeString()}</small>
                </div>
            `).join('')}
        `;
    }

    // Public API
    getErrors() {
        return [...this.errors];
    }

    clearErrors() {
        this.errors = [];
        if (this.debugPanel) {
            this.updateDebugPanel();
        }
    }

    reportCustomError(message, type = 'custom', additionalInfo = {}) {
        this.handleError({
            type,
            message,
            ...additionalInfo,
            timestamp: Date.now(),
            url: window.location.href
        });
    }

    // Utility method for wrapping async functions
    wrapAsync(fn, context = 'async operation') {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                this.handleError({
                    type: 'wrapped',
                    message: `Error in ${context}: ${error.message}`,
                    context,
                    error,
                    stack: error.stack,
                    timestamp: Date.now()
                });
                throw error;
            }
        };
    }

    // Utility method for wrapping sync functions
    wrapSync(fn, context = 'sync operation') {
        return (...args) => {
            try {
                return fn(...args);
            } catch (error) {
                this.handleError({
                    type: 'wrapped',
                    message: `Error in ${context}: ${error.message}`,
                    context,
                    error,
                    stack: error.stack,
                    timestamp: Date.now()
                });
                throw error;
            }
        };
    }
}

// Initialize error handler
const errorHandler = new ErrorHandler();

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
} else if (typeof window !== 'undefined') {
    window.ErrorHandler = errorHandler;
}