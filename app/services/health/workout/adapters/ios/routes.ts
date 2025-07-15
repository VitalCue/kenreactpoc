import type {
  WorkoutRouteAdapter,
  WorkoutLocationAdapter
} from '../../types';
import type { RawRoute, RawLocation } from './types';

/**
 * Converts HealthKit route to unified format
 */
export function adaptHealthKitRoute(route: RawRoute): WorkoutRouteAdapter {
  return {
    startDate: route.startDate,
    endDate: route.endDate,
    locations: route.locations.map(adaptHealthKitLocation)
  };
}

/**
 * Converts HealthKit location to unified format
 */
export function adaptHealthKitLocation(location: RawLocation): WorkoutLocationAdapter {
  return {
    latitude: location.latitude,
    longitude: location.longitude,
    altitude: location.altitude,
    speed: location.speed,
    course: location.course,
    timestamp: location.timestamp,
    accuracy: location.accuracy
  };
}

/**
 * Calculates total distance from GPS points using Haversine formula
 */
export function calculateDistanceFromLocations(locations: WorkoutLocationAdapter[]): number {
  if (locations.length < 2) return 0;
  
  let totalDistance = 0;
  
  for (let i = 1; i < locations.length; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];
    totalDistance += haversineDistance(prev, curr);
  }
  
  return totalDistance;
}

/**
 * Calculates distance between two GPS points using Haversine formula
 * Returns distance in meters
 */
function haversineDistance(
  point1: Pick<WorkoutLocationAdapter, 'latitude' | 'longitude'>,
  point2: Pick<WorkoutLocationAdapter, 'latitude' | 'longitude'>
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) * Math.cos(toRadians(point2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Smooths GPS route by removing outlier points
 */
export function smoothRoute(locations: WorkoutLocationAdapter[], maxSpeedMps: number = 50): WorkoutLocationAdapter[] {
  if (locations.length < 3) return locations;
  
  const smoothed = [locations[0]]; // Always keep first point
  
  for (let i = 1; i < locations.length - 1; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];
    const next = locations[i + 1];
    
    // Calculate speeds to previous and next points
    const timeToPrev = (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000;
    const timeToNext = (new Date(next.timestamp).getTime() - new Date(curr.timestamp).getTime()) / 1000;
    
    if (timeToPrev > 0 && timeToNext > 0) {
      const distToPrev = haversineDistance(prev, curr);
      const distToNext = haversineDistance(curr, next);
      
      const speedToPrev = distToPrev / timeToPrev;
      const speedToNext = distToNext / timeToNext;
      
      // Keep point if speeds are reasonable
      if (speedToPrev <= maxSpeedMps && speedToNext <= maxSpeedMps) {
        smoothed.push(curr);
      }
    } else {
      smoothed.push(curr); // Keep if timing data is invalid
    }
  }
  
  smoothed.push(locations[locations.length - 1]); // Always keep last point
  return smoothed;
}