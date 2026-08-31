import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { logActivity } from '@/lib/logger';

export async function POST(request) {
  // Extract token to log who is logging out
  const token = request.cookies.get('customer_token')?.value;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      logActivity({
        actor_id: decoded.id,
        actor_type: 'customer',
        actor_name: `Customer #${decoded.id}`, // or extract name if in token
        action: 'CUSTOMER_LOGGED_OUT',
        entity_type: 'auth',
        entity_id: decoded.id
      });
    }
  }

  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });

  // Delete the customer token cookie
  response.cookies.delete('customer_token');
  
  return response;
}