'use client';

import { useState, useEffect } from 'react';
import { getImageUrl } from '@/lib/getImageUrl';

export function ProductImage({ product, width = 400, height = 300, className = "" }: { product: any, width?: number, height?: number, className?: string }) {
  const fallbackSrc = getImageUrl(product.name, width, height);
  const defaultSrc = product.imageUrl || fallbackSrc;
  
  const [src, setSrc] = useState(defaultSrc);
  const [error, setError] = useState(false);

  const getProxiedUrl = (url: string | null) => {
    if (!url) return fallbackSrc;
    if (url.startsWith('http://img')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // If product changes, reset state
  useEffect(() => {
    setSrc(getProxiedUrl(product.imageUrl));
    setError(false);
  }, [product.imageUrl, product.name, width, height]);

  return (
    <img 
      src={error ? fallbackSrc : src} 
      alt={product.name} 
      className={className} 
      onError={() => {
        if (!error) {
          setError(true);
        }
      }}
      loading="lazy"
    />
  );
}
