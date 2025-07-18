/**
 * @deprecated Use the unified health service instead: import { useHealthService } from './service'
 * 
 * This file is kept for backwards compatibility but redirects to the proper platform implementation.
 */

// Re-export the iOS health service from the platforms directory
export { useHealthService } from './platforms/ios';