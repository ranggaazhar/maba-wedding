# Dokumen Skenario & Lembar Evaluasi UAT (User Acceptance Testing)
**Sistem Aplikasi Web: Maba Wedding (Wedding Organizer & Rental Service)**

Dokumen ini disusun sebagai lembar evaluasi **User Acceptance Testing (UAT)** yang berfokus pada **Usability Testing (Kemudahan Penggunaan)**. Setiap butir pernyataan dirancang untuk mengukur tingkat kepuasan, kemudahan, kejelasan informasi, keandalan, dan efisiensi sistem berdasarkan **Analisis Kebutuhan Sistem Maba Wedding** yang telah ditetapkan.

---

### Referensi Analisis Kebutuhan Sistem:
1. **Kebutuhan Fungsional**:
   * **KF-A**: Fitur login pengguna (Admin).
   * **KF-B**: Fitur pemesanan dan review layanan dekorasi oleh pelanggan.
   * **KF-C**: Fitur pengelolaan portofolio hasil dekorasi (proyek & properti) oleh administrator.
   * **KF-D**: Fitur pengelolaan pemesanan pelanggan.
   * **KF-E**: Fitur konfirmasi dan manajemen status pesanan.
   * **KF-F**: Fitur pengelolaan review pelanggan (moderasi).
   * **KF-G**: Fitur pengelolaan invoice.
2. **Kebutuhan Non-Fungsional**:
   * **KNF-A**: Keamanan autentikasi pengguna menggunakan token berbasis JWT.
   * **KNF-B**: Antarmuka yang responsif dan dapat diakses dari berbagai perangkat (HP/Komputer).

---

## BAGIAN 1: USER ACCEPTANCE TESTING (UAT) - ROLE ADMIN

Evaluasi ini digunakan oleh Admin untuk menilai tingkat kemudahan pengoperasian panel kontrol admin dalam mengelola pesanan, mengedit katalog, menerbitkan invoice, dan mengelola ulasan pelanggan.

### Lembar Pernyataan Usability Testing (Admin)
*Berikan tanda centang (`[x]`) pada kolom pilihan jawaban yang paling sesuai berdasarkan pengalaman Anda:*
* **STS**: Sangat Tidak Setuju (Nilai 1)
* **TS**: Tidak Setuju (Nilai 2)
* **N**: Netral (Nilai 3)
* **S**: Setuju (Nilai 4)
* **SS**: Sangat Setuju (Nilai 5)

| No. | Pernyataan Evaluasi (Usability & Kemudahan Admin) | Kebutuhan Terkait | STS | TS | N | S | SS |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | Proses masuk (login) ke sistem admin terasa mudah dipahami, cepat, dan langkah-langkah keamanannya tidak menyulitkan admin. | **KF-A**, **KNF-A** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **2** | Struktur navigasi menu sidebar sangat intuitif sehingga memudahkan admin berpindah-pindah halaman secara cepat. | **Usability (Navigasi)** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **3** | Informasi grafik keuangan dan jumlah statistik pesanan bulanan di Dashboard disajikan secara sederhana dan mudah dimengerti maknanya. | **KF-D** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **4** | Alur pengisian formulir untuk mengunggah dan mempublikasikan katalog foto proyek dekorasi baru sangat ringkas dan gampang dioperasikan. | **KF-C** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **5** | Pengelolaan stok barang dan harga sewa satuan di halaman inventaris properti sewaan mudah dipahami dan bebas dari langkah yang membingungkan. | **KF-C** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **6** | Fitur pembuatan link booking generator sekali pakai terasa praktis sehingga mempercepat proses persiapan pendaftaran pelanggan baru. | **KF-D** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **7** | Sistem menyajikan rincian pesanan pelanggan secara transparan dan lengkap, sangat memudahkan koordinasi dengan tim dekorasi lapangan agar tidak salah kerja. | **KF-D** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **8** | Alur untuk mengubah status pembayaran DP (konfirmasi pembayaran) dan memperbarui status pesanan pelanggan sangat mudah dilakukan. | **KF-E** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **9** | Proses penginputan tagihan biaya tambahan dan pencetakan dokumen PDF Invoice sangat praktis serta menghasilkan dokumen yang mudah dibaca. | **KF-G** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **10** | Alur untuk memoderasi ulasan pelanggan (meninjau, membalas, dan mempublikasikan testimoni) berjalan secara ringkas dan gampang dikelola. | **KF-F** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **11** | **Rangkuman**: Secara keseluruhan, panel admin Maba Wedding sangat mudah digunakan dan seluruh alur pengelolaannya gampang dipahami. | **Usability (Umum)** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |

---

## BAGIAN 2: USER ACCEPTANCE TESTING (UAT) - ROLE PELANGGAN

Evaluasi ini digunakan oleh pelanggan untuk menilai tingkat kemudahan pengisian form booking, kenyamanan antarmuka, kejelasan info harga, dan kemudahan transaksi.

### Lembar Pernyataan Usability Testing (Pelanggan)
*Berikan tanda centang (`[x]`) pada kolom pilihan jawaban yang paling sesuai berdasarkan pengalaman Anda:*

| No. | Pernyataan Evaluasi (Usability & Kemudahan Pelanggan) | Kebutuhan Terkait | STS | TS | N | S | SS |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | Tautan booking sekali pakai dapat diakses langsung secara instan di HP/komputer tanpa mewajibkan registrasi atau login yang merepotkan. | **KNF-B** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **2** | Langkah-langkah pengisian form booking (Step 1 s.d Step 5) terstruktur secara runtut, logis, dan gampang diikuti oleh pelanggan. | **KF-B** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **3** | Fitur pengisian otomatis (*auto-fill*) Nama dan No HP saat membuka link booking sangat mempermudah dan mempercepat proses pengisian data diri. | **KF-B** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **4** | Daftar harga (*price list*) paket dekorasi dan sewa properti tambahan disajikan secara jelas di dalam website sehingga mudah dipahami. | **KF-B** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **5** | Kehadiran website ini memberikan kejelasan informasi yang sangat baik mengenai ketersediaan layanan dan alat dekorasi yang ditawarkan Maba Wedding. | **KF-B** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **6** | Proses memilih paket dekorasi dari katalog digital serta menambahkan rental alat tambahan ke dalam daftar pesanan terasa mudah dan interaktif. | **KF-B** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **7** | Fitur pengisian kustom request dan unggah gambar referensi dekorasi sangat membantu pelanggan untuk menyampaikan konsep acara impian mereka. | **KF-B** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **8** | Rincian perhitungan total biaya sewa dan nominal minimal DP 10% ditampilkan secara transparan dan mudah dipahami sebelum pemesanan dikirim. | **KF-B** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **9** | Petunjuk nomor rekening bank dan cara mengunggah foto bukti transfer DP di layar pembayaran sangat jelas dan mudah dilakukan. | **KF-B** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **10** | Sistem memberikan transparansi informasi dengan langsung menyajikan detail pemesanan dan invoice tagihan sebagai konfirmasi instan setelah pelanggan men-submit pemesanan. | **KF-B** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **11** | Formulir untuk mengirimkan rating bintang dan testimoni ulasan kepuasan layanan setelah acara selesai mudah diisi dan cepat dikirimkan. | **KF-B** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **12** | **Rangkuman**: Secara keseluruhan, proses pemesanan melalui website Maba Wedding sangat mudah digunakan dan seluruh alurnya mudah dipahami. | **Usability (Umum)** | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
