const crypto = require('crypto');

const COOKIE_NAME = 'gwd_admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 12;

function getPassword() {
  return process.env.ADMIN_PASSWORD || '';
}

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || getPassword();
}

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function sign(payload) {
  const secret = getSecret();
  if (!secret) return '';
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function createSessionCookie() {
  const payload = base64url(JSON.stringify({ iat: Date.now() }));
  const token = `${payload}.${sign(payload)}`;
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${MAX_AGE_SECONDS}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

function parseCookies(header) {
  return String(header || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const index = part.indexOf('=');
      if (index === -1) return cookies;
      cookies[part.slice(0, index)] = decodeURIComponent(part.slice(index + 1));
      return cookies;
    }, {});
}

function isAuthed(req) {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (!token || !token.includes('.')) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature || sign(payload) !== signature) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Date.now() - Number(data.iat) < MAX_AGE_SECONDS * 1000;
  } catch {
    return false;
  }
}

function redirect(res, location) {
  res.statusCode = 302;
  res.setHeader('Location', location);
  res.end();
}

module.exports = {
  clearSessionCookie,
  createSessionCookie,
  getPassword,
  isAuthed,
  redirect,
};
