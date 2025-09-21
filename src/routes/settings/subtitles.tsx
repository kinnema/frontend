import { Loading } from "@/components/Loading";
import SubtitleSettingsFeature from "@/lib/features/settings/subtitles";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/settings/subtitles")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<Loading fullscreen />}>
        <SubtitleSettingsFeature />
      </Suspense>
    </div>
  );
}
