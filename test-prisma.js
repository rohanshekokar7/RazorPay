const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const products = await prisma.product.findMany({ where: { category: { equals: "Footwear" } }});
    console.log(products.length);
  } catch(e) {
    console.error(e);
  } finally {
    prisma.$disconnect();
  }
}
run();
