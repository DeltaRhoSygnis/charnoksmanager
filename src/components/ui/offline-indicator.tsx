import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, Wifi } from "lucide-react";
import { OfflineState } from "@/lib/offlineState";

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(OfflineState.getOnlineStatus());

  useEffect(() => {
    const unsubscribe = OfflineState.addListener(setIsOnline);
    return unsubscribe;
  }, []);

  if (isOnline) {
    return null;
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
