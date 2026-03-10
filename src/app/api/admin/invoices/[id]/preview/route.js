





















// app/api/admin/invoices/[id]/preview/route.js - CUSTOMER + PROVIDER INFO
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const invoices = await query(
      `SELECT * FROM invoices WHERE id = ?`,
      [id]
    )

    if (invoices.length === 0) {
      return new NextResponse(`<html><body><h1>Invoice not found</h1></body></html>`, {
        headers: { 'Content-Type': 'text/html' },
        status: 404
      })
    }

    const invoice = invoices[0]

    const bookings = await query(
      `SELECT 
        b.customer_first_name, 
        b.customer_last_name, 
        b.customer_email, 
        b.customer_phone, 
        b.address_line1,
        b.city,
        b.job_description,
        b.service_price,
        b.additional_price,
        b.provider_id,
        sp.name as provider_name,
        sp.phone as provider_phone,
        sp.email as provider_email,
        sp.rating as provider_rating,
        sp.total_jobs as provider_jobs,
        sp.specialty as provider_specialty
      FROM bookings b
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      WHERE b.id = ?`,
      [invoice.booking_id]
    )

    const booking = bookings[0] || {}
    
    const ratePerHour = booking.service_price || 0
    const ratePerMinute = ratePerHour / 60

    const formatDuration = (minutes) => {
      if (!minutes) return '0 min'
      if (minutes < 60) return `${minutes} min`
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }

    const statusColor = {
      draft: '#94a3b8',
      pending: '#f59e0b',
      paid: '#10b981',
      overdue: '#ef4444',
    }[invoice.status?.toLowerCase()] || '#94a3b8'

    // Full customer name
    const customerFullName = `${booking.customer_first_name || ''} ${booking.customer_last_name || ''}`.trim() || 'Customer'

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoice_number}</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
        <style>
          *, *::before, *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          :root {
            --ink: #0a0a0f;
            --ink-muted: #4a4a5a;
            --ink-faint: #9090a0;
            --teal: #0d9488;
            --teal-dark: #0b7a70;
            --teal-light: #ccfbf1;
            --cream: #fafaf7;
            --border: #e8e8e4;
            --white: #ffffff;
            --gold: #fbbf24;
            --purple: #8b5cf6;
            --purple-light: #ede9fe;
          }

          body {
            font-family: 'DM Sans', sans-serif;
            background: #f0efeb;
            min-height: 100vh;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 40px 20px;
            color: var(--ink);
          }

          .page {
            width: 100%;
            max-width: 900px;
          }

          /* ── TOP BAR ── */
          .topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
            padding: 0 4px;
          }

          .brand {
            font-family: 'Playfair Display', serif;
            font-size: 22px;
            font-weight: 700;
            color: var(--ink);
            letter-spacing: -0.3px;
          }

          .brand span {
            color: var(--teal);
          }

          .inv-meta {
            text-align: right;
            font-size: 12px;
            color: var(--ink-faint);
            line-height: 1.7;
          }

          .inv-meta strong {
            font-size: 13px;
            color: var(--ink-muted);
            display: block;
          }

          /* ── HERO BAND ── */
          .hero {
            background: var(--ink);
            border-radius: 20px 20px 0 0;
            padding: 36px 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            position: relative;
            overflow: hidden;
          }

          .hero::before {
            content: '';
            position: absolute;
            top: -60px;
            right: -60px;
            width: 220px;
            height: 220px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(13,148,136,0.25) 0%, transparent 70%);
          }

          .hero::after {
            content: '';
            position: absolute;
            bottom: -80px;
            left: 30%;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%);
          }

          .hero-left h2 {
            font-family: 'Playfair Display', serif;
            font-size: 42px;
            font-weight: 400;
            color: var(--white);
            letter-spacing: -1px;
            line-height: 1;
            margin-bottom: 6px;
          }

          .hero-left p {
            font-size: 13px;
            color: rgba(255,255,255,0.45);
            letter-spacing: 0.5px;
            text-transform: uppercase;
            font-weight: 500;
          }

          .status-pill {
            padding: 6px 16px;
            border-radius: 100px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            border: 1.5px solid;
            background: transparent;
          }

          .hero-right {
            text-align: right;
            position: relative;
            z-index: 1;
          }

          .total-hero {
            font-family: 'Playfair Display', serif;
            font-size: 54px;
            font-weight: 700;
            color: var(--white);
            line-height: 1;
            letter-spacing: -2px;
          }

          .total-hero sup {
            font-size: 24px;
            font-weight: 400;
            vertical-align: super;
            letter-spacing: 0;
            opacity: 0.7;
          }

          .hero-right p {
            font-size: 12px;
            color: rgba(255,255,255,0.4);
            margin-top: 6px;
            text-align: right;
          }

          /* ── DATE STRIP ── */
          .date-strip {
            background: var(--teal);
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }

          .date-cell {
            padding: 16px 40px;
            border-right: 1px solid rgba(255,255,255,0.15);
          }

          .date-cell:last-child {
            border-right: none;
          }

          .date-cell label {
            display: block;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: rgba(255,255,255,0.6);
            margin-bottom: 3px;
            font-weight: 600;
          }

          .date-cell span {
            font-size: 15px;
            font-weight: 600;
            color: white;
          }

          /* ── CARD BODY ── */
          .card-body {
            background: var(--white);
            border-radius: 0 0 20px 20px;
            padding: 40px;
          }

          /* ── SECTION LABEL ── */
          .section-label {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: var(--teal);
            margin-bottom: 12px;
          }

          /* ── TWO COLUMN INFO ── */
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 32px;
            padding-bottom: 32px;
            border-bottom: 1px solid var(--border);
          }

          .info-card {
            background: var(--cream);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 20px;
          }

          .info-card.customer {
            border-left: 4px solid var(--teal);
          }

          .info-card.provider {
            border-left: 4px solid var(--purple);
          }

          .info-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
          }

          .info-icon {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          }

          .customer .info-icon {
            background: var(--teal-light);
            color: var(--teal-dark);
          }

          .provider .info-icon {
            background: var(--purple-light);
            color: var(--purple);
          }

          .info-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--ink);
          }

          .info-subtitle {
            font-size: 12px;
            color: var(--ink-faint);
          }

          .info-details {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .info-row {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
          }

          .info-label {
            min-width: 70px;
            color: var(--ink-faint);
            font-size: 12px;
          }

          .info-value {
            color: var(--ink);
            font-weight: 500;
          }

          .rating-stars {
            display: flex;
            align-items: center;
            gap: 2px;
            color: var(--gold);
          }

          .badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            border-radius: 100px;
            font-size: 11px;
            font-weight: 600;
          }

          .badge.pro {
            background: var(--teal-light);
            color: var(--teal-dark);
          }

          .badge.jobs {
            background: #e2e8f0;
            color: #475569;
          }

          /* ── RATE + TIME ROW ── */
          .metrics-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 16px;
            margin-bottom: 32px;
          }

          .metric-box {
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 20px 22px;
            background: var(--cream);
          }

          .metric-box.highlight {
            background: var(--ink);
            border-color: var(--ink);
          }

          .metric-box label {
            display: block;
            font-size: 10px;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: var(--ink-faint);
            margin-bottom: 8px;
            font-weight: 600;
          }

          .metric-box.highlight label {
            color: rgba(255,255,255,0.45);
          }

          .metric-val {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            font-weight: 700;
            color: var(--ink);
            line-height: 1;
          }

          .metric-val sub {
            font-family: 'DM Sans', sans-serif;
            font-size: 13px;
            font-weight: 400;
            color: var(--ink-faint);
            vertical-align: baseline;
          }

          .metric-box.highlight .metric-val {
            color: var(--white);
          }

          .metric-box.highlight .metric-val sub {
            color: rgba(255,255,255,0.4);
          }

          .metric-note {
            font-size: 12px;
            color: var(--ink-faint);
            margin-top: 6px;
          }

          .metric-box.highlight .metric-note {
            color: rgba(255,255,255,0.35);
          }

          /* ── DESCRIPTION ── */
          .description-block {
            background: #fffef7;
            border: 1px solid #f0e6b0;
            border-left: 3px solid #d4a017;
            border-radius: 10px;
            padding: 18px 20px;
            margin-bottom: 32px;
          }

          .description-block .section-label {
            color: #a07010;
          }

          .description-text {
            font-size: 14px;
            line-height: 1.7;
            color: #5a4a10;
          }

          /* ── CALCULATION NOTE ── */
          .calc-note {
            font-size: 12.5px;
            color: var(--ink-faint);
            padding: 12px 16px;
            background: var(--cream);
            border-radius: 8px;
            border: 1px dashed var(--border);
            margin-bottom: 28px;
          }

          .calc-note strong {
            color: var(--teal);
          }

          /* ── LINE ITEMS ── */
          .line-items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 28px;
          }

          .line-items thead tr {
            border-bottom: 2px solid var(--ink);
          }

          .line-items th {
            font-size: 10px;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            color: var(--ink-muted);
            font-weight: 700;
            padding: 0 0 10px;
            text-align: left;
          }

          .line-items th:last-child {
            text-align: right;
          }

          .line-items tbody tr {
            border-bottom: 1px solid var(--border);
          }

          .line-items td {
            padding: 16px 0;
            vertical-align: top;
          }

          .line-items td:last-child {
            text-align: right;
            font-weight: 600;
            color: var(--teal);
            font-size: 16px;
          }

          .item-name {
            font-size: 15px;
            font-weight: 600;
            color: var(--ink);
            margin-bottom: 3px;
          }

          .item-sub {
            font-size: 12px;
            color: var(--ink-faint);
          }

          /* ── TOTAL FOOTER ── */
          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 22px 28px;
            background: var(--cream);
            border: 1px solid var(--border);
            border-radius: 14px;
            margin-bottom: 28px;
          }

          .total-row .label {
            font-size: 13px;
            color: var(--ink-muted);
            font-weight: 500;
          }

          .total-row .amount {
            font-family: 'Playfair Display', serif;
            font-size: 38px;
            font-weight: 700;
            color: var(--ink);
            letter-spacing: -1px;
          }

          /* ── SUMMARY CHIPS ROW ── */
          .summary-strip {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            padding: 20px 24px;
            background: var(--teal-light);
            border: 1px solid rgba(13,148,136,0.2);
            border-radius: 14px;
            margin-bottom: 36px;
          }

          .sum-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: #065f46;
          }

          .sum-item .check {
            width: 20px;
            height: 20px;
            background: var(--teal);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            flex-shrink: 0;
          }

          .sum-item strong {
            color: var(--teal-dark);
          }

          .sum-divider {
            width: 1px;
            background: rgba(13,148,136,0.2);
            align-self: stretch;
          }

          /* ── FOOTER ── */
          .footer {
            border-top: 1px solid var(--border);
            padding-top: 22px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .footer-left {
            font-size: 12px;
            color: var(--ink-faint);
            line-height: 1.8;
          }

          .footer-right {
            text-align: right;
          }

          .footer-brand {
            font-family: 'Playfair Display', serif;
            font-size: 18px;
            font-weight: 700;
            color: var(--ink);
          }

          .footer-brand span {
            color: var(--teal);
          }

          .footer-tagline {
            font-size: 11px;
            color: var(--ink-faint);
          }

          @media print {
            body { background: white; padding: 0; }
            .page { max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="page">

          <!-- Top bar -->
          <div class="topbar">
            <div class="brand">Work<span>On</span>Tap</div>
            <div class="inv-meta">
              <strong>${invoice.invoice_number}</strong>
              Generated ${new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}
            </div>
          </div>

          <!-- Hero band -->
          <div class="hero">
            <div class="hero-left" style="position:relative;z-index:1;">
              <h2>Invoice</h2>
              <p>Professional Home Services</p>
              <div style="margin-top:18px;">
                <span class="status-pill" style="color:${statusColor}; border-color:${statusColor};">
                  ${invoice.status?.toUpperCase()}
                </span>
              </div>
            </div>
            <div class="hero-right">
              <div class="total-hero"><sup>$</sup>${Number(invoice.total_amount).toFixed(2)}</div>
              <p>Total amount due</p>
            </div>
          </div>

          <!-- Date strip -->
          <div class="date-strip">
            <div class="date-cell">
              <label>Invoice Date</label>
              <span>${new Date(invoice.created_at).toLocaleDateString('en-GB')}</span>
            </div>
            <div class="date-cell">
              <label>Job Date</label>
              <span>${new Date(invoice.job_date).toLocaleDateString('en-GB')}</span>
            </div>
            <div class="date-cell">
              <label>Invoice No.</label>
              <span>${invoice.invoice_number}</span>
            </div>
          </div>

          <!-- Card body -->
          <div class="card-body">

            <!-- TWO COLUMN INFO - CUSTOMER + PROVIDER -->
            <div class="info-grid">
              <!-- Customer Info -->
              <div class="info-card customer">
                <div class="info-header">
                  <div class="info-icon">👤</div>
                  <div>
                    <div class="info-title">Customer Details</div>
                    <div class="info-subtitle">Bill to</div>
                  </div>
                </div>
                <div class="info-details">
                  <div class="info-row">
                    <span class="info-label">Name</span>
                    <span class="info-value">${customerFullName}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Email</span>
                    <span class="info-value">${booking.customer_email || '—'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Phone</span>
                    <span class="info-value">${booking.customer_phone || '—'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Address</span>
                    <span class="info-value">${booking.address_line1 || ''} ${booking.city || ''}</span>
                  </div>
                </div>
              </div>

              <!-- Provider Info -->
              <div class="info-card provider">
                <div class="info-header">
                  <div class="info-icon">🔧</div>
                  <div>
                    <div class="info-title">Service Provider</div>
                    <div class="info-subtitle">Work done by</div>
                  </div>
                </div>
                <div class="info-details">
                  <div class="info-row">
                    <span class="info-label">Name</span>
                    <span class="info-value">${booking.provider_name || 'Not assigned'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Email</span>
                    <span class="info-value">${booking.provider_email || '—'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Phone</span>
                    <span class="info-value">${booking.provider_phone || '—'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Specialty</span>
                    <span class="info-value">${booking.provider_specialty || 'General'}</span>
                  </div>
                  <div class="info-row" style="margin-top: 8px;">
                    ${booking.provider_rating ? `
                    <span class="badge pro">⭐ ${booking.provider_rating} rating</span>
                    ` : ''}
                    ${booking.provider_jobs ? `
                    <span class="badge jobs">${booking.provider_jobs} jobs</span>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>

            <!-- Metrics -->
            <div class="section-label">Service Overview</div>
            <div class="metrics-row">
              <div class="metric-box">
                <label>Hourly Rate</label>
                <div class="metric-val">$${Number(booking.service_price).toFixed(2)}<sub>/hr</sub></div>
                <div class="metric-note">Per minute: $${ratePerMinute.toFixed(4)}</div>
              </div>
              <div class="metric-box">
                <label>Standard Duration</label>
                <div class="metric-val">${formatDuration(invoice.service_duration)}</div>
                <div class="metric-note">Booked slot</div>
              </div>
              <div class="metric-box highlight">
                <label>Actual Time Worked</label>
                <div class="metric-val">${formatDuration(invoice.actual_duration)}<sub> billed</sub></div>
                <div class="metric-note">You pay only for this</div>
              </div>
            </div>

            <!-- Job description -->
            ${booking.job_description ? `
            <div class="description-block">
              <div class="section-label">Work Description</div>
              <div class="description-text">${booking.job_description}</div>
            </div>
            ` : ''}

            <!-- Calculation note -->
            <div class="calc-note">
              <strong>Calculation:</strong>&nbsp; $${Number(booking.service_price).toFixed(2)}/hr ÷ 60 = $${ratePerMinute.toFixed(4)}/min &times; ${invoice.actual_duration} min = <strong>$${Number(invoice.base_amount).toFixed(2)}</strong>
            </div>

            <!-- Line items -->
            <table class="line-items">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align:right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="item-name">${invoice.service_name}</div>
                    <div class="item-sub">${formatDuration(invoice.actual_duration)} worked &mdash; $${Number(booking.service_price).toFixed(2)}/hour</div>
                  </td>
                  <td>$${Number(invoice.base_amount).toFixed(2)}</td>
                </tr>
                ${invoice.overtime_amount > 0 ? `
                <tr>
                  <td>
                    <div class="item-name">Overtime</div>
                    <div class="item-sub">${invoice.overtime_minutes} min &mdash; $${Number(invoice.overtime_rate).toFixed(2)}/hour</div>
                  </td>
                  <td>+$${Number(invoice.overtime_amount).toFixed(2)}</td>
                </tr>
                ` : ''}
              </tbody>
            </table>

            <!-- Total -->
            <div class="total-row">
              <span class="label">Total Amount Due</span>
              <span class="amount">$${Number(invoice.total_amount).toFixed(2)}</span>
            </div>

            <!-- Summary -->
            <div class="summary-strip">
              <div class="sum-item">
                <div class="check">✓</div>
                <span><strong>${formatDuration(invoice.actual_duration)}</strong> of work</span>
              </div>
              <div class="sum-divider"></div>
              <div class="sum-item">
                <div class="check">✓</div>
                <span>Rate: <strong>$${Number(booking.service_price).toFixed(2)}/hr</strong></span>
              </div>
              <div class="sum-divider"></div>
              <div class="sum-item">
                <div class="check">✓</div>
                <span>Total: <strong>$${Number(invoice.total_amount).toFixed(2)}</strong></span>
              </div>
            </div>

            <!-- Footer with Provider Acknowledgment -->
            <div class="footer">
              <div class="footer-left">
                support@workontap.com &nbsp;&bull;&nbsp; 1-800-WORKONTAP<br>
                Invoice #${invoice.invoice_number} &bull; Service by: <strong>${booking.provider_name || 'WorkOnTap Pro'}</strong>
              </div>
              <div class="footer-right">
                <div class="footer-brand">Work<span>On</span>Tap</div>
                <div class="footer-tagline">Professional Home Services</div>
              </div>
            </div>

          </div>
        </div>
      </body>
      </html>
    `

    return new NextResponse(html, {
      headers: { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      },
    })

  } catch (error) {
    console.error('Error:', error)
    return new NextResponse(`<html><body><h1>Error</h1><p>${error.message}</p></body></html>`, {
      headers: { 'Content-Type': 'text/html' },
      status: 500
    })
  }
}