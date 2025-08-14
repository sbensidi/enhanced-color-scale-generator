/**
 * Scale Generator Module
 * Core color scale generation algorithms using piecewise linear interpolation
 * Handles both non-neutral and neutral color generation
 */

// Scale configuration presets
const SCALE_CONFIGURATIONS = {
    'triad': {
        name: 'Triad (3 levels)', 
        levels: [300, 400, 600],
        description: 'Light, base, and dark'
    },
    'pentatonic': {
        name: 'Pentatonic (5 levels)',
        levels: [200, 300, 400, 500, 600],
        description: 'Well-balanced range for most projects'
    },
    'diatonic': {
        name: 'Diatonic (7 levels)',
        levels: [100, 200, 300, 400, 500, 600, 700],
        description: 'Complete musical scale range'
    },
    'chromatic': {
        name: 'Chromatic (9 levels)',
        levels: [50, 100, 200, 300, 400, 500, 600, 700, 800],
        description: 'Full chromatic range for complex design systems'
    }
};

/**
 * Create enhanced color scale with advanced algorithms
 * @param {Array} baseHSL - Base HSL color [h, s, l]
 * @param {string} configuration - Scale configuration name
 * @param {Object} options - Enhanced options
 * @returns {Array} Enhanced color scale array
 */
function createEnhancedColorScale(baseHSL, configuration = 'diatonic', options = {}) {
    const {
        usePerceptualUniformity = true,
        interpolationMethod = 'lch',
        enableBezierInterpolation = false
    } = options;
    
    // First create the base scale using existing method
    let colorScale = createColorScale(baseHSL, configuration);
    
    // Apply enhanced algorithms if requested
    if (usePerceptualUniformity && interpolationMethod === 'lch') {
        colorScale = applyLCHInterpolation(colorScale, baseHSL, configuration);
    }
    
    if (enableBezierInterpolation) {
        colorScale = applyBezierInterpolation(colorScale, baseHSL, configuration);
    }
    
    // Add enhanced data to each color
    colorScale = colorScale.map((color, index) => {
        const enhancedColor = { ...color };
        
        // Add LCH values if using LCH interpolation
        if (interpolationMethod === 'lch') {
            enhancedColor.lch = rgbToLch(color.rgb);
        }
        
        // Calculate Delta E if we have adjacent colors
        if (index > 0 && interpolationMethod === 'lch') {
            const prevColor = colorScale[index - 1];
            if (prevColor.lch && enhancedColor.lch) {
                enhancedColor.deltaE = calculateDeltaE(prevColor.lch, enhancedColor.lch);
            }
        }
        
        // Add enhanced metadata
        enhancedColor.algorithm = 'enhanced';
        enhancedColor.interpolationMethod = interpolationMethod;
        enhancedColor.perceptualUniformity = usePerceptualUniformity;
        
        return enhancedColor;
    });
    
    return colorScale;
}

/**
 * Apply LCH-based interpolation for better perceptual uniformity
 * @param {Array} colorScale - Original color scale
 * @param {Array} baseHSL - Base HSL color
 * @param {string} configuration - Scale configuration
 * @returns {Array} LCH-enhanced color scale
 */
function applyLCHInterpolation(colorScale, baseHSL, configuration) {
    const config = SCALE_CONFIGURATIONS[configuration];
    if (!config) return colorScale;
    
    const baseLCH = rgbToLch(hslToRgb(baseHSL));
    const baseLevel = getBaseLevelForConfiguration(config.levels);
    
    return colorScale.map(color => {
        if (color.level === baseLevel) {
            // Keep the base color unchanged
            return color;
        }
        
        // Calculate target lightness using LCH space
        const lightnessFactor = (color.level - baseLevel) / 100;
        const targetL = Math.max(0, Math.min(100, baseLCH[0] - lightnessFactor * 15));
        
        // Adjust chroma for better saturation at different lightness levels
        let targetC = baseLCH[1];
        if (targetL < 50) {
            // Boost chroma in darker colors
            targetC = Math.min(132, targetC * (1 + (50 - targetL) * 0.01));
        } else if (targetL > 70) {
            // Reduce chroma in lighter colors to avoid fluorescent appearance
            targetC = targetC * (1 - (targetL - 70) * 0.008);
        }
        
        const targetLCH = [targetL, targetC, baseLCH[2]];
        const targetRGB = lchToRgb(targetLCH);
        const targetHSL = rgbToHSL(targetRGB);
        const targetHex = rgbToHex(targetRGB);
        
        // Get accessibility info
        const contrastInfo = getContrastInfo(targetRGB);
        
        return {
            ...color,
            hsl: targetHSL,
            rgb: targetRGB,
            hex: targetHex,
            blackPassesNormal: contrastInfo.black.passesNormal,
            blackPassesLarge: contrastInfo.black.passesLarge,
            blackRatio: contrastInfo.black.ratio,
            whitePassesNormal: contrastInfo.white.passesNormal,
            whitePassesLarge: contrastInfo.white.passesLarge,
            whiteRatio: contrastInfo.white.ratio,
            preferredTextColor: contrastInfo.preferredText,
            lch: targetLCH
        };
    });
}


/**
 * Apply Bezier curve interpolation for smoother transitions
 * @param {Array} colorScale - Color scale to enhance
 * @param {Array} baseHSL - Base HSL color
 * @param {string} configuration - Scale configuration
 * @returns {Array} Bezier-enhanced color scale
 */
function applyBezierInterpolation(colorScale, baseHSL, configuration) {
    // For Bezier interpolation, we create smoother transitions between colors
    // by using cubic Bezier curves instead of linear interpolation
    const config = SCALE_CONFIGURATIONS[configuration];
    if (!config || config.levels.length < 3) return colorScale;
    
    const baseLevel = getBaseLevelForConfiguration(config.levels);
    const baseIndex = colorScale.findIndex(color => color.level === baseLevel);
    
    return colorScale.map((color, index) => {
        if (color.level === baseLevel) return color; // Keep base unchanged
        
        // Calculate Bezier curve position
        const t = (index - baseIndex) / (colorScale.length - 1 - baseIndex);
        const bezierT = bezierEasing(Math.abs(t));
        
        // Apply smooth curve to saturation and lightness
        const [h, s, l] = color.hsl;
        const [baseH, baseS, baseL] = baseHSL;
        
        const smoothS = baseS + (s - baseS) * bezierT;
        const smoothL = baseL + (l - baseL) * bezierT;
        
        const smoothHSL = [h, smoothS, smoothL];
        const smoothRGB = hslToRgb(smoothHSL);
        const smoothHex = hslToHex(smoothHSL);
        const contrastInfo = getContrastInfo(smoothRGB);
        
        return {
            ...color,
            hsl: smoothHSL,
            rgb: smoothRGB,
            hex: smoothHex,
            blackPassesNormal: contrastInfo.black.passesNormal,
            blackPassesLarge: contrastInfo.black.passesLarge,
            blackRatio: contrastInfo.black.ratio,
            whitePassesNormal: contrastInfo.white.passesNormal,
            whitePassesLarge: contrastInfo.white.passesLarge,
            whiteRatio: contrastInfo.white.ratio,
            preferredTextColor: contrastInfo.preferredText
        };
    });
}

/**
 * Bezier easing function for smooth curves
 * @param {number} t - Input value (0-1)
 * @returns {number} Eased value
 */
function bezierEasing(t) {
    // Using ease-in-out curve
    return t * t * (3 - 2 * t);
}

/**
 * Calculate quality metrics for a color scale
 * @param {Array} colorScale - Color scale to analyze
 * @param {Array} baseHSL - Original base HSL color
 * @returns {Object} Quality metrics
 */
function calculateQualityMetrics(colorScale, baseHSL) {
    let perceptualUniformity = 0;
    let colorHarmony = 0;
    let smoothness = 0;
    
    if (!colorScale || colorScale.length === 0) {
        return {
            perceptualUniformity: 0,
            colorHarmony: 0,
            smoothness: 0,
            overallScore: 0,
            algorithm: 'none'
        };
    }
    
    // Calculate perceptual uniformity (based on LCH Delta E if available)
    if (colorScale.length > 1) {
        let deltaESum = 0;
        let deltaECount = 0;
        
        for (let i = 1; i < colorScale.length; i++) {
            const color = colorScale[i];
            const prevColor = colorScale[i - 1];
            
            if (color.lch && prevColor.lch) {
                const deltaE = calculateDeltaE(prevColor.lch, color.lch);
                deltaESum += Math.abs(deltaE - 10); // Target Delta E of ~10 for good steps
                deltaECount++;
            }
        }
        
        if (deltaECount > 0) {
            const avgDeltaDiff = deltaESum / deltaECount;
            perceptualUniformity = Math.max(0, 1 - (avgDeltaDiff / 20)); // Normalize to 0-1
        } else {
            // Fallback to lightness uniformity
            const lightnessSteps = [];
            for (let i = 1; i < colorScale.length; i++) {
                lightnessSteps.push(Math.abs(colorScale[i].hsl[2] - colorScale[i-1].hsl[2]));
            }
            const avgStep = lightnessSteps.reduce((sum, step) => sum + step, 0) / lightnessSteps.length;
            const stepVariance = lightnessSteps.reduce((sum, step) => sum + Math.pow(step - avgStep, 2), 0) / lightnessSteps.length;
            perceptualUniformity = Math.max(0, 1 - (stepVariance / 100));
        }
    }
    
    // Calculate color harmony (how well colors work together)
    const baseHue = baseHSL[0];
    let harmonySum = 0;
    colorScale.forEach(color => {
        const hue = color.hsl[0];
        const hueDiff = Math.abs(hue - baseHue);
        const normalizedHueDiff = Math.min(hueDiff, 360 - hueDiff);
        // Reward complementary, triadic, and analogous relationships
        const harmonyScore = 1 - Math.min(normalizedHueDiff / 180, 1);
        harmonySum += harmonyScore;
    });
    colorHarmony = harmonySum / colorScale.length;
    
    // Calculate smoothness (gradual transitions)
    if (colorScale.length > 2) {
        let smoothnessSum = 0;
        for (let i = 1; i < colorScale.length - 1; i++) {
            const prev = colorScale[i - 1];
            const curr = colorScale[i];
            const next = colorScale[i + 1];
            
            // Check if current color is between its neighbors
            const prevLightness = prev.hsl[2];
            const currLightness = curr.hsl[2];
            const nextLightness = next.hsl[2];
            
            const expectedLightness = (prevLightness + nextLightness) / 2;
            const lightnessDiff = Math.abs(currLightness - expectedLightness);
            smoothnessSum += Math.max(0, 1 - (lightnessDiff / 25));
        }
        smoothness = smoothnessSum / (colorScale.length - 2);
    }
    
    // Calculate overall score with updated weights
    const overallScore = (
        perceptualUniformity * 0.4 +
        colorHarmony * 0.35 +
        smoothness * 0.25
    );
    
    return {
        perceptualUniformity: Math.max(0, Math.min(1, perceptualUniformity)),
        colorHarmony: Math.max(0, Math.min(1, colorHarmony)),
        smoothness: Math.max(0, Math.min(1, smoothness)),
        overallScore: Math.max(0, Math.min(1, overallScore)),
        algorithm: colorScale[0]?.algorithm || 'standard'
    };
}

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
function createColorScale(baseHSL, configuration = 'diatonic') {
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
function generateJSON(colorScale, colorName = 'primary', options = {}) {
    const jsonObj = {
        name: colorName,
        metadata: {
            generatedBy: 'Color Scale Generator',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            algorithm: options.algorithm || 'standard',
            interpolationMethod: options.interpolationMethod || 'hsl',
            enhancedFeatures: {
                perceptualUniformity: options.usePerceptualUniformity || false,
                bezierInterpolation: options.enableBezierInterpolation || false
            }
        },
        qualityMetrics: options.qualityMetrics || null,
        colors: {}
    };
    
    colorScale.forEach(color => {
        const colorObj = {
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
        
        // Add enhanced algorithm data if available
        if (color.lch) {
            colorObj.lch = color.lch;
        }
        if (color.deltaE) {
            colorObj.deltaE = color.deltaE;
        }
        if (color.perceptualUniformity) {
            colorObj.perceptualUniformity = color.perceptualUniformity;
        }
        if (color.colorHarmony) {
            colorObj.colorHarmony = color.colorHarmony;
        }
        
        jsonObj.colors[color.level] = colorObj;
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
 * Generate CSS variables string with dark mode and original scale
 * @param {Array} lightScale - Light mode color scale (accessible)
 * @param {Array} darkScale - Dark mode color scale
 * @param {Array} originalScale - Original non-accessible scale
 * @param {string} colorName - Base name for CSS variables
 * @returns {string} CSS variables string with all scales
 */
function generateCSSVariablesWithOriginal(lightScale, darkScale, originalScale, colorName = 'primary') {
    const cssLines = [':root {'];
    
    cssLines.push('  /* Original Scale (Non-Accessible) */');
    
    // Original scale variables (first)
    originalScale.forEach(color => {
        const variableName = `--${colorName}-${color.level}-original`;
        cssLines.push(`  ${variableName}: ${color.hex};`);
    });
    
    cssLines.push('');
    cssLines.push('  /* Accessible Scale */');
    
    // Light mode variables (accessible)
    lightScale.forEach(color => {
        const variableName = `--${colorName}-${color.level}`;
        cssLines.push(`  ${variableName}: ${color.hex};`);
    });
    
    cssLines.push('}');
    
    if (darkScale) {
        cssLines.push('');
        cssLines.push('/* Dark mode variables */');
        cssLines.push('[data-theme="dark"] {');
        
        // Dark mode variables
        darkScale.forEach(color => {
            const variableName = `--${colorName}-${color.level}`;
            cssLines.push(`  ${variableName}: ${color.hex};`);
        });
        
        cssLines.push('}');
    }
    
    return cssLines.join('\n');
}

/**
 * Generate SCSS variables with original scale included
 * @param {Array} lightScale - Light mode color scale (accessible)
 * @param {Array} darkScale - Dark mode color scale
 * @param {Array} originalScale - Original non-accessible scale
 * @param {string} colorName - Base name for SCSS variables
 * @returns {string} SCSS variables string with all scales
 */
function generateSCSSVariablesWithOriginal(lightScale, darkScale, originalScale, colorName = 'primary') {
    const scssLines = ['// Original scale (non-accessible)'];
    
    // Original scale variables (first)
    originalScale.forEach(color => {
        const variableName = `$${colorName}-${color.level}-original`;
        scssLines.push(`${variableName}: ${color.hex};`);
    });
    
    scssLines.push('');
    scssLines.push('// Accessible colors');
    
    // Accessible light mode variables
    lightScale.forEach(color => {
        const variableName = `$${colorName}-${color.level}`;
        scssLines.push(`${variableName}: ${color.hex};`);
    });
    
    if (darkScale) {
        scssLines.push('');
        scssLines.push('// Dark mode colors');
        
        // Dark mode variables
        darkScale.forEach(color => {
            const variableName = `$${colorName}-${color.level}-dark`;
            scssLines.push(`${variableName}: ${color.hex};`);
        });
    }
    
    return scssLines.join('\n');
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
function generateJSONWithDarkMode(lightScale, darkScale, colorName = 'primary', options = {}) {
    const jsonObj = {
        name: colorName,
        metadata: {
            generatedBy: 'Color Scale Generator',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            includesDarkMode: true,
            algorithm: options.algorithm || 'standard',
            interpolationMethod: options.interpolationMethod || 'hsl',
            enhancedFeatures: {
                perceptualUniformity: options.usePerceptualUniformity || false,
                bezierInterpolation: options.enableBezierInterpolation || false
            }
        },
        qualityMetrics: options.qualityMetrics || null,
        lightMode: {},
        darkMode: {}
    };
    
    // Helper function to process color data
    const processColor = (color) => {
        const colorObj = {
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
        
        // Add enhanced algorithm data if available
        if (color.lch) colorObj.lch = color.lch;
        if (color.deltaE) colorObj.deltaE = color.deltaE;
        if (color.perceptualUniformity) colorObj.perceptualUniformity = color.perceptualUniformity;
        if (color.colorHarmony) colorObj.colorHarmony = color.colorHarmony;
        
        return colorObj;
    };
    
    // Light mode colors
    lightScale.forEach(color => {
        jsonObj.lightMode[color.level] = processColor(color);
    });
    
    // Dark mode colors
    darkScale.forEach(color => {
        jsonObj.darkMode[color.level] = processColor(color);
    });
    
    return JSON.stringify(jsonObj, null, 2);
}

/**
 * Generate JSON with original scale included
 * @param {Array} lightScale - Light mode color scale (accessible)
 * @param {Array} darkScale - Dark mode color scale
 * @param {Array} originalScale - Original non-accessible scale
 * @param {string} colorName - Color name
 * @param {Object} options - Generation options
 * @returns {string} JSON string with all scales
 */
function generateJSONWithOriginal(lightScale, darkScale, originalScale, colorName = 'primary', options = {}) {
    const jsonObj = {
        name: colorName,
        metadata: {
            generatedBy: 'Color Scale Generator',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            includesDarkMode: !!darkScale,
            includesOriginalScale: true,
            algorithm: options.algorithm || 'standard',
            interpolationMethod: options.interpolationMethod || 'hsl',
            enhancedFeatures: {
                perceptualUniformity: options.usePerceptualUniformity || false,
                bezierInterpolation: options.enableBezierInterpolation || false
            }
        },
        qualityMetrics: options.qualityMetrics || null,
        originalScale: {},
        accessibleScale: {}
    };
    
    if (darkScale) {
        jsonObj.darkMode = {};
    }
    
    // Helper function to process color data
    const processColor = (color) => ({
        hex: color.hex,
        rgb: color.rgb,
        hsl: color.hsl,
        accessibility: {
            blackContrast: color.blackRatio,
            whiteContrast: color.whiteRatio,
            wcagAANormal: color.blackPassesNormal || color.whitePassesNormal,
            wcagAALarge: color.blackPassesLarge || color.whitePassesLarge
        }
    });
    
    // Original scale colors (non-accessible) - first
    originalScale.forEach(color => {
        jsonObj.originalScale[color.level] = processColor(color);
    });
    
    // Accessible light mode colors
    lightScale.forEach(color => {
        jsonObj.accessibleScale[color.level] = processColor(color);
    });
    
    // Dark mode colors (if provided)
    if (darkScale) {
        darkScale.forEach(color => {
            jsonObj.darkMode[color.level] = processColor(color);
        });
    }
    
    return JSON.stringify(jsonObj, null, 2);
}

/**
 * Generate Enhanced Analytics JSON with comprehensive data
 * @param {Array} lightScale - Light mode color scale
 * @param {Array} darkScale - Dark mode color scale
 * @param {string} colorName - Color name
 * @param {Object} options - Enhanced options
 * @returns {string} Enhanced analytics JSON string
 */
function generateEnhancedAnalytics(lightScale, darkScale, colorName = 'primary', options = {}) {
    const currentTime = new Date();
    
    const analyticsObj = {
        $schema: "https://colorscale.shaharben.com/schema/enhanced-analytics-v1.json",
        name: colorName,
        metadata: {
            generatedBy: 'Color Scale Generator',
            version: '1.0.0',
            timestamp: currentTime.toISOString(),
            generator: {
                algorithm: options.algorithm || 'enhanced',
                interpolationMethod: options.interpolationMethod || 'lch',
                enhancedFeatures: {
                    perceptualUniformity: options.usePerceptualUniformity || false,
                    bezierInterpolation: options.enableBezierInterpolation || false,
                    lchColorSpace: options.interpolationMethod === 'lch',
                    deltaECalculation: true
                },
                performance: {
                    generationTime: options.generationTime || 0,
                    memoryUsage: options.memoryUsage || 0
                }
            }
        },
        qualityMetrics: options.qualityMetrics || {
            perceptualUniformity: null,
            accessibilityScore: null,
            colorHarmony: null,
            smoothness: null,
            overallScore: null
        },
        analysis: {
            totalColors: lightScale.length,
            accessiblePairs: 0,
            contrastRatioRange: { min: 21, max: 1 },
            lightnessDistribution: {},
            saturationDistribution: {},
            hueDistribution: {},
            recommendations: []
        },
        lightMode: {},
        darkMode: {}
    };

    // Helper function to analyze and process color data
    const processColorScale = (scale, mode) => {
        const result = {};
        let accessibleCount = 0;
        
        scale.forEach((color, index) => {
            const colorData = {
                level: color.level,
                hex: color.hex,
                rgb: color.rgb,
                hsl: color.hsl,
                accessibility: {
                    blackContrast: color.blackRatio,
                    whiteContrast: color.whiteRatio,
                    wcagAANormal: color.blackPassesNormal || color.whitePassesNormal,
                    wcagAALarge: color.blackPassesLarge || color.whitePassesLarge,
                    wcagAAANormal: (color.blackRatio >= 7) || (color.whiteRatio >= 7),
                    preferredTextColor: color.preferredTextColor
                },
                position: {
                    index: index,
                    isBase: color.level === 400,
                    isExtreme: color.level === 50 || color.level === 900
                }
            };
            
            // Add enhanced algorithm data
            if (color.lch) colorData.lch = color.lch;
            if (color.deltaE) colorData.deltaE = color.deltaE;
            if (color.perceptualUniformity) colorData.perceptualUniformity = color.perceptualUniformity;
            if (color.colorHarmony) colorData.colorHarmony = color.colorHarmony;
            
            // Update analytics
            if (colorData.accessibility.wcagAANormal) accessibleCount++;
            analyticsObj.analysis.contrastRatioRange.min = Math.min(analyticsObj.analysis.contrastRatioRange.min, Math.min(color.blackRatio, color.whiteRatio));
            analyticsObj.analysis.contrastRatioRange.max = Math.max(analyticsObj.analysis.contrastRatioRange.max, Math.max(color.blackRatio, color.whiteRatio));
            
            result[color.level] = colorData;
        });
        
        if (mode === 'light') {
            analyticsObj.analysis.accessiblePairs = accessibleCount;
        }
        
        return result;
    };
    
    // Process both scales
    analyticsObj.lightMode = processColorScale(lightScale, 'light');
    if (darkScale && darkScale.length > 0) {
        analyticsObj.darkMode = processColorScale(darkScale, 'dark');
    }
    
    // Generate recommendations based on analysis
    const recommendations = [];
    if (analyticsObj.analysis.accessiblePairs < lightScale.length * 0.7) {
        recommendations.push({
            type: 'accessibility',
            severity: 'warning',
            message: 'Consider enabling accessibility optimization for better contrast ratios'
        });
    }
    
    if (options.qualityMetrics && options.qualityMetrics.perceptualUniformity < 0.6) {
        recommendations.push({
            type: 'perceptual',
            severity: 'info',
            message: 'Enable perceptual uniformity for more visually consistent color progression'
        });
    }
    
    if (!options.usePerceptualUniformity && options.interpolationMethod === 'hsl') {
        recommendations.push({
            type: 'algorithm',
            severity: 'info',
            message: 'Consider using LCH interpolation for better perceptual uniformity'
        });
    }
    
    analyticsObj.analysis.recommendations = recommendations;
    
    return JSON.stringify(analyticsObj, null, 2);
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
 * Generate JavaScript object with original scale included
 * @param {Array} lightScale - Light mode color scale (accessible)
 * @param {Array} darkScale - Dark mode color scale
 * @param {Array} originalScale - Original non-accessible scale
 * @param {string} colorName - Object name
 * @returns {string} JavaScript object string with all scales
 */
function generateJSObjectWithOriginal(lightScale, darkScale, originalScale, colorName = 'primary') {
    const accessibleObj = {};
    const originalObj = {};
    const darkObj = darkScale ? {} : null;
    
    // Original scale (first)
    originalScale.forEach(color => {
        originalObj[color.level] = color.hex;
    });
    
    // Accessible scale
    lightScale.forEach(color => {
        accessibleObj[color.level] = color.hex;
    });
    
    if (darkScale) {
        darkScale.forEach(color => {
            darkObj[color.level] = color.hex;
        });
    }
    
    let objectContent = `  original: ${JSON.stringify(originalObj, null, 2)},
  accessible: ${JSON.stringify(accessibleObj, null, 2)}`;
    
    if (darkScale) {
        objectContent += `,
  dark: ${JSON.stringify(darkObj, null, 2)}`;
    }
    
    return `const ${colorName} = {
${objectContent}
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