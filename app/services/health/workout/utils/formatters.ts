/**
 * Formats duration in seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

/**
 * Formats duration in seconds to MM:SS or HH:MM:SS format
 */
export function formatDurationClock(seconds: number): string {
  if (seconds < 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Formats distance in meters to appropriate unit
 */
export function formatDistance(meters: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (meters < 0) return '0m';
  
  if (unit === 'imperial') {
    const miles = meters * 0.000621371;
    const feet = meters * 3.28084;
    
    if (miles >= 0.1) {
      return `${miles.toFixed(2)} mi`;
    } else {
      return `${Math.round(feet)} ft`;
    }
  } else {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    } else {
      return `${Math.round(meters)} m`;
    }
  }
}

/**
 * Formats speed in m/s to appropriate unit
 */
export function formatSpeed(mps: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (mps < 0) return '0';
  
  if (unit === 'imperial') {
    const mph = mps * 2.23694;
    return `${mph.toFixed(1)} mph`;
  } else {
    const kmh = mps * 3.6;
    return `${kmh.toFixed(1)} km/h`;
  }
}

/**
 * Formats pace (seconds per km) to MM:SS format
 */
export function formatPace(secondsPerKm: number): string {
  if (secondsPerKm <= 0 || !Number.isFinite(secondsPerKm)) return '--:--';
  
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formats calories to appropriate unit
 */
export function formatCalories(calories: number): string {
  if (calories < 0) return '0 cal';
  
  if (calories >= 1000) {
    return `${(calories / 1000).toFixed(1)}k cal`;
  } else {
    return `${Math.round(calories)} cal`;
  }
}

/**
 * Formats power in watts
 */
export function formatPower(watts: number): string {
  if (watts < 0) return '0W';
  return `${Math.round(watts)}W`;
}

/**
 * Formats cadence with appropriate unit
 */
export function formatCadence(cadence: number, unit: 'rpm' | 'spm' = 'rpm'): string {
  if (cadence < 0) return `0 ${unit}`;
  return `${Math.round(cadence)} ${unit}`;
}

/**
 * Formats heart rate
 */
export function formatHeartRate(bpm: number): string {
  if (bpm < 0) return '0 bpm';
  return `${Math.round(bpm)} bpm`;
}

/**
 * Formats elevation/altitude
 */
export function formatElevation(meters: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (unit === 'imperial') {
    const feet = meters * 3.28084;
    return `${Math.round(feet)} ft`;
  } else {
    return `${Math.round(meters)} m`;
  }
}

/**
 * Formats percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (value < 0) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a date to a readable string
 */
export function formatWorkoutDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

/**
 * Formats workout time (start time)
 */
export function formatWorkoutTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}