import { NextRequest, NextResponse } from 'next/server';
import { callUnary } from '@/lib/grpc/client';
import type {
  GrpcCreateSiteRequest,
  GrpcListSitesRequest,
  GrpcListSitesResponse,
  GrpcSite,
} from '@/lib/grpc/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get('limit') || 20);
  const offset = Number(request.nextUrl.searchParams.get('offset') || 0);
  try {
    const result = await callUnary<GrpcListSitesRequest, GrpcListSitesResponse>(
      'ListSites',
      { limit, offset },
    );
    return NextResponse.json({
      success: true,
      data: result.sites || [],
      count: result.count || 0,
      total: result.total || 0,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, detail: (err as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const site = await callUnary<GrpcCreateSiteRequest, GrpcSite>('CreateSite', {
      site_name: body.site_name,
      site_url: body.site_url,
      hex_share_id: body.hex_share_id,
    });
    return NextResponse.json(
      { success: true, data: site, message: 'Site created successfully' },
      { status: 201 },
    );
  } catch (err) {
    const status = (err as { code?: number }).code;
    return NextResponse.json(
      { success: false, detail: (err as Error).message },
      { status: status === 3 ? 400 : 500 },
    );
  }
}
