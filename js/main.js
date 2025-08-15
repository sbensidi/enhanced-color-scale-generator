/**
 * Main Application Entry Point
 * Initializes the Color Scale Generator application
 * Coordinates all modules and handles application lifecycle
 */

// Application metadata
const APP_INFO = {
    name: 'Color Scale Generator',
    version: '1.0.0',
    author: 'Claude Code',
    description: 'Generate beautiful, accessible color palettes for modern design systems'
};

/**
 * Initialize the application
 */
function initializeApplication() {
    
    try {
        // Check browser compatibility
        checkBrowserSupport();
        
        // Initialize error handling
        setupErrorHandling();
        
        // Initialize performance monitoring
        setupPerformanceMonitoring();
        
        // Initialize modules
        initializeModules();
        
        // Setup application ready state
        setupApplicationReady();
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showCriticalError('Application failed to load. Please refresh the page.');
    }
}

/**
 * Check browser compatibility
 */
function checkBrowserSupport() {
    const requiredFeatures = [
        'fetch',
        'Promise',
        'Map',
        'Set',
        'Array.from',
        'Object.assign'
    ];
    
    const missingFeatures = requiredFeatures.filter(feature => {
        const hasFeature = feature.split('.').reduce((obj, prop) => obj && obj[prop], window);
        return !hasFeature;
    });
    
    if (missingFeatures.length > 0) {
        throw new Error(`Browser missing required features: ${missingFeatures.join(', ')}`);
    }
    
    // Check for specific APIs
    if (!navigator.clipboard) {
    }
    
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (callback) => setTimeout(callback, 16);
    }
}

/**
 * Setup global error handling
 */
function setupErrorHandling() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
        console.error('Uncaught error:', event.error);
        const errorMessage = event.error && event.error.message ? 
            event.error.message : 
            event.message || 'Unknown error occurred';
        showError(`An unexpected error occurred: ${errorMessage}`);
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        const reason = event.reason;
        const errorMessage = reason && typeof reason === 'object' && reason.message ?
            reason.message :
            typeof reason === 'string' ? reason : 'An unexpected error occurred. Please try again.';
        showError(errorMessage);
        event.preventDefault(); // Prevent default browser error handling
    });
    
    // Handle network errors
    window.addEventListener('offline', () => {
        showWarning('You are currently offline. Some features may not work.');
    });
    
    window.addEventListener('online', () => {
        showSuccess('Connection restored.');
    });
}

/**
 * Setup performance monitoring
 */
function setupPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
        if (performance.timing) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            
            if (loadTime > 3000) {
            }
        }
    });
    
    // Monitor memory usage (if available)
    if (performance.memory) {
        setInterval(() => {
            const memory = performance.memory;
            const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
            const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
            
            if (usedMB > limitMB * 0.8) {
            }
        }, 30000); // Check every 30 seconds
    }
    
    // Monitor long tasks (if available)
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > 50) {
                    }
                });
            });
            observer.observe({ entryTypes: ['longtask'] });
        } catch (error) {
            // PerformanceObserver might not support longtask
        }
    }
}

/**
 * Initialize all application modules
 */
function initializeModules() {
    
    // Initialize UI Controller (main module)
    if (typeof initializeUIController === 'function') {
        initializeUIController();
    } else {
        throw new Error('UI Controller not available');
    }
    
    // Preload common colors for better UX
    if (typeof preloadCommonColors === 'function') {
        // Popular design system colors
        const commonColors = [
            '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', // Reds to greens
            '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', // Greens to blues
            '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', // Blues to purples
            '#ec4899', '#f43f5e', '#6b7280', '#374151', '#1f2937'  // Pinks and grays
        ];
        
        preloadCommonColors(commonColors).catch(error => {
        });
    }
}

/**
 * Setup application ready state
 */
function setupApplicationReady() {
    // Remove loading indicators
    const loadingElements = document.querySelectorAll('.app-loading');
    loadingElements.forEach(element => {
        element.style.display = 'none';
    });
    
    // Add loaded class to body for CSS transitions
    document.body.classList.add('app-loaded');
    
    // Setup keyboard shortcuts help
    setupKeyboardShortcuts();
    
    // Setup accessibility features
    setupAccessibilityFeatures();
    
    // Track application startup time
    const startupTime = performance.now();
    
    // Dispatch ready event
    document.dispatchEvent(new CustomEvent('appReady', {
        detail: {
            startupTime,
            version: APP_INFO.version
        }
    }));
}

/**
 * Setup keyboard shortcuts help
 */
function setupKeyboardShortcuts() {
    // Show keyboard shortcuts on Ctrl+/
    document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === '/') {
            event.preventDefault();
            showKeyboardShortcuts();
        }
        
        // Escape key to close modals/overlays
        if (event.key === 'Escape') {
            closeAllOverlays();
        }
        
        // Space key: smooth scroll to palette grid (when not focused on interactive element)
        if (event.key === ' ' && !isInteractiveElement(event.target)) {
            event.preventDefault();
            const paletteGrid = document.getElementById('paletteGrid');
            if (paletteGrid) {
                paletteGrid.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
}

/**
 * Check if element is interactive (should not be overridden by space key)
 */
function isInteractiveElement(element) {
    const interactiveTags = ['button', 'input', 'select', 'textarea', 'a'];
    const interactiveRoles = ['button', 'link', 'checkbox', 'radio', 'tab'];
    
    return (
        interactiveTags.includes(element.tagName.toLowerCase()) ||
        element.hasAttribute('tabindex') ||
        interactiveRoles.includes(element.getAttribute('role')) ||
        element.contentEditable === 'true'
    );
}

/**
 * Setup accessibility features
 */
function setupAccessibilityFeatures() {
    // Add focus indicators for keyboard navigation
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('click', () => {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Setup skip links
    const skipLink = document.createElement('a');
    skipLink.href = '#paletteGrid';
    skipLink.textContent = 'Skip to color palette';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '10px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Setup ARIA live regions for screen readers
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-announcements';
    document.body.appendChild(liveRegion);
}

/**
 * Show keyboard shortcuts modal
 */
function showKeyboardShortcuts() {
    const shortcuts = [
        { key: 'Ctrl/Cmd + Enter', description: 'Generate color scale' },
        { key: 'Ctrl/Cmd + D', description: 'Toggle dark mode' },
        { key: 'Ctrl/Cmd + C', description: 'Copy export code (when focused)' },
        { key: 'Ctrl/Cmd + /', description: 'Show this help' },
        { key: 'Escape', description: 'Close dialogs' },
        { key: 'Tab', description: 'Navigate between elements' }
    ];
    
    const modal = document.createElement('div');
    modal.className = 'shortcuts-modal';
    modal.innerHTML = `
        <div class="modal-backdrop">
            <div class="modal-content">
                <h3>Keyboard Shortcuts</h3>
                <div class="shortcuts-list">
                    ${shortcuts.map(shortcut => `
                        <div class="shortcut-item">
                            <kbd>${shortcut.key}</kbd>
                            <span>${shortcut.description}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="close-modal">Close</button>
            </div>
        </div>
    `;
    
    // Add styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(modal);
    
    // Close on backdrop click or close button
    modal.addEventListener('click', (event) => {
        if (event.target === modal.querySelector('.modal-backdrop') || 
            event.target === modal.querySelector('.close-modal')) {
            document.body.removeChild(modal);
        }
    });
    
    // Focus the close button
    modal.querySelector('.close-modal').focus();
}

/**
 * Close all overlays and modals
 */
function closeAllOverlays() {
    const modals = document.querySelectorAll('.shortcuts-modal, .modal, .overlay');
    modals.forEach(modal => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    });
}

/**
 * Show critical error that prevents app from working
 */
function showCriticalError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fee2e2;
        border: 2px solid #fecaca;
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        color: #dc2626;
        font-weight: 600;
        z-index: 9999;
        max-width: 400px;
    `;
    
    errorDiv.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h3 style="margin-bottom: 1rem;">Application Error</h3>
        <p style="margin-bottom: 1.5rem;">${message}</p>
        <button onclick="location.reload()" style="
            background: #dc2626;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        ">Reload Page</button>
    `;
    
    document.body.appendChild(errorDiv);
}

/**
 * Utility functions for notifications
 */
function showError(message) {
    if (typeof showToast === 'function') {
        showToast(message, 'error');
    } else {
        console.error(message);
    }
}

function showWarning(message) {
    if (typeof showToast === 'function') {
        showToast(message, 'warning');
    } else {
    }
}

function showSuccess(message) {
    if (typeof showToast === 'function') {
        showToast(message, 'success');
    } else {
    }
}

/**
 * Application health check
 */
function performHealthCheck() {
    const checks = {
        domLoaded: document.readyState === 'complete',
        uiController: typeof initializeUIController === 'function',
        colorUtils: typeof hexToRgb === 'function',
        scaleGenerator: typeof createColorScale === 'function',
        accessibility: typeof getContrastRatio === 'function',
        darkModeGenerator: typeof generateDarkModeScale === 'function',
        colorAPI: typeof getColorName === 'function'
    };
    
    const failedChecks = Object.entries(checks)
        .filter(([name, passed]) => !passed)
        .map(([name]) => name);
    
    if (failedChecks.length > 0) {
        console.error('Health check failed:', failedChecks);
        return false;
    }
    
    return true;
}

/**
 * Export application info for debugging
 */
function getAppInfo() {
    return {
        ...APP_INFO,
        userAgent: navigator.userAgent,
        screenSize: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        online: navigator.onLine,
        cookiesEnabled: navigator.cookieEnabled,
        performance: {
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1048576) + 'MB',
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + 'MB'
            } : 'Not available'
        }
    };
}

// Make debugging functions available globally
window.ColorScaleGenerator = {
    version: APP_INFO.version,
    getAppInfo,
    performHealthCheck,
    showKeyboardShortcuts
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    // DOM is already loaded
    initializeApplication();
}