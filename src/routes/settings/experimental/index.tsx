import { Loading } from "@/components/Loading";
import ExperimentalFeaturesComponent from "@/lib/features/experimental";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/settings/experimental/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Suspense fallback={<Loading fullscreen />}>
      <ExperimentalFeaturesComponent />
    </Suspense>
  );
}
