"use client";

import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";
import { tmdbPoster } from "@/lib/helpers";
import TmdbService from "@/lib/services/tmdb.service";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useMemo } from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export function FeaturedCarousel() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["home-data"],
    queryFn: () => TmdbService.fetchHomeData(),
  });

  const featuredItems = useMemo(
    () => data?.popular.results.slice(0, 5),
    [data]
  );

  if (isPending) return <Loading />;

  if (isError) return <div>Error</div>;

  if (!featuredItems) return null;

  return (
    <Swiper
      spaceBetween={0}
      slidesPerView={1}
      loop
      modules={[Autoplay]}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
    >
      {featuredItems.map((item) => (
        <SwiperSlide>
          <section className="relative h-screen overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
            <div className={`absolute inset-0`}>
              <Image
                src={tmdbPoster(item.poster_path!)}
                alt={item.original_name}
                width={1920}
                height={1080}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <div
              className={`absolute inset-0 transition-transform duration-500 ease-in-out`}
            >
              <Image
                src={tmdbPoster(item.poster_path!)}
                alt={item.original_name}
                width={1920}
                height={1080}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="container px-4 md:px-6 space-y-4 flex flex-wrap  text-wrap">
                <h1 className="text-6xl font-bold tracking-wider max-w-2xl">
                  {item.name}
                </h1>
                <p className="max-w-2xl text-gray-300">{item.overview}</p>
                <Button size="lg" className="mt-4">
                  Oynat
                </Button>
              </div>
            </div>
          </section>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
