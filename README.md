# AYEP Tayin Talep Projesi

**(AYEP)** için basit bir tayin talep uygulaması.

## Özellikler

- **Index**: Güncel tayin talepleri ve kullanıcı listesi görüntüleme  
- **Login**: Sicil ve şifre doğrulaması  
- **Kullanıcı Paneli**:  
  - Profil görüntüleme & şifre değiştirme  
  - Yeni tayin talebi oluşturma  
  - Önceki talepleri listeleme, silme, düzenleme  
- **Admin Paneli**:  
  - Kullanıcı yönetimi (ekle, sil, düzenle)  
  - JSON tabanlı veri depolama  
  - Görev yeri dropdown’u (81 il)  
- **Node.js + Express** backend:  
  - `GET /api/users` / `POST /api/users`  
  - `GET /api/tayinTalep` / `POST /api/tayinTalep`

## Kurulum

1. Depoyu klonlayın:  
   ```bash
   git clone https://github.com/KullaniciAdiniz/ayep-tayin-talep.git
   cd ayep-tayin-talep
