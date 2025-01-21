import { FavoritesPageFeature } from "@/lib/features/favorites/FavoritesPage";
import UserService from "@/lib/services/user.service";
import { QueryClient } from "@tanstack/react-query";

export default async function FavoritesPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["favorites"],
    queryFn: () => UserService.fetchFavorites(),
  });

  return (
    <>
      <main className="pt-24 pb-16">
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <FavoritesPageFeature />
          </div>
        </div>
      </main>
    </>
  );
}
