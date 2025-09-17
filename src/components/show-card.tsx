import { TmdbImage } from "@/components/Image";
import { Progress } from "@/components/ui/progress";
import { slugify } from "@/lib/helpers";
import { IShowCard } from "@/lib/types/show_card";
import { Link, ToOptions } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface ShowCardProps {
  show: IShowCard;
  withTimeline?: boolean;
  progress?: number;
  onRemove?: () => void;
  linkProps?: ToOptions;
}

export function ShowCard({
  show,
  withTimeline = false,
  progress = 70,
  linkProps,
  onRemove,
}: ShowCardProps) {
  return (
    <>
      <Link
        to="/"
        search={{ serieSlug: slugify(show.title), serieTmdbId: show.id }}
        {...linkProps}
      >
        <div className="relative block aspect-[2/3] w-40 rounded-lg overflow-hidden group cursor-pointer">
          {onRemove && (
            <Button
              variant="link"
              onClick={(e) => {
                e.preventDefault();
                onRemove();
              }}
              className="absolute top-2 right-2 z-10 p-1.5 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="text-white" />
            </Button>
          )}
          <TmdbImage
            src={show.image ?? ""}
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
        </div>
      </Link>
    </>
  );
}
