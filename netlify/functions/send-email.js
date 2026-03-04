/**
 * Send transactional emails — order confirmations, download links, tracking.
 *
 * POST body: {
 *   to: string,           // Customer email
 *   subject: string,
 *   type: "download" | "confirmation" | "tracking",
 *   downloadUrl: string,  // For digital orders
 *   trackingNumber: string, // For physical orders
 *   carrier: string,
 *   productName: string,
 *   orderId: string
 * }
 *
 * Env vars (choose one provider):
 *   MAILGUN_API_KEY + MAILGUN_DOMAIN
 *   SENDGRID_API_KEY
 */

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': 'https://jerusalemhills.com',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { to, subject, type, downloadUrl, trackingNumber, carrier, productName, orderId } = JSON.parse(event.body || '{}');

    if (!to || !subject) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing to or subject' }) };
    }

    // Build email HTML
    let html = '';
    const fromName = 'Jerusalem Hills';

    if (type === 'download') {
      html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:2rem;">
          <h2 style="color:#231F20;">Your order is ready!</h2>
          <p>Thank you for your purchase of <strong>${productName || 'your personalized product'}</strong>.</p>
          <p>Click below to download your high-resolution file:</p>
          <a href="${downloadUrl}" style="display:inline-block;padding:12px 24px;background:#91D9F8;color:#231F20;text-decoration:none;border-radius:8px;font-weight:bold;margin:1rem 0;">Download Now</a>
          <p style="font-size:0.85rem;color:#888;">This link expires in 7 days. If you need help, reply to this email.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:2rem 0;">
          <p style="font-size:0.8rem;color:#aaa;">Jerusalem Hills — jerusalemhills.com</p>
        </div>`;
    } else if (type === 'tracking') {
      html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:2rem;">
          <h2 style="color:#231F20;">Your order has shipped!</h2>
          <p>Your <strong>${productName || 'order'}</strong> is on its way.</p>
          <p><strong>Tracking number:</strong> ${trackingNumber || 'N/A'}</p>
          <p><strong>Carrier:</strong> ${carrier || 'N/A'}</p>
          <p>You should receive your print within 3-7 business days.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:2rem 0;">
          <p style="font-size:0.8rem;color:#aaa;">Jerusalem Hills — jerusalemhills.com</p>
        </div>`;
    } else {
      html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:2rem;">
          <h2 style="color:#231F20;">Order confirmed!</h2>
          <p>Thank you for your purchase of <strong>${productName || 'your product'}</strong>.</p>
          <p>Order ID: ${orderId || 'N/A'}</p>
          <p>We'll send you another email when your order is ready.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:2rem 0;">
          <p style="font-size:0.8rem;color:#aaa;">Jerusalem Hills — jerusalemhills.com</p>
        </div>`;
    }

    // ── Send via Mailgun ──
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      const form = new URLSearchParams();
      form.append('from', `${fromName} <noreply@${process.env.MAILGUN_DOMAIN}>`);
      form.append('to', to);
      form.append('subject', subject);
      form.append('html', html);

      const res = await fetch(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from('api:' + process.env.MAILGUN_API_KEY).toString('base64')
        },
        body: form
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('Mailgun error:', err);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Email send failed' }) };
      }
    }

    // ── Send via SendGrid ──
    else if (process.env.SENDGRID_API_KEY) {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: 'noreply@jerusalemhills.com', name: fromName },
          subject: subject,
          content: [{ type: 'text/html', value: html }]
        })
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('SendGrid error:', err);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Email send failed' }) };
      }
    }

    // ── Fallback: log ──
    else {
      console.log('EMAIL_SEND (no provider configured):', JSON.stringify({ to, subject, type }));
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    console.error('Send email error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
