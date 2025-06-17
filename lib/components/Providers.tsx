"use client";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { WatchProviderInnerSchema } from "../api";
import AppService from "../services/app.service";
import { useWatchStore } from "../stores/watch.store";
import { IWatchEvent } from "../types/watch";
import { Loading } from "./Loading";

const MotionCard = motion.create(Card);

export const Providers = ({
  params,
}: {
  params: { id: string; season: number; chapter: number };
}) => {
  const [providers, setProviders] = useState<WatchProviderInnerSchema[]>([]);
  const [data, setData] = useState<IWatchEvent[]>([]);
  const selectedWatchLink = useWatchStore((state) => state.selectedWatchLink);
  const setSelectedWatchLink = useWatchStore(
    (state) => state.setSelectedWatchLink
  );

  useEffect(() => {
    const unsubscribe = AppService.fetchSeries(
      params.id,
      params.season,
      params.chapter
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Debug log for store state changes
  useEffect(() => {
    console.log("Store state changed:", selectedWatchLink);
  }, [selectedWatchLink]);

  useEffect(() => {
    const eventHandler = (event: IWatchEvent) => {
      console.log("Received event:", event);
      if (event.type === "init") {
        setProviders(event.data.providers);
        return;
      }
      setData((prev) => [...prev, event]);
    };

    const endHandler = () => {
      AppService.serieEventEmitter.removeAllListeners();
    };

    AppService.serieEventEmitter.addListener("event", eventHandler);
    AppService.serieEventEmitter.addListener("end", endHandler);

    return () => {
      AppService.serieEventEmitter.removeListener("event", eventHandler);
      AppService.serieEventEmitter.removeListener("end", endHandler);
    };
  }, []);

  if (providers.length < 1) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-2 w-full m-auto max-w-md p-5 md:p-0">
      <h1 className="text-2xl font-bold">Kaynaklar</h1>
      <p className="text-sm text-muted-foreground">
        Aşağıdaki kaynakları kullanarak dizi izleyebilirsiniz, herhangi birine
        tiklamaniz yeterlidir.
      </p>
      <div className="mt-10 flex flex-col gap-3">
        {providers
          ?.map((provider) => {
            // Find the latest event for this provider
            const event = [...data]
              .reverse()
              .find(
                (d) =>
                  (d.type === "trying_provider" && d.data === provider.name) ||
                  (d.type === "provider_failed" && d.data === provider.name) ||
                  (d.type === "provider_success" &&
                    d.data.provider === provider.name)
              );

            const hasError = event?.type === "provider_failed";
            const isLoading = event?.type === "trying_provider";
            const isSuccess = event?.type === "provider_success";

            return {
              provider,
              event,
              hasError,
              isLoading,
              isSuccess,
            };
          })
          .sort((a, b) => {
            // Sort by status: success first, then loading, then no status, then errors
            if (a.isSuccess && !b.isSuccess) return -1;
            if (!a.isSuccess && b.isSuccess) return 1;
            if (a.isLoading && !b.isLoading) return -1;
            if (!a.isLoading && b.isLoading) return 1;
            if (a.hasError && !b.hasError) return 1;
            if (!a.hasError && b.hasError) return -1;
            return 0;
          })
          .map(({ provider, event, hasError, isLoading, isSuccess }) => (
            <MotionCard
              key={provider.name}
              className={`p-4 flex items-center justify-between cursor-pointer ${hasError
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
                  console.log("Event data:", event.data);
                  const watchData = {
                    provider: event.data.provider,
                    url: event.data.url,
                  };
                  console.log("Setting watch data:", watchData);
                  setSelectedWatchLink(watchData);
                  console.log("Store after update:", useWatchStore.getState());
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${hasError
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
                  ? "Hata oluştu"
                  : isSuccess
                    ? "Video bulundu"
                    : isLoading
                      ? "Video aranıyor..."
                      : "Video bulunamadı"}
              </span>
            </MotionCard>
          ))}
      </div>
    </div>
  );
};
