import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useHealthService } from './services/health';
import { WorkoutSessionAdapter, CompositeWorkoutAdapter } from './services/health/workout/types';
import { WorkoutExerciseType } from './services/health/workout/constants';
import type { WorkoutHealthService } from './services/health/workout/queries';
import { Ionicons } from '@expo/vector-icons';

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const { workoutId } = useLocalSearchParams();
  const healthService = useHealthService();
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<CompositeWorkoutAdapter | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workoutId && typeof workoutId === 'string') {
      loadWorkoutDetails(workoutId);
    }
  }, [workoutId]);

  const loadWorkoutDetails = async (id: string) => {
    if (!healthService.isAvailable) {
      setError('Health service not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Loading workout details for ID:', id);
      
      const workoutData = await healthService.getCompositeWorkout(id);
      console.log('Composite workout data:', workoutData);
      
      if (workoutData) {
        setWorkout(workoutData);
      } else {
        setError('Workout not found');
      }
    } catch (err) {
      console.error('Failed to load workout details:', err);
      setError('Failed to load workout details');
    } finally {
      setLoading(false);
    }
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

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else {
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout Details</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading workout details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout Details</Text>
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Unable to Load Workout</Text>
          <Text style={styles.errorText}>{error || 'Workout not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const session = workout.session;
  const workoutColor = getWorkoutColor(session.exerciseType);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Details</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.workoutHeader, { backgroundColor: workoutColor + '20' }]}>
          <View style={[styles.workoutIcon, { backgroundColor: workoutColor }]}>
            <Ionicons name={getWorkoutIcon(session.exerciseType)} size={32} color="white" />
          </View>
          <View style={styles.workoutHeaderInfo}>
            <Text style={styles.workoutType}>{formatWorkoutType(session.exerciseType)}</Text>
            <Text style={styles.workoutDate}>{formatDate(new Date(session.startDate))}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color="#FF6B6B" />
            <Text style={styles.statValue}>{formatDuration(session.duration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          
          {session.totalDistance && (
            <View style={styles.statCard}>
              <Ionicons name="location" size={24} color="#4ECDC4" />
              <Text style={styles.statValue}>{(session.totalDistance / 1000).toFixed(2)} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          )}
          
          {session.totalActiveCalories && (
            <View style={styles.statCard}>
              <Ionicons name="flame" size={24} color="#F39C12" />
              <Text style={styles.statValue}>{Math.round(session.totalActiveCalories)}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          )}
        </View>

        {workout.avgHeartRate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Heart Rate</Text>
            <View style={styles.heartRateContainer}>
              <View style={styles.heartRateCard}>
                <Text style={styles.heartRateValue}>{Math.round(workout.avgHeartRate)}</Text>
                <Text style={styles.heartRateLabel}>Average BPM</Text>
              </View>
              {workout.maxHeartRate && (
                <View style={styles.heartRateCard}>
                  <Text style={styles.heartRateValue}>{Math.round(workout.maxHeartRate)}</Text>
                  <Text style={styles.heartRateLabel}>Max BPM</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {workout.avgSpeed && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance</Text>
            <View style={styles.performanceContainer}>
              <View style={styles.performanceCard}>
                <Text style={styles.performanceValue}>{(workout.avgSpeed * 3.6).toFixed(1)} km/h</Text>
                <Text style={styles.performanceLabel}>Average Speed</Text>
              </View>
              {workout.maxSpeed && (
                <View style={styles.performanceCard}>
                  <Text style={styles.performanceValue}>{(workout.maxSpeed * 3.6).toFixed(1)} km/h</Text>
                  <Text style={styles.performanceLabel}>Max Speed</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {session.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{session.notes}</Text>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  workoutIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  workoutHeaderInfo: {
    flex: 1,
  },
  workoutType: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  workoutDate: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  heartRateContainer: {
    flexDirection: 'row',
  },
  heartRateCard: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heartRateValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  heartRateLabel: {
    fontSize: 12,
    color: '#666',
  },
  performanceContainer: {
    flexDirection: 'row',
  },
  performanceCard: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#666',
  },
  notesContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notesText: {
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 24,
  },
});