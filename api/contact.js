function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function field(value) {
  const trimmed = String(value || '').trim();
  return trimmed || 'Not provided';
}

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('application/json')) {
    return JSON.parse(raw || '{}');
  }

  return Object.fromEntries(new URLSearchParams(raw));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = await parseBody(req);

    if (data.website) {
      return res.status(200).json({ ok: true });
    }

    const first = field(data.first);
    const last = field(data.last);
    const email = field(data.email);
    const phone = field(data.phone);
    const business = field(data.business);
    const service = field(data.service);
    const message = field(data.message);

    if (!data.first || !data.last || !data.email) {
      return res.status(400).json({ error: 'Please include your name and email.' });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(503).json({ error: 'Email delivery is not configured yet.' });
    }

    const to = process.env.CONTACT_TO_EMAIL || 'terry@groundwork-digital.ca';
    const from = process.env.CONTACT_FROM_EMAIL || 'GroundWork Digital <onboarding@resend.dev>';
    const replyTo = String(data.email || '').trim();

    const html = `
      <h2>New GroundWork Digital contact request</h2>
      <p><strong>Name:</strong> ${escapeHtml(first)} ${escapeHtml(last)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Business:</strong> ${escapeHtml(business)}</p>
      <p><strong>Service:</strong> ${escapeHtml(service)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: replyTo,
        subject: `New contact request from ${first} ${last}`,
        html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Resend error:', detail);
      return res.status(502).json({ error: 'Email delivery failed.' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
};
