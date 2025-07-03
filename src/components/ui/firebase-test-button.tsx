import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { OfflineState } from "@/lib/offlineState";
import { LocalStorageDB } from "@/lib/localStorageDB";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, CheckCircle, XCircle, Database } from "lucide-react";

export const FirebaseTestButton = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "success" | "failed">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const testFirebaseConnection = async () => {
    setIsTesting(true);
    setTestResult("idle");
    setErrorMessage("");

    try {
      console.log("🧪 Testing Firebase connection...");

      // Test 1: Read access
      console.log("Step 1: Testing read access...");
      const productsQuery = collection(db, "products");
      const snapshot = await getDocs(productsQuery);
      console.log(
        `✅ Read test passed! Found ${snapshot.docs.length} products`,
      );

      // Test 2: Write access
      console.log("Step 2: Testing write access...");
      const testDoc = {
        test: true,
        timestamp: new Date(),
        message: "Firebase connection test successful",
      };
      const docRef = await addDoc(collection(db, "connection-test"), testDoc);
      console.log(`✅ Write test passed! Created document: ${docRef.id}`);

      // Success! Enable Firebase
      console.log("🎉 Firebase is working perfectly!");
      OfflineState.setFirebaseAccess(true);
      OfflineState.setOnlineStatus(true);

      // Disable demo mode
      localStorage.removeItem("charnoks_demo_mode");

      setTestResult("success");

      toast({
        title: "Firebase Connected!",
        description:
          "Your database is now active. Refreshing the page to load real data...",
      });

      // Refresh page to reload with Firebase data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("❌ Firebase test failed:", error);
      setErrorMessage(error.message || "Unknown error");
      setTestResult("failed");

      // Keep demo mode active
      OfflineState.setFirebaseAccess(false);
      LocalStorageDB.enableDemoMode();

      toast({
        title: "Firebase Connection Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
        <Database className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            <strong>Firebase Status:</strong> Currently in demo mode. Test your
            Firebase connection to enable real database.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={testFirebaseConnection}
            disabled={isIsTesting}
            className="ml-4 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          >
            {isIsTesting ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Database className="h-3 w-3 mr-1" />
                Test Firebase
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>

      {testResult === "success" && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Success!</strong> Firebase is connected and working. The
            page will refresh to load your real data.
          </AlertDescription>
        </Alert>
      )}

      {testResult === "failed" && (
        <Alert className="border-red-200 bg-red-50 text-red-800">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Connection Failed:</strong> {errorMessage}
            <div className="mt-2 text-xs">
              Common fixes:
              <ul className="list-disc list-inside mt-1">
                <li>Check Firebase security rules allow authenticated users</li>
                <li>Ensure you're logged in to the app</li>
                <li>Verify Firebase project is active</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
