import { NextRequest, NextResponse } from 'next/server';
import { callUnary } from '@/lib/grpc/client';
import type { GrpcAnalytics, GrpcGetAnalyticsRequest } from '@/lib/grpc/types';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ hex: string }> },
) {
  const { hex } = await params;
  try {
    const analytics = await callUnary<GrpcGetAnalyticsRequest, GrpcAnalytics>(
      'GetAnalytics',
      { hex_share_id: hex, hours: 720 },
    );
    return NextResponse.json({ success: true, data: analytics });
  } catch (err) {
    const status = (err as { code?: number }).code;
    return NextResponse.json(
      { success: false, detail: (err as Error).message },
      { status: status === 5 ? 404 : 500 },
    );
  }
}
