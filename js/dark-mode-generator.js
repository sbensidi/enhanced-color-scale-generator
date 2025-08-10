/**
 * Dark Mode Generator Module
 * Creates dark mode variants using intelligent level mapping
 * Strategy: Reverses lightness levels with 400 staying constant
 */

/**
 * Generate dark mode color scale from light mode scale
 * @param {Array} lightModeScale - Light mode color scale array
 * @param {Array} baseHSL - Original base HSL color
 * @param {Object} options - Generation options
 * @returns {Array} Dark mode color scale array
 */
function generateDarkModeScale(lightModeScale, baseHSL, options = {}) {
    const {
        useAccessibleBase = false,
        accessibleBaseHSL = null,
        saturationBoost = 5,
        contrastAdjustment = 0.1
    } = options;
    
    // Determine which base color to use for dark mode
    const darkModeBaseHSL = useAccessibleBase && accessibleBaseHSL 
        ? accessibleBaseHSL 
        : baseHSL;
    
    // Create level mapping for dark mode
    const levelMapping = createDarkModeLevelMapping(lightModeScale);
    
    // Generate dark mode colors
    const darkModeScale = lightModeScale.map(lightColor => {
        const targetLevel = levelMapping[lightColor.level];
        let darkHSL;
        
        if (lightColor.level === 400) {
            // Use the accessible base color directly without any modifications
            darkHSL = [...darkModeBaseHSL];
        } else {
            // For non-400 levels, create inverted colors based on the accessible base
            // Get the original color from light mode scale at the target level
            const targetLightColor = lightModeScale.find(c => c.level === targetLevel);
            if (targetLightColor) {
                // Use the actual color from the target level but adjust for dark mode
                darkHSL = [...targetLightColor.hsl];
            } else {
                // Fallback to calculation
                darkHSL = calculateDarkModeHSL(darkModeBaseHSL, targetLevel, lightColor.level);
            }
        }
        
        // Apply dark mode specific adjustments - but skip for level 400 to preserve accessibility
        if (lightColor.level !== 400) {
            darkHSL = applyDarkModeAdjustments(darkHSL, lightColor.level, {
                saturationBoost,
                contrastAdjustment
            });
        }
        
        // Convert to other formats
        const rgb = hslToRgb(darkHSL);
        const hex = hslToHex(darkHSL);
        
        // Get accessibility information
        const contrastInfo = getContrastInfo(rgb);
        
        // Create dark mode color object
        return {
            level: lightColor.level, // Keep original level numbering
            hsl: darkHSL,
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
            name: lightColor.name || '',
            isBase: lightColor.level === 400,
            originalLevel: targetLevel, // Track the source level for mapping
            isDarkMode: true
        };
    });
    
    return darkModeScale;
}

/**
 * Create level mapping for dark mode transformation
 * Maps light mode levels to their dark mode counterparts
 * @param {Array} lightModeScale - Light mode color scale
 * @returns {Object} Level mapping object
 */
function createDarkModeLevelMapping(lightModeScale) {
    const levels = lightModeScale.map(color => color.level).sort((a, b) => a - b);
    const mapping = {};
    
    // Standard mapping strategy: reverse the order, keep 400 in center
    const centerIndex = levels.indexOf(400);
    
    if (centerIndex === -1) {
        // If no level 400, use simple reversal
        levels.forEach((level, index) => {
            const reversedIndex = levels.length - 1 - index;
            mapping[level] = levels[reversedIndex];
        });
    } else {
        // Map levels symmetrically around 400
        levels.forEach((level, index) => {
            if (level === 400) {
                mapping[level] = 400; // Keep 400 unchanged
            } else if (index < centerIndex) {
                // Lighter levels map to darker levels
                const distanceFromCenter = centerIndex - index;
                const targetIndex = Math.min(levels.length - 1, centerIndex + distanceFromCenter);
                mapping[level] = levels[targetIndex];
            } else {
                // Darker levels map to lighter levels
                const distanceFromCenter = index - centerIndex;
                const targetIndex = Math.max(0, centerIndex - distanceFromCenter);
                mapping[level] = levels[targetIndex];
            }
        });
    }
    
    return mapping;
}

/**
 * Calculate HSL for dark mode color at specific level
 * @param {Array} baseHSL - Dark mode base HSL color
 * @param {number} targetLevel - Target level to generate
 * @param {number} originalLevel - Original level from light mode
 * @returns {Array} Calculated dark mode HSL
 */
function calculateDarkModeHSL(baseHSL, targetLevel, originalLevel) {
    // Use the same scale generation logic, but with dark mode base
    let darkHSL = calculateHSL(baseHSL, targetLevel);
    
    // Apply level-specific dark mode adjustments
    darkHSL = applyLevelSpecificDarkModeAdjustments(darkHSL, targetLevel, originalLevel);
    
    return darkHSL;
}

/**
 * Apply dark mode specific adjustments to HSL color
 * @param {Array} hsl - HSL color to adjust
 * @param {number} level - Color level
 * @param {Object} options - Adjustment options
 * @returns {Array} Adjusted HSL color
 */
function applyDarkModeAdjustments(hsl, level, options = {}) {
    const {
        saturationBoost = 5,
        contrastAdjustment = 0.1
    } = options;
    
    let [h, s, l] = hsl;
    
    // Boost saturation slightly for better visibility in dark mode
    if (!isNeutralColor(hsl)) {
        s = Math.min(100, s + saturationBoost);
    }
    
    // Adjust lightness for better dark mode contrast
    if (level < 400) {
        // For lighter levels in dark mode (originally darker), ensure they're light enough
        l = Math.max(l, 65);
    } else if (level > 400) {
        // For darker levels in dark mode (originally lighter), ensure they're dark enough
        l = Math.min(l, 35);
    }
    
    // Apply contrast adjustment
    const contrastFactor = 1 + contrastAdjustment;
    if (l > 50) {
        l = Math.min(100, l * contrastFactor);
    } else {
        l = Math.max(0, l / contrastFactor);
    }
    
    return clampHSL([h, s, l]);
}

/**
 * Apply level-specific adjustments for dark mode
 * @param {Array} hsl - HSL color to adjust
 * @param {number} targetLevel - Target level being generated
 * @param {number} originalLevel - Original level from light mode
 * @returns {Array} Adjusted HSL color
 */
function applyLevelSpecificDarkModeAdjustments(hsl, targetLevel, originalLevel) {
    let [h, s, l] = hsl;
    
    // Specific adjustments based on level transformation
    if (originalLevel <= 200 && targetLevel >= 600) {
        // Very light -> very dark: ensure sufficient darkness
        l = Math.min(l, 30);
        s = Math.min(100, s + 8); // Boost saturation for rich darks
    } else if (originalLevel >= 600 && targetLevel <= 200) {
        // Very dark -> very light: ensure sufficient lightness
        l = Math.max(l, 70);
        s = Math.max(0, s - 3); // Reduce saturation for clean lights
    }
    
    // Handle extreme levels
    if (targetLevel === 50) {
        l = Math.max(l, 85); // Ensure level 50 is very light in dark mode
    } else if (targetLevel === 800) {
        l = Math.min(l, 25); // Ensure level 800 is very dark in dark mode
        s = Math.min(100, s + 10); // Rich, saturated darks
    }
    
    return clampHSL([h, s, l]);
}

/**
 * Validate dark mode scale for consistency and accessibility
 * @param {Array} darkModeScale - Dark mode color scale
 * @param {Array} lightModeScale - Original light mode scale
 * @returns {Object} Validation results
 */
function validateDarkModeScale(darkModeScale, lightModeScale) {
    const results = {
        isValid: true,
        warnings: [],
        suggestions: [],
        mapping: {}
    };
    
    // Check level mapping consistency
    darkModeScale.forEach(darkColor => {
        const lightColor = lightModeScale.find(c => c.level === darkColor.level);
        if (lightColor) {
            results.mapping[darkColor.level] = {
                light: lightColor.hsl[2], // Lightness
                dark: darkColor.hsl[2],
                reversed: darkColor.hsl[2] < lightColor.hsl[2] // Should be reversed for most levels
            };
        }
    });
    
    // Check for proper dark mode characteristics
    const darkColors = darkModeScale.filter(c => c.level > 400);
    const lightColors = darkModeScale.filter(c => c.level < 400);
    
    // Verify darker levels are actually darker in dark mode
    const avgDarkLightness = darkColors.reduce((sum, c) => sum + c.hsl[2], 0) / darkColors.length;
    const avgLightLightness = lightColors.reduce((sum, c) => sum + c.hsl[2], 0) / lightColors.length;
    
    if (avgDarkLightness >= avgLightLightness) {
        results.warnings.push('Dark mode levels may not be properly differentiated');
    }
    
    // Check accessibility in dark mode context
    const accessibilityIssues = darkModeScale.filter(color => 
        !color.whitePassesNormal && !color.blackPassesNormal
    );
    
    if (accessibilityIssues.length > 0) {
        results.warnings.push(`${accessibilityIssues.length} colors may have accessibility issues in dark mode`);
        results.suggestions.push('Consider adjusting lightness values for better contrast');
    }
    
    // Check for adequate contrast between adjacent levels
    for (let i = 1; i < darkModeScale.length; i++) {
        const currentL = darkModeScale[i].hsl[2];
        const prevL = darkModeScale[i-1].hsl[2];
        const lightnessDiff = Math.abs(currentL - prevL);
        
        if (lightnessDiff < 8) {
            results.warnings.push(`Low contrast between levels ${darkModeScale[i-1].level} and ${darkModeScale[i].level}`);
        }
    }
    
    results.isValid = results.warnings.length === 0;
    return results;
}

/**
 * Find a fully accessible color for dark mode level 400
 * @param {Array} originalHSL - Original HSL color
 * @returns {Array|null} Fully accessible HSL color or null
 */
function findFullyAccessibleColorForDarkMode(originalHSL) {
    const [originalH, originalS, originalL] = originalHSL;
    
    // Search ranges optimized for dark mode
    const searchRanges = {
        lightness: [35, 40, 45, 50, 55, 60], // Medium range for dark mode accessibility
        saturation: generateSearchRange(originalS, 30, 85, 10),
        hue: generateSearchRange(originalH, 0, 360, 15)
    };
    
    let bestColor = null;
    let minDistance = Infinity;
    
    // Try different combinations
    for (const h of searchRanges.hue.slice(0, 8)) { // Limit hue variations
        for (const l of searchRanges.lightness) {
            for (const s of searchRanges.saturation.slice(0, 6)) { // Limit saturation variations
                const candidateHSL = [h, s, l];
                const rgb = hslToRgb(candidateHSL);
                const contrastInfo = getContrastInfo(rgb);
                
                // Check if passes all 4 criteria
                const fullyAccessible = 
                    contrastInfo.black.passesNormal && 
                    contrastInfo.black.passesLarge && 
                    contrastInfo.white.passesNormal && 
                    contrastInfo.white.passesLarge;
                
                if (fullyAccessible) {
                    const distance = calculateSimpleColorDistance(originalHSL, candidateHSL);
                    if (distance < minDistance) {
                        bestColor = candidateHSL;
                        minDistance = distance;
                        
                        // If we found a very close match, use it
                        if (distance < 25) break;
                    }
                }
            }
            if (bestColor && minDistance < 25) break;
        }
        if (bestColor && minDistance < 25) break;
    }
    
    return bestColor;
}

/**
 * Calculate simple perceptual distance between two HSL colors
 * @param {Array} hsl1 - First HSL color [h, s, l]
 * @param {Array} hsl2 - Second HSL color [h, s, l]
 * @returns {number} Distance value (lower = more similar)
 */
function calculateSimpleColorDistance(hsl1, hsl2) {
    const [h1, s1, l1] = hsl1;
    const [h2, s2, l2] = hsl2;
    
    // Hue difference (circular)
    let hueDiff = Math.abs(h1 - h2);
    if (hueDiff > 180) hueDiff = 360 - hueDiff;
    
    // Weighted distance calculation
    const hueWeight = 0.6;    // Hue changes are most noticeable
    const satWeight = 0.25;   // Saturation changes moderately noticeable
    const lightWeight = 0.15; // Lightness changes least noticeable for accessibility
    
    return (
        (hueDiff / 180) * hueWeight * 100 +
        (Math.abs(s1 - s2) / 100) * satWeight * 100 +
        (Math.abs(l1 - l2) / 100) * lightWeight * 100
    );
}

/**
 * Generate search range helper function
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
 * Generate optimal dark mode base color from light mode base
 * @param {Array} lightBaseHSL - Light mode base HSL
 * @returns {Array} Optimized dark mode base HSL
 */
function generateOptimalDarkModeBase(lightBaseHSL) {
    const [h, s, l] = lightBaseHSL;
    
    // Adjust for dark mode context
    let darkS = s;
    let darkL = l;
    
    // Boost saturation slightly for better visibility
    if (!isNeutralColor(lightBaseHSL)) {
        darkS = Math.min(100, s + 8);
    }
    
    // Adjust lightness based on original lightness
    if (l > 70) {
        // Very light colors become medium-dark
        darkL = Math.max(35, l - 35);
    } else if (l < 30) {
        // Very dark colors become medium-light
        darkL = Math.min(65, l + 35);
    } else {
        // Medium colors get moderate adjustment
        darkL = l > 50 ? Math.max(40, l - 15) : Math.min(60, l + 15);
    }
    
    return clampHSL([h, darkS, darkL]);
}

/**
 * Create smooth transitions between light and dark mode scales
 * @param {Array} lightScale - Light mode scale
 * @param {Array} darkScale - Dark mode scale
 * @param {number} progress - Transition progress (0 = light, 1 = dark)
 * @returns {Array} Interpolated color scale
 */
function interpolateScales(lightScale, darkScale, progress) {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    
    return lightScale.map((lightColor, index) => {
        const darkColor = darkScale[index];
        
        // Interpolate HSL values
        const interpolatedHSL = [
            mixHSLColors(lightColor.hsl, darkColor.hsl, clampedProgress)[0], // Hue
            lightColor.hsl[1] + (darkColor.hsl[1] - lightColor.hsl[1]) * clampedProgress, // Saturation
            lightColor.hsl[2] + (darkColor.hsl[2] - lightColor.hsl[2]) * clampedProgress  // Lightness
        ];
        
        const rgb = hslToRgb(interpolatedHSL);
        const hex = hslToHex(interpolatedHSL);
        const contrastInfo = getContrastInfo(rgb);
        
        return {
            ...lightColor,
            hsl: interpolatedHSL,
            rgb: rgb,
            hex: hex,
            blackPassesNormal: contrastInfo.black.passesNormal,
            blackPassesLarge: contrastInfo.black.passesLarge,
            blackRatio: contrastInfo.black.ratio,
            whitePassesNormal: contrastInfo.white.passesNormal,
            whitePassesLarge: contrastInfo.white.passesLarge,
            whiteRatio: contrastInfo.white.ratio,
            preferredTextColor: contrastInfo.preferredText,
            transitionProgress: clampedProgress
        };
    });
}