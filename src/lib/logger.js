import { execute } from '@/lib/db'

/**
 * Logs an activity to the activity_logs table.
 * 
 * @param {Object} params
 * @param {number|null} params.actor_id - The ID of the actor (user_id, provider_id, etc.)
 * @param {'customer'|'provider'|'admin'|'system'} params.actor_type - The type of actor
 * @param {string|null} params.actor_name - Name of the actor for easy display
 * @param {string} params.action - Action identifier (e.g. 'BOOKING_CREATED', 'PROVIDER_ASSIGNED')
 * @param {string|null} params.entity_type - Type of entity acted upon (e.g. 'booking')
 * @param {number|null} params.entity_id - ID of the entity acted upon
 * @param {Object|null} params.details - Additional metadata as a JSON object
 * @param {string|null} params.ip_address - Optional IP address
 */
export async function logActivity({
  actor_id = null,
  actor_type = 'system',
  actor_name = null,
  action,
  entity_type = null,
  entity_id = null,
  details = null,
  ip_address = null
}) {
  try {
    const detailsJson = details ? JSON.stringify(details) : null
    
    await execute(
      `INSERT INTO activity_logs 
       (actor_id, actor_type, actor_name, action, entity_type, entity_id, details, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        actor_id,
        actor_type,
        actor_name,
        action,
        entity_type,
        entity_id,
        detailsJson,
        ip_address
      ]
    )
  } catch (error) {
    console.error('[Activity Logger] Failed to log activity:', error)
  }
}
