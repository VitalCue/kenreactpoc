import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Platform,
} from 'react-native';
import { HealthServiceUtils, useHealthService } from './services/health';
import { HealthRing, HealthMetricCard } from './components/health';
import { WeeklyChart } from './components/charts';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutQueries } from './services/health/workout/queries';
import { WorkoutSessionAdapter } from './services/health/workout/types';
import { WorkoutExerciseType } from './services/health/workout/constants';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HealthDashboard() {
  // Use the unified health service (now includes workout methods)
  const healthService = useHealthService();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayData, setTodayData] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSessionAdapter[]>([]);
  const router = useRouter();

  const loadHealthData = async () => {
    if (!healthService.isAvailable) return;

    try {
      const [today, weekly, workouts] = await Promise.all([
        HealthServiceUtils.getTodaysData(healthService),
        HealthServiceUtils.getWeeklyData(healthService),
        healthService.getWorkoutSessions(WorkoutQueries.recent(40)),
      ]);

      const todayStats = {
        steps: HealthServiceUtils.calculateAverages(today.steps || []),
        distance: HealthServiceUtils.calculateAverages(today.distance || []),
        calories: HealthServiceUtils.calculateAverages(today.calories || []),
        walkingSpeed: HealthServiceUtils.calculateAverages(today.walkingSpeed || []),
      };

      const weeklyStats = {
        steps: HealthServiceUtils.calculateAverages(weekly.steps || []),
        distance: HealthServiceUtils.calculateAverages(weekly.distance || []),
        calories: HealthServiceUtils.calculateAverages(weekly.calories || []),
      };

      setTodayData(todayStats);
      setWeeklyData(weeklyStats);
      
      // Debug: Log workout types (can be removed later)
      // Debug: Log data for both platforms
      console.log(`Platform: ${Platform.OS}`);
      console.log('Today\'s data:', todayStats);
      console.log('Weekly data:', weeklyStats);
      console.log('Recent workouts found:', workouts.sessions?.length || 0);
      console.log('Recent Workouts, Json',workouts.sessions )
      workouts.sessions?.forEach((session, index) => {
        console.log(`Workout ${index + 1} - Exercise Type: ${session.exerciseType}, Source: ${session.dataOrigin}`);
      });
      setRecentWorkouts(workouts.sessions || []);
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (healthService.authStatus === 2) { // AuthorizationRequestStatus.unnecessary = 2 means granted
      loadHealthData();
    } else {
      setLoading(false);
    }
  }, [healthService.authStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHealthData();
  };

  const requestPermissions = async () => {
    setLoading(true);
    await healthService.requestAuth();
    await loadHealthData();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading health data...</Text>
      </View>
    );
  }

  if (healthService.authStatus !== 2) { // AuthorizationRequestStatus.unnecessary = 2 means granted
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="heart" size={64} color="#FF6B6B" />
        <Text style={styles.permissionTitle}>Health Access Required</Text>
        <Text style={styles.permissionText}>
          We need permission to access your health data to show your metrics.
        </Text>
        <View style={styles.button}>
          <Text style={styles.buttonText} onPress={requestPermissions}>
            Grant Access
          </Text>
        </View>
      </View>
    );
  }

  const getWeeklyChartData = (metric: string) => {
    if (!weeklyData || !weeklyData[metric]) {
      // Return empty data if no weekly data available
      return [];
    }
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    
    // Generate consistent mock data based on the metric
    const baseValues = {
      steps: [3000, 4500, 6000, 7200, 8500, 9200, 10000],
      calories: [200, 300, 400, 450, 500, 550, 600],
      distance: [2000, 3000, 4000, 4500, 5000, 5500, 6000],
    };
    
    const values = baseValues[metric as keyof typeof baseValues] || [0, 0, 0, 0, 0, 0, 0];
    
    return days.map((day, index) => ({
      day,
      value: index <= today ? values[index] || 0 : 0,
    }));
  };
  
  const handleWorkoutPress = (workout: WorkoutSessionAdapter) => {
    router.push({
      pathname: '/workout-detail',
      params: { workoutId: workout.uuid }
    });
  };
  
  const getWorkoutIcon = (type: WorkoutExerciseType): any => {
    const iconMap: Record<WorkoutExerciseType, string> = {
      [WorkoutExerciseType.RUNNING]: 'fitness',
      [WorkoutExerciseType.CYCLING]: 'bicycle',
      [WorkoutExerciseType.WALKING]: 'walk',
      [WorkoutExerciseType.SWIMMING]: 'water',
      [WorkoutExerciseType.STRENGTH_TRAINING]: 'barbell',
      [WorkoutExerciseType.WEIGHTLIFTING]: 'barbell',
      [WorkoutExerciseType.BODYWEIGHT]: 'body',
      [WorkoutExerciseType.YOGA]: 'body',
      [WorkoutExerciseType.PILATES]: 'body',
      [WorkoutExerciseType.TENNIS]: 'tennis-ball',
      [WorkoutExerciseType.BASKETBALL]: 'basketball',
      [WorkoutExerciseType.FOOTBALL]: 'football',
      [WorkoutExerciseType.SOCCER]: 'football',
      [WorkoutExerciseType.BASEBALL]: 'baseball',
      [WorkoutExerciseType.GOLF]: 'golf',
      [WorkoutExerciseType.HIKING]: 'trail-sign',
      [WorkoutExerciseType.DANCING]: 'musical-notes',
      [WorkoutExerciseType.MARTIAL_ARTS]: 'hand-right',
      [WorkoutExerciseType.BOXING]: 'hand-right',
      [WorkoutExerciseType.CLIMBING]: 'trending-up',
      [WorkoutExerciseType.ELLIPTICAL]: 'repeat',
      [WorkoutExerciseType.ROWING]: 'boat',
      [WorkoutExerciseType.STAIR_CLIMBING]: 'trending-up',
      [WorkoutExerciseType.HIGH_INTENSITY_INTERVAL_TRAINING]: 'flash',
      [WorkoutExerciseType.OTHER]: 'fitness',
      [WorkoutExerciseType.UNKNOWN]: 'fitness',
    };
    return iconMap[type] || 'fitness';
  };
  
  const getWorkoutColor = (type: WorkoutExerciseType): string => {
    const colorMap: Record<WorkoutExerciseType, string> = {
      [WorkoutExerciseType.RUNNING]: '#FF6B6B',
      [WorkoutExerciseType.CYCLING]: '#4ECDC4',
      [WorkoutExerciseType.WALKING]: '#95E1D3',
      [WorkoutExerciseType.SWIMMING]: '#5DADE2',
      [WorkoutExerciseType.STRENGTH_TRAINING]: '#F39C12',
      [WorkoutExerciseType.WEIGHTLIFTING]: '#F39C12',
      [WorkoutExerciseType.BODYWEIGHT]: '#F39C12',
      [WorkoutExerciseType.YOGA]: '#BB8FCE',
      [WorkoutExerciseType.PILATES]: '#BB8FCE',
      [WorkoutExerciseType.TENNIS]: '#58D68D',
      [WorkoutExerciseType.BASKETBALL]: '#F7DC6F',
      [WorkoutExerciseType.FOOTBALL]: '#85C1E9',
      [WorkoutExerciseType.SOCCER]: '#85C1E9',
      [WorkoutExerciseType.BASEBALL]: '#F8C471',
      [WorkoutExerciseType.GOLF]: '#A9DFBF',
      [WorkoutExerciseType.HIKING]: '#52BE80',
      [WorkoutExerciseType.DANCING]: '#EC7063',
      [WorkoutExerciseType.MARTIAL_ARTS]: '#D2B4DE',
      [WorkoutExerciseType.BOXING]: '#D2B4DE',
      [WorkoutExerciseType.CLIMBING]: '#A3E4D7',
      [WorkoutExerciseType.ELLIPTICAL]: '#85C1E2',
      [WorkoutExerciseType.ROWING]: '#76D7C4',
      [WorkoutExerciseType.STAIR_CLIMBING]: '#F8C471',
      [WorkoutExerciseType.HIGH_INTENSITY_INTERVAL_TRAINING]: '#FF4757',
      [WorkoutExerciseType.OTHER]: '#AAB7B8',
      [WorkoutExerciseType.UNKNOWN]: '#AAB7B8',
    };
    return colorMap[type] || '#AAB7B8';
  };
  
  const formatWorkoutType = (type: WorkoutExerciseType): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };
  
  const formatWorkoutDate = (date: Date): string => {
    const now = new Date();
    const workoutDate = new Date(date);
    const diffInHours = (now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return workoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };
  
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes} min`;
    }
  };
  
  const formatDataSource = (dataOrigin: string): string => {
    // Map common bundle IDs and package names to friendly names
    const sourceMap: Record<string, string> = {
      // iOS bundle IDs
      'com.apple.health': 'Apple Health',
      'com.apple.Health': 'Apple Health',
      'com.apple.Fitness': 'Apple Fitness+',
      'com.strava.stravaride': 'Strava',
      'com.strava': 'Strava',
      'com.nike.nikeplus-gps': 'Nike Run Club',
      'com.runtastic.Runtastic': 'Adidas Running',
      'com.myfitnesspal.mfp': 'MyFitnessPal',
      'com.peloton.Peloton': 'Peloton',
      'com.underarmour.mapmyfitness': 'MapMyFitness',
      'com.garmin.ConnectMobile': 'Garmin Connect',
      'com.fitbit.FitbitMobile': 'Fitbit',
      'com.whoop.Whoop': 'WHOOP',
      'com.polar.polarflow': 'Polar Flow',
      // Android package names
      'com.google.android.apps.fitness': 'Google Fit',
      'com.samsung.shealth': 'Samsung Health',
      'com.samsung.android.app.health': 'Samsung Health',
      'com.huawei.health': 'Huawei Health',
      'com.xiaomi.hm.health': 'Mi Fitness',
      'com.strava.android': 'Strava',
      'com.nike.plusone': 'Nike Run Club',
      'com.runtastic.android': 'Adidas Running',
      'com.myfitnesspal.android': 'MyFitnessPal',
      'com.garmin.android.apps.connectmobile': 'Garmin Connect',
      'com.fitbit.FitbitMobile.android': 'Fitbit',
      'com.whoop.android': 'WHOOP'
    };
    
    // Check for exact match first
    if (sourceMap[dataOrigin]) {
      return sourceMap[dataOrigin];
    }
    
    // Check for partial matches (for cases like com.strava.stravaride)
    for (const [key, value] of Object.entries(sourceMap)) {
      if (dataOrigin.includes(key.split('.')[1])) { // Check the main company name
        return value;
      }
    }
    
    // Extract app name from bundle ID as fallback
    const parts = dataOrigin.split('.');
    if (parts.length >= 2) {
      const appName = parts[parts.length - 1];
      return appName.charAt(0).toUpperCase() + appName.slice(1);
    }
    
    return 'Unknown';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>

        <View style={styles.ringsContainer}>
          <HealthRing
            value={todayData?.steps?.total || 0}
            maxValue={10000}
            label="Steps"
            colors={['#FF6B6B', '#FF8E53']}
            icon={<Ionicons name="walk" size={20} color="#FF6B6B" />}
          />
          <HealthRing
            value={todayData?.calories?.total || 0}
            maxValue={500}
            label="Calories"
            unit="cal"
            colors={['#4ECDC4', '#44A6A0']}
            icon={<Ionicons name="flame" size={20} color="#4ECDC4" />}
          />
          <HealthRing
            value={todayData?.distance?.total ? todayData.distance.total / 1000 : 0}
            maxValue={5}
            label="Distance"
            unit="km"
            colors={['#95E1D3', '#78C9BB']}
            icon={<Ionicons name="location" size={20} color="#95E1D3" />}
          />
        </View>

        <Text style={styles.sectionTitle}>Today&apos;s Activity</Text>
        
        <View style={styles.metricsGrid}>
          <HealthMetricCard
            title="Walking Speed"
            value={todayData?.walkingSpeed?.average?.toFixed(1) || '0'}
            unit="m/s"
            subtitle="Average speed"
            icon="speedometer"
            colors={['#A8E6CF', '#7FD3A8']}
            style={styles.metricCard}
          />
          <HealthMetricCard
            title="Active Time"
            value={Math.round((todayData?.steps?.total || 0) / 100)}
            unit="min"
            subtitle="Time moving"
            icon="time"
            colors={['#FFD93D', '#FCB42C']}
            style={styles.metricCard}
          />
        </View>

        <Text style={styles.sectionTitle}>Weekly Trends</Text>
        
        <WeeklyChart
          data={getWeeklyChartData('steps')}
          title="Steps This Week"
          colors={['#FF6B6B', '#FF8E53']}
        />
        
        <View style={{ height: 16 }} />
        
        <WeeklyChart
          data={getWeeklyChartData('calories')}
          title="Calories Burned"
          unit="cal"
          colors={['#4ECDC4', '#44A6A0']}
        />

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Weekly Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{(weeklyData?.steps?.total || 0).toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Total Steps</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{((weeklyData?.distance?.total || 0) / 1000).toFixed(1)} km</Text>
              <Text style={styles.summaryLabel}>Distance</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{(weeklyData?.calories?.total || 0).toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Calories</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        
        {recentWorkouts.length > 0 ? (
          <View style={styles.workoutsContainer}>
            {recentWorkouts.map((workout, index) => (
              <TouchableOpacity
                key={workout.uuid || `workout-${index}`}
                style={styles.workoutCard}
                onPress={() => handleWorkoutPress(workout)}
                activeOpacity={0.7}
              >
                <View style={styles.workoutHeader}>
                  <View style={[styles.workoutIconContainer, { backgroundColor: getWorkoutColor(workout.exerciseType) + '20' }]}>
                    <Ionicons name={getWorkoutIcon(workout.exerciseType)} size={24} color={getWorkoutColor(workout.exerciseType)} />
                  </View>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutType}>{formatWorkoutType(workout.exerciseType)}</Text>
                    <Text style={styles.workoutDate}>{formatWorkoutDate(new Date(workout.startDate))}</Text>
                    <Text style={styles.workoutSource}>{formatDataSource(workout.dataOrigin)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
                <View style={styles.workoutStats}>
                  <View style={styles.workoutStat}>
                    <Text style={styles.workoutStatValue}>{formatDuration(workout.duration)}</Text>
                    <Text style={styles.workoutStatLabel}>Duration</Text>
                  </View>
                  {workout.totalDistance && (
                    <View style={styles.workoutStat}>
                      <Text style={styles.workoutStatValue}>{(workout.totalDistance / 1000).toFixed(2)} km</Text>
                      <Text style={styles.workoutStatLabel}>Distance</Text>
                    </View>
                  )}
                  {workout.totalActiveCalories && (
                    <View style={styles.workoutStat}>
                      <Text style={styles.workoutStatValue}>{Math.round(workout.totalActiveCalories)}</Text>
                      <Text style={styles.workoutStatLabel}>Calories</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyWorkouts}>
            <Ionicons name="bicycle" size={48} color="#DDD" />
            <Text style={styles.emptyWorkoutsText}>No recent workouts</Text>
            <Text style={styles.emptyWorkoutsSubtext}>Start a workout to see it here</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  ringsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingHorizontal: 24,
    marginBottom: 16,
    marginTop: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  metricCard: {
    flex: 1,
    marginHorizontal: 6,
  },
  summaryContainer: {
    margin: 24,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 24,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  workoutsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  workoutCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  workoutDate: {
    fontSize: 14,
    color: '#666',
  },
  workoutSource: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  workoutStat: {
    alignItems: 'center',
  },
  workoutStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  workoutStatLabel: {
    fontSize: 12,
    color: '#999',
  },
  emptyWorkouts: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyWorkoutsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyWorkoutsSubtext: {
    fontSize: 14,
    color: '#999',
  },
});