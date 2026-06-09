const fs = require('fs');
const path = require('path');
const { isAuthed, redirect } = require('./_auth');

module.exports = function handler(req, res) {
  if (!isAuthed(req)) {
    return redirect(res, '/admin');
  }

  const filePath = path.join(process.cwd(), 'api', '_bloggenerator.html');
  const html = fs.readFileSync(filePath, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
};
