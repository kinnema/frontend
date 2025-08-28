"use client";

import { Button } from "@/components/ui/button";
import { slugify, tmdbPoster } from "@/lib/helpers";
import TmdbService from "@/lib/services/tmdb.service";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import Autoplay from "embla-carousel-autoplay";
import { useMemo } from "react";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

export function FeaturedCarousel() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["home-data"],
    queryFn: () => TmdbService.fetchHomeData(),
  });

  const featuredItems = useMemo(
    () => data?.popular.results.slice(0, 5),
    [data]
  );

  if (isError) return <div>Error</div>;

  if (!featuredItems) return null;

  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 3000,
        }),
      ]}
    >
      <CarouselContent>
        {featuredItems.map((item) => (
          <CarouselItem key={item.id}>
            <Link
              to="/"
              search={{ serieSlug: slugify(item.name), serieTmdbId: item.id }}
              className="w-full h-full"
            >
              <section className="relative h-[calc(100vh-35vh)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
                <div className={`absolute inset-0`}>
                  <img
                    src={tmdbPoster(item.poster_path!)}
                    alt={item.original_name}
                    width={1024}
                    height={768}
                    className="object-cover w-full h-full"
                    loading={
                      item.id === featuredItems[0]?.id ? "eager" : "lazy"
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
                        Oynat
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
