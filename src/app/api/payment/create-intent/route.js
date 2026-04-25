// app/api/payment/create-intent/route.js
// ✅ Sirf Stripe payment intent create karta hai
// Booking tab banegi jab payment/page.js mein payment success ho

import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { service_id, service_price, additional_price, service_name } = body;

    if (!service_price) {
      return NextResponse.json({ success: false, message: 'Service price is required' }, { status: 400 });
    }

    const basePrice = parseFloat(service_price);
    const hourlyRate = parseFloat(additional_price || 0);
    const maxOvertimeCost = hourlyRate * 2; // max 2 hours
    const totalAmount = basePrice + maxOvertimeCost;
    const amountInCents = Math.round(totalAmount * 100);

    // Get service duration from DB (metadata ke liye)
    let standardDuration = 60;
    if (service_id) {
      const serviceInfo = await execute('SELECT duration_minutes FROM services WHERE id = ?', [service_id]);
      standardDuration = serviceInfo?.[0]?.duration_minutes || 60;
    }

    // ✅ capture_method: 'manual' — sirf hold karo, charge nahi
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'gbp', 
      capture_method: 'manual',
      description: `Authorization for: ${service_name || 'Service Booking'}`,
      automatic_payment_methods: { 
        enabled: true,
        allow_redirects: 'always' 
      },
      metadata: {
        service_name: service_name || '',
        base_price: basePrice.toFixed(2),
        overtime_rate: hourlyRate.toFixed(2),
        standard_duration: standardDuration.toString(),
      },
    });

    return NextResponse.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: totalAmount,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initialize payment', error: error.message },
      { status: 500 }
    );
  }
}