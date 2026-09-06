(function() {
  if (window.telaCookieLoaded) return;
  window.telaCookieLoaded = true;

  // Kritik dönüşüm sayfalarında banner GÖSTERME (kullanıcı dikkatinin dağılmaması için)
  var EXCLUDE_PATHS = ['/odeme.html', '/sepet.html', '/cart-bridge.html', '/odeme-sonuc.html'];
  var currentPath = (window.location.pathname || '').toLowerCase();
  if (EXCLUDE_PATHS.some(function(p) { return currentPath.indexOf(p) !== -1; })) {
    // Sadece window.telaCookieOpen fonksiyonu tanımlansın (linkten manuel açılabilsin)
    window.telaCookieOpen = function() { window.location.href = '/cerez-politikasi.html'; };
    return;
  }

  var STORAGE_KEY = 'tela_cookie_consent_v1';
  var stored = null;
  try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) {}

  var css = '' +
    '#telaCookieBanner{position:fixed;left:0;right:0;bottom:0;z-index:9998;background:#3a2f24;color:#fff;padding:18px 20px;box-shadow:0 -8px 24px rgba(0,0,0,0.18);font-family:"Open Sans",sans-serif;font-size:0.9rem;line-height:1.5;transform:translateY(120%);transition:transform 0.35s ease;}' +
    '#telaCookieBanner.show{transform:translateY(0);}' +
    '#telaCookieBanner .tc-inner{max-width:1120px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:16px;justify-content:space-between;}' +
    '#telaCookieBanner .tc-text{flex:1 1 320px;min-width:0;}' +
    '#telaCookieBanner .tc-text a{color:#e8c9a8;text-decoration:underline;}' +
    '#telaCookieBanner .tc-actions{display:flex;gap:8px;flex-wrap:wrap;}' +
    '#telaCookieBanner button{padding:10px 18px;border-radius:50px;border:none;font-size:0.86rem;font-weight:600;cursor:pointer;font-family:inherit;-webkit-tap-highlight-color:transparent;}' +
    '#telaCookieBanner .tc-accept{background:#c9a875;color:#3a2f24;}' +
    '#telaCookieBanner .tc-accept:hover{background:#d4b788;}' +
    '#telaCookieBanner .tc-reject{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,0.35);}' +
    '#telaCookieBanner .tc-reject:hover{border-color:#fff;}' +
    '#telaCookieBanner .tc-manage{background:transparent;color:#e8c9a8;text-decoration:underline;padding:10px 8px;}' +
    '#telaCookieModal{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:none;align-items:center;justify-content:center;padding:20px;}' +
    '#telaCookieModal.show{display:flex;}' +
    '#telaCookieModal .tcm-box{background:#fff;color:#3a2f24;border-radius:16px;max-width:520px;width:100%;max-height:85vh;overflow-y:auto;padding:28px;font-family:"Open Sans",sans-serif;box-shadow:0 20px 60px rgba(0,0,0,0.3);}' +
    '#telaCookieModal h3{font-family:"Montserrat",sans-serif;font-size:1.25rem;margin:0 0 6px;color:#3a2f24;}' +
    '#telaCookieModal .tcm-intro{font-size:0.9rem;color:#666;margin-bottom:20px;}' +
    '#telaCookieModal .tcm-row{display:flex;align-items:flex-start;gap:14px;padding:14px 0;border-top:1px solid #eee;}' +
    '#telaCookieModal .tcm-row:first-of-type{border-top:none;}' +
    '#telaCookieModal .tcm-row-info{flex:1;}' +
    '#telaCookieModal .tcm-row h4{font-family:"Montserrat",sans-serif;font-size:0.98rem;margin:0 0 4px;color:#3a2f24;}' +
    '#telaCookieModal .tcm-row p{font-size:0.82rem;color:#666;margin:0;line-height:1.5;}' +
    '#telaCookieModal .tcm-toggle{position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0;margin-top:2px;}' +
    '#telaCookieModal .tcm-toggle input{opacity:0;width:0;height:0;}' +
    '#telaCookieModal .tcm-toggle .slider{position:absolute;cursor:pointer;inset:0;background:#ccc;border-radius:24px;transition:0.2s;}' +
    '#telaCookieModal .tcm-toggle .slider:before{content:"";position:absolute;height:18px;width:18px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:0.2s;}' +
    '#telaCookieModal .tcm-toggle input:checked + .slider{background:#8b7355;}' +
    '#telaCookieModal .tcm-toggle input:checked + .slider:before{transform:translateX(20px);}' +
    '#telaCookieModal .tcm-toggle input:disabled + .slider{background:#8b7355;opacity:0.55;cursor:not-allowed;}' +
    '#telaCookieModal .tcm-actions{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;}' +
    '#telaCookieModal .tcm-actions button{flex:1;min-width:130px;padding:12px 16px;border-radius:50px;border:none;font-size:0.9rem;font-weight:600;cursor:pointer;font-family:inherit;}' +
    '#telaCookieModal .tcm-save{background:#8b7355;color:#fff;}' +
    '#telaCookieModal .tcm-save:hover{background:#6b5740;}' +
    '#telaCookieModal .tcm-cancel{background:#f2f0eb;color:#3a2f24;}' +
    '@media (max-width:640px){' +
      '#telaCookieBanner{padding:14px 16px;font-size:0.85rem;}' +
      '#telaCookieBanner .tc-inner{gap:10px;}' +
      '#telaCookieBanner .tc-actions{width:100%;justify-content:stretch;}' +
      '#telaCookieBanner .tc-actions button{flex:1;}' +
      '#telaCookieModal .tcm-box{padding:22px;}' +
    '}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function bannerHTML() {
    return '<div class="tc-inner">' +
      '<div class="tc-text">Sitemizde deneyimi iyileştirmek ve reklam performansını ölçmek için çerezler kullanıyoruz. Detaylar için <a href="/cerez-politikasi.html">Çerez Politikamızı</a> inceleyebilirsiniz.</div>' +
      '<div class="tc-actions">' +
      '<button class="tc-manage" onclick="window.telaCookieOpen()">Tercihleri Yönet</button>' +
      '<button class="tc-reject" onclick="window.telaCookieSave({analytics:false,marketing:false})">Sadece Zorunlu</button>' +
      '<button class="tc-accept" onclick="window.telaCookieSave({analytics:true,marketing:true})">Tümünü Kabul Et</button>' +
      '</div></div>';
  }

  function modalHTML(pref) {
    return '<div class="tcm-box" role="dialog" aria-modal="true" aria-labelledby="tcmTitle">' +
      '<h3 id="tcmTitle">Çerez Tercihleri</h3>' +
      '<p class="tcm-intro">Hangi çerez türlerini kabul ettiğinizi buradan seçebilirsiniz. Zorunlu çerezler sitenin çalışması için gereklidir ve devre dışı bırakılamaz.</p>' +
      '<div class="tcm-row">' +
        '<div class="tcm-row-info"><h4>Zorunlu Çerezler</h4><p>Sepet, oturum, güvenlik gibi temel işlevler için gereklidir. Kapatılamaz.</p></div>' +
        '<label class="tcm-toggle"><input type="checkbox" checked disabled><span class="slider"></span></label>' +
      '</div>' +
      '<div class="tcm-row">' +
        '<div class="tcm-row-info"><h4>Analitik Çerezler</h4><p>Site kullanımını anlamamıza ve performansı iyileştirmemize yardımcı olur (GA4, Clarity).</p></div>' +
        '<label class="tcm-toggle"><input type="checkbox" id="tcmAnalytics"' + (pref.analytics ? ' checked' : '') + '><span class="slider"></span></label>' +
      '</div>' +
      '<div class="tcm-row">' +
        '<div class="tcm-row-info"><h4>Pazarlama Çerezleri</h4><p>Reklam performansı ölçümü ve yeniden pazarlama için kullanılır (Meta Pixel).</p></div>' +
        '<label class="tcm-toggle"><input type="checkbox" id="tcmMarketing"' + (pref.marketing ? ' checked' : '') + '><span class="slider"></span></label>' +
      '</div>' +
      '<div class="tcm-actions">' +
        '<button class="tcm-cancel" onclick="window.telaCookieClose()">İptal</button>' +
        '<button class="tcm-save" onclick="window.telaCookieSaveFromModal()">Tercihleri Kaydet</button>' +
      '</div>' +
    '</div>';
  }

  function mount() {
    if (document.getElementById('telaCookieBanner')) return;
    var b = document.createElement('div');
    b.id = 'telaCookieBanner';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'Çerez bildirimi');
    b.innerHTML = bannerHTML();
    document.body.appendChild(b);

    var m = document.createElement('div');
    m.id = 'telaCookieModal';
    document.body.appendChild(m);

    setTimeout(function(){ b.classList.add('show'); }, 200);
  }

  window.telaCookieSave = function(pref) {
    var data = { ts: new Date().getTime(), analytics: !!pref.analytics, marketing: !!pref.marketing };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
    var b = document.getElementById('telaCookieBanner');
    if (b) b.classList.remove('show');
    var m = document.getElementById('telaCookieModal');
    if (m) m.classList.remove('show');
    // Google Consent Mode güncellemesi (varsa)
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        'analytics_storage': pref.analytics ? 'granted' : 'denied',
        'ad_storage': pref.marketing ? 'granted' : 'denied',
        'ad_user_data': pref.marketing ? 'granted' : 'denied',
        'ad_personalization': pref.marketing ? 'granted' : 'denied'
      });
    }
    // Onay degisikligini dinleyen bilesenler icin (or. Instagram akisi)
    try {
      document.dispatchEvent(new CustomEvent('telaConsentChange', { detail: data }));
    } catch (e) {}
  };

  window.telaCookieOpen = function() {
    var m = document.getElementById('telaCookieModal');
    if (!m) {
      mount();
      m = document.getElementById('telaCookieModal');
    }
    var cur = stored || { analytics: true, marketing: true };
    m.innerHTML = modalHTML(cur);
    m.classList.add('show');
    m.addEventListener('click', function(e) {
      if (e.target === m) window.telaCookieClose();
    });
  };

  window.telaCookieClose = function() {
    var m = document.getElementById('telaCookieModal');
    if (m) m.classList.remove('show');
  };

  window.telaCookieSaveFromModal = function() {
    var a = document.getElementById('tcmAnalytics');
    var mk = document.getElementById('tcmMarketing');
    window.telaCookieSave({
      analytics: a && a.checked,
      marketing: mk && mk.checked
    });
  };

  // Google Consent Mode varsayılan: reddet (kullanıcı tercih verene kadar)
  if (typeof gtag === 'function' && !stored) {
    gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'wait_for_update': 500
    });
  } else if (stored && typeof gtag === 'function') {
    gtag('consent', 'default', {
      'analytics_storage': stored.analytics ? 'granted' : 'denied',
      'ad_storage': stored.marketing ? 'granted' : 'denied',
      'ad_user_data': stored.marketing ? 'granted' : 'denied',
      'ad_personalization': stored.marketing ? 'granted' : 'denied'
    });
  }

  // DOM hazır olunca banner'ı göster (tercih henüz kayıtlı değilse)
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function() {
    if (!stored) mount();
  });
})();
