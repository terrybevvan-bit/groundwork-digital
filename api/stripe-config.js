module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    return res.status(503).json({ error: 'Stripe publishable key is not configured.' });
  }

  return res.status(200).json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
};
