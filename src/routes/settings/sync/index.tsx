import SyncFeature from "@/lib/features/sync/components/SyncFeature";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/sync/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SyncFeature />
    </div>
  );
}
