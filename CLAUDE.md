# Tela Home — telahome.store

Ev tekstili markası için statik e-ticaret sitesi. Build adımı yok: düz HTML/CSS/JS,
GitHub Pages üzerinden yayınlanıyor.

## Yayın

Site **GitHub Pages** ile yayınlanıyor — repo `laleerkaslan-source/tela-home`,
kaynak `main` dalı, kök dizin. Yayınlamak için `main`'e push etmek yeterli:

```bash
git push origin main       # GitHub Pages otomatik yeniden kurar (~1 dk)
```

Önünde **Cloudflare proxy** var (alan adı Cloudflare'da yönetiliyor, hesap:
Laleerkaslan@gmail.com) ama içerik GitHub'dan geliyor.

`wrangler.jsonc` içindeki **`gun2`** worker'ı canlı alan adına bağlı DEĞİL —
`npx wrangler deploy` yalnızca `gun2.laleerkaslan.workers.dev` adresini günceller,
telahome.store'u etkilemez. Staging olarak kullanılabilir.

İki ayrı hariç tutma dosyası var, ikisini de güncel tut:
- `_config.yml` → GitHub Pages (canlı site) için geçerli olan
- `.assetsignore` → yalnızca `gun2` worker'ı için

E-posta için Cloudflare Email Routing kullanılıyor, cPanel maili değil.

## Mimari

**Tek alan adı**: `telahome.store`. Eskiden üç ayrı alt alan adı vardı; SEO otoritesini
böldükleri için ana alan adı altına taşındılar (2026-09-04):

| Eski alt alan | Yeni yol | Eski repo (arşiv) |
|---|---|---|
| `alez.telahome.store` | `/alez/` | `~/Projeler/alez-telahome` |
| `punch.telahome.store` | `/kirlent/` | `~/Projeler/punch-telahome` |
| `masaortu.telahome.store` | `/masa-ortusu/` | `~/Projeler/masaortu-telahome` |

Artık **tüm değişiklik bu repoda** yapılır. Eski repolar yalnızca arşiv — oraya bir şey
yazma. Alt alan adları Cloudflare Redirect Rules ile 301 olarak yeni yollara yönlendirilmeli
(bkz. Dikkat edilecekler).

### Sepet

- Depolama: `localStorage`, anahtar **`telaCart`**. Mantık `cart.js` içindeki `Cart` nesnesinde.
- Tüm bölümler artık aynı alan adında olduğu için sepet doğal olarak paylaşılıyor.
  `shared-cart.js` + `cart-bridge.html` köprüsü geçiş süresince duruyor; alt alan adı
  yönlendirmeleri doğrulandıktan sonra sadeleştirilebilir.

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
