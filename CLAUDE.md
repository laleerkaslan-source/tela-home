# Tela Home — telahome.store

Ev tekstili markası için statik e-ticaret sitesi. Build adımı yok: düz HTML/CSS/JS,
Cloudflare Workers üzerinden statik asset olarak yayınlanıyor.

## Yayın

```bash
npx wrangler deploy          # kok dizinden
```

`wrangler.jsonc` içindeki worker adı **`gun2`** — klasör `telahome` olarak yeniden
adlandırıldı ama worker adını değiştirme, canlı dağıtım ona bağlı.

Alan adı Cloudflare'da yönetiliyor (hesap: Laleerkaslan@gmail.com). E-posta için
Cloudflare Email Routing kullanılıyor, cPanel maili değil.

## Mimari

**Ana site** (bu repo) `telahome.store`. Üç alt alan adı **ayrı repolarda**:

| Alt alan | Klasör |
|---|---|
| `alez.telahome.store` | `~/Projeler/alez-telahome` |
| `punch.telahome.store` | `~/Projeler/punch-telahome` |
| `masaortu.telahome.store` | `~/Projeler/masaortu-telahome` |

Bir alt alan adında değişiklik gerekiyorsa **o repoda** çalış, burada değil.

### Sepet

- Depolama: `localStorage`, anahtar **`telaCart`**. Mantık `cart.js` içindeki `Cart` nesnesinde.
- Alt alan adları sepeti `shared-cart.js` + `cart-bridge.html` ile paylaşıyor:
  alt alan adı `telahome.store/cart-bridge.html`'i gizli iframe olarak yükler ve
  `postMessage` ile konuşur. Böylece sepet tüm alt alan adlarında ortak kalır.
- `cart-bridge.html` veya `shared-cart.js`'te değişiklik yaparsan üç alt alan adını da test et.

### Ödeme

- Sağlayıcı **iyzico**. Kartın kendisi sitede işlenmiyor.
- Akış: `odeme.html` → `https://telahome-pay.laleerkaslan.workers.dev/create-payment`
  (ayrı bir Cloudflare Worker) → iyzico → dönüş `odeme-sonuc.html`.
- Worker'ın kodu bu repoda değil; Cloudflare hesabındaki `telahome-pay` worker'ında.
- Ödeme formu `novalidate` kullanıyor, doğrulama JS tarafında yapılıyor — tarayıcının
  yerleşik doğrulamasını geri açma, akış bozuluyor.

## Sayfalar

- Kök: `index.html`, `sepet.html`, `odeme.html`, `odeme-sonuc.html`, `404.html`
- Ürün: `magaza/index.html`, `salon-takimi/diva-5-parca.html`, `alez.html`,
  `ayakkabi-hurcu.html`, `madam-gamze.html`
- Blog: `blog/` — 8 rehber yazısı + `blog/index.html`
- Yasal: `mesafeli-satis-sozlesmesi.html`, `on-bilgilendirme.html`, `iade-teslimat.html`,
  `gizlilik-politikasi.html`, `kvkk.html`, `cerez-politikasi.html`

## Dikkat edilecekler

- **Taksit yok.** Tüm siparişler tek çekim; pazarlama metinlerindeki taksit ifadeleri
  bilinçli olarak temizlendi, yenisini ekleme. İki yer bilerek duruyor:
  `on-bilgilendirme.html` bunu açıkça beyan ediyor, `odeme-sonuc.html` ise iyzico
  1'den büyük taksit döndürürse gösteren savunma amaçlı bir koşul içeriyor — ikisi de
  artık değil, silme.
- **Yasal sayfalar mevzuata göre düzenlendi** (Mesafeli Satış, Ön Bilgilendirme, Çerez,
  Gizlilik). Bu sayfaların metnini keyfi olarak sadeleştirme.
- **Görseller LCP için optimize edildi** (~1,2 MB tasarruf sağlandı). Yeni görsel
  eklerken boyut/lazy-loading dengesini bozma.
- Çerez banner'ı `cookie-banner.js` ile yönetiliyor.

## Kod tarzı

Framework yok, derleme yok. Mevcut dosyaların düzenine uy: sade HTML, sayfa içi
`<style>`/`<script>` yerine paylaşılan `script.js` ve `cart.js`, Türkçe içerik ve
Türkçe commit mesajları.
