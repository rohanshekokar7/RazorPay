import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real application, this would fetch from a database (e.g., Prisma)
    // and format it specifically for the AI agent (omitting human-readable formatting, images, etc.)
    const agentCatalog = [
      {
        product_id: "prod_coffee_01",
        name: "Artisan 250g Coffee Beans",
        category: "Groceries",
        base_price: 450,
        stock_status: "in_stock",
        semantic_tags: ["coffee", "beans", "beverage", "caffeine", "morning", "artisan"],
        allowed_discount_thresholds: {
          max_percentage: 10,
          requires_manager_approval: false
        },
        pairing_rules: {
          suggested_add_ons: ["prod_filter_01", "prod_mug_01"],
          bundle_discount: 5
        }
      },
      {
        product_id: "prod_filter_01",
        name: "Premium Paper Filters (100 pack)",
        category: "Groceries",
        base_price: 150,
        stock_status: "in_stock",
        semantic_tags: ["filters", "coffee", "accessories", "paper"],
        allowed_discount_thresholds: {
          max_percentage: 15,
          requires_manager_approval: false
        },
        pairing_rules: {
          suggested_add_ons: ["prod_coffee_01"],
          bundle_discount: 0
        }
      },
      {
        product_id: "prod_laptop_01",
        name: "ProBook Ultra 14\"",
        category: "Electronics",
        base_price: 85000,
        stock_status: "low_stock",
        semantic_tags: ["laptop", "computer", "electronics", "expensive", "work", "pro"],
        allowed_discount_thresholds: {
          max_percentage: 5,
          requires_manager_approval: true
        },
        pairing_rules: {
          suggested_add_ons: ["prod_mouse_01", "prod_sleeve_01"],
          bundle_discount: 0
        }
      }
    ];

    // Return the machine-readable catalog
    return NextResponse.json({ 
      _meta: { format: "llm_optimized", version: "1.0", timestamp: new Date().toISOString() },
      catalog: agentCatalog 
    });
  } catch (error) {
    console.error("Agent Catalog Error:", error);
    return NextResponse.json({ error: "Failed to fetch agent catalog" }, { status: 500 });
  }
}
