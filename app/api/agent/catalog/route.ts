import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const dbProducts = await prisma.product.findMany();
    
    // Map to JSON-LD Schema.org format with Agentic properties
    const products = dbProducts.map(p => {
      // Allow 10% negotiation on items over 5000 INR
      const isExpensive = p.price > 5000; 
      
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        "product_id": p.id,
        "name": p.name,
        "description": p.description,
        "price_inr": p.price,
        "in_stock": p.inStock,
        // Custom agent-to-agent metadata
        "negotiation_allowed": isExpensive,
        "max_discount_percentage": isExpensive ? 10 : 0
      };
    });

    const catalog = {
      "@context": "https://schema.org",
      "@type": "Store",
      store_meta: {
        name: "BuyBuddy AI Agentic Store",
        description: "An autonomous e-commerce store designed for Agent-to-Agent commerce.",
        agent_instructions: "You are an AI purchasing agent. You may query our catalog, negotiate prices if negotiation_allowed is true (within max_discount_percentage limits). To purchase, POST to /api/agent/checkout with Authorization: Bearer test_agent_token_123."
      },
      products: products
    };

    return NextResponse.json(catalog);
  } catch (error) {
    console.error("Failed to fetch catalog:", error);
    return NextResponse.json({ error: "Failed to fetch catalog" }, { status: 500 });
  }
}
