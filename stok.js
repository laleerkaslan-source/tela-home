/* ===== Stokta olmayan ürünler — TEK LİSTE =====

   Buradaki id'ler ödeme sayfasında sepetten otomatik çıkarılır.

   Neden gerekli: ürün sayfasındaki satın alma butonlarını kaldırmak, o ürünü
   DAHA ÖNCE sepete eklemiş birinin sepetinden silmiyor — sepet localStorage'da
   duruyor. O kişi doğrudan /odeme.html'e gidip stokta olmayan ürünün parasını
   ödeyebilir; sonra iade, komisyon kaybı ve özür gerekir. Bu liste o deliği
   kapatıyor.

   STOK GELİNCE yapılacaklar (hepsi birlikte, yarısı yapılırsa sayfa yalan söyler):
     1. id'yi aşağıdaki listeden sil
     2. Ürün sayfasındaki "Gelince Haber Ver" bölümünü eski butonlara döndür
     3. JSON-LD'deki "availability" değerini InStock yap
     4. "Stokta yok" rozetini "Stokta var" haline getir

   Bkz. CLAUDE.md > Dikkat edilecekler.
*/
window.STOKTA_OLMAYAN = ['ayakkabi-hurcu'];

window.stoktaYokMu = function (id) {
  return (window.STOKTA_OLMAYAN || []).indexOf(id) > -1;
};
