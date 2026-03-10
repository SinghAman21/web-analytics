import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://wa-be.vercel.app';

/**
 * First-party proxy for analytics collection
 * Bypasses ad blockers by routing through same-origin
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward to actual backend
    const response = await fetch(`${BACKEND_URL}/api/e`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward client IP for geo tracking
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
        'X-Real-IP': request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    // Silently succeed to not break client tracking
    return NextResponse.json({ success: true }, { status: 200 });
  }
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
