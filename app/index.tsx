import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';

const { width } = Dimensions.get('window');

const readSampleData = async () => {
  try {
    const isInitialized = await initialize();
    const grantedPermissions = await requestPermission([
      { accessType: 'read', recordType: 'ActiveCaloriesBurned'},
    ]);

    const { records } = await readRecords('ActiveCaloriesBurned', {
      timeRangeFilter: {
        operator: 'between',
        startTime: '2025-06-29T00:00:00Z',
        endTime: '2025-06-30T23:59:59Z',
      },
    });

    console.log('records', records);
  } catch (error) {
    console.error('Error reading health data:', error);
  }
}

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  icon: string;
  color: string[];
  progress: number;
}

interface WeeklyWidgetProps {
  title: string;
  currentValue: string;
  unit: string;
  weeklyData: number[];
  icon: string;
  color: string[];
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  description: string;
  weekComparison: string;
}

const MetricCard = ({ title, value, unit, icon, color, progress }: MetricCardProps) => (
  <View style={styles.metricCard}>
    <LinearGradient colors={color} style={styles.cardGradient}>
      <View style={styles.cardHeader}>
        <MaterialIcons name={icon as any} size={24} color="white" />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardUnit}>{unit}</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    </LinearGradient>
  </View>
);

const WeeklyWidget = ({ title, currentValue, unit, weeklyData, icon, color, trend, trendValue, description, weekComparison }: WeeklyWidgetProps) => (
  <View style={styles.weeklyWidget}>
    <LinearGradient colors={color} style={styles.weeklyGradient}>
      <View style={styles.weeklyHeader}>
        <View style={styles.weeklyTitleContainer}>
          <MaterialIcons name={icon as any} size={24} color="white" />
          <Text style={styles.weeklyTitle}>{title}</Text>
        </View>
        <View style={styles.trendContainer}>
          <MaterialIcons 
            name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'trending-flat'} 
            size={18} 
            color="white" 
          />
          <Text style={styles.trendText}>{trendValue}</Text>
        </View>
      </View>
      
      <View style={styles.weeklyValue}>
        <Text style={styles.weeklyValueText}>{currentValue}</Text>
        <Text style={styles.weeklyUnit}>{unit}</Text>
      </View>
      
      <Text style={styles.weeklyDescription}>{description}</Text>
      <Text style={styles.weeklyComparison}>{weekComparison}</Text>
      
      <View style={styles.weeklyChart}>
        {weeklyData.map((value, index) => (
          <View key={index} style={styles.chartContainer}>
            <View style={[styles.chartBar, { height: `${value}%` }]} />
            <Text style={styles.chartLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  </View>
);

export default function Index() {
  const [healthData, setHealthData] = useState({
    distance: { value: '5.2', unit: 'km', progress: 65 },
    calories: { value: '1,240', unit: 'kcal', progress: 78 },
    speed: { value: '6.8', unit: 'km/h', progress: 82 },
  });

  const [weeklyData, setWeeklyData] = useState({
    dailyAverage: {
      distance: { 
        value: '4.8', 
        unit: 'km', 
        data: [70, 85, 60, 90, 75, 80, 65], 
        trend: 'up' as const, 
        trendValue: '+8%',
        description: 'Consistent walking routine with strong weekend performance',
        weekComparison: 'Up 1.2km from last week - great improvement in daily consistency!'
      },
      calories: { 
        value: '1,150', 
        unit: 'kcal', 
        data: [65, 80, 55, 95, 70, 85, 60], 
        trend: 'up' as const, 
        trendValue: '+12%',
        description: 'Strong calorie burn with peak performance mid-week',
        weekComparison: 'Burned 340 more calories than last week - excellent progress!'
      },
      speed: { 
        value: '6.2', 
        unit: 'km/h', 
        data: [75, 70, 80, 85, 65, 90, 70], 
        trend: 'stable' as const, 
        trendValue: '+2%',
        description: 'Maintaining steady pace with occasional speed bursts',
        weekComparison: 'Similar to last week but more consistent daily performance'
      },
    }
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Dashboard</Text>
        <Text style={styles.headerSubtitle}>Weekly Overview & Today's Activity</Text>
      </View>

      <View style={styles.weeklyContainer}>
        <Text style={styles.weeklyContainerTitle}>This Week's Performance</Text>
        <WeeklyWidget
          title="Weekly Distance Average"
          currentValue={weeklyData.dailyAverage.distance.value}
          unit={weeklyData.dailyAverage.distance.unit}
          weeklyData={weeklyData.dailyAverage.distance.data}
          icon="directions-walk"
          color={['#667eea', '#764ba2']}
          trend={weeklyData.dailyAverage.distance.trend}
          trendValue={weeklyData.dailyAverage.distance.trendValue}
          description={weeklyData.dailyAverage.distance.description}
          weekComparison={weeklyData.dailyAverage.distance.weekComparison}
        />
        
        <WeeklyWidget
          title="Weekly Calories Average"
          currentValue={weeklyData.dailyAverage.calories.value}
          unit={weeklyData.dailyAverage.calories.unit}
          weeklyData={weeklyData.dailyAverage.calories.data}
          icon="local-fire-department"
          color={['#f093fb', '#f5576c']}
          trend={weeklyData.dailyAverage.calories.trend}
          trendValue={weeklyData.dailyAverage.calories.trendValue}
          description={weeklyData.dailyAverage.calories.description}
          weekComparison={weeklyData.dailyAverage.calories.weekComparison}
        />
        
        <WeeklyWidget
          title="Weekly Speed Average"
          currentValue={weeklyData.dailyAverage.speed.value}
          unit={weeklyData.dailyAverage.speed.unit}
          weeklyData={weeklyData.dailyAverage.speed.data}
          icon="speed"
          color={['#4facfe', '#00f2fe']}
          trend={weeklyData.dailyAverage.speed.trend}
          trendValue={weeklyData.dailyAverage.speed.trendValue}
          description={weeklyData.dailyAverage.speed.description}
          weekComparison={weeklyData.dailyAverage.speed.weekComparison}
        />
      </View>

      <View style={styles.todayContainer}>
        <Text style={styles.todayTitle}>Today's Activity</Text>
      </View>

      <View style={styles.metricsContainer}>
        <MetricCard
          title="Distance Traveled"
          value={healthData.distance.value}
          unit={healthData.distance.unit}
          icon="directions-walk"
          color={['#667eea', '#764ba2']}
          progress={healthData.distance.progress}
        />

        <MetricCard
          title="Calories Burned"
          value={healthData.calories.value}
          unit={healthData.calories.unit}
          icon="local-fire-department"
          color={['#f093fb', '#f5576c']}
          progress={healthData.calories.progress}
        />

        <MetricCard
          title="Average Speed"
          value={healthData.speed.value}
          unit={healthData.speed.unit}
          icon="speed"
          color={['#4facfe', '#00f2fe']}
          progress={healthData.speed.progress}
        />
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Daily Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Active Time</Text>
            <Text style={styles.summaryValue}>2h 45m</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Steps Taken</Text>
            <Text style={styles.summaryValue}>8,432</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Heart Rate Avg</Text>
            <Text style={styles.summaryValue}>78 bpm</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={readSampleData}>
        <MaterialIcons name="refresh" size={20} color="white" />
        <Text style={styles.refreshButtonText}>Sync Health Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  metricsContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  metricCard: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 12,
    opacity: 0.9,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  cardValue: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginRight: 8,
  },
  cardUnit: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    opacity: 0.9,
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 24,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '700',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  refreshButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  weeklyContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  weeklyContainerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
  },
  weeklyWidget: {
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  weeklyGradient: {
    borderRadius: 20,
    padding: 24,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weeklyTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 12,
    opacity: 0.95,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '700',
    marginLeft: 6,
    opacity: 0.95,
  },
  weeklyValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  weeklyValueText: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginRight: 8,
  },
  weeklyUnit: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    fontWeight: '500',
  },
  weeklyDescription: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 8,
    lineHeight: 20,
  },
  weeklyComparison: {
    fontSize: 13,
    color: 'white',
    opacity: 0.85,
    fontWeight: '600',
    marginBottom: 20,
    lineHeight: 18,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 50,
  },
  chartContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
  chartLabel: {
    fontSize: 10,
    color: 'white',
    opacity: 0.8,
    fontWeight: '600',
  },
  todayContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  todayTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
});