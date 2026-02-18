// app/api/admin/invoices/route.js
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const booking_id = searchParams.get('booking_id')
    const invoice_id = searchParams.get('id')

    let sql = `SELECT * FROM invoices`
    const params = []
    const conditions = []
    
    if (invoice_id) {
      conditions.push(`id = ?`)
      params.push(invoice_id)
    }
    
    if (booking_id) {
      conditions.push(`booking_id = ?`)
      params.push(booking_id)
    }
    
    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ')
    }
    
    sql += ` ORDER BY created_at DESC`

    const invoices = await query(sql, params)

    return NextResponse.json({ 
      success: true, 
      data: invoices 
    })

  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch invoices' 
    }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const { invoice_id, status } = await request.json()

    await query(
      `UPDATE invoices SET status = ? WHERE id = ?`,
      [status, invoice_id]
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Invoice updated successfully' 
    })

  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update invoice' 
    }, { status: 500 })
  }
}