/**
 * Standalone Node.js script to simulate an external Buyer AI Agent.
 * Run this in your terminal using: node simulate-buyer-agent.js
 */

const BASE_URL = 'http://localhost:3000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runAgentSimulation() {
  console.log('\n🤖 [Buyer AI]: Booting up autonomous purchasing sequence...');
  await sleep(1000);

  // Step 1: Read Catalog
  console.log('🤖 [Buyer AI]: Scanning merchant catalog at /api/agent/catalog...');
  const catalogRes = await fetch(`${BASE_URL}/api/agent/catalog`);
  const catalog = await catalogRes.json();
  
  console.log('📖 [Merchant Data]: Received catalog with', catalog.products.length, 'products.');
  await sleep(1000);

  // Step 2: Select a product and determine strategy
  const targetProduct = catalog.products[0]; // Premium Mechanical Keyboard
  console.log(`\n🤖 [Buyer AI]: Selected target product -> ${targetProduct.name} (Base Price: ₹${targetProduct.price_inr})`);
  
  let negotiatedPrice = targetProduct.price_inr;
  
  if (targetProduct.negotiation_allowed) {
      console.log(`🤖 [Buyer AI]: Negotiation allowed! Max discount is ${targetProduct.max_discount_percentage}%. Calculating aggressive counter-offer...`);
      // Request a 10% discount (which is within the 15% limit)
      const discount = targetProduct.price_inr * 0.10;
      negotiatedPrice = targetProduct.price_inr - discount;
      console.log(`🤖 [Buyer AI]: I will offer ₹${negotiatedPrice}.`);
  }
  
  await sleep(1500);

  // Step 3: Execute Checkout
  console.log('\n💳 [Buyer AI]: Initiating Razorpay transaction at /api/agent/checkout...');
  
  const checkoutRes = await fetch(`${BASE_URL}/api/agent/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: targetProduct.product_id,
      negotiated_price: negotiatedPrice
    })
  });

  const checkoutData = await checkoutRes.json();

  if (checkoutRes.ok) {
    console.log(`\n✅ [Buyer AI]: SUCCESS! Transaction approved.`);
    console.log(`📦 [Buyer AI]: Order ID received: ${checkoutData.order_id}`);
    console.log(`💰 [Buyer AI]: Final amount charged: ₹${checkoutData.amount}`);
  } else {
    console.log(`\n❌ [Buyer AI]: TRANSACTION FAILED.`);
    console.log(`⚠️ [Error Detail]: ${checkoutData.error}`);
  }
  
  console.log('\n🤖 [Buyer AI]: Autonomous purchasing sequence complete.\n');
}

runAgentSimulation().catch(err => {
    console.error("Simulation crashed:", err);
});
