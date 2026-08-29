const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.campaign.createMany({
    data: [
      {
        name: "Summer Accessory Sale",
        description: "10% off on all accessories when bought with clothing",
        discountPercentage: 10,
        triggerKeyword: "clothing",
        isActive: true
      },
      {
        name: "Electronics Clearance",
        description: "Flat 15% off on all electronic items",
        discountPercentage: 15,
        triggerKeyword: "electronics",
        isActive: true
      },
      {
        name: "Footwear Frenzy",
        description: "20% off on shoes and boots",
        discountPercentage: 20,
        triggerKeyword: "footwear",
        isActive: true
      }
    ]
  });
  console.log("Seeded Campaigns successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
