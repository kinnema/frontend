import { useExperimentalStore } from "@/lib/stores/experimental.store";
import { ExperimentalFeature } from "@/lib/types/experiementalFeatures";
import React, { createContext, useContext, useEffect, useState } from "react";
import { syncEngine } from "./engine";
import { useSyncStore } from "./store";

const SyncContext = createContext<typeof syncEngine | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const isSyncFeatureEnabled = useExperimentalStore((state) =>
    state.isFeatureEnabled(ExperimentalFeature.Sync)
  );
  const { identity, isActive } = useSyncStore();
  const [shouldStart, setShouldStart] = useState(false);

  useEffect(() => {
    if (!isSyncFeatureEnabled) return;
    if (typeof document === "undefined") return;

    const onReadyStateChange = () => {
      if (document.readyState === "complete") {
        setShouldStart(true);
        console.log("Document loaded, starting sync engine");
      }
    };

    if (document.readyState === "complete") {
      onReadyStateChange();
    } else {
      document.addEventListener("readystatechange", onReadyStateChange);
    }

    return () => {
      document.removeEventListener("readystatechange", onReadyStateChange);
    };
  }, [isSyncFeatureEnabled]);

  useEffect(() => {
    if (!shouldStart) return;
    if (identity && isActive) {
      syncEngine.start();
    } else if (!identity && isActive) {
      syncEngine.stop();
    } else if (identity && !isActive) {
      syncEngine.stop();
    } else if (!identity && !isActive) {
      syncEngine.stop();
    }
  }, [identity, isActive, shouldStart]);

  return (
    <SyncContext.Provider value={syncEngine}>{children}</SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within SyncProvider");
  }
  return context;
}
