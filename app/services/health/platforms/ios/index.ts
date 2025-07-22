// Re-export all iOS platform functionality
export * from './types';
export * from './mappers';

// Export the anchored service as the default service for iOS
export { useHealthServiceAnchored as useHealthService } from './service-anchored';

// Also export the original service if needed for backwards compatibility
export { useHealthService as useHealthServiceRegular } from './service';