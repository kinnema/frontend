"use client";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Circle, X } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { ApiWatchProvidersGet200Response } from "../api";
import { IWatchResult } from "../models";
import AppService from "../services/app.service";
import { useWatchStore } from "../stores/watch.store";
import { Loading } from "./Loading";

const MotionCard = motion.create(Card);

export const Providers = ({ data }: { data: IWatchResult[] }) => {
  const setSelectedWatchLink = useWatchStore(
    (state) => state.setSelectedWatchLink
  );
  const { data: providers, isPending } =
    useQuery<ApiWatchProvidersGet200Response>({
      queryKey: ["providers"],
      queryFn: () => AppService.fetchProviders(),
    });

  return (
    <div className="flex flex-col gap-2 w-full m-auto max-w-md">
      <h1 className="text-2xl font-bold">Kaynaklar</h1>
      <p className="text-sm text-muted-foreground">
        Aşağıdaki kaynakları kullanarak dizi izleyebilirsiniz, herhangi birine
        tiklamaniz yeterlidir.
      </p>

      <div className="mt-10">
        {isPending ? (
          <Loading />
        ) : (
          providers?.providers?.map((provider) => {
            const watchResult = data.find((d) => d.provider === provider.name);
            const hasError = watchResult?.error !== undefined;
            const notFound = !watchResult;
            const providerName = `${provider.name
              ?.charAt(0)
              .toUpperCase()}${provider.name?.slice(1)}`;

            return (
              <MotionCard
                key={provider.name}
                className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: hasError ? 0.2 : 1, y: hasError ? 0 : -20 }}
                transition={{ duration: 0.3 }}
                onClick={() => {
                  if (watchResult) {
                    setSelectedWatchLink(watchResult);
                  }
                }}
              >
                {hasError && (
                  <Badge
                    variant="destructive"
                    className="h-6 w-6 p-0 flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </Badge>
                )}
                {notFound && (
                  <Badge
                    variant="secondary"
                    className="h-6 w-6 p-0 flex items-center justify-center"
                  >
                    <motion.div
                      animate={{
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    >
                      <Circle className="h-4 w-4" />
                    </motion.div>
                  </Badge>
                )}
                {!hasError && !notFound && (
                  <Badge
                    variant="default"
                    className="h-6 w-6 p-0 flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Badge>
                )}

                <span className="text-sm font-medium">{providerName}</span>

                <motion.span
                  className="text-xs text-muted-foreground ml-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {hasError
                    ? "Error occurred"
                    : notFound
                    ? "Doesn't have the video"
                    : "Available"}
                </motion.span>
              </MotionCard>
            );
          })
        )}
      </div>
    </div>
  );
};
