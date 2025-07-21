import { uniqueId } from "lodash";

export const BASE_URL = process.env.NEXT_PUBLIC_API;
export const BASE_URL_PROVIDER = process.env.NEXT_PUBLIC_API_PROVIDER;
export const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

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
