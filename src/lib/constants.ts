import uniqueId from "lodash/uniqueId";

export const BASE_URL = import.meta.env.VITE_PUBLIC_API;
export const TMDB_API_KEY = import.meta.env.VITE_PUBLIC_TMDB_API_KEY;

interface INavLinks {
  name: string;
  href?: string;
  type?: "link" | "divider";
  translationKey?: string;
}

export const NAV_LINKS: INavLinks[] = [
  {
    name: "Ana Sayfa",
    href: "/",
    translationKey: "nav.home",
  },
  {
    name: "Ayarlar",
    href: "/settings",
    translationKey: "nav.settings",
  },
  {
    name: "Eklentiler",
    href: "/plugins",
    translationKey: "nav.plugins",
  },
  {
    name: uniqueId(),
    type: "divider",
  },
];
