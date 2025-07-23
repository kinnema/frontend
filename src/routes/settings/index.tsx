import AppSettingsFeature from "@/lib/features/settings";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense>
        <AppSettingsFeature />
      </Suspense>
    </div>
  );
}
