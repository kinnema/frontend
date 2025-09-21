import { Loading } from "@/components/Loading";
import SyncSetupFeature from "@/lib/features/sync/components/SyncSetupFeature";
import { useExperimentalStore } from "@/lib/stores/experimental.store";
import { ExperimentalFeature } from "@/lib/types/experiementalFeatures";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/settings/sync/setup")({
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
    <div>
      <Suspense fallback={<Loading fullscreen />}>
        <SyncSetupFeature />
      </Suspense>
    </div>
  );
}
