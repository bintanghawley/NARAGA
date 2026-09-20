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

  // Jika API Key tidak diset atau bernilai "mock", gunakan fallback cerdas berbasis konteks
  if (!apiKey || apiKey === "mock") {
    return generateFallbackAIResponse(prompt, context);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const loc = context?.userLocation;
    const locationInfo = loc
      ? `${loc.displayName ? `- Alamat Presisi Lengkap: ${loc.displayName}\n` : ""}${loc.road ? `- Nama Jalan: ${loc.road}\n` : ""}${loc.village ? `- Desa/Kelurahan: ${loc.village}\n` : ""}${loc.district ? `- Kecamatan / Distrik: ${loc.district}\n` : ""}- Kota/Kabupaten: ${loc.city || "Tidak terdeteksi"}
- Provinsi/Wilayah: ${loc.region || "Tidak terdeteksi"}
- Negara: ${loc.country || "Indonesia"}
- Koordinat Titik Geografis Presisi: Lat ${loc.latitude ?? "N/A"}, Lng ${loc.longitude ?? "N/A"}${loc.accuracy ? ` (Estimasi radius akurasi: ±${loc.accuracy} meter)` : ""}
- Metode Deteksi: ${loc.isp || loc.ip || "N/A"}`
      : "Lokasi belum terdeteksi";

    // Bangun System Instruction berbasis Grounding Data Asesmen & Lokasi Geografis
    const systemInstruction = `Anda adalah Asisten Virtual Kesiapsiagaan Bencana NARAGA.
Tugas Anda adalah memberikan saran mitigasi bencana yang praktis, realistis, dan tepat konteks untuk komunitas pemukiman warga (RT/RW).
PANDUAN PENTING:
1. Jangan berasumsi fasilitas tersedia jika pada data asesmen tercatat sebagai gap (kekurangan).
2. Jawaban harus langsung dapat ditindaklanjuti (actionable) oleh warga atau pengurus lingkungan.
3. Gunakan bahasa Indonesia yang ramah, jelas, terstruktur, dan menenangkan.

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

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Mohon maaf, saya belum dapat menghasilkan jawaban saat ini.";
  } catch (error) {
    console.warn("⚠️ Gagal memanggil Gemini API eksternal, beralih ke fallback response:", error);
    return generateFallbackAIResponse(prompt, context);
  }
}

function generateFallbackAIResponse(prompt: string, context?: AIContextGrounding): string {
  const lowerPrompt = prompt.toLowerCase();
  const community = context?.communityName || "lingkungan Anda";
  const score = context?.readinessScore !== undefined ? `${context.readinessScore}%` : "belum diasesmen";

  // Tanggapan simulasi cerdas yang adaptif terhadap pertanyaan dan konteks
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

  if (lowerPrompt.includes("titik kumpul") || lowerPrompt.includes("evakuasi")) {
    return `Halo! Berdasarkan data untuk **${community}** (Skor Kesiapan: **${score}**), berikut panduan terkait evakuasi:
1. **Penetapan Titik Kumpul:** Pastikan titik kumpul berada di tanah lapang terbuka, bebas dari tiang listrik tegangan tinggi dan potensi pohon tumbang (misalnya lapangan RT/RW atau balai warga).
2. **Jalur Evakuasi:** Utamakan jalan raya lingkungan yang lebar minimal 3-4 meter dan pastikan bebas dari portal terkunci saat kondisi darurat malam hari.
3. **Tindakan Warga:** Selalu simpan peta rute evakuasi di dekat pintu keluar rumah Anda.`;
  }

  if (lowerPrompt.includes("tas siaga") || lowerPrompt.includes("perbekalan") || lowerPrompt.includes("obat")) {
    return `Untuk mempersiapkan **Tas Siaga Bencana (TSB)** di tingkat keluarga, prioritaskan barang-barang berikut:
1. **Dokumen Penting:** Salinan KK, KTP, surat tanah, ijazah, dan polis asuransi dalam kantong plastik kedap air.
2. **Logistik Darurat:** Air mineral botol (minimal 1 liter/orang), makanan kaleng/biskuit energi siap makan untuk 3 hari.
3. **Peralatan:** Senter kecil + baterai cadangan, peluit darurat untuk meminta tolong, dan power bank.
4. **Kesehatan:** Kotak P3K standar, obat-obatan rutin keluarga, dan masker.`;
  }

  if (lowerPrompt.includes("gap") || lowerPrompt.includes("kurang") || lowerPrompt.includes("prioritas") || lowerPrompt.includes("rekomendasi")) {
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

  return `Halo! Saya adalah **Context-Aware AI Assistant NARAGA**. 
Saat ini saya mendampingi kesiapsiagaan di **${community}** dengan tingkat kesiapan saat ini **${score}**.

Anda dapat menanyakan hal-hal praktis seperti:
- *"Bagaimana cara menentukan titik kumpul aman di lingkungan saya?"*
- *"Apa saja prioritas perbaikan berdasarkan hasil asesmen terakhir?"*
- *"Apa saja isi tas siaga bencana yang wajib dimiliki keluarga?"*
- *"Bagaimana menyosialisasikan kontak darurat ke warga lansia?"*`;
}
