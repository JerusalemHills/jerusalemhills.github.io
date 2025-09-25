// Stripe Webhook Handler
// This function receives payment confirmations and triggers order fulfillment

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Verify webhook signature for security
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Missing signature or webhook secret');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing signature or configuration' })
    };
  }

  let stripeEvent;

  try {
    // Verify the webhook came from Stripe
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid signature' })
    };
  }

  // Handle different event types
  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(stripeEvent.data.object);
        break;

      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', stripeEvent.data.object.id);
        break;

      case 'payment_intent.payment_failed':
        console.error('Payment failed:', stripeEvent.data.object.id);
        break;

      default:
        console.log('Unhandled event type:', stripeEvent.type);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook processing failed' })
    };
  }
};

async function handleCheckoutComplete(session) {
  console.log('Order completed:', session.id);

  // Extract customer and shipping information
  const customer = {
    email: session.customer_details?.email,
    name: session.customer_details?.name,
    phone: session.customer_details?.phone
  };

  const shipping = session.shipping_details?.address || session.customer_details?.address;

  console.log('Customer:', customer);
  console.log('Shipping to:', shipping);

  // TODO: When Amazon MCF is ready, uncomment and configure:
  /*
  if (process.env.AMAZON_ACCESS_KEY) {
    const amazonMCF = require('./utils/amazon-mcf');

    try {
      await amazonMCF.createFulfillmentOrder({
        orderId: session.id,
        customer: customer,
        shipping: shipping,
        items: session.line_items,
        metadata: session.metadata
      });

      console.log('Fulfillment order created for:', session.id);
    } catch (error) {
      console.error('Failed to create fulfillment order:', error);
      // Send alert email or notification
    }
  }
  */

  // For now, just log the successful order
  console.log('Order ready for fulfillment:', {
    sessionId: session.id,
    amount: session.amount_total / 100, // Convert from cents
    currency: session.currency,
    customerEmail: customer.email
  });

  // Optional: Send confirmation email
  // Optional: Add to spreadsheet or database
  // Optional: Trigger other integrations
}