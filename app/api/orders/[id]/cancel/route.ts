import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'Cancelled') {
      return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 });
    }

    // Enforce 7-day cancellation policy
    const now = new Date();
    const orderDate = new Date(order.orderDate);
    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      return NextResponse.json({ 
        error: 'Cancellation period expired. Orders can only be cancelled within 7 days.' 
      }, { status: 403 });
    }

    // Cancel the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'Cancelled' }
    });

    return NextResponse.json({ success: true, order: updatedOrder });

  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
