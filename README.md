# GuruWeb Gratis

Starter kit aplikasi administrasi guru tanpa hosting berbayar.

## Arsitektur
- GitHub: source code
- GitHub Pages: website
- Google Apps Script: API
- Google Sheets: penyimpanan data

## Instalasi singkat
1. Siapkan Google Sheet dengan tab `settings`, `kelas`, dan `siswa`.
2. Pasang isi `apps-script/Code.gs` pada Apps Script.
3. Deploy Apps Script sebagai Web App.
4. Salin URL `/exec`.
5. Buka `js/config.js`, lalu ganti `PASTE_URL_APPS_SCRIPT_DI_SINI`.
6. Upload seluruh file/folder ke repository GitHub.
7. Aktifkan GitHub Pages dari branch `main`, folder `/ (root)`.

## Catatan keamanan
Versi ini adalah prototipe pembelajaran. Endpoint Apps Script yang di-deploy untuk `Anyone` dapat diakses publik. Gunakan data contoh terlebih dahulu. Sebelum dipakai untuk data siswa sebenarnya, tambahkan autentikasi dan pembatasan akses.

## Lisensi
Disarankan MIT License agar dapat dipelajari, disalin, dan dikembangkan oleh guru lain.
