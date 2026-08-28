import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, category, mandate } = body;

    // Validate the presence of the mandate
    if (!mandate || !mandate.isActive) {
      return NextResponse.json(
        { 
          status: 'failed', 
          requiresStepUp: true, 
          message: 'No active mandate found. Please authorize your agent first.' 
        }, 
        { status: 403 }
      );
    }

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

    // Check allowed categories
    // If allowedCategories is empty, assume all are allowed OR none are allowed depending on policy.
    // For this simulation, we'll assume it must explicitly match if there are categories specified.
    if (mandate.allowedCategories && mandate.allowedCategories.length > 0) {
      if (!mandate.allowedCategories.includes(category)) {
        return NextResponse.json(
          { 
            status: 'failed', 
            requiresStepUp: true, 
            message: `Purchases in the '${category}' category are not authorized by your mandate.` 
          }, 
          { status: 403 }
        );
      }
    }

    // If all checks pass, authorize the autonomous payment
    return NextResponse.json(
      { 
        status: 'success', 
        message: 'Agent Authorized Payment processed successfully without manual intervention.',
        transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`
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
