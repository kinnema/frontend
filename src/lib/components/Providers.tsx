"use client";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from "@capacitor/core";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { pluginManager } from "../plugins/pluginManager";
import { usePluginRegistry } from "../plugins/usePluginRegistry";
import { useWatchStore } from "../stores/watch.store";
import { IPlugin } from "../types/plugin.type";
import { IPluginEvent } from "../types/pluginEvents.type";

const MotionCard = motion.create(Card);

export const Providers = ({
  params,
}: {
  params: { id: string; season: number; chapter: number };
}) => {
  const toast = useToast();
  const setSelectedWatchLink = useWatchStore(
    (state) => state.setSelectedWatchLink
  );
  const setSubtitles = useWatchStore((state) => state.setSubtitles);
  const [providers, setProviders] = useState<IPlugin[]>([]);
  const { getPluginsByType } = usePluginRegistry();
  const [data, setData] = useState<IPluginEvent[]>([]);

  // Fetch providers and events from the store
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      toast.toast({
        title: "Mobil uygulama",
        description:
          "Mobil uygulama uzerinden calistirmiyorsunuz, bazi kaynaklar gözukmeyebilir!",
        duration: 3000,
      });
    }

    console.log("Fetching providers for series...", getPluginsByType("series"));
    setProviders(getPluginsByType("series"));

    pluginManager.fetchSource({
      id: params.id,
      season: params.season,
      chapter: params.chapter,
    });
  }, []);

  useEffect(() => {
    pluginManager.eventEmitter.on("event", (event: IPluginEvent) => {
      console.log("Received event:", event);
      setData((prev) => [...prev, event]);
    });

    return () => {
      pluginManager.eventEmitter.removeAllListeners();
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full m-auto max-w-md p-5 md:p-0">
      <h1 className="text-2xl font-bold">Kaynaklar</h1>
      <p className="text-sm text-muted-foreground">
        Aşağıdaki kaynakları kullanarak dizi izleyebilirsiniz, herhangi birine
        tiklamaniz yeterlidir.
      </p>
      <div className="mt-10 flex flex-col gap-3">
        {providers.map((provider) => {
          const event = [...data]
            .reverse()
            .find(
              (d) =>
                (d.type === "trying_provider" &&
                  d.data.pluginId === provider.id) ||
                (d.type === "provider_failed" &&
                  d.data.pluginId === provider.id) ||
                (d.type === "provider_success" &&
                  d.data.pluginId === provider.id)
            );

          const hasError = event?.type === "provider_failed";
          const isLoading = event?.type === "trying_provider";
          const isSuccess = event?.type === "provider_success";

          return (
            <MotionCard
              key={provider.name}
              className={`p-4 flex items-center justify-between cursor-pointer ${
                hasError
                  ? "border-red-500 opacity-40"
                  : isSuccess
                  ? "border-green-500"
                  : isLoading
                  ? "border-blue-500"
                  : "border-gray-500 opacity-40"
              } ${isSuccess || isLoading ? "" : "hover:opacity-100"}`}
              whileHover={{ scale: isSuccess || isLoading ? 1.02 : 1 }}
              whileTap={{ scale: isSuccess || isLoading ? 0.98 : 1 }}
              onClick={() => {
                if (isSuccess && event?.type === "provider_success") {
                  const watchData = {
                    provider: event.data.pluginId,
                    url: event.data.url,
                  };
                  setSubtitles(event.data.subtitles);
                  setSelectedWatchLink(watchData.url);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    hasError
                      ? "bg-red-500"
                      : isSuccess
                      ? "bg-green-500"
                      : isLoading
                      ? "bg-blue-500"
                      : "bg-gray-500"
                  }`}
                />
                <span className="font-medium">{provider.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {hasError
                  ? "Video bulunamadı"
                  : isSuccess
                  ? "Video bulundu"
                  : isLoading
                  ? "Video aranıyor..."
                  : "Bekleniyor..."}
              </span>
            </MotionCard>
          );
        })}
      </div>
    </div>
  );
};
