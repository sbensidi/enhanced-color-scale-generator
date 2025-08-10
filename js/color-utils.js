/**
 * Color Utilities Module
 * Handles color format conversions between HEX, RGB, and HSL
 * Foundation for all color calculations in the application
 */

/**
 * Convert HEX color to RGB
 * @param {string} hex - HEX color code (with or without #)
 * @returns {Array|null} RGB array [r, g, b] or null if invalid
 */
function hexToRgb(hex) {
    const normalizedHex = normalizeHex(hex);
    if (!isValidHex(normalizedHex)) {
        return null;
    }
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalizedHex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

/**
 * Convert RGB to HEX
 * @param {Array} rgb - RGB array [r, g, b]
 * @returns {string} HEX color code with #
 */
function rgbToHex(rgb) {
    const [r, g, b] = rgb;
    const toHex = (n) => {
        const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert HEX color to HSL
 * @param {string} hex - HEX color code
 * @returns {Array|null} HSL array [h, s, l] or null if invalid
 */
function hexToHSL(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    return rgbToHSL(rgb);
}

/**
 * Convert RGB to HSL
 * @param {Array} rgb - RGB array [r, g, b]
 * @returns {Array} HSL array [h, s, l]
 */
function rgbToHSL(rgb) {
    const [r, g, b] = rgb.map(val => val / 255);
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (diff !== 0) {
        s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
        
        switch (max) {
            case r:
                h = (g - b) / diff + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / diff + 2;
                break;
            case b:
                h = (r - g) / diff + 4;
                break;
        }
        h /= 6;
    }
    
    return [
        Math.round(h * 360),
        Math.round(s * 100),
        Math.round(l * 100)
    ];
}

/**
 * Convert HSL to RGB
 * @param {Array} hsl - HSL array [h, s, l]
 * @returns {Array} RGB array [r, g, b]
 */
function hslToRgb(hsl) {
    const [h, s, l] = [hsl[0] / 360, hsl[1] / 100, hsl[2] / 100];
    
    if (s === 0) {
        const gray = Math.round(l * 255);
        return [gray, gray, gray];
    }
    
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);
    
    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ];
}

/**
 * Convert HSL to HEX
 * @param {Array} hsl - HSL array [h, s, l]
 * @returns {string} HEX color code with #
 */
function hslToHex(hsl) {
    const rgb = hslToRgb(hsl);
    return rgbToHex(rgb);
}

/**
 * Validate HEX color format
 * @param {string} hex - HEX color code to validate
 * @returns {boolean} True if valid HEX color
 */
function isValidHex(hex) {
    if (!hex || typeof hex !== 'string') return false;
    const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(hex);
}

/**
 * Normalize HEX color code
 * @param {string} hex - HEX color code to normalize
 * @returns {string} Normalized HEX color code with # and 6 digits
 */
function normalizeHex(hex) {
    if (!hex || typeof hex !== 'string') return '';
    
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Convert 3-digit hex to 6-digit
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    
    // Add # prefix
    return '#' + hex.toUpperCase();
}

/**
 * Get a contrasting text color (black or white) for a given background color
 * @param {string} hex - Background HEX color
 * @returns {string} '#000000' or '#ffffff'
 */
function getContrastingTextColor(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return '#000000';
    
    // Calculate relative luminance
    const luminance = calculateLuminance(rgb);
    
    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Calculate relative luminance of an RGB color
 * @param {Array} rgb - RGB array [r, g, b]
 * @returns {number} Luminance value between 0 and 1
 */
function calculateLuminance(rgb) {
    const [r, g, b] = rgb.map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Generate a generic color name based on HSL values
 * @param {Array} hsl - HSL array [h, s, l]
 * @returns {string} Generic color name
 */
function getGenericColorName(hsl) {
    const [h, s, l] = hsl;
    
    // Handle grayscale colors
    if (s < 10) {
        if (l > 90) return 'Very Light Gray';
        if (l > 70) return 'Light Gray';
        if (l > 50) return 'Medium Gray';
        if (l > 30) return 'Dark Gray';
        return 'Very Dark Gray';
    }
    
    // Determine lightness modifier
    let lightness = '';
    if (l > 80) lightness = 'Very Light ';
    else if (l > 60) lightness = 'Light ';
    else if (l < 25) lightness = 'Very Dark ';
    else if (l < 40) lightness = 'Dark ';
    
    // Determine saturation modifier
    let saturation = '';
    if (s > 80) saturation = 'Vivid ';
    else if (s > 60) saturation = 'Rich ';
    else if (s < 30) saturation = 'Muted ';
    
    // Determine base hue name
    let hue = '';
    if (h >= 0 && h < 15) hue = 'Red';
    else if (h < 30) hue = 'Red-Orange';
    else if (h < 45) hue = 'Orange';
    else if (h < 60) hue = 'Yellow-Orange';
    else if (h < 75) hue = 'Yellow';
    else if (h < 90) hue = 'Yellow-Green';
    else if (h < 120) hue = 'Green';
    else if (h < 150) hue = 'Blue-Green';
    else if (h < 180) hue = 'Cyan';
    else if (h < 210) hue = 'Light Blue';
    else if (h < 240) hue = 'Blue';
    else if (h < 270) hue = 'Blue-Purple';
    else if (h < 300) hue = 'Purple';
    else if (h < 330) hue = 'Red-Purple';
    else hue = 'Red';
    
    return `${lightness}${saturation}${hue}`.trim();
}

/**
 * Calculate color distance between two HSL colors
 * @param {Array} hsl1 - First HSL color [h, s, l]
 * @param {Array} hsl2 - Second HSL color [h, s, l] 
 * @returns {number} Distance value
 */
function calculateColorDistance(hsl1, hsl2) {
    const [h1, s1, l1] = hsl1;
    const [h2, s2, l2] = hsl2;
    
    // Calculate hue distance (handle wrap-around)
    let hueDiff = Math.abs(h1 - h2);
    if (hueDiff > 180) {
        hueDiff = 360 - hueDiff;
    }
    
    // Calculate euclidean-like distance with weights
    const hueWeight = 2;
    const satWeight = 1;
    const lightWeight = 1;
    
    return Math.sqrt(
        Math.pow(hueDiff * hueWeight, 2) + 
        Math.pow((s1 - s2) * satWeight, 2) + 
        Math.pow((l1 - l2) * lightWeight, 2)
    );
}

/**
 * Mix two colors in HSL space
 * @param {Array} hsl1 - First HSL color [h, s, l]
 * @param {Array} hsl2 - Second HSL color [h, s, l]
 * @param {number} ratio - Mix ratio (0-1, where 0 = hsl1, 1 = hsl2)
 * @returns {Array} Mixed HSL color [h, s, l]
 */
function mixHSLColors(hsl1, hsl2, ratio) {
    const [h1, s1, l1] = hsl1;
    const [h2, s2, l2] = hsl2;
    
    // Handle hue mixing (circular interpolation)
    let h = h1;
    const hueDiff = Math.abs(h2 - h1);
    if (hueDiff > 180) {
        // Take the shorter path around the color wheel
        if (h1 > h2) {
            h = h1 + (360 - h1 + h2) * ratio;
        } else {
            h = h1 - (h1 + 360 - h2) * ratio;
        }
        h = h % 360;
        if (h < 0) h += 360;
    } else {
        h = h1 + (h2 - h1) * ratio;
    }
    
    const s = s1 + (s2 - s1) * ratio;
    const l = l1 + (l2 - l1) * ratio;
    
    return [
        Math.round(h),
        Math.round(Math.max(0, Math.min(100, s))),
        Math.round(Math.max(0, Math.min(100, l)))
    ];
}

/**
 * Check if a color is considered neutral (low saturation)
 * @param {Array} hsl - HSL array [h, s, l]
 * @returns {boolean} True if color is neutral
 */
function isNeutralColor(hsl) {
    return hsl[1] < 10; // Saturation less than 10%
}

/**
 * Clamp HSL values to valid ranges
 * @param {Array} hsl - HSL array [h, s, l]
 * @returns {Array} Clamped HSL array [h, s, l]
 */
function clampHSL(hsl) {
    const [h, s, l] = hsl;
    return [
        ((h % 360) + 360) % 360, // Ensure hue is 0-359
        Math.max(0, Math.min(100, s)), // Clamp saturation 0-100
        Math.max(0, Math.min(100, l))  // Clamp lightness 0-100
    ];
}