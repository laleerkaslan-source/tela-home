#!/usr/bin/env python3
"""
Instagram gonderilerini cekip siteye gomer.

Ucuncu parti widget yok: kapak gorselleri kendi sunucumuza indirilir,
HTML dogrudan index.html icine yazilir. Boylece sayfa hizli kalir,
cerez onayi gerekmez ve gorseller Google Gorseller'de cikabilir.

Ortam degiskeni: IG_TOKEN (uzun omurlu Instagram erisim anahtari)
"""
import html as html_mod
import json, os, pathlib, re, sys, urllib.parse, urllib.request

API      = "https://graph.instagram.com"
ADET     = 6                     # sayfada gosterilecek gonderi sayisi
GENISLIK = 420                   # kapak gorseli genisligi (px)
KOK      = pathlib.Path(__file__).resolve().parent.parent
GORSEL   = KOK / "images" / "instagram"
SAYFA    = KOK / "index.html"
BAS, BIT = "<!-- INSTAGRAM:BASLANGIC -->", "<!-- INSTAGRAM:BITIS -->"


def istek(url):
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        govde = e.read().decode(errors="replace")[:600]
        raise RuntimeError(f"HTTP {e.code} - Meta yaniti: {govde}") from None


def gonderileri_al(token):
    alanlar = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp"
    url = f"{API}/me/media?" + urllib.parse.urlencode(
        {"fields": alanlar, "limit": ADET * 3, "access_token": token})
    return istek(url).get("data", [])


def kapak_url(g):
    """Reels/video icin thumbnail_url, fotograf icin media_url."""
    return g.get("thumbnail_url") or g.get("media_url")


def alt_metni(g):
    alt = (g.get("caption") or "").strip().replace("\n", " ")
    alt = re.sub(r"#\w+", "", alt)                 # etiketleri at
    alt = re.sub(r"\s+", " ", alt).strip(" -–—·|")
    if not alt:
        alt = "Tela Home ev tekstili"
    if len(alt) > 110:
        alt = alt[:107].rsplit(" ", 1)[0] + "..."
    tur = "video" if g.get("media_type") == "VIDEO" else "gonderi"
    return html_mod.escape(f"{alt} - Tela Home Instagram {tur}", quote=True)


def gorsel_indir(url, hedef):
    from PIL import Image, ImageOps
    import io
    with urllib.request.urlopen(url, timeout=60) as r:
        ham = r.read()
    im = ImageOps.exif_transpose(Image.open(io.BytesIO(ham))).convert("RGB")
    im = ImageOps.fit(im, (GENISLIK, GENISLIK), Image.LANCZOS)   # kare kirp
    im.save(hedef, "WEBP", quality=78, method=6)
    return hedef.stat().st_size


def html_uret(gonderiler):
    sat = [BAS, '      <div class="insta-grid">']
    for g in gonderiler:
        sat.append(
            f'        <a href="{html_mod.escape(g["permalink"], quote=True)}" class="insta-item" target="_blank" rel="noopener"'
            f' aria-label="Instagram\'da aç">'
            f'<img src="/images/instagram/{g["dosya"]}" alt="{g["alt"]}"'
            f' width="{GENISLIK}" height="{GENISLIK}" loading="lazy" decoding="async">'
            + ('<span class="insta-video" aria-hidden="true"></span>' if g["video"] else "")
            + "</a>")
    sat += ["      </div>", "      " + BIT]
    return "\n".join(sat)


def main():
    token = os.environ.get("IG_TOKEN", "").strip()
    if not token:
        print("IG_TOKEN yok - atlaniyor", file=sys.stderr); return 0

    print(f"anahtar onegi: {token[:4]}...  uzunluk: {len(token)}", file=sys.stderr)
    try:
        ham = gonderileri_al(token)
    except Exception as e:
        print(f"Instagram API hatasi: {e}", file=sys.stderr); return 1
    if not ham:
        print("Gonderi donmedi - mevcut icerik korunuyor", file=sys.stderr); return 0

    GORSEL.mkdir(parents=True, exist_ok=True)
    secilen, kullanilan = [], set()
    for g in ham:
        if len(secilen) >= ADET:
            break
        url = kapak_url(g)
        if not url:
            continue
        dosya = f"{g['id']}.webp"
        try:
            boyut = gorsel_indir(url, GORSEL / dosya)
        except Exception as e:
            print(f"  gorsel atlandi ({g['id']}): {e}", file=sys.stderr); continue
        kullanilan.add(dosya)
        secilen.append({"dosya": dosya, "alt": alt_metni(g),
                        "permalink": g["permalink"],
                        "video": g.get("media_type") == "VIDEO"})
        print(f"  {dosya}  {boyut//1024} KB  {'video' if g.get('media_type')=='VIDEO' else 'foto'}")

    if not secilen:
        print("Hic gorsel indirilemedi - mevcut icerik korunuyor", file=sys.stderr); return 0

    # artik kullanilmayan eski gorselleri temizle
    for eski in GORSEL.glob("*.webp"):
        if eski.name not in kullanilan:
            eski.unlink(); print(f"  silindi: {eski.name}")

    s = SAYFA.read_text(encoding="utf-8")
    if BAS not in s or BIT not in s:
        print("index.html'de INSTAGRAM isaretleyicileri yok", file=sys.stderr); return 1
    yeni = re.sub(re.escape(BAS) + r".*?" + re.escape(BIT), html_uret(secilen), s, flags=re.S)
    if yeni != s:
        SAYFA.write_text(yeni, encoding="utf-8"); print(f"index.html guncellendi ({len(secilen)} gonderi)")
    else:
        print("degisiklik yok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
