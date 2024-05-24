import _slugify from "slugify";

export function slugify(text: string) {
  return _slugify(text, {
    lower: true,
    locale: "tr",
    strict: true,
    trim: true,
  });
}

export function tmdbPoster(url: string) {
  return `https://image.tmdb.org/t/p/original/${url}`;
}
