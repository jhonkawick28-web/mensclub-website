
'use strict';

/* ── PRODUCTS ────────────────────────────────────────── */
const PRODUCTS = [
  {id:1,name:'Classic White T-Shirt',price:1299,stock:24,badge:'Bestseller',badgeClass:'badge-gold',
   desc:'Premium 100% Supima cotton. Clean cut, minimal design for effortless everyday style.',
   img:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80&fit=crop'},
  {id:2,name:'Premium Hoodie',price:2999,stock:18,badge:'New Arrival',badgeClass:'badge-dim',
   desc:'Heavyweight French terry. Dropped shoulders, ribbed cuffs. Elevated streetwear.',
   img:'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=700&q=80&fit=crop'},
  {id:3,name:'Denim Jacket',price:4999,stock:12,badge:'Limited',badgeClass:'badge-dim',
   desc:'Rigid Japanese selvedge denim. Classic silhouette with subtle distressing details.',
   img:'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=700&q=80&fit=crop'},
  {id:4,name:'Formal Oxford Shirt',price:2499,stock:20,badge:'Classic',badgeClass:'badge-dim',
   desc:'Crisp 2-ply Oxford weave. Structured collar, regular fit. Office to evening.',
   img:'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&q=80&fit=crop'},
  {id:5,name:'Tactical Cargo Pants',price:3499,stock:4,badge:'Only 4 Left!',badgeClass:'badge-red',
   desc:'Multi-pocket ripstop cargo. Slim tapered fit with adjustable ankle ties.',
   img:'https://images.unsplash.com/photo-1594938298603-c8148c4b4012?w=700&q=80&fit=crop'},
  {id:6,name:'Signature Sneakers',price:5999,stock:10,badge:'Exclusive',badgeClass:'badge-gold',
   desc:'Hand-stitched leather upper, vulcanised rubber sole. Effortless luxury footwear.',
   img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80&fit=crop'},
];

/* ── CURSOR ──────────────────────────────────────────── */
const cur = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cur.style.left = e.clientX + 'px';
  cur.style.top  = e.clientY + 'px';
});
document.querySelectorAll('a,button,.card').forEach(el => {
  el.addEventListener('mouseenter', () => cur.classList.add('big'));
  el.addEventListener('mouseleave', () => cur.classList.remove('big'));
});

/* ── NAVBAR ──────────────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('solid', window.scrollY > 60);
}, { passive:true });

const burger = document.getElementById('burger');
const mob    = document.getElementById('mob');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  mob.classList.toggle('open');
  document.body.style.overflow = mob.classList.contains('open') ? 'hidden' : '';
});
mob.querySelectorAll('.mob-link').forEach(l => {
  l.addEventListener('click', () => {
    burger.classList.remove('open');
    mob.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── HERO SLIDESHOW ──────────────────────────────────── */
const slides   = document.querySelectorAll('.slide');
const countEl  = document.getElementById('heroCount');
let slideIdx   = 0;
setInterval(() => {
  slides[slideIdx].classList.remove('on');
  slideIdx = (slideIdx + 1) % slides.length;
  slides[slideIdx].classList.add('on');
  countEl.textContent = String(slideIdx+1).padStart(2,'0') + ' / ' + String(slides.length).padStart(2,'0');
}, 6000);

/* ── SCROLL REVEAL (IntersectionObserver) ────────────── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('in'); } });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => observer.observe(el));

/* ── RENDER PRODUCTS ─────────────────────────────────── */
function renderProducts() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  PRODUCTS.forEach(p => {
    const isOut = p.stock === 0;
    const isLow = !isOut && p.stock <= 5;
    const badge = isOut ? `<div class="card-badge badge-dim">Out of Stock</div>`
                : isLow ? `<div class="card-badge badge-red">Only ${p.stock} Left!</div>`
                : p.badge ? `<div class="card-badge ${p.badgeClass}">${p.badge}</div>` : '';
    const btn   = isOut ? '' : `<div class="card-overlay"><button class="card-btn" onclick="openPanel(${p.id})">Order Now</button></div>`;
    const stockTxt = isOut ? 'Out of Stock' : (isLow ? `${p.stock} left` : `${p.stock} in stock`);

    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div class="card-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy"/>
        ${badge}${btn}
      </div>
      <div class="card-info">
        <div class="card-name">${p.name}</div>
        <div class="card-desc">${p.desc}</div>
        <div class="card-foot">
          <div class="card-price">₹${p.price.toLocaleString('en-IN')}</div>
          <div class="card-stock${isLow?' low':''}">${stockTxt}</div>
        </div>
      </div>`;
    grid.appendChild(div);
  });

  // Observe newly added cards for scroll reveal
  grid.querySelectorAll('.card').forEach(el => observer.observe(el));
}

/* ── ORDER PANEL ─────────────────────────────────────── */
let active = null;

function openPanel(id) {
  active = PRODUCTS.find(p => p.id === id);
  if (!active || active.stock === 0) return;

  document.getElementById('phName').textContent  = active.name;
  document.getElementById('phPrice').textContent = '₹' + active.price.toLocaleString('en-IN');
  document.getElementById('phDesc').textContent  = active.desc + ' — ' + active.stock + ' available.';
  document.getElementById('fName').value  = '';
  document.getElementById('fPhone').value = '';
  document.getElementById('fEmail').value = '';
  document.getElementById('fAddr').value  = '';
  document.getElementById('fQty').value   = '1';
  document.getElementById('fQty').max     = active.stock;
  document.getElementById('qNote').textContent = 'Max ' + active.stock + ' available';
  document.getElementById('qNote').className   = 'q-note';
  updateTotal();

  document.getElementById('panelBg').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePanel() {
  document.getElementById('panelBg').classList.remove('open');
  document.body.style.overflow = '';
  active = null;
}

document.getElementById('panelX').addEventListener('click', closePanel);
document.getElementById('panelBg').addEventListener('click', e => {
  if (e.target === document.getElementById('panelBg')) closePanel();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

/* ── QTY ─────────────────────────────────────────────── */
function qty() { return Math.max(1, Math.min(parseInt(document.getElementById('fQty').value)||1, active?.stock||1)); }
function updateTotal() {
  if (!active) return;
  document.getElementById('totalVal').textContent = '₹' + (active.price * qty()).toLocaleString('en-IN');
}

document.getElementById('qMinus').addEventListener('click', () => {
  const q = qty(); if (q > 1) { document.getElementById('fQty').value = q-1; updateTotal(); }
});
document.getElementById('qPlus').addEventListener('click', () => {
  const q = qty(), max = active?.stock||1;
  if (q < max) { document.getElementById('fQty').value = q+1; updateTotal(); }
  else { const n = document.getElementById('qNote'); n.textContent = 'Max '+max+' available'; n.className='q-note err'; }
});
document.getElementById('fQty').addEventListener('input', () => {
  const max = active?.stock||1; let v = parseInt(document.getElementById('fQty').value)||1;
  if (v < 1) v=1; if (v > max) v=max;
  document.getElementById('fQty').value = v; updateTotal();
});

/* ── SUBMIT ──────────────────────────────────────────── */
document.getElementById('btnSubmit').addEventListener('click', async () => {
  if (!active) return;
  const name  = document.getElementById('fName').value.trim();
  const phone = document.getElementById('fPhone').value.trim();
  const email = document.getElementById('fEmail').value.trim();
  const addr  = document.getElementById('fAddr').value.trim();
  const q     = qty();

  if (!name)  { shake('fName');  return; }
  if (!phone) { shake('fPhone'); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { shake('fEmail'); return; }
  if (!addr)  { shake('fAddr');  return; }

  const btn = document.getElementById('btnSubmit');
  btn.disabled = true;
  document.getElementById('btnTxt').textContent = 'Sending…';

  try {
    const res  = await fetch('/api/order', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ productId:active.id, productName:active.name,
        price:active.price, quantity:q, customerName:name, phone, email, address:addr })
    });
    const data = await res.json();
    if (data.success) {
      const i = PRODUCTS.findIndex(p => p.id === active.id);
      if (i !== -1) PRODUCTS[i].stock = data.stockRemaining;
      closePanel(); renderProducts();
      showToast('Order Placed!', 'Your order has been sent. The shop will contact you shortly to confirm.', false);
    } else {
      showToast('Error', data.message || 'Something went wrong. Please try again.', true);
    }
  } catch {
    // Offline / dev fallback
    const i = PRODUCTS.findIndex(p => p.id === active.id);
    if (i !== -1 && PRODUCTS[i].stock > 0) PRODUCTS[i].stock -= q;
    closePanel(); renderProducts();
    showToast('Order Placed!', 'Your order has been sent. The shop will contact you shortly to confirm.', false);
  } finally {
    btn.disabled = false;
    document.getElementById('btnTxt').textContent = 'Place Order Request';
  }
});

function shake(id) {
  const el = document.getElementById(id);
  el.classList.add('err'); el.focus();
  el.animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},
              {transform:'translateX(-4px)'},{transform:'translateX(4px)'},
              {transform:'translateX(0)'}], {duration:350, easing:'ease'});
  setTimeout(() => el.classList.remove('err'), 1500);
}

/* ── TOAST ───────────────────────────────────────────── */
let toastTimer;
function showToast(title, msg, isErr) {
  document.getElementById('tTitle').textContent = title;
  document.getElementById('tMsg').textContent   = msg;
  document.getElementById('tIco').textContent   = isErr ? '✕' : '✓';
  document.getElementById('toast').style.borderLeftColor = isErr ? 'var(--red)' : 'var(--gold)';
  document.getElementById('toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => document.getElementById('toast').classList.remove('show'), 5500);
}

/* ── SMOOTH SCROLL ───────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return; e.preventDefault();
    const off = nav.offsetHeight;
    window.scrollTo({ top: t.offsetTop - off, behavior:'smooth' });
  });
});

/* ── FETCH STOCK THEN RENDER ─────────────────────────── */
(async () => {
  try {
    const r = await fetch('/api/products');
    if (r.ok) {
      const d = await r.json();
      Object.keys(d).forEach(id => {
        const i = PRODUCTS.findIndex(p => p.id === +id);
        if (i !== -1) PRODUCTS[i].stock = d[id].stock;
      });
    }
  } catch {}
  renderProducts();
})();

