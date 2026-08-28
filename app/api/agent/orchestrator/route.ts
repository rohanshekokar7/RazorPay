import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { intent, currentCart, userContext } = body;

    // Simulated Active Campaigns in the database
    const activeCampaigns = [
      {
        campaign_id: "camp_coffee_filters_15",
        name: "15% off Filters with Coffee",
        trigger_items: ["prod_coffee_01"], // Items that trigger the campaign
        upsell_items: ["prod_filter_01"],
        discount_percentage: 15,
        script_instruction: "The orchestrator is running a 15% off campaign on premium filters today. Ask the user if they want to add those too."
      },
      {
        campaign_id: "camp_laptop_sleeve_free",
        name: "Free Sleeve with Laptop",
        trigger_items: ["prod_laptop_01"],
        upsell_items: ["prod_sleeve_01"],
        discount_percentage: 100,
        script_instruction: "We are currently offering a complimentary premium sleeve with all Ultra laptops. Shall I add it to your order at no extra cost?"
      }
    ];

    let instructions = [];
    let appliedCampaigns = [];

    // Check if the current intent or cart triggers any campaigns
    for (const campaign of activeCampaigns) {
      // Very simple logic: if the user mentions the trigger item or it's in the cart
      const intentMatches = campaign.trigger_items.some(item => intent.toLowerCase().includes("coffee") && item === "prod_coffee_01" || intent.toLowerCase().includes("laptop") && item === "prod_laptop_01");
      const cartMatches = currentCart?.some((item: any) => campaign.trigger_items.includes(item.product_id));

      if (intentMatches || cartMatches) {
        // Ensure the upsell item isn't already in the cart
        const alreadyHasUpsell = currentCart?.some((item: any) => campaign.upsell_items.includes(item.product_id));
        
        if (!alreadyHasUpsell) {
          instructions.push({
            type: "UPSELL",
            priority: "HIGH",
            target_items: campaign.upsell_items,
            system_prompt: campaign.script_instruction
          });
          appliedCampaigns.push(campaign.campaign_id);
        }
      }
    }

    return NextResponse.json({
      status: "success",
      orchestrator_decision: {
        should_intervene: instructions.length > 0,
        instructions: instructions,
        active_campaigns_triggered: appliedCampaigns
      }
    });

  } catch (error) {
    console.error("Orchestrator Error:", error);
    return NextResponse.json({ error: "Orchestrator failed to process intent" }, { status: 500 });
  }
}
