TERM OF REFERENCE (TOR)

# PENGEMBANGAN DASHBOARD UNTUK KEPERLUAN REQUEST DATA
## SISTEM TRACER STUDY ITB

---

Term of Reference (TOR) merupakan dokumen yang berisi pernyataan kebutuhan pengguna yang sangat beragam, yaitu mulai dari deskripsi kebutuhan yang paling umum sampai dengan deskripsi kebutuhan detail.

## 1. Latar Belakang dan Tujuan Pekerjaan

Kerja Praktek (KP) merupakan salah satu kegiatan wajib bagi mahasiswa Institut Teknologi Bandung (ITB) sebagai bagian dari kurikulum pendidikan tinggi ITB yang memungkinkan mahasiswa untuk menerapkan pengetahuan yang diajarkan di perkuliahan ke dalam lingkungan kerja yang lebih nyata.

ITB Career Center - Divisi Tracer Study memerlukan sistem digital yang dapat mengelola permintaan data tracer study alumni secara efisien dan terstruktur. Saat ini, pengelolaan permintaan data tracer seringkali dilakukan secara manual, kurang terdokumentasi, dan memakan waktu yang lama. Hal ini menimbulkan tantangan dalam hal efisiensi, transparansi, serta kecepatan layanan data kepada pengguna.

Untuk menjawab permasalahan tersebut, dikembangkanlah Dashboard Tracer Study ITB - Data Request Management System, sebuah platform digital yang memungkinkan proses pengajuan dan pengelolaan permintaan data dilakukan secara terintegrasi. Melalui KP ini, mahasiswa akan berperan sebagai System Analyst dan Developer yang bertanggung jawab untuk menganalisis, merancang, dan mengembangkan sistem informasi yang sesuai dengan kebutuhan operasional tracer study.

## 2. Ruang Lingkup Pekerjaan

Selama masa KP di ITB Career Center, mahasiswa akan bertanggung jawab atas ruang lingkup pekerjaan sebagai berikut:

### A. Analisis dan Perancangan Sistem
- Melakukan analisis terhadap proses bisnis pengelolaan request data tracer study
- Menyusun dokumen Spesifikasi Kebutuhan Perangkat Lunak (SKPL) sesuai standar
- Membuat dokumentasi teknis meliputi Use Case Diagram, Flowchart, Sequence Diagram, dan Class Diagram
- Merancang arsitektur sistem two-tier (server 195.226 dan 195.2)

### B. Pengembangan Backend
- Implementasi REST API menggunakan Golang dengan framework Gin
- Integrasi dengan database PostgreSQL
- Pengembangan fitur authentication berbasis JWT
- Implementasi auto-query generator berdasarkan mapping pertanyaan
- Pengembangan sistem email notification dan file handling

### C. Pengembangan Frontend
- Implementasi user interface untuk admin dashboard menggunakan React
- Pengembangan komponen request management dengan fitur filtering dan search
- Implementasi data preview component dengan SQL editor
- Pengembangan analytics dashboard dengan visualisasi data
- Integrasi dengan web tracer existing untuk user request submission

### D. Testing dan Deployment
- Melakukan integration testing antara kedua server
- Testing fungsionalitas email delivery dan large file handling
- Performance testing untuk query execution
- Deployment ke environment production

## 3. Hasil Pekerjaan

Produk atau hasil akhir yang diharapkan dari pelaksanaan kerja praktik ini adalah:

### A. Dokumentasi Sistem
- Dokumen Term of Reference (TOR)
- Dokumen Spesifikasi Kebutuhan Perangkat Lunak (SKPL)
- Dokumentasi Use Case (14 use case)
- Dokumentasi teknis meliputi flowchart, sequence diagram, dan class diagram
- Dokumentasi API endpoints
- Manual book penggunaan sistem

### B. Aplikasi Dashboard
- **Backend System**: REST API dengan 12+ endpoints untuk mengelola data