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
- Tüm bölümler aynı alan adında olduğu için sepet doğrudan `localStorage`'a yazılıyor.
  `shared-cart.js` içindeki `AYNI_ORIGIN` bayrağı iframe köprüsünü devre dışı bırakır;
  köprü (`cart-bridge.html`) yalnızca alt alan adı döneminin kalıntısı.
- **Sepete eklenen görsel yolları mutlak olmalı** (`/alez/images/...`). Göreli yol
  verilirse sepet başka bir sayfada çizildiğinde 404 veriyor.
- Ürün sayfalarındaki "Hemen Satın Al" düğmeleri sepete ekleyip `/odeme.html`'e gider
  (iyzico akışı). QNB Pay sabit linkleri artık kullanılmıyor.

### Ödeme

- İki ödeme yöntemi var, `odeme.html` üstündeki `.pay-select` ile seçiliyor:
  **kredi/banka kartı** (iyzico) ve **kapıda nakit ödeme**.
- Kapıda ödemenin arka ucu yok: form doğrulandıktan sonra sipariş + adres bilgisi
  önceden doldurulmuş bir WhatsApp mesajına çevrilip `wa.me/905063977307` açılıyor.
  Yöntem değiştiğinde `yontemiUygula()` alanları, başlığı ve butonu güncelliyor.
- **E-posta her iki yöntemde de isteğe bağlı.** Kart ödemesinde boş bırakılırsa,
  iyzico `buyerEmail`'i zorunlu tuttuğu için istek `siparis-<telefon>@telahome.store`
  ile gönderiliyor — bu adres yalnızca kayıt alanı, posta gitmiyor. Girilen e-posta
  varsa olduğu gibi iletiliyor; hatalı biçimde girilirse form yine engelliyor.
- Kapıda ödeme `on-bilgilendirme.html` md.4 ve `mesafeli-satis-sozlesmesi.html` md.5.1'de
  beyan edilmiş durumda — ödeme yöntemlerini değiştirirsen bu iki metni de güncelle.
- **Meta `InitiateCheckout` `<head>`'de değil, sepet dolu doğrulandıktan sonra
  basılıyor** (GA4 `begin_checkout`'un yanında), sepet tutarı ve ürünlerle birlikte.
  Eskiden sayfa yüklenirken koşulsuz basılıyordu: boş sepetle ödeme sayfasını açan
  ziyaretçi de "ödemeye başladı" sayılıyor ve Meta sepet değerini hiç öğrenmiyordu.
  Yeni etkinlik eklerken aynı kuralı izle — koşulsuz `<head>` etkinliği ekleme.
- **Kapıda ödemede Meta'ya `Lead` basılıyor, `Purchase` değil.** WhatsApp'a yönlenmek
  siparişin kesinleştiği anlamına gelmiyor (teyit telefonla alınıyor), bu yüzden
  Purchase basmak reklam raporuna olmayan ciro yazar. GA4 tarafında aynı an için
  `kapida_odeme_siparis` özel etkinliği var. Gerçek kapıda ödeme cirosu bu iki
  sayıdan değil, teyit edilen siparişlerden sayılmalı.
- **`#iyzipay-checkout-form` div'i `odeme.html`'den silinmemeli.** iyzico'nun
  `bundle.js`'i kart formunu çizmek için sayfada bu id'yi arar; bulamazsa `<body>`
  sonuna sınıfsız bir div üretir ve form 0 piksel yükseklikte görünmez kalır —
  müşteri boş ekran görür, hata mesajı da çıkmaz. `class="responsive"` formu sayfa
  içine gömer. `#iyzicoForm`'un *içine* konulamaz, çünkü oraya `innerHTML` ile
  yazılıyor. (Bu hata 4 Nisan – 17 Kasım 2026 arası canlıda duruyordu.)
- **`/create-payment` isteği 3 kez deneniyor.** iyzico'nun `api.iyzipay.com` ucu
  arada zaman aşımına düşüyor (Cloudflare 522, ölçüm: ~25 istekte 1). Hata geçici,
  sonraki deneme dönüyor. 5xx / ağ hatası / bozuk JSON tekrar denenir; HTTP 200 +
  `status != success` kalıcı sayılır ve tekrar denenmez.
- **Müşteriye ham teknik hata gösterilmiyor.** Worker'ın `data.error` alanı yalnızca
  konsola yazılır; ekrana iyzico'nun `data.message`'ı veya anlaşılır bir metin +
  WhatsApp numarası basılır. Eskiden `data.error` doğrudan gösteriliyordu ve müşteri
  "Unexpected token 'e'... is not valid JSON" görüyordu.
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

- **Taksit VAR.** (Eskiden bu satır "taksit yok" diyordu — yanlıştı, 17 Kasım 2026'da
  düzeltildi.) iyzico panelinde *Ayarlar → Taksit ve Komisyon Oranları* altında 2/3/6/9/12
  taksit yedi kart ailesi için açık; canlı ödeme formunda 2.450 TL'lik sepette 2/3/6
  taksit göründüğü doğrulandı. **Vade farkını müşteri ödüyor** — panelde "Hesaba
  Aktarılacak Tutar" her taksit satırında aynı (%95,46), yani taksit satıcıya maliyet
  getirmiyor. Beyan iki yerde: `on-bilgilendirme.html` md.4 ve
  `mesafeli-satis-sozlesmesi.html` md.5.1 — panelden taksit ayarını değiştirirsen bu iki
  metni de güncelle, aksi halde mevzuata aykırı çelişki oluşur.
  `odeme-sonuc.html` md.116'daki taksit gösterimi artık savunma amaçlı değil, fiilen
  kullanılıyor — silme.
  *Neden yanlış bilindi:* kart formu 4 Nisan – 17 Kasım 2026 arası hiç açılmıyordu
  (eksik `#iyzipay-checkout-form` div'i), bu yüzden taksit fiilen kimseye görünmedi ve
  metinler "taksit yok" diye yazıldı. Form düzelince çelişki ortaya çıktı.
- **Ürün sayfasındaki taksit kutusu** `style.css` + `script.js` içinde; sayfaya tek
  satır gerekiyor: `<div class="taksit-box" data-taksit-fiyat="2450"></div>`.
  Oranlar `script.js`'teki `TAKSIT_ORANLARI` sabitinde, iyzico panelinden alınma —
  panelde oran değişirse orayı güncelle. Tutarlar **tam lira ve "~" ile** gösteriliyor;
  iyzico'nun hesabı kuruşta tutmadığı (kendi ekranında bile 1 kuruş tutarsızlık var)
  için kuruşlu tutar yazma, yanıltıcı olur. Bağlayıcı tutar ödeme ekranındaki.
  Şu an yalnızca `salon-takimi/diva-5-parca.html`'de deneme olarak duruyor.
  Açılışta GA4'e `taksit_goruntule` etkinliği gidiyor — yayıp yaymamaya bu veriyle
  karar verilecek.
- **Yeni bir fiyat bandına taksit kutusu eklerken önce ödeme formunda o taksitlerin
  gerçekten çıktığını doğrula.** 9 ve 12 taksit panelde tanımlı ama 2.450 TL'lik
  sepette iyzico sunmadı. Olmayan taksiti vaat etmek yanıltıcı ticari uygulama olur.
- **Yasal sayfalar mevzuata göre düzenlendi** (Mesafeli Satış, Ön Bilgilendirme, Çerez,
  Gizlilik). Bu sayfaların metnini keyfi olarak sadeleştirme.
- **Görseller LCP için optimize edildi** (~1,2 MB tasarruf sağlandı). Yeni görsel
  eklerken boyut/lazy-loading dengesini bozma.
- Çerez banner'ı `cookie-banner.js` ile yönetiliyor.

## Kod tarzı

Framework yok, derleme yok. Mevcut dosyaların düzenine uy: sade HTML, sayfa içi
`<style>`/`<script>` yerine paylaşılan `script.js` ve `cart.js`, Türkçe içerik ve
Türkçe commit mesajları.
