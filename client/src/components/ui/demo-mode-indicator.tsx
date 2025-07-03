import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Settings } from "lucide-react";

export const DemoModeIndicator = () => {
  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50 text-blue-800">
      <Play className="h-4 w-4" />
      <AlertDescription>
        <strong>Demo Mode Active:</strong> You're using the app with sample
        data. All features work perfectly! Your sales and data are saved
        locally.
        <div className="mt-2 text-xs text-blue-600">
          💡 To use real Firebase database, ensure your Firebase rules allow
          authenticated access.
        </div>
      </AlertDescription>
    </Alert>
  );
};
