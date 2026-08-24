const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Change these to the actual names of your downloaded Kaggle files
const DATASET_FILES = ['dataset1.csv', 'dataset2.csv']; 

async function importDataset(filePath) {
  console.log(`Starting import for ${filePath}...`);
  const products = [];

  return new Promise((resolve, reject) => {
    // If the file doesn't exist yet, just skip it
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File ${filePath} not found. Skipping.`);
      return resolve();
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Mapping for dataset1.csv (Description, UnitPrice) and dataset2.csv (Product Name, Price, Category)
        const name = row['Product Name'] || row.Description || row.product_name || row.title || row.name || 'Unknown Product';
        const description = row.Category || row.about_product || row.description || 'No description available';
        
        // Ensure price is a valid number, default to 100 if missing or unparseable
        let price = parseFloat(row.Price || row.UnitPrice || row.price || row.selling_price);
        if (isNaN(price)) price = 100;

        products.push({
          name: name,
          description: description,
          price: price,
          inStock: true, // Assuming everything imported is in stock
        });
      })
      .on('end', async () => {
        try {
          console.log(`Finished reading ${products.length} rows from ${filePath}. Inserting into database...`);
          
          // Insert all products into the SQLite database in bulk
          // We use chunks of 5000 to prevent overloading the database memory
          const chunkSize = 5000;
          for (let i = 0; i < products.length; i += chunkSize) {
             const chunk = products.slice(i, i + chunkSize);
             await prisma.product.createMany({
               data: chunk
             });
          }
          
          console.log(`✅ Successfully imported ${filePath}!`);
          resolve();
        } catch (error) {
          console.error(`❌ Error inserting data for ${filePath}:`, error);
          reject(error);
        }
      });
  });
}

async function main() {
  for (const file of DATASET_FILES) {
    await importDataset(file);
  }
  console.log('🎉 All datasets processed!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
