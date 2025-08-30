import SyncSettingsFeature from "@/lib/features/sync/sync";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/sync/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SyncSettingsFeature />;
}
