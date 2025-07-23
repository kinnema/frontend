import { SearchFeature } from "@/lib/features/search/Search";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import z from "zod";

const schema = z.object({
  q: z.string().optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: schema,
  component: () => (
    <div className="container mx-auto px-4 py-8">
      <Suspense>
        <SearchFeature />
      </Suspense>
    </div>
  ),
});
