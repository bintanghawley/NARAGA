"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  User,
  Shield,
  Lock,
  Pencil,
  RotateCcw,
  LogOut,
  Trash2,
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  KeyRound,
  Building,
  Camera,
  Upload,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";

function parseNameAndRole(fullName: string, defaultRole: string) {
  const match = fullName.match(/^(.*?)\s*\((.*?)\)\s*$/);
  if (match) {
    return {
      nameOnly: match[1].trim(),
      roleTitle: match[2].trim(),
    };
  }
  const fallbackRoleTitle =
    defaultRole === "PENGURUS"
      ? "Ketua RT / Pengurus Lingkungan"
      : defaultRole === "ADMIN"
      ? "Administrator Wilayah"
      : "Warga Komunitas";

  return {
    nameOnly: fullName.trim(),
    roleTitle: fallbackRoleTitle,
  };
}

const PRESET_AVATARS = [
  { label: "Foto 1", src: "/images/avatar-evan.jpg" },
  { label: "Foto 2", src: "/images/avatar-firman.jpg" },
  { label: "Foto 3", src: "/images/avatar-raffi.jpg" },
];

interface CommunityItem {
  id: string;
  name: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  province: string;
}

interface SettingsClientProps {
  initialUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    communityId: string | null;
    community: CommunityItem | null;
  };
  communities: CommunityItem[];
}

export default function SettingsClient({
  initialUser,
  communities,
}: SettingsClientProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "profil" | "privasi" | "keamanan"
  >("profil");

  // User state
  const [currentUser, setCurrentUser] = useState(initialUser);

  // Notification / Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Modals state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editCommunityOpen, setEditCommunityOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Avatar state & file input refs
  const [avatarUrl, setAvatarUrl] = useState<string>("/images/avatar-evan.jpg");
  const directFileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("naraga_user_avatar");
      if (saved) {
        setAvatarUrl(saved);
      }
    }
  }, []);

  const initialParsed = parseNameAndRole(initialUser.name, initialUser.role);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: initialParsed.nameOnly,
    roleTitle: initialParsed.roleTitle,
    email: initialUser.email,
    avatar: "/images/avatar-evan.jpg",
  });
  const [selectedCommunityId, setSelectedCommunityId] = useState(
    initialUser.communityId || (communities[0]?.id ?? "")
  );
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Upload handler langsung dari kartu profil
  const handleDirectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast("Ukuran foto maksimal 3MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setAvatarUrl(result);
          if (typeof window !== "undefined") {
            localStorage.setItem("naraga_user_avatar", result);
            window.dispatchEvent(
              new CustomEvent("naraga_avatar_changed", { detail: result })
            );
          }
          showToast("Foto profil berhasil diperbarui!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload handler dari dalam modal edit
  const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setFormError("Ukuran foto maksimal 3MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setProfileForm((prev) => ({ ...prev, avatar: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isScrollingFromClickRef = useRef(false);

  // Scrollspy: sesuaikan activeSubTab secara dinamis saat halaman digulir
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingFromClickRef.current) return;

      const scrollPosition = window.scrollY + 140;
      const privasiEl = document.getElementById("section-privasi");
      const keamananEl = document.getElementById("section-keamanan");

      if (keamananEl && scrollPosition >= keamananEl.offsetTop) {
        setActiveSubTab("keamanan");
      } else if (privasiEl && scrollPosition >= privasiEl.offsetTop) {
        setActiveSubTab("privasi");
      } else {
        setActiveSubTab("profil");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll smoothly ke seksi yang dipilih di dalam settings (tanpa scroll ke paling atas kecuali tab profil)
  const handleTabClick = (tab: "profil" | "privasi" | "keamanan") => {
    setActiveSubTab(tab);
    isScrollingFromClickRef.current = true;

    if (tab === "profil") {
      // Profil berada di atas, tampilkan judul Settings dan kartu profil
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        isScrollingFromClickRef.current = false;
      }, 700);
      return;
    }

    const elementId =
      tab === "privasi" ? "section-privasi" : "section-keamanan";
    const el = document.getElementById(elementId);
    if (el) {
      const headerOffset = 96; // 80px navbar + 16px buffer
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }

    setTimeout(() => {
      isScrollingFromClickRef.current = false;
    }, 700);
  };

  // 1. Submit Edit Profile (Pisah Nama & Peran + Simpan Foto)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const combinedName = profileForm.roleTitle.trim()
        ? `${profileForm.name.trim()} (${profileForm.roleTitle.trim()})`
        : profileForm.name.trim();

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: combinedName,
          email: profileForm.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui profil");
      }

      if (profileForm.avatar) {
        setAvatarUrl(profileForm.avatar);
        if (typeof window !== "undefined") {
          localStorage.setItem("naraga_user_avatar", profileForm.avatar);
          window.dispatchEvent(
            new CustomEvent("naraga_avatar_changed", { detail: profileForm.avatar })
          );
        }
      }

      setCurrentUser((prev) => ({
        ...prev,
        name: combinedName,
        email: profileForm.email,
      }));
      setEditProfileOpen(false);
      showToast("Data profil dan foto berhasil diperbarui!");
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Submit Edit Community
  const handleSaveCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId: selectedCommunityId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui wilayah komunitas");
      }
      const newComm = communities.find((c) => c.id === selectedCommunityId) || null;
      setCurrentUser((prev) => ({
        ...prev,
        communityId: selectedCommunityId,
        community: newComm,
      }));
      setEditCommunityOpen(false);
      showToast("Alamat wilayah berhasil diperbarui!");
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Submit Change Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFormError("Konfirmasi password baru tidak cocok");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setFormError("Password baru minimal 6 karakter");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengganti password");
      }
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordOpen(false);
      showToast("Password Anda berhasil diubah!");
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const communityName =
    currentUser.community?.name || "Komunitas Siaga RT 03 / RW 05 Sekaran";
  const communityDetail = currentUser.community
    ? `RT ${currentUser.community.rt} / RW ${currentUser.community.rw}, Kel. ${currentUser.community.kelurahan}`
    : "RT 03 / RW 05, Kel. Sekaran";

  return (
    <div className="min-h-screen bg-[#ebf4fa] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-gray-700 animate-in fade-in slide-in-from-top-2 text-sm font-medium">
          <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
        {/* ======================================================== */}
        {/* 1. SIDEBAR KIRI UTAMA FIXED & SLIDING HIJAU               */}
        {/* ======================================================== */}
        <DashboardSidebar />

        {/* ======================================================== */}
        {/* 2. KONTEN UTAMA SETTINGS                                 */}
        {/* ======================================================== */}
        <main className="flex-1 w-full">
          {/* Layout Dua Kolom: Sub-Sidebar Navigasi & Kartu-Kartu Pengaturan */}
          <div className="flex flex-col md:flex-row items-start gap-6 lg:gap-8">
            {/* KOLOM KIRI: Judul Settings & Sub-Sidebar Navigasi (STICKY & SEJAJAR LURUS) */}
            <div className="w-full md:w-56 flex-shrink-0 md:sticky md:top-24 md:self-start z-10 space-y-3">
              <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 tracking-tight h-8 sm:h-9 flex items-center animate-emerge">
                Settings
              </h1>

              {/* SUB-SIDEBAR NAVIGASI PENGATURAN (SLIDING HIJAU) */}
              <div className="bg-white rounded-[24px] p-2.5 shadow-sm border border-gray-100 transition-all">
                <div className="relative flex flex-col gap-1">
                  {/* Indikator Hijau Meluncur (Sliding Pill) */}
                  <div
                    className="absolute left-0 right-0 h-[44px] rounded-xl bg-[#0e6f68] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none shadow-xs z-0"
                    style={{
                      transform: `translateY(${
                        (activeSubTab === "profil" ? 0 : activeSubTab === "privasi" ? 1 : 2) * 48
                      }px)`,
                    }}
                  />

                  {/* Tab 1: Profil */}
                  <button
                    type="button"
                    onClick={() => handleTabClick("profil")}
                    className={`relative z-10 w-full h-[44px] flex items-center gap-3 px-4 rounded-xl font-medium text-sm transition-colors duration-200 cursor-pointer text-left ${
                      activeSubTab === "profil"
                        ? "text-white font-semibold"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50/50"
                    }`}
                  >
                    <User
                      className={`w-4 h-4 transition-colors ${
                        activeSubTab === "profil" ? "text-white" : "text-gray-500"
                      }`}
                    />
                    <span>Profil</span>
                  </button>

                  {/* Tab 2: Privasi & Data */}
                  <button
                    type="button"
                    onClick={() => handleTabClick("privasi")}
                    className={`relative z-10 w-full h-[44px] flex items-center gap-3 px-4 rounded-xl font-medium text-sm transition-colors duration-200 cursor-pointer text-left ${
                      activeSubTab === "privasi"
                        ? "text-white font-semibold"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50/50"
                    }`}
                  >
                    <Shield
                      className={`w-4 h-4 transition-colors ${
                        activeSubTab === "privasi" ? "text-white" : "text-gray-500"
                      }`}
                    />
                    <span>Privasi & Data</span>
                  </button>

                  {/* Tab 3: Akun & Keamanan */}
                  <button
                    type="button"
                    onClick={() => handleTabClick("keamanan")}
                    className={`relative z-10 w-full h-[44px] flex items-center gap-3 px-4 rounded-xl font-medium text-sm transition-colors duration-200 cursor-pointer text-left ${
                      activeSubTab === "keamanan"
                        ? "text-white font-semibold"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50/50"
                    }`}
                  >
                    <Lock
                      className={`w-4 h-4 transition-colors ${
                        activeSubTab === "keamanan" ? "text-white" : "text-gray-500"
                      }`}
                    />
                    <span>Akun & Keamanan</span>
                  </button>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: PANEL KARTU PENGATURAN */}
            <div className="flex-1 w-full space-y-8">
              {/* =================================================== */}
              {/* SEKSI 1: PROFIL (SEJAJAR DENGAN KOLOM KIRI)        */}
              {/* =================================================== */}
              <section id="section-profil" className="space-y-3 scroll-mt-24 animate-emerge stagger-1">
                <h2 className="text-2xl sm:text-[28px] font-bold text-gray-900 tracking-tight h-8 sm:h-9 flex items-center">
                  Profil
                </h2>

                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-5">
                  {/* Bagian Atas: Avatar + Nama + Peran Terpisah + Email + Tombol Edit */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar with Camera Overlay */}
                      <div
                        className="relative group cursor-pointer"
                        onClick={() => directFileInputRef.current?.click()}
                        title="Klik untuk ganti foto profil"
                      >
                        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white bg-teal-50 flex-shrink-0 shadow-sm ring-2 ring-teal-100/90">
                          <img
                            src={avatarUrl}
                            alt={parseNameAndRole(currentUser.name, currentUser.role).nameOnly}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80";
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Camera className="w-5 h-5 drop-shadow-sm" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#0e6f68] text-white flex items-center justify-center shadow-md border-2 border-white">
                          <Camera className="w-3 h-3" />
                        </div>
                        <input
                          ref={directFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleDirectFileChange}
                        />
                      </div>

                      {/* Detail Nama, Peran Terpisah, Email, dan Role Badge */}
                      <div className="space-y-1">
                        {/* 1. Nama Sendiri */}
                        <h3 className="text-xl font-bold text-gray-900 leading-snug tracking-tight">
                          {parseNameAndRole(currentUser.name, currentUser.role).nameOnly}
                        </h3>

                        {/* 2. Peran Sendiri */}
                        <p className="text-sm font-semibold text-[#0e6f68] flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-[#0e6f68]" />
                          <span>{parseNameAndRole(currentUser.name, currentUser.role).roleTitle}</span>
                        </p>

                        {/* 3. Email */}
                        <p className="text-xs text-gray-500 font-normal">
                          {currentUser.email}
                        </p>

                        {/* 4. Role Badge System */}
                        <div className="pt-0.5">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#0e6f68] border border-teal-100 uppercase tracking-wide">
                            {currentUser.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const parsed = parseNameAndRole(currentUser.name, currentUser.role);
                        setProfileForm({
                          name: parsed.nameOnly,
                          roleTitle: parsed.roleTitle,
                          email: currentUser.email,
                          avatar: avatarUrl,
                        });
                        setFormError(null);
                        setEditProfileOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition self-start sm:self-center cursor-pointer shadow-2xs"
                    >
                      <Pencil className="w-3.5 h-3.5 text-gray-500" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Bagian Bawah: Alamat Wilayah Komunitas */}
                  <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-900">Alamat wilayah</p>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        {communityName} ({communityDetail})
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCommunityId(currentUser.communityId || "");
                        setFormError(null);
                        setEditCommunityOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition self-start sm:self-center cursor-pointer shadow-2xs"
                    >
                      <Pencil className="w-3.5 h-3.5 text-gray-500" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* =================================================== */}
              {/* SEKSI 2: PRIVASI & DATA                            */}
              {/* =================================================== */}
              <section id="section-privasi" className="space-y-3 scroll-mt-24 animate-emerge stagger-2">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Privasi & Data
                </h2>

                <div className="bg-white rounded-[24px] p-4 sm:p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-[#0e6f68]">
                        <RotateCcw className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          Riwayat
                        </span>
                        <p className="text-xs text-gray-500">
                          Catatan asesmen kesiapsiagaan lingkungan yang telah selesai
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/settings/riwayat"
                      className="w-10 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition cursor-pointer shadow-2xs"
                      title="Buka Halaman Riwayat"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </section>

              {/* =================================================== */}
              {/* SEKSI 3: AKUN & KEAMANAN                           */}
              {/* =================================================== */}
              <section id="section-keamanan" className="space-y-3 scroll-mt-24 animate-emerge stagger-3">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Akun & Keamanan
                </h2>

                <div className="bg-white rounded-[24px] p-4 sm:p-6 shadow-sm border border-gray-100 divide-y divide-gray-100">
                  {/* Row 1: Edit password */}
                  <div className="pb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-[#0e6f68]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        Edit password
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setPasswordForm({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setFormError(null);
                        setPasswordOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer shadow-2xs"
                    >
                      <span>Edit</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>

                  {/* Row 2: Logout */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-700">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        Logout
                      </span>
                    </div>

                    <button
                      onClick={() => setLogoutOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer shadow-2xs"
                    >
                      <span>Logout</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>

                  {/* Row 3: Hapus akun (Merah) */}
                  <div className="pt-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 text-red-600">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-red-600">
                        Hapus akun
                      </span>
                    </div>

                    <button
                      onClick={() => setDeleteOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-xs transition transform active:scale-95 cursor-pointer"
                    >
                      <span>Hapus</span>
                      <ChevronRight className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: EDIT PROFIL (PISAH NAMA & PERAN + GANTI FOTO)   */}
      {/* ======================================================== */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Ubah Data Profil</h3>
              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Bagian Ganti Foto Profil */}
              <div className="p-3.5 rounded-2xl bg-gray-50/90 border border-gray-100 space-y-2.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Foto Profil
                </label>
                <div className="flex items-center gap-3.5">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-xs bg-teal-50 flex-shrink-0">
                    <img
                      src={profileForm.avatar}
                      alt="Preview Foto"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => modalFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-xs font-semibold text-gray-700 shadow-2xs transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#0e6f68]" />
                        <span>Unggah Foto</span>
                      </button>
                      <input
                        ref={modalFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleModalFileChange}
                      />
                    </div>
                    {/* Opsi Preset Cepat */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] text-gray-500">Preset:</span>
                      {PRESET_AVATARS.map((preset) => (
                        <button
                          key={preset.src}
                          type="button"
                          onClick={() =>
                            setProfileForm((prev) => ({ ...prev, avatar: preset.src }))
                          }
                          className={`w-6 h-6 rounded-full overflow-hidden border transition cursor-pointer ${
                            profileForm.avatar === preset.src
                              ? "ring-2 ring-[#0e6f68] border-white scale-110"
                              : "border-gray-200 opacity-70 hover:opacity-100"
                          }`}
                          title={`Gunakan ${preset.label}`}
                        >
                          <img
                            src={preset.src}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Input 1: Nama Lengkap (Nama Sendiri) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  placeholder="Contoh: Bambang Sudarsono"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e6f68] focus:border-transparent"
                />
              </div>

              {/* Input 2: Peran / Jabatan di Lingkungan (Perannya Sendiri) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Peran / Jabatan di Lingkungan</span>
                  <span className="text-[11px] text-[#0e6f68] font-medium">
                    (Terpisah dari nama)
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.roleTitle}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, roleTitle: e.target.value })
                  }
                  placeholder="Contoh: Ketua RT 03 / Koordinator Warga / Warga"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e6f68] focus:border-transparent"
                />
              </div>

              {/* Input 3: Alamat Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e6f68] focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0e6f68] hover:bg-[#0a524d] text-white text-xs font-bold shadow-xs disabled:opacity-50 transition cursor-pointer"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT ALAMAT WILAYAH                             */}
      {/* ======================================================== */}
      {editCommunityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#0e6f68]" />
                <h3 className="text-lg font-bold text-gray-900">
                  Pilih Lingkungan Wilayah
                </h3>
              </div>
              <button
                onClick={() => setEditCommunityOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveCommunity} className="space-y-4">
              <p className="text-xs text-gray-500">
                Pilih komunitas pemukiman (RT/RW) tempat tinggal Anda saat ini untuk menyesuaikan jalur evakuasi dan data asesmen:
              </p>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {communities.map((comm) => {
                  const isSelected = selectedCommunityId === comm.id;
                  return (
                    <div
                      key={comm.id}
                      onClick={() => setSelectedCommunityId(comm.id)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-teal-50/70 border-[#0e6f68] text-gray-900 ring-1 ring-[#0e6f68]"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-gray-900">{comm.name}</p>
                        <p className="text-[11px] text-gray-500">
                          RT {comm.rt} / RW {comm.rw}, Kel. {comm.kelurahan}, {comm.kota}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#0e6f68] flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditCommunityOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0e6f68] hover:bg-[#0a524d] text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Wilayah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: EDIT PASSWORD                                   */}
      {/* ======================================================== */}
      {passwordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#0e6f68]" />
                <h3 className="text-lg font-bold text-gray-900">Ubah Password</h3>
              </div>
              <button
                onClick={() => setPasswordOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password Saat Ini
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password lama Anda"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e6f68] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e6f68] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi password baru"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e6f68] focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0e6f68] hover:bg-[#0a524d] text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Ubah Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: LOGOUT CONFIRMATION                             */}
      {/* ======================================================== */}
      {logoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-[#0e6f68] mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Keluar dari Akun?</h3>
              <p className="text-xs text-gray-500">
                Apakah Anda yakin ingin keluar dari sesi akun Anda saat ini?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setLogoutOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 w-full"
              >
                Batal
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-2 rounded-xl bg-[#0e6f68] hover:bg-[#0a524d] text-white text-xs font-bold w-full shadow-xs"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 7: HAPUS AKUN CONFIRMATION                         */}
      {/* ======================================================== */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-red-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-gray-900">
                Hapus Akun Permanen?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Seluruh riwayat asesmen dan data partisipasi warga Anda di lingkungan ini akan dinonaktifkan secara permanen.
              </p>
            </div>

            <div className="p-3 bg-red-50 rounded-xl text-left border border-red-100">
              <p className="text-[11px] font-medium text-red-700">
                ⚠️ Untuk perlindungan keamanan data, silakan hubungi pengurus RT/RW atau administrator jika Anda ingin menghapus seluruh data kependudukan lingkungan secara menyeluruh.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 w-full"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setDeleteOpen(false);
                  showToast("Permintaan penghapusan akun telah dicatat oleh sistem keamanan.");
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold w-full shadow-xs"
              >
                Konfirmasi Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
