"use client";

import WatchPage from "@/lib/features/watch/WatchPage";

interface IProps {
  params: {
    slug: string;
    season: string;
    chapter: string;
  };
}

export default function ChapterPage({ params }: IProps) {
  return <WatchPage params={params} />;
}
