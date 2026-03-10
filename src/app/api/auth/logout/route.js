import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });

  // Delete the customer token cookie
  response.cookies.delete('customer_token');
  
  return response;
}