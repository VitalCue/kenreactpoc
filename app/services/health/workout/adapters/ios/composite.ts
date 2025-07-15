import type {
  WorkoutSessionAdapter,
  CompositeWorkoutAdapter,
  HeartRateRecordAdapter,
  DistanceRecordAdapter,
  ActiveCaloriesRecordAdapter,
  SpeedRecordAdapter,
  StepCountRecordAdapter,
  PowerRecordAdapter,
  CadenceRecordAdapter
} from '../../types';
import { calculateHeartRateZones } from './heart-rate';

/**
 * Combines workout session with related metrics into a composite object
 */
export function buildCompositeWorkoutFromHealthKit(
  session: WorkoutSessionAdapter,
  metrics: {
    heartRate?: HeartRateRecordAdapter[];
    distance?: DistanceRecordAdapter[];
    activeCalories?: ActiveCaloriesRecordAdapter[];
    speed?: SpeedRecordAdapter[];
    stepCount?: StepCountRecordAdapter[];
    power?: PowerRecordAdapter[];
    cadence?: CadenceRecordAdapter[];
  }
): CompositeWorkoutAdapter {
  // Calculate aggregated values
  const totalDistance = metrics.distance?.reduce((sum, record) => sum + record.amount, 0) || session.totalDistance;
  const totalCalories = metrics.activeCalories?.reduce((sum, record) => sum + record.amount, 0) || session.totalActiveCalories;
  
  const heartRates = metrics.heartRate?.map(r => r.amount) || [];
  const speeds = metrics.speed?.map(r => r.amount) || [];
  const powers = metrics.power?.map(r => r.amount) || [];
  const cadences = metrics.cadence?.map(r => r.amount) || [];
  
  const avgHeartRate = heartRates.length > 0 ? heartRates.reduce((a, b) => a + b, 0) / heartRates.length : undefined;
  const maxHeartRate = heartRates.length > 0 ? Math.max(...heartRates) : undefined;
  const minHeartRate = heartRates.length > 0 ? Math.min(...heartRates) : undefined;
  
  const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : undefined;
  const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : undefined;
  
  const avgPower = powers.length > 0 ? powers.reduce((a, b) => a + b, 0) / powers.length : undefined;
  const maxPower = powers.length > 0 ? Math.max(...powers) : undefined;
  
  const avgCadence = cadences.length > 0 ? cadences.reduce((a, b) => a + b, 0) / cadences.length : undefined;
  
  // Calculate heart rate zones
  const heartRateZones = heartRates.length > 0 ? calculateHeartRateZones(heartRates, session.duration) : undefined;
  
  return {
    session,
    totalDistanceMeters: totalDistance,
    totalActiveCalories: totalCalories,
    totalDurationSeconds: session.duration,
    
    avgHeartRate: avgHeartRate ? Math.round(avgHeartRate) : undefined,
    maxHeartRate,
    minHeartRate,
    heartRateZones,
    
    avgSpeed: avgSpeed ? Math.round(avgSpeed * 100) / 100 : undefined, // Round to 2 decimal places
    maxSpeed: maxSpeed ? Math.round(maxSpeed * 100) / 100 : undefined,
    avgPower: avgPower ? Math.round(avgPower) : undefined,
    maxPower,
    avgCadence: avgCadence ? Math.round(avgCadence) : undefined,
    
    heartRateRecords: metrics.heartRate,
    distanceRecords: metrics.distance,
    speedRecords: metrics.speed,
    powerRecords: metrics.power,
    cadenceRecords: metrics.cadence
  };
}

/**
 * Calculates workout efficiency metrics
 */
export function calculateWorkoutEfficiency(composite: CompositeWorkoutAdapter): {
  pacePerKm?: number; // seconds per km
  caloriesPerMinute?: number;
  heartRateEfficiency?: number; // calories per heartbeat
  powerToWeightRatio?: number; // watts per kg (requires weight input)
} {
  const { session, totalDistanceMeters, totalActiveCalories, avgHeartRate, avgPower } = composite;
  const durationMinutes = session.duration / 60;
  const distanceKm = totalDistanceMeters ? totalDistanceMeters / 1000 : undefined;
  
  const result: ReturnType<typeof calculateWorkoutEfficiency> = {};
  
  // Pace per kilometer (for running/walking activities)
  if (distanceKm && distanceKm > 0) {
    result.pacePerKm = session.duration / distanceKm; // seconds per km
  }
  
  // Calories per minute
  if (totalActiveCalories && durationMinutes > 0) {
    result.caloriesPerMinute = totalActiveCalories / durationMinutes;
  }
  
  // Heart rate efficiency (calories per average heartbeat per minute)
  if (totalActiveCalories && avgHeartRate && durationMinutes > 0) {
    const totalHeartbeats = avgHeartRate * durationMinutes;
    result.heartRateEfficiency = totalActiveCalories / totalHeartbeats;
  }
  
  return result;
}

/**
 * Aggregates metrics by time intervals
 */
export function aggregateMetricsByInterval(
  metrics: Array<{ startDate: string; amount: number }>,
  intervalSeconds: number = 60
): Array<{ timestamp: string; value: number; count: number }> {
  if (metrics.length === 0) return [];
  
  // Sort by timestamp
  const sorted = metrics.slice().sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  
  const result: Array<{ timestamp: string; value: number; count: number }> = [];
  const startTime = new Date(sorted[0].startDate).getTime();
  
  // Group by intervals
  const intervals = new Map<number, { sum: number; count: number }>();
  
  sorted.forEach(metric => {
    const metricTime = new Date(metric.startDate).getTime();
    const intervalIndex = Math.floor((metricTime - startTime) / (intervalSeconds * 1000));
    
    const existing = intervals.get(intervalIndex) || { sum: 0, count: 0 };
    existing.sum += metric.amount;
    existing.count += 1;
    intervals.set(intervalIndex, existing);
  });
  
  // Convert to array
  intervals.forEach((data, intervalIndex) => {
    const timestamp = new Date(startTime + (intervalIndex * intervalSeconds * 1000)).toISOString();
    result.push({
      timestamp,
      value: data.sum / data.count, // Average for the interval
      count: data.count
    });
  });
  
  return result.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/**
 * Calculates splits for distance-based workouts
 */
export function calculateDistanceSplits(
  distanceRecords: DistanceRecordAdapter[],
  splitDistance: number = 1000 // meters
): Array<{
  splitNumber: number;
  distance: number;
  startTime: string;
  endTime: string;
  duration: number;
  pace: number; // seconds per km
}> {
  if (distanceRecords.length === 0) return [];
  
  const sorted = distanceRecords.slice().sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  
  const splits: ReturnType<typeof calculateDistanceSplits> = [];
  let currentDistance = 0;
  let splitStart = 0;
  let splitNumber = 1;
  
  for (let i = 0; i < sorted.length; i++) {
    currentDistance += sorted[i].amount;
    
    if (currentDistance >= splitDistance) {
      const startTime = sorted[splitStart].startDate;
      const endTime = sorted[i].endDate;
      const duration = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000;
      const pace = duration / (splitDistance / 1000); // seconds per km
      
      splits.push({
        splitNumber,
        distance: splitDistance,
        startTime,
        endTime,
        duration,
        pace
      });
      
      splitNumber++;
      currentDistance = 0;
      splitStart = i + 1;
    }
  }
  
  return splits;
}