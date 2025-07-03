import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OfflineState } from "@/lib/offlineState";
import { FirebaseTest } from "@/lib/firebaseTest";
import { LocalStorageDB } from "@/lib/localStorageDB";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";

export const FirebaseConnectionStatus = () => {
  const [isRetrying, setIsRetrying] = useState(false);

  const retryConnection = async () => {
    setIsRetrying(true);

    try {
      const hasAccess = await FirebaseTest.testFirebaseAccess();

      if (hasAccess) {
        toast({
          title: "Connection Restored!",
          description:
            "Firebase database is now accessible. Your data will be synced.",
        });

        // Force refresh components
        window.location.reload();
      } else {
        toast({
          title: "Still No Connection",
          description:
            "Firebase is still not accessible. Check your internet connection and Firebase rules.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: "Unable to test Firebase connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRetrying(false);
    }
  };

  // Only show if in demo mode or offline
  try {
    if (OfflineState.getOnlineStatus() && OfflineState.hasFirebaseAccess()) {
      return null;
    }
  } catch (error) {
    console.error("Error checking offline state:", error);
    // Show connection status when there's an error
  }

  return (
    <div className="mb-4">
      <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            <strong>Firebase Disconnected:</strong> Using local demo data. Try
            reconnecting to sync your real data.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={retryConnection}
            disabled={isRetrying}
            className="ml-4 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Retry Connection
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};
