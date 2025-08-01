"use client";

import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

interface ShowCarouselProps {
  title: string;
  shows: Array<React.ReactNode>;
  maxCards?: number;
  largeCards?: boolean;
  isLoading?: boolean;
}

export function ShowCarousel({ title, shows }: ShowCarouselProps) {
  if (shows.length === 0) return null;

  return (
    <section className="py-8">
      <div className=" md:px-6">
        <h2 className="text-xl md:text-2xl font-bold mb-6">{title}</h2>
        <div className="relative">
          <Carousel className="w-full max-w-s">
            <CarouselContent>
              {shows.map((show, index) => (
                <CarouselItem
                  key={index}
                  className="lg:basis-56 sm:basis-1/4 basis-1/2"
                >
                  {show}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
