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


  return (
    <>
      <main className="pt-24 pb-16">
        <div className="p-5">
          {data?.length === 0 && <Alert>
            <HeartCrack className="h-4 w-4" />
            <AlertTitle>Favoriler</AlertTitle>
            <AlertDescription>
              Herhangi bir favori yok.
            </AlertDescription>
          </Alert>}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">

            {isPending ? (
              <Loading />
            ) : (
              <ScrollArea>
                {data?.map((show) => (
                  <ShowCard
                    key={show.id}
                    show={{
                      name: show.name ?? "",
                      original_name: show.name ?? "",
                      poster_path: show.posterPath ?? "",
                      id: 0,
                      adult: false,
                      genre_ids: [],
                      origin_country: [],
                      original_language: "",
                      vote_average: 0,
                      vote_count: 0,
                      overview: "",
                      popularity: 0,
                      first_air_date: "",
                    }}
                  />
                ))}
              </ScrollArea>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
