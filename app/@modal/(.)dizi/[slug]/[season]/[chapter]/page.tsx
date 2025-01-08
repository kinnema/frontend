"use client";

import WatchPage from "@/lib/features/watch/WatchPage";
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

  return <WatchPage params={params} />;
}
