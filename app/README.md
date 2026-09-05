# Med Klinik — Klinik Uygulaması

Klinik çalışanlarının ve o kliniğin hastalarının giriş yapabildiği, aralarında
mesajlaşabildikleri ve randevu oluşturup yönetebildikleri web uygulaması.

## Özellikler

- **Rol tabanlı giriş**: Kayıt sırasında "Hasta" veya "Klinik Çalışanı" rolü seçilir.
- **Klinikler**: Bir çalışan yeni klinik oluşturduğunda otomatik bir davet kodu
  üretilir. Diğer çalışanlar ve hastalar bu kodla aynı kliniğe katılır.
- **Randevular**: Hastalar randevu talebi oluşturur; klinik çalışanları
  kliniklerine gelen tüm talepleri görüp onaylar/reddeder.
- **Mesajlaşma**: Her hasta, kliniğiyle gerçek zamanlı bir sohbet yürütür;
  klinikteki tüm çalışanlar bu sohbeti görüp yanıtlayabilir.

## Teknoloji

- React + Vite
- React Router
- Firebase (Authentication + Firestore)

## Kurulum

```bash
npm install
```

### Firebase projesi

1. [Firebase Console](https://console.firebase.google.com/)'da yeni bir proje oluşturun.
2. **Authentication** bölümünde "E-posta/Şifre" giriş yöntemini etkinleştirin.
3. **Firestore Database** oluşturun (production mode).
4. Proje ayarlarından bir Web App ekleyin ve verilen yapılandırma değerlerini
   `.env.local` dosyasına yazın (örnek için `.env.example` dosyasına bakın):

```bash
cp .env.example .env.local
# .env.local içindeki değerleri Firebase konsolundan doldurun
```

5. Güvenlik kurallarını dağıtın (Firebase CLI kuruluysa):

```bash
firebase deploy --only firestore:rules
```

Kurallar `firestore.rules` dosyasında tanımlıdır: hastalar yalnızca kendi
randevu/mesajlarını, klinik çalışanları ise kendi kliniklerine ait tüm veriyi
görebilir.

## Geliştirme

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Notlar / Sonraki Adımlar

- Şu an tek bir Firebase projesi tüm klinikleri barındırıyor (veri
  `clinicId` alanıyla izole ediliyor). Çok büyük ölçek için klinik başına
  ayrı proje/tenant modeline geçilebilir.
- Google ile giriş, dosya/fotoğraf yükleme (Cloud Storage) ve OCR/AI destekli
  arama gibi `privacy-policy` sayfasında bahsi geçen özellikler bu MVP'ye
  henüz eklenmedi; mevcut mimari (Firebase Auth + Firestore) bunları
  eklemeye uygun şekilde kuruldu.
