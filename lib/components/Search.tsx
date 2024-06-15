"use client";

import { slugify, tmdbPoster } from "@/lib/helpers";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import truncate from "lodash/truncate";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { searchSerieOnTMDB } from "../services/series.service";
import { ITmdbSearchResults } from "../types/tmdb";
import { Loading } from "./Loading";

export function Search() {
  const [search, setSearch] = useState<string>("");
  const pathname = usePathname();
  const [animationParent] = useAutoAnimate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { data, isPending, isError } = useQuery<ITmdbSearchResults>({
    enabled: search.length > 0,
    queryKey: ["search", search],
    queryFn: () => searchSerieOnTMDB(search),
  });

  useEffect(() => {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 210);
  }, []);

  if (!pathname.includes("search")) {
    return null;
  }

  return (
    <div
      className={classNames(
        "flex flex-col justify-center items-center w-full h-full z-10 p-10"
      )}
    >
      <form className="md:w-full w-96 ">
        <label
          htmlFor="default-search"
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <FiSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="search"
            id="default-search"
            autoComplete="off"
            autoFocus
            ref={searchInputRef}
            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Ara"
            required
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="text-white absolute end-2.5 bottom-2.5 bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Search
          </button>
        </div>

        <ul
          id="results"
          ref={animationParent}
          className={classNames(
            "bg-white dark:bg-gray-800 dark:text-gray-400 p-5 flex flex-col gap-7 mt-10 rounded-md transition-all  delay-500 max-h-96 overflow-scroll overflow-x-hidden visible opacity-100",
            { "invisible opacity-0": search.length === 0 },
            { "visible opacity-100": search.length > 0 }
          )}
        >
          {isError && <div>Something went wrong</div>}
          {isPending && <Loading />}

          {data?.results.map((serie) => {
            if (serie.poster_path) {
              return (
                <li id="result" className="" key={serie.id}>
                  <Link
                    replace
                    href={`/dizi/${slugify(serie.original_name)}`}
                    className="flex items-center gap-5"
                  >
                    <img
                      src={tmdbPoster(serie.poster_path)}
                      className="w-14 h-14 rounded-full object-cover aspect-square"
                    />
                    <div className="flex flex-col ">
                      <span className="text-lg font-semibold">
                        {serie.original_name}
                      </span>
                      <span>{truncate(serie.overview, { length: 120 })}</span>
                    </div>
                  </Link>
                </li>
              );
            }

            return null;
          })}
        </ul>
      </form>
    </div>
  );
}
