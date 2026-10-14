(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
/* theme: follows the device unless the visitor picks one with the toggle */
const root = document.documentElement, mq = matchMedia('(prefers-color-scheme:dark)');
const saved = () => { try { return localStorage.getItem('pi_theme'); } catch (e) { return null; } };
const setTheme = () => {
  const t = saved() || (mq.matches ? 'dark' : 'light'); root.dataset.theme = t;
  $$('.tg').forEach(b => { b.setAttribute('aria-pressed', t === 'dark'); b.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); });
  const m = $('meta[name=theme-color]'); if (m) m.content = t === 'dark' ? '#000000' : '#F5F5F7';
};
mq.addEventListener('change', () => { if (!saved()) setTheme(); });
document.addEventListener('click', e => {
  if (!e.target.closest('.tg')) return;
  root.classList.add('tx'); setTimeout(() => root.classList.remove('tx'), 600);
  try { localStorage.setItem('pi_theme', root.dataset.theme === 'dark' ? 'light' : 'dark'); } catch (err) {}
  setTheme();
});
setTheme();
/* hero card eases back as you scroll, like a product page */
const heroEl = $('.hero');
if (heroEl) { const hp = () => heroEl.style.setProperty('--p', Math.min(1, scrollY / innerHeight).toFixed(3)); addEventListener('scroll', hp, { passive: true }); hp(); }

const replay = el => { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); };

/* header + mobile menu */
const hd = $('.hd'), onS = () => hd.classList.toggle('s', scrollY > 40);
onS(); addEventListener('scroll', onS, { passive: true });
const mt = $('.mt'), mn = $('.mn');
const menu = open => { mn.classList.toggle('o', open); mt.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : ''; mt.classList.toggle('o', open); };
mt.onclick = () => menu(!mn.classList.contains('o'));

/* scroll reveal + counters */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
const watch = () => $$('.rv:not(.in)').forEach(el => io.observe(el)); watch();
const co = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; co.unobserve(e.target);
  const el = e.target, t = +el.dataset.count, s = el.dataset.suf || '', t0 = performance.now();
  const f = now => { const p = Math.min((now - t0) / 1800, 1); el.textContent = Math.floor(t * (1 - Math.pow(1 - p, 4))).toLocaleString() + s; if (p < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}), { threshold: .5 });
$$('[data-count]').forEach(el => co.observe(el));

/* card spotlight follows cursor */
document.addEventListener('pointermove', e => {
  const c = e.target.closest && e.target.closest('.card'); if (!c) return;
  const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px');
});

/* toast */
let tt; const toast = m => {
  let t = $('.ts'); if (!t) { t = document.createElement('div'); t.className = 'ts'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.textContent = m; t.classList.add('o'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('o'), 3600);
};

/* filters (classes + store) */
document.addEventListener('click', e => {
  const b = e.target.closest('.fb'); if (!b) return;
  $$('.fb').forEach(x => x.classList.remove('on')); b.classList.add('on');
  $$('[data-cat]').forEach(c => { const show = b.dataset.f === 'all' || c.dataset.cat === b.dataset.f; c.hidden = !show; if (show) replay(c); });
});

/* calculators */
document.addEventListener('click', e => {
  const t = e.target.closest('.ct'); if (!t) return;
  $$('.ct').forEach(x => x.classList.remove('on')); t.classList.add('on');
  $$('.cp').forEach(p => p.classList.toggle('on', p.id === 'c-' + t.dataset.t));
});
const n = id => parseFloat($('#' + id).value);
const calcs = {
  bmi() { const w = n('bw'), h = n('bh') / 100; if (!w || !h) return 'Enter a valid weight and height.'; const b = w / (h * h); return `Your BMI is <b>${b.toFixed(1)}</b> (${b < 18.5 ? 'Underweight' : b < 25 ? 'Normal' : b < 30 ? 'Overweight' : 'Obese'})<small>BMI can read high for muscular lifters because it doesn't measure body fat.</small>`; },
  tdee() { const w = n('tw'), h = n('th'), a = n('ta'), m = n('tm'), s = n('ts'); if (!w || !h || !a) return 'Fill in weight, height and age.'; const t = Math.round(((10 * w) + (6.25 * h) - (5 * a) + s) * m); return `Maintenance: <b>${t} kcal/day</b><small>Bulk: ${t + 400} kcal &nbsp;|&nbsp; Cut: ${t - 400} kcal</small>`; },
  orm() { const w = n('ow'), r = n('or'); if (!w || !r) return 'Enter the weight and reps.'; return `Estimated 1RM: <b>${r === 1 ? w : Math.round(w * (1 + r / 30))} kg</b>`; },
  pro() { const w = n('pw'), g = n('pg'); if (!w) return 'Enter your body weight.'; return `Daily protein target: <b>${Math.round(w * g)} g</b>`; }
};
$$('form[data-calc]').forEach(f => f.onsubmit = e => { e.preventDefault(); const r = $('.cr', f); r.innerHTML = calcs[f.dataset.calc](); replay(r); });

/* billing toggle */
const bt = $('#bt');
if (bt) bt.onchange = () => { $$('.plan').forEach(p => { $('.amt', p).textContent = bt.checked ? p.dataset.a : p.dataset.m; $('.bn', p).hidden = !bt.checked; replay($('.pr', p)); }); };

/* FAQ */
$$('.fq button').forEach(b => b.onclick = () => { const o = b.parentElement.classList.toggle('o'); b.setAttribute('aria-expanded', o); });

/* forms + dates */
$$('form[data-toast]').forEach(f => f.onsubmit = e => { e.preventDefault(); toast(f.dataset.toast); f.reset(); }); /* TODO: connect to Formspree/EmailJS/backend */
$$('input[type=date]').forEach(i => i.min = new Date().toISOString().split('T')[0]);

/* store products */
const P = [
  { id: 1, n: 'Whey Protein Isolate (2kg)', c: 'supplements', p: 4999, i: 'fa-bottle-dropper', d: '100% pure isolate, zero fillers, 28g protein per scoop.' },
  { id: 2, n: 'Pre-Workout Igniter (300g)', c: 'supplements', p: 2499, i: 'fa-bolt', d: 'Clean energy, sharp focus and a serious pump.' },
  { id: 3, n: 'Creatine Monohydrate (500g)', c: 'supplements', p: 1499, i: 'fa-jar', d: 'Micronized creatine for strength and cell hydration.' },
  { id: 4, n: 'Heavy Duty Leather Belt', c: 'gear', p: 3499, i: 'fa-shield', d: '10mm lever belt for core pressure and spinal support.' },
  { id: 5, n: 'Calibrated Lifting Straps', c: 'gear', p: 799, i: 'fa-link', d: 'Heavy cotton straps with neoprene padding for big pulls.' },
  { id: 6, n: 'Titanium Knee Sleeves (Pair)', c: 'gear', p: 2299, i: 'fa-socks', d: '7mm neoprene sleeves, approved for powerlifting.' },
  { id: 7, n: 'Pumping Iron Oversized Hoodie', c: 'apparel', p: 1999, i: 'fa-shirt', d: 'Heavyweight fleece for warm-ups and everyday wear.' },
  { id: 8, n: 'Athletic Fitted Stringer', c: 'apparel', p: 899, i: 'fa-vest', d: 'Breathable cotton stringer with full range of motion.' }
];
const sg = $('#sg');
if (sg) { sg.innerHTML = P.map((p, i) => `<article class="pc rv" data-cat="${p.c}" style="--d:${i % 4}"><div class="pi"><b>${String(i + 1).padStart(2, '0')}</b><span>${p.c}</span></div><h3>${p.n}</h3><div class="pp">${money(p.p)}</div><p>${p.d}</p><button class="btn p b" data-add="${p.id}">Add to cart</button></article>`).join(''); watch(); }

/* cart (saved in the browser, shared across all pages) */
let cart = [], disc = 0;
try { cart = JSON.parse(localStorage.getItem('pi_cart') || '[]'); disc = +localStorage.getItem('pi_disc') || 0; } catch (e) {}
document.body.insertAdjacentHTML('beforeend', `<div class="ov"></div><aside class="dr" aria-label="Shopping cart" aria-hidden="true"><div class="dh"><h3>Your cart</h3><button class="x" aria-label="Close cart">&times;</button></div><div class="di"></div><div class="df"><div class="cb"><input id="cc" placeholder="Promo code (try PUMP10)" aria-label="Promo code"><button class="btn" id="ca">Apply</button></div><div class="tt"><span>Total</span><b id="tot">₹0</b></div><button class="btn p b" id="co2">Checkout</button></div></aside>`);
const ov = $('.ov'), dr = $('.dr');
const drawer = open => { ov.classList.toggle('o', open); dr.classList.toggle('o', open); dr.setAttribute('aria-hidden', !open); };
const draw = () => {
  localStorage.setItem('pi_cart', JSON.stringify(cart)); localStorage.setItem('pi_disc', disc);
  const q = cart.reduce((s, i) => s + i.qty, 0), cn = $('.cn'); cn.textContent = q; cn.hidden = !q;
  $('.di').innerHTML = cart.length ? cart.map(i => `<div class="cr2"><div><strong>${i.n}</strong><br><small>${money(i.p)} × ${i.qty}</small></div><div class="qb"><button data-q="${i.id},1" aria-label="Add one">+</button><button data-q="${i.id},-1" aria-label="Remove one">−</button></div></div>`).join('') : '<p style="color:var(--muted);text-align:center;padding:2rem 0">Your cart is empty. Add something from the store.</p>';
  $('#tot').textContent = money(cart.reduce((s, i) => s + i.p * i.qty, 0) * (1 - disc));
};
const bump = () => { const c = $('.cn'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); };
document.addEventListener('click', e => {
  const t = e.target;
  const add = t.closest('[data-add]'), q = t.closest('[data-q]');
  if (add) { const p = P.find(x => x.id == add.dataset.add), ex = cart.find(x => x.id === p.id); ex ? ex.qty++ : cart.push({ id: p.id, n: p.n, p: p.p, qty: 1 }); draw(); bump(); toast(p.n + ' added to cart'); }
  if (q) { const [id, d] = q.dataset.q.split(',').map(Number), it = cart.find(x => x.id === id); if (it) { it.qty += d; if (it.qty <= 0) cart = cart.filter(x => x.id !== id); } draw(); }
  if (t.closest('.cartb')) drawer(true);
  if (t.closest('.dr .x') || t === ov) drawer(false);
  if (t.closest('.md .x') || t.classList.contains('md')) $('.md') && $('.md').remove();
});
$('#ca').onclick = () => { if ($('#cc').value.trim().toUpperCase() === 'PUMP10') { disc = .1; draw(); toast('Promo applied: 10% off'); } else toast('Invalid code. Try PUMP10.'); };
$('#co2').onclick = () => { if (!cart.length) return toast('Your cart is empty.'); cart = []; disc = 0; draw(); drawer(false); toast('Order placed. Thank you!'); }; /* demo checkout: connect a payment provider for real orders */
draw();

/* membership signup modal (called from the Select plan buttons) */
window.openCheckout = plan => {
  $('.md') && $('.md').remove();
  document.body.insertAdjacentHTML('beforeend', `<div class="md" role="dialog" aria-modal="true" aria-label="Join ${plan}"><div class="card mc"><button class="x" aria-label="Close">&times;</button><h3>Join: ${plan}</h3><p style="margin-bottom:1.4rem">Leave your details and our team will confirm your membership.</p><form><div class="fg"><label for="mn">Full name</label><input id="mn" required></div><div class="fg"><label for="me">Email</label><input id="me" type="email" required></div><div class="fg"><label for="mp">Phone</label><input id="mp" type="tel" required placeholder="+91 98765 43210"></div><button class="btn p b">Request membership</button></form></div></div>`);
  $('.md form').onsubmit = e => { e.preventDefault(); $('.md').remove(); toast('Request received. We will contact you shortly.'); };
  $('#mn').focus();
};

document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; drawer(false); menu(false); $('.md') && $('.md').remove(); });
$$('.mn a').forEach(a => a.addEventListener('click', () => menu(false)));
})();
