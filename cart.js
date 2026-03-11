// ===== Cart System (localStorage) =====
const Cart = {
  getItems() {
    return JSON.parse(localStorage.getItem('telaCart') || '[]');
  },

  save(items) {
    localStorage.setItem('telaCart', JSON.stringify(items));
    this.updateCount();
  },

  add(item) {
    const items = this.getItems();
    const existing = items.find(i => i.id === item.id);
    if (existing) {
      existing.qty += item.qty;
    } else {
      items.push(item);
    }
    this.save(items);
  },

  updateCount() {
    const items = this.getItems();
    const total = items.reduce((sum, item) => sum + item.qty, 0);
    const countEls = document.querySelectorAll('.cart-count');
    countEls.forEach(el => {
      el.textContent = total;
      el.style.display = total > 0 ? 'flex' : 'none';
    });
  }
};

// Update cart count on page load
document.addEventListener('DOMContentLoaded', () => Cart.updateCount());
