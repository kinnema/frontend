"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import WatchPage from "@/lib/features/watch/WatchPage";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useEffect } from "react";

interface IProps {
  params: {
    slug: string;
    season: string;
    chapter: string;
  };
}

export default function ChapterPage({ params }: IProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "initial";
    };
  }, []);

  return (
    <Dialog open>
      <DialogContent className="max-w-6xl p-0 h-[90vh] bg-black/95 text-white border-zinc-800">
        <VisuallyHidden>
          <DialogTitle>{params.slug}</DialogTitle>
        </VisuallyHidden>
        <WatchPage params={params} />
      </DialogContent>
    </Dialog>
  );
}
