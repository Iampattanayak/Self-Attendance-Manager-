import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11)
const baseWidth = 375;
const baseHeight = 812;

/**
 * Width scaling helper
 */
export const wp = (size: number): number => {
  return (SCREEN_WIDTH / baseWidth) * size;
};

/**
 * Height scaling helper
 */
export const hp = (size: number): number => {
  return (SCREEN_HEIGHT / baseHeight) * size;
};

/**
 * Font scaling helper with max size limit
 */
export const fp = (size: number, maxSize?: number): number => {
  const scale = SCREEN_WIDTH / baseWidth;
  const newSize = size * scale;
  if (maxSize && newSize > maxSize) {
    return maxSize;
  }
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * Get responsive dimensions
 */
export const getResponsiveDimensions = () => ({
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeDevice: SCREEN_WIDTH >= 414,
  isTablet: SCREEN_WIDTH >= 768,
});

/**
 * Responsive padding helper
 */
export const getPadding = () => {
  const dims = getResponsiveDimensions();
  if (dims.isTablet) return 24;
  if (dims.isLargeDevice) return 20;
  if (dims.isMediumDevice) return 16;
  return 12;
};

/**
 * Responsive card gap helper
 */
export const getCardGap = () => {
  const dims = getResponsiveDimensions();
  if (dims.isTablet) return 20;
  if (dims.isLargeDevice) return 16;
  return 12;
};

export default {
  wp,
  hp,
  fp,
  getResponsiveDimensions,
  getPadding,
  getCardGap,
};
