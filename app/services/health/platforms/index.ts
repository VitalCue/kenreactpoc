// Re-export all platform functionality
// Export everything except useHealthService to avoid naming conflicts
export * from './ios/types';
export * from './ios/mappers';
export * from './android/types';
export * from './android/mappers';

// Re-export useHealthService with platform-specific names
export { useHealthService as useHealthServiceIOS } from './ios/service';
export { useHealthService as useHealthServiceAndroid } from './android/service';