import { Loading } from "@/components/Loading";
import AppUpdatesFeature from "@/lib/features/settings/updates";
import { IGithubRelease } from "@/lib/types/github.type";
import { QUERY_KEYS } from "@/lib/utils/queryKeys";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/settings/updates")({
  component: RouteComponent,
  async loader({ context: { queryClient } }) {
    await Promise.all([
      await queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.LatestUpdate,
        queryFn: async () => {
          const response = await fetch(
            `${import.meta.env.VITE_GITHUB_RELEASES_URL}/latest`
          );
          const responseJson = (await response.json()) as IGithubRelease;

          return responseJson;
        },
      }),
      await queryClient.prefetchQuery<IGithubRelease[]>({
        queryKey: QUERY_KEYS.AppUpdates,
        queryFn: async () => {
          const response = await fetch(
            import.meta.env.VITE_GITHUB_RELEASES_URL
          );
          const responseJson = (await response.json()) as IGithubRelease[];

          return responseJson;
        },
      }),
    ]);
  },
});

function RouteComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<Loading fullscreen />}>
        <AppUpdatesFeature />
      </Suspense>
    </div>
  );
}
