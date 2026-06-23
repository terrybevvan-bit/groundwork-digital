const Stripe = require('stripe');

async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function getOrigin(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'groundwork-digital.ca';
  return `${proto}://${host}`;
}

function createStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-02-25.clover',
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Stripe is not configured yet.' });
  }

  try {
    const stripe = createStripeClient();
    const body = await parseJsonBody(req);
    const customerId = String(body.customerId || '').trim();

    if (!customerId) {
      return res.status(400).json({ error: 'Missing customer ID.' });
    }

    const configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'GroundWork Digital payment method update',
      },
      features: {
        customer_update: { enabled: false },
        invoice_history: { enabled: false },
        payment_method_update: { enabled: true },
        subscription_cancel: { enabled: false },
        subscription_update: { enabled: false },
      },
    });

    const returnUrl = `${getOrigin(req)}/signup/success.html`;
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      configuration: configuration.id,
      return_url: returnUrl,
      flow_data: {
        type: 'payment_method_update',
        after_completion: {
          type: 'redirect',
          redirect: {
            return_url: returnUrl,
          },
        },
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Create portal session error:', error);
    return res.status(500).json({ error: 'Unable to open the payment method portal right now.' });
  }
};
