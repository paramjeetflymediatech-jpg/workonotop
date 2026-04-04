import { moderateScale, IS_TABLET, IS_SMALL_DEVICE } from '../utils/responsive';

/**
 * Standard Typography system for WorkOnTop.
 * Automatically handles font scaling based on device type.
 */

const getFontSize = (baseSize) => {
    if (IS_TABLET) return baseSize * 1.35; // Tablets get 35% larger fonts
    if (IS_SMALL_DEVICE) return baseSize * 0.95; // Very small devices get 5% reduction
    return moderateScale(baseSize);
};

export const Typography = {
    // Headings
    h1: getFontSize(32),
    h2: getFontSize(28),
    h3: getFontSize(24),
    h4: getFontSize(20),
    h5: getFontSize(18),
    
    // Body Text
    bodyLarge: getFontSize(16),
    body: getFontSize(14),
    bodySmall: getFontSize(13),
    
    // Meta / Captions
    caption: getFontSize(12),
    tiny: getFontSize(10),
    
    // Specific use cases
    buttonText: getFontSize(16),
    input: getFontSize(15),
    label: getFontSize(13),
    
    // Helper to get custom size if needed
    getCustom: (size) => getFontSize(size),

    // Helper for line height
    getLineHeight: (fontSize) => fontSize * 1.5,
};

export default Typography;
