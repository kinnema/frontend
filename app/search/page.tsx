import { SearchFeature } from "@/lib/features/search/Search";
import { Suspense } from "react";

export const metadata = {
  title: "Arama",
};

export default function SearchPage() {
  return (
    <Suspense>
      <SearchFeature />
    </Suspense>
  );
}
