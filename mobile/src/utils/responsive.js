import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device (iPhone X/13)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Scales the size based on the screen width.
 * Use for: width, marginHorizontal, paddingHorizontal, icon size, etc.
 */
const scale = (size) => (SCREEN_WIDTH / guidelineBaseWidth) * size;

/**
 * Scales the size based on the screen height.
 * Use for: height, marginVertical, paddingVertical, etc.
 */
const verticalScale = (size) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;

/**
 * Scales the size moderately. 
 * Use for: fontSize, borderRadius, or any value that shouldn't scale as much as screen size.
 */
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

export {
    scale,
    verticalScale,
    moderateScale,
    SCREEN_WIDTH,
    SCREEN_HEIGHT
};
