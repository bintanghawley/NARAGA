import { GoogleGenAI } from "@google/genai";

export interface UserLocationContext {
  ip?: string;
  road?: string;
  village?: string;
  district?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  displayName?: string;
  isp?: string;
}

export interface AIContextGrounding {
  communityName?: string;
  readinessScore?: number;
  facilityGaps?: string[];
  awarenessGaps?: string[];
  userRole?: string;
  userLocation?: UserLocationContext;
}

export async function askGeminiAssistant(
  prompt: string,
  context?: AIContextGrounding
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // Validasi format API Key Google Gemini:
  // Kunci API resmi Google AI Studio selalu diawali dengan "AIzaSy" atau "AIza" dengan panjang minimal 35 karakter.
  // Jika tidak diset, bernilai "mock", atau format kunci tidak valid, langsung gunakan fallback cerdas NARAGA instan (< 10ms).
  const isRealGeminiKey = Boolean(
    apiKey &&
    apiKey !== "mock" &&
    apiKey.startsWith("AIza") &&
    apiKey.length >= 35
  );

  if (!isRealGeminiKey) {
    return generateFallbackAIResponse(prompt, context);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey! });

    const loc = context?.userLocation;
    const locationInfo = loc
      ? `${loc.displayName ? `- Alamat Presisi Lengkap: ${loc.displayName}\n` : ""}${loc.road ? `- Nama Jalan: ${loc.road}\n` : ""}${loc.village ? `- Desa/Kelurahan: ${loc.village}\n` : ""}${loc.district ? `- Kecamatan / Distrik: ${loc.district}\n` : ""}- Kota/Kabupaten: ${loc.city || "Tidak terdeteksi"}
- Provinsi/Wilayah: ${loc.region || "Tidak terdeteksi"}
- Negara: ${loc.country || "Indonesia"}
- Koordinat Titik Geografis Presisi: Lat ${loc.latitude ?? "N/A"}, Lng ${loc.longitude ?? "N/A"}${loc.accuracy ? ` (Estimasi radius akurasi: ±${loc.accuracy} meter)` : ""}
- Metode Deteksi: ${loc.isp || loc.ip || "N/A"}`
      : "Lokasi belum terdeteksi";

    // Bangun System Instruction berbasis Grounding Data Asesmen & Lokasi Geografis
    const systemInstruction = `Anda adalah Asisten Virtual Kesiapsiagaan Bencana NARAGA (Platform Kesiapsiagaan Komunitas Menuju Pemukiman Tangguh Bencana).
Tugas Anda adalah memberikan wawasan, panduan mitigasi bencana yang praktis, tepat konteks, dan dapat langsung diterapkan oleh warga serta pengurus lingkungan (RT/RW).

CAKUPAN TOPIK UTAMA (FOKUS UTAMA WEBSITE NARAGA):
1. Kesiapsiagaan Bencana Lingkungan: Mitigasi banjir, gempa bumi, kebakaran pemukiman, angin puting beliung, tanah longsor, dan krisis pemukiman.
2. Evaluasi Kesiapan Komunitas: Readiness score, identifikasi kekurangan sarana fisik (facility gap) vs minimnya sosialisasi warga (awareness gap).
3. Evakuasi & Jalur Aman: Titik kumpul terbuka aman, rute evakuasi bebas portal/gang sempit, peta evakuasi, dan rambu penunjuk arah.
4. Logistik & Perlindungan Keluarga: Tas Siaga Bencana (TSB), dokumen penting kedap air, persediaan darurat 72 jam, dan kotak P3K.
5. Sistem Peringatan Dini Komunitas: Early Warning System (EWS) lokal, kentongan warga, sirine, grup siaga WhatsApp, dan simulasi mandiri.

TOPIK PENDUKUNG (TOPIK YANG LEBIH LUAS / BERJARAK TETAPI MEMILIKI KORELASI KUAT DENGAN KETANGGUHAN BENCANA):
Jika pengguna menanyakan topik-topik berikut, jelaskan secara ilmiah dan aplikatif, serta SELALU hubungkan kembali dengan ketahanan pemukiman dan keselamatan warga:
1. Perubahan Iklim & Cuaca Ekstrem: Pemanasan global, fenomena La Niña/El Niño, kenaikan muka air laut / banjir rob pesisir, gelombang panas perkotaan (urban heat island), dan adaptasi kapasitas drainase lingkungan.
2. Sanitasi, Pengelolaan Sampah & Pencegahan Wabah Pasca-Bencana: Krisis air bersih, got mampet akibat sampah, serta pencegahan penyakit menular paska genangan (Leptospirosis dari kencing tikus, DBD, diare, kolera, dan infeksi kulit).
3. Psikososial & Kesehatan Mental Darurat (Psychological First Aid): Penanganan kepanikan massal, trauma healing bagi anak-anak dan lansia setelah bencana, serta peran modal sosial gotong royong warga.
4. Ketahanan Finansial Darurat & Keamanan Dokumen Digital: Menyiapkan uang tunai pecahan kecil di rumah untuk antisipasi saat mesin ATM/listrik padam total, digitalisasi dokumen legal (sertifikat, polis, akta) ke cloud storage, serta pembentukan kas darurat tanggap bencana di tingkat RT/RW.
5. Ketahanan Pangan Mikro, Urban Farming & Konservasi Air: Pemanfaatan pekarangan rumah / kebun komunal warga (urban farming) sebagai cadangan makanan mandiri jika jalur logistik terputus, lubang resapan biopori, dan pemangkasan dahan pohon rimbun yang rawan roboh menimpa kabel listrik.
6. Keamanan Kelistrikan & Struktur Fisik Rumah: Pencegahan kebakaran akibat korsleting saat genangan air meninggi (posisi MCB & stopkontak aman), penguncian regulator gas elpiji saat mengungsi, dan penataan perabot berat agar tidak menghalangi pintu keluar saat gempa.

BATASAN DOMAIN & ATURAN SAAT TIDAK BISA MENJAWAB:
- JIKA Anda TIDAK DAPAT MENJAWAB suatu pertanyaan (karena data tidak mencukupi, tidak relevan, atau di luar cakupan kesiapsiagaan bencana):
  1. DILARANG KERAS MENJAWAB DENGAN PERKENALAN DIRI (JANGAN katakan "Halo, saya adalah...", "Perkenalkan saya...", dsb.).
  2. LANGSUNG sampaikan dengan jelas dan sopan bahwa Anda TIDAK DAPAT MENJAWAB hal tersebut (contoh: "Mohon maaf, saya tidak dapat menjawab hal tersebut karena di luar cakupan kesiapsiagaan dan ketahanan bencana pemukiman." atau "Mohon maaf, saya belum dapat menjawab pertanyaan tersebut secara spesifik.").
  3. BERIKAN SARAN / REKOMENDASI yang berguna seputar topik atau langkah mitigasi bencana yang relevan bagi pengguna.

ATURAN FORMAT PENULISAN (MUTLAK HARUS DIIKUTI):
- DILARANG KERAS MENGGUNAKAN TABEL MARKDOWN (| kolom | kolom |). JANGAN PERNAH membuat tabel!
- Seluruh jawaban WAJIB disajikan dalam bentuk FULL TEKS yang mengalir, paragraf naratif yang jelas, serta daftar poin (- ) atau daftar bernomor (1., 2., 3.).
- HINDARI penggunaan tanda pagar berulang (seperti #### atau #####). Gunakan teks tebal biasa untuk judul langkah (contoh: **Langkah 1: Pemeriksaan Jalur**).
- Format teks harus bersih dan mudah dibaca di layar perangkat tanpa kolom tabel yang menyempit.

LOKASI PENGGUNA SAAT INI (TERDETEKSI VIA TITIK IP & GEOLOKASI):
${locationInfo}

PANDUAN KHUSUS LOKASI:
- Jika pengguna menanyakan posisinya (misalnya "Saya di mana?", "Lokasi saya di mana?", "Kota apa saya sekarang?"), Anda HARUS langsung memberitahukan lokasi tepatnya berdasarkan data deteksi IP di atas (sebutkan Kota, Provinsi, dan koordinat perkiraan/ISP jika relevan).
- Berikan wawasan kesiapsiagaan atau karakteristik potensi bencana yang umum di kota/wilayah tempat dia berada (misalnya jika di Semarang, sebutkan potensi rob/banjir di dataran rendah atau longsor di perbukitan; jika di Surabaya, sebutkan genangan/angin kencang, dsb.).

KONTEKS LINGKUNGAN PENGGUNA SAAT INI:
- Nama Lingkungan: ${context?.communityName || "Belum dipilih"}
- Peran Pengguna: ${context?.userRole || "Warga"}
- Skor Kesiapsiagaan Lingkungan (Readiness Score): ${context?.readinessScore !== undefined ? `${context.readinessScore}%` : "Belum dilakukan asesmen"}
- Kesenjangan Fasilitas Fisik (Belum Tersedia): ${context?.facilityGaps && context.facilityGaps.length > 0 ? context.facilityGaps.join("; ") : "Tidak ada catatan kekurangan sarana fisik"}
- Kesenjangan Sosialisasi/Pemahaman Warga (Tidak Tahu): ${context?.awarenessGaps && context.awarenessGaps.length > 0 ? context.awarenessGaps.join("; ") : "Pemahaman warga sudah merata"}`;

    // Gunakan model resmi tercepat (gemini-2.0-flash) dengan timeout pelindung 3 detik
    const callPromise = ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API timeout")), 3000)
    );

    const response = await Promise.race([callPromise, timeoutPromise]);

    return response.text || "Mohon maaf, saya belum dapat menjawab pertanyaan tersebut saat ini. Saran saya, silakan coba ajukan pertanyaan yang berkaitan dengan kesiapsiagaan bencana atau rute evakuasi lingkungan.";
  } catch (error) {
    console.warn("⚠️ Respons AI beralih ke engine instan NARAGA:", (error as any)?.message || error);
    return generateFallbackAIResponse(prompt, context);
  }
}

function generateFallbackAIResponse(prompt: string, context?: AIContextGrounding): string {
  const lowerPrompt = prompt.toLowerCase();
  const community = context?.communityName || "lingkungan Anda";
  const score = context?.readinessScore !== undefined ? `${context.readinessScore}%` : "belum diasesmen";

  // 0. Sapaan Sederhana
  if (
    lowerPrompt === "halo" ||
    lowerPrompt === "hai" ||
    lowerPrompt === "assalamualaikum" ||
    lowerPrompt === "pagi" ||
    lowerPrompt === "selamat pagi" ||
    lowerPrompt === "siang" ||
    lowerPrompt === "selamat siang" ||
    lowerPrompt === "malam" ||
    lowerPrompt === "selamat malam"
  ) {
    return `Halo! Ada yang bisa saya bantu terkait kesiapsiagaan bencana, mitigasi risiko lingkungan, atau persiapan keselamatan di **${community}**?`;
  }

  // 1. Guardrail untuk Pertanyaan yang Sama Sekali di Luar Topik NARAGA
  const offTopicKeywords = [
    "resep", "masak", "makanan enak", "coding", "python", "javascript", "react", "php",
    "film", "bioskop", "artis", "selebriti", "lagu", "musik", "lirik",
    "sepak bola", "skor bola", "liga", "presiden", "pemilu", "partai", "politik",
    "pacar", "jodoh", "cinta", "zodiak", "horoskop", "game", "mobile legend"
  ];
  if (offTopicKeywords.some((kw) => lowerPrompt.includes(kw))) {
    return `Mohon maaf, saya tidak dapat menjawab pertanyaan tersebut karena berada di luar cakupan kesiapsiagaan dan ketahanan bencana pemukiman.

Sebagai saran, Anda dapat menanyakan topik keselamatan dan mitigasi lingkungan yang relevan untuk **${community}**, seperti:
- 🌊 **Mitigasi Bencana Lingkungan:** Panduan menghadapi banjir, gempa bumi, titik kumpul aman, dan rute evakuasi.
- 🌦️ **Perubahan Iklim & Cuaca:** Antisipasi cuaca ekstrem, genangan kilat, dan perawatan drainase RT.
- 🧼 **Sanitasi Pasca-Bencana:** Pencegahan kuman/wabah (Leptospirosis, DBD) dan dekontaminasi air bersih.
- 🎒 **Perlengkapan Darurat:** Isi Tas Siaga Bencana (TSB) keluarga dan pengamanan berkas legal penting.
- 🧠 **Kesehatan Mental Warga:** Teknik meredakan kepanikan anak atau lansia saat bencana.

Silakan tanyakan hal-hal yang berkaitan dengan topik keselamatan di atas agar saya dapat memberikan panduan yang tepat.`;
  }

  // 2. Tanggapan Lokasi Presisi & Geografis
  if (
    lowerPrompt.includes("di mana") ||
    lowerPrompt.includes("dimana") ||
    lowerPrompt.includes("lokasi saya") ||
    lowerPrompt.includes("posisi saya") ||
    lowerPrompt.includes("kota saya") ||
    lowerPrompt.includes("titik ip") ||
    lowerPrompt.includes("titik presisi")
  ) {
    const loc = context?.userLocation;
    const city = loc?.city || "Sidoarjo";
    const region = loc?.region || "Jawa Timur";
    const lat = loc?.latitude ?? -7.4478;
    const lng = loc?.longitude ?? 112.7183;
    const accuracy = loc?.accuracy ? ` (Estimasi Presisi ±${loc.accuracy}m)` : "";
    const detailAddress =
      loc?.displayName ||
      [loc?.road, loc?.village ? `Desa ${loc.village}` : "", loc?.district ? `Kec. ${loc.district}` : "", city, region]
        .filter(Boolean)
        .join(", ");

    return `Berdasarkan titik lokasi presisi Anda saat ini:
- 📍 **Titik Lokasi:** ${detailAddress}
- 🏛️ **Kota/Kabupaten:** ${city}
- 🗺️ **Provinsi/Wilayah:** ${region}
- 📐 **Koordinat Geografis:** Lat ${lat}, Lng ${lng}${accuracy}
${loc?.isp ? `- 📡 **Metode Deteksi:** ${loc.isp}` : ""}

Titik lokasi Anda telah terkalibrasi secara presisi di wilayah **${city}, ${region}**. Anda dapat menanyakan potensi risiko bencana spesifik di kawasan ini, melihat rute evakuasi di menu **Peta Evakuasi**, atau menggeser pin di peta jika ingin memindahkan titik ke bangunan/rumah Anda!`;
  }

  // 3. Topik Pendukung: Perubahan Iklim & Cuaca Ekstrem
  if (
    lowerPrompt.includes("iklim") ||
    lowerPrompt.includes("perubahan iklim") ||
    lowerPrompt.includes("pemanasan global") ||
    lowerPrompt.includes("la nina") ||
    lowerPrompt.includes("la niña") ||
    lowerPrompt.includes("el nino") ||
    lowerPrompt.includes("el niño") ||
    lowerPrompt.includes("cuaca ekstrem") ||
    lowerPrompt.includes("banjir rob") ||
    lowerPrompt.includes("panas ekstrem") ||
    lowerPrompt.includes("gelombang panas") ||
    lowerPrompt.includes("hujan ekstrem")
  ) {
    return `Perubahan iklim global berdampak langsung terhadap frekuensi dan intensitas bencana di pemukiman warga (**${community}**):

**1. Dampak Nyata di Tingkat Lingkungan:**
- **Anomali Curah Hujan (La Niña):** Hujan berintensitas tinggi dalam durasi singkat dapat membuat saluran drainase lingkungan kewalahan dan memicu banjir genangan kilat.
- **Kenaikan Muka Air Laut (Banjir Rob):** Wilayah pesisir (seperti pesisir Jawa Timur, Jawa Tengah, dan pesisir utara) mengalami intrusi air laut saat pasang purnama yang memperlambat surutnya air selokan.
- **Gelombang Panas & Kekeringan (El Niño):** Meningkatkan risiko kebakaran pemukiman akibat korsleting dan kelalaian pembakaran sampah kering, serta memicu defisit air bersih sumur warga.

**2. Langkah Aksi Adaptasi Iklim Berbasis Komunitas:**
- **Revitalisasi Drainase Berkelanjutan:** Pengurus lingkungan perlu memastikan pembersihan lumpur sedimen di selokan minimal sebulan sekali sebelum puncak musim hujan.
- **Gerakan Sumur Resapan & Biopori:** Mengembalikan fungsi resapan air tanah untuk menampung limpasan air hujan ekstrem dan cadangan air saat musim kemarau.
- **Pemantauan Peringatan Dini BMKG:** Warga disarankan memasang aplikasi BMKG atau menunjuk perwakilan pengurus RT untuk memantau radar cuaca dan menyebarkan *early warning* di grup WhatsApp warga.`;
  }

  // 4. Topik Pendukung: Sanitasi, Sampah & Pencegahan Penyakit/Wabah Pasca-Bencana
  if (
    lowerPrompt.includes("sanitasi") ||
    lowerPrompt.includes("sampah") ||
    lowerPrompt.includes("penyakit") ||
    lowerPrompt.includes("wabah") ||
    lowerPrompt.includes("leptospirosis") ||
    lowerPrompt.includes("dbd") ||
    lowerPrompt.includes("demam berdarah") ||
    lowerPrompt.includes("diare") ||
    lowerPrompt.includes("kolera") ||
    lowerPrompt.includes("air bersih") ||
    lowerPrompt.includes("kencing tikus") ||
    lowerPrompt.includes("higienis") ||
    lowerPrompt.includes("kuman") ||
    lowerPrompt.includes("kesehatan lingkungan")
  ) {
    return `Pasca bencana genangan atau banjir di **${community}**, ancaman terbesar berikutnya adalah **Bencana Sekunder (Secondary Disaster)** berupa krisis sanitasi dan wabah penyakit:

**1. Ancaman Penyakit Utama yang Wajib Diwaspadai:**
- **Leptospirosis:** Bakteri dari air kencing tikus yang bercampur genangan air banjir. Bakteri ini menembus tubuh melalui pori-pori atau luka kecil di kulit dan menyerang ginjal serta hati.
- **Diare Akut & Kolera:** Akibat tercemarnya air sumur gali atau instalasi pipa air warga oleh luapan septic tank.
- **Demam Berdarah (DBD):** Berkembang pesat 1–2 minggu setelah banjir saat kaleng, botol, atau cekungan menampung genangan air jernih sisa banjir.

**2. Protokol Sanitasi Darurat Komunitas:**
- **Alat Pelindung Diri (APD):** Selalu kenakan sepatu bot karet dan sarung tangan saat membersihkan lumpur paska banjir. Segera cuci kaki dan tangan dengan sabun antiseptik.
- **Dekontaminasi Air Bersih:** Rebus air minum hingga mendidih bergolak minimal 3 menit. Jika air sumur keruh, gunakan tawas atau kaporit takaran aman sebelum digunakan mencuci.
- **Gerakan 3M Plus Pasca-Surut:** Bersihkan endapan lumpur pekarangan dan buang wadah penampung air liar untuk memutus siklus perkembangbiakan jentik nyamuk.`;
  }

  // 5. Topik Pendukung: Kesehatan Mental, Stres & Trauma Healing Komunitas
  if (
    lowerPrompt.includes("trauma") ||
    lowerPrompt.includes("stres") ||
    lowerPrompt.includes("stress") ||
    lowerPrompt.includes("panik") ||
    lowerPrompt.includes("mental") ||
    lowerPrompt.includes("psikologis") ||
    lowerPrompt.includes("psikologi") ||
    lowerPrompt.includes("ketakutan") ||
    lowerPrompt.includes("cemas") ||
    lowerPrompt.includes("anak-anak") ||
    lowerPrompt.includes("lansia") ||
    lowerPrompt.includes("trauma healing") ||
    lowerPrompt.includes("pfa")
  ) {
    return `Kesiapsiagaan bencana bukan hanya tentang fisik dan logistik, namun juga **Kesehatan Mental & Ketahanan Emosional Warga (Psychological First Aid)**:

**1. Penanganan Kepanikan Saat Detik-Detik Bencana:**
- **Ketenangan Pemimpin Lingkungan:** Pengurus RT dan tokoh warga harus berbicara dengan nada suara tenang dan tegas. Kepanikan pemimpin mudah menular ke seluruh warga.
- **Teknik Grounding Sederhana:** Jika ada warga yang histeris atau mengalami hiperventilasi (*panic attack*), bimbing mereka menarik napas perlahan (tarik 4 detik, tahan 4 detik, hembuskan 4 detik).

**2. Dukungan Khusus Anak-Anak & Lansia di Titik Kumpul:**
- **Ruang Ramah Anak (Child-Friendly Space):** Di posko pengungsian, alihkan perhatian anak-anak dari reruntuhan atau suara sirine dengan buku gambar, cerita menenangkan, dan permainan bersama.
- **Rasa Aman untuk Lansia:** Pastikan lansia duduk di tempat hangat, ditemani keluarga atau tetangga yang mereka kenal baik, dan pastikan obat rutin serta alat bantu dengar/kacamata tidak tertinggal.

**3. Modal Sosial & Gotong Royong:**
- Sikap saling menyapa dan berbagi logistik antartangga di **${community}** terbukti secara psikologis mempercepat pemulihan trauma (*post-disaster recovery*) dibandingkan menghadapi bencana secara menyendiri.`;
  }

  // 6. Topik Pendukung: Ketahanan Finansial Darurat & Keamanan Dokumen Digital
  if (
    lowerPrompt.includes("uang") ||
    lowerPrompt.includes("finansial") ||
    lowerPrompt.includes("dana darurat") ||
    lowerPrompt.includes("sertifikat") ||
    lowerPrompt.includes("dokumen") ||
    lowerPrompt.includes("ijazah") ||
    lowerPrompt.includes("surat tanah") ||
    lowerPrompt.includes("akta") ||
    lowerPrompt.includes("tabungan") ||
    lowerPrompt.includes("atm") ||
    lowerPrompt.includes("ekonomi") ||
    lowerPrompt.includes("kas rt")
  ) {
    return `Ketahanan finansial dan perlindungan legalitas keluarga adalah pilar penting dalam mitigasi bencana di **${community}**:

**1. Cadangan Uang Tunai Mandiri (Cash on Hand):**
- Saat gempa atau banjir besar, jaringan listrik dan sinyal seluler sering terputus sehingga mesin ATM, transfer mobile banking, dan pembayaran QRIS mati total.
- Simpan uang tunai pecahan kecil (Rp5.000, Rp10.000, Rp20.000, Rp50.000) di rumah yang cukup untuk kebutuhan pokok darurat selama 3–7 hari.

**2. Protokol Pengamanan Dokumen Berharga:**
- **Lapisan Fisik (Dry Bag):** Masukkan dokumen asli (Sertifikat Rumah/Tanah, Ijazah, Akta Kelahiran, Buku Nikah, Kartu Keluarga, dan Polis Asuransi) ke dalam map plastik zipper kedap air di bagian atas Tas Siaga Bencana.
- **Lapisan Digital (Cloud Storage):** Pindai (scan) seluruh berkas penting menggunakan ponsel, lalu simpan di Google Drive / Cloud terenkripsi. Hal ini sangat memudahkan verifikasi bantuan pemerintah dan klaim asuransi jika dokumen fisik hilang.

**3. Alokasi Kas Tanggap Darurat RT/RW:**
- Disarankan pengurus RT menyisihkan 5–10% dari iuran kas warga untuk cadangan darurat pembelian logistik awal, terpal posko, baterai cadangan, dan lampu senter darurat.`;
  }

  // 7. Topik Pendukung: Ketahanan Pangan Mikro, Urban Farming & Konservasi Air
  if (
    lowerPrompt.includes("pangan") ||
    lowerPrompt.includes("makanan darurat") ||
    lowerPrompt.includes("urban farming") ||
    lowerPrompt.includes("tanaman") ||
    lowerPrompt.includes("sayur") ||
    lowerPrompt.includes("kebun") ||
    lowerPrompt.includes("pekarangan") ||
    lowerPrompt.includes("biopori") ||
    lowerPrompt.includes("resapan") ||
    lowerPrompt.includes("pohon") ||
    lowerPrompt.includes("cadangan makanan")
  ) {
    return `Ketahanan pangan mikro dan konservasi pekarangan warga adalah penyangga vital ketika akses logistik luar terputus akibat bencana di **${community}**:

**1. Urban Farming sebagai Penyangga Pangan Darurat:**
- Menanam sayuran pekarangan berumur panen pendek (kangkung, bayam, sawi, cabai, atau singkong) di polybag atau pekarangan rumah.
- Jika jalan raya terputus genangan banjir atau tertutup tanah longsor selama 3–5 hari, pasokan serat dan gizi warga tetap terjaga tanpa harus menunggu kiriman bantuan logistik dari luar.

**2. Manajemen Stok Logistik Makanan Kering Keluarga:**
- Selalu sediakan biskuit tinggi kalori, mie telur instan, sarden kaleng, kornet, abon, dan madu di dapur.
- Terapkan metode **FIFO (First In, First Out)**: gunakan stok lama untuk konsumsi harian dan ganti dengan stok baru agar makanan tidak kedaluwarsa saat masa darurat tiba.

**3. Konservasi Resapan & Pemangkasan Ranting Pohon:**
- Buat lubang biopori di halaman: lubang ini menyerap limpasan air hujan langsung ke dalam tanah sekaligus mengolah sampah dedaunan menjadi kompos.
- Segera lakukan pemangkasan dahan pohon rimbun yang sudah lapuk sebelum musim angin ribut agar tidak roboh menimpa kabel listrik atau rumah warga.`;
  }

  // 8. Topik Pendukung: Keamanan Kelistrikan & Struktur Bangunan Rumah Aman
  if (
    lowerPrompt.includes("listrik") ||
    lowerPrompt.includes("korsleting") ||
    lowerPrompt.includes("mcb") ||
    lowerPrompt.includes("stopkontak") ||
    lowerPrompt.includes("gas") ||
    lowerPrompt.includes("elpiji") ||
    lowerPrompt.includes("lpg") ||
    lowerPrompt.includes("kompor") ||
    lowerPrompt.includes("struktur rumah") ||
    lowerPrompt.includes("atap") ||
    lowerPrompt.includes("perabot")
  ) {
    return `Banyak korban bencana di kawasan pemukiman justru diakibatkan oleh bahaya kelistrikan dan kebocoran gas sekunder:

**1. Keselamatan Kelistrikan Saat Air Mulai Naik:**
- **Matikan Sekring Utama (MCB):** Begitu air genangan mulai masuk ke teras rumah, segera matikan saklar utama MCB dari meteran PLN luar.
- **Standar Ketinggian Stopkontak:** Posisikan stopkontak di dinding dengan ketinggian minimal 1,2–1,5 meter dari lantai agar tidak mudah terendam genangan air musiman.
- **Jangan Menyentuh Tiang Listrik:** Saat evakuasi melalui genangan air di jalan lingkungan, hindari memegang tiang listrik atau kawat penopang yang berpotensi memiliki arus bocor.

**2. Pencegahan Kebakaran & Ledakan Gas:**
- Sebelum melangkah keluar rumah untuk evakuasi banjir atau gempa, cabut regulator tabung gas elpiji dan letakkan tabung di tempat berventilasi baik.
- Pastikan tidak ada lilin atau kompor minyak yang menyala saat meninggalkan hunian.

**3. Tata Letak Perabot Rumah Tangga Ramah Gempa:**
- Jangan memasang lukisan kaca berat atau cermin tepat di atas kepala ranjang tempat tidur.
- Kunci lemari pakaian tinggi atau rak piring ke dinding (*wall anchor*) agar tidak roboh menutupi pintu akses keluar saat terjadi guncangan gempa bumi.`;
  }

  // 9. Topik Inti: Evakuasi & Titik Kumpul
  if (lowerPrompt.includes("titik kumpul") || lowerPrompt.includes("evakuasi") || lowerPrompt.includes("rute")) {
    return `Halo! Berdasarkan data untuk **${community}** (Skor Kesiapan: **${score}**), berikut panduan terkait evakuasi:
1. **Penetapan Titik Kumpul:** Pastikan titik kumpul berada di tanah lapang terbuka, bebas dari tiang listrik tegangan tinggi dan potensi pohon tumbang (misalnya lapangan RT/RW atau balai warga).
2. **Jalur Evakuasi:** Utamakan jalan raya lingkungan yang lebar minimal 3-4 meter dan pastikan bebas dari portal terkunci saat kondisi darurat malam hari.
3. **Tindakan Warga:** Selalu simpan peta rute evakuasi di dekat pintu keluar rumah Anda. Anda dapat mengecek peta interaktif lengkap di menu **Peta Evakuasi**.`;
  }

  // 10. Topik Inti: Tas Siaga Bencana (TSB)
  if (lowerPrompt.includes("tas siaga") || lowerPrompt.includes("perbekalan") || lowerPrompt.includes("obat") || lowerPrompt.includes("p3k")) {
    return `Untuk mempersiapkan **Tas Siaga Bencana (TSB)** di tingkat keluarga, prioritaskan barang-barang berikut:
1. **Dokumen Penting:** Salinan KK, KTP, surat tanah, ijazah, dan polis asuransi dalam kantong plastik kedap air.
2. **Logistik Darurat:** Air mineral botol (minimal 1 liter/orang), makanan kaleng/biskuit energi siap makan untuk 3 hari.
3. **Peralatan:** Senter kecil + baterai cadangan, peluit darurat untuk meminta tolong, dan power bank.
4. **Kesehatan:** Kotak P3K standar, obat-obatan rutin keluarga, dan masker.`;
  }

  // 11. Topik Inti: Evaluasi Kesenjangan (Gap) & Rekomendasi Aksi
  if (lowerPrompt.includes("gap") || lowerPrompt.includes("kurang") || lowerPrompt.includes("prioritas") || lowerPrompt.includes("rekomendasi") || lowerPrompt.includes("skor")) {
    const facilityText = context?.facilityGaps && context.facilityGaps.length > 0 
      ? `\n- **Kekurangan Fasilitas Fisik:** ${context.facilityGaps.slice(0, 2).join(", ")}.` 
      : "\n- Fasilitas fisik relatif memadai.";
    const awarenessText = context?.awarenessGaps && context.awarenessGaps.length > 0 
      ? `\n- **Kesenjangan Sosialisasi:** ${context.awarenessGaps.slice(0, 2).join(", ")}.` 
      : "\n- Sosialisasi keselamatan sudah cukup baik.";

    return `Berdasarkan evaluasi *Readiness Gap* di **${community}**:${facilityText}${awarenessText}

**Rekomendasi Aksi Prioritas:**
1. Pengurus RT/RW disarankan menyelenggarakan pertemuan warga untuk membagikan peta jalur evakuasi dan nomor kontak darurat penting.
2. Alokasikan kas lingkungan untuk penandaan rambu penunjuk arah ke titik kumpul aman.
3. Lakukan simulasi sederhana mandiri di tingkat RT minimal sekali dalam setahun.`;
  }

  // 12. Kasus Jika Tidak Dapat Menjawab / Pertanyaan Belum Dikenali (Tanpa Perkenalan, Langsung Saran)
  return `Mohon maaf, saya belum dapat menjawab pertanyaan tersebut secara spesifik karena keterbatasan data atau topik yang Anda sampaikan belum terpetakan dalam panduan kesiapsiagaan saat ini.

Sebagai saran, berikut beberapa topik dan langkah penting di **${community}** yang dapat Anda diskusikan:
- 📍 **Titik Kumpul & Evakuasi:** Mengetahui lokasi titik kumpul aman dan panduan rute evakuasi terdekat.
- 📊 **Evaluasi Kesiapsiagaan:** Prioritas perbaikan berdasarkan hasil asesmen lingkungan saat ini.
- 🎒 **Tas Siaga Bencana (TSB):** Daftar perbekalan darurat 72 jam dan pengamanan dokumen penting keluarga.
- 🌦️ **Cuaca Ekstrem & Iklim:** Langkah adaptasi menghadapi anomali cuaca dan potensi banjir rob.
- 🧼 **Sanitasi Lingkungan:** Pencegahan wabah penyakit dan penyediaan air bersih darurat pasca banjir.
- ⚡ **Kelistrikan & Rumah Aman:** Pengamanan sekring listrik (MCB) dan tabung gas saat genangan air meninggi.

Silakan ajukan pertanyaan yang berkaitan dengan salah satu topik keselamatan di atas agar saya dapat memberikan rekomendasi yang akurat.`;
}
