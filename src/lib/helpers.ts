import _slugify from "slugify";

export function slugify(text: string) {
  return _slugify(text, {
    lower: true,
    locale: "tr",
    strict: true,
    trim: true,
  });
}

export function tmdbPosterResponsive(
  url: string,
  sizes = [300, 500, 780]
): {
  src: string;
  srcset: string;
  sizes: string;
} {
  const baseUrl = "https://image.tmdb.org/t/p";
  const srcset = sizes
    .map((size) => `${baseUrl}/w${size}${url} ${size}w`)
    .join(", ");

  return {
    src: `${baseUrl}/w500${url}`,
    srcset,
    sizes: "(max-width: 768px) 300px, (max-width: 1024px) 500px, 780px",
  };
}
