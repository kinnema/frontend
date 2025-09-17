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
import TmdbService from "@/lib/services/tmdb.service";
import { TmdbNetworks } from "@/lib/types/networks";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

interface IProps {
  network: TmdbNetworks;
}

export function CollectionSeries({ network }: IProps) {
  const { t } = useTranslation();
  // For TanStack Router, we need to use search params differently
  // This might need to be updated based on how the route is set up
  const page = 1; // Default to page 1 for now

  const { data, isPending, isError } = useQuery({
    queryKey: ["network-series", network, page],
    queryFn: () => TmdbService.fetchNetworkSeries(network, page),
  });

  if (isPending) return <Loading fullscreen />;

  if (isError) return <div>{t("common.error")}</div>;

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
          <div key={serie.id} className="overflow-hidden">
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
          </div>
        ))}
      </div>

      <div className="mt-10 w-full overflow-x-auto">
        {totalPages > 1 && (
          <Pagination className="flex w-full justify-center">
            <PaginationContent className="flex-wrap">
              <PaginationItem>
                <PaginationPrevious
                  href={
                    page > 1
                      ? `/collection/${TmdbNetworks[
                          network
                        ].toLowerCase()}?page=${page - 1}`
                      : "#"
                  }
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationLink
                  href={`/collection/${TmdbNetworks[
                    network
                  ].toLowerCase()}?page=1`}
                  isActive={page === 1}
                >
                  1
                </PaginationLink>
              </PaginationItem>

              {page > 4 && <PaginationItem>...</PaginationItem>}

              {Array.from({ length: 5 }, (_, i) => {
                const pageNumber = Math.max(2, page - 2) + i;
                if (pageNumber < totalPages && pageNumber > 1) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href={`/collection/${TmdbNetworks[
                          network
                        ].toLowerCase()}?page=${pageNumber}`}
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
                    href={`/collection/${TmdbNetworks[
                      network
                    ].toLowerCase()}?page=${totalPages}`}
                    isActive={page === totalPages}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href={
                    page < totalPages
                      ? `/collection/${TmdbNetworks[
                          network
                        ].toLowerCase()}?page=${page + 1}`
                      : "#"
                  }
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
