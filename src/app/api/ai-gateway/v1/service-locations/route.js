import { NextResponse } from 'next/server';
import { verifyAiGatewayAuth } from '@/lib/ai-gateway-auth';
import {
  getServiceLocationsList,
  getServiceLocationDetails,
  upsertServiceLocation,
  deleteServiceLocation,
} from '@/lib/services/serviceLocationService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai-gateway/v1/service-locations
 * List service locations or fetch specific location content.
 */
export async function GET(request) {
  const auth = verifyAiGatewayAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    const serviceSlug = searchParams.get('service_slug') || searchParams.get('serviceSlug');
    const locationSlug = searchParams.get('location_slug') || searchParams.get('locationSlug');
    const search = searchParams.get('search') || '';
    const onlyMissing = searchParams.get('only_missing') === 'true' || searchParams.get('onlyMissing') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (slug || id) {
      const item = await getServiceLocationDetails(slug || id);
      if (!item) {
        return NextResponse.json({ success: false, message: 'Service location not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: item });
    }

    const { rows, total } = await getServiceLocationsList({
      serviceSlug,
      locationSlug,
      search,
      onlyMissing,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      total,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('Error in GET /api/ai-gateway/v1/service-locations:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * POST /api/ai-gateway/v1/service-locations
 * Create or Update a Service Location page (including unique description, custom headings, and SEO).
 */
export async function POST(request) {
  const auth = verifyAiGatewayAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();

    if (!body.slug && !body.id && !body.service_id && !body.service_slug) {
      return NextResponse.json(
        {
          success: false,
          message: 'Must provide either slug (e.g. furniture-assembly-burnaby or furniture-assembly-in-burnaby), id, or service_slug + location_slug',
        },
        { status: 400 }
      );
    }

    const result = await upsertServiceLocation(body);
    const updated = await getServiceLocationDetails(result.slug || result.id);

    return NextResponse.json({
      success: true,
      message: `Service location successfully ${result.action}`,
      data: updated,
    });
  } catch (error) {
    console.error('Error in POST /api/ai-gateway/v1/service-locations:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/ai-gateway/v1/service-locations
 * Partially update a Service Location record.
 */
export async function PATCH(request) {
  return POST(request);
}

/**
 * DELETE /api/ai-gateway/v1/service-locations
 * Delete a Service Location record.
 */
export async function DELETE(request) {
  const auth = verifyAiGatewayAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (!slug && !id) {
      return NextResponse.json({ success: false, message: 'slug or id parameter is required' }, { status: 400 });
    }

    await deleteServiceLocation(id || slug);
    return NextResponse.json({ success: true, message: 'Service location deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/ai-gateway/v1/service-locations:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
