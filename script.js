// ===== Mobile Menu =====
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  nav.classList.toggle('open');
});

nav.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    nav.classList.remove('open');
  });
});

document.addEventListener('click', (e) => {
  if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
    hamburger.classList.remove('active');
    nav.classList.remove('open');
  }
});

// ===== Header Scroll Effect =====
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ===== Scroll Animations =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 80);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.product-card, .why-card, .contact-item, .contact-form, .about-wrapper, .store-wrapper, .campaign-banner, .about-stats .stat'
).forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ===== Contact Form -> WhatsApp =====
const contactForm = document.getElementById('contactForm');
if (contactForm) contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const message = document.getElementById('message').value;

  if (name && phone && message) {
    const waMessage = `Merhaba, ben ${name}. ${message} (Tel: ${phone})`;
    window.open(`https://wa.me/905063977307?text=${encodeURIComponent(waMessage)}`, '_blank');
    e.target.reset();
  }
});

// ===== Mağaza Haritası (çerez onayına bağlı) =====
// Google Maps iframe'i çerez yazıp IP adresini Google'a ilettiği için onay
// alınmadan yüklenmez. Pazarlama onayı varsa otomatik, yoksa kullanıcı
// "Haritayı Yükle" düğmesine basınca yüklenir.
const storeMap = document.getElementById('storeMap');
if (storeMap) {
  const haritaYukle = () => {
    if (storeMap.querySelector('iframe')) return;

    const lat = storeMap.dataset.lat;
    const lon = storeMap.dataset.lon;

    const iframe = document.createElement('iframe');
    // Anahtarsiz gomme bicimi. NOT: Google harita kareleri akmaya devam ettigi
    // icin iframe'in `load` olayi guvenilir tetiklenmiyor — yuklenme kontrolunu
    // bu olaya bagli bir zaman asimiyla yapma, calisan haritayi siler.
    iframe.src = `https://maps.google.com/maps?q=${lat},${lon}&z=16&output=embed`;
    iframe.title = 'Tela Home mağazasının Google Haritalar üzerindeki konumu';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.setAttribute('allowfullscreen', '');

    const placeholder = document.getElementById('storeMapPlaceholder');
    if (placeholder) placeholder.remove();
    storeMap.appendChild(iframe);
  };

  const onayVar = () => {
    const onay = typeof window.telaCookieGet === 'function' ? window.telaCookieGet() : null;
    return !!(onay && onay.marketing);
  };

  const loadBtn = document.getElementById('storeMapLoad');
  if (loadBtn) loadBtn.addEventListener('click', haritaYukle);

  // Onay zaten verilmişse doğrudan yükle.
  // DOMContentLoaded bekleniyor: script.js senkron, cookie-banner.js ise defer'li —
  // bu satır çalıştığında window.telaCookieGet henüz tanımlı olmuyor.
  document.addEventListener('DOMContentLoaded', () => {
    if (onayVar()) haritaYukle();
  });

  // Kullanıcı banner'dan sonradan onay verirse yükle
  document.addEventListener('telaConsentChange', (e) => {
    if (e.detail && e.detail.marketing) haritaYukle();
  });
}
