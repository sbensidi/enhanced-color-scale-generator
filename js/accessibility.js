/**
 * Accessibility Module
 * WCAG AA compliance validation and accessible color discovery
 * Provides contrast calculations and accessibility validation
 */

/**
 * Calculate contrast ratio between two colors using WCAG formula
 * @param {Array} rgb1 - First RGB color [r, g, b]
 * @param {Array} rgb2 - Second RGB color [r, g, b]
 * @returns {number} Contrast ratio (1-21)
 */
function getContrastRatio(rgb1, rgb2) {
    const l1 = calculateLuminance(rgb1);
    const l2 = calculateLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

/**
 * Check if color combination passes WCAG AA contrast requirements
 * @param {Array} bgRgb - Background RGB color [r, g, b]
 * @param {Array} textRgb - Text RGB color [r, g, b]
 * @param {boolean} isLargeText - Whether text is large text (18pt+ regular or 14pt+ bold)
 * @returns {boolean} True if passes WCAG AA contrast requirements
 */
function passesContrastCheck(bgRgb, textRgb, isLargeText = false) {
    const ratio = getContrastRatio(bgRgb, textRgb);
    const minimumRatio = isLargeText ? 3.0 : 4.5;
    return ratio >= minimumRatio;
}

/**
 * Check if color combination passes WCAG AAA contrast requirements
 * @param {Array} bgRgb - Background RGB color [r, g, b]
 * @param {Array} textRgb - Text RGB color [r, g, b] 
 * @param {boolean} isLargeText - Whether text is large text
 * @returns {boolean} True if passes WCAG AAA contrast requirements
 */
function passesContrastCheckAAA(bgRgb, textRgb, isLargeText = false) {
    const ratio = getContrastRatio(bgRgb, textRgb);
    const minimumRatio = isLargeText ? 4.5 : 7.0;
    return ratio >= minimumRatio;
}

/**
 * Get contrast information for a color against black and white text
 * @param {Array} rgb - Background RGB color [r, g, b]
 * @returns {Object} Contrast information object
 */
function getContrastInfo(rgb) {
    const blackRgb = [0, 0, 0];
    const whiteRgb = [255, 255, 255];
    
    const blackRatio = getContrastRatio(rgb, blackRgb);
    const whiteRatio = getContrastRatio(rgb, whiteRgb);
    
    return {
        black: {
            ratio: blackRatio,
            passesNormal: blackRatio >= 4.5,
            passesLarge: blackRatio >= 3.0,
            passesAAA: blackRatio >= 7.0
        },
        white: {
            ratio: whiteRatio,
            passesNormal: whiteRatio >= 4.5,
            passesLarge: whiteRatio >= 3.0,
            passesAAA: whiteRatio >= 7.0
        },
        preferredText: blackRatio > whiteRatio ? '#000000' : '#ffffff'
    };
}

/**
 * Find an accessible color similar to the original but meeting WCAG AA requirements
 * Enhanced algorithm with better hue preservation
 * @param {Array} originalHSL - Original HSL color [h, s, l]
 * @param {Object} options - Search options
 * @returns {Array} Accessible HSL color [h, s, l]
 */
function findAccessibleColor(originalHSL, options = {}) {
    const {
        targetRatio = 4.5,
        maxIterations = 150,
        preserveHue = true,
        allowSaturationChange = true,
        textColor = 'both', // 'black', 'white', or 'both'
        huePreservationWeight = 0.8 // How important is preserving hue (0-1)
    } = options;
    
    const [originalH, originalS, originalL] = originalHSL;
    let bestColor = [...originalHSL];
    let bestScore = calculateAccessibilityScore(originalHSL, textColor);
    let bestDistance = Infinity;
    
    // If original color already passes, return it
    if (bestScore >= targetRatio) {
        return originalHSL;
    }
    
    // Enhanced multi-stage search for better hue preservation
    const searchStages = [
        // Stage 1: Strict hue preservation, adjust lightness and saturation
        {
            hueRange: preserveHue ? [originalH] : generateHueRange(originalH, 15),
            saturationRange: allowSaturationChange ? generateSmartSaturationRange(originalS, originalL) : [originalS],
            lightnessRange: generateSmartLightnessRange(originalL, targetRatio),
            priority: 'accessibility'
        },
        // Stage 2: Slight hue flexibility for better results
        {
            hueRange: preserveHue ? generateHueRange(originalH, 30) : generateHueRange(originalH, 45),
            saturationRange: allowSaturationChange ? generateSearchRange(originalS, 0, 100, 15) : [originalS],
            lightnessRange: generateSearchRange(originalL, 0, 100, 5),
            priority: 'balanced'
        },
        // Stage 3: More aggressive search if needed
        {
            hueRange: preserveHue ? generateHueRange(originalH, 60) : generateSearchRange(originalH, 0, 360, 30),
            saturationRange: allowSaturationChange ? generateSearchRange(originalS, 0, 100, 20) : [originalS],
            lightnessRange: generateSearchRange(originalL, 0, 100, 10),
            priority: 'accessibility'
        }
    ];
    
    let iterations = 0;
    let foundAccessible = false;
    
    for (const stage of searchStages) {
        if (foundAccessible) break;
        
        for (const h of stage.hueRange) {
            for (const l of stage.lightnessRange) {
                for (const s of stage.saturationRange) {
                    if (iterations++ > maxIterations) break;
                    
                    const candidateHSL = [h, s, l];
                    const score = calculateAccessibilityScore(candidateHSL, textColor);
                    const distance = calculateEnhancedColorDistance(originalHSL, candidateHSL, huePreservationWeight);
                    
                    // Multi-criteria evaluation
                    const isAccessible = score >= targetRatio;
                    const isBetter = evaluateColorCandidate(
                        candidateHSL, bestColor, originalHSL, 
                        score, bestScore, distance, bestDistance, 
                        targetRatio, huePreservationWeight
                    );
                    
                    if (isBetter) {
                        bestColor = candidateHSL;
                        bestScore = score;
                        bestDistance = distance;
                        
                        if (isAccessible) {
                            foundAccessible = true;
                            // Continue searching for an even better match within this stage
                            if (distance < 20) break; // Found very close match
                        }
                    }
                }
                if (foundAccessible && bestDistance < 20) break;
            }
            if (foundAccessible && bestDistance < 20) break;
        }
    }
    
    // If still no accessible color found, try hue-preserving fallbacks
    if (bestScore < targetRatio) {
        const huePreservingFallbacks = generateHuePreservingFallbacks(originalH, originalS);
        
        for (const fallback of huePreservingFallbacks) {
            const score = calculateAccessibilityScore(fallback, textColor);
            const distance = calculateEnhancedColorDistance(originalHSL, fallback, huePreservationWeight);
            
            if (score >= targetRatio && distance < bestDistance) {
                bestColor = fallback;
                bestScore = score;
                bestDistance = distance;
                foundAccessible = true;
                break;
            }
        }
    }
    
    // Final fallback - ensure we return something accessible
    if (bestScore < targetRatio) {
        // Try to at least preserve hue family
        const hueFamily = getHueFamily(originalH);
        bestColor = getAccessibleColorForHueFamily(hueFamily);
    }
    
    return clampHSL(bestColor);
}

/**
 * Calculate accessibility score for a color against specified text colors
 * @param {Array} hsl - HSL color [h, s, l]
 * @param {string} textColor - 'black', 'white', or 'both'
 * @returns {number} Best contrast ratio achieved
 */
function calculateAccessibilityScore(hsl, textColor = 'both') {
    const rgb = hslToRgb(hsl);
    const blackRgb = [0, 0, 0];
    const whiteRgb = [255, 255, 255];
    
    if (textColor === 'black') {
        return getContrastRatio(rgb, blackRgb);
    } else if (textColor === 'white') {
        return getContrastRatio(rgb, whiteRgb);
    } else {
        // Return the better of the two ratios
        const blackRatio = getContrastRatio(rgb, blackRgb);
        const whiteRatio = getContrastRatio(rgb, whiteRgb);
        return Math.max(blackRatio, whiteRatio);
    }
}

/**
 * Calculate perceptual distance between two HSL colors
 * @param {Array} hsl1 - First HSL color [h, s, l]
 * @param {Array} hsl2 - Second HSL color [h, s, l]
 * @returns {number} Distance value (lower = more similar)
 */
function calculateColorDistance(hsl1, hsl2) {
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
 * Calculate enhanced perceptual distance with configurable hue preservation
 * @param {Array} hsl1 - First HSL color [h, s, l]
 * @param {Array} hsl2 - Second HSL color [h, s, l]
 * @param {number} huePreservationWeight - How important is preserving hue (0-1)
 * @returns {number} Distance value (lower = more similar)
 */
function calculateEnhancedColorDistance(hsl1, hsl2, huePreservationWeight = 0.8) {
    const [h1, s1, l1] = hsl1;
    const [h2, s2, l2] = hsl2;
    
    // Hue difference (circular)
    let hueDiff = Math.abs(h1 - h2);
    if (hueDiff > 180) hueDiff = 360 - hueDiff;
    
    // Dynamic weight calculation based on hue preservation preference
    const hueWeight = 0.4 + (huePreservationWeight * 0.4);
    const satWeight = 0.3 - (huePreservationWeight * 0.1);
    const lightWeight = 0.3 - (huePreservationWeight * 0.1);
    
    // Non-linear hue difference penalty for better preservation
    const hueDistancePenalty = huePreservationWeight > 0.5 ? 
        Math.pow(hueDiff / 180, 1.5) : hueDiff / 180;
    
    return (
        hueDistancePenalty * hueWeight * 100 +
        (Math.abs(s1 - s2) / 100) * satWeight * 100 +
        (Math.abs(l1 - l2) / 100) * lightWeight * 100
    );
}

/**
 * Generate hue range for search with configurable tolerance
 * @param {number} centerHue - Center hue value
 * @param {number} tolerance - Hue tolerance in degrees
 * @returns {Array} Array of hue values to search
 */
function generateHueRange(centerHue, tolerance) {
    if (tolerance === 0) return [centerHue];
    
    const range = [];
    const step = Math.min(15, tolerance / 3);
    
    // Add center hue first
    range.push(centerHue);
    
    // Add values in both directions
    for (let i = step; i <= tolerance; i += step) {
        range.push((centerHue + i) % 360);
        range.push((centerHue - i + 360) % 360);
    }
    
    return range;
}

/**
 * Generate smart saturation range based on original color properties
 * @param {number} originalS - Original saturation
 * @param {number} originalL - Original lightness
 * @returns {Array} Array of saturation values to search
 */
function generateSmartSaturationRange(originalS, originalL) {
    const range = [originalS];
    
    // If color is very light or very dark, try reducing saturation first
    if (originalL > 80 || originalL < 20) {
        const reduceSteps = [10, 20, 30];
        for (const step of reduceSteps) {
            if (originalS - step >= 0) range.push(originalS - step);
        }
    }
    
    // Try increasing saturation if current is low
    if (originalS < 70) {
        const increaseSteps = [15, 30];
        for (const step of increaseSteps) {
            if (originalS + step <= 100) range.push(originalS + step);
        }
    }
    
    // Add boundary values
    if (originalS > 20) range.push(Math.max(0, originalS - 40));
    if (originalS < 80) range.push(Math.min(100, originalS + 40));
    
    return [...new Set(range)].sort((a, b) => Math.abs(a - originalS) - Math.abs(b - originalS));
}

/**
 * Generate smart lightness range prioritizing accessibility
 * @param {number} originalL - Original lightness
 * @param {number} targetRatio - Target contrast ratio
 * @returns {Array} Array of lightness values to search
 */
function generateSmartLightnessRange(originalL, targetRatio) {
    const range = [originalL];
    
    // Calculate likely accessible lightness values
    const darkTarget = targetRatio >= 7.0 ? 25 : 35;  // For white text
    const lightTarget = targetRatio >= 7.0 ? 75 : 65; // For black text
    
    // Prioritize directions most likely to achieve accessibility
    if (originalL > 50) {
        // Try going darker first for light colors
        for (let l = originalL - 10; l >= darkTarget; l -= 10) {
            range.push(l);
        }
        // Then try going lighter
        for (let l = originalL + 10; l <= lightTarget; l += 10) {
            range.push(l);
        }
    } else {
        // Try going lighter first for dark colors
        for (let l = originalL + 10; l <= lightTarget; l += 10) {
            range.push(l);
        }
        // Then try going darker
        for (let l = originalL - 10; l >= darkTarget; l -= 10) {
            range.push(l);
        }
    }
    
    // Add boundary values
    range.push(5, 15, 25, 75, 85, 95);
    
    return [...new Set(range)].sort((a, b) => Math.abs(a - originalL) - Math.abs(b - originalL));
}

/**
 * Evaluate if a color candidate is better than the current best
 * @param {Array} candidate - Candidate HSL color
 * @param {Array} current - Current best HSL color
 * @param {Array} original - Original HSL color
 * @param {number} candidateScore - Candidate accessibility score
 * @param {number} currentScore - Current best accessibility score
 * @param {number} candidateDistance - Candidate distance from original
 * @param {number} currentDistance - Current best distance from original
 * @param {number} targetRatio - Target contrast ratio
 * @param {number} huePreservationWeight - Hue preservation importance
 * @returns {boolean} True if candidate is better
 */
function evaluateColorCandidate(candidate, current, original, candidateScore, currentScore, candidateDistance, currentDistance, targetRatio, huePreservationWeight) {
    const candidateAccessible = candidateScore >= targetRatio;
    const currentAccessible = currentScore >= targetRatio;
    
    // If candidate is accessible and current isn't, candidate wins
    if (candidateAccessible && !currentAccessible) return true;
    
    // If current is accessible and candidate isn't, current wins
    if (currentAccessible && !candidateAccessible) return false;
    
    // If both are accessible or both aren't, compare by distance and score
    if (candidateAccessible && currentAccessible) {
        // Both accessible: prefer closer to original, with slight bias toward better contrast
        const candidateWeightedScore = candidateDistance + (1 / candidateScore) * 10;
        const currentWeightedScore = currentDistance + (1 / currentScore) * 10;
        return candidateWeightedScore < currentWeightedScore;
    } else {
        // Neither accessible: prefer better score, with distance as tiebreaker
        if (Math.abs(candidateScore - currentScore) < 0.1) {
            return candidateDistance < currentDistance;
        }
        return candidateScore > currentScore;
    }
}

/**
 * Generate hue-preserving fallback colors
 * @param {number} originalH - Original hue
 * @param {number} originalS - Original saturation
 * @returns {Array} Array of fallback HSL colors
 */
function generateHuePreservingFallbacks(originalH, originalS) {
    return [
        [originalH, Math.max(0, originalS - 20), 25],  // Dark variant
        [originalH, Math.max(0, originalS - 20), 75],  // Light variant
        [originalH, Math.min(100, originalS + 20), 35], // Saturated dark
        [originalH, Math.min(100, originalS + 20), 65], // Saturated light
        [originalH, 60, 30],  // Standard dark
        [originalH, 60, 70],  // Standard light
        [(originalH + 15) % 360, Math.max(20, originalS - 10), 40], // Slight hue shift dark
        [(originalH - 15 + 360) % 360, Math.max(20, originalS - 10), 60] // Slight hue shift light
    ];
}

/**
 * Get hue family for color classification
 * @param {number} hue - Hue value (0-360)
 * @returns {string} Hue family name
 */
function getHueFamily(hue) {
    if (hue >= 0 && hue < 30) return 'red';
    if (hue >= 30 && hue < 60) return 'orange';
    if (hue >= 60 && hue < 90) return 'yellow';
    if (hue >= 90 && hue < 150) return 'green';
    if (hue >= 150 && hue < 210) return 'cyan';
    if (hue >= 210 && hue < 270) return 'blue';
    if (hue >= 270 && hue < 330) return 'purple';
    return 'red'; // 330-360
}

/**
 * Get accessible color for specific hue family
 * @param {string} hueFamily - Hue family name
 * @returns {Array} Accessible HSL color for that family
 */
function getAccessibleColorForHueFamily(hueFamily) {
    const accessibleColors = {
        'red': [0, 60, 45],      // Accessible red
        'orange': [30, 70, 40],  // Accessible orange
        'yellow': [50, 80, 35],  // Accessible yellow-orange
        'green': [120, 60, 35],  // Accessible green
        'cyan': [180, 60, 40],   // Accessible cyan
        'blue': [210, 65, 45],   // Accessible blue
        'purple': [270, 60, 40]  // Accessible purple
    };
    
    return accessibleColors[hueFamily] || [210, 60, 45]; // Default to accessible blue
}

/**
 * Generate search range for optimization
 * @param {number} center - Center value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} step - Step size
 * @returns {Array} Array of values to search
 */
function generateSearchRange(center, min, max, step) {
    const range = [];
    
    // Start with center value
    range.push(center);
    
    // Add values in both directions
    for (let i = step; i <= Math.max(center - min, max - center); i += step) {
        if (center - i >= min) range.push(center - i);
        if (center + i <= max) range.push(center + i);
    }
    
    // Add boundaries
    if (!range.includes(min)) range.push(min);
    if (!range.includes(max)) range.push(max);
    
    return range.sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
}

/**
 * Validate if a color scale meets accessibility requirements
 * @param {Array} colorScale - Array of color objects with rgb property
 * @returns {Object} Validation results
 */
function validateColorScaleAccessibility(colorScale) {
    const results = {
        overallAccessible: true,
        problematicColors: [],
        recommendations: []
    };
    
    colorScale.forEach((color, index) => {
        const contrastInfo = getContrastInfo(color.rgb);
        
        if (!contrastInfo.black.passesNormal && !contrastInfo.white.passesNormal) {
            results.overallAccessible = false;
            results.problematicColors.push({
                level: color.level,
                hex: color.hex,
                blackRatio: contrastInfo.black.ratio,
                whiteRatio: contrastInfo.white.ratio
            });
        }
    });
    
    if (!results.overallAccessible) {
        results.recommendations.push(
            'Consider using the accessible alternative scale',
            'Adjust lightness values to improve contrast',
            'Test with users who have visual impairments'
        );
    }
    
    return results;
}

/**
 * Get accessibility level description
 * @param {number} ratio - Contrast ratio
 * @returns {Object} Accessibility level information
 */
function getAccessibilityLevel(ratio) {
    if (ratio >= 7.0) {
        return {
            level: 'AAA',
            description: 'Enhanced contrast',
            color: 'success'
        };
    } else if (ratio >= 4.5) {
        return {
            level: 'AA',
            description: 'Standard contrast',
            color: 'success'
        };
    } else if (ratio >= 3.0) {
        return {
            level: 'AA Large',
            description: 'Large text only',
            color: 'warning'
        };
    } else {
        return {
            level: 'Fail',
            description: 'Insufficient contrast',
            color: 'error'
        };
    }
}

/**
 * Calculate APCAs (Advanced Perceptual Contrast Algorithm) contrast
 * Experimental future contrast algorithm
 * @param {Array} bgRgb - Background RGB color [r, g, b]
 * @param {Array} textRgb - Text RGB color [r, g, b]
 * @returns {number} APCA contrast score
 */
function calculateAPCAContrast(bgRgb, textRgb) {
    // Simplified APCA implementation
    // This is a basic version - full APCA is more complex
    
    const bgLum = calculateLuminance(bgRgb);
    const textLum = calculateLuminance(textRgb);
    
    const lighter = Math.max(bgLum, textLum);
    const darker = Math.min(bgLum, textLum);
    
    // APCA uses different calculation than WCAG
    const contrast = (lighter - darker) / lighter;
    
    return Math.round(contrast * 100);
}