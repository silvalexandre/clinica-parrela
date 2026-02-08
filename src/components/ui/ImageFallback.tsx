"use client";

import { useState, useEffect, ImgHTMLAttributes } from "react";

const FALLBACK_IMAGE = "https://placehold.co/600x400/e2e8f0/1e293b?text=Sem+Imagem";

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
}

export function ImageFallback({ src, alt, className, ...props }: Props) {
  const [imgSrc, setImgSrc] = useState<string>(src || FALLBACK_IMAGE);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || FALLBACK_IMAGE);
    setHasError(false);
  }, [src]);

  return (
    <img
      {...props}
      src={hasError ? FALLBACK_IMAGE : imgSrc}
      alt={alt || "Imagem"}
      className={className}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(FALLBACK_IMAGE);
        }
      }}
    />
  );
}