export function getImageUrl(name: string, width: number = 400, height: number = 300): string {
  const keyword = name.toLowerCase();
  
  // Specific matching for common items
  if (keyword.includes('sneaker') || keyword.includes('shoe') || keyword.includes('boot')) {
    return `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=${width}&h=${height}&fit=crop`;
  }
  if (keyword.includes('laptop') || keyword.includes('macbook') || keyword.includes('computer')) {
    return `https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=${width}&h=${height}&fit=crop`;
  }
  if (keyword.includes('phone') || keyword.includes('iphone')) {
    return `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=${width}&h=${height}&fit=crop`;
  }
  if (keyword.includes('watch') || keyword.includes('clock')) {
    return `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=${width}&h=${height}&fit=crop`;
  }
  if (keyword.includes('headphone') || keyword.includes('audio')) {
    return `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=${width}&h=${height}&fit=crop`;
  }
  if (keyword.includes('bag') || keyword.includes('purse') || keyword.includes('tote')) {
    return `https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=${width}&h=${height}&fit=crop`;
  }

  if (keyword.includes('shirt') || keyword.includes('top') || keyword.includes('dress') || keyword.includes('jean') || keyword.includes('clothing') || keyword.includes('apparel') || keyword.includes('jacket') || keyword.includes('kurta')) {
    return `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=${width}&h=${height}&fit=crop`;
  }
  if (keyword.includes('mug') || keyword.includes('cup') || keyword.includes('tea') || keyword.includes('coffee')) {
    return `https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=${width}&h=${height}&fit=crop`;
  }
  if (keyword.includes('candle') || keyword.includes('light') || keyword.includes('holder')) {
    return `https://images.unsplash.com/photo-1603006905003-be475563bc59?w=${width}&h=${height}&fit=crop`;
  }
  if (keyword.includes('box') || keyword.includes('tin') || keyword.includes('case')) {
    return `https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=${width}&h=${height}&fit=crop`;
  }
  if (keyword.includes('bottle')) {
    return `https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=${width}&h=${height}&fit=crop`;
  }
  if (keyword.includes('sign') || keyword.includes('frame') || keyword.includes('art') || keyword.includes('photo')) {
    return `https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=${width}&h=${height}&fit=crop`;
  }
  if (keyword.includes('heart') || keyword.includes('love') || keyword.includes('star')) {
    return `https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=${width}&h=${height}&fit=crop`;
  }
  if (keyword.includes('christmas') || keyword.includes('xmas') || keyword.includes('tree') || keyword.includes('holiday')) {
    return `https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=${width}&h=${height}&fit=crop`;
  }
  if (keyword.includes('toy') || keyword.includes('doll') || keyword.includes('game') || keyword.includes('puzzle')) {
    return `https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=${width}&h=${height}&fit=crop`;
  }
  
  // A curated list of beautiful lifestyle/product photography from Unsplash to act as fallbacks
  const genericImages = [
    "1505691938895-1758d7feb511", // minimal setup
    "1513694203232-719a280e022f", // cozy home
    "1600607686527-6fb886090705", // decor
    "1544816155-12df9643f363", // jewelry/accessories
    "1520333789090-1afc82db536a", // home vibes
    "1596443686812-2f45229eebc3"  // minimal interior
  ];

  // Hash the product name to consistently pick one of the generic images
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % genericImages.length;
  
  return `https://images.unsplash.com/photo-${genericImages[index]}?w=${width}&h=${height}&fit=crop`;
}
