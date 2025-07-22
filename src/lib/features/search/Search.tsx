"use client";

import { ShowCard } from "@/components/show-card";
import { Input } from "@/components/ui/input";
import { useSearchStore } from "@/lib/stores/search.store";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loading } from "../../components/Loading";
import TmdbService from "../../services/tmdb.service";
import { ITmdbSearchResults, Result } from "../../types/tmdb";

export function SearchFeature() {
  const [search, setSearch] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearch({ from: '/search' });
  const patchSearches = useSearchStore((state) => state.patchSearches);
  const lastSearches = useSearchStore((state) => state.searches);
  const navigate = useNavigate();

  const { data, isPending, isFetched } = useQuery<ITmdbSearchResults>({
    enabled: search.length > 0,
    queryKey: ["search", search],
    queryFn: () => TmdbService.searchSeries(search),
  });

  useEffect(() => {
    if (searchParams?.q) {
      setSearch(searchParams.q);
    }

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 210);
  }, []);

  useEffect(() => {
    // If search is empty, clear the search params
    if (search.length === 0) {
      navigate({ to: "/search" });
      return;
    }

    navigate({ to: "/search", search: { q: search } });
  }, [search]);

  const onClickShow = useCallback(
    (show: Result) => {
      patchSearches(show);
    },
    [router]
  );

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
            ) : !search.length && lastSearches.length > 0 ? (
              lastSearches.map((show) => (
                <div key={show.id} onClick={() => onClickShow(show)}>
                  <ShowCard
                    show={{
                      id: show.id,
                      title: show.name,
                      image: show.poster_path,
                      subTitle: show.first_air_date,
                    }}
                  />
                </div>
              ))
            ) : isFetched && data?.results.length === 0 ? (
              <div className="col-span-5 text-center text-gray-500">
                Arama sonuç bulunamadı.
              </div>
            ) : (
              data?.results.map((show) => (
                <div key={show.id} onClick={() => onClickShow(show)}>
                  <ShowCard
                    show={{
                      id: show.id,
                      title: show.name,
                      image: show.poster_path,
                      subTitle: show.first_air_date,
                    }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
