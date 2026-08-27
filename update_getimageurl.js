const fs = require('fs');
let code = fs.readFileSync('lib/getImageUrl.ts', 'utf8');

const newIf = `
  if (keyword.includes('shirt') || keyword.includes('top') || keyword.includes('dress') || keyword.includes('jean') || keyword.includes('clothing') || keyword.includes('apparel') || keyword.includes('jacket')) {
    return \`https://images.unsplash.com/photo-1489987707023-afc672b15749?w=\${width}&h=\${height}&fit=crop\`;
  }
`;

code = code.replace(/if \(keyword\.includes\('bag'\)[^\}]+}/, match => match + "\n" + newIf);
fs.writeFileSync('lib/getImageUrl.ts', code);
