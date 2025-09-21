import SyncFeature from "@/lib/features/sync/components/SyncFeature";
import { useExperimentalStore } from "@/lib/stores/experimental.store";
import { ExperimentalFeature } from "@/lib/types/experiementalFeatures";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/sync/")({
  component: RouteComponent,
});

function RouteComponent() {
  const isSyncFeatureEnabled = useExperimentalStore((state) =>
    state.isFeatureEnabled(ExperimentalFeature.Sync)
  );
  const navigate = useNavigate();

  if (!isSyncFeatureEnabled) {
    navigate({ to: "/" });
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SyncFeature />
    </div>
  );
}
