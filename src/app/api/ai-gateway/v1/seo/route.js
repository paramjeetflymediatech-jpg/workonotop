import { NextResponse } from 'next/server';
import { verifyAiGatewayAuth } from '@/lib/ai-gateway-auth';
import { getSeoSettings, getSeoForPage, upsertSeoSetting, deleteSeoSetting } from '@/lib/services/seoService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai-gateway/v1/seo
 * Fetch all SEO records or a specific page SEO. Supports filtering by missing fields.
 */
export async function GET(request) {
  const auth = verifyAiGatewayAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const pageName = searchParams.get('page_name');
    const search = searchParams.get('search') || '';
    const onlyMissing = searchParams.get('only_missing') === 'true' || searchParams.get('onlyMissing') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (pageName) {
      const seo = await getSeoForPage(pageName);
      if (!seo) {
        return NextResponse.json({ success: false, message: `SEO setting for '${pageName}' not found` }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: seo });
    }

    const { rows, total } = await getSeoSettings({ search, onlyMissing, limit, offset });
    return NextResponse.json({
      success: true,
      total,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('Error in GET /api/ai-gateway/v1/seo:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * POST /api/ai-gateway/v1/seo
 * Create or Update SEO metadata for a page route.
 */
export async function POST(request) {
  const auth = verifyAiGatewayAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    if (!body.page_name) {
      return NextResponse.json({ success: false, message: 'Missing required field: page_name (e.g. /services/general-home-repairs)' }, { status: 400 });
    }

    const result = await upsertSeoSetting(body);
    const updated = await getSeoForPage(body.page_name);

    return NextResponse.json({
      success: true,
      message: `SEO successfully ${result.action} for '${body.page_name}'`,
      data: updated,
    });
  } catch (error) {
    console.error('Error in POST /api/ai-gateway/v1/seo:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/ai-gateway/v1/seo
 * Partially update SEO metadata for a page route.
 */
export async function PATCH(request) {
  return POST(request);
}

/**
 * DELETE /api/ai-gateway/v1/seo
 * Delete SEO metadata for a page.
 */
export async function DELETE(request) {
  const auth = verifyAiGatewayAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const pageName = searchParams.get('page_name');
    const id = searchParams.get('id');

    if (!pageName && !id) {
      return NextResponse.json({ success: false, message: 'page_name or id parameter is required' }, { status: 400 });
    }

    await deleteSeoSetting(pageName || id);
    return NextResponse.json({ success: true, message: 'SEO setting deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/ai-gateway/v1/seo:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
