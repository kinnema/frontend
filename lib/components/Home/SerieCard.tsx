import { slugify, tmdbPoster } from "@/lib/helpers";
import { IFavorite, IMutationAddFavorite, ISerie } from "@/lib/models";
import UserService from "@/lib/services/user.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useMutation } from "@tanstack/react-query";
import classNames from "classnames";
import Link from "next/link";
import React, { useCallback } from "react";
import toast from "react-hot-toast";
import { FiHeart } from "react-icons/fi";
import Button from "../Button";

interface IProps {
  serie: ISerie;
}

export function SerieCard({ serie }: IProps) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { mutateAsync, isPending } = useMutation<
    IFavorite,
    void,
    IMutationAddFavorite
  >({
    mutationFn: (data) => UserService.addToFavorites(data),
    onSuccess: (e) => toast.success("Favorilere eklendi"),
    onError: (e) => toast.error("Favorilere eklenemedi"),
  });

  const onClickFavorite = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, serie: ISerie) => {
      e.stopPropagation();
      e.preventDefault();

      await mutateAsync({
        tmdb_id: serie.tmdb_id,
        name: serie.name,
        poster_path: serie.href ?? "",
      });
    },
    []
  );

  return (
    <Link href={serie.href ?? `/dizi/${slugify(serie.name)}`}>
      <div
        className={classNames(
          "flex flex-col rounded-xl overflow-hidden cursor-pointer group select-none relative",
          serie.name && "border dark:border-zinc-600"
        )}
      >
        <div className="absolute inset-0 bg-black/60 none flex-col gap-4 text-sm   font-bold opacity-0 group-hover:opacity-100 duration-300 text-center hidden md:flex">
          <div id="header" className="m-5 flex self-end">
            {isLoggedIn && (
              <Button
                rounded
                onClick={(e) => onClickFavorite(e, serie)}
                isLoading={isPending}
                isIconOnly
              >
                <FiHeart />
              </Button>
            )}
          </div>

          <span className="self-center capitalize text-white font-medium drop-shadow-md">
            {serie.name}
          </span>
        </div>

        <img
          src={tmdbPoster(serie.image ?? "")}
          className="h-full w-full"
          alt={serie.name}
        />

        {serie.name && (
          <div className="w-full bg-white dark:bg-zinc-800 dark:text-white px-3 flex py-5 items-center justify-between border-t-2 border-t-red-600">
            <span className="capitalize  font-medium truncate">
              {serie.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
