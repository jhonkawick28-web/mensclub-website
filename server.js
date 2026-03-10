const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── CONFIG — update these 3 lines ──────────────────────
const EMAIL_USER = "jhonkawick28@gmail.com";
const EMAIL_PASS = "btztinxcxgmshlgr";
const SHOP_EMAIL = "jhonkawick28@gmail.com";
// ── STOCK (resets on server restart) ───────────────────
const stock = {
  1: { name: 'Classic White T-Shirt', price: 1299, qty: 24 },
  2: { name: 'Premium Hoodie', price: 2999, qty: 18 },
  3: { name: 'Denim Jacket', price: 4999, qty: 12 },
  4: { name: 'Formal Oxford Shirt', price: 2499, qty: 20 },
  5: { name: 'Tactical Cargo Pants', price: 3499, qty: 4 },
  6: { name: 'Signature Sneakers', price: 5999, qty: 10 },
  7: { name: 'Rolex Watch', price: 35999, qty: 5 },
};

app.get('/api/products', (_, res) => {
  const out = {};
  Object.entries(stock).forEach(([id, p]) => { out[id] = { name: p.name, stock: p.qty, price: p.price }; });
  res.json(out);
});

app.post('/api/order', async (req, res) => {
  const { productId, productName, price, quantity, customerName, phone, email, address } = req.body;

  if (!productId || !quantity || !customerName || !phone || !email || !address)
    return res.status(400).json({ success: false, message: 'All fields are required.' });

  const item = stock[productId];
  if (!item) return res.status(404).json({ success: false, message: 'Product not found.' });

  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty < 1 || qty > item.qty)
    return res.status(400).json({ success: false, message: `Only ${item.qty} item(s) in stock.` });

  item.qty -= qty;

  const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' });
  const total = (price * qty).toLocaleString('en-IN');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Georgia',serif;background:#f0ede8}
.w{max-width:600px;margin:32px auto;background:#fff}
.h{background:#080808;padding:52px;text-align:center}
.h h1{font-family:Georgia,serif;font-size:32px;letter-spacing:12px;font-weight:300;color:#fff;margin-bottom:6px}
.h p{font-size:9px;letter-spacing:5px;text-transform:uppercase;color:#888}
.badge{display:inline-block;background:#c9a84c;color:#000;font-size:9px;letter-spacing:3px;padding:7px 20px;margin-top:20px;text-transform:uppercase;font-family:Arial,sans-serif}
.b{padding:44px}
.sec{font-size:8px;letter-spacing:5px;text-transform:uppercase;color:#c9a84c;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif}
.row{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid #faf9f7}
.lb{font-size:12px;color:#999;letter-spacing:.5px;font-family:Arial,sans-serif}
.vl{font-size:14px;font-weight:bold;color:#080808;text-align:right}
.vl a{color:#080808;text-decoration:none}
.total{background:#080808;padding:28px;text-align:center;margin:28px 0}
.total .amt{font-size:36px;letter-spacing:3px;color:#c9a84c;font-family:Georgia,serif}
.total .lbl{font-size:8px;letter-spacing:5px;color:#666;text-transform:uppercase;margin-top:5px;font-family:Arial,sans-serif}
.ft{background:#faf9f7;padding:24px 44px;text-align:center;border-top:1px solid #ede9e0}
.ft p{font-size:11px;color:#aaa;line-height:1.9;font-family:Arial,sans-serif}
.cta{display:inline-block;background:#080808;color:#fff;font-size:8px;letter-spacing:4px;padding:6px 14px;margin-bottom:10px;font-family:Arial,sans-serif;text-transform:uppercase}
</style></head><body>
<div class="w">
  <div class="h">
    <h1>MENS CLUB</h1>
    <p>Premium Men's Fashion</p>
    <div class="badge">📦 New Order Request</div>
  </div>
  <div class="b">
    <div class="sec">Order Details</div>
    <div class="row"><span class="lb">Product</span><span class="vl">${productName}</span></div>
    <div class="row"><span class="lb">Unit Price</span><span class="vl">₹${price}</span></div>
    <div class="row"><span class="lb">Quantity</span><span class="vl">${qty} pcs</span></div>
    <div class="row"><span class="lb">Stock Remaining</span><span class="vl">${item.qty} left</span></div>
    <div class="row"><span class="lb">Order Time</span><span class="vl">${time}</span></div>
    <div class="total">
      <div class="amt">₹${total}</div>
      <div class="lbl">Total Order Value</div>
    </div>
    <div class="sec">Customer Details</div>
    <div class="row"><span class="lb">Name</span><span class="vl">${customerName}</span></div>
    <div class="row"><span class="lb">Phone</span><span class="vl">${phone}</span></div>
    <div class="row"><span class="lb">Email</span><span class="vl"><a href="mailto:${email}">${email}</a></span></div>
    <div class="row"><span class="lb">Address</span><span class="vl" style="max-width:280px">${address}</span></div>
  </div>
  <div class="ft">
    <div class="cta">⚡ Action Required</div>
    <p>Call or email the customer to confirm &amp; arrange home delivery.<br/>
    Replying to this email will go directly to the customer.</p>
    <p style="margin-top:10px;color:#ccc">MENS CLUB · mensclubshop@gmail.com</p>
  </div>
</div></body></html>`;

  try {
    const t = nodemailer.createTransport({ service: 'gmail', auth: { user: EMAIL_USER, pass: EMAIL_PASS } });
    await t.sendMail({
      from: `"MENS CLUB Orders" <${EMAIL_USER}>`,
      to: SHOP_EMAIL,
      replyTo: email,
      subject: `🛍️ New Order — ${productName} × ${qty} | MENS CLUB`,
      html,
    });
    console.log(`✅  ${productName} ×${qty}  |  ${customerName}  |  ${email}  |  ${phone}`);
  } catch (err) {
    console.error('⚠️  Email failed:', err.message);
  }

  res.json({ success: true, message: 'Your order request has been sent. The shop will contact you soon.', stockRemaining: item.qty });
});

app.listen(PORT, () => {
  console.log('\n  ╔══════════════════════════════════╗');
  console.log('  ║   M E N S   C L U B             ║');
  console.log('  ║   Premium Men\'s Fashion          ║');
  console.log('  ╚══════════════════════════════════╝');
  console.log(`\n  → http://localhost:${PORT}`);
  console.log(`  → Orders sent to: ${SHOP_EMAIL}\n`);
  if (EMAIL_PASS === 'your_gmail_app_password')
    console.log('  ⚠️   Update EMAIL_PASS in server.js to enable emails!\n');
});
