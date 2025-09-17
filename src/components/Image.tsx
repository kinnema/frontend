import { useMemo } from "react";
import { tmdbPosterResponsive } from "../lib/helpers";

// Create a new OptimizedImage component
interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function TmdbImage({
  src,
  alt,
  width,
  height,
  ...props
}: OptimizedImageProps) {
  const imageSource = useMemo(() => tmdbPosterResponsive(src), [src]);

  return (
    <picture>
      <source
        srcSet={imageSource.srcset}
        sizes={imageSource.sizes}
        type="image/webp"
      />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        {...props}
      />
    </picture>
  );
}
