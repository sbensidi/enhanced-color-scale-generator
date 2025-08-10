/**
 * Color Names API Module
 * Integration with color.pizza API for intelligent color naming
 * Provides caching and fallback functionality
 */

// API configuration
const COLOR_API_CONFIG = {
    endpoint: 'https://api.color.pizza/v1/',
    timeout: 5000,
    maxCacheSize: 500,
    cacheExpiry: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
};

// In-memory cache for color names
const colorNameCache = new Map();

/**
 * Get color name from API with caching and fallback
 * @param {string} hexColor - HEX color code
 * @returns {Promise<string>} Color name
 */
async function getColorName(hexColor) {
    const normalizedHex = normalizeHex(hexColor);
    
    // Check cache first
    const cachedResult = getCachedColorName(normalizedHex);
    if (cachedResult) {
        return cachedResult;
    }
    
    // Always use fallback for now (API can be unreliable)
    const hsl = hexToHSL(normalizedHex);
    const fallbackName = hsl ? getGenericColorName(hsl) : 'Unknown Color';
    
    // Cache fallback
    cacheColorName(normalizedHex, fallbackName, true);
    
    // Try API in background (don't wait for it)
    fetchColorNameFromAPI(normalizedHex)
        .then(apiResult => {
            // Update cache with API result
            cacheColorName(normalizedHex, apiResult, false);
            
            // Update UI if this color is currently displayed
            updateColorNameInUI(normalizedHex, apiResult);
        })
        .catch(error => {
        });
    
    return fallbackName;
}

/**
 * Fetch color name from color.pizza API
 * @param {string} hexColor - Normalized HEX color code
 * @returns {Promise<string>} Color name from API
 */
async function fetchColorNameFromAPI(hexColor) {
    const colorValue = hexColor.replace('#', '');
    const url = `${COLOR_API_CONFIG.endpoint}${colorValue}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), COLOR_API_CONFIG.timeout);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract color name from API response
        if (data && data.colors && data.colors.length > 0) {
            const colorInfo = data.colors[0];
            return formatColorName(colorInfo.name);
        } else {
            throw new Error('No color data in API response');
        }
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('API request timed out');
        } else {
            throw error;
        }
    }
}

/**
 * Get cached color name if available and not expired
 * @param {string} hexColor - HEX color code
 * @returns {string|null} Cached color name or null
 */
function getCachedColorName(hexColor) {
    const cacheKey = hexColor.toLowerCase();
    const cached = colorNameCache.get(cacheKey);
    
    if (!cached) {
        return null;
    }
    
    // Check if cache entry has expired
    const now = Date.now();
    if (now - cached.timestamp > COLOR_API_CONFIG.cacheExpiry) {
        colorNameCache.delete(cacheKey);
        return null;
    }
    
    return cached.name;
}

/**
 * Cache color name with timestamp
 * @param {string} hexColor - HEX color code
 * @param {string} colorName - Color name to cache
 * @param {boolean} isFallback - Whether this is a fallback name
 */
function cacheColorName(hexColor, colorName, isFallback = false) {
    const cacheKey = hexColor.toLowerCase();
    
    // Manage cache size
    if (colorNameCache.size >= COLOR_API_CONFIG.maxCacheSize) {
        // Remove oldest entries
        const entries = Array.from(colorNameCache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        // Remove oldest 20% of entries
        const removeCount = Math.floor(COLOR_API_CONFIG.maxCacheSize * 0.2);
        for (let i = 0; i < removeCount; i++) {
            colorNameCache.delete(entries[i][0]);
        }
    }
    
    // Add to cache
    colorNameCache.set(cacheKey, {
        name: colorName,
        timestamp: Date.now(),
        isFallback: isFallback
    });
}

/**
 * Format color name for consistent display
 * @param {string} rawName - Raw color name from API
 * @returns {string} Formatted color name
 */
function formatColorName(rawName) {
    if (!rawName || typeof rawName !== 'string') {
        return 'Unknown Color';
    }
    
    // Clean up the name
    let formatted = rawName.trim();
    
    // Capitalize first letter of each word
    formatted = formatted.replace(/\b\w/g, char => char.toUpperCase());
    
    // Remove extra spaces
    formatted = formatted.replace(/\s+/g, ' ');
    
    // Handle special cases
    formatted = formatted.replace(/\bRgb\b/g, 'RGB');
    formatted = formatted.replace(/\bHsl\b/g, 'HSL');
    formatted = formatted.replace(/\bLab\b/g, 'LAB');
    
    return formatted;
}

/**
 * Get color names for entire color scale
 * @param {Array} colorScale - Array of color objects
 * @param {string} baseName - Optional base name to use as prefix
 * @returns {Promise<Array>} Color scale with populated names
 */
async function getColorScaleNames(colorScale, baseName = null) {
    const promises = colorScale.map(async (color, index) => {
        let colorName;
        
        if (baseName && color.level === 400) {
            // Use base name for level 400
            colorName = baseName;
        } else {
            // Get name from API or fallback
            colorName = await getColorName(color.hex);
            
            // Add level modifier if using base name
            if (baseName) {
                colorName = `${baseName} ${getLevelModifier(color.level)}`.trim();
            }
        }
        
        return {
            ...color,
            name: colorName
        };
    });
    
    try {
        return await Promise.all(promises);
    } catch (error) {
        
        // Return scale with fallback names
        return colorScale.map(color => ({
            ...color,
            name: baseName ? `${baseName} ${color.level}` : getGenericColorName(color.hsl)
        }));
    }
}

/**
 * Get level modifier for color names
 * @param {number} level - Color level
 * @returns {string} Level modifier
 */
function getLevelModifier(level) {
    const modifiers = {
        50: 'Extra Light',
        100: 'Very Light',
        200: 'Light',
        300: 'Medium Light',
        400: '', // Base color, no modifier
        500: 'Medium',
        600: 'Medium Dark',
        700: 'Dark',
        800: 'Very Dark',
        900: 'Extra Dark'
    };
    
    return modifiers[level] || `Level ${level}`;
}

/**
 * Batch fetch color names with rate limiting
 * @param {Array} hexColors - Array of HEX color codes
 * @param {number} batchSize - Number of concurrent requests
 * @returns {Promise<Array>} Array of color names
 */
async function batchFetchColorNames(hexColors, batchSize = 3) {
    const results = [];
    
    for (let i = 0; i < hexColors.length; i += batchSize) {
        const batch = hexColors.slice(i, i + batchSize);
        const batchPromises = batch.map(hex => getColorName(hex));
        
        try {
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        } catch (error) {
            // Add fallback names for failed batch
            const fallbacks = batch.map(hex => {
                const hsl = hexToHSL(hex);
                return hsl ? getGenericColorName(hsl) : 'Unknown Color';
            });
            results.push(...fallbacks);
        }
        
        // Small delay between batches to be respectful to API
        if (i + batchSize < hexColors.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    return results;
}

/**
 * Clear color name cache
 * @param {boolean} fallbackOnly - Only clear fallback entries
 */
function clearColorNameCache(fallbackOnly = false) {
    if (fallbackOnly) {
        // Only remove fallback entries
        for (const [key, value] of colorNameCache.entries()) {
            if (value.isFallback) {
                colorNameCache.delete(key);
            }
        }
    } else {
        // Clear entire cache
        colorNameCache.clear();
    }
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
function getCacheStats() {
    const entries = Array.from(colorNameCache.values());
    const now = Date.now();
    
    return {
        totalEntries: colorNameCache.size,
        apiEntries: entries.filter(e => !e.isFallback).length,
        fallbackEntries: entries.filter(e => e.isFallback).length,
        expiredEntries: entries.filter(e => now - e.timestamp > COLOR_API_CONFIG.cacheExpiry).length,
        oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : null,
        newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : null
    };
}

/**
 * Preload common color names
 * @param {Array} commonColors - Array of common HEX colors
 */
async function preloadCommonColors(commonColors = []) {
    const defaultColors = [
        '#ff0000', '#00ff00', '#0000ff', // Primary RGB
        '#ffff00', '#ff00ff', '#00ffff', // Secondary RGB
        '#ffffff', '#000000', '#808080', // Grayscale
        '#ffa500', '#800080', '#008000', // Common colors
        '#ff69b4', '#4169e1', '#32cd32'  // Popular colors
    ];
    
    const colorsToPreload = [...defaultColors, ...commonColors];
    
    try {
        await batchFetchColorNames(colorsToPreload, 2);
    } catch (error) {
    }
}

/**
 * Update color name in UI if currently displayed
 * @param {string} hexColor - HEX color code
 * @param {string} colorName - New color name
 */
function updateColorNameInUI(hexColor, colorName) {
    // Find all color name elements with this hex color
    const colorCards = document.querySelectorAll(`[data-hex="${hexColor.toLowerCase()}"]`);
    
    colorCards.forEach(card => {
        const nameElement = card.querySelector('.color-name-enhanced') || card.querySelector('.color-name');
        if (nameElement) {
            nameElement.textContent = colorName;
        }
    });
    
    // Also update column headers if this is a base color
    const headerElements = document.querySelectorAll('.column-subtitle');
    headerElements.forEach(header => {
        if (header.textContent.includes(getGenericColorName(hexToHSL(hexColor)))) {
            header.textContent = header.textContent.replace(
                getGenericColorName(hexToHSL(hexColor)), 
                colorName
            );
        }
    });
}

// Initialize cache cleanup interval
setInterval(() => {
    const stats = getCacheStats();
    if (stats.expiredEntries > 0) {
        clearColorNameCache(false); // Clear all expired entries
    }
}, COLOR_API_CONFIG.cacheExpiry / 4); // Check every 6 hours