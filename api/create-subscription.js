const Stripe = require('stripe');

const tiers = {
  starter: { name: 'Starter', priceEnv: 'STRIPE_STARTER_PRICE_ID' },
  growth: { name: 'Growth', priceEnv: 'STRIPE_GROWTH_PRICE_ID' },
  partner: { name: 'Partner', priceEnv: 'STRIPE_PARTNER_PRICE_ID' },
};

async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function clean(value) {
  return String(value || '').trim();
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
    const tierKey = clean(body.tier).toLowerCase();
    const tier = tiers[tierKey];

    if (!tier) {
      return res.status(400).json({ error: 'Please choose a valid subscription tier.' });
    }

    const priceId = process.env[tier.priceEnv];
    if (!priceId || priceId.startsWith('REPLACE_WITH_')) {
      return res.status(503).json({ error: `${tier.name} pricing is not configured yet.` });
    }

    const businessName = clean(body.businessName);
    const contactName = clean(body.contactName);
    const email = clean(body.email).toLowerCase();
    const phone = clean(body.phone);

    if (!businessName || !contactName || !email || !phone) {
      return res.status(400).json({ error: 'Please complete every signup field.' });
    }

    const customer = await stripe.customers.create({
      email,
      name: contactName,
      phone,
      metadata: {
        businessName,
        selectedTier: tierKey,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      metadata: {
        businessName,
        contactName,
        phone,
        selectedTier: tierKey,
      },
      expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice;
    const paymentIntent = invoice && invoice.payment_intent;
    const clientSecret = paymentIntent && paymentIntent.client_secret;

    if (!clientSecret) {
      console.error('Subscription missing payment intent client secret:', subscription.id);
      return res.status(500).json({ error: 'Unable to start payment confirmation.' });
    }

    return res.status(200).json({
      clientSecret,
      subscriptionId: subscription.id,
      customerId: customer.id,
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    const status = error && error.type && error.type.startsWith('Stripe') ? 400 : 500;
    return res.status(status).json({
      error: status === 400 ? error.message : 'Unable to create the subscription right now.',
    });
  }
};
