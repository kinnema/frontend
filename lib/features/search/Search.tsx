"use client";

import { ShowCard } from "@/components/show-card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loading } from "../../components/Loading";
import TmdbService from "../../services/tmdb.service";
import { ITmdbSearchResults } from "../../types/tmdb";

export function SearchFeature() {
  const [search, setSearch] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data, isPending, isFetched } = useQuery<ITmdbSearchResults>({
    enabled: search.length > 0,
    queryKey: ["search", search],
    queryFn: () => TmdbService.searchSeries(search),
  });

  useEffect(() => {
    if (searchParams.has("q")) {
      setSearch(searchParams.get("q") as string);
    }

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 210);
  }, []);

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    if (!search) return;

    const searchParams = createQueryString("q", search);
    router.push("/search?" + searchParams);
  }, [search]);

  return (
    <>
      <main className="pt-24 pb-16">
        <div className="p-5">
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              ref={searchInputRef}
              type="search"
              defaultValue={search}
              placeholder="Film, dizi ve belgesel ara..."
              className="pl-10 bg-zinc-900 border-zinc-800 text-white w-full"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {search.length > 0 && isPending ? (
              <Loading />
            ) : (
              data?.results.map((show) => (
                <ShowCard key={show.name} show={show} />
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
