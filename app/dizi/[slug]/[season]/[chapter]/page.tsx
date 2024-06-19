"use client";

import WatchPage from "@/lib/features/watch/WatchPage";

interface IProps {
  params: {
    slug: string;
    season: string;
    chapter: string;
  };
}

const pathNameRegex = "/dizi/(.*)/sezon-([0-9])/bolum-([0-9])";

export default function ChapterPage({ params }: IProps) {
  return <WatchPage params={params} />;
}
