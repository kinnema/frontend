import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/lib/components/Loading";
import { useAppStore } from "@/lib/stores/app.store";
import { IGithubRelease } from "@/lib/types/github.type";
import { isNativePlatform } from "@/lib/utils/native";
import { QUERY_KEYS } from "@/lib/utils/queryKeys";
import { BundleInfo, CapacitorUpdater } from "@capgo/capacitor-updater";
import { ToastAction } from "@radix-ui/react-toast";
import { useSuspenseQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { Download, Info, Loader2 } from "lucide-react";
import { marked } from "marked";
import { Suspense, useEffect, useState } from "react";
import { compare } from "semver";

export default function AppUpdatesFeature() {
  const [jsUpdateAvailable, setJsUpdateAvailable] = useState(false);
  const [appUpateAvailable, setAppUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [downloadPercent, setDownloaderPercent] = useState(0);
  const localVersion = useAppStore((state) => state.version);
  const { toast } = useToast();

  const lastUpdateQuery = useSuspenseQuery<IGithubRelease>({
    queryKey: QUERY_KEYS.LatestUpdate,
  });

  const checkForUpdatesQuery = useSuspenseQuery<IGithubRelease[]>({
    queryKey: QUERY_KEYS.AppUpdates,
  });

  useEffect(() => {
    const resultJs = compare(localVersion.jsVersion, lastUpdateQuery.data.name);
    const result = compare(localVersion.appVersion, lastUpdateQuery.data.name);

    if (resultJs === -1 && lastUpdateQuery.data.name.includes("-js")) {
      setJsUpdateAvailable(true);
    }
    if (result === -1 && lastUpdateQuery.data.name.includes("-app")) {
      setAppUpdateAvailable(true);
    }
  }, [lastUpdateQuery, localVersion]);

  useEffect(() => {
    CapacitorUpdater.addListener("download", (state) => {
      setIsUpdating(true);
      setDownloaderPercent(state.percent);
    });

    CapacitorUpdater.addListener("downloadComplete", (state) => {
      async function setUpdate(version: BundleInfo) {
        await CapacitorUpdater.set(version);
      }
      setIsUpdating(false);

      toast({
        title: "Update Downloaded",
        description:
          "Update downloaded, please confirm if you want to update it",
        action: (
          <ToastAction
            altText="Try again"
            onClick={() => setUpdate(state.bundle)}
          >
            Update now
          </ToastAction>
        ),
      });
    });

    return () => {
      CapacitorUpdater.removeAllListeners();
    };
  }, []);

  function renderBody(body: string) {
    return DOMPurify.sanitize(marked(body, { async: false }));
  }

  async function downloadUpdate() {
    if (!isNativePlatform()) {
      toast({
        title: "Native platform",
        description: "Are you even on a native platform?",
      });

      return;
    }

    const version = await CapacitorUpdater.download({
      version: lastUpdateQuery.data.name,
      url: `https://github.com/kinnema/frontend/releases/latest/download/${lastUpdateQuery.data.name}.zip`,
    });
  }

  return (
    <Suspense fallback={<Loading />}>
      <Card className="w-full max-w-md mx-auto my-8 md:my-12">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">App Updates</CardTitle>
          <CardDescription>
            Stay up-to-date with the latest features and improvements.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>Current App Version: {localVersion.appVersion}</span>,
            <span>Current JS Version: {localVersion.jsVersion}</span>
          </div>
          <Separator />
          <ScrollArea className="h-[300px] pr-4">
            <div className="grid gap-6">
              {checkForUpdatesQuery.data?.map((update, index) => (
                <div key={index} className="grid gap-1.5">
                  <h3 className="text-lg font-semibold">
                    Version {update.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {update.created_at}
                  </p>
                  <div
                    className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{
                      __html: renderBody(lastUpdateQuery.data?.body),
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full"
            variant={jsUpdateAvailable ? "default" : "outline"}
            disabled={!jsUpdateAvailable || !isNativePlatform() || isUpdating}
            onClick={downloadUpdate}
          >
            {isUpdating ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}

            {jsUpdateAvailable
              ? isNativePlatform()
                ? isUpdating
                  ? "Downloading update..."
                  : "Download Update"
                : "Not an native platform"
              : "You are already on latest version"}
          </Button>
          {downloadPercent ? <Progress value={downloadPercent} /> : null}
        </CardFooter>
      </Card>
    </Suspense>
  );
}
