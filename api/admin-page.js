const { isAuthed } = require('./_auth');

function sendHtml(res, html) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}

function loginHtml(hasError) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Admin - GroundWork Digital</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=Bricolage+Grotesque:opsz,wght@12..96,300;400;500;600;700&display=swap" rel="stylesheet"/>
<style>
:root{--bg:#0e0b08;--bg2:#15110b;--bg3:#1d1811;--border:rgba(255,255,255,.09);--border2:rgba(255,255,255,.16);--gold:#f59e0b;--gold-dim:rgba(245,158,11,.12);--text:#f5f1e8;--text2:#a69a88;--text3:#6d6254;--serif:'Instrument Serif',serif;--sans:'Bricolage Grotesque',sans-serif;--mono:'DM Mono',monospace}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:radial-gradient(circle at 20% 10%,rgba(245,158,11,.08),transparent 34%),var(--bg);color:var(--text);font-family:var(--sans);padding:2rem}
.login{width:min(420px,100%);border:1px solid var(--border);background:rgba(21,17,11,.95);border-radius:10px;padding:2rem;box-shadow:0 24px 80px rgba(0,0,0,.24)}
.brand{display:flex;align-items:center;gap:11px;margin-bottom:2rem}.mark{width:38px;height:38px;border:1px solid var(--gold);border-radius:4px;display:grid;place-items:center;font-family:var(--serif);font-weight:700}.name{font-family:var(--serif);line-height:.95}.sub{font-family:var(--mono);font-size:9px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-top:3px}
h1{font-family:var(--serif);font-size:2.35rem;font-weight:400;line-height:1;margin:0 0 .75rem}p{color:var(--text2);font-weight:300;line-height:1.65;margin:0 0 1.5rem}
label{font-family:var(--mono);font-size:10px;letter-spacing:1.4px;text-transform:uppercase;color:var(--text3);display:block;margin-bottom:.5rem}
input{width:100%;border:1px solid var(--border2);background:var(--bg3);color:var(--text);border-radius:8px;padding:.85rem 1rem;font:inherit;outline:none}input:focus{border-color:var(--gold)}
button{width:100%;margin-top:1rem;border:0;border-radius:999px;background:var(--gold);color:#120c04;padding:.85rem 1.2rem;font-weight:700;font:inherit;cursor:pointer}
.error{border:1px solid rgba(248,113,113,.35);background:rgba(248,113,113,.09);color:#fca5a5;border-radius:8px;padding:.75rem .9rem;font-size:.9rem;margin-bottom:1rem}
a{color:var(--gold);text-decoration:none}.back{display:inline-block;margin-top:1rem;font-size:.9rem;color:var(--text3)}
</style>
</head>
<body>
<main class="login">
  <div class="brand"><div class="mark">GW</div><div><div class="name">GroundWork</div><div class="sub">Digital</div></div></div>
  <h1>Admin access</h1>
  <p>Sign in to reach the GroundWork Digital tools area.</p>
  ${hasError ? '<div class="error">That password was not accepted.</div>' : ''}
  <form method="POST" action="/api/admin-login">
    <input type="hidden" name="next" value="/admin"/>
    <label for="password">Password</label>
    <input id="password" name="password" type="password" autocomplete="current-password" autofocus required/>
    <button type="submit">Enter admin</button>
  </form>
  <a class="back" href="/">Back to site</a>
</main>
</body>
</html>`;
}

function adminHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Admin - GroundWork Digital</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=Bricolage+Grotesque:opsz,wght@12..96,300;400;500;600;700&display=swap" rel="stylesheet"/>
<style>
:root{--bg:#0e0b08;--bg2:#15110b;--bg3:#1d1811;--border:rgba(255,255,255,.08);--border2:rgba(255,255,255,.15);--gold:#f59e0b;--gold-dim:rgba(245,158,11,.12);--text:#f5f1e8;--text2:#a69a88;--text3:#6d6254;--serif:'Instrument Serif',serif;--sans:'Bricolage Grotesque',sans-serif;--mono:'DM Mono',monospace}
*{box-sizing:border-box;margin:0;padding:0}body{background:var(--bg);color:var(--text);font-family:var(--sans);min-height:100vh}
body:before{content:'';position:fixed;inset:0;background:linear-gradient(rgba(245,158,11,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,.025) 1px,transparent 1px);background-size:48px 48px;pointer-events:none}
header{position:sticky;top:0;z-index:2;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 2rem;background:rgba(14,11,8,.92);border-bottom:1px solid var(--border);backdrop-filter:blur(14px)}
.brand{display:flex;align-items:center;gap:11px;text-decoration:none;color:var(--text)}.mark{width:38px;height:38px;border:1px solid var(--gold);border-radius:4px;display:grid;place-items:center;font-family:var(--serif);font-weight:700}.name{font-family:var(--serif);line-height:.95}.sub{font-family:var(--mono);font-size:9px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-top:3px}
.toplinks{display:flex;align-items:center;gap:.75rem}.toplinks a{color:var(--text2);font-size:.9rem;text-decoration:none}.toplinks a:hover{color:var(--gold)}
main{position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:4.5rem 2rem}.tag{font-family:var(--mono);font-size:11px;color:var(--gold);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:1rem}h1{font-family:var(--serif);font-weight:400;font-size:clamp(2.8rem,6vw,5rem);line-height:1;margin-bottom:1rem}p.lede{font-size:1.08rem;color:var(--text2);font-weight:300;line-height:1.75;max-width:640px;margin-bottom:2.75rem}
.tools{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}.tool{border:1px solid var(--border);background:var(--bg2);border-radius:8px;padding:1.35rem;text-decoration:none;color:inherit;min-height:190px;display:flex;flex-direction:column;transition:border-color .15s,transform .15s}.tool:hover{border-color:var(--gold);transform:translateY(-2px)}
.tool .eyebrow{font-family:var(--mono);font-size:10px;color:var(--gold);letter-spacing:1px;text-transform:uppercase;margin-bottom:.8rem}.tool h2{font-family:var(--serif);font-size:1.55rem;font-weight:400;margin-bottom:.65rem}.tool p{color:var(--text2);font-size:.95rem;line-height:1.55;font-weight:300}.tool .action{margin-top:auto;color:var(--gold);font-family:var(--mono);font-size:11px;letter-spacing:.4px}
.placeholder{opacity:.62}.primary{background:linear-gradient(180deg,rgba(245,158,11,.13),rgba(21,17,11,.95));border-color:rgba(245,158,11,.35)}
@media(max-width:850px){.tools{grid-template-columns:1fr}header{padding:0 1.25rem}.hide-sm{display:none}main{padding:3rem 1.25rem}}
</style>
</head>
<body>
<header>
  <a class="brand" href="/admin"><div class="mark">GW</div><div><div class="name">GroundWork</div><div class="sub">Digital</div></div></a>
  <nav class="toplinks"><a href="/" class="hide-sm">View site</a><a href="/api/admin-logout">Log out</a></nav>
</header>
<main>
  <div class="tag">Private admin</div>
  <h1>GroundWork tools</h1>
  <p class="lede">A central place for internal tools, publishing helpers, and future admin workflows.</p>
  <section class="tools" aria-label="Admin tools">
    <a class="tool primary" href="/bloggenerator">
      <div class="eyebrow">Content</div>
      <h2>Blog generator</h2>
      <p>Create draft blog posts, SEO titles, meta descriptions, keywords, and downloadable Markdown.</p>
      <div class="action">Open tool -></div>
    </a>
    <a class="tool" href="/invoice/">
      <div class="eyebrow">Existing tool</div>
      <h2>Invoice area</h2>
      <p>Jump to the existing invoice admin section already included on the site.</p>
      <div class="action">Open invoices -></div>
    </a>
    <article class="tool placeholder">
      <div class="eyebrow">Coming next</div>
      <h2>More admin tools</h2>
      <p>Add client notes, publishing checklists, analytics links, or other internal shortcuts here.</p>
      <div class="action">Ready for expansion</div>
    </article>
  </section>
</main>
</body>
</html>`;
}

module.exports = function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  return sendHtml(res, isAuthed(req) ? adminHtml() : loginHtml(url.searchParams.has('error')));
};
