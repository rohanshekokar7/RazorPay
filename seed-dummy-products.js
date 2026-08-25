const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dummyProducts = [
  { name: "iPhone 15 Pro (Mobiles)", description: "Latest flagship smartphone with amazing camera.", price: 999.99, inStock: true },
  { name: "Samsung Galaxy S24 Ultra (Mobiles)", description: "Powerful Android mobile phone with stylus.", price: 1199.99, inStock: true },
  { name: "Bestsellers Collection - Watch", description: "One of our all-time bestsellers.", price: 199.99, inStock: true },
  { name: "Sony WH-1000XM5 (Electronics)", description: "Noise cancelling headphones - Electronics", price: 348.00, inStock: true },
  { name: "New Releases - Smart Home Hub", description: "Just added to new releases.", price: 129.99, inStock: true },
  { name: "Today's Deals - Air Fryer", description: "Huge discount on this Home & Kitchen appliance for today's deals.", price: 89.99, inStock: true },
  { name: "Fashion Summer T-Shirt", description: "Trendy fashion apparel.", price: 24.99, inStock: true },
  { name: "MacBook Pro 14 (Computers)", description: "High performance Apple computer.", price: 1999.00, inStock: true },
  { name: "Skincare Set (Beauty & Personal Care)", description: "Premium beauty products.", price: 59.99, inStock: true },
  { name: "Customer Service Guarantee Pack", description: "Extended customer service warranty.", price: 49.99, inStock: true }
];

async function main() {
  for (const p of dummyProducts) {
    await prisma.product.create({ data: p });
  }
  console.log("Successfully seeded dummy products.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
