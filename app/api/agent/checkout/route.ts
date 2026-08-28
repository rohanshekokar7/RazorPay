import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import prisma from '@/lib/prisma';

// Allowed tokens for agents
const ALLOWED_AGENT_TOKENS = ['test_agent_token_123'];

export async function POST(req: Request) {
  try {
    // 1. Agent-to-Agent Security Check
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`[AUDIT TRAIL] ❌ Security Failed: Missing or invalid Authorization header`);
      return NextResponse.json({ error: "Unauthorized: Missing Bearer Token" }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    if (!ALLOWED_AGENT_TOKENS.includes(token)) {
      console.log(`[AUDIT TRAIL] ❌ Security Failed: Invalid Agent Token`);
      return NextResponse.json({ error: "Forbidden: Invalid Agent Token" }, { status: 403 });
    }

    const body = await req.json();
    const { product_id, negotiated_price } = body;

    console.log(`\n[AUDIT TRAIL] 🤖 Received Checkout Request from Authenticated External Agent`);
    console.log(`[AUDIT TRAIL] Product ID: ${product_id}, Requested Price: ₹${negotiated_price || 'Base Price'}`);

    // 2. Dynamic Database Validation
    const product = await prisma.product.findUnique({
      where: { id: product_id }
    });
    
    if (!product) {
      console.log(`[AUDIT TRAIL] ❌ Validation Failed: Invalid Product ID`);
      return NextResponse.json({ error: "Invalid product_id" }, { status: 404 });
    }

    let finalPrice = product.price;

    // Validate Negotiation
    if (negotiated_price) {
      console.log(`[AUDIT TRAIL] Validating discount limits...`);
      const discountAmount = product.price - negotiated_price;
      const discountPercentage = (discountAmount / product.price) * 100;
      
      const isExpensive = product.price > 5000;
      const maxDiscountPercentage = isExpensive ? 10 : 0;

      if (discountPercentage > maxDiscountPercentage) {
        console.log(`[AUDIT TRAIL] ❌ Negotiation Failed: Requested discount (${discountPercentage.toFixed(2)}%) exceeds maximum allowed (${maxDiscountPercentage}%).`);
        return NextResponse.json({ 
          error: "Negotiated price violates max_discount_percentage bounds.",
          allowed_minimum: product.price * (1 - (maxDiscountPercentage / 100))
        }, { status: 400 });
      } else if (discountPercentage < 0) {
          console.log(`[AUDIT TRAIL] ❌ Negotiation Failed: Price higher than base price.`);
          return NextResponse.json({ error: "Invalid price." }, { status: 400 });
      }

      console.log(`[AUDIT TRAIL] ✅ Negotiation Accepted: Discount is within allowed bounds (${discountPercentage.toFixed(2)}%).`);
      finalPrice = negotiated_price;
    }

    console.log(`[AUDIT TRAIL] Initializing Razorpay Transaction for ₹${finalPrice}...`);

    // 3. Create Razorpay Order
    const orderOptions = {
      amount: Math.round(finalPrice * 100), // Razorpay requires amount in paise
      currency: "INR",
      receipt: `receipt_agent_${Date.now()}`
    };

    const order = await razorpay.orders.create(orderOptions);

    console.log(`[AUDIT TRAIL] ✅ Order successfully created! Order ID: ${order.id}`);

    return NextResponse.json({
      success: true,
      message: "Order successfully initiated via Agentic Checkout.",
      order_id: order.id,
      amount: finalPrice,
      currency: "INR"
    });

  } catch (error: any) {
    console.error(`[AUDIT TRAIL] 🚨 Server Error:`, error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
