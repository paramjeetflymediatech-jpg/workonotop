import { Expo } from 'expo-server-sdk';

let expo = new Expo();

/**
 * 🚀 Push Notification Utility for Expo
 */

/**
 * Sends a push notification via Expo Push API
 * @param {string|string[]} tokens - Single token or array of tokens
 * @param {string} title - Title of the notification
 * @param {string} body - Body message
 * @param {Object} data - Optional data payload
 */
export async function sendPushNotification(tokens, title, body, data = {}) {
  const pushTokens = Array.isArray(tokens) ? tokens : [tokens];
  const messages = [];

  for (let pushToken of pushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`[Push] Token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
    });
  }

  if (messages.length === 0) {
    console.log('[Push] No valid Expo push tokens provided.');
    return { success: false, message: 'No valid tokens' };
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  try {
    for (let chunk of chunks) {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log('[Push] Sent chunk, ticket count:', ticketChunk.length);
      tickets.push(...ticketChunk);
    }
    return { success: true, tickets };
  } catch (error) {
    console.error('[Push] Fatal error sending notifications:', error);
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
    const idCol = role === 'provider' ? 'provider_id' : (role === 'admin' ? 'id' : 'user_id');
    
    // For admin, we might need a different table or check if mobile_auth_users handles admins
    // Typically admins are also stored in users table or have a specific role
    const tableName = role === 'admin' ? 'users' : 'mobile_auth_users';
    
    let tokens = [];
    if (role === 'admin') {
        // Find admin tokens in mobile_auth_users but matching by user_id
        // (Assuming admins also register tokens via the mobile app)
        const res = await db(
            `SELECT push_token FROM mobile_auth_users WHERE user_id = ? AND push_token IS NOT NULL`,
            [userId]
        );
        tokens = res;
    } else {
        const res = await db(
            `SELECT push_token FROM mobile_auth_users WHERE ${idCol} = ? AND push_token IS NOT NULL`,
            [userId]
        );
        tokens = res;
    }

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
