import { NextResponse } from 'next/server';

/**
 * Authenticates requests coming from ChatGPT, MCP server, or external AI agents.
 */
export function verifyAiGatewayAuth(request) {
  const expectedSecret = process.env.AI_GATEWAY_SECRET_KEY || process.env.MCP_SECRET_KEY;

  if (!expectedSecret) {
    console.error('AI_GATEWAY_SECRET_KEY is not configured in .env file.');
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: 'Server configuration error: AI_GATEWAY_SECRET_KEY is not set.' },
        { status: 500 }
      ),
    };
  }

  // Check Bearer Token in Authorization header
  const authHeader = request.headers.get('authorization');
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // Also check X-API-KEY header
  if (!token) {
    token = request.headers.get('x-api-key')?.trim();
  }

  if (!token || token !== expectedSecret) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: 'Unauthorized: Invalid or missing API key.' },
        { status: 401 }
      ),
    };
  }

  return { authorized: true };
}
