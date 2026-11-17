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

/* ================= Taksit kutusu =================
   Urun sayfasinda fiyatin altinda "6 taksite kadar ~461 TL/ay" ozetini ve
   acilir taksit tablosunu cizer. Sayfaya tek satir yetiyor:
       <div class="taksit-box" data-taksit-fiyat="2450"></div>

   ORANLAR iyzico panelinden geliyor (Ayarlar > Taksit ve Komisyon Oranlari),
   17 Kasim 2026 itibariyla. Panelde oran degisirse burasi da degismeli.

   TUTARLAR YAKLASIK, bu yuzden hepsi "~" ile ve TAM LIRA gosteriliyor.
   Panel oranlari yuvarlanmis (ornegin %12,87), iyzico'nun gercek hesabi biraz
   farkli; ustelik iyzico'nun kendi ekraninda bile tutarsizlik var: 2.450 TL'de
   6 taksit "460,87 TL x 6" diyor ama TOPLAM olarak 2.765,21 yaziyor (carpim
   2.765,22 eder). Yani kurus hassasiyeti kovalanacak bir sey degil - burada
   kuruslu tutar GOSTERME, yaniltici olur. Baglayici tutar odeme ekranindaki.

   9 ve 12 taksit panelde TANIMLI ama 2.450 TL'lik sepette iyzico bunlari
   sunmadi (olculdu). Listeye eklemeden once o fiyat bandinda odeme formunda
   gercekten cikiyor mu diye bak - olmayan taksiti vaat etmek yaniltici olur.
*/
(function () {
  const TAKSIT_ORANLARI = { 2: 0.0369, 3: 0.0576, 6: 0.1287 };

  const tam = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
  let sayac = 0;

  function secenekler(fiyat) {
    return Object.keys(TAKSIT_ORANLARI).map(Number).sort(function (a, b) { return a - b; })
      .map(function (adet) {
        const toplam = fiyat * (1 + TAKSIT_ORANLARI[adet]);
        return { adet: adet, aylik: toplam / adet, toplam: toplam };
      });
  }

  function ciz(kutu) {
    const fiyat = parseFloat(kutu.getAttribute('data-taksit-fiyat'));
    if (!isFinite(fiyat) || fiyat <= 0) return;

    const liste = secenekler(fiyat);
    if (!liste.length) return;
    const enUzun = liste[liste.length - 1];
    const id = 'taksitListe' + (++sayac);

    const satirlar = liste.map(function (s) {
      return '<div class="taksit-satir">' +
               '<span class="taksit-adet">' + s.adet + ' taksit</span>' +
               '<span class="taksit-sag">' +
                 '<span class="taksit-aylik">~' + tam.format(s.aylik) + ' TL</span> × ' + s.adet +
                 '<span class="taksit-toplam">Toplam ~' + tam.format(s.toplam) + ' TL</span>' +
               '</span>' +
             '</div>';
    }).join('');

    kutu.innerHTML =
      '<button type="button" class="taksit-toggle" aria-expanded="false" aria-controls="' + id + '">' +
        '<span class="taksit-ikon" aria-hidden="true">💳</span>' +
        '<span class="taksit-ozet">' + enUzun.adet + ' taksite kadar — aylık <strong>~' +
          tam.format(enUzun.aylik) + ' TL</strong></span>' +
        '<span class="taksit-ok" aria-hidden="true">▼</span>' +
      '</button>' +
      '<div class="taksit-liste" id="' + id + '" hidden>' + satirlar +
        '<p class="taksit-not">Tutarlar yaklaşıktır ve bankanın uyguladığı vade farkını içerir. ' +
        'Kullanılabilir taksit sayısı kartınıza göre değişir; geçerli taksit tutarı ve ödenecek ' +
        'toplam, sipariş onaylanmadan önce ödeme adımında gösterilir. Tela Home ayrıca vade farkı almaz.</p>' +
      '</div>';

    const btn = kutu.querySelector('.taksit-toggle');
    const panel = kutu.querySelector('.taksit-liste');
    let olculdu = false;

    btn.addEventListener('click', function () {
      const acik = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', acik ? 'false' : 'true');
      panel.hidden = acik;

      // Taksitin ise yarayip yaramadigini olcebilmek icin: sayfa basina bir kez.
      if (!acik && !olculdu) {
        olculdu = true;
        if (typeof gtag === 'function') {
          gtag('event', 'taksit_goruntule', { currency: 'TRY', value: fiyat });
        }
      }
    });
  }

  function kur() { document.querySelectorAll('.taksit-box[data-taksit-fiyat]').forEach(ciz); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', kur);
  } else {
    kur();
  }
})();
