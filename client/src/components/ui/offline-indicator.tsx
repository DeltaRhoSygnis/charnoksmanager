import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, Database, Play, CheckCircle } from "lucide-react";
import { OfflineState } from "@/lib/offlineState";
import { LocalStorageDB } from "@/lib/localStorageDB";

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [hasFirebaseAccess, setHasFirebaseAccess] = useState(true);

  useEffect(() => {
    try {
      setIsOnline(OfflineState.getOnlineStatus());
      setIsDemoMode(LocalStorageDB.isDemoMode());
      setHasFirebaseAccess(OfflineState.hasFirebaseAccess());

      const unsubscribe = OfflineState.addListener((online) => {
        try {
          setIsOnline(online);
          setHasFirebaseAccess(OfflineState.hasFirebaseAccess());
          setIsDemoMode(LocalStorageDB.isDemoMode());
        } catch (error) {
          console.error("Error updating offline state:", error);
        }
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error initializing offline indicator:", error);
      // Default to safe state
      setIsOnline(false);
      setIsDemoMode(true);
      setHasFirebaseAccess(false);
    }
  }, []);

  // Show success message when Firebase is connected
  if (isOnline && hasFirebaseAccess && !isDemoMode) {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Connected:</strong> Firebase database is active. Your data
          will be saved and synced across devices.
        </AlertDescription>
      </Alert>
    );
  }

  // Show demo mode when Firebase is not accessible
  if (isDemoMode || !hasFirebaseAccess) {
    return (
      <Alert className="mb-4 border-blue-200 bg-blue-50 text-blue-800">
        <Play className="h-4 w-4" />
        <AlertDescription>
          <strong>Demo Mode:</strong> You're using the app with sample data. All
          features are fully functional! Data is stored locally and will persist
          during your session.
        </AlertDescription>
      </Alert>
    );
  }

  // Show offline mode for network issues
  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50 text-orange-800">
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        <strong>Offline Mode:</strong> Some features may be limited due to
        network connectivity issues. Your data will sync when connection is
        restored.
      </AlertDescription>
    </Alert>
  );
};
