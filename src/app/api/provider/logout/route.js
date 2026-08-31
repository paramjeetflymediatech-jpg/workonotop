// app/api/provider/logout/route.js
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { logActivity } from '@/lib/logger';

export async function POST(request) {
  const token = request.cookies.get('provider_token')?.value;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      logActivity({
        actor_id: decoded.providerId || decoded.id,
        actor_type: 'provider',
        actor_name: `Provider #${decoded.providerId || decoded.id}`,
        action: 'PROVIDER_LOGGED_OUT',
        entity_type: 'auth',
        entity_id: decoded.providerId || decoded.id
      });
    }
  }

  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });

  response.cookies.delete('provider_token');
  return response;
}