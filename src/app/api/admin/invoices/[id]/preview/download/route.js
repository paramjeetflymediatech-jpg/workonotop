// app/api/admin/invoices/[id]/download/route.js
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function GET(request, { params }) {
  try {
    const id = params.id
    
    // Fetch invoice details (same as above)
    const [invoice] = await db.query(`
      SELECT 
        i.*,
        b.booking_number,
        b.job_date,
        b.service_price,
        b.additional_price,
        b.address_line1,
        b.city,
        b.postal_code,
        c.first_name as customer_first_name,
        c.last_name as customer_last_name,
        c.email as customer_email,
        c.phone as customer_phone,
        s.name as service_name,
        s.duration_minutes,
        sp.name as provider_name,
        sp.email as provider_email,
        sp.phone as provider_phone
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.id
      JOIN customers c ON b.customer_id = c.id
      JOIN services s ON b.service_id = s.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      WHERE i.id = ?
    `, [id])

    if (!invoice || invoice.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invoice not found' },
        { status: 404 }
      )
    }

    const inv = invoice[0]

    // Calculate totals
    const subtotal = parseFloat(inv.service_price) + parseFloat(inv.additional_price || 0)
    const tax = subtotal * 0.05
    const total = subtotal + tax

    // Generate HTML (same HTML content as above)
    const htmlContent = `...` // (same HTML from above)

    // Launch puppeteer
    const browser = await puppeteer.launch({ headless: 'new' })
    const page = await browser.newPage()
    
    // Set HTML content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }
    })

    await browser.close()

    // Return PDF
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${inv.invoice_number}.pdf"`,
        'Content-Length': pdf.length.toString()
      },
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to download invoice' },
      { status: 500 }
    )
  }
}