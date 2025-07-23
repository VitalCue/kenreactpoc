# Background Sync with expo-task-manager

## How It Works

### Task Definition
- Background tasks are **defined** when the module loads
- This happens automatically when the app starts

### Task Status
- **"Active"**: Task is registered and can be triggered by system events
- **"Available"**: Task is defined but not actively scheduled by the system
- **"Error"**: Failed to check task status

### When Tasks Run
With expo-task-manager (without expo-background-fetch), tasks run when:
1. **Manual triggers**: User presses "Sync Now" button
2. **App state changes**: When app goes to background/foreground  
3. **System events**: Location updates, push notifications, etc.
4. **NOT automatic**: No automatic periodic scheduling like old background-fetch

### For True Periodic Background Sync
To get automatic periodic sync, you'd need:
1. **expo-background-fetch** (deprecated) OR
2. **Push notifications** to trigger sync OR
3. **Location-based triggers** OR
4. **App state change listeners**

### Current Implementation
- ✅ Manual sync works perfectly
- ✅ Task defined and ready
- ⚠️ No automatic periodic scheduling
- 💡 Relies on user interaction or system events

This is sufficient for a POC where users can manually sync their data!