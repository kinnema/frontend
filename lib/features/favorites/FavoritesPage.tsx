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
    <ScrollArea>
      {data?.map((show) => (
        <ShowCard
          key={show.id}
          show={{
            id: show.id,
            title: show.name,
            image: show.posterPath,
          }}
        />
      ))}
    </ScrollArea>
  );
}
