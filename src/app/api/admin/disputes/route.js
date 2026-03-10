// // app/api/admin/disputes/route.js
// import { NextResponse } from 'next/server'
// import { getConnection } from '@/lib/db'

// // ── GET: All disputes ─────────────────────────────────────────────────────────
// export async function GET() {
//   let connection
//   try {
//     connection = await getConnection()

//     // 1. All disputes with booking + customer + provider details
//     const [disputes] = await connection.execute(`
//       SELECT 
//         d.id,
//         d.booking_id,
//         d.reason,
//         d.status,
//         d.admin_notes,
//         DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
//         DATE_FORMAT(d.resolved_at, '%Y-%m-%d %H:%i:%s') as resolved_at,
//         b.booking_number,
//         b.service_name,
//         b.service_price,
//         b.payment_status,
//         b.payment_intent_id,
//         b.authorized_amount,
//         CONCAT(u.first_name, ' ', u.last_name) as customer_name,
//         u.email as customer_email,
//         sp.name as provider_name,
//         sp.email as provider_email
//       FROM disputes d
//       LEFT JOIN bookings b    ON d.booking_id = b.id
//       LEFT JOIN users u       ON d.raised_by_user_id = u.id
//       LEFT JOIN service_providers sp ON b.provider_id = sp.id
//       ORDER BY 
//         CASE d.status WHEN 'open' THEN 0 WHEN 'reviewing' THEN 1 ELSE 2 END,
//         d.created_at DESC
//     `)

//     // 2. Summary stats
//     const [summary] = await connection.execute(`
//       SELECT
//         COUNT(*) as total,
//         SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
//         SUM(CASE WHEN status = 'reviewing' THEN 1 ELSE 0 END) as reviewing_count,
//         SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
//         SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_count
//       FROM disputes
//     `)

//     connection.release()

//     return NextResponse.json({
//       success: true,
//       data: {
//         summary: summary[0],
//         disputes
//       }
//     })

//   } catch (error) {
//     console.error('Admin disputes GET error:', error)
//     if (connection) connection.release()
//     return NextResponse.json({ success: false, message: 'Failed to load disputes' }, { status: 500 })
//   }
// }

// // ── PATCH: Update dispute status / admin notes ────────────────────────────────
// export async function PATCH(request) {
//   let connection
//   try {
//     const { dispute_id, status, admin_notes, booking_action } = await request.json()
//     // booking_action: 'release' = approve payment to provider, 'refund' = refund customer

//     if (!dispute_id || !status) {
//       return NextResponse.json({ success: false, message: 'dispute_id and status required' }, { status: 400 })
//     }

//     connection = await getConnection()
//     await connection.query('START TRANSACTION')

//     // Get dispute + booking info
//     const [[dispute]] = await connection.execute(`
//       SELECT d.*, b.payment_intent_id, b.service_price, b.additional_price,
//              b.actual_duration_minutes, b.standard_duration_minutes,
//              b.provider_id, b.commission_percent, b.provider_amount,
//              b.booking_number, b.service_name,
//              sp.stripe_account_id, sp.stripe_onboarding_complete, sp.name as provider_name,
//              CONCAT(u.first_name, ' ', u.last_name) as customer_name,
//              u.email as customer_email, sp.email as provider_email
//       FROM disputes d
//       LEFT JOIN bookings b ON d.booking_id = b.id
//       LEFT JOIN service_providers sp ON b.provider_id = sp.id
//       LEFT JOIN users u ON d.raised_by_user_id = u.id
//       WHERE d.id = ?
//     `, [dispute_id])

//     if (!dispute) {
//       await connection.query('ROLLBACK')
//       return NextResponse.json({ success: false, message: 'Dispute not found' }, { status: 404 })
//     }

//     // Update dispute
//     await connection.execute(
//       `UPDATE disputes SET 
//         status = ?,
//         admin_notes = COALESCE(?, admin_notes),
//         resolved_at = CASE WHEN ? IN ('resolved', 'closed') THEN NOW() ELSE resolved_at END,
//         updated_at = NOW()
//        WHERE id = ?`,
//       [status, admin_notes || null, status, dispute_id]
//     )

//     // Update booking status history
//     await connection.execute(
//       `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'disputed', ?)`,
//       [dispute.booking_id, `Admin updated dispute: ${status}. ${admin_notes || ''}`]
//     )

//     await connection.query('COMMIT')
//     connection.release()

//     return NextResponse.json({
//       success: true,
//       message: `Dispute updated to: ${status}`
//     })

//   } catch (error) {
//     console.error('Admin disputes PATCH error:', error)
//     if (connection) {
//       await connection.query('ROLLBACK').catch(() => {})
//       connection.release()
//     }
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 })
//   }
// }

















// app/api/admin/disputes/route.js
import { NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'
import { sendEmail } from '@/lib/email'

// ── GET: All disputes ─────────────────────────────────────────────────────────
export async function GET() {
  let connection
  try {
    connection = await getConnection()

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
    return NextResponse.json({ success: true, data: { summary: summary[0], disputes } })

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
    const { dispute_id, status, admin_notes } = await request.json()

    if (!dispute_id || !status) {
      return NextResponse.json({ success: false, message: 'dispute_id and status required' }, { status: 400 })
    }

    connection = await getConnection()
    await connection.query('START TRANSACTION')

    // Get full dispute + booking info
    const [[dispute]] = await connection.execute(`
      SELECT 
        d.*,
        b.booking_number, b.service_name, b.service_price, b.authorized_amount,
        b.payment_intent_id, b.provider_id,
        CONCAT(u.first_name, ' ', u.last_name) as customer_name,
        u.email as customer_email,
        sp.name as provider_name,
        sp.email as provider_email
      FROM disputes d
      LEFT JOIN bookings b ON d.booking_id = b.id
      LEFT JOIN users u ON d.raised_by_user_id = u.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
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

    // Status history log
    await connection.execute(
      `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'disputed', ?)`,
      [dispute.booking_id, `Admin updated dispute to: ${status}. ${admin_notes || ''}`]
    )

    await connection.query('COMMIT')
    connection.release()

    // ── Send emails only on resolve or close ─────────────────────────────────
    const shouldEmail = status === 'resolved' || status === 'closed'
    if (shouldEmail) {
      const note = admin_notes?.trim() || 'Our team has reviewed the dispute and reached a decision.'
      const isResolved = status === 'resolved'

      if (dispute.customer_email) {
        sendEmail({
          to: dispute.customer_email,
          subject: isResolved
            ? `Your dispute has been resolved — Booking #${dispute.booking_number}`
            : `Dispute closed — Booking #${dispute.booking_number}`,
          html: buildDisputeEmail({
            name: dispute.customer_name,
            role: 'customer',
            isResolved,
            bookingNumber: dispute.booking_number,
            serviceName: dispute.service_name,
            amount: dispute.authorized_amount || dispute.service_price,
            adminNote: note,
          }),
        }).catch(e => console.error('Customer dispute email error:', e))
      }

      if (dispute.provider_email) {
        sendEmail({
          to: dispute.provider_email,
          subject: isResolved
            ? `Dispute resolved on Booking #${dispute.booking_number}`
            : `Dispute closed — Booking #${dispute.booking_number}`,
          html: buildDisputeEmail({
            name: dispute.provider_name,
            role: 'provider',
            isResolved,
            bookingNumber: dispute.booking_number,
            serviceName: dispute.service_name,
            amount: dispute.authorized_amount || dispute.service_price,
            adminNote: note,
          }),
        }).catch(e => console.error('Provider dispute email error:', e))
      }
    }

    return NextResponse.json({
      success: true,
      message: `Dispute updated to: ${status}`,
      emailsSent: shouldEmail,
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

// ── Email builder — matches your existing emailLayout style ──────────────────
function buildDisputeEmail({ name, role, isResolved, bookingNumber, serviceName, amount, adminNote }) {
  const headerBg = isResolved
    ? 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)'
    : 'linear-gradient(135deg, #475569 0%, #334155 100%)'
  const headerIcon = isResolved ? '✅' : '🔒'
  const headerTitle = isResolved ? 'Dispute Resolved' : 'Dispute Closed'
  const accentColor = isResolved ? '#16a34a' : '#475569'
  const noteBg = isResolved ? '#f0fdf4' : '#f8fafc'
  const noteBorder = isResolved ? '#86efac' : '#e2e8f0'
  const fmt = (n) => `$${parseFloat(n || 0).toFixed(2)}`

  const roleMsg = role === 'customer'
    ? isResolved
      ? 'Your dispute has been reviewed and resolved by our team. Here\'s a summary of the decision.'
      : 'Your dispute has been closed. If you have further concerns, please contact our support team.'
    : isResolved
      ? 'A dispute on one of your bookings has been resolved by our admin team.'
      : 'A dispute on one of your bookings has been closed. No further action is needed from your side.'

  const body = `
    <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#0f172a;">Hi ${name} 👋</p>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">${roleMsg}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Booking Details</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#64748b;width:45%;">Booking #</td>
            <td style="padding:5px 0;font-size:13px;font-weight:600;color:#0f172a;">${bookingNumber}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#64748b;">Service</td>
            <td style="padding:5px 0;font-size:13px;font-weight:600;color:#0f172a;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#64748b;">Amount</td>
            <td style="padding:5px 0;font-size:13px;font-weight:600;color:#0f172a;">${fmt(amount)}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#64748b;">Status</td>
            <td style="padding:5px 0;">
              <span style="display:inline-block;padding:2px 12px;background:${accentColor};color:#fff;border-radius:20px;font-size:12px;font-weight:600;">
                ${isResolved ? '✅ Resolved' : '🔒 Closed'}
              </span>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="background:${noteBg};border:1px solid ${noteBorder};border-left:4px solid ${accentColor};border-radius:8px;padding:18px 20px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Admin Decision & Notes</p>
        <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">${adminNote}</p>
      </td></tr>
    </table>

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 20px;" />
    <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
      Questions? Contact us at
      <a href="mailto:support@workontap.com" style="color:#0891b2;text-decoration:none;">support@workontap.com</a>
    </p>
  `

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${headerTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">Dispute ${isResolved ? 'resolved' : 'closed'} — Booking #${bookingNumber}&nbsp;‌</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="padding-bottom:20px;">
          <span style="font-size:22px;font-weight:700;color:#0f766e;letter-spacing:-0.5px;">Work<span style="color:#0891b2;">On</span>Tap</span>
        </td></tr>
        <tr><td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:${headerBg};padding:40px 32px;text-align:center;">
              <div style="font-size:48px;margin-bottom:12px;">${headerIcon}</div>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.3px;">${headerTitle}</h1>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:40px 40px 32px;">${body}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 0;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;">© ${new Date().getFullYear()} WorkOnTap · Calgary, Alberta, Canada</p>
          <p style="margin:0;font-size:12px;color:#cbd5e1;">This email was sent because you have an account on WorkOnTap.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}







