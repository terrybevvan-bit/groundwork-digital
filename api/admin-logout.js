const { clearSessionCookie, redirect } = require('./_auth');

module.exports = function handler(req, res) {
  res.setHeader('Set-Cookie', clearSessionCookie());
  return redirect(res, '/admin');
};
