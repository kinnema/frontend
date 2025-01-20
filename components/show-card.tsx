"use client";

import { slugify, tmdbPoster } from "@/lib/helpers";
import { Result } from "@/lib/types/tmdb";
import Image from "next/image";
import Link from "next/link";

interface ShowCardProps {
  show: Result;
}
export function ShowCard({ show }: ShowCardProps) {
  return (
    <>
      <Link
        href={`/dizi/${slugify(show.name)}/${show.id}`}
        passHref
        legacyBehavior
      >
        <button className="relative block aspect-[2/3] w-[200px] rounded-lg overflow-hidden group">
          <Image
            src={tmdbPoster(show.poster_path!)}
            alt={show.original_name}
            width={200}
            height={300}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold text-lg text-left">
              {show.original_name}
            </h3>
          </div>
        </button>
      </Link>
    </>
  );
}
