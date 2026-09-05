import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export async function POST(request) {
  try {
    const { booking_id } = await request.json()

    if (!booking_id) {
      return NextResponse.json({
        success: false,
        message: 'booking_id required'
      }, { status: 400 })
    }

    // Get booking details
    const bookings = await execute(
      `SELECT b.*, s.name as service_name, s.duration_minutes as service_duration
       FROM bookings b
       LEFT JOIN services s ON b.service_id = s.id
       WHERE b.id = ?`,
      [booking_id]
    )

    const booking = bookings[0]

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'completed' && booking.status !== 'pending' && booking.status !== 'confirmed') {
      return NextResponse.json({
        success: false,
        message: 'Can only generate invoices for completed, pending, or confirmed jobs'
      }, { status: 400 })
    }

    // FIXED CALCULATION LOGIC
    const standardDuration = parseInt(booking.service_duration || 60)
    const baseRate = parseFloat(booking.service_price || 0) // This is the fixed base price
    const overtimeRatePerHour = parseFloat(booking.additional_price || 0) // Overtime rate per hour
    const actualDuration = parseInt(booking.submitted_duration_minutes || booking.actual_duration_minutes || 0)

    // Base amount is ALWAYS the full service price (no prorating for working less)
    let baseAmount = baseRate
    let overtimeMinutes = 0
    let overtimeAmount = 0

    // Only calculate overtime if actual duration exceeds standard duration
    if (actualDuration > standardDuration) {
      overtimeMinutes = actualDuration - standardDuration
      
      // Calculate overtime amount (overtime rate is per hour)
      // Convert to per minute: overtimeRatePerHour / 60
      const overtimeRatePerMinute = overtimeRatePerHour / 60
      overtimeAmount = Math.round((overtimeRatePerMinute * overtimeMinutes) * 100) / 100
    }
    const wCount = parseInt(booking.submitted_headcount || booking.worker_count || 1)
    const totalAmount = (baseAmount + overtimeAmount) * wCount
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(booking_id).padStart(5, '0')}`

    // Check if already exists
    const existing = await execute('SELECT id FROM invoices WHERE booking_id = ?', [booking_id])

    if (existing.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Invoice already exists for this booking'
      }, { status: 400 })
    }

    // Calculate commission and provider earnings
    const commissionPercent = parseFloat(booking.commission_percent || 0)
    const commissionAmount = Math.round((totalAmount * commissionPercent / 100) * 100) / 100
    const providerEarnings = Math.round((totalAmount - commissionAmount) * 100) / 100
    
    // Detailed tracking requested by user
    const finalProviderAmount = providerEarnings
    const totalOvertimeCharged = overtimeAmount * wCount
    const overtimeEarnings = Math.round((totalOvertimeCharged - (totalOvertimeCharged * commissionPercent / 100)) * 100) / 100
    
    // Timer details
    const jobTimerStatus = booking.timer_status || booking.status || 'completed'
    const startTime = booking.start_time ? new Date(booking.start_time) : null
    const endTime = booking.end_time ? new Date(booking.end_time) : new Date()

    // Generate Customer Invoice
    const customerInvoiceNumber = `INV-${new Date().getFullYear()}-${String(booking_id).padStart(5, '0')}-C`
    const resultCustomer = await execute(
      `INSERT INTO invoices (
        invoice_number, booking_id, user_id, provider_id, invoice_type,
        base_amount, overtime_minutes, overtime_rate, overtime_amount,
        total_amount, commission_percent, commission_amount, provider_earnings,
        final_provider_amount, overtime_earnings, job_timer_status, start_time, end_time,
        service_name, service_duration, actual_duration,
        job_date, completion_date, status
      ) VALUES (?, ?, ?, ?, 'customer', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        customerInvoiceNumber,
        booking.id,
        booking.user_id,
        booking.provider_id,
        baseAmount,
        overtimeMinutes,
        overtimeRatePerHour,
        overtimeAmount,
        totalAmount,
        commissionPercent,
        commissionAmount,
        providerEarnings,
        finalProviderAmount,
        overtimeEarnings,
        jobTimerStatus,
        startTime,
        endTime,
        booking.service_name,
        standardDuration,
        actualDuration,
        booking.job_date,
        booking.end_time || new Date()
      ]
    )

    // Generate Provider Invoice
    const providerInvoiceNumber = `INV-${new Date().getFullYear()}-${String(booking_id).padStart(5, '0')}-P`
    const resultProvider = await execute(
      `INSERT INTO invoices (
        invoice_number, booking_id, user_id, provider_id, invoice_type,
        base_amount, overtime_minutes, overtime_rate, overtime_amount,
        total_amount, commission_percent, commission_amount, provider_earnings,
        final_provider_amount, overtime_earnings, job_timer_status, start_time, end_time,
        service_name, service_duration, actual_duration,
        job_date, completion_date, status
      ) VALUES (?, ?, ?, ?, 'provider', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        providerInvoiceNumber,
        booking.id,
        booking.user_id,
        booking.provider_id,
        baseAmount,
        overtimeMinutes,
        overtimeRatePerHour,
        overtimeAmount,
        totalAmount,
        commissionPercent,
        commissionAmount,
        providerEarnings,
        finalProviderAmount,
        overtimeEarnings,
        jobTimerStatus,
        startTime,
        endTime,
        booking.service_name,
        standardDuration,
        actualDuration,
        booking.job_date,
        booking.end_time || new Date()
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Invoices generated successfully',
      invoice: {
        customer_invoice_id: resultCustomer.insertId,
        provider_invoice_id: resultProvider.insertId,
        customer_invoice_number: customerInvoiceNumber,
        provider_invoice_number: providerInvoiceNumber,
        breakdown: {
          service_name: booking.service_name,
          standard_duration: standardDuration,
          actual_duration: actualDuration,
          base_rate: baseRate,
          base_amount: baseAmount,
          overtime_minutes: overtimeMinutes,
          overtime_rate_per_hour: overtimeRatePerHour,
          overtime_amount: overtimeAmount,
          total: totalAmount
        }
      }
    })

  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to generate invoice: ' + error.message
    }, { status: 500 })
  }
}