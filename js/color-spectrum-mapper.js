/**
 * Color Spectrum Mapper Module
 * Maps colors to their spectrum families and provides intelligent accessible color generation
 * that maintains color identity and family characteristics
 */

/**
 * Color spectrum definitions with their characteristics
 */
const COLOR_SPECTRUM_MAP = {
    red: {
        hueRange: [345, 15], // Wraps around 360/0
        families: {
            crimson: { hueRange: [345, 5], preferredSaturation: [70, 85] },
            scarlet: { hueRange: [0, 10], preferredSaturation: [80, 95] },
            cherry: { hueRange: [5, 15], preferredSaturation: [60, 80] }
        },
        accessibilityStrategies: {
            light: { 
                preferredLightness: [25, 40], 
                saturationRange: [60, 90],
                hueVariation: 8 // Maximum hue variation to maintain family
            },
            dark: { 
                preferredLightness: [65, 80], 
                saturationRange: [50, 80],
                hueVariation: 8
            }
        }
    },
    
    orange: {
        hueRange: [15, 45],
        families: {
            amber: { hueRange: [35, 45], preferredSaturation: [70, 90] },
            tangerine: { hueRange: [25, 35], preferredSaturation: [80, 95] },
            coral: { hueRange: [15, 25], preferredSaturation: [60, 85] }
        },
        accessibilityStrategies: {
            light: { 
                preferredLightness: [30, 45], 
                saturationRange: [65, 90],
                hueVariation: 6
            },
            dark: { 
                preferredLightness: [60, 75], 
                saturationRange: [60, 85],
                hueVariation: 6
            }
        }
    },
    
    yellow: {
        hueRange: [45, 75],
        families: {
            gold: { hueRange: [45, 55], preferredSaturation: [70, 90] },
            lemon: { hueRange: [55, 65], preferredSaturation: [80, 95] },
            cream: { hueRange: [65, 75], preferredSaturation: [40, 70] }
        },
        accessibilityStrategies: {
            light: { 
                preferredLightness: [25, 35], // Yellow needs to be quite dark for accessibility
                saturationRange: [70, 95],
                hueVariation: 5
            },
            dark: { 
                preferredLightness: [70, 85], 
                saturationRange: [60, 90],
                hueVariation: 5
            }
        }
    },
    
    green: {
        hueRange: [75, 165],
        families: {
            lime: { hueRange: [75, 95], preferredSaturation: [70, 90] },
            forest: { hueRange: [95, 125], preferredSaturation: [60, 85] },
            emerald: { hueRange: [125, 145], preferredSaturation: [70, 90] },
            mint: { hueRange: [145, 165], preferredSaturation: [50, 80] }
        },
        accessibilityStrategies: {
            light: { 
                preferredLightness: [25, 40], 
                saturationRange: [60, 85],
                hueVariation: 10
            },
            dark: { 
                preferredLightness: [65, 80], 
                saturationRange: [55, 80],
                hueVariation: 10
            }
        }
    },
    
    cyan: {
        hueRange: [165, 195],
        families: {
            turquoise: { hueRange: [165, 175], preferredSaturation: [60, 85] },
            aqua: { hueRange: [175, 185], preferredSaturation: [70, 90] },
            teal: { hueRange: [185, 195], preferredSaturation: [60, 80] }
        },
        accessibilityStrategies: {
            light: { 
                preferredLightness: [25, 40], 
                saturationRange: [60, 85],
                hueVariation: 8
            },
            dark: { 
                preferredLightness: [65, 80], 
                saturationRange: [55, 80],
                hueVariation: 8
            }
        }
    },
    
    blue: {
        hueRange: [195, 255],
        families: {
            sky: { hueRange: [195, 215], preferredSaturation: [60, 85] },
            azure: { hueRange: [215, 235], preferredSaturation: [70, 90] },
            navy: { hueRange: [235, 255], preferredSaturation: [60, 90] }
        },
        accessibilityStrategies: {
            light: { 
                preferredLightness: [25, 40], 
                saturationRange: [65, 90],
                hueVariation: 10
            },
            dark: { 
                preferredLightness: [65, 80], 
                saturationRange: [60, 85],
                hueVariation: 10
            }
        }
    },
    
    purple: {
        hueRange: [255, 285],
        families: {
            violet: { hueRange: [255, 265], preferredSaturation: [60, 85] },
            lavender: { hueRange: [265, 275], preferredSaturation: [50, 75] },
            plum: { hueRange: [275, 285], preferredSaturation: [55, 80] }
        },
        accessibilityStrategies: {
            light: { 
                preferredLightness: [25, 40], 
                saturationRange: [60, 85],
                hueVariation: 8
            },
            dark: { 
                preferredLightness: [65, 80], 
                saturationRange: [55, 80],
                hueVariation: 8
            }
        }
    },
    
    magenta: {
        hueRange: [285, 345],
        families: {
            fuchsia: { hueRange: [285, 305], preferredSaturation: [70, 90] },
            rose: { hueRange: [305, 325], preferredSaturation: [60, 85] },
            pink: { hueRange: [325, 345], preferredSaturation: [50, 80] }
        },
        accessibilityStrategies: {
            light: { 
                preferredLightness: [25, 40], 
                saturationRange: [60, 85],
                hueVariation: 8
            },
            dark: { 
                preferredLightness: [65, 80], 
                saturationRange: [55, 80],
                hueVariation: 8
            }
        }
    }
};

/**
 * Identify color spectrum and family based on HSL values
 * @param {Array} hsl - HSL color array [h, s, l]
 * @returns {Object} Color identification with spectrum, family, and characteristics
 */
function identifyColorSpectrum(hsl) {
    const [hue, saturation, lightness] = hsl;
    
    // Find the spectrum this color belongs to
    for (const [spectrumName, spectrum] of Object.entries(COLOR_SPECTRUM_MAP)) {
        if (isHueInRange(hue, spectrum.hueRange)) {
            // Find the most specific family within the spectrum
            let bestFamily = null;
            let bestFamilyName = 'generic';
            
            for (const [familyName, family] of Object.entries(spectrum.families)) {
                if (isHueInRange(hue, family.hueRange)) {
                    bestFamily = family;
                    bestFamilyName = familyName;
                    break;
                }
            }
            
            return {
                spectrum: spectrumName,
                family: bestFamilyName,
                familyData: bestFamily,
                spectrumData: spectrum,
                originalHue: hue,
                originalSaturation: saturation,
                originalLightness: lightness
            };
        }
    }
    
    // Fallback for edge cases
    return {
        spectrum: 'unknown',
        family: 'generic',
        familyData: null,
        spectrumData: null,
        originalHue: hue,
        originalSaturation: saturation,
        originalLightness: lightness
    };
}

/**
 * Check if a hue value falls within a range (handles wrap-around at 360/0)
 * @param {number} hue - Hue value to check
 * @param {Array} range - [min, max] hue range
 * @returns {boolean} Whether hue is in range
 */
function isHueInRange(hue, range) {
    const [min, max] = range;
    
    // Handle wrap-around case (e.g., red spectrum 345-15)
    if (min > max) {
        return hue >= min || hue <= max;
    }
    
    return hue >= min && hue <= max;
}

/**
 * Generate accessible color while maintaining spectrum identity
 * @param {Array} originalHSL - Original HSL color
 * @param {string} mode - 'light' or 'dark' mode
 * @returns {Array|null} Accessible HSL color that maintains identity
 */
function generateSpectrumAwareAccessibleColor(originalHSL, mode = 'light') {
    const colorIdentity = identifyColorSpectrum(originalHSL);
    const [originalH, originalS, originalL] = originalHSL;
    
    // If we can't identify the spectrum, fall back to original algorithm
    if (colorIdentity.spectrum === 'unknown') {
        return generateFallbackAccessibleColor(originalHSL, mode);
    }
    
    const strategy = colorIdentity.spectrumData.accessibilityStrategies[mode];
    
    // Generate search ranges based on spectrum identity
    const searchRanges = {
        hue: generateConstrainedHueRange(
            originalH, 
            colorIdentity.spectrumData.hueRange, 
            strategy.hueVariation
        ),
        saturation: generateConstrainedSaturationRange(
            originalS,
            strategy.saturationRange,
            colorIdentity.familyData?.preferredSaturation
        ),
        lightness: strategy.preferredLightness
    };
    
    let bestColor = null;
    let minDistance = Infinity;
    
    // Search for accessible colors within spectrum constraints
    for (const h of searchRanges.hue) {
        for (const l of searchRanges.lightness) {
            for (const s of searchRanges.saturation) {
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
                    // Calculate weighted distance that prioritizes hue preservation
                    const distance = calculateSpectrumWeightedDistance(originalHSL, candidateHSL);
                    
                    if (distance < minDistance) {
                        bestColor = candidateHSL;
                        minDistance = distance;
                        
                        // Early exit for very close matches
                        if (distance < 15) break;
                    }
                }
            }
            if (bestColor && minDistance < 15) break;
        }
        if (bestColor && minDistance < 15) break;
    }
    
    // Return the best accessible color found
    
    return bestColor;
}

/**
 * Generate constrained hue range that stays within spectrum
 * @param {number} originalHue - Original hue value
 * @param {Array} spectrumRange - [min, max] spectrum hue range
 * @param {number} maxVariation - Maximum hue variation allowed
 * @returns {Array} Array of hue values to try
 */
function generateConstrainedHueRange(originalHue, spectrumRange, maxVariation) {
    const [spectrumMin, spectrumMax] = spectrumRange;
    const hues = [originalHue]; // Start with original
    
    // Generate variations within both spectrum and variation constraints
    for (let variation = 2; variation <= maxVariation; variation += 2) {
        const lower = originalHue - variation;
        const upper = originalHue + variation;
        
        // Check if variations are within spectrum
        if (isHueInRange(normalizeHue(lower), spectrumRange)) {
            hues.push(normalizeHue(lower));
        }
        if (isHueInRange(normalizeHue(upper), spectrumRange)) {
            hues.push(normalizeHue(upper));
        }
    }
    
    return hues;
}

/**
 * Generate constrained saturation range based on family preferences
 * @param {number} originalSaturation - Original saturation value
 * @param {Array} strategyRange - Strategy-defined saturation range
 * @param {Array} familyPreference - Family preferred saturation range
 * @returns {Array} Array of saturation values to try
 */
function generateConstrainedSaturationRange(originalSaturation, strategyRange, familyPreference) {
    const [strategyMin, strategyMax] = strategyRange;
    const saturations = [];
    
    // Use family preference if available, otherwise use strategy range
    const [minSat, maxSat] = familyPreference || strategyRange;
    const effectiveMin = Math.max(strategyMin, minSat);
    const effectiveMax = Math.min(strategyMax, maxSat);
    
    // Start with original if it's in range
    if (originalSaturation >= effectiveMin && originalSaturation <= effectiveMax) {
        saturations.push(originalSaturation);
    }
    
    // Generate range around the effective bounds
    for (let sat = effectiveMin; sat <= effectiveMax; sat += 10) {
        if (!saturations.includes(sat)) {
            saturations.push(sat);
        }
    }
    
    return saturations.sort((a, b) => 
        Math.abs(a - originalSaturation) - Math.abs(b - originalSaturation)
    );
}

/**
 * Calculate weighted distance that prioritizes hue preservation
 * @param {Array} original - Original HSL color
 * @param {Array} candidate - Candidate HSL color
 * @returns {number} Weighted distance
 */
function calculateSpectrumWeightedDistance(original, candidate) {
    const [h1, s1, l1] = original;
    const [h2, s2, l2] = candidate;
    
    // Calculate hue distance (handling wrap-around)
    const hueDiff = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2));
    
    // Weight hue difference more heavily to preserve color identity
    const hueWeight = 3;
    const saturationWeight = 1;
    const lightnessWeight = 0.5;
    
    return (hueDiff * hueWeight) + 
           (Math.abs(s1 - s2) * saturationWeight) + 
           (Math.abs(l1 - l2) * lightnessWeight);
}

/**
 * Normalize hue to 0-360 range
 * @param {number} hue - Hue value
 * @returns {number} Normalized hue
 */
function normalizeHue(hue) {
    return ((hue % 360) + 360) % 360;
}

/**
 * Fallback algorithm for unknown spectrum colors
 * @param {Array} originalHSL - Original HSL color
 * @param {string} mode - 'light' or 'dark' mode
 * @returns {Array|null} Accessible color using basic algorithm
 */
function generateFallbackAccessibleColor(originalHSL, mode) {
    // This would use the original algorithm with tighter constraints
    const [originalH, originalS, originalL] = originalHSL;
    
    const searchRanges = {
        light: {
            lightness: [25, 30, 35, 40, 45],
            saturation: generateSearchRange(originalS, Math.max(20, originalS - 20), Math.min(90, originalS + 20), 10),
            hue: generateSearchRange(originalH, originalH - 10, originalH + 10, 5) // Much tighter hue range
        },
        dark: {
            lightness: [60, 65, 70, 75, 80],
            saturation: generateSearchRange(originalS, Math.max(30, originalS - 15), Math.min(80, originalS + 15), 10),
            hue: generateSearchRange(originalH, originalH - 10, originalH + 10, 5)
        }
    };
    
    const ranges = searchRanges[mode];
    let bestColor = null;
    let minDistance = Infinity;
    
    for (const h of ranges.hue) {
        for (const l of ranges.lightness) {
            for (const s of ranges.saturation) {
                const candidateHSL = [h, s, l];
                const rgb = hslToRgb(candidateHSL);
                const contrastInfo = getContrastInfo(rgb);
                
                const fullyAccessible = 
                    contrastInfo.black.passesNormal && 
                    contrastInfo.black.passesLarge && 
                    contrastInfo.white.passesNormal && 
                    contrastInfo.white.passesLarge;
                
                if (fullyAccessible) {
                    const distance = calculateColorDistance(originalHSL, candidateHSL);
                    if (distance < minDistance) {
                        bestColor = candidateHSL;
                        minDistance = distance;
                        if (distance < 20) break;
                    }
                }
            }
            if (bestColor && minDistance < 20) break;
        }
        if (bestColor && minDistance < 20) break;
    }
    
    return bestColor;
}