import { Loading } from "@/components/Loading";
import LanguageSettingsFeature from "@/lib/features/settings/language";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/settings/language")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Suspense fallback={<Loading fullscreen />}>
      <LanguageSettingsFeature />
    </Suspense>
  );
}
