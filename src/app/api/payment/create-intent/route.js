// app/api/payment/create-intent/route.js
// ✅ Sirf Stripe payment intent create karta hai
// Booking tab banegi jab payment/page.js mein payment success ho

import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import Stripe from 'stripe';
import { verifyToken } from '@/lib/jwt';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-05-27.dahlia' });

export async function POST(request) {
  try {
    let token = request.cookies.get('customer_token')?.value || request.cookies.get('user_token')?.value;

    // Support Bearer token for mobile
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const { service_id, service_price, additional_price, service_name } = body;

    if (!service_price) {
      return NextResponse.json({ success: false, message: 'Service price is required' }, { status: 400 });
    }

    // ── Check or Create Stripe Customer ──────────────────────────────────────────
    const users = await execute('SELECT id, email, first_name, last_name, stripe_customer_id FROM users WHERE id = ?', [decoded.id]);
    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    
    const user = users[0];
    let stripeCustomerId = user.stripe_customer_id;

    if (!stripeCustomerId) {
      const customerName = `${user.first_name} ${user.last_name}`.trim();
      const customer = await stripe.customers.create({
        email: user.email,
        name: customerName,
        metadata: { user_id: user.id }
      });
      stripeCustomerId = customer.id;
      await execute('UPDATE users SET stripe_customer_id = ? WHERE id = ?', [stripeCustomerId, user.id]);
    }

    const basePrice = parseFloat(service_price);
    const hourlyRate = parseFloat(additional_price || 0);
    const maxOvertimeCost = 0; // Removed the 2hr hold as per new split payment logic
    const totalAmount = basePrice;
    const amountInCents = Math.round(totalAmount * 100);

    // Get service duration from DB (metadata ke liye)
    let standardDuration = 60;
    if (service_id) {
      const serviceInfo = await execute('SELECT duration_minutes FROM services WHERE id = ?', [service_id]);
      standardDuration = serviceInfo?.[0]?.duration_minutes || 60;
    }

    // ✅ capture_method: automatic — charge immediately
    // 💳 setup_future_usage: 'off_session' — Save card for future overtime auto-charges
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: process.env.STRIPE_CURRENCY || 'cad', 
      customer: stripeCustomerId,
      description: `Authorization for: ${service_name || 'Service Booking'}`,
      setup_future_usage: 'off_session',
      automatic_payment_methods: { 
        enabled: true,
        allow_redirects: 'always' 
      },
      metadata: {
        service_name: service_name || '',
        base_price: basePrice.toFixed(2),
        overtime_rate: hourlyRate.toFixed(2),
        standard_duration: standardDuration.toString(),
        user_id: user.id.toString(),
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