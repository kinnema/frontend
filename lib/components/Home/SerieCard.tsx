import { slugify, tmdbPoster } from "@/lib/helpers";
import { IFavorite, IMutationAddFavorite } from "@/lib/models";
import { addToFavorites } from "@/lib/services/user.service";
import { Result } from "@/lib/types/tmdb";
import { useMutation } from "@tanstack/react-query";
import classNames from "classnames";
import Link from "next/link";
import React, { useCallback } from "react";
import toast from "react-hot-toast";
import { FiHeart } from "react-icons/fi";
import Button from "../Button";
import { Loading } from "../Loading";

interface IProps {
  serie: Result;
}

export function SerieCard({ serie }: IProps) {
  const { mutateAsync, isPending } = useMutation<
    IFavorite,
    void,
    IMutationAddFavorite
  >({
    mutationFn: (data) => addToFavorites(data),
    onSuccess: (e) => toast.success("Favorilere eklendi"),
    onError: (e) => toast.error("Favorilere eklenemedi"),
  });

  const onClickFavorite = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, serie: Result) => {
      e.stopPropagation();
      e.preventDefault();

      await mutateAsync({
        tmdb_id: serie.id,
        name: serie.original_name,
        poster_path: serie.poster_path ?? "",
      });
    },
    []
  );

  return (
    <Link href={`/dizi/${slugify(serie.original_name)}`} key={serie.id}>
      <div
        className={classNames(
          "flex flex-col rounded-xl overflow-hidden cursor-pointer group select-none relative",
          serie.name && "border dark:border-zinc-600"
        )}
      >
        <div className="absolute inset-0 bg-black/60 none flex-col gap-4 text-sm   font-bold opacity-0 group-hover:opacity-100 duration-300 text-center hidden md:flex">
          <div id="header" className="m-5 flex self-end">
            <Button rounded onClick={(e) => onClickFavorite(e, serie)}>
              {isPending ? <Loading sizeClass="w-3 h-3" /> : <FiHeart />}
            </Button>
          </div>

          <span className="self-center capitalize text-white font-medium drop-shadow-md">
            {serie.original_name}
          </span>
        </div>

        <img
          src={tmdbPoster(serie.poster_path ?? "")}
          className="h-full w-full"
          alt={serie.original_name}
        />

        {serie.original_name && (
          <div className="w-full bg-white dark:bg-zinc-800 dark:text-white px-3 flex py-5 items-center justify-between border-t-2 border-t-red-600">
            <span className="capitalize  font-medium truncate">
              {serie.original_name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
