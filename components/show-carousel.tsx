"use client";

import { Button } from "@/components/ui/button";
import { Loading } from "@/lib/components/Loading";
import { Result } from "@/lib/types/tmdb";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { ShowCard } from "./show-card";

interface ShowCarouselProps {
  title: string;
  shows: Array<Result>;
  maxCards?: number;
  largeCards?: boolean;
  isLoading?: boolean;
}

export function ShowCarousel({
  title,
  shows,
  maxCards = 5,
  largeCards = false,
  isLoading,
}: ShowCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const cardWidth = largeCards ? 320 : 200;
  const cardHeight = largeCards ? 480 : 300;
  const gap = 16; // 1rem = 16px

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = (cardWidth + gap) * (maxCards > 2 ? 2 : 1);
    const newScrollLeft =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });

    handleScroll();
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    setShowLeftButton(container.scrollLeft > 0);
    setShowRightButton(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  return (
    <section className="py-8">
      <div className=" md:px-6">
        <h2 className="text-xl md:text-2xl font-bold mb-6">{title}</h2>
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-hidden scroll-smooth mx-auto pb-4 md:pb-0"
            onScroll={handleScroll}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {isLoading ? (
              <Loading />
            ) : (
              shows.map((show) => (
                <div key={show.name}>
                  <ShowCard show={show} />
                </div>
              ))
            )}
          </div>
          {showLeftButton && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 hidden md:flex"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}
          {showRightButton && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-12 md:-right-12 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 hidden md:flex"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
