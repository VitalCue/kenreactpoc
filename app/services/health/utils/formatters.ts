import type { HealthDataAdapter } from '../core/types';

/**
 * Health data formatting utilities
 */
export const HealthDataFormatters = {
  /**
   * Format health data value with appropriate unit
   */
  formatValue: (value: number, unit: string, decimals: number = 1): string => {
    if (value === 0) return `0 ${unit}`;
    
    const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
    return `${formatted} ${unit}`;
  },

  /**
   * Format distance values with smart unit conversion
   */
  formatDistance: (meters: number, system: 'metric' | 'imperial' = 'metric'): string => {
    if (meters === 0) return '0 m';
    
    if (system === 'imperial') {
      const feet = meters * 3.28084;
      const miles = meters * 0.000621371;
      
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
  },

  /**
   * Format speed values
   */
  formatSpeed: (mps: number, system: 'metric' | 'imperial' = 'metric'): string => {
    if (mps === 0) return '0';
    
    if (system === 'imperial') {
      const mph = mps * 2.23694;
      return `${mph.toFixed(1)} mph`;
    } else {
      const kmh = mps * 3.6;
      return `${kmh.toFixed(1)} km/h`;
    }
  },

  /**
   * Format calorie values
   */
  formatCalories: (calories: number): string => {
    if (calories === 0) return '0 cal';
    
    if (calories >= 1000) {
      return `${(calories / 1000).toFixed(1)}k cal`;
    } else {
      return `${Math.round(calories)} cal`;
    }
  },

  /**
   * Format heart rate values
   */
  formatHeartRate: (bpm: number): string => {
    if (bpm === 0) return '0 bpm';
    return `${Math.round(bpm)} bpm`;
  },

  /**
   * Format weight values
   */
  formatWeight: (kg: number, system: 'metric' | 'imperial' = 'metric'): string => {
    if (kg === 0) return '0';
    
    if (system === 'imperial') {
      const lbs = kg * 2.20462;
      return `${lbs.toFixed(1)} lbs`;
    } else {
      return `${kg.toFixed(1)} kg`;
    }
  },

  /**
   * Format height values
   */
  formatHeight: (meters: number, system: 'metric' | 'imperial' = 'metric'): string => {
    if (meters === 0) return '0';
    
    if (system === 'imperial') {
      const totalInches = meters * 39.3701;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return `${feet}'${inches}"`;
    } else {
      const cm = Math.round(meters * 100);
      return `${cm} cm`;
    }
  },

  /**
   * Format temperature values
   */
  formatTemperature: (celsius: number, system: 'metric' | 'imperial' = 'metric'): string => {
    if (system === 'imperial') {
      const fahrenheit = (celsius * 9/5) + 32;
      return `${fahrenheit.toFixed(1)}°F`;
    } else {
      return `${celsius.toFixed(1)}°C`;
    }
  },

  /**
   * Format blood pressure values
   */
  formatBloodPressure: (systolic: number, diastolic: number): string => {
    return `${Math.round(systolic)}/${Math.round(diastolic)} mmHg`;
  },

  /**
   * Format percentage values
   */
  formatPercentage: (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
  },

  /**
   * Smart format health data based on type
   */
  formatHealthData: (data: HealthDataAdapter, system: 'metric' | 'imperial' = 'metric'): string => {
    const { amount, unit, dataType } = data;
    
    switch (dataType.toLowerCase()) {
      case 'distance':
      case 'distancewalkingrunning':
        return HealthDataFormatters.formatDistance(amount, system);
      
      case 'speed':
      case 'walkingspeed':
      case 'runningspeed':
        return HealthDataFormatters.formatSpeed(amount, system);
      
      case 'calories':
      case 'activecalories':
      case 'activeenergyburned':
        return HealthDataFormatters.formatCalories(amount);
      
      case 'heartrate':
        return HealthDataFormatters.formatHeartRate(amount);
      
      case 'weight':
      case 'bodyweight':
      case 'bodymass':
        return HealthDataFormatters.formatWeight(amount, system);
      
      case 'height':
      case 'bodyheight':
        return HealthDataFormatters.formatHeight(amount, system);
      
      case 'bodytemperature':
        return HealthDataFormatters.formatTemperature(amount, system);
      
      case 'steps':
      case 'stepcount':
        return `${Math.round(amount)} steps`;
      
      case 'oxygensaturation':
      case 'bodyfatpercentage':
        return HealthDataFormatters.formatPercentage(amount);
      
      default:
        return HealthDataFormatters.formatValue(amount, unit);
    }
  }
};

/**
 * Date formatting utilities for health data
 */
export const HealthDateFormatters = {
  /**
   * Format date for health data display
   */
  formatHealthDate: (date: Date | string): string => {
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
  },

  /**
   * Format time for health data
   */
  formatHealthTime: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  },

  /**
   * Format date range
   */
  formatDateRange: (startDate: Date | string, endDate: Date | string): string => {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    const startStr = HealthDateFormatters.formatHealthDate(start);
    const endStr = HealthDateFormatters.formatHealthDate(end);
    
    if (startStr === endStr) {
      return startStr;
    } else {
      return `${startStr} - ${endStr}`;
    }
  }
};