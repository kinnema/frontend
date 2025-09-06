import { NostrSettingsFeature } from "@/lib/features/settings/sync/nostrSettings";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/settings/sync/nostr")({
  component: RouteComponent,
});

function RouteComponent() {
  const [relays, setRelays] = useState<string[]>([
    "wss://relay.damus.io",
    "wss://relay.snort.social",
  ]);
  const [newRelay, setNewRelay] = useState("");

  const addRelay = () => {
    if (newRelay && !relays.includes(newRelay)) {
      setRelays([...relays, newRelay]);
      setNewRelay("");
    }
  };

  const removeRelay = (relay: string) => {
    setRelays(relays.filter((r) => r !== relay));
  };

  return <NostrSettingsFeature />;
}
