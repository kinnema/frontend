"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSyncStore } from "@/lib/stores/sync.store";
import { IRelay } from "@/lib/types/sync.type";
import { Plus, Trash2, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function NostrSettingsFeature() {
  const relays = useSyncStore((state) => state.nostrRelayUrls || []);
  const setRelays = useSyncStore((state) => state.setNostrRelayUrls);
  const [newRelayUrl, setNewRelayUrl] = useState("");
  const { toast } = useToast();
  const { t } = useTranslation();

  const addRelay = () => {
    if (!newRelayUrl.trim()) {
      toast({
        title: t("nostr.error"),
        description: t("nostr.enterRelayUrl"),
        variant: "destructive",
      });
      return;
    }

    if (!newRelayUrl.startsWith("wss://") && !newRelayUrl.startsWith("ws://")) {
      toast({
        title: t("nostr.error"),
        description: t("nostr.invalidRelayUrl"),
        variant: "destructive",
      });
      return;
    }

    const newRelay: IRelay = {
      id: Date.now().toString(),
      url: newRelayUrl.trim(),
      status: "disconnected",
    };

    setRelays([...relays, newRelay]);
    setNewRelayUrl("");
    toast({
      title: t("nostr.success"),
      description: t("nostr.relayAddedSuccessfully"),
      className: "bg-accent text-accent-foreground",
    });
  };

  const removeRelay = (id: string) => {
    setRelays(relays.filter((relay) => relay.id !== id));
    toast({
      title: t("nostr.relayRemoved"),
      description: t("nostr.relayRemovedDescription"),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addRelay();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance mb-2">
          {t("nostr.manageRelays")}
        </h1>
        <p className="text-muted-foreground text-pretty">
          {t("nostr.description")}
        </p>
      </div>

      {/* Add Relay Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t("nostr.addNewRelay")}
          </CardTitle>
          <CardDescription>{t("nostr.addRelayDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder={t("nostr.relayUrlPlaceholder")}
              value={newRelayUrl}
              onChange={(e) => setNewRelayUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={addRelay} className="px-6">
              {t("nostr.addRelay")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Relay List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("nostr.activeRelays")} ({relays.length})
          </CardTitle>
          <CardDescription>
            {t("nostr.activeRelaysDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {relays.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <WifiOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t("nostr.noRelaysConfigured")}</p>
              <p className="text-sm">{t("nostr.addFirstRelay")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {relays.map((relay) => (
                <div
                  key={relay.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {relay.status === "connected" ? (
                      <Wifi className="h-4 w-4 text-accent" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <p className="font-mono text-sm break-all">{relay.url}</p>
                    </div>
                    <Badge
                      variant={
                        relay.status === "connected" ? "default" : "secondary"
                      }
                      className={
                        relay.status === "connected"
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }
                    >
                      {t(`nostr.${relay.status}`)}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRelay(relay.id)}
                    className="ml-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          {t("nostr.helpText")}{" "}
          <a href="#" className="text-primary hover:underline">
            {t("nostr.documentationLink")}
          </a>{" "}
          {t("nostr.helpTextEnd")}
        </p>
      </div>
    </div>
  );
}
