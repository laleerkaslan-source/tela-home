/* ─── ÜRÜN DETAY SAYFASI — Ortak JavaScript ─── */
/* Her ürün sayfasında window.PRODUCT objesi tanımlanır:
   { id, name, size, sizeLabel, desc, price, image, category, stock } */

(function() {
  let cart = [];
  const P = window.PRODUCT;
  const sourceLabels = { masaortu: 'Masa Örtüsü', punch: 'Kırlent', alez: 'Alez' };

  function addToCart() {
    const inCart = cart.find(c => c.id === P.id && c.source === 'masaortu');
    const currentQty = inCart ? inCart.qty : 0;
    if (currentQty >= P.stock) return;

    if (inCart) {
      inCart.qty++;
      SharedCart.updateItem(P.id, 'masaortu', inCart.qty);
    } else {
      const item = {
        id: P.id, name: P.name + ' ' + P.sizeLabel,
        price: P.price, image: P.image, qty: 1,
        size: P.sizeLabel, source: 'masaortu'
      };
      cart.push(item);
      SharedCart.addItem(item);
    }
    updateBadge();
    renderCart();
    showToast(P.name + ' sepete eklendi!');
    openCart();

    if (typeof gtag === 'function') {
      gtag('event', 'add_to_cart', {
        currency: 'TRY', value: P.price,
        items: [{ item_id: P.id, item_name: P.name, price: P.price, quantity: 1, item_category: 'Masa Örtüsü' }]
      });
    }
    if (typeof fbq === 'function') {
      fbq('track', 'AddToCart', {
        content_ids: [P.id], content_name: P.name,
        content_type: 'product', value: P.price, currency: 'TRY'
      });
    }
  }
  window.addToCart = addToCart;

  window.updateQty = function(id, source, delta) {
    const item = cart.find(c => c.id === id && c.source === source);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(c => !(c.id === id && c.source === source));
      SharedCart.removeItem(id, source);
    } else {
      SharedCart.updateItem(id, source, item.qty);
    }
    updateBadge();
    renderCart();
    updateAddButton();
  };

  window.clearCart = function() {
    if (!confirm('Sepeti boşaltmak istediğinize emin misiniz?')) return;
    cart = [];
    SharedCart.clear();
    updateBadge();
    renderCart();
    updateAddButton();
    showToast('Sepet boşaltıldı');
  };

  function updateBadge() {
    const total = cart.reduce((s, c) => s + c.qty, 0);
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    badge.textContent = total;
    badge.classList.toggle('show', total > 0);
  }

  function updateAddButton() {
    const inCart = cart.find(c => c.id === P.id && c.source === 'masaortu');
    const currentQty = inCart ? inCart.qty : 0;
    const remaining = P.stock - currentQty;
    const btn = document.getElementById('addToCartBtn');
    if (!btn) return;
    if (remaining <= 0) {
      btn.disabled = true;
      btn.querySelector('.btn-label').textContent = 'Tükendi';
    } else {
      btn.disabled = false;
      btn.querySelector('.btn-label').textContent = currentQty > 0 ? `Sepete Ekle (${currentQty} adet)` : 'Sepete Ekle';
    }
  }

  function renderCart() {
    const itemsEl = document.getElementById('cartItems');
    const emptyEl = document.getElementById('cartEmpty');
    const footerEl = document.getElementById('cartFooter');
    if (!itemsEl) return;

    if (cart.length === 0) {
      emptyEl.style.display = 'block';
      footerEl.style.display = 'none';
      itemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());
      return;
    }
    emptyEl.style.display = 'none';
    footerEl.style.display = 'block';

    let html = '';
    let total = 0;
    cart.forEach(c => {
      total += (c.price || 0) * c.qty;
      const sourceTag = c.source && c.source !== 'masaortu'
        ? `<span style="font-size:0.7rem;background:#e8ddd0;color:var(--earth);padding:1px 6px;border-radius:3px;">${sourceLabels[c.source] || c.source}</span>`
        : '';
      html += `
        <div class="cart-item">
          <img src="${c.image || ''}" alt="${c.name}" onerror="this.style.display='none'">
          <div class="cart-item-info">
            <div class="cart-item-name">${c.name} ${sourceTag}</div>
            <div class="cart-item-price">${((c.price || 0) * c.qty).toLocaleString('tr-TR')} TL</div>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateQty('${c.id}', '${c.source}', -1)">&#8722;</button>
            <span class="qty-num">${c.qty}</span>
            <button class="qty-btn" onclick="updateQty('${c.id}', '${c.source}', 1)">+</button>
          </div>
        </div>
      `;
    });

    itemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());
    itemsEl.insertAdjacentHTML('beforeend', html);

    document.getElementById('cartTotal').textContent = total.toLocaleString('tr-TR') + ' TL';

    let msg = 'Merhaba, aşağıdaki ürünleri sipariş vermek istiyorum:\n\n';
    cart.forEach(c => {
      msg += `• ${c.name} x${c.qty} — ${((c.price || 0) * c.qty).toLocaleString('tr-TR')} TL\n`;
    });
    msg += `\nToplam: ${total.toLocaleString('tr-TR')} TL`;
    document.getElementById('checkoutBtn').href = 'https://wa.me/905063977307?text=' + encodeURIComponent(msg);
  }

  function showToast(text) {
    const toast = document.getElementById('toast');
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function openCart() { document.getElementById('cartDrawer').classList.add('open'); document.getElementById('cartOverlay').classList.add('open'); }
  function closeCart() { document.getElementById('cartDrawer').classList.remove('open'); document.getElementById('cartOverlay').classList.remove('open'); }
  window.openCart = openCart;
  window.closeCart = closeCart;

  window.goToMainCart = function() {
    const total = cart.reduce((s, c) => s + (c.price || 0) * c.qty, 0);
    if (typeof gtag === 'function') {
      gtag('event', 'begin_checkout', {
        currency: 'TRY', value: total,
        items: cart.map(c => ({ item_id: c.id, item_name: c.name, price: c.price, quantity: c.qty, item_category: 'Masa Örtüsü' }))
      });
    }
    if (typeof fbq === 'function') {
      fbq('track', 'InitiateCheckout', {
        content_ids: cart.map(c => c.id), value: total,
        currency: 'TRY', num_items: cart.reduce((s, c) => s + c.qty, 0)
      });
    }
    if (cart.length === 0) {
      window.location.href = 'https://telahome.store/sepet.html';
      return;
    }
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(cart))));
    window.location.href = 'https://telahome.store/sepet.html?import=' + encodeURIComponent(encoded);
  };

  // ─── INIT ───
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('cartToggle')?.addEventListener('click', openCart);
    document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
    document.getElementById('cartClose')?.addEventListener('click', closeCart);
    document.getElementById('addToCartBtn')?.addEventListener('click', addToCart);
    document.getElementById('mobileToggle')?.addEventListener('click', () => document.getElementById('nav').classList.toggle('open'));

    SharedCart.init(function() {
      SharedCart.getItems().then(function(items) {
        cart = items || [];
        updateBadge();
        renderCart();
        updateAddButton();

        if (typeof gtag === 'function') {
          gtag('event', 'view_item', {
            currency: 'TRY', value: P.price,
            items: [{ item_id: P.id, item_name: P.name, price: P.price, quantity: 1, item_category: 'Masa Örtüsü' }]
          });
        }
        if (typeof fbq === 'function') {
          fbq('track', 'ViewContent', {
            content_ids: [P.id], content_name: P.name,
            content_type: 'product', value: P.price, currency: 'TRY'
          });
        }
      });
    });
  });
})();
