import ExperimentalFeaturesComponent from "@/lib/features/experimental";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/experimental/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ExperimentalFeaturesComponent />;
}
