const Stripe = require('stripe');

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function createStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-02-25.clover',
  });
}

async function getCustomerEmail(stripe, customerId) {
  if (!customerId || typeof customerId !== 'string') return 'unknown email';

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer && !customer.deleted) return customer.email || 'unknown email';
  } catch (error) {
    console.error('Unable to retrieve webhook customer:', error.message);
  }

  return 'unknown email';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method not allowed');
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).send('Stripe webhook is not configured.');
  }

  const signature = req.headers['stripe-signature'];
  const stripe = createStripeClient();
  let event;

  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      const email = invoice.customer_email || await getCustomerEmail(stripe, invoice.customer);
      console.log('Stripe subscription payment succeeded:', {
        customerEmail: email,
        subscriptionId: invoice.subscription,
        invoiceId: invoice.id,
      });
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const email = invoice.customer_email || await getCustomerEmail(stripe, invoice.customer);
      console.error('Stripe subscription payment failed - follow up with client:', {
        customerEmail: email,
        subscriptionId: invoice.subscription,
        invoiceId: invoice.id,
      });
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const email = await getCustomerEmail(stripe, subscription.customer);
      console.log('Stripe subscription cancelled:', {
        customerEmail: email,
        subscriptionId: subscription.id,
      });
    }
  } catch (error) {
    console.error('Stripe webhook handling error:', error);
  }

  return res.status(200).json({ received: true });
};
