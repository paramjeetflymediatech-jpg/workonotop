import { NextResponse } from 'next/server';
import { verifyAiGatewayAuth } from '@/lib/ai-gateway-auth';
import { getServicesList, getServiceDetails, createOrUpdateService, getCategories } from '@/lib/services/catalogService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai-gateway/v1/services
 * List services, get specific service by slug/id, or list categories.
 */
export async function GET(request) {
  const auth = verifyAiGatewayAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('category_id');
    const activeOnly = searchParams.get('active_only') === 'true';
    const listCategories = searchParams.get('categories') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (listCategories) {
      const categories = await getCategories();
      return NextResponse.json({ success: true, count: categories.length, data: categories });
    }

    if (slug || id) {
      const service = await getServiceDetails(slug || id);
      if (!service) {
        return NextResponse.json({ success: false, message: 'Service not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: service });
    }

    const services = await getServicesList({ search, categoryId, activeOnly, limit, offset });
    return NextResponse.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error('Error in GET /api/ai-gateway/v1/services:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * POST /api/ai-gateway/v1/services
 * Create or Update a Service Listing.
 */
export async function POST(request) {
  const auth = verifyAiGatewayAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ success: false, message: 'Missing required field: name' }, { status: 400 });
    }

    const result = await createOrUpdateService(body);
    const updated = await getServiceDetails(result.slug || result.id);

    return NextResponse.json({
      success: true,
      message: `Service successfully ${result.action}`,
      data: updated,
    });
  } catch (error) {
    console.error('Error in POST /api/ai-gateway/v1/services:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
