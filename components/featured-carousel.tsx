"use client";

import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";
import { tmdbPoster } from "@/lib/helpers";
import TmdbService from "@/lib/services/tmdb.service";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { NavigationDots } from "./navigation-dots";

export function FeaturedCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliding, setSliding] = useState(false);

  const { data, isPending, isError } = useQuery({
    queryKey: ["home-data"],
    queryFn: () => TmdbService.fetchHomeData(),
  });

  const featuredItems = useMemo(
    () => data?.popular.results.slice(0, 5),
    [data]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSliding(true);
      setTimeout(() => {
        setCurrentIndex(
          (current) => (current + 1) % (featuredItems?.length ?? 0)
        );
        setSliding(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredItems]);

  if (isPending) return <Loading />;

  if (isError) return <div>Error</div>;

  if (!featuredItems) return null;

  console.log(tmdbPoster(featuredItems![currentIndex].poster_path!));
  return (
    <section className="relative h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
      <div
        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
          sliding ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <Image
          src={tmdbPoster(featuredItems![currentIndex].poster_path!)}
          alt={featuredItems![currentIndex].original_name}
          width={1920}
          height={1080}
          className="object-cover w-full h-full"
          priority
        />
      </div>
      <div
        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
          sliding ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Image
          src={tmdbPoster(
            featuredItems![(currentIndex + 1) % featuredItems!.length]
              .poster_path!
          )}
          alt={
            featuredItems![(currentIndex + 1) % featuredItems!.length]
              .original_name
          }
          width={1920}
          height={1080}
          className="object-cover w-full h-full"
          priority
        />
      </div>
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="container px-4 md:px-6 space-y-4">
          <h1 className="text-6xl font-bold tracking-wider max-w-2xl">
            {featuredItems![currentIndex].name}
          </h1>
          <p className="max-w-2xl text-gray-300">
            {featuredItems![currentIndex].overview}
          </p>
          <Button size="lg" className="mt-4">
            Oynat
          </Button>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <NavigationDots count={featuredItems!.length} active={currentIndex} />
      </div>
    </section>
  );
}
