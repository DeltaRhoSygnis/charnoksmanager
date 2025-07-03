import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, Database, Play } from "lucide-react";
import { OfflineState } from "@/lib/offlineState";
import { LocalStorageDB } from "@/lib/localStorageDB";

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(OfflineState.getOnlineStatus());
  const [isDemoMode, setIsDemoMode] = useState(LocalStorageDB.isDemoMode());

  useEffect(() => {
    const unsubscribe = OfflineState.addListener(setIsOnline);
    setIsDemoMode(LocalStorageDB.isDemoMode());
    return unsubscribe;
  }, []);

  if (isOnline && !isDemoMode) {
    return null;
  }

  if (isDemoMode || !OfflineState.hasFirebaseAccess()) {
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
