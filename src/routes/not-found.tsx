import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/not-found")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-900">
      <h1 className="text-3xl font-bold text-black dark:text-white">
        404 - Sayfa Bulunamadı
      </h1>
    </div>
  );
}
