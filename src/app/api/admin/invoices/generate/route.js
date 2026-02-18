// app/api/admin/invoices/generate/route.js - FIXED CALCULATION
import { NextResponse } from 'next/server'
import { getConnection } from '@/lib/db'

export async function POST(request) {
  let connection
  try {
    const { booking_id } = await request.json()
    
    if (!booking_id) {
      return NextResponse.json({ 
        success: false, 
        message: 'booking_id required' 
      }, { status: 400 })
    }

    connection = await getConnection()

    // Get complete booking details
    const [bookings] = await connection.execute(
      `SELECT 
        b.*,
        s.name as service_name,
        s.duration_minutes as service_duration
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.id = ?`,
      [booking_id]
    )

    const booking = bookings[0]

    if (!booking) {
      return NextResponse.json({ 
        success: false, 
        message: 'Booking not found' 
      }, { status: 404 })
    }

    if (booking.status !== 'completed') {
      return NextResponse.json({ 
        success: false, 
        message: 'Can only generate invoices for completed jobs' 
      }, { status: 400 })
    }

    // IMPORTANT: Get values from booking
    const standardDuration = parseInt(booking.service_duration || 60) // 1 minute
    const baseRateForStandard = parseFloat(booking.service_price || 0) // $40 for that duration
    
    // Calculate rate per minute based on the standard duration
    // If standard is 1 minute for $40, then rate per minute = $40
    // If standard is 60 minutes for $100, then rate per minute = $1.67
    const ratePerMinute = baseRateForStandard / standardDuration
    
    const actualDuration = parseInt(booking.actual_duration_minutes || 0) // 3 minutes
    
    // Calculate pro-rated base amount
    // For first 1 minute (standard duration): full rate applies
    // For extra minutes: overtime rate applies
    let baseAmount = 0
    let overtimeMinutes = 0
    let overtimeAmount = 0
    
    if (actualDuration <= standardDuration) {
      // If worked less than or equal to standard time
      // Customer pays only for actual minutes at the regular rate
      baseAmount = Math.round((ratePerMinute * actualDuration) * 100) / 100
      overtimeMinutes = 0
      overtimeAmount = 0
    } else {
      // If worked more than standard time
      // First X minutes (standard duration) at regular rate
      baseAmount = baseRateForStandard
      
      // Remaining minutes at overtime rate
      overtimeMinutes = actualDuration - standardDuration
      const overtimeRatePerMinute = parseFloat(booking.additional_price || 0) / 60
      overtimeAmount = Math.round((overtimeRatePerMinute * overtimeMinutes) * 100) / 100
    }
    
    // Total amount
    const totalAmount = baseAmount + overtimeAmount

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(booking_id).padStart(5, '0')}`

    // Check if invoice already exists
    const [existing] = await connection.execute(
      'SELECT id FROM invoices WHERE booking_id = ?',
      [booking_id]
    )

    if (existing.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invoice already exists for this booking' 
      }, { status: 400 })
    }

    // Insert invoice
    const [result] = await connection.execute(
      `INSERT INTO invoices (
        invoice_number, booking_id, user_id, provider_id, invoice_type,
        base_amount,
        overtime_minutes, overtime_rate, overtime_amount,
        total_amount,
        service_name, service_duration, actual_duration,
        job_date, completion_date, status
      ) VALUES (?, ?, ?, ?, 'customer', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        invoiceNumber,
        booking.id,
        booking.user_id,
        booking.provider_id,
        baseAmount,
        overtimeMinutes,
        parseFloat(booking.additional_price || 0),
        overtimeAmount,
        totalAmount,
        booking.service_name,
        standardDuration,
        actualDuration,
        booking.job_date,
        booking.end_time || new Date()
      ]
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Invoice generated successfully',
      invoice: {
        id: result.insertId,
        invoice_number: invoiceNumber,
        breakdown: {
          standard_duration: standardDuration,
          actual_duration: actualDuration,
          rate_per_minute: ratePerMinute,
          base_amount: baseAmount,
          overtime_minutes: overtimeMinutes,
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
  } finally {
    if (connection) connection.release()
  }
}