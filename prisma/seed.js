const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clean existing data
  await prisma.product.deleteMany();

  // Create accessories first so we can reference their IDs
  const silkTie = await prisma.product.create({
    data: {
      name: 'Silk Tie',
      description: 'A premium silk tie to complete your formal look.',
      price: 300,
      inStock: true,
    }
  });

  const leatherKeychain = await prisma.product.create({
    data: {
      name: 'Leather Keychain',
      description: 'A durable and stylish leather keychain.',
      price: 150,
      inStock: true,
    }
  });

  const cleaningKit = await prisma.product.create({
    data: {
      name: 'Sneaker Cleaning Kit',
      description: 'Keep your sneakers looking brand new.',
      price: 200,
      inStock: true,
    }
  });

  // Create main products
  await prisma.product.createMany({
    data: [
      {
        name: 'Premium Cotton Shirt',
        description: 'A breathable, high-quality cotton shirt.',
        price: 800,
        inStock: true,
        accessoryId: silkTie.id
      },
      {
        name: 'Leather Wallet',
        description: 'A minimalist leather wallet with RFID protection.',
        price: 900,
        inStock: true,
        accessoryId: leatherKeychain.id
      },
      {
        name: 'Limited Edition Sneakers',
        description: 'Exclusive streetwear sneakers. High demand.',
        price: 950,
        inStock: true,
        accessoryId: cleaningKit.id
      },
      // Adding some new electronics and items to make search interesting
      {
        name: 'Wireless Noise-Canceling Headphones',
        description: 'Over-ear headphones with 40 hours of battery life.',
        price: 450,
        inStock: true,
      },
      {
        name: 'Smart Watch Series X',
        description: 'Fitness tracking, heart rate monitor, and sleep analysis.',
        price: 600,
        inStock: true,
      },
      {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB mechanical keyboard with tactile switches.',
        price: 350,
        inStock: true,
      },
      {
        name: 'Ultralight Gaming Mouse',
        description: 'Wireless gaming mouse with 20k DPI sensor.',
        price: 250,
        inStock: true,
      },
      {
        name: 'Running Shoes - Cloud',
        description: 'Lightweight running shoes for everyday jogging.',
        price: 700,
        inStock: false,
      }
    ]
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
