import { GoogleGenAI } from "@google/genai";

interface AIContextGrounding {
  communityName?: string;
  readinessScore?: number;
  facilityGaps?: string[];
  awarenessGaps?: string[];
  userRole?: string;
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

    // Bangun System Instruction berbasis Grounding Data Asesmen
    const systemInstruction = `Anda adalah Asisten Virtual Kesiapsiagaan Bencana NARAGA.
Tugas Anda adalah memberikan saran mitigasi bencana yang praktis, realistis, dan tepat konteks untuk komunitas pemukiman warga (RT/RW).
PANDUAN PENTING:
1. Jangan berasumsi fasilitas tersedia jika pada data asesmen tercatat sebagai gap (kekurangan).
2. Jawaban harus langsung dapat ditindaklanjuti (actionable) oleh warga atau pengurus lingkungan.
3. Gunakan bahasa Indonesia yang ramah, jelas, terstruktur, dan menenangkan.

KONTEKS LINGKUNGAN PENGGUNA SAAT INI:
- Nama Lingkungan: ${context?.communityName || "Belum dipilih"}
- Peran Pengguna: ${context?.userRole || "Warga"}
- Skor Kesiapsiagaan Lingkungan (Readiness Score): ${context?.readinessScore !== undefined ? `${context.readinessScore}%` : "Belum dilakukan asesmen"}
- Kesenjangan Fasilitas Fisik (Belum Tersedia): ${context?.facilityGaps && context.facilityGaps.length > 0 ? context.facilityGaps.join("; ") : "Tidak ada catatan kekurangan sarana fisik"}
- Kesenjangan Sosialisasi/Pemahaman Warga (Tidak Tahu): ${context?.awarenessGaps && context.awarenessGaps.length > 0 ? context.awarenessGaps.join("; ") : "Pemahaman warga sudah merata"}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
