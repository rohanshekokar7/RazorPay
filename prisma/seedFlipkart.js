const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const CSV_FILE_PATH = '/Users/rohanpradipshekokar/Downloads/RazorPay/flipkart_com-ecommerce_sample.csv';
const MAX_PRODUCTS = 500;

async function main() {
  console.log('Starting seed process...');
  const results = [];

  // Read CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', (data) => {
        if (results.length < MAX_PRODUCTS && data.product_name) {
          results.push(data);
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Parsed ${results.length} products from CSV. Clearing old products...`);

  // Clear existing products
  await prisma.product.deleteMany({});
  console.log('Old products cleared.');

  // Prepare product data for Prisma
  const productsToInsert = results.map(row => {
    // Parse original and discounted prices
    let originalPrice = parseFloat(row.retail_price);
    if (isNaN(originalPrice) || originalPrice <= 0) originalPrice = 2000; // default to 2000 INR
    
    let rawPrice = parseFloat(row.discounted_price);
    if (isNaN(rawPrice) || rawPrice <= 0) rawPrice = originalPrice;
    
    // Extract the first image URL from the stringified array
    let imageUrl = null;
    if (row.image) {
      const match = row.image.match(/http[^"']+/);
      if (match) {
        imageUrl = match[0];
      }
    }
    // Extract the category
    let category = null;
    if (row.product_category_tree) {
      // Data looks like '["Clothing >> Women\'s Clothing >> Lingerie ..."]'
      const match = row.product_category_tree.match(/\["([^>"]+)>>/);
      if (match) {
        category = match[1].trim();
      } else {
        const match2 = row.product_category_tree.match(/\["([^"]+)"\]/);
        if (match2) category = match2[1].trim();
      }
    }

    return {
      name: row.product_name,
      description: row.description || 'No description available',
      price: rawPrice,
      originalPrice: originalPrice,
      inStock: true,
      imageUrl: imageUrl,
      category: category
    };
  });

  // Insert one by one to avoid SQLite createMany issues
  let count = 0;
  for (const product of productsToInsert) {
    try {
      await prisma.product.create({
        data: product
      });
      count++;
    } catch (err) {
      console.warn(`Skipped product ${product.name} due to error`);
    }
  }

  console.log(`Successfully seeded ${count} products into the database!`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("Error code:", e.code);
    console.error("Error message (first 200 chars):", e.message.substring(0, 200));
    await prisma.$disconnect();
    process.exit(1);
  });
