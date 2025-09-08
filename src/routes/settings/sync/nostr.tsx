import { NostrSettingsFeature } from "@/lib/features/settings/sync/nostrSettings";
import { useExperimentalStore } from "@/lib/stores/experimental.store";
import { ExperimentalFeature } from "@/lib/types/experiementalFeatures";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/sync/nostr")({
  component: RouteComponent,
  loader: async () => {
    const isExperimentalFeatureEnabled = useExperimentalStore
      .getState()
      .isFeatureEnabled(ExperimentalFeature.Sync);

    if (!isExperimentalFeatureEnabled) {
      return redirect({
        from: "/settings/sync/nostr",
        to: "/settings/experimental",
      });
    }
  },
});

function RouteComponent() {
  return <NostrSettingsFeature />;
}
