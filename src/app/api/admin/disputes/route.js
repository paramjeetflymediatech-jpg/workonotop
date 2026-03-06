// app/api/admin/disputes/route.js
import { NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'

// ── GET: All disputes ─────────────────────────────────────────────────────────
export async function GET() {
  let connection
  try {
    connection = await getConnection()

    // 1. All disputes with booking + customer + provider details
    const [disputes] = await connection.execute(`
      SELECT 
        d.id,
        d.booking_id,
        d.reason,
        d.status,
        d.admin_notes,
        DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
        DATE_FORMAT(d.resolved_at, '%Y-%m-%d %H:%i:%s') as resolved_at,
        b.booking_number,
        b.service_name,
        b.service_price,
        b.payment_status,
        b.payment_intent_id,
        b.authorized_amount,
        CONCAT(u.first_name, ' ', u.last_name) as customer_name,
        u.email as customer_email,
        sp.name as provider_name,
        sp.email as provider_email
      FROM disputes d
      LEFT JOIN bookings b    ON d.booking_id = b.id
      LEFT JOIN users u       ON d.raised_by_user_id = u.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      ORDER BY 
        CASE d.status WHEN 'open' THEN 0 WHEN 'reviewing' THEN 1 ELSE 2 END,
        d.created_at DESC
    `)

    // 2. Summary stats
    const [summary] = await connection.execute(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
        SUM(CASE WHEN status = 'reviewing' THEN 1 ELSE 0 END) as reviewing_count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_count
      FROM disputes
    `)

    connection.release()

    return NextResponse.json({
      success: true,
      data: {
        summary: summary[0],
        disputes
      }
    })

  } catch (error) {
    console.error('Admin disputes GET error:', error)
    if (connection) connection.release()
    return NextResponse.json({ success: false, message: 'Failed to load disputes' }, { status: 500 })
  }
}

// ── PATCH: Update dispute status / admin notes ────────────────────────────────
export async function PATCH(request) {
  let connection
  try {
    const { dispute_id, status, admin_notes, booking_action } = await request.json()
    // booking_action: 'release' = approve payment to provider, 'refund' = refund customer

    if (!dispute_id || !status) {
      return NextResponse.json({ success: false, message: 'dispute_id and status required' }, { status: 400 })
    }

    connection = await getConnection()
    await connection.query('START TRANSACTION')

    // Get dispute + booking info
    const [[dispute]] = await connection.execute(`
      SELECT d.*, b.payment_intent_id, b.service_price, b.additional_price,
             b.actual_duration_minutes, b.standard_duration_minutes,
             b.provider_id, b.commission_percent, b.provider_amount,
             b.booking_number, b.service_name,
             sp.stripe_account_id, sp.stripe_onboarding_complete, sp.name as provider_name,
             CONCAT(u.first_name, ' ', u.last_name) as customer_name,
             u.email as customer_email, sp.email as provider_email
      FROM disputes d
      LEFT JOIN bookings b ON d.booking_id = b.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      LEFT JOIN users u ON d.raised_by_user_id = u.id
      WHERE d.id = ?
    `, [dispute_id])

    if (!dispute) {
      await connection.query('ROLLBACK')
      return NextResponse.json({ success: false, message: 'Dispute not found' }, { status: 404 })
    }

    // Update dispute
    await connection.execute(
      `UPDATE disputes SET 
        status = ?,
        admin_notes = COALESCE(?, admin_notes),
        resolved_at = CASE WHEN ? IN ('resolved', 'closed') THEN NOW() ELSE resolved_at END,
        updated_at = NOW()
       WHERE id = ?`,
      [status, admin_notes || null, status, dispute_id]
    )

    // Update booking status history
    await connection.execute(
      `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'disputed', ?)`,
      [dispute.booking_id, `Admin updated dispute: ${status}. ${admin_notes || ''}`]
    )

    await connection.query('COMMIT')
    connection.release()

    return NextResponse.json({
      success: true,
      message: `Dispute updated to: ${status}`
    })

  } catch (error) {
    console.error('Admin disputes PATCH error:', error)
    if (connection) {
      await connection.query('ROLLBACK').catch(() => {})
      connection.release()
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}