"use client";

import { Progress } from "@/components/ui/progress";
import { slugify, tmdbPoster } from "@/lib/helpers";
import { IShowCard } from "@/lib/types/show_card";
import Image from "next/image";
import Link from "next/link";

interface ShowCardProps {
  show: IShowCard;
  withTimeline?: boolean;
  progress?: number;
  href?: string;
}

export function ShowCard({
  show,
  withTimeline = false,
  progress = 70,
  href,
}: ShowCardProps) {
  return (
    <>
      <Link
        href={href ?? `/dizi/${slugify(show.title)}/${show.id}`}
        passHref
        legacyBehavior
      >
        <button className="relative block aspect-[2/3] w-[200px] rounded-lg overflow-hidden group">
          <Image
            src={tmdbPoster(show.image!)}
            alt={show.title}
            width={200}
            height={300}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold text-lg text-left">
              {show.title}
            </h3>
            {show.subTitle && (
              <p className="text-white text-sm text-left">{show.subTitle}</p>
            )}
          </div>
          {withTimeline && (
            <div className="absolute bottom-0 left-0 right-0 h-1">
              <Progress
                value={progress}
                className="h-1 rounded-none bg-white/10 w-[100%]"
              />
            </div>
          )}
        </button>
      </Link>
    </>
  );
}
