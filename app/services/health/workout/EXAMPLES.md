# Workout Query Examples

## ✅ **Fixed Issues**

### **1. WorkoutQueryParams Interface** ✅
The interface now properly extends `QueryParams` while adding workout-specific options:

```typescript
interface WorkoutQueryParams extends Omit<QueryParams, 'android' | 'ios'> {
  // Workout-specific fields
  exerciseTypes?: WorkoutExerciseType[];
  minDuration?: number;
  maxDuration?: number;
  
  // Extended platform options (inherits base + adds workout-specific)
  ios?: QueryParams['ios'] & WorkoutIOSQueryOptions;
  android?: QueryParams['android'] & WorkoutAndroidQueryOptions;
}
```

### **2. WorkoutExerciseType Import** ✅
Fixed enum import to allow usage as value:

```typescript
// ❌ Before (broken)
import type { WorkoutExerciseType } from './types';

// ✅ After (fixed)
import { WorkoutExerciseType } from './types';
```

## 🎯 **Working Examples**

### **Basic Query Builder**
```typescript
import { createWorkoutQuery, WorkoutExerciseType } from '@/services/health/workout';

const query = createWorkoutQuery()
  .exerciseTypes(WorkoutExerciseType.RUNNING, WorkoutExerciseType.CYCLING)
  .durationRange(300, 7200) // 5 minutes to 2 hours
  .includeMetrics(['heartRate', 'distance'])
  .build();
```

### **Platform-Specific Options**
```typescript
const iosQuery: WorkoutQueryParams = {
  exerciseTypes: [WorkoutExerciseType.RUNNING],
  ios: {
    // Base QueryParams options
    ascending: true,
    filter: Filters.lastDays(7),
    
    // Workout-specific options
    includeWorkoutEvents: true,
    includeRoute: true
  }
};

const androidQuery: WorkoutQueryParams = {
  exerciseTypes: [WorkoutExerciseType.CYCLING],
  android: {
    // Base QueryParams options
    dataOriginFilter: ['com.strava'],
    pageToken: 'next_page_token',
    
    // Workout-specific options
    includeSegments: true,
    includeLaps: true,
    dataSourcePackages: ['com.garmin.android.apps.connectmobile']
  }
};
```

### **Predefined Queries**
```typescript
import { WorkoutQueries } from '@/services/health/workout';

// Get recent workouts (last 7 days)
const recentWorkouts = WorkoutQueries.recent(10);

// Get running workouts from last 30 days
const runningWorkouts = WorkoutQueries.byType(WorkoutExerciseType.RUNNING, 30);

// Get workouts with GPS data
const gpsWorkouts = WorkoutQueries.withGPS(14);

// Get long workouts (>30 minutes)
const longWorkouts = WorkoutQueries.longWorkouts(30);
```

### **Service Usage**
```typescript
import { useHealthService } from '@/services/health';

function MyWorkoutComponent() {
  const healthService = useHealthService();
  
  const fetchWorkouts = async () => {
    // Type-safe query with proper platform extension
    const workouts = await healthService.getCompositeWorkouts({
      exerciseTypes: [WorkoutExerciseType.RUNNING],
      includeMetrics: true,
      includeRoute: true,
      ios: {
        ascending: false,
        includeWorkoutEvents: true
      },
      android: {
        includeSegments: true,
        dataSourcePackages: ['com.strava']
      }
    });
    
    return workouts;
  };
}
```

## 🔧 **Type Safety Benefits**

### **Inherited Base Options**
```typescript
// All base QueryParams options are available
const query: WorkoutQueryParams = {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  pageSize: 100,
  
  // Plus workout-specific options
  exerciseTypes: [WorkoutExerciseType.SWIMMING],
  minDuration: 1800 // 30 minutes
};
```

### **Platform Option Composition**
```typescript
// iOS options combine base + workout-specific
const iosOptions = {
  // From base QueryParams
  ascending: true,
  filter: Filters.today(),
  anchor: 'pagination_token',
  
  // From WorkoutIOSQueryOptions
  includeWorkoutEvents: true,
  includeRoute: true,
  additionalFilters: Filters.excludeManualEntries()
};

// Android options combine base + workout-specific
const androidOptions = {
  // From base QueryParams
  dataOriginFilter: ['com.nike.ntc'],
  metadataFilter: { source: 'mobile_app' },
  pageToken: 'next_page',
  
  // From WorkoutAndroidQueryOptions
  includeSegments: true,
  includeLaps: true,
  dataSourcePackages: ['com.garmin.android.apps.connectmobile']
};
```

## ✅ **Verification**

- ✅ No TypeScript errors
- ✅ WorkoutExerciseType can be used as value
- ✅ Platform options properly extend base types
- ✅ All query builders work correctly
- ✅ Type safety maintained throughout