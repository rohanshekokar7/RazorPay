export function getImageUrl(name: string, width: number = 400, height: number = 300): string {
  const keyword = name.split(' ')[0].toLowerCase();
  
  // Provide specific good images for common types
  if (keyword.includes('sneaker') || keyword.includes('shoe')) {
    return `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=${width}&h=${height}&fit=crop`;
  }
  if (keyword.includes('laptop') || keyword.includes('macbook')) {
    return `https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=${width}&h=${height}&fit=crop`;
  }
  if (keyword.includes('phone') || keyword.includes('iphone')) {
    return `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=${width}&h=${height}&fit=crop`;
  }
  if (keyword.includes('watch')) {
    return `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=${width}&h=${height}&fit=crop`;
  }
  if (keyword.includes('headphone') || keyword.includes('audio')) {
    return `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=${width}&h=${height}&fit=crop`;
  }
  
  // Fallback to a placeholder service using the keyword
  return `https://loremflickr.com/${width}/${height}/${encodeURIComponent(keyword)}?lock=${name.length}`;
}
