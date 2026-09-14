import { z } from "zod";

// Autentikasi
export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

// Komunitas / Lingkungan
export const createCommunitySchema = z.object({
  name: z.string().min(3, "Nama lingkungan minimal 3 karakter"),
  rt: z.string().min(1, "Nomor RT wajib diisi"),
  rw: z.string().min(1, "Nomor RW wajib diisi"),
  kelurahan: z.string().min(2, "Kelurahan/Desa wajib diisi"),
  kecamatan: z.string().min(2, "Kecamatan wajib diisi"),
  kota: z.string().min(2, "Kota/Kabupaten wajib diisi"),
  province: z.string().default("Jawa Tengah"),
  description: z.string().optional(),
});

// Pengajuan Peran Pengurus Lingkungan
export const pengurusApplicationSchema = z.object({
  communityId: z.string().min(1, "Lingkungan wajib dipilih"),
  fullName: z.string().min(2, "Nama lengkap wajib diisi"),
  phoneNumber: z.string().min(9, "Nomor HP/WhatsApp minimal 9 karakter"),
  position: z.string().min(2, "Jabatan lingkungan (misal: Ketua RT / RW) wajib diisi"),
  reason: z.string().min(10, "Alasan pengajuan minimal 10 karakter"),
});

export const reviewApplicationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNotes: z.string().optional(),
});

// Asesmen Kesiapsiagaan
export const assessmentAnswerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.enum(["YA", "TIDAK", "TIDAK_TAHU"]),
});

export const assessmentSubmissionSchema = z.object({
  communityId: z.string().min(1, "ID Komunitas/Lingkungan wajib disertakan"),
  answers: z
    .array(assessmentAnswerSchema)
    .min(1, "Minimal satu jawaban asesmen harus diisi"),
});

// Geospasial: Titik Kumpul
export const evacuationPointSchema = z.object({
  communityId: z.string().min(1),
  name: z.string().min(3, "Nama titik lokasi minimal 3 karakter"),
  type: z.enum(["ASSEMBLY_POINT", "AID_POST", "HAZARD_POINT"]),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// Geospasial: Rute Evakuasi
export const evacuationRouteSchema = z.object({
  communityId: z.string().min(1),
  name: z.string().min(3, "Nama rute minimal 3 karakter"),
  description: z.string().optional(),
  coordinates: z.string().min(5, "Format koordinat JSON array wajib diisi"),
  color: z.string().default("#10b981"),
});

// Kontak Darurat
export const emergencyContactSchema = z.object({
  communityId: z.string().optional().nullable(),
  name: z.string().min(3, "Nama instansi/kontak minimal 3 karakter"),
  category: z.enum(["BPBD", "DAMKAR", "MEDIS", "KEPOLISIAN", "PENGURUS_RT"]),
  phoneNumber: z.string().min(3, "Nomor kontak wajib diisi"),
  isGlobal: z.boolean().default(false),
});

// AI Chat Request
export const aiChatSchema = z.object({
  sessionId: z.string().optional(),
  communityId: z.string().optional(),
  message: z.string().min(1, "Pesan tidak boleh kosong"),
});
