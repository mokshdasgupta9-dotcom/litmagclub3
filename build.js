const fs = require('fs'), path = require('path'), { marked } = require('marked');
marked.setOptions({ breaks: true });
const R = __dirname, OUT = path.join(R, 'dist');
const rj = f => JSON.parse(fs.readFileSync(path.join(R, f), 'utf8'));
const site = rj('data/site.json'), home = rj('data/home.json'), off = rj('data/officers.json');
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = d => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
const w = (f, h) => { const p = path.join(OUT, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, h); };
const j = o => `<script id="data" type="application/json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

function parse(file) {
  const t = fs.readFileSync(file, 'utf8').replace(/\r/g, '');
  const m = t.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/), d = {};
  if (!m) return { d, body: t };
  m[1].split('\n').forEach(l => { const i = l.indexOf(':'); if (i > 0) d[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, ''); });
  return { d, body: m[2] };
}
const list = dir => { const p = path.join(R, dir); return fs.existsSync(p) ? fs.readdirSync(p).filter(f => f.endsWith('.md') && !f.startsWith('_')).map(f => ({ slug: f.slice(0, -3), ...parse(path.join(p, f)) })) : []; };
const text = f => marked.parse(parse(path.join(R, 'content', f + '.md')).body);

const nav = [['/gallery', 'Gallery'], ['/events', 'Events'], ['/officers', 'Officers'], ['/about', 'About'], ['/join', 'Join &amp; contact']];
const layout = (t, main, cur, extra = '', cls = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(t)} | ${esc(site.short)}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet"><link rel="stylesheet" href="/style.css"><script>try{document.documentElement.dataset.t=localStorage.getItem('t')||'light'}catch(e){document.documentElement.dataset.t='light'}</script></head><body><header class="top"><a class="brand" href="/">${esc(site.short)}</a><nav aria-label="Main">${nav.map(([h, n]) => `<a href="${h}"${h === cur ? ' class="on" aria-current="page"' : ''}>${n}</a>`).join('')}<button id="tg" class="sw" role="switch" aria-checked="false" aria-label="Dark mode" title="Dark mode"><span></span></button></nav></header><main class="${cls}">${main}</main><footer>${esc(site.name)}</footer><script src="/app.js"></script>${extra}</body></html>`;

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(R, 'public'), OUT, { recursive: true });

// Works
const who = d => d.anonymous === 'true' ? 'Anonymous' : [d.author, d.grade].filter(Boolean).join(', ');
const works = list('content/works').map(x => ({ ...x, date: x.d.date || '', who: who(x.d) })).sort((a, b) => b.date.localeCompare(a.date));
works.forEach(x => w(`works/${x.slug}.html`, layout(x.d.title || x.slug,
  `<article class="work"><a class="back" href="/gallery">Back to all works</a><h1>${esc(x.d.title)}</h1><p class="by">${esc(x.who)}</p><p class="meta"><span>${esc(x.d.medium)}</span> <span>${fmt(x.date)}</span></p>${x.d.image ? `<img src="/images/${esc(x.d.image)}" alt="${esc(x.d.alt)}">` : ''}<div class="body">${marked.parse(x.body)}</div></article>`, '/gallery')));
w('gallery.html', layout('Gallery',
  `<div class="find"><label>Search<input id="q" type="search" placeholder="Title or author"></label><label>Year<select id="yr"></select></label><div id="md" class="chips" role="group" aria-label="Medium"></div></div><ul id="list" class="list"></ul><p id="none" hidden>No works match your search.</p>${j(works.map(x => ({ slug: x.slug, title: esc(x.d.title), who: esc(x.who), medium: esc(x.d.medium), date: x.date, year: x.date.slice(0, 4), image: esc(x.d.image), alt: esc(x.d.alt) })))}`, '/gallery'));

// Landing
const latest = works.slice(0, 3).map(x => `<li><a href="/works/${x.slug}"><h2>${esc(x.d.title)}</h2><span class="a">${esc(x.who)}</span><span class="m">${esc(x.d.medium)}</span><time>${fmt(x.date)}</time></a></li>`).join('');
w('index.html', layout('Home',
  `<section class="hero"><p class="club">${esc(site.name)}</p><h1 class="word">${esc(site.short)}</h1><p class="head">${esc(home.headline)}</p><p class="vp">${esc(home.valueProp)}</p><p class="cta"><a class="btn" href="/gallery">Read the gallery</a><a class="btn ghost" href="/join">Join the club</a></p></section>
<section class="pil">${(home.pillars || []).map(p => `<div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join('')}</section>
${latest ? `<section class="latest"><h2>Latest from the gallery</h2><ul class="list">${latest}</ul><p><a class="more" href="/gallery">See every work</a></p></section>` : ''}
<section class="close"><p class="vibe">${esc(home.vibe)}</p></section>`, '/', '', 'home'));

// Events
const events = list('content/events').map(x => ({ title: esc(x.d.title || x.slug), date: x.d.date || '', time: esc(x.d.time), location: esc(x.d.location), type: esc(x.d.type), html: marked.parse(x.body) }));
w('events.html', layout('Events', `<h1>Events</h1><div id="cal"></div><h2>Upcoming</h2><ul id="up" class="ev"></ul><section id="ar" hidden><h2>Archive</h2><ul id="arch" class="ev"></ul></section>${j(events)}`, '/events'));

// Officers and About
w('officers.html', layout('Officers', `<h1>Officers</h1><div class="off">${off.map(o => `<section><h2>${esc(o.name)}</h2><p>${esc(o.about)}</p></section>`).join('')}</div>`, '/officers'));
w('about.html', layout('About', `<h1>About</h1><div class="prose">${text('about')}</div>`, '/about'));

// Join and contact (one page)
const note = t => `<p class="note">${t}</p>`;
const joinX = site.joinFormUrl ? `<p><a class="btn" href="${esc(site.joinFormUrl)}" target="_blank" rel="noopener">Open the Google Form</a></p>` : note('[Add the Google Form link in data/site.json]');
const contX = site.contactFormUrl ? `<iframe class="form" title="Contact form" src="${esc(site.contactFormUrl)}" loading="lazy"></iframe>` : note('[Add the Google Form link in data/site.json]');
w('join.html', layout('Join and contact', `<h1>How to join</h1><div class="prose">${text('join')}${joinX}</div><section id="contact" class="sec"><h2>Contact</h2><div class="prose">${text('contact')}${contX}</div></section>`, '/join'));
console.log(`Built ${works.length} works, ${events.length} events.`);
