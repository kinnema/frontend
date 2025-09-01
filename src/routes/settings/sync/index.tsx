import SyncSettingsFeature from "@/lib/features/sync/sync";
import { useSyncStore } from "@/lib/stores/sync.store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/sync/")({
  component: RouteComponent,
  loader: async () => {
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
