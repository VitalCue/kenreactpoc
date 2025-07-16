import type { HealthServiceHook, HealthDataAdapter } from '../core/types';

/**
 * Date-based health data fetching utilities
 */
export const HealthDataFetchers = {
  /**
   * Get today's health data for common metrics
   */
  getTodaysData: async (healthService: HealthServiceHook, dataTypes?: string[]) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    const params = {
      startDate: startOfDay,
      endDate: endOfDay,
      pageSize: 1000,
    };

    const defaultTypes = ['steps', 'distance', 'calories', 'walkingSpeed', 'runningSpeed'];
    return await healthService.getBatchData(dataTypes || defaultTypes, params);
  },

  /**
   * Get weekly health data for the current week
   */
  getWeeklyData: async (healthService: HealthServiceHook, dataTypes?: string[]) => {
    const today = new Date();
    const startOfWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek.getTime() + (7 * 24 * 60 * 60 * 1000) - 1);

    const params = {
      startDate: startOfWeek,
      endDate: endOfWeek,
      pageSize: 5000,
    };

    const defaultTypes = ['steps', 'distance', 'calories', 'walkingSpeed', 'runningSpeed'];
    return await healthService.getBatchData(dataTypes || defaultTypes, params);
  },

  /**
   * Get monthly health data
   */
  getMonthlyData: async (healthService: HealthServiceHook, dataTypes?: string[]) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const params = {
      startDate: startOfMonth,
      endDate: endOfMonth,
      pageSize: 5000,
    };

    const defaultTypes = ['steps', 'distance', 'calories', 'heartRate'];
    return await healthService.getBatchData(dataTypes || defaultTypes, params);
  },

  /**
   * Get data for last N days
   */
  getLastNDaysData: async (healthService: HealthServiceHook, days: number, dataTypes?: string[]) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const params = {
      startDate,
      endDate,
      pageSize: days * 100, // Rough estimate
    };

    const defaultTypes = ['steps', 'distance', 'calories'];
    return await healthService.getBatchData(dataTypes || defaultTypes, params);
  }
};

/**
 * Data aggregation and calculation utilities
 */
export const HealthDataAggregators = {
  /**
   * Calculate averages from health data array
   */
  calculateAverages: (data: HealthDataAdapter[]) => {
    if (!data || data.length === 0) return { average: 0, total: 0, count: 0 };
    
    const total = data.reduce((sum, record) => sum + record.amount, 0);
    const average = total / data.length;
    
    return {
      average: parseFloat(average.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      count: data.length
    };
  },

  /**
   * Calculate statistics from health data
   */
  calculateStatistics: (data: HealthDataAdapter[]) => {
    if (!data || data.length === 0) {
      return { min: 0, max: 0, average: 0, total: 0, count: 0, median: 0 };
    }

    const values = data.map(record => record.amount).sort((a, b) => a - b);
    const total = values.reduce((sum, value) => sum + value, 0);
    const average = total / values.length;
    const median = values.length % 2 === 0 
      ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
      : values[Math.floor(values.length / 2)];

    return {
      min: values[0],
      max: values[values.length - 1],
      average: parseFloat(average.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      count: values.length,
      median: parseFloat(median.toFixed(2))
    };
  },

  /**
   * Group data by day for analysis
   */
  groupByDay: (data: HealthDataAdapter[]) => {
    const grouped: Record<string, HealthDataAdapter[]> = {};
    
    data.forEach(record => {
      const date = new Date(record.startDate).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(record);
    });
    
    return grouped;
  },

  /**
   * Group data by week
   */
  groupByWeek: (data: HealthDataAdapter[]) => {
    const grouped: Record<string, HealthDataAdapter[]> = {};
    
    data.forEach(record => {
      const date = new Date(record.startDate);
      const weekStart = new Date(date.getTime() - (date.getDay() * 24 * 60 * 60 * 1000));
      weekStart.setHours(0, 0, 0, 0);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!grouped[weekKey]) {
        grouped[weekKey] = [];
      }
      grouped[weekKey].push(record);
    });
    
    return grouped;
  },

  /**
   * Calculate daily totals from grouped data
   */
  calculateDailyTotals: (groupedData: Record<string, HealthDataAdapter[]>) => {
    const dailyTotals: Record<string, number> = {};
    
    Object.entries(groupedData).forEach(([date, records]) => {
      dailyTotals[date] = records.reduce((sum, record) => sum + record.amount, 0);
    });
    
    return dailyTotals;
  }
};

/**
 * Comprehensive health summary generator
 */
export const getHealthSummary = async (healthService: HealthServiceHook) => {
  const [todaysData, weeklyData] = await Promise.all([
    HealthDataFetchers.getTodaysData(healthService),
    HealthDataFetchers.getWeeklyData(healthService)
  ]);

  const summary = {
    today: {
      distance: HealthDataAggregators.calculateAverages(todaysData.distance || []),
      calories: HealthDataAggregators.calculateAverages(todaysData.calories || []),
      walkingSpeed: HealthDataAggregators.calculateAverages(todaysData.walkingSpeed || []),
      runningSpeed: HealthDataAggregators.calculateAverages(todaysData.runningSpeed || []),
    },
    weekly: {
      distance: HealthDataAggregators.calculateAverages(weeklyData.distance || []),
      calories: HealthDataAggregators.calculateAverages(weeklyData.calories || []),
      walkingSpeed: HealthDataAggregators.calculateAverages(weeklyData.walkingSpeed || []),
      runningSpeed: HealthDataAggregators.calculateAverages(weeklyData.runningSpeed || []),
      dailyBreakdown: {
        distance: HealthDataAggregators.groupByDay(weeklyData.distance || []),
        calories: HealthDataAggregators.groupByDay(weeklyData.calories || []),
        walkingSpeed: HealthDataAggregators.groupByDay(weeklyData.walkingSpeed || []),
        runningSpeed: HealthDataAggregators.groupByDay(weeklyData.runningSpeed || []),
      }
    }
  };

  return summary;
};