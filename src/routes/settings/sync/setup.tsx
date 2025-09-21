import SyncSetupFeature from "@/lib/features/sync/components/SyncSetupFeature";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/sync/setup")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <SyncSetupFeature />
    </div>
  );
}
