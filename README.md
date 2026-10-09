<div align="center">

# 📸 Instagram Masaüstü (Linux / CachyOS)

**CachyOS ve Linux masaüstü ortamları için ultra hafif, yerel WebKitGTK ve Tauri v2 tabanlı modern Instagram istemcisi.**

[![Rust](https://img.shields.io/badge/Rust-1.80%2B-orange?logo=rust)](https://www.rust-lang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-v2.0-24C8DB?logo=tauri)](https://tauri.app/)
[![WebKitGTK](https://img.shields.io/badge/Engine-WebKitGTK-blue)](https://webkitgtk.org/)
[![Version](https://img.shields.io/badge/Version-v0.1.3-green)](https://github.com/mustozilla11/instagram-desktop/releases)
[![Platform](https://img.shields.io/badge/Platform-Linux%20(KDE%2FGNOME)-lightgrey?logo=linux)](https://github.com/mustozilla11/instagram-desktop)
[![License](https://img.shields.io/badge/License-MIT-purple)](LICENSE)

</div>

---

## 🌟 Neden Bu Uygulama?

Web tabanlı sosyal medya uygulamalarının çoğu arka planda yüzlerce megabayt RAM tüketen, CPU'yu gereksiz yoran ve bataryayı tüketen hantal **Electron** paketleri kullanır.

Bu proje, sistemin yerel **WebKitGTK** motorunu ve **Rust (Tauri v2)** mimarisini kullanarak yalnızca **~12 MB** ikili dosya (binary) boyutuyla, minimum RAM ve işlemci kullanımıyla hafif bir deneyim sunar.

---

## ✨ Öne Çıkan Özellikler

- 🚀 **Ultra Hafif & Hızlı:** Electron yerine yerel WebKitGTK motoru; yaklaşık 12 MB binary boyutu ve minimum kaynak tüketimi.
- 🔒 **Güvenli PIN Kilit Ekranı:** Instagram tasarım diline uygun degrade vurgulu modern kilit ekranı. Şifreniz açık metin olarak değil, **SHA-256** ile özetlenerek izole yerel depolamada saklanır.
- 📌 **Sistem Tepsisi (Tray) Entegrasyonu:** Sağ üstteki `X` butonuna basıldığında uygulama kapanmaz; kilitlenip sistem tepsisine gizlenir ve arka planda çalışmaya devam eder.
- 🎞️ **Reels ve Video Donanım Çözümleme:** Instagram Reels akışında donma ve takılmaları önlemek için H.264 donanımsal video çözümleme önceliği ve profil desteği (`auto`, `safe`, `swdec`).
- 🍪 **Kalıcı Oturum (Beni Hatırla):** Çerezler, LocalStorage ve önbellek `~/.local/share/com.instagram.desktop` altında kalıcı olarak saklanır; her açılışta tekrar şifre istemez.
- 📱 **Esnek ve Mobil/DM Uyumlu Boyut:** 1200x800 varsayılan boyutunun yanı sıra, dikey mobil/DM görünümü için 400x600 piksele kadar daraltılabilir.
- 🐧 **Linux Masaüstü Entegrasyonu:** KDE Plasma ve GNOME uygulama menülerinde görünmesi için `.desktop` başlatıcısı ve `~/.local/bin` sembolik bağı (symlink).

---

## 📦 Kurulum ve Derleme

### Gereksinimler (CachyOS / Arch Linux)
Sisteminizde Rust ve WebKitGTK kütüphanelerinin bulunması yeterlidir:

```bash
sudo pacman -S rust cargo webkit2gtk-4.1 ayatana-appindicator3
```

### Kaynak Koddan Derleme

```bash
# Depoyu klonlayın
git clone https://github.com/mustozilla11/instagram-desktop.git
cd instagram-desktop

# Optimize edilmiş release sürümünü derleyin
cargo build --release
```

Derlenen ikili dosya `target/release/instagram-desktop` konumunda oluşturulur.

---

## 🚀 Masaüstü Entegrasyonu

Uygulamayı KDE / GNOME menüsüne eklemek ve terminalden tek komutla çalıştırmak için:

```bash
# Terminalden 'instagram-desktop' olarak çalıştırmak için sembolik bağ:
mkdir -p ~/.local/bin
ln -sf $(pwd)/target/release/instagram-desktop ~/.local/bin/instagram-desktop

# Uygulama menüsüne eklemek için:
mkdir -p ~/.local/share/applications
cp instagram-desktop.desktop ~/.local/share/applications/
update-desktop-database ~/.local/share/applications/
```

### Otomatik Başlatma (İsteğe Bağlı)
Bilgisayar açıldığında Instagram'ın arka planda sistem tepsisinde başlamasını isterseniz:

```bash
mkdir -p ~/.config/autostart
cp instagram-desktop.desktop ~/.config/autostart/
```

---

## 💡 Kullanım

- **Başlatma:** Başlat menüsünden **Instagram**'a tıklayın veya terminalden `instagram-desktop &` çalıştırın.
- **Sistem Tepsisi (Tray):**
  - **Sol Tık:** Pencereyi gösterir / gizler.
  - **Sağ Tık Menüsü:**
    - `Instagram v0.1.3` (Sürüm bilgisi)
    - `🔒 Uygulamayı Kilitle` (Pencereyi anında PIN kilidine alır)
    - `🔑 PIN Ayarla / Değiştir` (PIN kodunu günceller veya kaldırır)
    - `Instagram'ı Aç`
    - `Göster / Gizle`
    - `Yeniden Yükle`
    - `Çıkış` (Uygulamayı tamamen sonlandırır)

### Video ve Reels Performans Profilleri
Gerektiğinde farklı GPU/Wayland video işleme profilleriyle başlatabilirsiniz:

```bash
# Varsayılan (Donanım hızlandırma ve H.264)
instagram-desktop

# DMA-BUF devre dışı (Wayland arabellek çakışması durumunda)
IG_PROFILE=safe instagram-desktop

# Yazılımsal video çözümleme (Donanım çözücü kapalı)
IG_PROFILE=swdec instagram-desktop
```

---

## 📄 Lisans

Bu proje açık kaynak olarak geliştirilmiştir.
