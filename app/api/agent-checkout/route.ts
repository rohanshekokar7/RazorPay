import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'mock_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount: clientAmount, category, mandate, itemName, bypassMandate, line_items } = body;

    let serverTotalAmount = 0;

    // Priority 1: Secure calculation of total price on the server
    if (line_items && Array.isArray(line_items) && line_items.length > 0) {
      for (const item of line_items) {
        const product = await prisma.product.findUnique({ where: { id: item.item_id } });
        if (product) {
          const discount = Math.min(item.requested_discount_percentage || 0, 20);
          const discountedPrice = product.price * (1 - (discount / 100));
          serverTotalAmount += discountedPrice * item.quantity;
        }
      }
    } else {
      serverTotalAmount = parseFloat(clientAmount);
    }

    serverTotalAmount = Math.round(serverTotalAmount);

    // Validate the presence of the mandate
    if (!bypassMandate && (!mandate || !mandate.isActive)) {
      return NextResponse.json(
        { 
          status: 'failed', 
          requiresStepUp: true, 
          message: 'No active mandate found. Please authorize your agent first.' 
        }, 
        { status: 403 }
      );
    }

    if (!bypassMandate) {
      if (mandate.expiresAt && new Date(mandate.expiresAt) < new Date()) {
        return NextResponse.json(
          { 
            status: 'failed', 
            requiresStepUp: true, 
            message: 'The delegated mandate has expired.' 
          }, 
          { status: 403 }
        );
      }

      // Check transaction limit securely against the server-calculated amount
      if (serverTotalAmount > mandate.maxLimit) {
        return NextResponse.json(
          { 
            status: 'failed', 
            requiresStepUp: true, 
            message: `Amount ₹${serverTotalAmount} exceeds your active mandate limit of ₹${mandate.maxLimit}.` 
          }, 
          { status: 403 }
        );
      }
    }

    const orderDate = new Date();
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(orderDate.getDate() + 3);

    let razorpayPayload: any = null;
    const rzpKey = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    // Priority 4: Server-to-Server Razorpay API Call
    if (rzpKey && rzpKey !== 'mock_key_id') {
      try {
        razorpayPayload = await razorpay.orders.create({
          amount: serverTotalAmount * 100, // paise
          currency: "INR",
          receipt: `a2a_${Math.random().toString(36).substring(7)}`,
          notes: {
            agent_id: "ai_clerk_001",
            autonomous: !bypassMandate ? 'true' : 'false'
          }
        });
      } catch (error) {
        console.error("Razorpay SDK Error in A2A:", error);
      }
    }

    // Fallback if SDK fails or keys are missing
    if (!razorpayPayload) {
      razorpayPayload = {
        id: `pay_${Math.random().toString(36).substring(7)}`,
        entity: "payment",
        amount: serverTotalAmount * 100,
        currency: "INR",
        status: "captured",
        method: "upi",
        description: `A2A Purchase: ${itemName}`,
        recurring: true,
        token_id: `token_${Math.random().toString(36).substring(7)}`,
        notes: {
          agent_id: "ai_clerk_001",
          autonomous: !bypassMandate
        }
      };
    }

    // Save to Database
    const order = await prisma.order.create({
      data: {
        itemName: itemName || 'Generic Item',
        amount: serverTotalAmount,
        status: 'Processing',
        orderDate: orderDate,
        expectedDeliveryDate: expectedDeliveryDate,
        paymentId: razorpayPayload.id
      }
    });

    return NextResponse.json(
      { 
        status: 'success', 
        message: 'Agent Authorized Payment processed successfully without manual intervention.',
        transactionId: order.id,
        razorpayPayload
      }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Agent checkout error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message }, 
      { status: 500 }
    );
  }
}
