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
 * Convert RGB to LAB color space
 * @param {Array} rgb - RGB array [r, g, b]
 * @returns {Array} LAB array [L, a, b]
 */
function rgbToLab(rgb) {
    // Convert RGB to XYZ first
    let [r, g, b] = rgb.map(val => {
        val = val / 255;
        if (val > 0.04045) {
            val = Math.pow(((val + 0.055) / 1.055), 2.4);
        } else {
            val = val / 12.92;
        }
        return val * 100;
    });
    
    // Observer = 2°, Illuminant = D65
    let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    let z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    
    // Normalize for D65 illuminant
    x = x / 95.047;
    y = y / 100.000;
    z = z / 108.883;
    
    // Convert XYZ to LAB
    [x, y, z] = [x, y, z].map(val => {
        if (val > 0.008856) {
            val = Math.pow(val, 1/3);
        } else {
            val = (7.787 * val) + (16/116);
        }
        return val;
    });
    
    const L = (116 * y) - 16;
    const a = 500 * (x - y);
    const b_val = 200 * (y - z);
    
    return [L, a, b_val];
}

/**
 * Convert LAB to RGB color space
 * @param {Array} lab - LAB array [L, a, b]
 * @returns {Array} RGB array [r, g, b]
 */
function labToRgb(lab) {
    const [L, a, b] = lab;
    
    let y = (L + 16) / 116;
    let x = a / 500 + y;
    let z = y - b / 200;
    
    // Convert to XYZ
    [x, y, z] = [x, y, z].map(val => {
        const cubed = Math.pow(val, 3);
        if (cubed > 0.008856) {
            val = cubed;
        } else {
            val = (val - 16/116) / 7.787;
        }
        return val;
    });
    
    // Scale by illuminant
    x = x * 95.047;
    y = y * 100.000;
    z = z * 108.883;
    
    // Convert XYZ to RGB
    x = x / 100;
    y = y / 100;
    z = z / 100;
    
    let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let b_val = x * 0.0557 + y * -0.2040 + z * 1.0570;
    
    // Convert to sRGB
    [r, g, b_val] = [r, g, b_val].map(val => {
        if (val > 0.0031308) {
            val = 1.055 * Math.pow(val, 1/2.4) - 0.055;
        } else {
            val = 12.92 * val;
        }
        return Math.max(0, Math.min(1, val)) * 255;
    });
    
    return [Math.round(r), Math.round(g), Math.round(b_val)];
}

/**
 * Convert RGB to LCH color space
 * @param {Array} rgb - RGB array [r, g, b]
 * @returns {Array} LCH array [L, C, H]
 */
function rgbToLch(rgb) {
    const lab = rgbToLab(rgb);
    const [L, a, b] = lab;
    
    const C = Math.sqrt(a * a + b * b);
    let H = Math.atan2(b, a) * 180 / Math.PI;
    if (H < 0) H += 360;
    
    return [L, C, H];
}

/**
 * Convert LCH to RGB color space
 * @param {Array} lch - LCH array [L, C, H]
 * @returns {Array} RGB array [r, g, b]
 */
function lchToRgb(lch) {
    const [L, C, H] = lch;
    
    const h_rad = H * Math.PI / 180;
    const a = Math.cos(h_rad) * C;
    const b = Math.sin(h_rad) * C;
    
    return labToRgb([L, a, b]);
}

/**
 * Calculate Delta E (CIE2000) for perceptual color difference
 * @param {Array} lab1 - First LAB color [L, a, b]
 * @param {Array} lab2 - Second LAB color [L, a, b]
 * @returns {number} Delta E value (lower = more similar)
 */
function calculateDeltaE(lab1, lab2) {
    const [L1, a1, b1] = lab1;
    const [L2, a2, b2] = lab2;
    
    // Calculate chroma
    const C1 = Math.sqrt(a1 * a1 + b1 * b1);
    const C2 = Math.sqrt(a2 * a2 + b2 * b2);
    const meanC = (C1 + C2) / 2;
    
    // Calculate G adjustment factor
    const G = 0.5 * (1 - Math.sqrt(Math.pow(meanC, 7) / (Math.pow(meanC, 7) + Math.pow(25, 7))));
    
    // Apply adjustments
    const a1p = a1 * (1 + G);
    const a2p = a2 * (1 + G);
    
    const C1p = Math.sqrt(a1p * a1p + b1 * b1);
    const C2p = Math.sqrt(a2p * a2p + b2 * b2);
    
    // Calculate hue angles
    let h1p = Math.atan2(b1, a1p) * 180 / Math.PI;
    let h2p = Math.atan2(b2, a2p) * 180 / Math.PI;
    if (h1p < 0) h1p += 360;
    if (h2p < 0) h2p += 360;
    
    // Calculate deltas
    const deltaLp = L2 - L1;
    const deltaCp = C2p - C1p;
    
    let deltahp = h2p - h1p;
    if (Math.abs(deltahp) > 180) {
        if (h2p > h1p) {
            deltahp -= 360;
        } else {
            deltahp += 360;
        }
    }
    
    const deltaHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(deltahp * Math.PI / 360);
    
    // Calculate weighting functions
    const meanLp = (L1 + L2) / 2;
    const meanCp = (C1p + C2p) / 2;
    let meanHp = (h1p + h2p) / 2;
    
    if (Math.abs(h1p - h2p) > 180) {
        meanHp += 180;
        if (meanHp >= 360) meanHp -= 360;
    }
    
    const T = 1 - 0.17 * Math.cos((meanHp - 30) * Math.PI / 180) +
              0.24 * Math.cos(2 * meanHp * Math.PI / 180) +
              0.32 * Math.cos((3 * meanHp + 6) * Math.PI / 180) -
              0.20 * Math.cos((4 * meanHp - 63) * Math.PI / 180);
    
    const SL = 1 + (0.015 * Math.pow(meanLp - 50, 2)) / Math.sqrt(20 + Math.pow(meanLp - 50, 2));
    const SC = 1 + 0.045 * meanCp;
    const SH = 1 + 0.015 * meanCp * T;
    
    const RT = -2 * Math.sqrt(Math.pow(meanCp, 7) / (Math.pow(meanCp, 7) + Math.pow(25, 7))) *
               Math.sin(60 * Math.exp(-Math.pow((meanHp - 275) / 25, 2)) * Math.PI / 180);
    
    // Final Delta E calculation
    const deltaE = Math.sqrt(
        Math.pow(deltaLp / SL, 2) +
        Math.pow(deltaCp / SC, 2) +
        Math.pow(deltaHp / SH, 2) +
        RT * (deltaCp / SC) * (deltaHp / SH)
    );
    
    return deltaE;
}

/**
 * Check if a color is considered neutral (low saturation)
 * @param {Array} hsl - HSL array [h, s, l]
 * @returns {boolean} True if color is neutral
 */
function isNeutralColor(hsl) {
    return hsl[1] < 15; // Updated threshold from 10% to 15%
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

/**
 * Clamp LCH values to valid ranges
 * @param {Array} lch - LCH array [L, C, H]
 * @returns {Array} Clamped LCH array [L, C, H]
 */
function clampLCH(lch) {
    const [L, C, H] = lch;
    return [
        Math.max(0, Math.min(100, L)), // Clamp lightness 0-100
        Math.max(0, C), // Chroma can't be negative
        ((H % 360) + 360) % 360  // Ensure hue is 0-359
    ];
}