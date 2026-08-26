export function getImageUrl(name: string, width: number = 400, height: number = 300): string {
  const nameLower = name.toLowerCase();
  
  // Specific static high-quality images for core products
  if (nameLower.includes('sneaker') || nameLower.includes('shoe') || nameLower.includes('boot')) {
    return `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=${width}&h=${height}&fit=crop`;
  }
  if (nameLower.includes('laptop') || nameLower.includes('macbook')) {
    return `https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=${width}&h=${height}&fit=crop`;
  }
  if (nameLower.includes('phone') || nameLower.includes('iphone')) {
    return `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=${width}&h=${height}&fit=crop`;
  }
  if (nameLower.includes('watch')) {
    return `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=${width}&h=${height}&fit=crop`;
  }
  if (nameLower.includes('headphone') || nameLower.includes('audio')) {
    return `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=${width}&h=${height}&fit=crop`;
  }
  if (nameLower.includes('mug') || nameLower.includes('cup')) {
    return `https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=${width}&h=${height}&fit=crop`;
  }
  if (nameLower.includes('bag')) {
    return `https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=${width}&h=${height}&fit=crop`;
  }
  if (nameLower.includes('box') || nameLower.includes('cabinet') || nameLower.includes('storage')) {
    return `https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=${width}&h=${height}&fit=crop`;
  }

  // Filter out common adjectives to find the actual subject noun for dynamic fetching
  const stopWords = ['white', 'black', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'brown', 'cream', 'vintage', 'retro', 'jumbo', 'small', 'large', 'set', 'wood', 'wooden', 'glass', 'metal', 'antique', 'silver', 'gold', 'hanging', 'heart', 'assorted'];
  
  const words = nameLower.split(/[^a-z]+/);
  let keyword = words.find(w => w.length > 2 && !stopWords.includes(w));
  
  // If no good keyword found, fallback to just the first word > 2 chars
  if (!keyword) {
    keyword = words.find(w => w.length > 2) || 'product';
  }
  
  // Use a reliable placeholder service with the extracted keyword
  return `https://loremflickr.com/${width}/${height}/${encodeURIComponent(keyword)}?lock=${name.length}`;
}
