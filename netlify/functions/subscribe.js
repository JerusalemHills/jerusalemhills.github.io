/**
 * Email subscription handler.
 *
 * Accepts email + interest tags, stores in the configured email service.
 * Currently stores to a simple JSON log; swap the storage backend when
 * you set up Buttondown, Mailchimp, or Brevo.
 *
 * POST body: { email: string, interests: string[] }
 * interests: ["holiday-gifts", "educational", "personalized-art", "newsletter"]
 */

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': 'https://jerusalemhills.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { email, interests } = JSON.parse(event.body || '{}');

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Please provide a valid email address.' })
      };
    }

    // Sanitize interests
    const validInterests = ['holiday-gifts', 'educational', 'personalized-art', 'newsletter'];
    const cleanInterests = (interests || []).filter(i => validInterests.includes(i));

    // ── Storage backend ──────────────────────────────────────
    // Option 1: Buttondown API (recommended, free up to 100 subscribers)
    if (process.env.BUTTONDOWN_API_KEY) {
      const res = await fetch('https://api.buttondown.email/v1/subscribers', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.BUTTONDOWN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          tags: cleanInterests,
          referrer_url: 'https://jerusalemhills.com'
        })
      });

      if (!res.ok && res.status !== 409) {
        // 409 = already subscribed (that's fine)
        const errData = await res.json().catch(() => ({}));
        console.error('Buttondown error:', errData);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Subscription failed. Please try again.' })
        };
      }
    }

    // Option 2: Brevo (Sendinblue) API
    else if (process.env.BREVO_API_KEY) {
      const res = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          attributes: { INTERESTS: cleanInterests.join(',') },
          listIds: [parseInt(process.env.BREVO_LIST_ID || '2')],
          updateEnabled: true
        })
      });

      if (!res.ok && res.status !== 204) {
        const errData = await res.json().catch(() => ({}));
        // "Contact already exist" is fine
        if (errData.code !== 'duplicate_parameter') {
          console.error('Brevo error:', errData);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Subscription failed. Please try again.' })
          };
        }
      }
    }

    // Fallback: log to console (visible in Netlify function logs)
    else {
      console.log('NEW_SUBSCRIBER:', JSON.stringify({
        email,
        interests: cleanInterests,
        timestamp: new Date().toISOString()
      }));
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'You\'re subscribed! Check your email for a welcome message.' })
    };

  } catch (err) {
    console.error('Subscribe error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Something went wrong. Please try again.' })
    };
  }
};
