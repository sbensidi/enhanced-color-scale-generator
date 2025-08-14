/**
 * UI Controller Module
 * Manages all DOM interactions and application state
 * Handles input processing, scale rendering, theme switching, and export functionality
 */

// Application state
const AppState = {
    baseColor: '#3791c6',
    colorName: 'Ocean Blue',
    originalColorName: 'Ocean Blue', // Keep original color name separate
    scaleConfiguration: 'triad',
    lightModeScale: [],
    darkModeScale: [],
    accessibleLightScale: null,
    accessibleDarkScale: null,
    isDarkModeActive: false,
    isMinimalViewActive: true,
    selectedExportFormat: 'css-variables',
    lastGenerationTime: 0,
    apiCallCount: 0,
    accessibilityMode: 'full', // Default to full accessibility mode
    lightboxDarkMode: false, // Default lightbox theme to light
    
    // Enhanced algorithm settings
    useEnhancedAlgorithms: true,
    usePerceptualUniformity: true,
    interpolationMethod: 'lch',
    enableBezierInterpolation: false,
    qualityMetrics: null
};

// DOM elements
let domElements = {};

// Debouncing for color generation
let colorGenerationTimeout = null;

/**
 * Initialize UI Controller
 */
function initializeUIController() {
    // Cache DOM elements
    cacheDOM();
    
    // Bind event listeners
    bindEvents();
    
    // Initialize segmented control
    initializeSegmentedControl();
    
    // Initialize theme
    initializeTheme();
    
    // Initialize back to top button
    initializeBackToTop();
    
    // Initialize enhanced algorithm controls
    initializeEnhancedControls();
    
    // Generate initial color scale
    generateInitialScale();
}

/**
 * Initialize Back to Top button functionality
 */
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    const floatingCoffeeBtn = document.getElementById('floatingCoffeeBtn');
    
    if (!backToTopBtn) return;
    
    // Show/hide buttons based on scroll position
    function toggleFloatingButtons() {
        const scrolled = window.pageYOffset > 100;
        
        if (scrolled) {
            backToTopBtn.classList.add('visible');
            if (floatingCoffeeBtn) {
                floatingCoffeeBtn.classList.add('show');
            }
        } else {
            backToTopBtn.classList.remove('visible');
            if (floatingCoffeeBtn) {
                floatingCoffeeBtn.classList.remove('show');
            }
        }
    }
    
    // Scroll to top when clicked
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Add event listeners
    window.addEventListener('scroll', toggleFloatingButtons);
    backToTopBtn.addEventListener('click', scrollToTop);
    
    // Initial check
    toggleFloatingButtons();
}

/**
 * Cache DOM elements for performance
 */
function cacheDOM() {
    domElements = {
        // Input elements
        colorPicker: document.getElementById('colorPicker'),
        scaleRangeRadios: document.querySelectorAll('input[name="scaleRange"]'),
        scaleSegmentedControl: document.getElementById('scaleSegmentedControl'),
        segmentIndicator: document.getElementById('segmentIndicator'),
        
        // Accessibility mode configuration
        accessibilityModeRadios: document.querySelectorAll('input[name="accessibilityMode"]'),
        accessibilitySegmentedControl: document.getElementById('accessibilitySegmentedControl'),
        accessibilityIndicator: document.getElementById('accessibilityIndicator'),
        
        // Theme toggle
        themeToggle: document.getElementById('themeToggle'),
        
        // State elements
        loadingState: document.getElementById('loadingState'),
        errorState: document.getElementById('errorState'),
        
        // Palette elements
        paletteGrid: document.getElementById('paletteGrid'),
        originalColumn: document.getElementById('originalColumn'),
        accessibleLightColumn: document.getElementById('accessibleLightColumn'),
        accessibleDarkColumn: document.getElementById('accessibleDarkColumn'),
        
        // Accessibility indicators
        originalAccessibilityIndicator: document.getElementById('originalAccessibilityIndicator'),
        
        // Column title elements
        originalColumnTitle: document.getElementById('originalColumnTitle'),
        accessibleLightTitle: document.getElementById('accessibleLightTitle'),
        accessibleDarkTitle: document.getElementById('accessibleDarkTitle'),
        
        // Color card containers
        originalCards: document.getElementById('originalCards'),
        accessibleLightCards: document.getElementById('accessibleLightCards'),
        accessibleDarkCards: document.getElementById('accessibleDarkCards'),
        
        // Accessibility summary elements
        baseAccessibility: document.getElementById('baseAccessibility'),
        originalAccessibilitySummary: document.getElementById('originalAccessibilitySummary'),
        
        // Export elements
        exportSection: document.getElementById('exportSection'),
        exportFormat: document.getElementById('exportFormat'),
        includeDarkMode: document.getElementById('includeDarkMode'),
        includeOriginalScale: document.getElementById('includeOriginalScale'),
        copyExportBtn: document.getElementById('copyExportBtn'),
        downloadExportBtn: document.getElementById('downloadExportBtn'),
        exportOutput: document.getElementById('exportOutput'),
        
        // Live Preview elements
        livePreviewSection: document.getElementById('livePreviewSection'),
        previewDarkMode: document.getElementById('previewDarkMode'),
        previewAccessible: document.getElementById('previewAccessible'),
        
        // Header elements
        appHeader: document.getElementById('appHeader'),
        
        // Sticky header controls
        stickyControls: document.getElementById('stickyControls'),
        stickyColorPicker: document.getElementById('stickyColorPicker'),
        stickyColorPickerText: document.getElementById('stickyColorPickerText'),
        stickyColorClear: document.getElementById('stickyColorClear'),
        stickyScaleSelect: document.getElementById('stickyScaleSelect'),
        stickyAccessibilitySelect: document.getElementById('stickyAccessibilitySelect'),
        stickyViewModeToggle: document.getElementById('stickyViewModeToggle'),
        
        // Color picker enhancements
        colorPickerText: document.getElementById('colorPickerText'),
        colorPickerClear: document.getElementById('colorPickerClear'),
        
        // View mode controls
        viewModeToggle: document.getElementById('viewModeToggle'),
        
        // Preview lightbox elements
        previewLightbox: document.getElementById('previewLightbox'),
        lightboxClose: document.getElementById('lightboxClose'),
        lightboxBackdrop: document.getElementById('lightboxBackdrop'),
        lightboxBody: document.getElementById('lightboxBody'),
        stickyPreviewBtn: document.getElementById('stickyPreviewBtn'),
        lightboxDarkModeToggle: document.getElementById('lightboxDarkModeToggle'),
        
        // Toast container
        toastContainer: document.getElementById('toastContainer'),
        
        // Enhanced algorithm controls
        algorithmControls: document.getElementById('algorithmControls'),
        enhancedAlgorithmsToggle: document.getElementById('enhancedAlgorithmsToggle'),
        stickyEnhancedAlgorithmsToggle: document.getElementById('stickyEnhancedAlgorithmsToggle'),
        enhancedAlgorithmToggle: document.getElementById('enhancedAlgorithmToggle'),
        perceptualUniformityToggle: document.getElementById('perceptualUniformityToggle'),
        interpolationMethodSelect: document.getElementById('interpolationMethodSelect'),
        bezierInterpolationToggle: document.getElementById('bezierInterpolationToggle'),
        
        // Quality metrics panel
        qualityMetricsPanel: document.getElementById('qualityMetricsPanel'),
        qualityMetricsContent: document.getElementById('qualityMetricsContent'),
        
        // Legacy elements
        advancedSettingsHeader: document.getElementById('advancedSettingsHeader'),
        advancedSettingsContent: document.getElementById('advancedSettingsContent')
    };
}

/**
 * Bind event listeners
 */
function bindEvents() {
    // Color input events
    domElements.colorPicker.addEventListener('change', handleColorPickerChange);
    domElements.colorPicker.addEventListener('input', handleColorPickerInput);
    
    // Color picker text enhancements - only update on Enter or blur
    domElements.colorPickerText.addEventListener('keydown', handleColorPickerTextKeydown);
    domElements.colorPickerText.addEventListener('blur', handleColorPickerTextBlur);
    domElements.colorPickerClear.addEventListener('click', handleColorPickerClear);
    
    // Scale configuration radio buttons
    domElements.scaleRangeRadios.forEach(radio => {
        radio.addEventListener('change', handleScaleConfigChange);
        radio.addEventListener('focus', () => {
            // Update indicator on focus for keyboard navigation
            updateSegmentIndicator(radio);
        });
    });
    
    // Accessibility mode radio buttons
    domElements.accessibilityModeRadios.forEach(radio => {
        radio.addEventListener('change', handleAccessibilityModeChange);
        radio.addEventListener('focus', () => {
            // Update indicator on focus for keyboard navigation
            updateAccessibilityIndicator(radio);
        });
    });
    
    // Theme toggle
    domElements.themeToggle.addEventListener('click', handleThemeToggle);
    
    // Export events
    domElements.exportFormat.addEventListener('change', handleExportFormatChange);
    domElements.includeDarkMode.addEventListener('change', handleIncludeDarkModeChange);
    domElements.includeOriginalScale.addEventListener('change', handleIncludeOriginalScaleChange);
    domElements.copyExportBtn.addEventListener('click', handleCopyExport);
    domElements.downloadExportBtn.addEventListener('click', handleDownloadExport);
    
    // Live Preview events
    domElements.previewDarkMode.addEventListener('change', handlePreviewModeChange);
    domElements.previewAccessible.addEventListener('change', handlePreviewModeChange);
    
    // Sticky header controls
    domElements.stickyColorPicker.addEventListener('change', handleStickyColorPickerChange);
    domElements.stickyColorPicker.addEventListener('input', handleStickyColorPickerInput);
    domElements.stickyColorPickerText.addEventListener('keydown', handleStickyColorPickerTextKeydown);
    domElements.stickyColorPickerText.addEventListener('blur', handleStickyColorPickerTextBlur);
    domElements.stickyColorClear.addEventListener('click', handleStickyColorClear);
    domElements.stickyScaleSelect.addEventListener('change', handleStickyScaleSelectChange);
    domElements.stickyAccessibilitySelect.addEventListener('change', handleStickyAccessibilitySelectChange);
    domElements.stickyViewModeToggle.addEventListener('click', handleViewModeToggle);
    domElements.stickyPreviewBtn.addEventListener('click', handleStickyPreviewClick);
    
    // View mode controls
    domElements.viewModeToggle.addEventListener('click', handleViewModeToggle);
    
    // Lightbox controls
    domElements.lightboxClose.addEventListener('click', handleLightboxClose);
    domElements.lightboxBackdrop.addEventListener('click', handleLightboxClose);
    domElements.lightboxDarkModeToggle.addEventListener('click', handleLightboxDarkModeToggle);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Window events
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('scroll', handleHeaderScroll);
    
    // Enhanced algorithm control events
    if (domElements.enhancedAlgorithmsToggle) {
        domElements.enhancedAlgorithmsToggle.addEventListener('click', handleEnhancedAlgorithmsToggle);
    }
    if (domElements.stickyEnhancedAlgorithmsToggle) {
        domElements.stickyEnhancedAlgorithmsToggle.addEventListener('click', handleEnhancedAlgorithmsToggle);
    }
    if (domElements.enhancedAlgorithmToggle) {
        domElements.enhancedAlgorithmToggle.addEventListener('change', handleEnhancedAlgorithmToggle);
    }
    if (domElements.perceptualUniformityToggle) {
        domElements.perceptualUniformityToggle.addEventListener('change', handlePerceptualUniformityToggle);
    }
    if (domElements.interpolationMethodSelect) {
        domElements.interpolationMethodSelect.addEventListener('change', handleInterpolationMethodChange);
    }
    if (domElements.bezierInterpolationToggle) {
        domElements.bezierInterpolationToggle.addEventListener('change', handleBezierInterpolationToggle);
    }
    
    // Legacy accordion events (if still present)
    if (domElements.advancedSettingsHeader) {
        domElements.advancedSettingsHeader.addEventListener('click', handleAccordionToggle);
    }
}


/**
 * Handle color picker change
 */
function handleColorPickerChange(event) {
    const value = event.target.value;
    AppState.baseColor = normalizeHex(value);
    
    // Update all color inputs to stay in sync
    updateAllColorInputs(AppState.baseColor);
    
    generateAndUpdateColorScale();
}

/**
 * Handle color picker input with debouncing for real-time updates
 */
function handleColorPickerInput(event) {
    const value = event.target.value;
    AppState.baseColor = normalizeHex(value);
    
    // Update all color inputs to stay in sync
    updateAllColorInputs(AppState.baseColor);
    
    // Clear existing timeout
    if (colorGenerationTimeout) {
        clearTimeout(colorGenerationTimeout);
    }
    
    // Set new timeout for debounced generation (no toast message)
    colorGenerationTimeout = setTimeout(() => {
        generateAndUpdateColorScaleQuiet();
    }, 150); // 150ms debounce
}

/**
 * Handle color picker text keydown (Enter key)
 */
function handleColorPickerTextKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const value = event.target.value.trim();
        
        // Restore placeholder if it was cleared
        if (!event.target.placeholder) {
            event.target.placeholder = '#3791c6';
        }
        
        // If empty, just restore current color
        if (!value) {
            event.target.value = AppState.baseColor;
            return;
        }
        
        if (isValidHex(value)) {
            const normalizedColor = normalizeHex(value);
            AppState.baseColor = normalizedColor;
            updateAllColorInputs(normalizedColor);
            hideError();
            generateAndUpdateColorScale();
        } else {
            showError('Please enter a valid HEX color code (e.g., #3791c6)');
        }
    }
}

/**
 * Handle color picker text blur (when user finishes typing)
 */
function handleColorPickerTextBlur(event) {
    const value = event.target.value.trim();
    
    // Restore placeholder if it was cleared
    if (!event.target.placeholder) {
        event.target.placeholder = '#3791c6';
    }
    
    // If empty, just restore current color without error
    if (!value) {
        event.target.value = AppState.baseColor;
        return;
    }
    
    if (!isValidHex(value)) {
        showError('Please enter a valid HEX color code (e.g., #3791c6)');
        // Reset to current valid color
        event.target.value = AppState.baseColor;
    } else {
        const normalizedColor = normalizeHex(value);
        event.target.value = normalizedColor;
        if (normalizedColor !== AppState.baseColor) {
            AppState.baseColor = normalizedColor;
            updateAllColorInputs(normalizedColor);
            generateAndUpdateColorScale();
        }
        hideError();
    }
}

/**
 * Handle color picker clear button
 */
function handleColorPickerClear() {
    // Clear the text input and placeholder
    domElements.colorPickerText.value = '';
    domElements.colorPickerText.placeholder = '';
    
    // Update only other inputs, excluding the text input we just cleared
    updateAllColorInputs(AppState.baseColor, domElements.colorPickerText);
    
    domElements.colorPickerText.focus();
}


/**
 * Handle scale configuration change
 */
function handleScaleConfigChange(event) {
    AppState.scaleConfiguration = event.target.value;
    updateSegmentIndicator(event.target);
    
    // Update sticky controls to stay in sync (prevent event loops)
    if (domElements.stickyScaleSelect && domElements.stickyScaleSelect.value !== AppState.scaleConfiguration) {
        domElements.stickyScaleSelect.value = AppState.scaleConfiguration;
    }
    
    generateAndUpdateColorScale();
}

/**
 * Handle accessibility mode change
 */
function handleAccessibilityModeChange(event) {
    AppState.accessibilityMode = event.target.value;
    updateAccessibilityIndicator(event.target);
    
    // Update sticky controls to stay in sync (prevent event loops)
    if (domElements.stickyAccessibilitySelect && domElements.stickyAccessibilitySelect.value !== AppState.accessibilityMode) {
        domElements.stickyAccessibilitySelect.value = AppState.accessibilityMode;
    }
    
    // Immediately update the accessibility summary to reflect the new mode
    updateAccessibilitySummary();
    
    // Regenerate color scale with new accessibility criteria
    generateAndUpdateColorScale();
}

/**
 * Initialize segmented control
 */
function initializeSegmentedControl() {
    // Find the currently checked radio button
    const checkedRadio = document.querySelector('input[name="scaleRange"]:checked');
    if (checkedRadio && domElements.segmentIndicator) {
        updateSegmentIndicator(checkedRadio);
    }
    
    // Initialize accessibility segmented control
    const checkedAccessibilityRadio = document.querySelector('input[name="accessibilityMode"]:checked');
    if (checkedAccessibilityRadio && domElements.accessibilityIndicator) {
        updateAccessibilityIndicator(checkedAccessibilityRadio);
    }
    
    // Add keyboard navigation support
    if (domElements.scaleSegmentedControl) {
        domElements.scaleSegmentedControl.addEventListener('keydown', handleSegmentedControlKeydown);
    }
    if (domElements.accessibilitySegmentedControl) {
        domElements.accessibilitySegmentedControl.addEventListener('keydown', handleAccessibilitySegmentedControlKeydown);
    }
}

/**
 * Handle keyboard navigation for segmented control
 */
function handleSegmentedControlKeydown(event) {
    const currentInput = event.target;
    if (!currentInput.matches('input[name="scaleRange"]')) return;
    
    const allInputs = Array.from(domElements.scaleRangeRadios);
    const currentIndex = allInputs.indexOf(currentInput);
    
    let targetIndex = currentIndex;
    
    switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
            event.preventDefault();
            targetIndex = currentIndex > 0 ? currentIndex - 1 : allInputs.length - 1;
            break;
        case 'ArrowRight':
        case 'ArrowDown':
            event.preventDefault();
            targetIndex = currentIndex < allInputs.length - 1 ? currentIndex + 1 : 0;
            break;
        case 'Home':
            event.preventDefault();
            targetIndex = 0;
            break;
        case 'End':
            event.preventDefault();
            targetIndex = allInputs.length - 1;
            break;
        default:
            return;
    }
    
    if (targetIndex !== currentIndex) {
        allInputs[targetIndex].checked = true;
        allInputs[targetIndex].focus();
        handleScaleConfigChange({ target: allInputs[targetIndex] });
    }
}

/**
 * Handle keyboard navigation for accessibility segmented control
 */
function handleAccessibilitySegmentedControlKeydown(event) {
    const currentInput = event.target;
    if (!currentInput.matches('input[name="accessibilityMode"]')) return;
    
    const allInputs = Array.from(domElements.accessibilityModeRadios);
    const currentIndex = allInputs.indexOf(currentInput);
    
    let targetIndex = currentIndex;
    
    switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
            event.preventDefault();
            targetIndex = currentIndex > 0 ? currentIndex - 1 : allInputs.length - 1;
            break;
        case 'ArrowRight':
        case 'ArrowDown':
            event.preventDefault();
            targetIndex = currentIndex < allInputs.length - 1 ? currentIndex + 1 : 0;
            break;
        case 'Home':
            event.preventDefault();
            targetIndex = 0;
            break;
        case 'End':
            event.preventDefault();
            targetIndex = allInputs.length - 1;
            break;
        default:
            return;
    }
    
    if (targetIndex !== currentIndex) {
        allInputs[targetIndex].checked = true;
        allInputs[targetIndex].focus();
        handleAccessibilityModeChange({ target: allInputs[targetIndex] });
    }
}

/**
 * Update segment indicator position and width
 */
function updateSegmentIndicator(activeInput) {
    if (!domElements.segmentIndicator || !activeInput) return;
    
    const label = activeInput.parentElement.querySelector(`label[for="${activeInput.id}"]`);
    if (!label) return;
    
    // Get the position and size of the active label
    const controlRect = domElements.scaleSegmentedControl.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    
    // Calculate relative position within the segmented control
    const leftOffset = labelRect.left - controlRect.left - 4; // Account for padding
    const width = labelRect.width;
    
    // Update indicator position and size
    domElements.segmentIndicator.style.transform = `translateX(${leftOffset}px)`;
    domElements.segmentIndicator.style.width = `${width}px`;
}

/**
 * Update accessibility indicator position and width
 */
function updateAccessibilityIndicator(activeInput) {
    if (!domElements.accessibilityIndicator || !activeInput) return;
    
    const label = activeInput.parentElement.querySelector(`label[for="${activeInput.id}"]`);
    if (!label) return;
    
    // Get the position and size of the active label
    const controlRect = domElements.accessibilitySegmentedControl.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    
    // Calculate relative position within the segmented control
    const leftOffset = labelRect.left - controlRect.left - 4; // Account for padding
    const width = labelRect.width;
    
    // Update indicator position and size
    domElements.accessibilityIndicator.style.transform = `translateX(${leftOffset}px)`;
    domElements.accessibilityIndicator.style.width = `${width}px`;
}

/**
 * Handle theme toggle
 */
function handleThemeToggle() {
    AppState.isDarkModeActive = !AppState.isDarkModeActive;
    
    const themeIcon = document.querySelector('.theme-icon');
    
    if (AppState.isDarkModeActive) {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        if (themeIcon) {
            themeIcon.innerHTML = '<path d="M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z" fill="currentColor"/>';
        }
    } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
        if (themeIcon) {
            themeIcon.innerHTML = '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" fill="currentColor"/>';
        }
    }
    
    // Animate theme toggle
    animateThemeToggle();
}

/**
 * Generate color scale and update UI (quiet version - no loading/success messages)
 */
async function generateAndUpdateColorScaleQuiet() {
    await generateAndUpdateColorScaleInternal(false);
}

/**
 * Generate color scale and update UI
 */
async function generateAndUpdateColorScale() {
    await generateAndUpdateColorScaleInternal(true);
}

/**
 * Internal function to generate color scale and update UI
 * @param {boolean} showLoadingStates - Whether to show loading states and messages
 */
async function generateAndUpdateColorScaleInternal(showLoadingStates = true) {
    const startTime = performance.now();
    
    try {
        // Enhanced error handling wrapper
        if (typeof window.ErrorHandler !== 'undefined') {
            return await window.ErrorHandler.wrapAsync(async () => {
                return await generateColorScaleInternalCore(showLoadingStates, startTime);
            }, 'generateColorScale')();
        } else {
            return await generateColorScaleInternalCore(showLoadingStates, startTime);
        }
    } catch (error) {
        // Fallback error handling if ErrorHandler is not available
        console.error('Critical error in color scale generation:', error);
        showToast('Failed to generate color scale. Please try again.', 'error');
        throw error;
    }
}

async function generateColorScaleInternalCore(showLoadingStates, startTime) {
    try {
        // Show loading state conditionally
        if (showLoadingStates) {
            showLoading();
            hideError();
        }
        
        // Parse base color
        const baseHSL = hexToHSL(AppState.baseColor);
        if (!baseHSL) {
            throw new Error('Invalid color format');
        }
        
        // Generate light mode scale using enhanced algorithms if available
        if (AppState.useEnhancedAlgorithms && typeof createEnhancedColorScale === 'function') {
            const enhancedOptions = {
                usePerceptualUniformity: AppState.usePerceptualUniformity,
                interpolationMethod: AppState.interpolationMethod,
                enableBezierInterpolation: AppState.enableBezierInterpolation
            };
            AppState.lightModeScale = createEnhancedColorScale(baseHSL, AppState.scaleConfiguration, enhancedOptions);
            
            // Calculate quality metrics if available
            if (typeof calculateQualityMetrics === 'function') {
                AppState.qualityMetrics = calculateQualityMetrics(AppState.lightModeScale, baseHSL);
            }
        } else {
            // Fallback to standard algorithm
            AppState.lightModeScale = createColorScale(baseHSL, AppState.scaleConfiguration);
        }
        
        // Check if base color passes accessibility criteria based on selected mode
        const baseColor400 = AppState.lightModeScale.find(c => c.level === 400);
        const baseFullyAccessible = baseColor400 && isColorAccessibleByMode(baseColor400, AppState.accessibilityMode);
        
        // Generate accessible alternatives if needed (based on the selected accessibility mode)
        AppState.accessibleLightScale = null;
        AppState.accessibleDarkScale = null;
        
        if (!baseFullyAccessible) {
            // Generate accessible light mode version
            try {
                const accessibleLightHSL = findFullyAccessibleColor(baseHSL, 'light', AppState.accessibilityMode);
                if (accessibleLightHSL) {
                    if (AppState.useEnhancedAlgorithms && typeof createEnhancedColorScale === 'function') {
                        const enhancedOptions = {
                            usePerceptualUniformity: AppState.usePerceptualUniformity,
                            interpolationMethod: AppState.interpolationMethod,
                            enableBezierInterpolation: AppState.enableBezierInterpolation
                        };
                        AppState.accessibleLightScale = createEnhancedColorScale(accessibleLightHSL, AppState.scaleConfiguration, enhancedOptions);
                    } else {
                        AppState.accessibleLightScale = createColorScale(accessibleLightHSL, AppState.scaleConfiguration);
                    }
                }
            } catch (error) {
            }
            
            // Generate accessible dark mode version
            try {
                const accessibleDarkHSL = findFullyAccessibleColor(baseHSL, 'dark', AppState.accessibilityMode);
                if (accessibleDarkHSL) {
                    if (AppState.useEnhancedAlgorithms && typeof createEnhancedColorScale === 'function') {
                        const enhancedOptions = {
                            usePerceptualUniformity: AppState.usePerceptualUniformity,
                            interpolationMethod: AppState.interpolationMethod,
                            enableBezierInterpolation: AppState.enableBezierInterpolation
                        };
                        AppState.accessibleDarkScale = createEnhancedColorScale(accessibleDarkHSL, AppState.scaleConfiguration, enhancedOptions);
                    } else {
                        AppState.accessibleDarkScale = createColorScale(accessibleDarkHSL, AppState.scaleConfiguration);
                    }
                }
            } catch (error) {
            }
        }
        
        // Generate dark mode scale using enhanced algorithms if available
        const scaleToReverse = AppState.accessibleLightScale || AppState.lightModeScale;
        const baseHSLForDarkMode = AppState.accessibleLightScale ? 
            (findFullyAccessibleColor(baseHSL, 'light', AppState.accessibilityMode) || baseHSL) : baseHSL;
        
        if (AppState.useEnhancedAlgorithms && typeof generateAdaptiveDarkMode === 'function') {
            const darkModeOptions = {
                environment: 'web', // Default to web environment
                useAccessibleBase: !!AppState.accessibleLightScale,
                saturationBoost: 5,
                contrastAdjustment: 0.1
            };
            AppState.darkModeScale = generateAdaptiveDarkMode(scaleToReverse, baseHSLForDarkMode, darkModeOptions);
        } else {
            // Fallback to standard dark mode generation
            AppState.darkModeScale = createReversedDarkModeScale(scaleToReverse);
        }
        
        // Get color names
        await populateColorNames();
        
        // Update UI
        updatePaletteDisplay();
        updateExportSection();
        updateLivePreview(); // Always update live preview with new colors
        updateQualityMetricsPanel(); // Update quality metrics if available
        
        // Update lightbox preview if it's open
        if (!domElements.previewLightbox.classList.contains('hidden')) {
            updateLightboxPreview();
        }
        
        // Hide loading state conditionally
        if (showLoadingStates) {
            hideLoading();
        }
        
        // Record performance
        AppState.lastGenerationTime = performance.now() - startTime;
        
        
    } catch (error) {
        console.error('Error generating color scale:', error);
        if (showLoadingStates) {
            showError('Failed to generate color scale. Please try again.');
            hideLoading();
        }
    }
}

/**
 * Populate color names for all scales
 */
async function populateColorNames() {
    try {
        // Get base color name from original base color and save both
        AppState.originalColorName = await getColorName(AppState.baseColor);
        AppState.colorName = AppState.originalColorName;
        
        // Update scales with names
        AppState.lightModeScale = await getColorScaleNames(
            AppState.lightModeScale, 
            AppState.colorName
        );
        
        if (AppState.accessibleLightScale) {
            const accessibleBaseName = `Accessible ${AppState.colorName}`;
            AppState.accessibleLightScale = await getColorScaleNames(
                AppState.accessibleLightScale,
                accessibleBaseName
            );
        }
        
        AppState.darkModeScale = await getColorScaleNames(
            AppState.darkModeScale,
            `Dark ${AppState.colorName}`
        );
        
        AppState.apiCallCount++;
        
    } catch (error) {
        // Use fallback names
        AppState.originalColorName = getGenericColorName(hexToHSL(AppState.baseColor));
        AppState.colorName = AppState.originalColorName;
    }
}

/**
 * Update palette display with 3 columns maximum
 */
function updatePaletteDisplay() {
    // Update original column (always visible)
    domElements.originalColumnTitle.textContent = `${AppState.originalColorName || 'Color'} Color Scale`;
    updateColumnCards(domElements.originalCards, AppState.lightModeScale);
    
    // Check if base color (level 400) passes accessibility criteria based on selected mode
    const baseColor = AppState.lightModeScale.find(c => c.level === 400);
    const baseFullyAccessible = baseColor && isColorAccessibleByMode(baseColor, AppState.accessibilityMode);
    
    // Update original column accessibility indicator
    if (baseFullyAccessible) {
        domElements.originalAccessibilityIndicator.textContent = 'Accessible';
        domElements.originalAccessibilityIndicator.className = 'accessibility-indicator accessible';
        
        // Show only dark mode column (2 columns total)
        domElements.accessibleLightColumn.classList.add('hidden');
        showDarkModeColumn();
        
        // Update grid layout
        updateGridLayout(2);
    } else {
        domElements.originalAccessibilityIndicator.textContent = 'Not Accessible';
        domElements.originalAccessibilityIndicator.className = 'accessibility-indicator not-accessible';
        
        // Show accessible alternatives + dark mode column (3 columns total)
        showAccessibleAlternatives();
        showDarkModeColumn();
        
        // Update grid layout
        updateGridLayout(3);
    }
    
    // Update accessibility summary
    updateAccessibilitySummary();
}

/**
 * Update grid layout based on number of visible columns
 */
function updateGridLayout(columnCount) {
    // Remove existing column classes
    domElements.paletteGrid.classList.remove('columns-1', 'columns-2', 'columns-3');
    
    // Add appropriate class
    domElements.paletteGrid.classList.add(`columns-${columnCount}`);
}

/**
 * Show dark mode column (always shown)
 */
function showDarkModeColumn() {
    if (AppState.darkModeScale && AppState.darkModeScale.length > 0) {
        // Use the accessibleDarkColumn for displaying dark mode scale
        domElements.accessibleDarkColumn.classList.remove('hidden');
        updateAccessibleColumnTitle('dark');
        updateColumnCards(domElements.accessibleDarkCards, AppState.darkModeScale);
        
        // Check if dark mode scale base color passes accessibility criteria based on selected mode
        const darkBaseColor = AppState.darkModeScale.find(c => c.level === 400);
        const darkBaseFullyAccessible = darkBaseColor && isColorAccessibleByMode(darkBaseColor, AppState.accessibilityMode);
        
        // Update the column header to indicate accessibility status
        const darkModeIndicator = domElements.accessibleDarkColumn.querySelector('.accessibility-indicator');
        if (darkModeIndicator) {
            if (darkBaseFullyAccessible) {
                darkModeIndicator.textContent = 'Accessible';
                darkModeIndicator.className = 'accessibility-indicator accessible';
            } else {
                darkModeIndicator.textContent = 'Not Accessible';
                darkModeIndicator.className = 'accessibility-indicator not-accessible';
            }
        }
    }
}

/**
 * Show accessible alternatives when base color doesn't pass all criteria
 * Uses the scales already generated by generateAndUpdateColorScale
 */
function showAccessibleAlternatives() {
    // Show accessible light mode alternative if available
    if (AppState.accessibleLightScale) {
        domElements.accessibleLightColumn.classList.remove('hidden');
        updateAccessibleColumnTitle('light');
        updateColumnCards(domElements.accessibleLightCards, AppState.accessibleLightScale);
    }
}

/**
 * Update accessible column titles with original color name and accessibility mode
 * @param {string} mode - 'light' or 'dark'
 */
function updateAccessibleColumnTitle(mode) {
    const originalColorName = AppState.originalColorName || 'Color';
    const accessibilityModeText = getAccessibilityModeText(AppState.accessibilityMode);
    
    if (mode === 'light') {
        domElements.accessibleLightTitle.textContent = `${originalColorName} - Light Mode`;
    } else if (mode === 'dark') {
        domElements.accessibleDarkTitle.textContent = `${originalColorName} - Dark Mode`;
    }
}

/**
 * Update accessibility summary for the scale
 */
function updateAccessibilitySummary() {
    if (!AppState.lightModeScale || AppState.lightModeScale.length === 0) return;
    
    // Check base color (level 400) accessibility based on selected mode
    const baseColor = AppState.lightModeScale.find(c => c.level === 400);
    const baseFullyAccessible = baseColor && isColorAccessibleByMode(baseColor, AppState.accessibilityMode);
    
    // Check overall scale accessibility
    const scaleAccessible = AppState.lightModeScale.every(color => 
        color.blackPassesNormal || color.whitePassesNormal
    );
    
    // Update base accessibility status based on selected mode
    const modeText = getAccessibilityModeText(AppState.accessibilityMode);
    if (baseFullyAccessible) {
        domElements.baseAccessibility.textContent = `Base Color: Level 400 Accessible (${modeText})`;
        domElements.baseAccessibility.className = 'base-accessibility accessible';
    } else {
        domElements.baseAccessibility.textContent = `Base Color: Level 400 Not Accessible (${modeText})`;
        domElements.baseAccessibility.className = 'base-accessibility not-accessible';
    }
    
}

/**
 * Create reversed dark mode scale - simply reverse the order of colors
 * Keep level 400 in the center, but reverse the lightness progression
 * @param {Array} lightModeScale - Light mode color scale to reverse
 * @returns {Array} Reversed dark mode scale
 */
function createReversedDarkModeScale(lightModeScale) {
    // Sort the scale by level to ensure correct order
    const sortedScale = [...lightModeScale].sort((a, b) => a.level - b.level);
    
    // Find the base level (the one marked as isBase)
    const baseColor = sortedScale.find(c => c.isBase);
    const baseLevel = baseColor ? baseColor.level : 400;
    
    // Create the reversed scale
    const reversedScale = sortedScale.map((color, index) => {
        if (color.level === baseLevel) {
            // Keep the base level as is (it's already accessible)
            return {
                ...color,
                isDarkMode: true
            };
        } else {
            // Find the mirror position within the available levels
            const centerIndex = sortedScale.findIndex(c => c.level === baseLevel);
            let mirrorIndex;
            
            if (centerIndex === -1) {
                // No base level found, just reverse the array
                mirrorIndex = sortedScale.length - 1 - index;
            } else {
                if (index < centerIndex) {
                    // Light color -> use dark color from opposite side
                    const distanceFromCenter = centerIndex - index;
                    mirrorIndex = Math.min(sortedScale.length - 1, centerIndex + distanceFromCenter);
                } else {
                    // Dark color -> use light color from opposite side  
                    const distanceFromCenter = index - centerIndex;
                    mirrorIndex = Math.max(0, centerIndex - distanceFromCenter);
                }
            }
            
            const mirrorColor = sortedScale[mirrorIndex];
            
            return {
                level: color.level, // Keep original level numbering
                hsl: mirrorColor.hsl,
                rgb: mirrorColor.rgb,
                hex: mirrorColor.hex,
                blackPassesNormal: mirrorColor.blackPassesNormal,
                blackPassesLarge: mirrorColor.blackPassesLarge,
                blackRatio: mirrorColor.blackRatio,
                whitePassesNormal: mirrorColor.whitePassesNormal,
                whitePassesLarge: mirrorColor.whitePassesLarge,
                whiteRatio: mirrorColor.whiteRatio,
                preferredTextColor: mirrorColor.preferredTextColor,
                name: color.name || '',
                isBase: color.isBase, // Keep the original isBase property
                isDarkMode: true
            };
        }
    });
    
    return reversedScale;
}

/**
 * Check if color is accessible according to the selected accessibility mode
 * @param {Object} colorInfo - Color object with accessibility data
 * @param {string} accessibilityMode - 'full', 'black-only', 'white-only'
 * @returns {boolean} Whether color passes accessibility criteria
 */
function isColorAccessibleByMode(colorInfo, accessibilityMode) {
    switch (accessibilityMode) {
        case 'full':
            // Must pass all 4 criteria (black + white text, normal + large)
            return colorInfo.blackPassesNormal && colorInfo.blackPassesLarge && 
                   colorInfo.whitePassesNormal && colorInfo.whitePassesLarge;
        
        case 'black-only':
            // Must pass both black text criteria
            return colorInfo.blackPassesNormal && colorInfo.blackPassesLarge;
        
        case 'white-only':
            // Must pass both white text criteria
            return colorInfo.whitePassesNormal && colorInfo.whitePassesLarge;
        
        default:
            return false;
    }
}

/**
 * Get accessibility mode description text for display
 * @param {string} accessibilityMode - 'full', 'black-only', 'white-only'
 * @returns {string} Descriptive text for the accessibility mode
 */
function getAccessibilityModeText(accessibilityMode) {
    switch (accessibilityMode) {
        case 'full':
            return 'All 4 Criteria';
        case 'black-only':
            return 'Black Text';
        case 'white-only':
            return 'White Text';
        default:
            return 'Unknown Mode';
    }
}

/**
 * Find a fully accessible color based on selected accessibility mode
 * @param {Array} originalHSL - Original HSL color
 * @param {string} mode - 'light' or 'dark' mode preference
 * @param {string} accessibilityMode - 'full', 'black-only', 'white-only'
 * @returns {Array|null} Accessible HSL color or null
 */
function findFullyAccessibleColor(originalHSL, mode = 'light', accessibilityMode = 'full') {
    const [originalH, originalS, originalL] = originalHSL;
    
    // Define search ranges based on mode
    const searchRanges = {
        light: {
            lightness: [25, 30, 35, 40, 45, 50], // Darker colors for light backgrounds
            saturation: generateSearchRange(originalS, 20, 90, 10),
            hue: generateSearchRange(originalH, 0, 360, 15)
        },
        dark: {
            lightness: [60, 65, 70, 75, 80], // Lighter colors for dark backgrounds  
            saturation: generateSearchRange(originalS, 30, 80, 10),
            hue: generateSearchRange(originalH, 0, 360, 15)
        }
    };
    
    const ranges = searchRanges[mode];
    let bestColor = null;
    let minDistance = Infinity;
    
    // Try different combinations
    for (const h of ranges.hue.slice(0, 8)) { // Limit hue variations
        for (const l of ranges.lightness) {
            for (const s of ranges.saturation.slice(0, 6)) { // Limit saturation variations
                const candidateHSL = [h, s, l];
                const rgb = hslToRgb(candidateHSL);
                const contrastInfo = getContrastInfo(rgb);
                
                // Check if passes criteria based on accessibility mode
                const colorData = {
                    blackPassesNormal: contrastInfo.black.passesNormal,
                    blackPassesLarge: contrastInfo.black.passesLarge,
                    whitePassesNormal: contrastInfo.white.passesNormal,
                    whitePassesLarge: contrastInfo.white.passesLarge
                };
                const fullyAccessible = isColorAccessibleByMode(colorData, accessibilityMode);
                
                if (fullyAccessible) {
                    const distance = calculateColorDistance(originalHSL, candidateHSL);
                    if (distance < minDistance) {
                        bestColor = candidateHSL;
                        minDistance = distance;
                        
                        // If we found a very close match, use it
                        if (distance < 30) break;
                    }
                }
            }
            if (bestColor && minDistance < 30) break;
        }
        if (bestColor && minDistance < 30) break;
    }
    
    return bestColor;
}

/**
 * Generate search range for optimization helper function
 * @param {number} center - Center value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} step - Step size
 * @returns {Array} Array of values to search
 */
function generateSearchRange(center, min, max, step) {
    const range = [];
    
    // Start with center value
    range.push(Math.max(min, Math.min(max, center)));
    
    // Add values in both directions
    for (let i = step; i <= Math.max(center - min, max - center); i += step) {
        if (center - i >= min) range.push(center - i);
        if (center + i <= max) range.push(center + i);
    }
    
    return range.sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
}

/**
 * Update color cards in a column
 */
function updateColumnCards(container, colorScale) {
    // Clear existing cards
    container.innerHTML = '';
    
    // Create cards for each color
    colorScale.forEach(color => {
        const card = createColorCard(color);
        container.appendChild(card);
    });
}

/**
 * Create color card element with detailed information matching the design
 */
function createColorCard(color) {
    const card = document.createElement('div');
    
    // Check if minimal view is active
    if (AppState.isMinimalViewActive) {
        return createMinimalColorCard(color);
    }
    
    card.className = 'color-card-full';
    card.setAttribute('data-level', color.level);
    card.setAttribute('data-hex', color.hex);
    
    // Set the entire card background to the color
    card.style.backgroundColor = color.hex;
    
    // Determine best text color for this background
    const textColor = color.blackRatio > color.whiteRatio ? '#000000' : '#ffffff';
    card.style.color = textColor;
    
    // Set CSS variable for hover background color based on text color - more subtle
    const hoverColor = color.blackRatio > color.whiteRatio ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)';
    card.style.setProperty('--copy-btn-hover-bg', hoverColor);
    
    // Card content container
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';
    
    // Wrapper for level and color values in horizontal layout
    const topSection = document.createElement('div');
    topSection.className = 'card-top-section';
    
    // Level header (without color name)
    const levelHeader = document.createElement('div');
    levelHeader.className = 'level-header';
    levelHeader.innerHTML = `
        <span class="level-number">${color.level}</span>
    `;
    
    // Color values section - matching the image layout with copy buttons
    const colorValues = document.createElement('div');
    colorValues.className = 'color-values-grid';
    
    // Create each value row with copy button
    const hexValue = color.hex;
    const rgbValue = color.rgb.join(', ');
    const hslValue = `${Math.round(color.hsl[0])}, ${Math.round(color.hsl[1])}%, ${Math.round(color.hsl[2])}%`;
    
    colorValues.innerHTML = `
        <div class="value-row">
            <div class="value-label-pill">HEX</div>
            <div class="value-data-pill">
                <span class="value-text">${hexValue}</span>
                <button class="value-copy-btn" data-copy="${hexValue}" data-format="HEX" title="Copy HEX value">
                    <svg class="value-copy-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="value-row">
            <div class="value-label-pill">RGB</div>
            <div class="value-data-pill">
                <span class="value-text">${rgbValue}</span>
                <button class="value-copy-btn" data-copy="rgb(${rgbValue})" data-format="RGB" title="Copy RGB value">
                    <svg class="value-copy-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="value-row">
            <div class="value-label-pill">HSL</div>
            <div class="value-data-pill">
                <span class="value-text">${hslValue}</span>
                <button class="value-copy-btn" data-copy="hsl(${hslValue})" data-format="HSL" title="Copy HSL value">
                    <svg class="value-copy-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    // Add both sections to the wrapper
    topSection.appendChild(levelHeader);
    topSection.appendChild(colorValues);
    
    // Accessibility information matching the image exactly
    const accessibilityInfo = document.createElement('div');
    accessibilityInfo.className = 'accessibility-section';
    accessibilityInfo.innerHTML = `
        <div class="accessibility-row">
            <div class="score-circle-large black-circle">
                <span class="score-number">${color.blackRatio}</span>
            </div>
            <div class="test-results-column">
                <div class="test-line ${color.blackPassesNormal ? 'pass' : 'fail'}">
                    <span class="test-label">Normal</span>
                    <span class="test-icon">${color.blackPassesNormal ? '✓' : '✗'}</span>
                </div>
                <div class="test-line ${color.blackPassesLarge ? 'pass' : 'fail'}">
                    <span class="test-label">Large</span>
                    <span class="test-icon">${color.blackPassesLarge ? '✓' : '✗'}</span>
                </div>
            </div>
            <div class="score-circle-large white-circle">
                <span class="score-number">${color.whiteRatio}</span>
            </div>
            <div class="test-results-column">
                <div class="test-line ${color.whitePassesNormal ? 'pass' : 'fail'}">
                    <span class="test-label">Normal</span>
                    <span class="test-icon">${color.whitePassesNormal ? '✓' : '✗'}</span>
                </div>
                <div class="test-line ${color.whitePassesLarge ? 'pass' : 'fail'}">
                    <span class="test-label">Large</span>
                    <span class="test-icon">${color.whitePassesLarge ? '✓' : '✗'}</span>
                </div>
            </div>
        </div>
    `;
    
    // Assemble the card
    cardContent.appendChild(topSection);
    cardContent.appendChild(accessibilityInfo);
    
    card.appendChild(cardContent);
    
    // Add event listeners for copy buttons
    const copyButtons = card.querySelectorAll('.value-copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent event bubbling
            const valueToCopy = button.getAttribute('data-copy');
            const format = button.getAttribute('data-format');
            handleValueCopyButtonClick(valueToCopy, format, button);
        });
    });
    
    return card;
}

/**
 * Create minimal color card (colors only)
 */
function createMinimalColorCard(color) {
    const card = document.createElement('div');
    card.className = 'color-card-minimal';
    card.setAttribute('data-level', color.level);
    card.setAttribute('data-hex', color.hex);
    card.style.backgroundColor = color.hex;
    
    // Add subtle level indicator for minimal cards
    const levelIndicator = document.createElement('div');
    levelIndicator.className = 'minimal-level-indicator';
    levelIndicator.textContent = color.level;
    
    // Determine text color based on background
    const textColor = color.blackRatio > color.whiteRatio ? '#000000' : '#ffffff';
    levelIndicator.style.color = textColor;
    
    // Add copy icon
    const copyIcon = document.createElement('div');
    copyIcon.className = 'minimal-copy-icon';
    copyIcon.innerHTML = `
        <svg class="value-copy-icon" viewBox="0 0 24 24" fill="none">
            <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
        </svg>
    `;
    copyIcon.style.color = textColor;
    card.appendChild(copyIcon);
    
    // Create bottom info row with all indicators
    const bottomInfoRow = document.createElement('div');
    bottomInfoRow.className = 'minimal-bottom-info';
    bottomInfoRow.style.color = textColor;
    
    // Level indicator
    bottomInfoRow.appendChild(levelIndicator);
    
    // HEX value indicator
    const hexIndicator = document.createElement('div');
    hexIndicator.className = 'minimal-hex-value';
    hexIndicator.textContent = color.hex;
    bottomInfoRow.appendChild(hexIndicator);
    
    // Full accessibility info (compact version)
    const accessibilityIndicator = document.createElement('div');
    accessibilityIndicator.className = 'minimal-accessibility-full';
    accessibilityIndicator.innerHTML = `
        <div class="minimal-access-group">
            <div class="minimal-score-circle black-circle">
                <span class="minimal-score-number">${color.blackRatio}</span>
                <div class="minimal-tests">
                    <span class="minimal-test ${color.blackPassesNormal ? 'pass' : 'fail'}">${color.blackPassesNormal ? '✓' : '✗'}</span>
                    <span class="minimal-test ${color.blackPassesLarge ? 'pass' : 'fail'}">${color.blackPassesLarge ? '✓' : '✗'}</span>
                </div>
            </div>
        </div>
        <div class="minimal-access-group">
            <div class="minimal-score-circle white-circle">
                <span class="minimal-score-number">${color.whiteRatio}</span>
                <div class="minimal-tests">
                    <span class="minimal-test ${color.whitePassesNormal ? 'pass' : 'fail'}">${color.whitePassesNormal ? '✓' : '✗'}</span>
                    <span class="minimal-test ${color.whitePassesLarge ? 'pass' : 'fail'}">${color.whitePassesLarge ? '✓' : '✗'}</span>
                </div>
            </div>
        </div>
    `;
    bottomInfoRow.appendChild(accessibilityIndicator);
    
    card.appendChild(bottomInfoRow);
    
    // Add click handler for copying hex value
    card.addEventListener('click', () => {
        handleValueCopyButtonClick(color.hex, 'HEX', copyIcon, textColor);
    });
    
    return card;
}

/**
 * Handle value copy button click for specific color format
 */
async function handleValueCopyButtonClick(valueToCopy, format, buttonElement, textColor = null) {
    try {
        await navigator.clipboard.writeText(valueToCopy);
        
        // Visual feedback - temporarily change icon to checkmark
        const originalHTML = buttonElement.innerHTML;
        buttonElement.innerHTML = `
            <svg class="value-copy-icon" viewBox="0 0 24 24" fill="none" style="color: ${textColor || 'currentColor'}">
                <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
            </svg>
        `;
        buttonElement.classList.add('copied');
        
        // Reset button after 1.2 seconds
        setTimeout(() => {
            buttonElement.innerHTML = originalHTML;
            buttonElement.classList.remove('copied');
        }, 1200);
        
        showToast(`Copied ${format} value to clipboard!`, 'success');
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        
        // Fallback: select text
        const tempInput = document.createElement('input');
        tempInput.value = valueToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        showToast(`Copied ${format} value to clipboard!`, 'success');
    }
}

/**
 * Handle color card hover
 */
function handleColorCardHover(card, color) {
    // Add hover styling
    card.style.transform = 'translateX(4px)';
    card.style.boxShadow = 'var(--shadow-md)';
    
    // Show detailed info in tooltip (optional)
    card.title = `${color.name}\nLevel ${color.level}: ${color.hex}\nClick to copy`;
}

/**
 * Handle color card leave
 */
function handleColorCardLeave(card) {
    // Remove hover styling
    card.style.transform = '';
    card.style.boxShadow = '';
}

/**
 * Update export section
 */
function updateExportSection() {
    if (AppState.lightModeScale.length > 0) {
        domElements.exportSection.classList.remove('hidden');
        updateExportOutput();
    }
}

/**
 * Handle export format change
 */
function handleExportFormatChange(event) {
    AppState.selectedExportFormat = event.target.value;
    updateExportOutput();
}

/**
 * Handle include dark mode change
 */
function handleIncludeDarkModeChange() {
    updateExportOutput();
}

/**
 * Handle include original scale change
 */
function handleIncludeOriginalScaleChange() {
    updateExportOutput();
}

/**
 * Update export output preview
 */
function updateExportOutput() {
    const format = AppState.selectedExportFormat;
    const colorName = AppState.colorName.toLowerCase().replace(/\s+/g, '-');
    const includeDarkMode = domElements.includeDarkMode.checked;
    const includeOriginalScale = domElements.includeOriginalScale.checked;
    let output = '';
    
    // Use accessible scale if available, otherwise use light mode scale
    const lightScale = AppState.accessibleLightScale || AppState.lightModeScale;
    const darkScale = AppState.darkModeScale;
    const originalScale = AppState.lightModeScale; // The non-accessible original scale
    
    switch (format) {
        case 'css-variables':
            if (includeOriginalScale && originalScale) {
                output = generateCSSVariablesWithOriginal(lightScale, includeDarkMode ? darkScale : null, originalScale, colorName);
            } else if (includeDarkMode && darkScale) {
                output = generateCSSVariablesWithDarkMode(lightScale, darkScale, colorName);
            } else {
                output = generateCSSVariables(lightScale, colorName);
            }
            break;
        case 'scss-variables':
            if (includeOriginalScale && originalScale) {
                output = generateSCSSVariablesWithOriginal(lightScale, includeDarkMode ? darkScale : null, originalScale, colorName);
            } else if (includeDarkMode && darkScale) {
                output = generateSCSSVariablesWithDarkMode(lightScale, darkScale, colorName);
            } else {
                output = generateSCSSVariables(lightScale, colorName);
            }
            break;
        case 'tailwind-config':
            output = includeDarkMode && darkScale ?
                generateTailwindConfigWithDarkMode(lightScale, darkScale, colorName) :
                generateTailwindConfig(lightScale, colorName);
            break;
        case 'figma-tokens':
            output = includeDarkMode && darkScale ?
                generateFigmaTokensWithDarkMode(lightScale, darkScale, AppState.colorName) :
                generateFigmaTokens(lightScale, AppState.colorName);
            break;
        case 'adobe-ase':
            output = includeDarkMode && darkScale ?
                generateAdobeASEWithDarkMode(lightScale, darkScale, AppState.colorName) :
                generateAdobeASE(lightScale, AppState.colorName);
            break;
        case 'sketch-palette':
            output = includeDarkMode && darkScale ?
                generateSketchPaletteWithDarkMode(lightScale, darkScale, AppState.colorName) :
                generateSketchPalette(lightScale, AppState.colorName);
            break;
        case 'swift-colors':
            output = includeDarkMode && darkScale ?
                generateSwiftColorsWithDarkMode(lightScale, darkScale, colorName) :
                generateSwiftColors(lightScale, colorName);
            break;
        case 'android-colors':
            output = includeDarkMode && darkScale ?
                generateAndroidColorsWithDarkMode(lightScale, darkScale, colorName) :
                generateAndroidColors(lightScale, colorName);
            break;
        case 'json':
            const jsonOptions = {
                algorithm: AppState.useEnhancedAlgorithms ? 'enhanced' : 'standard',
                interpolationMethod: AppState.interpolationMethod,
                usePerceptualUniformity: AppState.usePerceptualUniformity,
                enableBezierInterpolation: AppState.enableBezierInterpolation,
                qualityMetrics: AppState.qualityMetrics
            };
            
            if (includeOriginalScale && originalScale) {
                output = generateJSONWithOriginal(lightScale, includeDarkMode ? darkScale : null, originalScale, AppState.colorName, jsonOptions);
            } else if (includeDarkMode && darkScale) {
                output = generateJSONWithDarkMode(lightScale, darkScale, AppState.colorName, jsonOptions);
            } else {
                output = generateJSON(lightScale, AppState.colorName, jsonOptions);
            }
            break;
        case 'enhanced-analytics':
            const analyticsOptions = {
                ...jsonOptions,
                generationTime: AppState.lastGenerationTime,
                memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0
            };
            
            output = generateEnhancedAnalytics(lightScale, darkScale, AppState.colorName, analyticsOptions);
            break;
        case 'js-object':
            if (includeOriginalScale && originalScale) {
                output = generateJSObjectWithOriginal(lightScale, includeDarkMode ? darkScale : null, originalScale, colorName);
            } else if (includeDarkMode && darkScale) {
                output = generateJSObjectWithDarkMode(lightScale, darkScale, colorName);
            } else {
                output = generateJSObject(lightScale, colorName);
            }
            break;
        default:
            output = '// Unknown format';
    }
    
    domElements.exportOutput.textContent = output;
}

/**
 * Handle copy export
 */
async function handleCopyExport() {
    try {
        // Enhanced error handling
        if (!navigator.clipboard) {
            throw new Error('Clipboard API not supported');
        }
        
        const content = domElements.exportOutput.textContent;
        if (!content || content.trim() === '') {
            throw new Error('No content to copy');
        }
        
        await navigator.clipboard.writeText(content);
        showToast('Export code copied to clipboard!', 'success');
        
        // Track successful copy
        if (typeof window.ErrorHandler !== 'undefined') {
            window.ErrorHandler.reportCustomError(
                `Successfully copied ${AppState.selectedExportFormat} export`,
                'analytics',
                { 
                    action: 'copy_export',
                    format: AppState.selectedExportFormat,
                    contentLength: content.length,
                    severity: 'info'
                }
            );
        }
    } catch (error) {
        console.error('Failed to copy export:', error);
        
        // Enhanced error reporting
        if (typeof window.ErrorHandler !== 'undefined') {
            window.ErrorHandler.reportCustomError(
                `Failed to copy export: ${error.message}`,
                'clipboard',
                { 
                    format: AppState.selectedExportFormat,
                    browserSupport: !!navigator.clipboard,
                    contentAvailable: !!domElements.exportOutput.textContent
                }
            );
        }
        
        // Fallback: try to select text for manual copy
        try {
            const range = document.createRange();
            range.selectNode(domElements.exportOutput);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            showToast('Text selected. Press Ctrl+C (Cmd+C on Mac) to copy.', 'warning');
        } catch (fallbackError) {
            showToast('Copy failed. Please select the text manually.', 'error');
        }
    }
}

/**
 * Handle download export
 */
function handleDownloadExport() {
    const format = AppState.selectedExportFormat;
    const colorName = AppState.colorName.toLowerCase().replace(/\s+/g, '-');
    const content = domElements.exportOutput.textContent;
    
    // Determine file extension
    const extensions = {
        'css-variables': 'css',
        'scss-variables': 'scss',
        'tailwind-config': 'js',
        'figma-tokens': 'json',
        'adobe-ase': 'json',
        'sketch-palette': 'sketchpalette',
        'swift-colors': 'swift',
        'android-colors': 'xml',
        'json': 'json',
        'enhanced-analytics': 'json',
        'js-object': 'js'
    };
    
    const extension = extensions[format] || 'txt';
    const filename = `${colorName}-colors.${extension}`;
    
    // Create and trigger download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    showToast(`Downloaded ${filename}`, 'success');
}

/**
 * Handle preview mode change
 */
function handlePreviewModeChange() {
    updateLivePreview();
}

/**
 * Update live preview with current color scheme
 */
function updateLivePreview() {
    if (!AppState.lightModeScale || AppState.lightModeScale.length === 0) {
        return;
    }
    
    // Determine which color scale to use
    let scaleToUse = AppState.lightModeScale;
    let previewContext = 'light-original';
    
    if (domElements.previewAccessible.checked && AppState.accessibleLightScale) {
        scaleToUse = AppState.accessibleLightScale;
        previewContext = 'light-accessible';
    }
    
    if (domElements.previewDarkMode.checked) {
        scaleToUse = AppState.darkModeScale;
        previewContext = domElements.previewAccessible.checked && AppState.accessibleDarkScale ? 'dark-accessible' : 'dark-original';
    }
    
    // Apply colors to preview with context information
    applyColorsToPreview(scaleToUse, previewContext);
    
    // Update preview algorithm indicator
    updatePreviewAlgorithmIndicator();
    
    // Also update lightbox preview if it's open
    if (!domElements.previewLightbox.classList.contains('hidden')) {
        updateLightboxPreview();
    }
}

/**
 * Update preview algorithm indicator
 */
function updatePreviewAlgorithmIndicator() {
    const indicator = document.querySelector('.preview-algorithm-indicator');
    if (!indicator) return;
    
    if (AppState.useEnhancedAlgorithms) {
        const algorithmText = [
            AppState.interpolationMethod.toUpperCase(),
            AppState.usePerceptualUniformity ? 'Perceptual' : null,
            AppState.enableBezierInterpolation ? 'Bezier' : null
        ].filter(Boolean).join(' + ');
        
        indicator.textContent = `Enhanced: ${algorithmText}`;
        indicator.classList.add('enhanced-active');
    } else {
        indicator.textContent = 'Standard HSL';
        indicator.classList.remove('enhanced-active');
    }
}

/**
 * Apply color scale to live preview components
 * @param {Array} colorScale - Color scale to apply
 * @param {string} context - Preview context (light-original, dark-original, etc.)
 */
function applyColorsToPreview(colorScale, context = 'light-original') {
    // Find key colors from the scale
    const colors = getPreviewColors(colorScale);
    
    // Apply to the main live preview section (for regular use)
    const livePreviewSection = document.getElementById('livePreviewSection');
    if (livePreviewSection) {
        const previewContainer = livePreviewSection.querySelector('.preview-container');
        if (previewContainer) {
            // Apply colors directly to the preview container
            // Core action colors
            previewContainer.style.setProperty('--preview-primary', colors.primary);
            previewContainer.style.setProperty('--preview-primary-hover', colors.primaryHover);
            previewContainer.style.setProperty('--preview-primary-alpha', colors.primaryAlpha);
            previewContainer.style.setProperty('--preview-primary-text', colors.primaryText);
            
            // Secondary (neutral) colors
            previewContainer.style.setProperty('--preview-secondary', colors.secondary);
            previewContainer.style.setProperty('--preview-secondary-hover', colors.secondaryHover);
            
            // Text colors
            previewContainer.style.setProperty('--preview-text', colors.text);
            previewContainer.style.setProperty('--preview-heading', colors.heading);
            previewContainer.style.setProperty('--preview-muted', colors.muted);
            
            // Backgrounds and containers
            previewContainer.style.setProperty('--preview-section-bg', colors.sectionBg);
            previewContainer.style.setProperty('--preview-card-bg', colors.cardBg);
            previewContainer.style.setProperty('--preview-card-border', colors.cardBorder);
            previewContainer.style.setProperty('--preview-card-title', colors.cardTitle);
            previewContainer.style.setProperty('--preview-card-text', colors.cardText);
            
            // Form elements
            previewContainer.style.setProperty('--preview-input-bg', colors.inputBg);
            previewContainer.style.setProperty('--preview-input-border', colors.inputBorder);
            previewContainer.style.setProperty('--preview-input-focus', colors.inputFocus);
            
            // Navigation
            previewContainer.style.setProperty('--preview-nav-bg', colors.navBg);
            previewContainer.style.setProperty('--preview-nav-border', colors.navBorder);
            previewContainer.style.setProperty('--preview-nav-link', colors.navLink);
            previewContainer.style.setProperty('--preview-nav-link-hover', colors.navLinkHover);
            previewContainer.style.setProperty('--preview-nav-link-hover-bg', colors.navLinkHoverBg);
            previewContainer.style.setProperty('--preview-nav-active', colors.navActive);
            
            // Ghost/outline elements
            previewContainer.style.setProperty('--preview-ghost-color', colors.ghostColor);
            previewContainer.style.setProperty('--preview-ghost-hover', colors.ghostHover);
            previewContainer.style.setProperty('--preview-ghost-border', colors.ghostBorder);
            
            // System elements
            previewContainer.style.setProperty('--preview-border', colors.border);
            previewContainer.style.setProperty('--preview-accent', colors.accent);
            
            // Alert colors
            previewContainer.style.setProperty('--preview-success', colors.success);
            previewContainer.style.setProperty('--preview-warning', colors.warning);
            previewContainer.style.setProperty('--preview-error', colors.error);
            previewContainer.style.setProperty('--preview-success-bg', colors.successBg);
            previewContainer.style.setProperty('--preview-warning-bg', colors.warningBg);
            previewContainer.style.setProperty('--preview-error-bg', colors.errorBg);
        }
    }
    
    // Also create global styles for fallback  
    const previewStyles = `
        #livePreviewSection .preview-container, .lightbox-content .preview-container {
            /* Core brand colors - used sparingly */
            --preview-primary: ${colors.primary};
            --preview-primary-hover: ${colors.primaryHover};
            --preview-primary-alpha: ${colors.primaryAlpha};
            --preview-primary-text: ${colors.primaryText};
            --preview-accent: ${colors.accent};
            
            /* Neutral secondary colors */
            --preview-secondary: ${colors.secondary};
            --preview-secondary-hover: ${colors.secondaryHover};
            
            /* Text hierarchy */
            --preview-text: ${colors.text};
            --preview-heading: ${colors.heading};
            --preview-muted: ${colors.muted};
            
            /* Backgrounds and surfaces */
            --preview-section-bg: ${colors.sectionBg};
            --preview-card-bg: ${colors.cardBg};
            --preview-card-border: ${colors.cardBorder};
            --preview-card-title: ${colors.cardTitle};
            --preview-card-text: ${colors.cardText};
            
            /* Form elements */
            --preview-input-bg: ${colors.inputBg};
            --preview-input-border: ${colors.inputBorder};
            --preview-input-focus: ${colors.inputFocus};
            
            /* Navigation */
            --preview-nav-bg: ${colors.navBg};
            --preview-nav-border: ${colors.navBorder};
            --preview-nav-link: ${colors.navLink};
            --preview-nav-link-hover: ${colors.navLinkHover};
            --preview-nav-link-hover-bg: ${colors.navLinkHoverBg};
            --preview-nav-active: ${colors.navActive};
            
            /* Ghost/outline elements */
            --preview-ghost-color: ${colors.ghostColor};
            --preview-ghost-hover: ${colors.ghostHover};
            --preview-ghost-border: ${colors.ghostBorder};
            
            /* System colors */
            --preview-border: ${colors.border};
            --preview-success: ${colors.success};
            --preview-warning: ${colors.warning};
            --preview-error: ${colors.error};
            --preview-success-bg: ${colors.successBg};
            --preview-warning-bg: ${colors.warningBg};
            --preview-error-bg: ${colors.errorBg};
        }
    `;
    
    // Apply global styles
    updatePreviewStyles(previewStyles);
}

/**
 * Extract preview colors from color scale
 * @param {Array} colorScale - Color scale array
 * @returns {Object} Preview color mapping
 */
function getPreviewColors(colorScale) {
    // Find specific levels or use closest matches
    const level100 = colorScale.find(c => c.level === 100) || colorScale[0];
    const level200 = colorScale.find(c => c.level === 200) || colorScale[1] || level100;
    const level300 = colorScale.find(c => c.level === 300) || colorScale[2] || level200;
    const level400 = colorScale.find(c => c.level === 400) || colorScale[Math.floor(colorScale.length / 2)];
    const level500 = colorScale.find(c => c.level === 500) || colorScale[colorScale.length - 3] || level400;
    const level600 = colorScale.find(c => c.level === 600) || colorScale[colorScale.length - 2] || level500;
    const level700 = colorScale.find(c => c.level === 700) || colorScale[colorScale.length - 1];
    const level800 = colorScale.find(c => c.level === 800) || level700;
    
    // Determine if we're in dark mode
    const isDarkMode = AppState.lightboxDarkMode;
    
    // Smart hover color logic - creates harmony based on base color level
    function getSmartHoverColor(baseLevel) {
        if (baseLevel <= 300) {
            // Light colors get darker on hover (more intense)
            return (baseLevel === 100) ? level200.hex : 
                   (baseLevel === 200) ? level300.hex : level400.hex;
        } else if (baseLevel >= 600) {
            // Dark colors get lighter on hover (less intense)
            return (baseLevel === 600) ? level500.hex :
                   (baseLevel === 700) ? level600.hex : level700.hex;
        } else {
            // Medium colors (400-500) get darker for better contrast
            return (baseLevel === 400) ? level500.hex : level600.hex;
        }
    }
    
    // Modern, realistic color usage - minimal colored surfaces, focused accents
    return {
        // Primary action colors (only for buttons, links, focus states)
        primary: level600.hex,
        primaryHover: getSmartHoverColor(600),
        primaryAlpha: `${level500.hex}15`, // Very subtle 8% opacity
        primaryText: '#ffffff',
        
        // Secondary colors (much more subtle)
        secondary: isDarkMode ? '#4b5563' : '#6b7280', // Neutral gray, not color-themed
        secondaryHover: isDarkMode ? '#374151' : '#9ca3af',
        
        // Accent for small highlights only
        accent: level500.hex,
        
        // Text colors - with brand color for headings
        text: isDarkMode ? '#f1f5f9' : '#1f2937',
        heading: isDarkMode ? level600.hex : level700.hex, // Same color as primary button
        muted: isDarkMode ? '#9ca3af' : '#6b7280',
        
        // Backgrounds - mostly neutral with very subtle color hints
        sectionBg: isDarkMode ? '#0f172a' : '#ffffff',
        cardBg: isDarkMode ? '#1e293b' : '#ffffff',
        cardBorder: isDarkMode ? '#334155' : '#e5e7eb',
        cardTitle: isDarkMode ? '#f8fafc' : '#111827',
        cardText: isDarkMode ? '#cbd5e1' : '#374151',
        
        // Form elements - neutral with color accents only on focus
        inputBg: isDarkMode ? '#1e293b' : '#ffffff',
        inputBorder: isDarkMode ? '#334155' : '#d1d5db',
        inputFocus: level500.hex, // Only use brand color for focus states
        
        // Navigation - clean with theme colors on interaction
        navBg: isDarkMode ? '#0f172a' : '#f9fafb',
        navBorder: isDarkMode ? '#1e293b' : '#e5e7eb',
        navLink: isDarkMode ? '#e2e8f0' : '#374151',
        navLinkHover: level500.hex, // Brand color on hover
        navLinkHoverBg: isDarkMode ? `${level500.hex}15` : `${level500.hex}10`, // Subtle background on hover
        navActive: level600.hex,
        
        // Ghost/outline elements
        ghostColor: isDarkMode ? '#e2e8f0' : '#6b7280',
        ghostHover: isDarkMode ? '#f1f5f9' : '#374151',
        ghostBorder: isDarkMode ? '#334155' : '#d1d5db',
        
        // Borders and dividers
        border: isDarkMode ? '#334155' : '#e5e7eb',
        titleColor: isDarkMode ? '#ffffff' : '#111827',
        controlsBg: isDarkMode ? '#1e293b' : '#f9fafb',
        
        // Alert colors (keep system colors, not theme colors)
        success: '#059669',
        warning: '#d97706', 
        error: '#dc2626',
        successBg: isDarkMode ? '#064e3b15' : '#dcfce715',
        warningBg: isDarkMode ? '#92400e15' : '#fef3c715',
        errorBg: isDarkMode ? '#991b1b15' : '#fef2f215'
    };
}

/**
 * Update preview styles by injecting CSS
 * @param {string} styles - CSS styles to apply
 */
function updatePreviewStyles(styles) {
    // Remove existing preview styles
    const existingStyle = document.getElementById('preview-dynamic-styles');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    // Create and inject new styles
    const styleElement = document.createElement('style');
    styleElement.id = 'preview-dynamic-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

/**
 * Show loading state
 */
function showLoading() {
    domElements.loadingState.classList.remove('hidden');
    domElements.paletteGrid.style.opacity = '0.5';
}

/**
 * Hide loading state
 */
function hideLoading() {
    domElements.loadingState.classList.add('hidden');
    domElements.paletteGrid.style.opacity = '1';
}

/**
 * Show error message
 */
function showError(message) {
    domElements.errorState.classList.remove('hidden');
    domElements.errorState.querySelector('.error-message').textContent = message;
}

/**
 * Hide error message
 */
function hideError() {
    domElements.errorState.classList.add('hidden');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    domElements.toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                domElements.toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}


/**
 * Update all color inputs to stay synchronized
 * @param {string} color - Hex color value to set across all inputs
 * @param {HTMLElement} excludeElement - Element to exclude from sync (optional)
 */
function updateAllColorInputs(color, excludeElement = null) {
    const normalizedColor = normalizeHex(color);
    
    // Update main color inputs
    if (domElements.colorPicker !== excludeElement && domElements.colorPicker.value !== normalizedColor) {
        domElements.colorPicker.value = normalizedColor;
    }
    if (domElements.colorPickerText !== excludeElement && domElements.colorPickerText.value !== normalizedColor) {
        domElements.colorPickerText.value = normalizedColor;
    }
    
    // Update sticky color inputs
    if (domElements.stickyColorPicker && domElements.stickyColorPicker !== excludeElement && domElements.stickyColorPicker.value !== normalizedColor) {
        domElements.stickyColorPicker.value = normalizedColor;
    }
    if (domElements.stickyColorPickerText && domElements.stickyColorPickerText !== excludeElement && domElements.stickyColorPickerText.value !== normalizedColor) {
        domElements.stickyColorPickerText.value = normalizedColor;
    }
}

/**
 * Initialize theme based on user preference
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeIcon = document.querySelector('.theme-icon');
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        AppState.isDarkModeActive = true;
        document.body.classList.add('dark-theme');
        if (themeIcon) {
            themeIcon.innerHTML = '<path d="M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z" fill="currentColor"/>';
        }
    } else {
        AppState.isDarkModeActive = false;
        document.body.classList.add('light-theme');
        if (themeIcon) {
            themeIcon.innerHTML = '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" fill="currentColor"/>';
        }
    }
}

/**
 * Animate theme toggle
 */
function animateThemeToggle() {
    domElements.themeToggle.style.transform = 'scale(0.95)';
    setTimeout(() => {
        domElements.themeToggle.style.transform = '';
    }, 150);
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + Enter: Generate
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        handleGenerateClick();
    }
    
    // Ctrl/Cmd + D: Toggle dark mode
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        handleThemeToggle();
    }
    
    // Ctrl/Cmd + C: Copy export (when focused on export section)
    if ((event.ctrlKey || event.metaKey) && event.key === 'c' && 
        document.activeElement === domElements.exportOutput) {
        event.preventDefault();
        handleCopyExport();
    }
}

/**
 * Handle window resize
 */
function handleWindowResize() {
    // Adjust layout for mobile if needed
    const isMobile = window.innerWidth < 768;
    document.body.classList.toggle('mobile-layout', isMobile);
    
    // Update segment indicator position on resize
    const checkedRadio = document.querySelector('input[name="scaleRange"]:checked');
    if (checkedRadio) {
        setTimeout(() => updateSegmentIndicator(checkedRadio), 10);
    }
}

/**
 * Handle sticky color picker change
 */
function handleStickyColorPickerChange(event) {
    const value = event.target.value;
    AppState.baseColor = normalizeHex(value);
    
    // Update all color inputs to stay in sync
    updateAllColorInputs(AppState.baseColor);
    
    generateAndUpdateColorScale();
}

/**
 * Handle sticky color picker input with debouncing
 */
function handleStickyColorPickerInput(event) {
    const value = event.target.value;
    AppState.baseColor = normalizeHex(value);
    
    // Update all color inputs to stay in sync
    updateAllColorInputs(AppState.baseColor);
    
    // Clear existing timeout
    if (colorGenerationTimeout) {
        clearTimeout(colorGenerationTimeout);
    }
    
    // Set new timeout for debounced generation
    colorGenerationTimeout = setTimeout(() => {
        generateAndUpdateColorScaleQuiet();
    }, 150);
}

/**
 * Handle sticky color picker text keydown (Enter key)
 */
function handleStickyColorPickerTextKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const value = event.target.value.trim();
        
        // Restore placeholder if it was cleared
        if (!event.target.placeholder) {
            event.target.placeholder = '#3791c6';
        }
        
        // If empty, just restore current color
        if (!value) {
            event.target.value = AppState.baseColor;
            return;
        }
        
        if (isValidHex(value)) {
            const normalizedColor = normalizeHex(value);
            AppState.baseColor = normalizedColor;
            updateAllColorInputs(normalizedColor);
            hideError();
            generateAndUpdateColorScale();
        } else {
            showError('Please enter a valid HEX color code (e.g., #3791c6)');
        }
    }
}

/**
 * Handle sticky color picker text blur (when user finishes typing)
 */
function handleStickyColorPickerTextBlur(event) {
    const value = event.target.value.trim();
    
    // Restore placeholder if it was cleared
    if (!event.target.placeholder) {
        event.target.placeholder = '#3791c6';
    }
    
    // If empty, just restore current color without error
    if (!value) {
        event.target.value = AppState.baseColor;
        return;
    }
    
    if (!isValidHex(value)) {
        showError('Please enter a valid HEX color code (e.g., #3791c6)');
        // Reset to current valid color
        event.target.value = AppState.baseColor;
    } else {
        const normalizedColor = normalizeHex(value);
        event.target.value = normalizedColor;
        if (normalizedColor !== AppState.baseColor) {
            AppState.baseColor = normalizedColor;
            updateAllColorInputs(normalizedColor);
            generateAndUpdateColorScale();
        }
        hideError();
    }
}

/**
 * Handle sticky color clear button
 */
function handleStickyColorClear() {
    // Clear the sticky text input and placeholder
    domElements.stickyColorPickerText.value = '';
    domElements.stickyColorPickerText.placeholder = '';
    
    // Update only other inputs, excluding the sticky text input we just cleared
    updateAllColorInputs(AppState.baseColor, domElements.stickyColorPickerText);
    
    domElements.stickyColorPickerText.focus();
}

/**
 * Handle sticky scale select change
 */
function handleStickyScaleSelectChange(event) {
    const value = event.target.value;
    AppState.scaleConfiguration = value;
    
    // Update main scale controls to stay in sync (prevent event loops)
    const mainRadio = document.querySelector(`input[name="scaleRange"][value="${value}"]`);
    if (mainRadio && !mainRadio.checked) {
        mainRadio.checked = true;
        updateSegmentIndicator(mainRadio);
    }
    
    generateAndUpdateColorScale();
}

/**
 * Handle sticky accessibility select change
 */
function handleStickyAccessibilitySelectChange(event) {
    const value = event.target.value;
    AppState.accessibilityMode = value;
    
    // Update main accessibility controls to stay in sync (prevent event loops)
    const mainRadio = document.querySelector(`input[name="accessibilityMode"][value="${value}"]`);
    if (mainRadio && !mainRadio.checked) {
        mainRadio.checked = true;
        updateAccessibilityIndicator(mainRadio);
    }
    
    // Immediately update the accessibility summary to reflect the new mode
    updateAccessibilitySummary();
    
    // Regenerate color scale with new accessibility criteria
    generateAndUpdateColorScale();
}

/**
 * Handle view mode toggle (minimal view)
 */
function handleViewModeToggle(event) {
    // Prevent default if it's a button click
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    
    AppState.isMinimalViewActive = !AppState.isMinimalViewActive;
    
    if (AppState.isMinimalViewActive) {
        document.body.classList.add('minimal-view');
    } else {
        document.body.classList.remove('minimal-view');
    }
    
    // Update both main and sticky toggle states
    updateViewModeToggles();
    
    // Update existing color cards if they exist
    updatePaletteDisplay();
}

/**
 * Update view mode toggle states
 */
function updateViewModeToggles() {
    // Update both main and sticky toggle states
    if (domElements.viewModeToggle) {
        domElements.viewModeToggle.classList.toggle('active', AppState.isMinimalViewActive);
    }
    if (domElements.stickyViewModeToggle) {
        domElements.stickyViewModeToggle.classList.toggle('active', AppState.isMinimalViewActive);
    }
}

/**
 * Handle header scroll behavior
 * Show sticky controls only when input-section goes out of viewport
 */
function handleHeaderScroll() {
    if (!domElements.appHeader) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const inputSection = document.querySelector('.input-section');
    
    if (scrollTop > 0) {
        // User has scrolled down from the top - add scrolled class for header styling
        domElements.appHeader.classList.add('scrolled');
    } else {
        // User is back at the very top - remove scrolled class
        domElements.appHeader.classList.remove('scrolled');
    }
    
    // Show sticky controls when 45% of input-section is out of viewport
    if (inputSection) {
        const inputSectionRect = inputSection.getBoundingClientRect();
        const sectionHeight = inputSectionRect.height;
        const visiblePortion = inputSectionRect.bottom;
        const hiddenPortion = sectionHeight - Math.max(0, visiblePortion);
        const hiddenPercentage = (hiddenPortion / sectionHeight) * 100;
        
        if (hiddenPercentage >= 45) {
            domElements.appHeader.classList.add('show-sticky-controls');
        } else {
            domElements.appHeader.classList.remove('show-sticky-controls');
        }
    }
}

/**
 * Generate initial color scale on page load
 */
function generateInitialScale() {
    // Use URL parameters if available
    const urlParams = new URLSearchParams(window.location.search);
    const colorParam = urlParams.get('color');
    
    if (colorParam && isValidHex(colorParam)) {
        AppState.baseColor = normalizeHex(colorParam);
        updateAllColorInputs(AppState.baseColor);
    }
    
    // Initialize accessibility mode from checked radio button
    const checkedAccessibilityRadio = document.querySelector('input[name="accessibilityMode"]:checked');
    if (checkedAccessibilityRadio) {
        AppState.accessibilityMode = checkedAccessibilityRadio.value;
    }
    
    // Initialize sticky controls with current values
    if (domElements.stickyColorPicker) {
        domElements.stickyColorPicker.value = AppState.baseColor;
    }
    if (domElements.stickyColorPickerText) {
        domElements.stickyColorPickerText.value = AppState.baseColor;
    }
    if (domElements.stickyScaleSelect) {
        domElements.stickyScaleSelect.value = AppState.scaleConfiguration;
    }
    if (domElements.stickyAccessibilitySelect) {
        domElements.stickyAccessibilitySelect.value = AppState.accessibilityMode;
    }
    
    // Initialize view mode body class
    if (AppState.isMinimalViewActive) {
        document.body.classList.add('minimal-view');
    } else {
        document.body.classList.remove('minimal-view');
    }
    
    // Initialize view mode toggle states
    updateViewModeToggles();
    
    // Generate initial scale
    generateAndUpdateColorScale();
}

/**
 * Handle sticky preview button click
 */
function handleStickyPreviewClick() {
    openPreviewLightbox();
}

/**
 * Open preview lightbox
 */
function openPreviewLightbox() {
    // Clone the live preview section content
    const livePreviewSection = document.getElementById('livePreviewSection');
    if (!livePreviewSection) {
        return;
    }
    
    // Clear existing content and add cloned content
    domElements.lightboxBody.innerHTML = '';
    const clonedContent = livePreviewSection.cloneNode(true);
    
    // Remove the hidden class, ID and find/remove the original controls
    clonedContent.classList.remove('hidden');
    clonedContent.removeAttribute('id');
    
    // Remove the original preview controls from the cloned content
    const originalControls = clonedContent.querySelector('.preview-controls');
    if (originalControls) {
        originalControls.remove();
    }
    
    // Add the cloned content to lightbox
    domElements.lightboxBody.appendChild(clonedContent);
    
    // Initialize lightbox state
    updateLightboxThemeIcon();
    
    // Apply current colors to the preview
    updateLightboxPreview();
    
    // Show lightbox
    domElements.previewLightbox.classList.remove('hidden');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Add escape key listener
    document.addEventListener('keydown', handleLightboxKeydown);
}

/**
 * Handle lightbox close
 */
function handleLightboxClose() {
    // Hide lightbox
    domElements.previewLightbox.classList.add('hidden');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Remove escape key listener
    document.removeEventListener('keydown', handleLightboxKeydown);
}

/**
 * Handle lightbox keyboard events
 */
function handleLightboxKeydown(event) {
    if (event.key === 'Escape') {
        handleLightboxClose();
    }
}

/**
 * Handle lightbox dark mode toggle
 */
function handleLightboxDarkModeToggle() {
    AppState.lightboxDarkMode = !AppState.lightboxDarkMode;
    updateLightboxThemeIcon();
    updateLightboxPreview();
}

/**
 * Update lightbox theme icon based on state
 */
function updateLightboxThemeIcon() {
    const themeIcon = domElements.lightboxDarkModeToggle.querySelector('.theme-icon');
    const lightboxContent = domElements.previewLightbox.querySelector('.lightbox-content');
    const toggleTrack = domElements.lightboxDarkModeToggle.querySelector('.toggle-track');
    
    if (!themeIcon || !lightboxContent) return;
    
    if (AppState.lightboxDarkMode) {
        // Dark mode - show moon icon
        themeIcon.innerHTML = '<path d="M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z" fill="currentColor"/>';
        lightboxContent.classList.add('lightbox-dark-mode-active');
        if (toggleTrack) toggleTrack.classList.add('active');
    } else {
        // Light mode - show sun icon
        themeIcon.innerHTML = '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" fill="currentColor"/>';
        lightboxContent.classList.remove('lightbox-dark-mode-active');
        if (toggleTrack) toggleTrack.classList.remove('active');
    }
}

/**
 * Update lightbox preview with current colors
 */
function updateLightboxPreview() {
    if (!domElements.lightboxBody) return;
    
    const preview = domElements.lightboxBody.querySelector('.preview-container');
    if (!preview) return;
    
    // Remove the title and subtitle from preview content (they're now in header)
    const previewTitle = preview.querySelector('.preview-title');
    const previewSubtitle = preview.querySelector('.preview-subtitle');
    if (previewTitle) previewTitle.remove();
    if (previewSubtitle) previewSubtitle.remove();
    
    // Use the same logic as the main live preview to determine which scale to use
    let colorScale;
    
    // Start with light mode scale
    colorScale = AppState.lightModeScale;
    
    // Check if base color passes accessibility criteria based on selected mode
    const baseColor = AppState.lightModeScale.find(c => c.level === 400);
    const baseFullyAccessible = baseColor && isColorAccessibleByMode(baseColor, AppState.accessibilityMode);
    
    // If base is not accessible, use accessible alternatives if they exist
    if (!baseFullyAccessible && AppState.accessibleLightScale && AppState.accessibleLightScale.length > 0) {
        colorScale = AppState.accessibleLightScale;
    }
    
    // Switch to dark mode if needed
    if (AppState.lightboxDarkMode) {
        colorScale = AppState.darkModeScale;
        if (!baseFullyAccessible && AppState.accessibleDarkScale && AppState.accessibleDarkScale.length > 0) {
            colorScale = AppState.accessibleDarkScale;
        }
    }
    
    if (!colorScale || colorScale.length === 0) return;
    
    // Apply theme class
    if (AppState.lightboxDarkMode) {
        preview.classList.add('dark-theme');
        preview.classList.remove('light-theme');
    } else {
        preview.classList.add('light-theme');
        preview.classList.remove('dark-theme');
    }
    
    // Apply colors directly to the lightbox preview container
    const colors = getPreviewColors(colorScale);
    
    // Apply CSS custom properties directly to the preview container
    Object.entries(colors).forEach(([property, value]) => {
        preview.style.setProperty(`--preview-${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });
    
    // Apply core color variables manually with updated property names
    // Core brand colors
    preview.style.setProperty('--preview-primary', colors.primary);
    preview.style.setProperty('--preview-primary-hover', colors.primaryHover);
    preview.style.setProperty('--preview-accent', colors.accent);
    
    // Secondary neutral colors
    preview.style.setProperty('--preview-secondary', colors.secondary);
    preview.style.setProperty('--preview-secondary-hover', colors.secondaryHover);
    
    // Text colors
    preview.style.setProperty('--preview-text', colors.text);
    preview.style.setProperty('--preview-heading', colors.heading);
    preview.style.setProperty('--preview-muted', colors.muted);
    
    // Backgrounds and surfaces  
    preview.style.setProperty('--preview-section-bg', colors.sectionBg);
    preview.style.setProperty('--preview-card-bg', colors.cardBg);
    preview.style.setProperty('--preview-card-border', colors.cardBorder);
    preview.style.setProperty('--preview-card-title', colors.cardTitle);
    preview.style.setProperty('--preview-card-text', colors.cardText);
    
    // Form elements
    preview.style.setProperty('--preview-input-bg', colors.inputBg);
    preview.style.setProperty('--preview-input-border', colors.inputBorder);
    preview.style.setProperty('--preview-input-focus', colors.inputFocus);
    
    // Navigation
    preview.style.setProperty('--preview-nav-bg', colors.navBg);
    preview.style.setProperty('--preview-nav-border', colors.navBorder);
    preview.style.setProperty('--preview-nav-link', colors.navLink);
    preview.style.setProperty('--preview-nav-link-hover', colors.navLinkHover);
    preview.style.setProperty('--preview-nav-link-hover-bg', colors.navLinkHoverBg);
    preview.style.setProperty('--preview-nav-active', colors.navActive);
    
    // Ghost/outline elements
    preview.style.setProperty('--preview-ghost-color', colors.ghostColor);
    preview.style.setProperty('--preview-ghost-hover', colors.ghostHover);
    preview.style.setProperty('--preview-ghost-border', colors.ghostBorder);
    
    // System colors
    preview.style.setProperty('--preview-border', colors.border);
    preview.style.setProperty('--preview-success', colors.success);
    preview.style.setProperty('--preview-warning', colors.warning);
    preview.style.setProperty('--preview-error', colors.error);
}


/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Enhanced Algorithm Event Handlers
 */

/**
 * Handle enhanced algorithms toggle (new toggle-track style)
 */
function handleEnhancedAlgorithmsToggle() {
    AppState.useEnhancedAlgorithms = !AppState.useEnhancedAlgorithms;
    
    // Update toggle visual state
    const toggleTrack = domElements.enhancedAlgorithmsToggle;
    if (AppState.useEnhancedAlgorithms) {
        document.body.classList.add('enhanced-algorithms-active');
        toggleTrack.setAttribute('aria-pressed', 'true');
    } else {
        document.body.classList.remove('enhanced-algorithms-active');
        toggleTrack.setAttribute('aria-pressed', 'false');
    }
    
    // Show/hide enhanced algorithm controls with animation
    const algorithmControls = document.querySelector('.enhanced-algorithm-controls');
    if (algorithmControls) {
        // Ensure transitions are set
        algorithmControls.style.transition = 'max-height 0.3s ease-out, opacity 0.3s ease-out';
        if (AppState.useEnhancedAlgorithms) {
            algorithmControls.classList.remove('hidden');
            algorithmControls.classList.remove('disabled');
            // Force show with styles if CSS fails
            algorithmControls.style.maxHeight = '300px';
            algorithmControls.style.opacity = '1';
        } else {
            algorithmControls.classList.add('hidden');
            algorithmControls.classList.add('disabled');
            // Force hide with styles if CSS fails
            algorithmControls.style.maxHeight = '0';
            algorithmControls.style.opacity = '0';
        }
    }
    
    generateAndUpdateColorScale();
}

/**
 * Handle enhanced algorithm toggle (legacy checkbox)
 */
function handleEnhancedAlgorithmToggle(event) {
    AppState.useEnhancedAlgorithms = event.target.checked;
    
    // Show/hide enhanced algorithm controls
    const algorithmControls = document.querySelector('.algorithm-controls');
    if (algorithmControls) {
        if (AppState.useEnhancedAlgorithms) {
            algorithmControls.classList.remove('disabled');
        } else {
            algorithmControls.classList.add('disabled');
        }
    }
    
    generateAndUpdateColorScale();
}

/**
 * Handle perceptual uniformity toggle
 */
function handlePerceptualUniformityToggle(event) {
    AppState.usePerceptualUniformity = event.target.checked;
    generateAndUpdateColorScale();
}

/**
 * Handle interpolation method change
 */
function handleInterpolationMethodChange(event) {
    AppState.interpolationMethod = event.target.value;
    generateAndUpdateColorScale();
}


/**
 * Handle Bezier interpolation toggle
 */
function handleBezierInterpolationToggle(event) {
    AppState.enableBezierInterpolation = event.target.checked;
    generateAndUpdateColorScale();
}

/**
 * Handle accordion toggle
 */
function handleAccordionToggle() {
    const header = domElements.advancedSettingsHeader;
    const content = domElements.advancedSettingsContent;
    
    if (!header || !content) return;
    
    const isExpanded = header.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;
    
    // Update ARIA attributes
    header.setAttribute('aria-expanded', newState.toString());
    content.setAttribute('aria-hidden', (!newState).toString());
    
    // Add/remove animation class for smooth transition
    if (newState) {
        content.style.display = 'block';
        // Force reflow for smooth animation
        content.offsetHeight;
        content.setAttribute('aria-hidden', 'false');
    } else {
        content.setAttribute('aria-hidden', 'true');
        // Wait for animation to complete before hiding
        setTimeout(() => {
            if (content.getAttribute('aria-hidden') === 'true') {
                content.style.display = '';
            }
        }, 300);
    }
}

/**
 * Update quality metrics panel
 */
function updateQualityMetricsPanel() {
    // Temporarily hidden - keep Quality Analysis hidden
    if (!domElements.qualityMetricsPanel || !domElements.qualityMetricsContent) {
        return;
    }
    
    // Force hide Quality Analysis panel
    domElements.qualityMetricsPanel.style.display = 'none';
    return;
    
    // Original logic (disabled)
    /*
    if (!AppState.qualityMetrics || !AppState.useEnhancedAlgorithms) {
        domElements.qualityMetricsPanel.style.display = 'none';
        return;
    }
    
    domElements.qualityMetricsPanel.style.display = 'block';
    
    const metrics = AppState.qualityMetrics;
    const html = `
        <div class="quality-metrics-grid">
            <div class="metric-item">
                <div class="metric-label">Perceptual Uniformity</div>
                <div class="metric-value ${getMetricClass(metrics.perceptualUniformity)}">${formatMetricValue(metrics.perceptualUniformity)}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Color Harmony</div>
                <div class="metric-value ${getMetricClass(metrics.colorHarmony)}">${formatMetricValue(metrics.colorHarmony)}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Smoothness</div>
                <div class="metric-value ${getMetricClass(metrics.smoothness)}">${formatMetricValue(metrics.smoothness)}</div>
            </div>
        </div>
        <div class="quality-details">
            <div class="detail-item">
                <span class="detail-label">Algorithm:</span>
                <span class="detail-value">${metrics.algorithm}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Interpolation:</span>
                <span class="detail-value">${AppState.interpolationMethod.toUpperCase()}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Generation Time:</span>
                <span class="detail-value">${Math.round(AppState.lastGenerationTime)}ms</span>
            </div>
        </div>
    `;
    
    domElements.qualityMetricsContent.innerHTML = html;
    */
}

/**
 * Get CSS class for metric value based on quality
 */
function getMetricClass(value) {
    if (value >= 0.8) return 'metric-excellent';
    if (value >= 0.6) return 'metric-good';
    if (value >= 0.4) return 'metric-fair';
    return 'metric-poor';
}

/**
 * Format metric value for display
 */
function formatMetricValue(value) {
    return Math.round(value * 100) + '%';
}

/**
 * Initialize enhanced algorithm controls
 */
function initializeEnhancedControls() {
    // Set initial toggle states for toggles
    if (domElements.enhancedAlgorithmsToggle) {
        if (AppState.useEnhancedAlgorithms) {
            document.body.classList.add('enhanced-algorithms-active');
            domElements.enhancedAlgorithmsToggle.setAttribute('aria-pressed', 'true');
        } else {
            document.body.classList.remove('enhanced-algorithms-active');
            domElements.enhancedAlgorithmsToggle.setAttribute('aria-pressed', 'false');
        }
    }
    
    // Set initial state for sticky toggle too
    if (domElements.stickyEnhancedAlgorithmsToggle) {
        if (AppState.useEnhancedAlgorithms) {
            domElements.stickyEnhancedAlgorithmsToggle.setAttribute('aria-pressed', 'true');
        } else {
            domElements.stickyEnhancedAlgorithmsToggle.setAttribute('aria-pressed', 'false');
        }
    }
    
    // Set initial toggle states for legacy toggle
    if (domElements.enhancedAlgorithmToggle) {
        domElements.enhancedAlgorithmToggle.checked = AppState.useEnhancedAlgorithms;
    }
    if (domElements.perceptualUniformityToggle) {
        domElements.perceptualUniformityToggle.checked = AppState.usePerceptualUniformity;
    }
    if (domElements.interpolationMethodSelect) {
        domElements.interpolationMethodSelect.value = AppState.interpolationMethod;
    }
    if (domElements.bezierInterpolationToggle) {
        domElements.bezierInterpolationToggle.checked = AppState.enableBezierInterpolation;
    }
    
    // Show/hide algorithm controls based on enhanced mode
    const algorithmControls = document.querySelector('.enhanced-algorithm-controls');
    if (algorithmControls) {
        // Ensure clean state first
        algorithmControls.classList.remove('hidden', 'disabled');
        
        if (AppState.useEnhancedAlgorithms) {
            // Already shown - no action needed
        } else {
            // Hide with delay to allow for initial render
            setTimeout(() => {
                algorithmControls.classList.add('hidden');
                algorithmControls.classList.add('disabled');
            }, 100);
        }
    }
}