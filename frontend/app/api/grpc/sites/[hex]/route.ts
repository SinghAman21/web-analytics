import { NextRequest, NextResponse } from 'next/server';
import { callUnary } from '@/lib/grpc/client';
import type { GrpcGetSiteRequest, GrpcSite } from '@/lib/grpc/types';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ hex: string }> },
) {
  const { hex } = await params;
  try {
    const site = await callUnary<GrpcGetSiteRequest, GrpcSite>('GetSite', {
      hex_share_id: hex,
    });
    return NextResponse.json({ success: true, data: site });
  } catch (err) {
    const status = (err as { code?: number }).code;
    return NextResponse.json(
      { success: false, detail: (err as Error).message },
      { status: status === 5 ? 404 : 500 },
    );
  }
}
