import type { HeartRateZone } from '../../types';

/**
 * Calculates heart rate zones based on heart rate data
 */
export function calculateHeartRateZones(
  heartRates: number[], 
  totalDuration: number,
  maxHeartRate?: number
): HeartRateZone[] | undefined {
  if (heartRates.length === 0) return undefined;
  
  // Use provided max HR or calculate from data
  const maxHR = maxHeartRate || Math.max(...heartRates);
  
  const zones = [
    { zone: 1, minBpm: 0, maxBpm: maxHR * 0.6 },
    { zone: 2, minBpm: maxHR * 0.6, maxBpm: maxHR * 0.7 },
    { zone: 3, minBpm: maxHR * 0.7, maxBpm: maxHR * 0.8 },
    { zone: 4, minBpm: maxHR * 0.8, maxBpm: maxHR * 0.9 },
    { zone: 5, minBpm: maxHR * 0.9, maxBpm: maxHR }
  ];
  
  return zones.map(zone => {
    const timeInZone = heartRates.filter(hr => hr >= zone.minBpm && hr <= zone.maxBpm).length;
    const percentage = (timeInZone / heartRates.length) * 100;
    
    return {
      zone: zone.zone,
      minBpm: Math.round(zone.minBpm),
      maxBpm: Math.round(zone.maxBpm),
      timeInZone: Math.round((timeInZone / heartRates.length) * totalDuration),
      percentage: Math.round(percentage)
    };
  });
}

/**
 * Calculates heart rate zone based on age (220 - age formula)
 */
export function calculateMaxHeartRateByAge(age: number): number {
  return 220 - age;
}

/**
 * Calculates heart rate reserve zones (Karvonen method)
 */
export function calculateHeartRateReserveZones(
  maxHeartRate: number,
  restingHeartRate: number
): Array<{ zone: number; minBpm: number; maxBpm: number; intensity: string }> {
  const heartRateReserve = maxHeartRate - restingHeartRate;
  
  return [
    { 
      zone: 1, 
      minBpm: Math.round(restingHeartRate + (heartRateReserve * 0.5)),
      maxBpm: Math.round(restingHeartRate + (heartRateReserve * 0.6)),
      intensity: 'Active Recovery'
    },
    { 
      zone: 2, 
      minBpm: Math.round(restingHeartRate + (heartRateReserve * 0.6)),
      maxBpm: Math.round(restingHeartRate + (heartRateReserve * 0.7)),
      intensity: 'Aerobic Base'
    },
    { 
      zone: 3, 
      minBpm: Math.round(restingHeartRate + (heartRateReserve * 0.7)),
      maxBpm: Math.round(restingHeartRate + (heartRateReserve * 0.8)),
      intensity: 'Aerobic'
    },
    { 
      zone: 4, 
      minBpm: Math.round(restingHeartRate + (heartRateReserve * 0.8)),
      maxBpm: Math.round(restingHeartRate + (heartRateReserve * 0.9)),
      intensity: 'Lactate Threshold'
    },
    { 
      zone: 5, 
      minBpm: Math.round(restingHeartRate + (heartRateReserve * 0.9)),
      maxBpm: maxHeartRate,
      intensity: 'VO2 Max'
    }
  ];
}

/**
 * Calculates heart rate statistics
 */
export function calculateHeartRateStats(heartRates: number[]): {
  avg: number;
  min: number;
  max: number;
  median: number;
  stdDev: number;
} | undefined {
  if (heartRates.length === 0) return undefined;
  
  const sorted = [...heartRates].sort((a, b) => a - b);
  const avg = heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = sorted.length % 2 === 0 
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  // Standard deviation
  const variance = heartRates.reduce((sum, hr) => sum + Math.pow(hr - avg, 2), 0) / heartRates.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    avg: Math.round(avg),
    min,
    max,
    median: Math.round(median),
    stdDev: Math.round(stdDev)
  };
}

/**
 * Determines training load based on heart rate zones
 */
export function calculateTrainingLoad(heartRateZones: HeartRateZone[]): {
  score: number;
  category: 'Easy' | 'Moderate' | 'Hard' | 'Very Hard';
} {
  // Weight zones by intensity
  const zoneWeights = [1, 2, 3, 4, 5];
  let totalScore = 0;
  let totalTime = 0;
  
  heartRateZones.forEach((zone, index) => {
    const weight = zoneWeights[index] || 1;
    totalScore += zone.timeInZone * weight;
    totalTime += zone.timeInZone;
  });
  
  const score = totalTime > 0 ? Math.round(totalScore / totalTime) : 0;
  
  let category: 'Easy' | 'Moderate' | 'Hard' | 'Very Hard';
  if (score <= 2) category = 'Easy';
  else if (score <= 3) category = 'Moderate';
  else if (score <= 4) category = 'Hard';
  else category = 'Very Hard';
  
  return { score, category };
}

/**
 * Validates heart rate data for outliers
 */
export function validateHeartRateData(
  heartRates: number[],
  minValidHR: number = 40,
  maxValidHR: number = 220
): number[] {
  return heartRates.filter(hr => hr >= minValidHR && hr <= maxValidHR);
}