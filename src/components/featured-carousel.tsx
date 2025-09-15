import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TmdbImage } from "@/lib/components/Image";
import { slugify } from "@/lib/helpers";
import TmdbService from "@/lib/services/tmdb.service";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import Autoplay from "embla-carousel-autoplay";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

export function FeaturedCarousel() {
  const { t } = useTranslation();
  const { data, isPending, isError } = useQuery({
    queryKey: ["home", "popular"],
    queryFn: () => TmdbService.fetchHomePopular(),
  });

  const featuredItems = useMemo(() => data?.results.slice(0, 5), [data]);
  if (isError) return <div>Error</div>;

  if (isPending) {
    return (
      <Carousel
        plugins={[
          Autoplay({
            delay: 3000,
          }),
        ]}
      >
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index}>
              <section className="relative h-[calc(100vh-35vh)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
                <div className="absolute inset-0">
                  <Skeleton className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-40 sm:top-0 inset-0 z-20 flex items-center">
                  <div className="container px-4 md:px-6 space-y-4 flex-col flex flex-wrap text-wrap items-center text-center sm:items-start sm:text-start">
                    <Skeleton className="h-16 w-3/4 max-w-2xl" />
                    <Skeleton className="h-6 w-full max-w-2xl" />
                    <Skeleton className="h-10 w-24 mt-4" />
                  </div>
                </div>
              </section>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    );
  }

  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 3000,
        }),
      ]}
    >
      <CarouselContent>
        {featuredItems!.map((item) => (
          <CarouselItem key={item.id}>
            <Link
              to="/"
              search={{ serieSlug: slugify(item.name), serieTmdbId: item.id }}
              className="w-full h-full"
            >
              <section className="relative h-[calc(100vh-35vh)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
                <div className={`absolute inset-0`}>
                  <TmdbImage
                    src={item.poster_path || "/placeholder-poster.jpg"}
                    alt={item.original_name}
                    width={1024}
                    height={768}
                    className="object-cover w-full h-full"
                    loading={
                      item.id === featuredItems![0]?.id ? "eager" : "lazy"
                    }
                    fetchPriority={
                      item.id === featuredItems![0]?.id ? "high" : "auto"
                    }
                  />
                </div>

                <div className="absolute top-40 sm:top-0 inset-0 z-20 flex items-center">
                  <div className="container px-4 md:px-6 space-y-4 flex-col flex flex-wrap text-wrap items-center text-center sm:items-start sm:text-start">
                    <h1 className="text-6xl font-bold tracking-wider max-w-2xl">
                      {item.name}
                    </h1>
                    <p className="max-w-2xl text-gray-300">{item.overview}</p>
                    <div className="min-w-10">
                      <Button size="lg" className="mt-4">
                        {t("common.play")}
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
