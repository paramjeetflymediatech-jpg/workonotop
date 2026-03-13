/**
 * 🚀 Push Notification Utility for Expo
 */

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Sends a push notification via Expo Push API
 * @param {string|string[]} tokens - Single token or array of tokens
 * @param {string} title - Title of the notification
 * @param {string} body - Body message
 * @param {Object} data - Optional data payload
 */
export async function sendPushNotification(tokens, title, body, data = {}) {
  const pushTokens = Array.isArray(tokens) ? tokens : [tokens];
  
  // Filter out invalid/empty tokens
  const validTokens = pushTokens.filter(t => t && t.startsWith('ExponentPushToken'));
  
  if (validTokens.length === 0) {
    console.log('[Push] No valid Expo push tokens provided.');
    return { success: false, message: 'No valid tokens' };
  }

  const messages = validTokens.map(token => ({
    to: token,
    sound: 'default',
    title: title,
    body: body,
    data: data,
    priority: 'high'
  }));

  try {
    console.log(`[Push] Sending ${messages.length} notifications...`);
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log('[Push] Response:', JSON.stringify(result));
    return { success: true, result };
  } catch (error) {
    console.error('[Push] Request error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper to get user push tokens from database and send notification
 * @param {number} userId - ID of the user
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Optional payload
 * @param {Object} db - Database execute helper
 * @param {string} role - 'customer' or 'provider'
 */
export async function notifyUser(userId, title, body, data = {}, db, role = 'customer') {
  try {
    const idCol = role === 'provider' ? 'provider_id' : 'user_id';
    
    // Get all valid push tokens for this user
    const tokens = await db(
      `SELECT push_token FROM mobile_auth_users WHERE ${idCol} = ? AND push_token IS NOT NULL`,
      [userId]
    );

    if (tokens.length === 0) {
      console.log(`[Push] No tokens found for user ${userId} (${role})`);
      return { success: false, message: 'User has no registered tokens' };
    }

    const tokenList = tokens.map(t => t.push_token);
    return await sendPushNotification(tokenList, title, body, data);
  } catch (error) {
    console.error(`[Push] Error notifying user ${userId}:`, error);
    return { success: false, error: error.message };
  }
}
