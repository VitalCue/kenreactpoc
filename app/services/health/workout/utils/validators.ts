import type { WorkoutSessionAdapter, MetricRecordAdapter } from '../types';

/**
 * Validates workout session data for completeness and accuracy
 */
export function validateWorkoutSession(workout: WorkoutSessionAdapter): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  if (!workout.uuid) errors.push('Missing workout UUID');
  if (!workout.startDate) errors.push('Missing start date');
  if (!workout.endDate) errors.push('Missing end date');
  if (!workout.exerciseType) errors.push('Missing exercise type');
  
  // Date validation
  if (workout.startDate && workout.endDate) {
    const startTime = new Date(workout.startDate).getTime();
    const endTime = new Date(workout.endDate).getTime();
    
    if (startTime >= endTime) {
      errors.push('Start date must be before end date');
    }
    
    const duration = (endTime - startTime) / 1000;
    if (Math.abs(duration - workout.duration) > 60) { // Allow 1 minute tolerance
      warnings.push('Duration mismatch between dates and duration field');
    }
  }
  
  // Duration validation
  if (workout.duration <= 0) {
    errors.push('Duration must be positive');
  } else if (workout.duration > 24 * 60 * 60) { // 24 hours
    warnings.push('Workout duration exceeds 24 hours');
  } else if (workout.duration < 60) { // 1 minute
    warnings.push('Workout duration is less than 1 minute');
  }
  
  // Distance validation
  if (workout.totalDistance !== undefined) {
    if (workout.totalDistance < 0) {
      errors.push('Total distance cannot be negative');
    } else if (workout.totalDistance > 1000000) { // 1000 km
      warnings.push('Total distance exceeds 1000 km');
    }
  }
  
  // Calories validation
  if (workout.totalActiveCalories !== undefined) {
    if (workout.totalActiveCalories < 0) {
      errors.push('Total calories cannot be negative');
    } else if (workout.totalActiveCalories > 10000) {
      warnings.push('Total calories exceeds 10,000 kcal');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates metric record data
 */
export function validateMetricRecord(metric: MetricRecordAdapter): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  if (!metric.uuid) errors.push('Missing metric UUID');
  if (!metric.startDate) errors.push('Missing start date');
  if (!metric.dataType) errors.push('Missing data type');
  if (metric.amount === undefined || metric.amount === null) errors.push('Missing amount');
  if (!metric.unit) errors.push('Missing unit');
  
  // Amount validation based on data type
  switch (metric.dataType) {
    case 'heartRate':
      if (metric.amount < 30 || metric.amount > 250) {
        warnings.push('Heart rate outside normal range (30-250 bpm)');
      }
      break;
      
    case 'distance':
      if (metric.amount < 0) {
        errors.push('Distance cannot be negative');
      } else if (metric.amount > 100000) { // 100 km
        warnings.push('Distance sample exceeds 100 km');
      }
      break;
      
    case 'speed':
      if (metric.amount < 0) {
        errors.push('Speed cannot be negative');
      } else if (metric.amount > 50) { // 180 km/h
        warnings.push('Speed exceeds 50 m/s (180 km/h)');
      }
      break;
      
    case 'power':
      if (metric.amount < 0) {
        errors.push('Power cannot be negative');
      } else if (metric.amount > 3000) {
        warnings.push('Power exceeds 3000 watts');
      }
      break;
      
    case 'cadence':
      if (metric.amount < 0) {
        errors.push('Cadence cannot be negative');
      } else if (metric.amount > 300) {
        warnings.push('Cadence exceeds 300 rpm/spm');
      }
      break;
      
    case 'activeCalories':
      if (metric.amount < 0) {
        errors.push('Calories cannot be negative');
      } else if (metric.amount > 1000) { // Per sample
        warnings.push('Calories per sample exceeds 1000 kcal');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates that metrics are within workout time range
 */
export function validateMetricsTimeRange(
  workout: WorkoutSessionAdapter,
  metrics: MetricRecordAdapter[]
): {
  isValid: boolean;
  errors: string[];
  outsideRangeCount: number;
} {
  const errors: string[] = [];
  let outsideRangeCount = 0;
  
  const workoutStart = new Date(workout.startDate).getTime();
  const workoutEnd = new Date(workout.endDate).getTime();
  
  // Allow 5 minutes buffer before/after workout
  const bufferMs = 5 * 60 * 1000;
  const allowedStart = workoutStart - bufferMs;
  const allowedEnd = workoutEnd + bufferMs;
  
  for (const metric of metrics) {
    const metricTime = new Date(metric.startDate).getTime();
    
    if (metricTime < allowedStart || metricTime > allowedEnd) {
      outsideRangeCount++;
    }
  }
  
  const outsidePercentage = (outsideRangeCount / metrics.length) * 100;
  
  if (outsidePercentage > 10) { // More than 10% outside range
    errors.push(`${outsidePercentage.toFixed(1)}% of metrics are outside workout time range`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    outsideRangeCount
  };
}

/**
 * Validates GPS route data
 */
export function validateRouteData(route: { locations: Array<{ latitude: number; longitude: number; timestamp: string }> }): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!route.locations || route.locations.length === 0) {
    errors.push('Route has no location data');
    return { isValid: false, errors, warnings };
  }
  
  let invalidLocationCount = 0;
  let duplicateCount = 0;
  
  for (let i = 0; i < route.locations.length; i++) {
    const location = route.locations[i];
    
    // Validate coordinates
    if (Math.abs(location.latitude) > 90) {
      invalidLocationCount++;
    }
    if (Math.abs(location.longitude) > 180) {
      invalidLocationCount++;
    }
    
    // Check for duplicates (consecutive identical coordinates)
    if (i > 0) {
      const prev = route.locations[i - 1];
      if (location.latitude === prev.latitude && location.longitude === prev.longitude) {
        duplicateCount++;
      }
    }
  }
  
  if (invalidLocationCount > 0) {
    errors.push(`${invalidLocationCount} invalid coordinates found`);
  }
  
  if (duplicateCount > route.locations.length * 0.5) {
    warnings.push('More than 50% of locations are duplicates');
  }
  
  if (route.locations.length < 2) {
    warnings.push('Route has fewer than 2 locations');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Checks for data consistency between workout and metrics
 */
export function validateWorkoutMetricsConsistency(
  workout: WorkoutSessionAdapter,
  heartRateRecords?: MetricRecordAdapter[],
  distanceRecords?: MetricRecordAdapter[]
): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // Check heart rate consistency
  if (heartRateRecords && heartRateRecords.length > 0) {
    const avgHR = heartRateRecords.reduce((sum, r) => sum + r.amount, 0) / heartRateRecords.length;
    
    if (avgHR < 50) {
      warnings.push('Average heart rate seems low for a workout');
    } else if (avgHR > 200) {
      warnings.push('Average heart rate seems high');
    }
  }
  
  // Check distance consistency
  if (distanceRecords && distanceRecords.length > 0 && workout.totalDistance) {
    const totalFromSamples = distanceRecords.reduce((sum, r) => sum + r.amount, 0);
    const difference = Math.abs(totalFromSamples - workout.totalDistance);
    const percentDiff = (difference / workout.totalDistance) * 100;
    
    if (percentDiff > 20) {
      warnings.push('Large discrepancy between workout total distance and sum of distance samples');
    }
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
}