(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const money = n => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
const replay = el => { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); };
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

/* ---------- circle reveal (used by the theme toggle AND by page changes) ---------- */
const canVT = () => !!document.startViewTransition && !calm;
const reveal = (update, x, y, cls) => {
  if (!canVT()) { update(); return Promise.resolve(); }
  const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  if (cls) root.classList.add(cls);
  const t = document.startViewTransition(update);
  t.ready.then(() => root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] }, { duration: 800, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' })).catch(() => {});
  return t.finished.catch(() => {}).then(() => { if (cls) root.classList.remove(cls); });
};

/* ---------- theme: follows the device until the visitor picks one ---------- */
const sysLight = matchMedia('(prefers-color-scheme: light)');
const getSaved = () => { try { return localStorage.getItem('pi_theme'); } catch (e) { return null; } };
const tg = document.createElement('button'); tg.className = 'tg'; tg.type = 'button'; tg.setAttribute('aria-label', 'Switch between light and dark theme');
tg.innerHTML = '<svg class="sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><svg class="moon" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const haBox = $('.ha'); if (haBox) haBox.prepend(tg);
const applyTheme = t => { root.dataset.theme = t; const m = $('meta[name="theme-color"]'); if (m) m.content = t === 'light' ? '#EEEAE3' : '#0A0C10'; tg.setAttribute('aria-pressed', t === 'light'); };
applyTheme(getSaved() || (sysLight.matches ? 'light' : 'dark'));
tg.onclick = () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light', r = tg.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  try { localStorage.setItem('pi_theme', next); } catch (e) {}
  if (canVT()) reveal(() => applyTheme(next), x, y);
  else { root.classList.add('sw'); setTimeout(() => root.classList.remove('sw'), 600); applyTheme(next); }
};
if (sysLight.addEventListener) sysLight.addEventListener('change', e => { if (!getSaved()) applyTheme(e.matches ? 'light' : 'dark'); });

/* ---------- header + mobile menu ---------- */
const hd = $('.hd'), mt = $('.mt'), mn = $('.mn');
const heroEl = () => $('.hero') || $('.ph');
let heroH = 0, tick = false;
const measure = () => { const h = heroEl(); heroH = h ? h.offsetHeight : 0; };
const onS = () => { hd.classList.toggle('over', scrollY < heroH - 6); tick = false; };
addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onS); } }, { passive: true });
addEventListener('resize', () => { measure(); onS(); });
const menu = open => { mn.classList.toggle('o', open); mt.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : ''; mt.textContent = open ? 'Close' : 'Menu'; };
mt.onclick = () => menu(!mn.classList.contains('o'));
$$('.mn a').forEach(a => a.addEventListener('click', () => menu(false)));

/* ---------- sliding highlight in the menu (moves like a toggle) ---------- */
const dn = $('.dn'); let ind = null, lastSlide = 0;
if (dn) { ind = document.createElement('span'); ind.className = 'ind'; dn.prepend(ind); }
const indBox = () => { const a = dn && $('a[aria-current]', dn); return a && a.offsetWidth ? { l: a.offsetLeft, t: a.offsetTop, w: a.offsetWidth, h: a.offsetHeight } : null; };
const setInd = (b, animate) => {
  if (!ind) return;
  if (!b) { ind.classList.remove('on'); return; }
  ind.style.transition = animate ? '' : 'none';
  ind.style.width = b.w + 'px'; ind.style.height = b.h + 'px'; ind.style.top = b.t + 'px'; ind.style.transform = `translateX(${b.l}px)`;
  ind.classList.add('on'); if (!animate) { void ind.offsetWidth; ind.style.transition = ''; }
};
const placeInd = () => { if (performance.now() - lastSlide > 700) setInd(indBox(), false); };
{
  let prev = null; try { prev = JSON.parse(sessionStorage.getItem('pi_ind') || 'null'); sessionStorage.removeItem('pi_ind'); } catch (e) {}
  if (prev && indBox()) { setInd(prev, false); requestAnimationFrame(() => requestAnimationFrame(() => { lastSlide = performance.now(); setInd(indBox(), true); })); }
  else setInd(indBox(), false);
  if (document.fonts) document.fonts.ready.then(placeInd);
  addEventListener('resize', placeInd);
}

/* ---------- reveal on scroll + counters ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
const watch = () => $$('.rv:not(.in)').forEach(el => io.observe(el));
const co = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; co.unobserve(e.target);
  const el = e.target, t = +el.dataset.count, s = el.dataset.suf || '', t0 = performance.now();
  const f = now => { const p = Math.min((now - t0) / 1800, 1); el.textContent = Math.floor(t * (1 - Math.pow(1 - p, 4))).toLocaleString() + s; if (p < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}), { threshold: .5 });

/* ---------- toast ---------- */
let tt; const toast = m => {
  let t = $('.ts'); if (!t) { t = document.createElement('div'); t.className = 'ts'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.textContent = m; t.classList.add('o'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('o'), 3600);
};

/* ---------- filters + calculator tabs (work on any page) ---------- */
document.addEventListener('click', e => {
  const b = e.target.closest('.fb');
  if (b) { $$('.fb').forEach(x => x.classList.remove('on')); b.classList.add('on'); $$('[data-cat]').forEach(c => { const show = b.dataset.f === 'all' || c.dataset.cat === b.dataset.f; c.hidden = !show; if (show) replay(c); }); }
  const t = e.target.closest('.ct');
  if (t) { $$('.ct').forEach(x => x.classList.remove('on')); t.classList.add('on'); $$('.cp').forEach(p => p.classList.toggle('on', p.id === 'c-' + t.dataset.t)); }
});
const n = id => parseFloat($('#' + id).value);
const calcs = {
  bmi() { const w = n('bw'), h = n('bh') / 100; if (!w || !h) return 'Enter a valid weight and height.'; const b = w / (h * h); return `Your BMI is <b>${b.toFixed(1)}</b> (${b < 18.5 ? 'Underweight' : b < 25 ? 'Normal' : b < 30 ? 'Overweight' : 'Obese'})<small>BMI can read high for muscular lifters because it doesn't measure body fat.</small>`; },
  tdee() { const w = n('tw'), h = n('th'), a = n('ta'), m = n('tm'), s = n('ts'); if (!w || !h || !a) return 'Fill in weight, height and age.'; const t = Math.round(((10 * w) + (6.25 * h) - (5 * a) + s) * m); return `Maintenance: <b>${t} kcal/day</b><small>Bulk: ${t + 400} kcal &nbsp;|&nbsp; Cut: ${t - 400} kcal</small>`; },
  orm() { const w = n('ow'), r = n('or'); if (!w || !r) return 'Enter the weight and reps.'; return `Estimated 1RM: <b>${r === 1 ? w : Math.round(w * (1 + r / 30))} kg</b>`; },
  pro() { const w = n('pw'), g = n('pg'); if (!w) return 'Enter your body weight.'; return `Daily protein target: <b>${Math.round(w * g)} g</b>`; }
};

/* ---------- store + cart ---------- */
const P = [
  { id: 1, n: 'Whey Protein Isolate (2kg)', c: 'supplements', p: 4999, d: '100% pure isolate, zero fillers, 28g protein per scoop.' },
  { id: 2, n: 'Pre-Workout Igniter (300g)', c: 'supplements', p: 2499, d: 'Clean energy, sharp focus and a serious pump.' },
  { id: 3, n: 'Creatine Monohydrate (500g)', c: 'supplements', p: 1499, d: 'Micronized creatine for strength and cell hydration.' },
  { id: 4, n: 'Heavy Duty Leather Belt', c: 'gear', p: 3499, d: '10mm lever belt for core pressure and spinal support.' },
  { id: 5, n: 'Calibrated Lifting Straps', c: 'gear', p: 799, d: 'Heavy cotton straps with neoprene padding for big pulls.' },
  { id: 6, n: 'Titanium Knee Sleeves (Pair)', c: 'gear', p: 2299, d: '7mm neoprene sleeves, approved for powerlifting.' },
  { id: 7, n: 'Pumping Iron Oversized Hoodie', c: 'apparel', p: 1999, d: 'Heavyweight fleece for warm-ups and everyday wear.' },
  { id: 8, n: 'Athletic Fitted Stringer', c: 'apparel', p: 899, d: 'Breathable cotton stringer with full range of motion.' }
];
let cart = [], disc = 0;
try { cart = JSON.parse(localStorage.getItem('pi_cart') || '[]'); disc = +localStorage.getItem('pi_disc') || 0; } catch (e) {}
document.body.insertAdjacentHTML('beforeend', `<div class="ov"></div><aside class="dr" aria-label="Shopping cart" aria-hidden="true"><div class="dh"><h3>Your cart</h3><button class="x" aria-label="Close cart">&times;</button></div><div class="di"></div><div class="df"><div class="cb"><input id="cc" placeholder="Promo code (try PUMP10)" aria-label="Promo code"><button class="btn" id="ca">Apply</button></div><div class="tt"><span>Total</span><b id="tot">₹0</b></div><button class="btn p b" id="co2">Checkout</button></div></aside>`);
const ov = $('.ov'), dr = $('.dr');
const drawer = open => { ov.classList.toggle('o', open); dr.classList.toggle('o', open); dr.setAttribute('aria-hidden', !open); };
const draw = () => {
  localStorage.setItem('pi_cart', JSON.stringify(cart)); localStorage.setItem('pi_disc', disc);
  $('.cn').textContent = cart.reduce((s, i) => s + i.qty, 0);
  $('.di').innerHTML = cart.length ? cart.map(i => `<div class="cr2"><div><strong>${i.n}</strong><br><small>${money(i.p)} × ${i.qty}</small></div><div class="qb"><button data-q="${i.id},1" aria-label="Add one">+</button><button data-q="${i.id},-1" aria-label="Remove one">−</button></div></div>`).join('') : '<p style="color:var(--mute);text-align:center;padding:2rem 0">Your cart is empty. Add something from the store.</p>';
  $('#tot').textContent = money(cart.reduce((s, i) => s + i.p * i.qty, 0) * (1 - disc));
};
const bump = () => { const c = $('.cn'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); };
document.addEventListener('click', e => {
  const t = e.target, add = t.closest('[data-add]'), q = t.closest('[data-q]');
  if (add) { const p = P.find(x => x.id == add.dataset.add), ex = cart.find(x => x.id === p.id); ex ? ex.qty++ : cart.push({ id: p.id, n: p.n, p: p.p, qty: 1 }); draw(); bump(); toast(p.n + ' added to cart'); }
  if (q) { const [id, d] = q.dataset.q.split(',').map(Number), it = cart.find(x => x.id === id); if (it) { it.qty += d; if (it.qty <= 0) cart = cart.filter(x => x.id !== id); } draw(); }
  if (t.closest('.cartb')) drawer(true);
  if (t.closest('.dr .x') || t === ov) drawer(false);
  if (t.closest('.md .x') || t.classList.contains('md')) $('.md') && $('.md').remove();
});
$('#ca').onclick = () => { if ($('#cc').value.trim().toUpperCase() === 'PUMP10') { disc = .1; draw(); toast('Promo applied: 10% off'); } else toast('Invalid code. Try PUMP10.'); };
$('#co2').onclick = () => { if (!cart.length) return toast('Your cart is empty.'); cart = []; disc = 0; draw(); drawer(false); toast('Order placed. Thank you!'); }; /* demo checkout: connect a payment provider for real orders */
draw();
window.openCheckout = plan => {
  $('.md') && $('.md').remove();
  document.body.insertAdjacentHTML('beforeend', `<div class="md" role="dialog" aria-modal="true" aria-label="Join ${plan}"><div class="mc"><button class="x" aria-label="Close">&times;</button><h3>Join: ${plan}</h3><p style="margin-bottom:1.4rem">Leave your details and our team will confirm your membership.</p><form><div class="fg"><label for="mn">Full name</label><input id="mn" required></div><div class="fg"><label for="me">Email</label><input id="me" type="email" required></div><div class="fg"><label for="mp">Phone</label><input id="mp" type="tel" required placeholder="+91 98765 43210"></div><button class="btn p b">Request membership</button></form></div></div>`);
  $('.md form').onsubmit = e => { e.preventDefault(); $('.md').remove(); toast('Request received. We will contact you shortly.'); };
  $('#mn').focus();
};
document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; drawer(false); menu(false); $('.md') && $('.md').remove(); });

/* ---------- per-page setup (runs on load and after every page change) ---------- */
const initPage = () => {
  $$('.qt p span').forEach(sp => { if (!$('.w', sp)) sp.innerHTML = sp.textContent.trim().split(/\s+/).map(w => `<i class="w">${w}</i>`).join(' '); });
  $$('.qt .w').forEach((w, i) => w.style.setProperty('--i', i));
  $$('form[data-calc]').forEach(f => f.onsubmit = e => { e.preventDefault(); const r = $('.cr', f); r.innerHTML = calcs[f.dataset.calc](); replay(r); });
  const bt = $('#bt'); if (bt) bt.onchange = () => { $$('.plan').forEach(p => { $('.amt', p).textContent = bt.checked ? p.dataset.a : p.dataset.m; $('.bn', p).hidden = !bt.checked; replay($('.pr', p)); }); };
  $$('.fq button').forEach(b => b.onclick = () => { const o = b.parentElement.classList.toggle('o'); b.setAttribute('aria-expanded', o); });
  $$('form[data-toast]').forEach(f => f.onsubmit = e => { e.preventDefault(); toast(f.dataset.toast); f.reset(); }); /* TODO: connect to Formspree/EmailJS/backend */
  $$('input[type=date]').forEach(i => i.min = new Date().toISOString().split('T')[0]);
  const sg = $('#sg');
  if (sg) sg.innerHTML = P.map((p, i) => `<article class="pc rv" data-cat="${p.c}" style="--d:${i % 4}"><div class="pi"><b>${String(i + 1).padStart(2, '0')}</b><span>${p.c}</span></div><h3>${p.n}</h3><div class="pp">${money(p.p)}</div><p>${p.d}</p><button class="btn p b" data-add="${p.id}">Add to cart</button></article>`).join('');
};
const startReveal = () => { watch(); $$('[data-count]').forEach(el => co.observe(el)); };

/* ---------- page changes: header stays put, each element fades out and the new ones fade up (like the price switch) ---------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const preload = src => { const i = new Image(); i.src = src; return i.decode ? i.decode().catch(() => {}) : Promise.resolve(); };
const norm = p => (p.endsWith('/') ? p + 'index.html' : p);
let curPath = norm(location.pathname), busy = false;
const cache = new Map();
const getPage = href => {
  if (cache.has(href)) return cache.get(href);
  const p = (async () => {
    const r = await fetch(href); if (!r.ok) throw new Error('bad response');
    const doc = new DOMParser().parseFromString(await r.text(), 'text/html'), m = doc.querySelector('main'); if (!m) throw new Error('no main');
    const pics = [...m.innerHTML.matchAll(/url\(([^)]+)\)/g)].map(x => x[1].replace(/["']/g, '')); if (norm(new URL(href).pathname) === norm(new URL('index.html', location.href).pathname)) pics.push('hero.webp');
    await Promise.race([Promise.all(pics.map(preload)), sleep(1500)]);   /* images are ready before the page appears: no pop-in */
    return { html: m.innerHTML, title: doc.title, desc: (doc.querySelector('meta[name="description"]') || {}).content || '' };
  })();
  cache.set(href, p); p.catch(() => cache.delete(href)); return p;
};
const isInternal = a => { if (!a || a.target || a.hasAttribute('download')) return false; const u = new URL(a.href, location.href); return u.origin === location.origin && /(\.html|\/)$/.test(u.pathname); };
const setCurrent = path => $$('.dn a, .mn a').forEach(a => { if (norm(new URL(a.href, location.href).pathname) === path) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
const go = async (href, push) => {
  const url = new URL(href, location.href), path = norm(url.pathname);
  if (busy) return;
  if (path === curPath) { if (push) scrollTo({ top: 0, behavior: 'smooth' }); return; }
  busy = true; root.classList.add('leaving');
  const t0 = performance.now(); let page = null;
  if (location.protocol !== 'file:') { try { page = await getPage(url.href.split('#')[0]); } catch (e) {} }
  if (!page) {   /* plain page load (e.g. opened from disk): carry the highlight over so it still slides on the next page */
    try { const b = indBox(); if (b) sessionStorage.setItem('pi_ind', JSON.stringify(b)); } catch (e) {}
    await sleep(140); location.href = url.href; return;
  }
  try { sessionStorage.removeItem('pi_ind'); } catch (e) {}
  setCurrent(path); lastSlide = performance.now(); setInd(indBox(), true);   /* the highlight starts sliding right away */
  await sleep(Math.max(0, 140 - (performance.now() - t0)));
  /* swap while everything is invisible, so nothing is ever seen jumping into place */
  $('main').innerHTML = page.html; document.title = page.title;
  const md = $('meta[name="description"]'); if (md) md.content = page.desc;
  curPath = path; if (push) history.pushState({}, '', url.href);
  menu(false); scrollTo({ top: 0, behavior: 'instant' }); initPage(); measure(); onS();
  $$('main > .hero, main > .ph').forEach(el => el.classList.add('pop'));
  root.classList.remove('leaving'); void $('main').offsetHeight;
  $$('main .rv').forEach(el => { if (el.getBoundingClientRect().top < innerHeight * .98) el.classList.add('in'); });
  startReveal(); busy = false;
};
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !isInternal(a)) return;
  const u = new URL(a.href, location.href);
  if (u.hash && norm(u.pathname) === curPath) return;
  e.preventDefault(); go(u.href, true);
});
const warm = e => { const a = e.target.closest && e.target.closest('a[href]'); if (a && isInternal(a)) getPage(new URL(a.href, location.href).href.split('#')[0]).catch(() => {}); };
document.addEventListener('pointerover', warm); document.addEventListener('touchstart', warm, { passive: true });
addEventListener('popstate', () => go(location.href, false));
addEventListener('pageshow', e => { if (e.persisted) root.classList.remove('leaving'); });
addEventListener('load', () => ['hero.webp', 'img-lifter.webp', 'img-sled.webp', 'img-squat.webp', 'img-plate.webp', 'img-boxer.webp', 'img-lat.webp', 'img-physique.webp'].forEach(preload));

initPage(); measure(); onS(); requestAnimationFrame(startReveal);
})();
