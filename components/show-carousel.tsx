"use client";

import { Result } from "@/lib/types/tmdb";
import "swiper/css/autoplay";
import "swiper/css/free-mode";
import { Autoplay, FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ShowCard } from "./show-card";

interface ShowCarouselProps {
  title: string;
  shows: Array<Result>;
  maxCards?: number;
  largeCards?: boolean;
  isLoading?: boolean;
}

export function ShowCarousel({ title, shows }: ShowCarouselProps) {
  console.log(window.innerWidth);

  return (
    <section className="py-8">
      <div className=" md:px-6">
        <h2 className="text-xl md:text-2xl font-bold mb-6">{title}</h2>
        <div className="relative">
          <Swiper
            slidesPerView={2}
            spaceBetween={150}
            freeMode
            autoplay={{
              delay: 3000,
              pauseOnMouseEnter: true,
              disableOnInteraction: true,
            }}
            modules={[FreeMode, Autoplay]}
            breakpoints={{
              320: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              480: {
                slidesPerView: 5,

                spaceBetween: 30,
              },
              640: {
                slidesPerView: 8,
                spaceBetween: 40,
              },
            }}
          >
            {shows.map((show) => (
              <SwiperSlide>
                <ShowCard show={show} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
