import { TmdbImage } from "@/components/Image";
import { Loading } from "@/components/Loading";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { slugify } from "@/lib/helpers";
import TmdbService from "@/lib/services/tmdb.service";
import { TmdbNetworks } from "@/lib/types/networks";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "@tanstack/react-router";
import classNames from "classnames";

interface IProps {
  network: TmdbNetworks;
}

export function CollectionSeries({ network }: IProps) {
  const searchParams = useSearch({ from: "/collection/$network" });
  const page = searchParams.page ?? 1;

  const { data, isPending, isError } = useQuery({
    queryKey: ["network-series", network, page],
    queryFn: () => TmdbService.fetchNetworkSeries(network, page),
  });

  if (isPending) return <Loading fullscreen />;

  if (isError) return <div>Error</div>;

  const totalPages = Math.ceil((data?.total_results ?? 0) / 20);

  return (
    <section className="p-4 md:p-10">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-xl md:text-2xl text-white">
          {TmdbNetworks[network].toLocaleUpperCase()}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3 md:gap-5">
        {data.results.map((serie) => (
          <Link
            to="/"
            search={{
              serieSlug: slugify(serie.original_name),
            }}
            key={serie.id}
            className="overflow-hidden"
          >
            <div
              className={classNames(
                "flex flex-col rounded-xl overflow-hidden cursor-pointer group select-none relative w-[150px] md:w-60 h-[200px] md:h-80",
                serie.original_name && "border border-zinc-600"
              )}
            >
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 text-sm font-bold opacity-0 group-hover:opacity-100 duration-300 text-center">
                <div className="self-center flex flex-col items-center space-y-2">
                  <span className="capitalize text-white font-medium drop-shadow-md px-2">
                    {serie.original_name}
                  </span>
                </div>
              </div>

              <TmdbImage
                src={serie.poster_path ?? ""}
                className="h-full w-full object-cover"
                alt={serie.original_name}
                width={300}
                height={450}
                loading="lazy"
              />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 w-full overflow-x-auto">
        {totalPages > 1 && (
          <Pagination className="flex w-full justify-center">
            <PaginationContent className="flex-wrap">
              <PaginationItem>
                <PaginationPrevious
                  search={page > 1 ? { page: (page - 1).toString() } : {}}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              <PaginationItem>
                <Link to="." search={{ page: "1" }}>
                  <PaginationLink isActive={page === 1}>1</PaginationLink>
                </Link>
              </PaginationItem>

              {page > 4 && <PaginationItem>...</PaginationItem>}

              {Array.from({ length: 5 }, (_, i) => {
                const pageNumber = Math.max(2, page - 2) + i;
                if (pageNumber < totalPages && pageNumber > 1) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        from="/collection/$network"
                        search={{ page: pageNumber }}
                        isActive={pageNumber === page}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}

              {page < totalPages - 3 && <PaginationItem>...</PaginationItem>}

              {totalPages > 1 && (
                <PaginationItem>
                  <PaginationLink
                    search={{ page: totalPages }}
                    isActive={page === totalPages}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  search={page < totalPages ? { page: page + 1 } : {}}
                  className={
                    page === totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </section>
  );
}
