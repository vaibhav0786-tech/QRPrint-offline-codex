import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  const event = await req.json();
  // Verify Razorpay signature before production use, then call merchant /payment-confirmed over LAN/tunnel.
  return NextResponse.json({ received: true, event: event.event ?? 'unknown' });
}
