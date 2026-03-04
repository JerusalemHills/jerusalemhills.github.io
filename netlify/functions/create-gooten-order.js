/**
 * Create a print-on-demand order via Gooten API.
 *
 * Called by stripe-webhook.js when fulfillmentMethod === "physical".
 *
 * Expects POST body: {
 *   imageUrl: string,       // Cloudinary URL of high-res image
 *   shippingAddress: {name, line1, line2, city, state, zip, country},
 *   sku: string,            // Gooten product SKU
 *   size: string            // e.g. "8x10", "12x16", "16x20"
 * }
 *
 * Env vars required:
 *   GOOTEN_API_KEY — from Gooten dashboard
 */

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': 'https://jerusalemhills.com',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.GOOTEN_API_KEY;
  if (!apiKey) {
    console.error('GOOTEN_API_KEY not configured');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Fulfillment service not configured. Order logged for manual processing.' })
    };
  }

  try {
    const { imageUrl, shippingAddress, sku, size } = JSON.parse(event.body || '{}');

    if (!imageUrl || !shippingAddress) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing imageUrl or shippingAddress' })
      };
    }

    const orderPayload = {
      ShipToAddress: {
        FirstName: shippingAddress.name.split(' ')[0] || '',
        LastName: shippingAddress.name.split(' ').slice(1).join(' ') || '',
        Line1: shippingAddress.line1,
        Line2: shippingAddress.line2 || '',
        City: shippingAddress.city,
        State: shippingAddress.state || '',
        PostalCode: shippingAddress.zip,
        CountryCode: shippingAddress.country || 'US'
      },
      Items: [{
        SKU: sku || 'Canvas-8x10',
        Quantity: 1,
        Images: [{
          Url: imageUrl,
          Index: 0
        }]
      }]
    };

    const res = await fetch('https://api.gooten.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Gooten API error:', data);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create print order', details: data })
      };
    }

    console.log('Gooten order created:', data.Id || data.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, orderId: data.Id || data.id })
    };

  } catch (err) {
    console.error('Create Gooten order error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal error creating print order' })
    };
  }
};
