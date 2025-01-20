import { FavoritesPageFeature } from "@/lib/features/favorites/FavoritesPage";
import UserService from "@/lib/services/user.service";
import { QueryClient } from "@tanstack/react-query";

export default async function FavoritesPage() {
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: ["favorites"],
        queryFn: () => UserService.fetchFavorites(),
    });

    return <FavoritesPageFeature />;
}
