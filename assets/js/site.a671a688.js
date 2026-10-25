const d = document, root = d.documentElement, body = d.body;
root.classList.add('js');
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, el = d) => el.querySelector(s), $$ = (s, el = d) => [...el.querySelectorAll(s)];
const io = (cb, opt) => new IntersectionObserver(es => es.forEach(cb), opt);
function playTrailer(a) {
const id = a.dataset.yt, f = d.createElement('iframe');
f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
f.title = 'HALDEN reveal trailer (cinematic)';
f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
f.allowFullscreen = true;
f.referrerPolicy = 'strict-origin-when-cross-origin';
a.replaceWith(f);
f.focus({ preventScroll: true });
}
$$('[data-yt]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); playTrailer(a); }));
$$('[data-play="trailer"]').forEach(b => b.addEventListener('click', e => {
const fr = $('#trailer .trailer__frame'), fac = $('#trailer [data-yt]');
if (!fr) return;
e.preventDefault();
const room = innerHeight - 64 - (matchMedia('(max-width: 63.99rem)').matches ? 72 : 0) - 16;
fr.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: fr.offsetHeight > room ? 'start' : 'center' });
if (fac) playTrailer(fac);
}));
const lb = $('#lightbox');
if (lb) {
const items = $$('[data-lb]'), img = $('img', lb), src = $('source', lb), cap = $('#lb-alt'), cnt = $('#lb-count');
const prev = $('.lb-prev', lb), next = $('.lb-next', lb), n = items.length;
let i = 0, trigger = null;
const show = k => {
i = (k + n) % n;
const a = items[i];
if (src) src.srcset = a.dataset.avif || '';
img.src = a.href;
img.alt = a.dataset.alt;
img.width = +a.dataset.w; img.height = +a.dataset.h;
cap.textContent = a.dataset.alt;
cnt.textContent = `${i + 1} / ${n}`;
prev.setAttribute('aria-label', `Previous image (${(i - 1 + n) % n + 1} of ${n})`);
next.setAttribute('aria-label', `Next image (${(i + 1) % n + 1} of ${n})`);
};
items.forEach((a, k) => a.addEventListener('click', e => {
e.preventDefault(); trigger = a; show(k); lb.showModal();
}));
prev.addEventListener('click', () => show(i - 1));
next.addEventListener('click', () => show(i + 1));
$('.lb-close', lb).addEventListener('click', () => lb.close());
lb.addEventListener('keydown', e => {
if (e.key === 'ArrowLeft') { e.preventDefault(); show(i - 1); }
if (e.key === 'ArrowRight') { e.preventDefault(); show(i + 1); }
});
lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lightbox__inner')) lb.close(); });
lb.addEventListener('close', () => { trigger && trigger.focus(); });
}
if (!RM && 'IntersectionObserver' in window) {
const els = $$('[data-reveal]');
const ob = io(e => {
if (e.isIntersecting) { e.target.classList.remove('pre'); e.target.classList.add('is-in'); ob.unobserve(e.target); }
}, { rootMargin: '0px 0px -8% 0px' });
const vh = innerHeight;
els.forEach(el => { if (el.getBoundingClientRect().top > vh) { el.classList.add('pre'); ob.observe(el); } });
d.addEventListener('focusin', e => {
for (let el = e.target.closest('.pre'); el; el = el.parentElement && el.parentElement.closest('.pre')) {
el.classList.remove('pre'); el.classList.add('is-in'); ob.unobserve(el);
}
});
}
const themed = $$('[data-theme-section]');
if (themed.length) {
const tob = io(e => { if (e.isIntersecting) body.dataset.theme = e.target.dataset.themeSection; },
{ rootMargin: '-49% 0px -49% 0px' });
themed.forEach(s => tob.observe(s));
}
const spine = $('.spine');
if (spine) {
const links = $$('a', spine), byId = new Map(links.map(a => [a.hash.slice(1), a]));
const order = links.map(a => a.hash.slice(1));
const setActive = id => {
const k = order.indexOf(id);
links.forEach((a, j) => { a.classList.toggle('is-active', j === k); a.classList.toggle('is-passed', j < k); });
links.forEach(a => a.removeAttribute('aria-current'));
if (byId.get(id)) byId.get(id).setAttribute('aria-current', 'location');
};
const sob = io(e => { if (e.isIntersecting) setActive(e.target.id); }, { rootMargin: '-45% 0px -54% 0px' });
order.forEach(id => { const s = d.getElementById(id); s && sob.observe(s); });
if (RM || !CSS.supports('animation-timeline: scroll()')) {
let q = 0;
const upd = () => {
q = 0;
const max = root.scrollHeight - innerHeight;
spine.style.setProperty('--climb', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
};
addEventListener('scroll', () => { if (!q) q = requestAnimationFrame(upd); }, { passive: true });
upd();
}
}
const header = $('.site-header'), sentinel = $('.hero-sentinel'), hero = $('.hero'), dock = $('.dock');
if (header && sentinel) io(e => header.classList.toggle('is-solid', !e.isIntersecting)).observe(sentinel);
if (dock && hero) {
io(e => {
const show = !e.isIntersecting;
dock.classList.toggle('is-shown', show);
body.classList.toggle('has-dock', show);
dock.inert = !show;
}).observe(hero);
dock.inert = true;
}
const mb = $('.menu-btn'), panel = $('#nav-panel'), scrim = $('.nav-scrim');
if (mb && panel) {
const set = open => {
mb.setAttribute('aria-expanded', open); panel.classList.toggle('is-open', open);
header.classList.toggle('menu-open', open); root.classList.toggle('menu-open', open);
};
mb.addEventListener('click', () => set(mb.getAttribute('aria-expanded') !== 'true'));
d.addEventListener('keydown', e => {
if (e.key === 'Escape' && mb.getAttribute('aria-expanded') === 'true') { set(false); mb.focus(); }
});
$$('a', panel).forEach(a => a.addEventListener('click', () => set(false)));
if (scrim) scrim.addEventListener('click', () => { set(false); mb.focus(); });
matchMedia('(min-width: 64rem)').addEventListener('change', q => { if (q.matches) set(false); });
}
const meter = $('.meter');
if (meter) {
if (RM) meter.classList.add('is-filled', 'is-surged');
else {
const mo = io(e => {
if (!e.isIntersecting) return;
mo.disconnect();
meter.classList.add('is-filled');
setTimeout(() => meter.classList.add('is-surged'), 900);
}, { threshold: .6 });
mo.observe(meter);
}
}
if (location.hash.length > 1) {
const t = d.getElementById(decodeURIComponent(location.hash.slice(1)));
let user = false;
['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(ev => addEventListener(ev, () => { user = true; }, { once: true, passive: true }));
const align = () => {
if (!t || user) return;
const pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0, dy = t.getBoundingClientRect().top - pad;
if (Math.abs(dy) > 2) scrollBy({ top: dy, behavior: 'instant' });
};
d.fonts.ready.then(() => requestAnimationFrame(align));
addEventListener('load', () => requestAnimationFrame(align), { once: true });
}
$$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
const src = d.getElementById(b.dataset.copy);
try {
await navigator.clipboard.writeText(src.textContent.trim());
const t = b.textContent; b.textContent = 'Copied';
setTimeout(() => { b.textContent = t; }, 2000);
} catch (_) { /* clipboard unavailable: the text stays selectable */ }
}));
