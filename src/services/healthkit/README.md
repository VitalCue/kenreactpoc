# HealthKit Anchored Queries Implementation

This implementation provides efficient synchronization of HealthKit data using anchored queries, which only fetch new or changed data since the last sync.

## Overview

Anchored queries in HealthKit allow you to:
- Fetch only new/changed health data since last sync
- Handle deleted samples properly
- Reduce data transfer and processing overhead
- Maintain data consistency across syncs

## Architecture

### Core Components

1. **AnchorStore** (`AnchorStore.ts`)
   - Manages anchor persistence using MMKV (encrypted storage)
   - Stores anchors per data type
   - Tracks last sync date for each data type

2. **HealthKitSyncManager** (`HealthKitSyncManager.ts`)
   - Handles anchored query execution
   - Manages sync state to prevent concurrent syncs
   - Processes deleted samples
   - Supports batch syncing of multiple data types

3. **Service Integration** (`service-anchored.ts`)
   - Drop-in replacement for regular HealthKit service
   - Automatically uses anchored queries when available
   - Falls back to regular queries for initial sync

## Usage

### Basic Usage

```typescript
import { useHealthServiceAnchored } from './services/health/platforms/ios/service-anchored';

const MyComponent = () => {
  const healthService = useHealthServiceAnchored();
  
  // Fetch data - will use anchored query if anchor exists
  const syncStepCount = async () => {
    const data = await healthService.getHealthData('stepCount', {
      startDate: new Date('2024-01-01'),
      endDate: new Date(),
      useAnchored: true, // Default: true if anchor exists
      onDeletedSamples: (deletedIds) => {
        // Handle deleted samples
        console.log('Deleted samples:', deletedIds);
      }
    });
    
    console.log('New/updated samples:', data);
  };
};
```

### Batch Sync

```typescript
// Sync multiple data types efficiently
const syncMultipleTypes = async () => {
  const results = await healthService.getBatchData(
    ['stepCount', 'heartRate', 'activeEnergyBurned'],
    {
      startDate: new Date('2024-01-01'),
      endDate: new Date(),
      useAnchored: true
    }
  );
  
  // Results is a map of dataType -> samples
  console.log('Step count:', results.stepCount);
  console.log('Heart rate:', results.heartRate);
};
```

### Managing Sync State

```typescript
// Check sync status for a data type
const status = await healthService.getSyncStatus('stepCount');
console.log('Has anchor:', status.hasAnchor);
console.log('Last sync:', status.lastSyncDate);
console.log('Currently syncing:', status.isSyncing);

// Force full resync (clears anchor)
await healthService.forceFullResync('stepCount');

// Clear all anchors
await healthService.clearAllAnchors();
```

## How It Works

1. **Initial Sync**: 
   - No anchor exists, performs regular query
   - After query, performs anchored query to get initial anchor
   - Stores anchor for future use

2. **Subsequent Syncs**:
   - Retrieves stored anchor
   - Queries only new/changed data since anchor
   - Updates anchor with new position
   - Returns new samples and deleted sample IDs

3. **Deletion Handling**:
   - Anchored queries return both new samples and deleted sample IDs
   - Use `onDeletedSamples` callback to handle deletions in your data store

## Android Considerations

For Android implementation with Google Fit:

```typescript
// Android would use sync tokens instead of anchors
// Example implementation pattern:

if (Platform.OS === 'android') {
  // Use Google Fit History API with sync tokens
  const syncToken = await androidSecureStorage.getSyncToken(dataType);
  
  const response = await GoogleFit.getHistoryDelta({
    dataType: mapToGoogleFitType(dataType),
    syncToken: syncToken || undefined,
  });
  
  // Store new sync token
  await androidSecureStorage.setSyncToken(dataType, response.nextSyncToken);
  
  // Convert and return data
  return convertGoogleFitData(response.dataPoints);
}
```

## Best Practices

1. **Error Handling**: Always handle sync failures gracefully
2. **Concurrent Syncs**: The system prevents concurrent syncs for the same data type
3. **Anchor Persistence**: Anchors are automatically persisted and encrypted
4. **Full Resync**: Use `forceFullResync` when you need to rebuild your data
5. **Batch Operations**: Use batch sync for multiple data types to improve performance

## Security Notes

- Anchors are stored encrypted using MMKV
- Each anchor is specific to its data type and query parameters
- Anchors are opaque tokens and don't contain health data
- For production, add encryption key to MMKV initialization

## Troubleshooting

1. **Missing Data**: If data seems missing, check if anchor was corrupted and force full resync
2. **Duplicate Data**: Ensure you're not mixing anchored and non-anchored queries
3. **Performance**: Use batch operations for multiple data types
4. **Storage**: MMKV handles storage efficiently, but monitor anchor count

## Future Enhancements

- Background sync with `react-native-background-fetch`
- Automatic sync scheduling
- Conflict resolution for overlapping data
- Analytics for sync performance
- Cross-platform anchor/token abstraction