const $ = s => document.querySelector(s);
const tg = $('#tg');
const sync = () => tg.setAttribute('aria-checked', document.documentElement.dataset.t === 'dark');
tg.onclick = () => {
  document.documentElement.classList.add('tt');
  const t = document.documentElement.dataset.t === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.t = t; sync();
  try { localStorage.setItem('t', t); } catch (e) {}
};
sync();
const D = $('#data') ? JSON.parse($('#data').textContent) : null;
const fmt = d => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

if ($('#list')) {
  const yrs = [...new Set(D.map(x => x.year).filter(Boolean))].sort().reverse();
  const mds = [...new Set(D.map(x => x.medium).filter(Boolean))].sort();
  let md = '';
  $('#yr').innerHTML = '<option value="">All years</option>' + yrs.map(y => `<option>${y}</option>`).join('');
  const draw = () => {
    const q = $('#q').value.toLowerCase(), y = $('#yr').value;
    const r = D.filter(x => (!md || x.medium === md) && (!y || x.year === y) && (x.title + ' ' + x.who).toLowerCase().includes(q));
    $('#list').innerHTML = r.map(x => `<li><a href="/works/${x.slug}"><h2>${x.title}</h2><span class="a">${x.who}</span><span class="m">${x.medium}</span><time>${fmt(x.date)}</time>${x.image ? `<img loading="lazy" src="/images/${x.image}" alt="${x.alt}">` : ''}</a></li>`).join('');
    $('#none').hidden = r.length > 0;
  };
  const chips = () => $('#md').innerHTML = ['', ...mds].map(m => `<button class="${m === md ? 'on' : ''}" data-m="${m}">${m || 'All'}</button>`).join('');
  $('#md').onclick = e => { if (e.target.dataset.m !== undefined) { md = e.target.dataset.m; chips(); draw(); } };
  $('#q').oninput = $('#yr').onchange = draw;
  chips(); draw();
}

if ($('#cal')) {
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const c = new Date(); c.setDate(1);
  const item = e => `<li><time>${fmt(e.date)}${e.time ? ', ' + e.time : ''}</time><h3>${e.title}</h3><p>${[e.type, e.location].filter(Boolean).join(', ')}</p>${e.html}</li>`;
  const cal = () => {
    const y = c.getFullYear(), m = c.getMonth(), f = new Date(y, m, 1).getDay(), n = new Date(y, m + 1, 0).getDate();
    let h = `<div class="ch"><button id="pv" aria-label="Previous month">Previous</button><h2>${c.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h2><button id="nx" aria-label="Next month">Next</button></div><div class="g">` + 'SMTWTFS'.split('').map(d => `<b>${d}</b>`).join('');
    for (let i = 0; i < f; i++) h += '<i></i>';
    for (let d = 1; d <= n; d++) {
      const s = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, e = D.filter(x => x.date === s);
      h += `<div class="${e.length ? 'has' : ''}${s === today ? ' now' : ''}"><span>${d}</span>${e.map(x => `<em>${x.title}</em>`).join('')}</div>`;
    }
    $('#cal').innerHTML = h + '</div>';
    $('#pv').onclick = () => { c.setMonth(c.getMonth() - 1); cal(); };
    $('#nx').onclick = () => { c.setMonth(c.getMonth() + 1); cal(); };
  };
  const up = D.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const ar = D.filter(e => e.date < today).sort((a, b) => b.date.localeCompare(a.date));
  $('#up').innerHTML = up.map(item).join('') || '<li>No upcoming events.</li>';
  if (ar.length) { $('#ar').hidden = false; $('#arch').innerHTML = ar.map(item).join(''); }
  cal();
}

// Page transition: content fades out (0.25s), the next page fades in (0.25s), over the persistent background.
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download')) return;
  if (a.origin !== location.origin || (a.pathname === location.pathname && a.search === location.search)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  e.preventDefault();
  document.documentElement.classList.add('leaving');
  setTimeout(() => { location.href = a.href; }, 250);
});
addEventListener('pageshow', e => { if (e.persisted) document.documentElement.classList.remove('leaving'); });
