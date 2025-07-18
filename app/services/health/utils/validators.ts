import type { HealthDataAdapter } from '../types';

/**
 * Health data validation utilities
 */
export const HealthDataValidators = {
  /**
   * Validate health data adapter structure
   */
  validateHealthData: (data: HealthDataAdapter): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required fields
    if (!data.uuid) errors.push('Missing UUID');
    if (!data.dataType) errors.push('Missing data type');
    if (!data.startDate) errors.push('Missing start date');
    if (!data.endDate) errors.push('Missing end date');
    if (data.amount === undefined || data.amount === null) errors.push('Missing amount');
    if (!data.unit) errors.push('Missing unit');
    
    // Date validation
    if (data.startDate && data.endDate) {
      const startTime = new Date(data.startDate).getTime();
      const endTime = new Date(data.endDate).getTime();
      
      if (isNaN(startTime)) errors.push('Invalid start date format');
      if (isNaN(endTime)) errors.push('Invalid end date format');
      
      if (startTime > endTime) {
        errors.push('Start date must be before end date');
      }
      
      const now = Date.now();
      if (startTime > now) {
        warnings.push('Start date is in the future');
      }
      if (endTime > now) {
        warnings.push('End date is in the future');
      }
    }
    
    // Amount validation
    if (typeof data.amount !== 'number') {
      errors.push('Amount must be a number');
    } else if (data.amount < 0) {
      warnings.push('Negative amount value');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Validate specific health data types
   */
  validateByDataType: (data: HealthDataAdapter): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const { amount, dataType } = data;
    
    switch (dataType.toLowerCase()) {
      case 'heartrate':
        if (amount < 30 || amount > 250) {
          warnings.push('Heart rate outside normal range (30-250 bpm)');
        }
        break;
        
      case 'bloodpressuresystolic':
        if (amount < 70 || amount > 200) {
          warnings.push('Systolic blood pressure outside normal range (70-200 mmHg)');
        }
        break;
        
      case 'bloodpressurediastolic':
        if (amount < 40 || amount > 130) {
          warnings.push('Diastolic blood pressure outside normal range (40-130 mmHg)');
        }
        break;
        
      case 'bodytemperature':
        if (amount < 35 || amount > 42) {
          warnings.push('Body temperature outside normal range (35-42°C)');
        }
        break;
        
      case 'oxygensaturation':
        if (amount < 70 || amount > 100) {
          warnings.push('Oxygen saturation outside valid range (70-100%)');
        }
        break;
        
      case 'weight':
      case 'bodyweight':
        if (amount < 20 || amount > 300) {
          warnings.push('Weight outside reasonable range (20-300 kg)');
        }
        break;
        
      case 'height':
      case 'bodyheight':
        if (amount < 0.5 || amount > 2.5) {
          warnings.push('Height outside reasonable range (0.5-2.5 m)');
        }
        break;
        
      case 'steps':
      case 'stepcount':
        if (amount > 100000) {
          warnings.push('Step count seems unusually high (>100,000)');
        }
        break;
        
      case 'distance':
        if (amount > 100000) {
          warnings.push('Distance seems unusually high (>100 km)');
        }
        break;
        
      case 'speed':
      case 'walkingspeed':
      case 'runningspeed':
        if (amount > 20) {
          warnings.push('Speed seems unusually high (>20 m/s)');
        }
        break;
        
      case 'calories':
      case 'activecalories':
        if (amount > 10000) {
          warnings.push('Calorie count seems unusually high (>10,000 kcal)');
        }
        break;
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Validate array of health data
   */
  validateHealthDataArray: (dataArray: HealthDataAdapter[]): {
    isValid: boolean;
    validCount: number;
    invalidCount: number;
    errors: Array<{ index: number; errors: string[]; warnings: string[] }>;
  } => {
    let validCount = 0;
    let invalidCount = 0;
    const errors: Array<{ index: number; errors: string[]; warnings: string[] }> = [];
    
    dataArray.forEach((data, index) => {
      const structureValidation = HealthDataValidators.validateHealthData(data);
      const typeValidation = HealthDataValidators.validateByDataType(data);
      
      const allErrors = [...structureValidation.errors, ...typeValidation.errors];
      const allWarnings = [...structureValidation.warnings, ...typeValidation.warnings];
      
      if (allErrors.length > 0) {
        invalidCount++;
        errors.push({ index, errors: allErrors, warnings: allWarnings });
      } else {
        validCount++;
        if (allWarnings.length > 0) {
          errors.push({ index, errors: [], warnings: allWarnings });
        }
      }
    });
    
    return {
      isValid: invalidCount === 0,
      validCount,
      invalidCount,
      errors
    };
  },

  /**
   * Filter out invalid health data from array
   */
  filterValidHealthData: (dataArray: HealthDataAdapter[]): HealthDataAdapter[] => {
    return dataArray.filter(data => {
      const validation = HealthDataValidators.validateHealthData(data);
      return validation.isValid;
    });
  },

  /**
   * Check for potential duplicate health data entries
   */
  findDuplicates: (dataArray: HealthDataAdapter[]): Array<{
    indices: number[];
    reason: string;
  }> => {
    const duplicates: Array<{ indices: number[]; reason: string }> = [];
    const seen = new Map<string, number[]>();
    
    dataArray.forEach((data, index) => {
      // Check for exact UUID duplicates
      if (data.uuid) {
        const key = `uuid:${data.uuid}`;
        if (!seen.has(key)) {
          seen.set(key, []);
        }
        seen.get(key)!.push(index);
      }
      
      // Check for same timestamp and value duplicates
      const timeValueKey = `${data.startDate}:${data.endDate}:${data.dataType}:${data.amount}`;
      const timeKey = `time:${timeValueKey}`;
      if (!seen.has(timeKey)) {
        seen.set(timeKey, []);
      }
      seen.get(timeKey)!.push(index);
    });
    
    // Find groups with more than one entry
    seen.forEach((indices, key) => {
      if (indices.length > 1) {
        const reason = key.startsWith('uuid:') 
          ? 'Duplicate UUID' 
          : 'Same timestamp, type, and value';
        duplicates.push({ indices, reason });
      }
    });
    
    return duplicates;
  },

  /**
   * Remove duplicates from health data array
   */
  removeDuplicates: (dataArray: HealthDataAdapter[]): HealthDataAdapter[] => {
    const seen = new Set<string>();
    const unique: HealthDataAdapter[] = [];
    
    dataArray.forEach(data => {
      // Use UUID if available, otherwise use timestamp + type + value
      const key = data.uuid || `${data.startDate}:${data.endDate}:${data.dataType}:${data.amount}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(data);
      }
    });
    
    return unique;
  }
};