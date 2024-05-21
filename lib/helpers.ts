import _slugify from "slugify";

export function slugify(text: string) {
  return _slugify(text, {
    lower: true,
    locale: "tr",
    strict: true,
    trim: true,
  });
}
