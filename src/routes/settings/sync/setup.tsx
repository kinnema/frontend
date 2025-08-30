import P2PSyncSetupFeature from "@/lib/features/sync/setup";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/sync/setup")({
  component: RouteComponent,
});

function RouteComponent() {
  return <P2PSyncSetupFeature />;
}
