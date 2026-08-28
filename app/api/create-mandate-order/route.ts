import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    const { amount = 1 } = await req.json();

    const orderOptions = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: `mandate_auth_${Date.now()}`
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({ 
        status: 'success', 
        id: order.id,
        amount: order.amount,
        currency: order.currency
    });
  } catch (error: any) {
    console.error('Error creating mandate auth order:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to create mandate order' },
      { status: 500 }
    );
  }
}
