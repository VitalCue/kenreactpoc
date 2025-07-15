import type { WorkoutQueryParams, WorkoutMetricQueryParams } from '../types/queries';
import { WorkoutExerciseType } from '../constants';

/**
 * Validates workout query parameters
 */
export function validateWorkoutQueryParams(params: WorkoutQueryParams): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Date validation
  if (params.startDate && params.endDate) {
    if (params.startDate >= params.endDate) {
      errors.push('Start date must be before end date');
    }
    
    const daysDiff = (params.endDate.getTime() - params.startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      errors.push('Date range cannot exceed 365 days');
    }
  }
  
  // Duration validation
  if (params.minDuration !== undefined && params.minDuration < 0) {
    errors.push('Minimum duration cannot be negative');
  }
  
  if (params.maxDuration !== undefined && params.maxDuration < 0) {
    errors.push('Maximum duration cannot be negative');
  }
  
  if (params.minDuration !== undefined && params.maxDuration !== undefined) {
    if (params.minDuration > params.maxDuration) {
      errors.push('Minimum duration cannot be greater than maximum duration');
    }
  }
  
  // Exercise types validation
  if (params.exerciseTypes) {
    const validTypes = Object.values(WorkoutExerciseType);
    const invalidTypes = params.exerciseTypes.filter(type => !validTypes.includes(type));
    if (invalidTypes.length > 0) {
      errors.push(`Invalid exercise types: ${invalidTypes.join(', ')}`);
    }
  }
  
  // Page size validation
  if (params.pageSize !== undefined) {
    if (params.pageSize <= 0) {
      errors.push('Page size must be greater than 0');
    }
    if (params.pageSize > 1000) {
      errors.push('Page size cannot exceed 1000');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates workout metric query parameters
 */
export function validateWorkoutMetricQueryParams(params: WorkoutMetricQueryParams): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Basic query validation
  const baseValidation = validateWorkoutQueryParams(params);
  errors.push(...baseValidation.errors);
  
  // Metric types validation
  if (!params.metricTypes || params.metricTypes.length === 0) {
    errors.push('At least one metric type must be specified');
  }
  
  // Sample rate validation
  if (params.sampleRate !== undefined && params.sampleRate <= 0) {
    errors.push('Sample rate must be greater than 0');
  }
  
  // Aggregation validation
  if (params.aggregation && !['raw', 'minute', 'hour', 'session'].includes(params.aggregation)) {
    errors.push('Invalid aggregation type. Must be: raw, minute, hour, or session');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes and normalizes workout query parameters
 */
export function sanitizeWorkoutQueryParams(params: WorkoutQueryParams): WorkoutQueryParams {
  const sanitized: WorkoutQueryParams = { ...params };
  
  // Normalize dates
  if (sanitized.startDate) {
    sanitized.startDate = new Date(sanitized.startDate);
  }
  if (sanitized.endDate) {
    sanitized.endDate = new Date(sanitized.endDate);
  }
  
  // Clamp durations to reasonable values
  if (sanitized.minDuration !== undefined) {
    sanitized.minDuration = Math.max(0, sanitized.minDuration);
  }
  if (sanitized.maxDuration !== undefined) {
    sanitized.maxDuration = Math.max(0, sanitized.maxDuration);
  }
  
  // Clamp page size
  if (sanitized.pageSize !== undefined) {
    sanitized.pageSize = Math.min(1000, Math.max(1, sanitized.pageSize));
  }
  
  // Remove duplicate exercise types
  if (sanitized.exerciseTypes) {
    sanitized.exerciseTypes = [...new Set(sanitized.exerciseTypes)];
  }
  
  // Remove duplicate data origins
  if (sanitized.dataOrigins) {
    sanitized.dataOrigins = [...new Set(sanitized.dataOrigins)];
  }
  
  return sanitized;
}

/**
 * Validates date range for reasonableness
 */
export function validateDateRange(startDate: Date, endDate: Date): {
  isValid: boolean;
  error?: string;
} {
  const now = new Date();
  const maxPastDate = new Date();
  maxPastDate.setFullYear(maxPastDate.getFullYear() - 10);
  
  if (startDate > now) {
    return { isValid: false, error: 'Start date cannot be in the future' };
  }
  
  if (endDate > now) {
    return { isValid: false, error: 'End date cannot be in the future' };
  }
  
  if (startDate < maxPastDate) {
    return { isValid: false, error: 'Start date cannot be more than 10 years in the past' };
  }
  
  if (startDate >= endDate) {
    return { isValid: false, error: 'Start date must be before end date' };
  }
  
  const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > 365) {
    return { isValid: false, error: 'Date range cannot exceed 365 days' };
  }
  
  return { isValid: true };
}

/**
 * Creates a default workout query with sensible defaults
 */
export function createDefaultWorkoutQuery(): WorkoutQueryParams {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Last 30 days
  
  return {
    startDate,
    endDate,
    pageSize: 50,
    includeMetrics: false,
    includeEvents: false,
    includeRoute: false
  };
}