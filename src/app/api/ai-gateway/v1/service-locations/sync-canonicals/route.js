import { NextResponse } from 'next/server';
import { verifyAiGatewayAuth } from '@/lib/ai-gateway-auth';
import { syncServiceLocationCanonicals } from '@/lib/services/serviceLocationService';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai-gateway/v1/service-locations/sync-canonicals
 * Batch sync all service_locations.canonical_url to standard format:
 * https://workontap.com/services/{service_slug}-in-{location_slug}
 * (Leaves base services table completely untouched)
 */
export async function POST(request) {
  const auth = verifyAiGatewayAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const result = await syncServiceLocationCanonicals();
    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${result.updated} service location canonical URLs`,
      total: result.total,
      updated: result.updated,
    });
  } catch (error) {
    console.error('Error in syncServiceLocationCanonicals:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
