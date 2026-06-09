const { createSessionCookie, getPassword, redirect } = require('./_auth');

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    return Object.fromEntries(new URLSearchParams(req.body));
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Object.fromEntries(new URLSearchParams(Buffer.concat(chunks).toString('utf8')));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method not allowed');
  }

  const data = await parseBody(req);

  const password = getPassword();

  if (!password) {
    return res.status(503).send('Admin password is not configured.');
  }

  if (String(data.password || '') !== password) {
    return redirect(res, '/admin?error=1');
  }

  res.setHeader('Set-Cookie', createSessionCookie());
  return redirect(res, data.next || '/admin');
};
