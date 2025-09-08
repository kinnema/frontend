import SyncSettingsFeature from "@/lib/features/sync/sync";
import { useExperimentalStore } from "@/lib/stores/experimental.store";
import { useSyncStore } from "@/lib/stores/sync.store";
import { ExperimentalFeature } from "@/lib/types/experiementalFeatures";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/sync/")({
  component: RouteComponent,
  loader: async () => {
    const isExperimentalFeatureEnabled = useExperimentalStore
      .getState()
      .isFeatureEnabled(ExperimentalFeature.Sync);

    if (!isExperimentalFeatureEnabled) {
      return redirect({
        from: "/settings/sync",
        to: "/settings/experimental",
      });
    }

    const syncId = useSyncStore.getState().syncId;

    if (!syncId)
      return redirect({
        from: "/settings/sync",
        to: "./setup",
      });
  },
});

function RouteComponent() {
  return <SyncSettingsFeature />;
}
