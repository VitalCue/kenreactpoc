# Health Services

Clean, organized health services with proper import resolution.

## Usage

### Basic Usage (Platform-Agnostic)
```typescript
import { useHealthService } from '@/services/health';

function MyComponent() {
  const healthService = useHealthService(); // Automatically picks iOS/Android
  
  const fetchData = async () => {
    const data = await healthService.getHealthData('stepCount', {
      startDate: new Date(),
      endDate: new Date()
    });
  };
}
```

### Platform-Specific Usage
```typescript
import { 
  useIOSHealthService, 
  useAndroidHealthService,
  getPlatformHealthService 
} from '@/services/health';

// Direct platform access
const iosService = useIOSHealthService();
const androidService = useAndroidHealthService();

// Or dynamic platform selection
const service = getPlatformHealthService('ios');
```

### Workout Services
```typescript
import { 
  createWorkoutQuery,
  WorkoutExerciseType 
} from '@/services/health/workout';

const workouts = await workoutService.getCompositeWorkouts(
  createWorkoutQuery()
    .exerciseTypes(WorkoutExerciseType.RUNNING)
    .includeMetrics(['heartRate', 'distance'])
    .build()
);
```

### Types
```typescript
import type { 
  HealthDataAdapter,
  HealthServiceHook,
  WorkoutSessionAdapter 
} from '@/services/health';
```

## File Structure
```
services/health/
├── index.ts           # Main exports
├── service.ts         # Unified platform service
├── types.ts           # Type definitions
├── ios.ts             # iOS/HealthKit implementation
├── android.ts         # Android/Health Connect implementation
├── utils.ts           # Utility functions
└── workout/           # Workout-specific services
    ├── index.ts       # Workout exports
    ├── types.ts       # Workout type definitions
    ├── ios.ts         # iOS workout adapters
    ├── android.ts     # Android workout adapters
    └── queries.ts     # Query builders
```

## Import Resolution Fixed ✅

All import issues have been resolved:
- ✅ `ios.ts` imports from `./types` (not `./HealthServices.types`)
- ✅ `android.ts` imports from `./types` (not `./HealthServices.types`)
- ✅ `utils.ts` imports from `./types` (not `./HealthServices.types`)
- ✅ `index.ts` properly exports unified service
- ✅ All workout service imports use correct paths
- ✅ No circular dependencies
- ✅ Platform isolation maintained