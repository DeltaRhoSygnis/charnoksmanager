import { useEffect, useState } from "react";
import { LocalStorageDB } from "@/lib/localStorageDB";
import { OfflineState } from "@/lib/offlineState";

export const DemoStatus = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial state
    setIsDemoMode(LocalStorageDB.isDemoMode());
    setIsOnline(OfflineState.getOnlineStatus());

    // Listen for changes
    const unsubscribe = OfflineState.addListener((online) => {
      setIsOnline(online);
      setIsDemoMode(LocalStorageDB.isDemoMode());
    });

    return unsubscribe;
  }, []);

  if (!isDemoMode) return null;

  return (
    <div className="fixed top-20 right-4 z-50 bg-amber-100 dark:bg-amber-900/90 border border-amber-300 dark:border-amber-700 px-3 py-1 rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
          Demo Mode
        </span>
      </div>
    </div>
  );
};