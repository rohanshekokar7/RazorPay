import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, category, mandate, itemName, bypassMandate } = body;

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
      // Check expiration (Simulated checking)
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

      // Check transaction limit
      if (amount > mandate.maxLimit) {
        return NextResponse.json(
          { 
            status: 'failed', 
            requiresStepUp: true, 
            message: `Amount ₹${amount} exceeds your active mandate limit of ₹${mandate.maxLimit}.` 
          }, 
          { status: 403 }
        );
      }
    }

    // Generate expected delivery date (3 days from now)
    const orderDate = new Date();
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(orderDate.getDate() + 3);

    // Generate mock Razorpay A2A Server execution payload
    const mockPaymentId = `pay_${Math.random().toString(36).substring(7)}`;
    const razorpayPayload = {
      id: mockPaymentId,
      entity: "payment",
      amount: amount * 100, // paise
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

    // Save to Database
    const order = await prisma.order.create({
      data: {
        itemName: itemName || 'Generic Item',
        amount: parseFloat(amount),
        status: 'Processing',
        orderDate: orderDate,
        expectedDeliveryDate: expectedDeliveryDate,
        isAutonomous: !bypassMandate,
        paymentId: mockPaymentId
      }
    });

    // If all checks pass, authorize the autonomous payment
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
      { status: 'error', message: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
