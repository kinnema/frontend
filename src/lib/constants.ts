import { uniqueId } from "lodash";

export const BASE_URL = import.meta.env.VITE_PUBLIC_API;
export const TMDB_API_KEY = import.meta.env.VITE_PUBLIC_TMDB_API_KEY;

interface INavLinks {
  name: string;
  href?: string;
  type?: "link" | "divider";
}

export const NAV_LINKS: INavLinks[] = [
  {
    name: "Ana Sayfa",
    href: "/",
  },
  {
    name: "Ayarlar",
    href: "/settings",
  },
  {
    name: "Eklentiler",
    href: "/plugins",
  },
  {
    name: uniqueId(),
    type: "divider",
  },
  {
    name: "Gain",
    href: "/collection/gain",
  },
  {
    name: "BluTV",
    href: "/collection/blutv",
  },
  {
    name: "Exxen",
    href: "/collection/exxen",
  },
  {
    name: "Netflix",
    href: "/collection/netflix",
  },
  {
    name: "tabii",
    href: "/collection/tabii",
  },
];
