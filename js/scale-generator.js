/**
 * Scale Generator Module
 * Core color scale generation algorithms using piecewise linear interpolation
 * Handles both non-neutral and neutral color generation
 */

// Scale configuration presets
const SCALE_CONFIGURATIONS = {
    'minimal': {
        name: 'Minimal (1 level)',
        levels: [400],
        description: 'Just the base color level 400'
    },
    'simple': {
        name: 'Simple (3 levels)', 
        levels: [300, 400, 600],
        description: 'Light, base, and dark'
    },
    'standard': {
        name: 'Standard (5 levels)',
        levels: [200, 300, 400, 500, 600],
        description: 'Well-balanced range for most projects'
    },
    'current': {
        name: 'Current (7 levels)',
        levels: [100, 200, 300, 400, 500, 600, 700],
        description: 'Current default range'
    },
    'extended': {
        name: 'Extended (9 levels)',
        levels: [50, 100, 200, 300, 400, 500, 600, 700, 800],
        description: 'Maximum range for complex design systems'
    }
};

/**
 * Get the base level for a given configuration
 * @param {Array} levels - Array of levels in the configuration
 * @returns {number} The level that should contain the base color
 */
function getBaseLevelForConfiguration(levels) {
    // If 400 exists, use it
    if (levels.includes(400)) {
        return 400;
    }
    
    // Otherwise, find the middle level (or closest to 400)
    const sortedLevels = [...levels].sort((a, b) => a - b);
    const middleIndex = Math.floor(sortedLevels.length / 2);
    return sortedLevels[middleIndex];
}

/**
 * Generate complete color scale from base HSL color
 * @param {Array} baseHSL - Base HSL color (level 400) [h, s, l]
 * @param {string} configuration - Scale configuration key
 * @returns {Array} Array of color objects with level, hsl, rgb, hex properties
 */
function createColorScale(baseHSL, configuration = 'current') {
    const config = SCALE_CONFIGURATIONS[configuration];
    if (!config) {
        throw new Error(`Unknown scale configuration: ${configuration}`);
    }
    
    const levels = config.levels;
    const colorScale = [];
    
    // Ensure base color is properly clamped
    const clampedBaseHSL = clampHSL(baseHSL);
    
    // Find the base level for this configuration
    // For most configs it's 400, but for some it might be different
    const baseLevelForConfig = getBaseLevelForConfiguration(levels);
    
    // Generate color for each level
    levels.forEach(level => {
        let hsl;
        
        if (level === baseLevelForConfig) {
            // Use original base color for the base level
            hsl = clampedBaseHSL;
        } else {
            // Calculate HSL for this level based on the base level
            hsl = calculateHSL(clampedBaseHSL, level);
        }
        
        // Convert to other formats
        const rgb = hslToRgb(hsl);
        const hex = hslToHex(hsl);
        
        // Get accessibility information
        const contrastInfo = getContrastInfo(rgb);
        
        // Create color object
        const colorObject = {
            level: level,
            hsl: hsl,
            rgb: rgb,
            hex: hex,
            // Accessibility properties
            blackPassesNormal: contrastInfo.black.passesNormal,
            blackPassesLarge: contrastInfo.black.passesLarge,
            blackRatio: contrastInfo.black.ratio,
            whitePassesNormal: contrastInfo.white.passesNormal,
            whitePassesLarge: contrastInfo.white.passesLarge,
            whiteRatio: contrastInfo.white.ratio,
            preferredTextColor: contrastInfo.preferredText,
            // Additional properties
            name: '', // Will be populated by color naming API
            isBase: level === baseLevelForConfig
        };
        
        colorScale.push(colorObject);
    });
    
    return colorScale;
}

/**
 * Calculate HSL values for a specific level based on base color
 * Uses piecewise linear interpolation with special handling for neutral colors
 * @param {Array} hsl400 - Base HSL color (level 400) [h, s, l]
 * @param {number} level - Target level (50-900)
 * @returns {Array} Calculated HSL color [h, s, l]
 */
function calculateHSL(hsl400, level) {
    const [baseH, baseS, baseL] = hsl400;
    
    // Handle base level
    if (level === 400) {
        return [...hsl400];
    }
    
    // Check if color is neutral (low saturation)
    const isNeutral = isNeutralColor(hsl400);
    
    if (isNeutral) {
        return calculateNeutralHSL(hsl400, level);
    } else {
        return calculateNonNeutralHSL(hsl400, level);
    }
}

/**
 * Calculate HSL for neutral colors (saturation < 10%)
 * @param {Array} hsl400 - Base HSL color [h, s, l]
 * @param {number} level - Target level
 * @returns {Array} Calculated HSL color [h, s, l]
 */
function calculateNeutralHSL(hsl400, level) {
    const [baseH, baseS, baseL] = hsl400;
    
    // Fixed boundaries for neutral colors
    const lightestL = 95; // #f1f1f1
    const darkestL = 28;  // #484848
    
    // Calculate lightness based on level
    let targetL;
    
    if (level < 400) {
        // Lighter variants (50-300)
        const factor = (400 - level) / 350; // 350 = 400 - 50
        targetL = baseL + (lightestL - baseL) * factor;
    } else {
        // Darker variants (500-800)
        const factor = (level - 400) / 400; // 400 = 800 - 400
        targetL = baseL - (baseL - darkestL) * factor;
    }
    
    // Clamp lightness
    targetL = Math.max(darkestL, Math.min(lightestL, targetL));
    
    // Keep original hue and slightly reduce saturation for very light/dark variants
    let targetS = baseS;
    if (level <= 100 || level >= 700) {
        targetS = Math.max(0, baseS - 2);
    }
    
    return [baseH, targetS, Math.round(targetL)];
}

/**
 * Calculate HSL for non-neutral colors using piecewise linear interpolation
 * @param {Array} hsl400 - Base HSL color [h, s, l]
 * @param {number} level - Target level
 * @returns {Array} Calculated HSL color [h, s, l]
 */
function calculateNonNeutralHSL(hsl400, level) {
    const [baseH, baseS, baseL] = hsl400;
    
    // Calculate dynamic boundaries based on base color
    const boundaries = calculateDynamicBoundaries(hsl400);
    
    let targetH = baseH;
    let targetS = baseS;
    let targetL = baseL;
    
    if (level < 400) {
        // Lighter variants
        const factor = (400 - level) / 350; // Normalize to 0-1
        
        // Interpolate lightness (increase)
        targetL = baseL + (boundaries.lightestL - baseL) * factor;
        
        // Interpolate saturation (slightly decrease)
        targetS = baseS + (boundaries.lightestS - baseS) * factor;
        
        // Optional: slight hue shift for very light variants
        if (level <= 100) {
            targetH = (baseH + boundaries.lightHueShift) % 360;
        }
        
    } else {
        // Darker variants
        const factor = (level - 400) / 400; // Normalize to 0-1
        
        // Interpolate lightness (decrease)
        targetL = baseL + (boundaries.darkestL - baseL) * factor;
        
        // Interpolate saturation (increase for richer darks)
        targetS = baseS + (boundaries.darkestS - baseS) * factor;
        
        // Optional: slight hue shift for very dark variants
        if (level >= 700) {
            targetH = (baseH + boundaries.darkHueShift) % 360;
        }
    }
    
    // Apply level-specific adjustments
    const adjustments = getLevelAdjustments(level);
    targetL += adjustments.lightnessAdjustment;
    targetS += adjustments.saturationAdjustment;
    
    return clampHSL([targetH, targetS, targetL]);
}

/**
 * Calculate dynamic boundaries based on base color characteristics
 * @param {Array} hsl400 - Base HSL color [h, s, l]
 * @returns {Object} Boundary values for interpolation
 */
function calculateDynamicBoundaries(hsl400) {
    const [baseH, baseS, baseL] = hsl400;
    
    // Base boundaries
    let lightestL = Math.min(94, baseL + 44);
    let lightestS = Math.max(0, baseS - 1);
    let darkestL = Math.max(24, baseL - 26);
    let darkestS = Math.min(100, baseS + 28);
    
    // Adjust boundaries based on base color characteristics
    if (baseL > 80) {
        // Very light base colors
        lightestL = Math.min(96, baseL + 16);
        darkestL = Math.max(20, baseL - 35);
    } else if (baseL < 30) {
        // Very dark base colors
        lightestL = Math.min(92, baseL + 55);
        darkestL = Math.max(15, baseL - 15);
    }
    
    if (baseS > 80) {
        // Very saturated base colors
        lightestS = Math.max(0, baseS - 15);
        darkestS = Math.min(100, baseS + 10);
    } else if (baseS < 30) {
        // Low saturation base colors
        lightestS = Math.max(0, baseS - 5);
        darkestS = Math.min(100, baseS + 35);
    }
    
    // Hue shifts for extreme variants (optional)
    const lightHueShift = 0; // No hue shift for light variants
    const darkHueShift = 0;  // No hue shift for dark variants
    
    return {
        lightestL,
        lightestS,
        darkestL,
        darkestS,
        lightHueShift,
        darkHueShift
    };
}

/**
 * Get level-specific micro-adjustments
 * @param {number} level - Color level
 * @returns {Object} Adjustment values
 */
function getLevelAdjustments(level) {
    const adjustments = {
        lightnessAdjustment: 0,
        saturationAdjustment: 0
    };
    
    // Fine-tune specific levels for better visual progression
    switch (level) {
        case 50:
            adjustments.lightnessAdjustment = 2;
            break;
        case 100:
            adjustments.lightnessAdjustment = 1;
            break;
        case 200:
            adjustments.saturationAdjustment = -1;
            break;
        case 600:
            adjustments.saturationAdjustment = 2;
            break;
        case 700:
            adjustments.saturationAdjustment = 3;
            break;
        case 800:
            adjustments.lightnessAdjustment = -2;
            adjustments.saturationAdjustment = 5;
            break;
    }
    
    return adjustments;
}

/**
 * Generate CSS variables string from color scale
 * @param {Array} colorScale - Array of color objects
 * @param {string} colorName - Base name for CSS variables
 * @returns {string} CSS variables string
 */
function generateCSSVariables(colorScale, colorName = 'primary') {
    const cssLines = [':root {'];
    
    colorScale.forEach(color => {
        const variableName = `--${colorName}-${color.level}`;
        cssLines.push(`  ${variableName}: ${color.hex};`);
    });
    
    cssLines.push('}');
    return cssLines.join('\n');
}

/**
 * Generate SCSS variables string from color scale
 * @param {Array} colorScale - Array of color objects
 * @param {string} colorName - Base name for SCSS variables
 * @returns {string} SCSS variables string
 */
function generateSCSSVariables(colorScale, colorName = 'primary') {
    const scssLines = [];
    
    colorScale.forEach(color => {
        const variableName = `$${colorName}-${color.level}`;
        scssLines.push(`${variableName}: ${color.hex};`);
    });
    
    return scssLines.join('\n');
}

/**
 * Generate Tailwind CSS configuration from color scale
 * @param {Array} colorScale - Array of color objects
 * @param {string} colorName - Color name for Tailwind config
 * @returns {string} Tailwind configuration string
 */
function generateTailwindConfig(colorScale, colorName = 'primary') {
    const config = {
        theme: {
            extend: {
                colors: {
                    [colorName]: {}
                }
            }
        }
    };
    
    colorScale.forEach(color => {
        config.theme.extend.colors[colorName][color.level] = color.hex;
    });
    
    return JSON.stringify(config, null, 2);
}

/**
 * Generate JavaScript object from color scale
 * @param {Array} colorScale - Array of color objects
 * @param {string} colorName - Object name
 * @returns {string} JavaScript object string
 */
function generateJSObject(colorScale, colorName = 'primary') {
    const colorObj = {};
    
    colorScale.forEach(color => {
        colorObj[color.level] = color.hex;
    });
    
    return `const ${colorName} = ${JSON.stringify(colorObj, null, 2)};`;
}

/**
 * Generate JSON from color scale
 * @param {Array} colorScale - Array of color objects
 * @param {string} colorName - Color name
 * @returns {string} JSON string
 */
function generateJSON(colorScale, colorName = 'primary') {
    const jsonObj = {
        name: colorName,
        metadata: {
            generatedBy: 'Color Scale Generator',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        },
        colors: {}
    };
    
    colorScale.forEach(color => {
        jsonObj.colors[color.level] = {
            hex: color.hex,
            rgb: color.rgb,
            hsl: color.hsl,
            accessibility: {
                blackContrast: color.blackRatio,
                whiteContrast: color.whiteRatio,
                wcagAANormal: color.blackPassesNormal || color.whitePassesNormal,
                wcagAALarge: color.blackPassesLarge || color.whitePassesLarge
            }
        };
    });
    
    return JSON.stringify(jsonObj, null, 2);
}

/**
 * Generate Figma Design Tokens from color scale
 * @param {Array} colorScale - Array of color objects
 * @param {string} colorName - Color name
 * @returns {string} Figma tokens JSON string
 */
function generateFigmaTokens(colorScale, colorName = 'primary') {
    const tokens = {
        [`${colorName}`]: {
            type: 'color',
            description: `${colorName} color scale generated with accessibility validation`
        }
    };
    
    colorScale.forEach(color => {
        tokens[`${colorName}`][`${color.level}`] = {
            value: color.hex,
            type: 'color',
            description: `${colorName} ${color.level} - ${color.name || 'Color variant'}`,
            accessibility: {
                blackContrast: color.blackRatio,
                whiteContrast: color.whiteRatio,
                wcagAA: color.blackPassesNormal || color.whitePassesNormal
            }
        };
    });
    
    return JSON.stringify({ tokens }, null, 2);
}

/**
 * Generate Adobe ASE color swatches data
 * @param {Array} colorScale - Array of color objects
 * @param {string} colorName - Color name
 * @returns {string} ASE-compatible data string
 */
function generateAdobeASE(colorScale, colorName = 'primary') {
    const aseData = {
        version: '1.0',
        colors: colorScale.map(color => ({
            name: `${colorName}-${color.level}`,
            color: {
                mode: 'RGB',
                values: color.rgb.map(v => v / 255) // Normalize to 0-1
            },
            type: 'spot'
        }))
    };
    
    return JSON.stringify(aseData, null, 2);
}

/**
 * Generate Sketch Palette format
 * @param {Array} colorScale - Array of color objects
 * @param {string} colorName - Color name
 * @returns {string} Sketch palette JSON string
 */
function generateSketchPalette(colorScale, colorName = 'primary') {
    const palette = {
        compatibleVersion: '2.0',
        pluginVersion: '2.22',
        colors: colorScale.map(color => ({
            name: `${colorName} ${color.level}`,
            red: color.rgb[0] / 255,
            green: color.rgb[1] / 255,
            blue: color.rgb[2] / 255,
            alpha: 1
        }))
    };
    
    return JSON.stringify(palette, null, 2);
}

/**
 * Generate Swift Color Extension
 * @param {Array} colorScale - Array of color objects
 * @param {string} colorName - Color name
 * @returns {string} Swift code string
 */
function generateSwiftColors(colorScale, colorName = 'primary') {
    const swiftName = colorName.charAt(0).toUpperCase() + colorName.slice(1);
    
    let swiftCode = `//
// ${swiftName} Color Scale
// Generated by Color Scale Generator
//

import UIKit

extension UIColor {
    
    // MARK: - ${swiftName} Colors
    
`;
    
    colorScale.forEach(color => {
        const methodName = `${colorName}${color.level}`;
        const [r, g, b] = color.rgb;
        
        swiftCode += `    static var ${methodName}: UIColor {
        return UIColor(red: ${(r/255).toFixed(3)}, green: ${(g/255).toFixed(3)}, blue: ${(b/255).toFixed(3)}, alpha: 1.0)
    }
    
`;
    });
    
    swiftCode += `}

// MARK: - ${swiftName} Color Hex Values
extension UIColor {
    
`;
    
    colorScale.forEach(color => {
        const constantName = `${colorName.toUpperCase()}_${color.level}`;
        swiftCode += `    static let ${constantName}_HEX = "${color.hex}"
`;
    });
    
    swiftCode += `}`;
    
    return swiftCode;
}

/**
 * Generate Android Colors XML
 * @param {Array} colorScale - Array of color objects
 * @param {string} colorName - Color name
 * @returns {string} Android XML string
 */
function generateAndroidColors(colorScale, colorName = 'primary') {
    let xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<!--
    ${colorName} Color Scale
    Generated by Color Scale Generator
    WCAG AA compliant colors
-->
<resources>
    
    <!-- ${colorName} Color Scale -->
`;
    
    colorScale.forEach(color => {
        const resourceName = `${colorName}_${color.level}`;
        xmlContent += `    <color name="${resourceName}">${color.hex}</color>\n`;
    });
    
    xmlContent += `
    <!-- ${colorName} Color Scale with Alpha -->
`;
    
    colorScale.forEach(color => {
        const resourceName = `${colorName}_${color.level}`;
        // Add some alpha variants
        xmlContent += `    <color name="${resourceName}_90">${color.hex}E6</color> <!-- 90% opacity -->
    <color name="${resourceName}_75">${color.hex}BF</color> <!-- 75% opacity -->
    <color name="${resourceName}_50">${color.hex}80</color> <!-- 50% opacity -->
    <color name="${resourceName}_25">${color.hex}40</color> <!-- 25% opacity -->
    <color name="${resourceName}_10">${color.hex}1A</color> <!-- 10% opacity -->
`;
    });
    
    xmlContent += `
</resources>`;
    
    return xmlContent;
}

/**
 * Validate color scale for visual consistency
 * @param {Array} colorScale - Array of color objects
 * @returns {Object} Validation results
 */
function validateColorScale(colorScale) {
    const results = {
        isValid: true,
        warnings: [],
        suggestions: []
    };
    
    // Check for proper lightness progression
    const lightnesses = colorScale.map(c => c.hsl[2]);
    for (let i = 1; i < lightnesses.length; i++) {
        if (lightnesses[i] >= lightnesses[i-1]) {
            results.warnings.push(`Lightness not decreasing properly between levels ${colorScale[i-1].level} and ${colorScale[i].level}`);
        }
    }
    
    // Check for accessibility issues
    const accessibilityValidation = validateColorScaleAccessibility(colorScale);
    if (!accessibilityValidation.overallAccessible) {
        results.warnings.push('Some colors may not meet accessibility requirements');
        results.suggestions.push('Consider generating an accessible alternative');
    }
    
    // Check for extreme saturation jumps
    const saturations = colorScale.map(c => c.hsl[1]);
    for (let i = 1; i < saturations.length; i++) {
        const satDiff = Math.abs(saturations[i] - saturations[i-1]);
        if (satDiff > 40) {
            results.warnings.push(`Large saturation jump between levels ${colorScale[i-1].level} and ${colorScale[i].level}`);
        }
    }
    
    results.isValid = results.warnings.length === 0;
    return results;
}

/**
 * Generate CSS variables with dark mode support
 * @param {Array} lightScale - Light mode color scale
 * @param {Array} darkScale - Dark mode color scale
 * @param {string} colorName - Base name for CSS variables
 * @returns {string} CSS variables string with dark mode
 */
function generateCSSVariablesWithDarkMode(lightScale, darkScale, colorName = 'primary') {
    const cssLines = [':root {'];
    
    // Light mode variables
    lightScale.forEach(color => {
        const variableName = `--${colorName}-${color.level}`;
        cssLines.push(`  ${variableName}: ${color.hex};`);
    });
    
    cssLines.push('}');
    cssLines.push('');
    cssLines.push('/* Dark mode variables */');
    cssLines.push('[data-theme="dark"] {');
    
    // Dark mode variables
    darkScale.forEach(color => {
        const variableName = `--${colorName}-${color.level}`;
        cssLines.push(`  ${variableName}: ${color.hex};`);
    });
    
    cssLines.push('}');
    return cssLines.join('\n');
}

/**
 * Generate SCSS variables with dark mode support
 * @param {Array} lightScale - Light mode color scale
 * @param {Array} darkScale - Dark mode color scale
 * @param {string} colorName - Base name for SCSS variables
 * @returns {string} SCSS variables string with dark mode
 */
function generateSCSSVariablesWithDarkMode(lightScale, darkScale, colorName = 'primary') {
    const scssLines = ['// Light mode colors'];
    
    // Light mode variables
    lightScale.forEach(color => {
        const variableName = `$${colorName}-${color.level}`;
        scssLines.push(`${variableName}: ${color.hex};`);
    });
    
    scssLines.push('');
    scssLines.push('// Dark mode colors');
    
    // Dark mode variables
    darkScale.forEach(color => {
        const variableName = `$${colorName}-${color.level}-dark`;
        scssLines.push(`${variableName}: ${color.hex};`);
    });
    
    return scssLines.join('\n');
}

/**
 * Generate JSON with dark mode support
 * @param {Array} lightScale - Light mode color scale
 * @param {Array} darkScale - Dark mode color scale
 * @param {string} colorName - Color name
 * @returns {string} JSON string with dark mode
 */
function generateJSONWithDarkMode(lightScale, darkScale, colorName = 'primary') {
    const jsonObj = {
        name: colorName,
        metadata: {
            generatedBy: 'Color Scale Generator',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            includesDarkMode: true
        },
        lightMode: {},
        darkMode: {}
    };
    
    // Light mode colors
    lightScale.forEach(color => {
        jsonObj.lightMode[color.level] = {
            hex: color.hex,
            rgb: color.rgb,
            hsl: color.hsl,
            accessibility: {
                blackContrast: color.blackRatio,
                whiteContrast: color.whiteRatio,
                wcagAANormal: color.blackPassesNormal || color.whitePassesNormal,
                wcagAALarge: color.blackPassesLarge || color.whitePassesLarge
            }
        };
    });
    
    // Dark mode colors
    darkScale.forEach(color => {
        jsonObj.darkMode[color.level] = {
            hex: color.hex,
            rgb: color.rgb,
            hsl: color.hsl,
            accessibility: {
                blackContrast: color.blackRatio,
                whiteContrast: color.whiteRatio,
                wcagAANormal: color.blackPassesNormal || color.whitePassesNormal,
                wcagAALarge: color.blackPassesLarge || color.whitePassesLarge
            }
        };
    });
    
    return JSON.stringify(jsonObj, null, 2);
}

/**
 * Generate JavaScript object with dark mode support
 * @param {Array} lightScale - Light mode color scale
 * @param {Array} darkScale - Dark mode color scale
 * @param {string} colorName - Object name
 * @returns {string} JavaScript object string with dark mode
 */
function generateJSObjectWithDarkMode(lightScale, darkScale, colorName = 'primary') {
    const lightObj = {};
    const darkObj = {};
    
    lightScale.forEach(color => {
        lightObj[color.level] = color.hex;
    });
    
    darkScale.forEach(color => {
        darkObj[color.level] = color.hex;
    });
    
    return `const ${colorName} = {
  light: ${JSON.stringify(lightObj, null, 2)},
  dark: ${JSON.stringify(darkObj, null, 2)}
};`;
}

/**
 * Generate Tailwind CSS configuration with dark mode support
 * @param {Array} lightScale - Light mode color scale
 * @param {Array} darkScale - Dark mode color scale
 * @param {string} colorName - Color name for Tailwind config
 * @returns {string} Tailwind configuration string with dark mode
 */
function generateTailwindConfigWithDarkMode(lightScale, darkScale, colorName = 'primary') {
    const config = {
        theme: {
            extend: {
                colors: {
                    [colorName]: {}
                }
            }
        }
    };
    
    // Light mode colors (default)
    lightScale.forEach(color => {
        config.theme.extend.colors[colorName][color.level] = {
            DEFAULT: color.hex,
            dark: darkScale.find(d => d.level === color.level)?.hex || color.hex
        };
    });
    
    return `// Tailwind CSS configuration with dark mode support
module.exports = ${JSON.stringify(config, null, 2)};

// Usage examples:
// Light mode: bg-${colorName}-400
// Dark mode: dark:bg-${colorName}-400 (will automatically use dark variant)`;
}

/**
 * Generate Figma Design Tokens with dark mode support
 * @param {Array} lightScale - Light mode color scale
 * @param {Array} darkScale - Dark mode color scale
 * @param {string} colorName - Color name
 * @returns {string} Figma tokens JSON string with dark mode
 */
function generateFigmaTokensWithDarkMode(lightScale, darkScale, colorName = 'primary') {
    const tokens = {
        [colorName]: {
            light: {
                type: 'color',
                description: `${colorName} color scale (light mode) with accessibility validation`
            },
            dark: {
                type: 'color',
                description: `${colorName} color scale (dark mode) with accessibility validation`
            }
        }
    };
    
    // Light mode tokens
    lightScale.forEach(color => {
        tokens[colorName].light[`${color.level}`] = {
            value: color.hex,
            type: 'color',
            description: `${colorName} ${color.level} light - ${color.name || 'Color variant'}`,
            accessibility: {
                blackContrast: color.blackRatio,
                whiteContrast: color.whiteRatio,
                wcagAA: color.blackPassesNormal || color.whitePassesNormal
            }
        };
    });
    
    // Dark mode tokens
    darkScale.forEach(color => {
        tokens[colorName].dark[`${color.level}`] = {
            value: color.hex,
            type: 'color',
            description: `${colorName} ${color.level} dark - ${color.name || 'Color variant'}`,
            accessibility: {
                blackContrast: color.blackRatio,
                whiteContrast: color.whiteRatio,
                wcagAA: color.blackPassesNormal || color.whitePassesNormal
            }
        };
    });
    
    return JSON.stringify({ tokens }, null, 2);
}

/**
 * Generate Adobe ASE with dark mode support
 * @param {Array} lightScale - Light mode color scale
 * @param {Array} darkScale - Dark mode color scale
 * @param {string} colorName - Color name
 * @returns {string} ASE-compatible data string with dark mode
 */
function generateAdobeASEWithDarkMode(lightScale, darkScale, colorName = 'primary') {
    const aseData = {
        version: '1.0',
        lightMode: {
            name: `${colorName} Light Mode`,
            colors: lightScale.map(color => ({
                name: `${colorName}-${color.level}-light`,
                color: {
                    mode: 'RGB',
                    values: color.rgb.map(v => v / 255)
                },
                type: 'spot'
            }))
        },
        darkMode: {
            name: `${colorName} Dark Mode`,
            colors: darkScale.map(color => ({
                name: `${colorName}-${color.level}-dark`,
                color: {
                    mode: 'RGB',
                    values: color.rgb.map(v => v / 255)
                },
                type: 'spot'
            }))
        }
    };
    
    return JSON.stringify(aseData, null, 2);
}

/**
 * Generate Sketch Palette with dark mode support
 * @param {Array} lightScale - Light mode color scale
 * @param {Array} darkScale - Dark mode color scale
 * @param {string} colorName - Color name
 * @returns {string} Sketch palette JSON string with dark mode
 */
function generateSketchPaletteWithDarkMode(lightScale, darkScale, colorName = 'primary') {
    const palette = {
        compatibleVersion: '2.0',
        pluginVersion: '2.22',
        colors: [
            // Light mode colors
            ...lightScale.map(color => ({
                name: `${colorName} ${color.level} Light`,
                red: color.rgb[0] / 255,
                green: color.rgb[1] / 255,
                blue: color.rgb[2] / 255,
                alpha: 1
            })),
            // Dark mode colors
            ...darkScale.map(color => ({
                name: `${colorName} ${color.level} Dark`,
                red: color.rgb[0] / 255,
                green: color.rgb[1] / 255,
                blue: color.rgb[2] / 255,
                alpha: 1
            }))
        ]
    };
    
    return JSON.stringify(palette, null, 2);
}

/**
 * Generate Swift Color Extension with dark mode support
 * @param {Array} lightScale - Light mode color scale
 * @param {Array} darkScale - Dark mode color scale
 * @param {string} colorName - Color name
 * @returns {string} Swift code string with dark mode
 */
function generateSwiftColorsWithDarkMode(lightScale, darkScale, colorName = 'primary') {
    const swiftName = colorName.charAt(0).toUpperCase() + colorName.slice(1);
    
    let swiftCode = `//
// ${swiftName} Color Scale with Dark Mode Support
// Generated by Color Scale Generator
//

import UIKit

extension UIColor {
    
    // MARK: - ${swiftName} Colors (Dynamic)
    
`;
    
    lightScale.forEach(color => {
        const darkColor = darkScale.find(d => d.level === color.level);
        const methodName = `${colorName}${color.level}`;
        const [lightR, lightG, lightB] = color.rgb;
        const [darkR, darkG, darkB] = darkColor ? darkColor.rgb : color.rgb;
        
        swiftCode += `    static var ${methodName}: UIColor {
        return UIColor { traitCollection in
            switch traitCollection.userInterfaceStyle {
            case .dark:
                return UIColor(red: ${(darkR/255).toFixed(3)}, green: ${(darkG/255).toFixed(3)}, blue: ${(darkB/255).toFixed(3)}, alpha: 1.0)
            default:
                return UIColor(red: ${(lightR/255).toFixed(3)}, green: ${(lightG/255).toFixed(3)}, blue: ${(lightB/255).toFixed(3)}, alpha: 1.0)
            }
        }
    }
    
`;
    });
    
    swiftCode += `}

// MARK: - ${swiftName} Color Hex Values
extension UIColor {
    
`;
    
    lightScale.forEach(color => {
        const darkColor = darkScale.find(d => d.level === color.level);
        const constantName = `${colorName.toUpperCase()}_${color.level}`;
        swiftCode += `    static let ${constantName}_LIGHT_HEX = "${color.hex}"
`;
        if (darkColor) {
            swiftCode += `    static let ${constantName}_DARK_HEX = "${darkColor.hex}"
`;
        }
    });
    
    swiftCode += `}`;
    
    return swiftCode;
}

/**
 * Generate Android Colors XML with dark mode support
 * @param {Array} lightScale - Light mode color scale
 * @param {Array} darkScale - Dark mode color scale
 * @param {string} colorName - Color name
 * @returns {string} Android XML string with dark mode
 */
function generateAndroidColorsWithDarkMode(lightScale, darkScale, colorName = 'primary') {
    let xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<!--
    ${colorName} Color Scale with Dark Mode Support
    Generated by Color Scale Generator
    WCAG AA compliant colors
-->

<!-- Light Mode Colors (res/values/colors.xml) -->
<resources>
    
    <!-- ${colorName} Color Scale - Light Mode -->
`;
    
    lightScale.forEach(color => {
        const resourceName = `${colorName}_${color.level}`;
        xmlContent += `    <color name="${resourceName}">${color.hex}</color>
`;
    });
    
    xmlContent += `
</resources>

<!-- Dark Mode Colors (res/values-night/colors.xml) -->
<resources>
    
    <!-- ${colorName} Color Scale - Dark Mode -->
`;
    
    darkScale.forEach(color => {
        const resourceName = `${colorName}_${color.level}`;
        xmlContent += `    <color name="${resourceName}">${color.hex}</color>
`;
    });
    
    xmlContent += `
    <!-- Alpha variants for light mode -->
`;
    
    lightScale.forEach(color => {
        const resourceName = `${colorName}_${color.level}`;
        xmlContent += `    <color name="${resourceName}_90">${color.hex}E6</color> <!-- 90% opacity -->
    <color name="${resourceName}_75">${color.hex}BF</color> <!-- 75% opacity -->
    <color name="${resourceName}_50">${color.hex}80</color> <!-- 50% opacity -->
    <color name="${resourceName}_25">${color.hex}40</color> <!-- 25% opacity -->
    <color name="${resourceName}_10">${color.hex}1A</color> <!-- 10% opacity -->
`;
    });
    
    xmlContent += `
</resources>

<!-- Usage: 
Light mode: @color/${colorName}_400
Dark mode: Same reference, Android will automatically use night variant
-->`;
    
    return xmlContent;
}