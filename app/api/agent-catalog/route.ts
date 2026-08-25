import { NextResponse } from 'next/server';

export async function GET() {
  const catalog = {
    store_metadata: {
      name: "BuyBuddy Autonomous Retail",
      description: "A futuristic headless e-commerce store designed for Agent-to-Agent (A2B) transactions.",
      agent_instructions: "You are an autonomous purchasing AI. Browse the inventory below using semantic_tags. To initiate a purchase, send a POST request to /api/agent-checkout with the product_id and your negotiated_price (if negotiation_allowed is true). You must respect the max_discount_percentage bounds."
    },
    inventory: [
      {
        product_id: "a2b_001",
        name: "Neural Link Development Kit",
        price_inr: 45000,
        semantic_tags: ["bci", "neurotech", "hardware", "research", "brain-computer-interface"],
        stock_status: "IN_STOCK",
        agent_bounds: {
          negotiation_allowed: true,
          max_discount_percentage: 12
        }
      },
      {
        product_id: "a2b_002",
        name: "Quantum Processing Unit - Edge",
        price_inr: 125000,
        semantic_tags: ["quantum", "computing", "edge", "processor", "qpu"],
        stock_status: "LIMITED_STOCK",
        agent_bounds: {
          negotiation_allowed: true,
          max_discount_percentage: 5
        }
      },
      {
        product_id: "a2b_003",
        name: "Standard AI Compute Credits",
        price_inr: 5000,
        semantic_tags: ["cloud", "compute", "tokens", "virtual", "credits"],
        stock_status: "ALWAYS_AVAILABLE",
        agent_bounds: {
          negotiation_allowed: false,
          max_discount_percentage: 0
        }
      }
    ]
  };

  // Add CORS headers so external agents can fetch this from anywhere
  return NextResponse.json(catalog, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
