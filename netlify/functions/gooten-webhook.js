/**
 * Gooten webhook handler — receives shipping/tracking updates.
 *
 * Gooten sends webhooks for: order_shipped, tracking_number_assigned, etc.
 * This function logs the update and could trigger a customer email
 * with tracking info via send-email.js.
 *
 * Env vars required:
 *   GOOTEN_WEBHOOK_SECRET (optional) — for signature verification
 */

exports.handler = async function (event) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const payload = JSON.parse(event.body || '{}');

    console.log('Gooten webhook received:', JSON.stringify({
      event: payload.EventType || payload.event_type,
      orderId: payload.OrderId || payload.order_id,
      trackingNumber: payload.TrackingNumber || payload.tracking_number,
      carrier: payload.Carrier || payload.carrier,
      timestamp: new Date().toISOString()
    }));

    // TODO: When send-email.js is configured, send tracking email to customer
    // const eventType = payload.EventType || payload.event_type;
    // if (eventType === 'order_shipped' || eventType === 'tracking_number_assigned') {
    //   await fetch('/.netlify/functions/send-email', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       to: payload.CustomerEmail,
    //       subject: 'Your order has shipped!',
    //       trackingNumber: payload.TrackingNumber,
    //       carrier: payload.Carrier
    //     })
    //   });
    // }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true })
    };

  } catch (err) {
    console.error('Gooten webhook error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Webhook processing failed' })
    };
  }
};
