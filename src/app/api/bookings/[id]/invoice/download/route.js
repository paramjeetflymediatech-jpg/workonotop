import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { renderToStream } from '@react-pdf/renderer';
import InvoicePDF from '@/components/invoices/InvoicePDF';
import React from 'react';

export async function GET(request, { params }) {
  try {
    const { id: bookingId } = await params;

    // Fetch booking details
    const bookings = await execute(
      `SELECT * FROM bookings WHERE id = ?`,
      [bookingId]
    );

    const booking = bookings[0];

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    // Determine or generate invoice number
    // We check if an invoice already exists
    const existingInvoices = await execute(
      'SELECT invoice_number, created_at FROM invoices WHERE booking_id = ? AND invoice_type = "customer"',
      [bookingId]
    );

    let invoiceNumber;
    let invoiceDate;

    if (existingInvoices.length > 0) {
      invoiceNumber = existingInvoices[0].invoice_number;
      invoiceDate = new Date(existingInvoices[0].created_at).toLocaleDateString();
    } else {
      // Temporary invoice number for early receipts
      invoiceNumber = `REC-${new Date().getFullYear()}-${String(bookingId).padStart(5, '0')}`;
      invoiceDate = new Date().toLocaleDateString();
    }

    // Render PDF to stream
    const stream = await renderToStream(
      <InvoicePDF 
        booking={booking} 
        invoiceNumber={invoiceNumber} 
        date={invoiceDate} 
      />
    );

    // Convert stream to Buffer (Next.js 15 friendly)
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${invoiceNumber}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error downloading invoice:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to generate invoice PDF: ' + error.message 
    }, { status: 500 });
  }
}
