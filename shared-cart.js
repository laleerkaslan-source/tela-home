// ===== Shared Cart Bridge Client =====
// Include on any telahome.store subdomain for cross-domain cart sharing
// Usage: <script src="https://telahome.store/shared-cart.js"></script>
// Then: SharedCart.init() → SharedCart.getItems() → SharedCart.addItem({...})

(function() {
  var BRIDGE_URL = 'https://telahome.store/cart-bridge.html';
  var BRIDGE_ORIGIN = 'https://telahome.store';

  var iframe = null;
  var ready = false;
  var pending = {};
  var counter = 0;
  var readyQueue = [];
  var cachedItems = null;

  function send(action, data) {
    return new Promise(function(resolve) {
      var id = ++counter;
      pending[id] = resolve;

      function doSend() {
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ cartBridge: true, action: action, data: data, id: id }, BRIDGE_ORIGIN);
        }
      }

      if (ready) doSend();
      else readyQueue.push(doSend);

      // Timeout fallback
      setTimeout(function() {
        if (pending[id]) {
          delete pending[id];
          resolve({ items: cachedItems || [] });
        }
      }, 5000);
    });
  }

  window.SharedCart = {
    init: function(callback) {
      // On main domain, use localStorage directly
      if (window.location.hostname === 'telahome.store' || window.location.hostname === 'www.telahome.store') {
        ready = true;
        if (callback) callback();
        return;
      }

      iframe = document.createElement('iframe');
      iframe.src = BRIDGE_URL;
      iframe.style.cssText = 'display:none;width:0;height:0;border:0;position:absolute;';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);

      window.addEventListener('message', function(e) {
        if (e.origin !== BRIDGE_ORIGIN) return;
        var msg = e.data;
        if (!msg || !msg.cartBridge) return;

        if (msg.id && pending[msg.id]) {
          pending[msg.id](msg);
          delete pending[msg.id];
        }
      });

      iframe.onload = function() {
        ready = true;
        readyQueue.forEach(function(fn) { fn(); });
        readyQueue = [];
        if (callback) callback();
      };

      // Fallback timeout
      setTimeout(function() {
        if (!ready) {
          ready = true;
          readyQueue.forEach(function(fn) { fn(); });
          readyQueue = [];
          if (callback) callback();
        }
      }, 3000);
    },

    getItems: function() {
      // Main domain: direct localStorage
      if (window.location.hostname === 'telahome.store' || window.location.hostname === 'www.telahome.store') {
        try { cachedItems = JSON.parse(localStorage.getItem('telaCart') || '[]'); }
        catch(e) { cachedItems = []; }
        return Promise.resolve(cachedItems);
      }
      return send('get').then(function(res) {
        cachedItems = res.items || [];
        return cachedItems;
      });
    },

    addItem: function(item) {
      if (window.location.hostname === 'telahome.store' || window.location.hostname === 'www.telahome.store') {
        var items = JSON.parse(localStorage.getItem('telaCart') || '[]');
        var key = item.id + ':' + (item.source || '');
        var idx = items.findIndex(function(i) { return (i.id + ':' + (i.source || '')) === key; });
        if (idx >= 0) {
          items[idx].qty += item.qty;
          items[idx].price = item.price;
          items[idx].name = item.name;
          items[idx].image = item.image;
          if (item.size) items[idx].size = item.size;
        } else {
          items.push(item);
        }
        localStorage.setItem('telaCart', JSON.stringify(items));
        cachedItems = items;
        return Promise.resolve(items);
      }
      return send('add', item).then(function(res) {
        cachedItems = res.items || cachedItems;
        return cachedItems;
      });
    },

    updateItem: function(id, source, qty) {
      if (window.location.hostname === 'telahome.store' || window.location.hostname === 'www.telahome.store') {
        var items = JSON.parse(localStorage.getItem('telaCart') || '[]');
        var key = id + ':' + (source || '');
        var idx = items.findIndex(function(i) { return (i.id + ':' + (i.source || '')) === key; });
        if (idx >= 0) {
          if (qty <= 0) items.splice(idx, 1);
          else items[idx].qty = qty;
        }
        localStorage.setItem('telaCart', JSON.stringify(items));
        cachedItems = items;
        return Promise.resolve(items);
      }
      return send('update', { id: id, source: source, qty: qty }).then(function(res) {
        cachedItems = res.items || cachedItems;
        return cachedItems;
      });
    },

    removeItem: function(id, source) {
      if (window.location.hostname === 'telahome.store' || window.location.hostname === 'www.telahome.store') {
        var items = JSON.parse(localStorage.getItem('telaCart') || '[]');
        var key = id + ':' + (source || '');
        items = items.filter(function(i) { return (i.id + ':' + (i.source || '')) !== key; });
        localStorage.setItem('telaCart', JSON.stringify(items));
        cachedItems = items;
        return Promise.resolve(items);
      }
      return send('remove', { id: id, source: source }).then(function(res) {
        cachedItems = res.items || cachedItems;
        return cachedItems;
      });
    },

    setItems: function(items) {
      if (window.location.hostname === 'telahome.store' || window.location.hostname === 'www.telahome.store') {
        localStorage.setItem('telaCart', JSON.stringify(items));
        cachedItems = items;
        return Promise.resolve(items);
      }
      return send('set', items).then(function(res) {
        cachedItems = res.items || items;
        return cachedItems;
      });
    },

    clear: function() {
      if (window.location.hostname === 'telahome.store' || window.location.hostname === 'www.telahome.store') {
        localStorage.setItem('telaCart', '[]');
        cachedItems = [];
        return Promise.resolve([]);
      }
      return send('clear').then(function() {
        cachedItems = [];
        return [];
      });
    },

    getCached: function() {
      return cachedItems || [];
    },

    getTotalCount: function() {
      var items = cachedItems || [];
      return items.reduce(function(s, i) { return s + (i.qty || 0); }, 0);
    }
  };
})();
