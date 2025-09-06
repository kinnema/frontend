import { NostrSettingsFeature } from "@/lib/features/settings/sync/nostrSettings";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/sync/nostr")({
  component: RouteComponent,
});

function RouteComponent() {
  return <NostrSettingsFeature />;
}
