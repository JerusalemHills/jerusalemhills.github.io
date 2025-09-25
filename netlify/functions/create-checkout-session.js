// Create Stripe Checkout Session
// This function creates a secure payment session when customer clicks "Buy"

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { priceId, productName, amount } = JSON.parse(event.body);

    // Validate required fields
    if (!priceId && (!productName || !amount)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Create Stripe checkout session
    const sessionConfig = {
      mode: 'payment',
      success_url: `${process.env.URL || 'https://jerusalemhills.com'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'https://jerusalemhills.com'}/cancel.html`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'IL']
      },
      phone_number_collection: {
        enabled: true
      },
      metadata: {
        source: 'jerusalemhills_marketplace'
      }
    };

    // Use existing price ID or create line item
    if (priceId) {
      sessionConfig.line_items = [{
        price: priceId,
        quantity: 1
      }];
    } else {
      // Dynamic pricing (for products not in Stripe yet)
      sessionConfig.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName,
            description: `Purchase from Jerusalem Hills Marketplace`
          },
          unit_amount: amount // Amount in cents
        },
        quantity: 1
      }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Configure for your domain in production
      },
      body: JSON.stringify({
        url: session.url,
        sessionId: session.id
      })
    };

  } catch (error) {
    console.error('Stripe error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to create checkout session',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      })
    };
  }
};