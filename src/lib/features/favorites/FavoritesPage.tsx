"use client";

import { ShowCard } from "@/components/show-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApiFavoritesGet200ResponseInner } from "@/lib/api";
import UserService from "@/lib/services/user.service";
import { useQuery } from "@tanstack/react-query";
import { HeartCrack } from "lucide-react";
import { Loading } from "../../components/Loading";

export function FavoritesPageFeature() {
  const { data, isPending } = useQuery<ApiFavoritesGet200ResponseInner[]>({
    queryKey: ["favorites"],
    queryFn: () => UserService.fetchFavorites(),
  });

  if (isPending) {
    return <Loading />;
  }

  if (data?.length === 0) {
    return (
      <Alert>
        <HeartCrack className="h-4 w-4" />
        <AlertTitle>Favoriler</AlertTitle>
        <AlertDescription>Herhangi bir favori yok.</AlertDescription>
      </Alert>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data?.map((show) => (
            <div key={show.id} className="w-full hover:bg-accent/50 rounded-lg transition-colors">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4">
                <ShowCard
                  show={{
                    id: show.tmdbId,
                    title: show.name,
                    image: show.posterPath,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
