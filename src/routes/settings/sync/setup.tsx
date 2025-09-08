import P2PSyncSetupFeature from "@/lib/features/sync/setup";
import { useExperimentalStore } from "@/lib/stores/experimental.store";
import { ExperimentalFeature } from "@/lib/types/experiementalFeatures";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/sync/setup")({
  component: RouteComponent,
  loader: async () => {
    const isExperimentalFeatureEnabled = useExperimentalStore
      .getState()
      .isFeatureEnabled(ExperimentalFeature.Sync);

    if (!isExperimentalFeatureEnabled) {
      return redirect({
        from: "/settings/sync/setup",
        to: "/settings/experimental",
      });
    }
  },
});

function RouteComponent() {
  return <P2PSyncSetupFeature />;
}
