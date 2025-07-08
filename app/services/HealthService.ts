// services/HealthService.ts
import { Platform } from 'react-native';
import { HealthServiceHook } from './HealthServices.types';

// Platform-specific imports
export const useHealthService = (): HealthServiceHook => {
  if (Platform.OS === 'ios') {
    const { useHealthService: useIOSHealthService } = require('./HealthService.ios');
    return useIOSHealthService();
  } else if (Platform.OS === 'android') {
    const { useHealthService: useAndroidHealthService } = require('./HealthService.android');
    return useAndroidHealthService();
  } else {
    // Web/unsupported platform fallback
    return {
      isAvailable: false,
      platform: null,
      authStatus: 0, // AuthorizationRequestStatus.unknown
      requestAuth: async () => 0,
      AuthorizationRequestStatus: {
        unknown: 0,
        shouldRequest: 1,
        unnecessary: 2
      },
      getHealthData: async () => [],
      getBatchData: async () => ({}),
      getPlatformHealthData: async () => [],
    };
  }
};

// Helper utility functions for common health data operations
export const HealthServiceUtils = {
  /**
   * Get today's health data for distance, calories, and speed
   */
  getTodaysData: async (healthService: HealthServiceHook) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    const params = {
      startDate: startOfDay,
      endDate: endOfDay,
      pageSize: 1000,
    };

    return await healthService.getBatchData(
      ['distance', 'calories', 'walkingSpeed', 'runningSpeed'],
      params
    );
  },

  /**
   * Get weekly health data for the current week
   */
  getWeeklyData: async (healthService: HealthServiceHook) => {
    const today = new Date();
    const startOfWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek.getTime() + (7 * 24 * 60 * 60 * 1000) - 1);

    const params = {
      startDate: startOfWeek,
      endDate: endOfWeek,
      pageSize: 10000,
    };

    return await healthService.getBatchData(
      ['distance', 'calories', 'walkingSpeed', 'runningSpeed'],
      params
    );
  },

  /**
   * Calculate averages from health data array
   */
  calculateAverages: (data: any[]) => {
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
   * Group data by day for weekly analysis
   */
  groupByDay: (data: any[]) => {
    const grouped: Record<string, any[]> = {};
    
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
   * Get comprehensive health summary
   */
  getHealthSummary: async (healthService: HealthServiceHook) => {
    const [todaysData, weeklyData] = await Promise.all([
      HealthServiceUtils.getTodaysData(healthService),
      HealthServiceUtils.getWeeklyData(healthService)
    ]);

    const summary = {
      today: {
        distance: HealthServiceUtils.calculateAverages(todaysData.distance || []),
        calories: HealthServiceUtils.calculateAverages(todaysData.calories || []),
        walkingSpeed: HealthServiceUtils.calculateAverages(todaysData.walkingSpeed || []),
        runningSpeed: HealthServiceUtils.calculateAverages(todaysData.runningSpeed || []),
      },
      weekly: {
        distance: HealthServiceUtils.calculateAverages(weeklyData.distance || []),
        calories: HealthServiceUtils.calculateAverages(weeklyData.calories || []),
        walkingSpeed: HealthServiceUtils.calculateAverages(weeklyData.walkingSpeed || []),
        runningSpeed: HealthServiceUtils.calculateAverages(weeklyData.runningSpeed || []),
        dailyBreakdown: {
          distance: HealthServiceUtils.groupByDay(weeklyData.distance || []),
          calories: HealthServiceUtils.groupByDay(weeklyData.calories || []),
          walkingSpeed: HealthServiceUtils.groupByDay(weeklyData.walkingSpeed || []),
          runningSpeed: HealthServiceUtils.groupByDay(weeklyData.runningSpeed || []),
        }
      }
    };

    return summary;
  }
};

export default useHealthService;