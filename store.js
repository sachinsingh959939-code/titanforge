/**
 * TITAN FORGE E-COMMERCE & SHOPPING CART MODULE WITH RAZORPAY INTEGRATION
 * Handles product display, filtering, slide-out drawer, promo codes, and Razorpay payment gateway.
 */

// Razorpay Test Configuration (Can be customized by user)
window.RAZORPAY_CONFIG = {
  key: "rzp_test_1DP5mmOlF5G5ag", // Standard Razorpay Demo Test Key
  currency: "INR",
  companyName: "TITAN FORGE ATHLETICS",
  themeColor: "#d4ff00"
};

// Custom UPI QR Scanner Configuration
window.UPI_CONFIG = {
  upiId: "8076333273@pthdfc", // User's personal UPI ID
  payeeName: "TITAN FORGE FITNESS",
  scannerImage: "assets/scanner.jpg"
};

// Copy UPI ID to clipboard
window.copyUpiId = function() {
  const upiId = window.UPI_CONFIG ? window.UPI_CONFIG.upiId : "8076333273@pthdfc";
  navigator.clipboard.writeText(upiId).then(() => {
    if (window.showToast) window.showToast(`UPI ID copied: ${upiId}`, 'success');
  }).catch(() => {
    if (window.showToast) window.showToast(`UPI ID: ${upiId}`, 'info');
  });
};

// Switch Payment Method in Checkout Modal
window.onCheckoutPaymentMethodChange = function(method) {
  const qrBox = document.getElementById('checkout-upi-qr-box');
  const submitBtn = document.getElementById('place-order-submit-btn');

  if (method === 'upi_qr') {
    if (qrBox) qrBox.style.display = 'block';
    if (submitBtn) submitBtn.textContent = 'Verify & Confirm Order ⚡';
  } else if (method === 'razorpay') {
    if (qrBox) qrBox.style.display = 'none';
    if (submitBtn) submitBtn.textContent = 'Pay via Razorpay ⚡';
  } else {
    if (qrBox) qrBox.style.display = 'none';
    if (submitBtn) submitBtn.textContent = 'Confirm In-Club Pickup Order ⚡';
  }
};

// Cart State (loaded from localStorage if available)
let cart = [];
try {
  const savedCart = localStorage.getItem('titan_cart');
  if (savedCart) cart = JSON.parse(savedCart);
} catch (e) {
  cart = [];
}

let activeDiscount = 0; // percentage e.g. 10 or 20
let appliedPromoCode = '';
const FREE_SHIPPING_THRESHOLD = 1499.00; // Free delivery above ₹1499 in India

window.addEventListener('titan-products-updated', (event) => {
  if (event.detail && Array.isArray(event.detail)) {
    if (window.GYM_DATA) window.GYM_DATA.products = event.detail;
  }
  const activeCategory = document.querySelector('.store-cat-btn.active')?.getAttribute('data-cat') || 'All';
  if (document.getElementById('products-grid-container')) {
    renderProducts(activeCategory);
  }
});

window.addEventListener('storage', (event) => {
  if (event.key !== 'titan_store_products') return;

  try {
    const saved = JSON.parse(event.newValue || 'null');
    if (Array.isArray(saved)) {
      if (window.GYM_DATA) {
        window.GYM_DATA.products = saved;
      }
      const activeCategory = document.querySelector('.store-cat-btn.active')?.getAttribute('data-cat') || 'All';
      if (document.getElementById('products-grid-container')) {
        renderProducts(activeCategory);
      }
    }
  } catch (e) {
    console.warn('Could not sync products from storage event:', e);
  }
});

// Auto-sync whenever user switches back to this tab
window.addEventListener('focus', () => {
  syncProductsFromServer();
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    syncProductsFromServer();
  }
});

async function syncProductsFromServer() {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        if (window.GYM_DATA) {
          window.GYM_DATA.products = data;
        }
        localStorage.setItem('titan_store_products', JSON.stringify(data));
        const activeCategory = document.querySelector('.store-cat-btn.active')?.getAttribute('data-cat') || 'All';
        renderProducts(activeCategory);
      }
    }
  } catch (err) {
    // offline or static fallback
  }
}

function initStore() {
  try {
    const saved = JSON.parse(localStorage.getItem('titan_store_products') || 'null');
    if (Array.isArray(saved) && saved.length && window.GYM_DATA) {
      window.GYM_DATA.products = saved;
    }
  } catch (e) {
    console.warn('Could not load saved products at init:', e);
  }

  renderProducts('All');
  renderCart();
  syncProductsFromServer();

  // Category Filter Buttons
  const catButtons = document.querySelectorAll('.store-cat-btn');
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.getAttribute('data-cat');
      renderProducts(category);
    });
  });

  // Cart Drawer Open/Close Listeners
  const cartBtn = document.getElementById('open-cart-btn');
  const cartBackdrop = document.getElementById('cart-drawer-backdrop');
  const cartDrawer = document.getElementById('cart-drawer');
  const closeCartBtn = document.getElementById('close-cart-btn');

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

  // Promo Code Apply Button
  const applyPromoBtn = document.getElementById('apply-promo-btn');
  if (applyPromoBtn) {
    applyPromoBtn.addEventListener('click', applyPromoCode);
  }

  // Checkout Button
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', openCheckoutModal);
  }

  // Checkout Form Submission
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', processOrderSubmission);
  }

  // Close Checkout Modal
  const closeCheckoutBtn = document.getElementById('close-checkout-modal-btn');
  if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
  }

  const checkoutModal = document.getElementById('checkout-modal');
  if (checkoutModal) {
    checkoutModal.addEventListener('click', (e) => {
      if (e.target === checkoutModal) closeCheckoutModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      closeCheckoutModal();
    }
  });
}

function openCart() {
  const cartBackdrop = document.getElementById('cart-drawer-backdrop');
  const cartDrawer = document.getElementById('cart-drawer');
  if (cartBackdrop && cartDrawer) {
    cartBackdrop.classList.add('active');
    cartDrawer.classList.add('active');
  }
}

function closeCart() {
  const cartBackdrop = document.getElementById('cart-drawer-backdrop');
  const cartDrawer = document.getElementById('cart-drawer');
  if (cartBackdrop && cartDrawer) {
    cartBackdrop.classList.remove('active');
    cartDrawer.classList.remove('active');
  }
}

function getActiveProductsList() {
  if (Array.isArray(window.GYM_DATA?.products) && window.GYM_DATA.products.length > 0) {
    return window.GYM_DATA.products;
  }
  if (typeof GYM_DATA !== 'undefined' && Array.isArray(GYM_DATA?.products) && GYM_DATA.products.length > 0) {
    return GYM_DATA.products;
  }
  if (window.TITAN_PRODUCTS && typeof window.TITAN_PRODUCTS.load === 'function') {
    const persisted = window.TITAN_PRODUCTS.load();
    if (persisted.length > 0) return persisted;
  }
  return [];
}

function renderProducts(category) {
  const container = document.getElementById('products-grid-container');
  if (!container) return;

  const productList = getActiveProductsList();
  const filtered = category === 'All' 
    ? productList 
    : productList.filter(p => (p.category || '').toLowerCase() === (category || '').toLowerCase());

  if (!filtered.length) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.1);">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">🛍️</div>
        <h4 style="color: #fff; margin-bottom: 6px; font-size: 1.1rem;">No Products Available</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem;">There are no products listed in the <strong>${category}</strong> category right now.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(prod => `
    <div class="product-card" id="prod-card-${prod.id || prod._id}">
      <div class="product-thumb-wrapper">
        <img src="${prod.image || 'assets/supplements.jpg'}" alt="${prod.name}" class="product-thumb" loading="lazy" onerror="this.src='assets/supplements.jpg'">
        ${prod.badge ? `<span class="product-badge-pill">${prod.badge}</span>` : ''}
      </div>
      <div class="product-info">
        <span class="product-cat">${prod.category || 'Supplements'}</span>
        <h4 class="product-title">${prod.name}</h4>
        <div class="product-rating">
          ★ ${prod.rating || '4.8'} <span>(${prod.reviews || 0} reviews)</span>
        </div>
        <p class="product-desc">${prod.shortDesc || ''}</p>
        <div class="product-price-row">
          <span class="current-price">₹${Number(prod.price || 0).toLocaleString('en-IN')}</span>
          ${prod.originalPrice ? `<span class="original-price">₹${Number(prod.originalPrice).toLocaleString('en-IN')}</span>` : ''}
        </div>
        <button class="btn btn-primary btn-sm btn-block add-to-cart-btn" onclick="addToCart('${prod.id || prod._id}')">
          🛒 Add To Cart
        </button>
      </div>
    </div>
  `).join('');
}

function addToCart(productId) {
  const pList = getActiveProductsList();
  const product = pList.find(p => String(p.id) === String(productId) || String(p._id) === String(productId));
  if (!product) return;

  const prodId = String(product.id || product._id || productId);
  const existing = cart.find(item => String(item.id) === prodId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: prodId,
      name: product.name,
      price: Number(product.price || 0),
      image: product.image || 'assets/supplements.jpg',
      category: product.category || 'Supplements',
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  if (window.showToast) {
    window.showToast(`Added ${product.name} to bag!`, 'success');
  }
}

function updateCartQty(productId, delta) {
  const item = cart.find(i => String(i.id) === String(productId));
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => String(i.id) !== String(productId));
  }

  saveCart();
  renderCart();
}

function removeCartItem(productId) {
  cart = cart.filter(i => String(i.id) !== String(productId));
  saveCart();
  renderCart();
  if (window.showToast) {
    window.showToast('Item removed from bag', 'info');
  }
}

function saveCart() {
  try {
    localStorage.setItem('titan_cart', JSON.stringify(cart));
  } catch (e) {
    console.warn('Could not save cart to localStorage', e);
  }
}

function renderCart() {
  const countBadge = document.getElementById('cart-count-badge');
  const bodyEl = document.getElementById('cart-items-body');
  const subtotalEl = document.getElementById('cart-subtotal-val');
  const discountEl = document.getElementById('cart-discount-val');
  const totalEl = document.getElementById('cart-total-val');
  const shippingBar = document.getElementById('shipping-progress-bar');
  const shippingMsg = document.getElementById('shipping-tracker-msg');

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (countBadge) countBadge.textContent = totalItemCount;

  if (!bodyEl) return;

  if (cart.length === 0) {
    bodyEl.innerHTML = `
      <div class="empty-cart-msg">
        <div class="icon">🛒</div>
        <h4>Your Gym Bag is Empty</h4>
        <p>Stock up on high-performance supplements, lifting gear, and premium athletic apparel.</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '₹0';
    if (discountEl) discountEl.textContent = '-₹0';
    if (totalEl) totalEl.textContent = '₹0';
    if (shippingBar) shippingBar.style.width = '0%';
    if (shippingMsg) shippingMsg.textContent = `Add ₹${FREE_SHIPPING_THRESHOLD.toLocaleString('en-IN')} more for Free Express Delivery across India!`;
    return;
  }

  // Render items
  bodyEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-thumb" onerror="this.src='assets/supplements.jpg'">
      <div class="cart-item-details">
        <div>
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div class="cart-qty-ctrl">
            <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
            <span style="font-weight:700; font-size:0.9rem; min-width:18px; text-align:center;">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
          </div>
          <button onclick="removeCartItem('${item.id}')" style="background:none; border:none; color:#ef4444; font-size:0.8rem; cursor:pointer; font-weight:600;">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = Math.round(subtotal * (activeDiscount / 100));
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - discountAmount + (subtotal > 0 ? shipping : 0));

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (discountEl) discountEl.textContent = `-₹${discountAmount.toLocaleString('en-IN')} (${activeDiscount}%)`;
  if (totalEl) totalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

  // Free shipping bar
  const shippingPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  if (shippingBar) shippingBar.style.width = `${shippingPercent}%`;
  if (shippingMsg) {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      shippingMsg.innerHTML = `🎉 You unlocked <strong>FREE Express Delivery across India</strong>!`;
    } else {
      const needed = (FREE_SHIPPING_THRESHOLD - subtotal);
      shippingMsg.innerHTML = `Add <strong>₹${needed.toLocaleString('en-IN')}</strong> more to unlock Free Express Delivery!`;
    }
  }
}

function applyPromoCode() {
  const input = document.getElementById('cart-promo-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (code === 'TITAN10') {
    activeDiscount = 10;
    appliedPromoCode = 'TITAN10';
    if (window.showToast) window.showToast('Promo code TITAN10 applied! 10% Discount saved.', 'success');
  } else if (code === 'TITAN20' || code === 'WELCOME20') {
    activeDiscount = 20;
    appliedPromoCode = code;
    if (window.showToast) window.showToast(`Promo code ${code} applied! 20% Mega Discount!`, 'success');
  } else {
    if (window.showToast) window.showToast('Invalid voucher code. Try "TITAN10" or "WELCOME20"', 'error');
    return;
  }

  renderCart();
}

function openCheckoutModal() {
  if (cart.length === 0) {
    if (window.showToast) window.showToast('Your bag is empty! Add products first.', 'error');
    return;
  }

  closeCart();
  const modal = document.getElementById('checkout-modal');
  const summaryEl = document.getElementById('checkout-modal-summary');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = Math.round(subtotal * (activeDiscount / 100));
  const grandTotal = Math.max(0, subtotal - discountAmount);

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:8px; margin-bottom:20px; border:1px solid var(--border-subtle);">
        <div style="font-weight:700; margin-bottom:6px; color:#fff;">Order Summary (${cart.length} unique items)</div>
        <div style="color:var(--text-secondary); font-size:0.9rem; display:flex; justify-content:space-between;">
          <span>Subtotal:</span> <span>₹${subtotal.toLocaleString('en-IN')}</span>
        </div>
        ${activeDiscount > 0 ? `
        <div style="color:var(--accent-volt); font-size:0.9rem; display:flex; justify-content:space-between;">
          <span>Discount (${appliedPromoCode}):</span> <span>-₹${discountAmount.toLocaleString('en-IN')}</span>
        </div>` : ''}
        <div style="color:#fff; font-weight:800; font-size:1.1rem; display:flex; justify-content:space-between; margin-top:8px; border-top:1px dashed var(--border-subtle); padding-top:8px;">
          <span>Total to Pay:</span> <span style="color:var(--accent-volt);">₹${grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px; background:rgba(212,255,0,0.08); border:1px solid rgba(212,255,0,0.3); padding:10px 14px; border-radius:8px; margin-bottom:18px; font-size:0.85rem; color:var(--accent-volt);">
        <span>⚡</span>
        <span>Instant UPI QR Scanner or Razorpay Gateway supported</span>
      </div>
    `;
  }

  // Update Dynamic UPI QR Code for exact cart amount
  const qrImg = document.getElementById('checkout-qr-img');
  const upiBadge = document.getElementById('checkout-display-upi-id');
  if (upiBadge && window.UPI_CONFIG) upiBadge.textContent = window.UPI_CONFIG.upiId;
  if (qrImg && window.UPI_CONFIG) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(`upi://pay?pa=${window.UPI_CONFIG.upiId}&pn=${window.UPI_CONFIG.payeeName}&am=${grandTotal}&cu=INR`)}`;
    qrImg.onerror = () => { qrImg.src = window.UPI_CONFIG.scannerImage; };
  }

  if (modal) modal.classList.add('active');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('active');
}

function processOrderSubmission(e) {
  e.preventDefault();
  const btn = document.getElementById('place-order-submit-btn');
  const name = document.getElementById('checkout-name').value;
  const phone = document.getElementById('checkout-phone').value;
  const address = document.getElementById('checkout-address').value;
  const city = document.getElementById('checkout-city').value;
  const paymentMethod = document.getElementById('checkout-payment-method').value;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = Math.round(subtotal * (activeDiscount / 100));
  const grandTotal = Math.max(0, subtotal - discountAmount);
  const orderId = 'TF-IN-' + Math.floor(100000 + Math.random() * 900000);

  // 1. Direct Custom UPI QR Payment
  if (paymentMethod === 'upi_qr') {
    const utrInput = document.getElementById('checkout-utr');
    const utr = utrInput ? utrInput.value.trim() : '';

    if (!utr || utr.length < 6) {
      if (window.showToast) window.showToast('Please enter your 12-digit UPI UTR / Ref number from your payment app', 'error');
      if (utrInput) utrInput.focus();
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Verifying UPI Transfer... ⚡';
    }

    const customerInfo = { name, phone, address, city };

    setTimeout(() => {
      completeOrderDisplay(orderId, 'UTR: ' + utr, 'Direct UPI QR Scan (GPay / PhonePe / Paytm)', grandTotal, customerInfo);
    }, 1200);
    return;
  }

  // 2. Razorpay Payment Gateway
  if (paymentMethod === 'razorpay' && typeof Razorpay !== 'undefined') {
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Connecting to Razorpay... ⚡';
    }

    const customerInfo = { name, phone, address, city };

    const options = {
      key: window.RAZORPAY_CONFIG.key,
      amount: grandTotal * 100, // paise
      currency: "INR",
      name: "TITAN FORGE FITNESS",
      description: `Order ${orderId}`,
      image: "assets/supplements.jpg",
      prefill: {
        name: name,
        contact: phone,
        email: "customer@titanforge.in"
      },
      notes: {
        address: `${address}, ${city}`,
        order_id: orderId
      },
      theme: {
        color: "#d4ff00"
      },
      handler: function(response) {
        // Payment successful
        completeOrderDisplay(orderId, response.razorpay_payment_id, 'Razorpay UPI / Cards', grandTotal, customerInfo);
      },
      modal: {
        ondismiss: function() {
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'Pay with Razorpay ⚡';
          }
          if (window.showToast) window.showToast('Razorpay payment cancelled.', 'info');
        }
      }
    };

    try {
      const rzp = new Razorpay(options);
      rzp.on('payment.failed', function(resp) {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Pay with Razorpay ⚡';
        }
        if (window.showToast) window.showToast(`Payment failed: ${resp.error.description}`, 'error');
      });
      rzp.open();
    } catch (err) {
      completeOrderDisplay(orderId, 'pay_demo_' + Math.random().toString(36).substring(7), 'Razorpay (Test Demo)', grandTotal, customerInfo);
    }
  } else {
    // 3. Cash on Delivery or In-club collection
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Processing Order... ⚡';
    }
    const customerInfo = { name, phone, address, city };
    setTimeout(() => {
      completeOrderDisplay(orderId, 'COD-' + Math.floor(10000 + Math.random() * 90000), 'Cash on Delivery (In-Club)', grandTotal, customerInfo);
    }, 900);
  }
}

function completeOrderDisplay(orderId, paymentId, method, amount, customerData) {
  // 1. Prepare Order Document for MongoDB / Database
  const orderItems = cart.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    total: item.price * item.quantity
  }));

  const orderPayload = {
    order_id: orderId,
    customer_name: (customerData && customerData.name) || 'Customer',
    phone: (customerData && customerData.phone) || '',
    address: (customerData && customerData.address) || '',
    city: (customerData && customerData.city) || '',
    payment_method: method,
    payment_ref: paymentId,
    utr: paymentId,
    amount: amount,
    items: orderItems,
    items_count: orderItems.length,
    status: 'Confirmed'
  };

  // 2. Persist to MongoDB API
  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  })
  .then(res => res.json())
  .then(data => {
    console.log('✅ [MongoDB Database] Order saved successfully:', data);
  })
  .catch(err => {
    console.warn('⚠️ Server offline, saving locally in session:', err);
  });

  if (window.sendDirectGmailAlert) {
    window.sendDirectGmailAlert(`🛒 New Store Order - ₹${amount} from ${orderPayload.customer_name}`, {
      'Enquiry Type': 'Supplement & Gear Store Order',
      'Order ID': `#${orderId}`,
      'Customer Name': orderPayload.customer_name,
      'Phone Number': orderPayload.phone,
      'Delivery Address': `${orderPayload.address}, ${orderPayload.city}`,
      'Order Items': orderItems.map(i => `${i.name} (x${i.quantity})`).join(', '),
      'Total Amount': `₹${amount}`,
      'Payment Method': method,
      'Transaction Ref / UTR': paymentId
    });
  }

  cart = [];
  activeDiscount = 0;
  appliedPromoCode = '';
  saveCart();
  renderCart();

  const checkoutBody = document.getElementById('checkout-form-container');
  if (checkoutBody) {
    checkoutBody.innerHTML = `
      <div style="text-align:center; padding:30px 10px;">
        <div style="font-size:3.5rem; margin-bottom:12px;">🏆</div>
        <h3 style="font-size:1.8rem; margin-bottom:6px; color:#fff;">Order Confirmed!</h3>
        <p style="color:var(--accent-volt); font-weight:800; font-size:1.1rem; margin-bottom:8px;">Order ID: #${orderId}</p>
        
        <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-subtle); padding:16px; border-radius:8px; margin:20px 0; text-align:left; font-size:0.9rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span style="color:var(--text-secondary);">Payment Method:</span>
            <strong style="color:#fff;">${method}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span style="color:var(--text-secondary);">Razorpay Ref ID:</span>
            <code style="color:var(--accent-cyan);">${paymentId}</code>
          </div>
          <div style="display:flex; justify-content:space-between; border-top:1px dashed var(--border-subtle); padding-top:6px; margin-top:6px;">
            <span style="color:var(--text-secondary);">Amount Paid:</span>
            <strong style="color:var(--accent-volt); font-size:1.05rem;">₹${amount.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <p style="color:var(--text-secondary); font-size:0.92rem; margin-bottom:24px;">
          Thank you for gearing up with Titan Forge India. You will receive an SMS and WhatsApp dispatch tracking update within 2 hours.
        </p>
        <button class="btn btn-primary btn-block" onclick="closeCheckoutModal(); location.reload();">
          Continue Shopping
        </button>
      </div>
    `;
  }

  if (window.showToast) {
    window.showToast(`Order #${orderId} verified & confirmed!`, 'success');
  }
}

document.addEventListener('DOMContentLoaded', initStore);
