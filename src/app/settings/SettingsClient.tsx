"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Compass,
  Bot,
  Settings,
  Sparkles,
  User,
  Shield,
  SlidersHorizontal,
  Lock,
  Pencil,
  RotateCcw,
  Sun,
  Moon,
  Languages,
  LogOut,
  Trash2,
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  KeyRound,
  Building,
  Clock,
  ExternalLink,
} from "lucide-react";

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

interface AssessmentHistoryItem {
  id: string;
  score: number;
  completedAt: string | Date | null;
  facilityGapCount: number;
  awarenessGapCount: number;
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
  history: AssessmentHistoryItem[];
}

export default function SettingsClient({
  initialUser,
  communities,
  history,
}: SettingsClientProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "profil" | "privasi" | "preferensi" | "keamanan"
  >("profil");

  // User state
  const [currentUser, setCurrentUser] = useState(initialUser);

  // Preference states
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("Bahasa Indonesia");

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
  const [historyOpen, setHistoryOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: initialUser.name,
    email: initialUser.email,
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

  // Scroll smoothly to section when subtab clicked
  const handleTabClick = (tab: "profil" | "privasi" | "preferensi" | "keamanan") => {
    setActiveSubTab(tab);
    const elementId =
      tab === "profil"
        ? "section-profil"
        : tab === "privasi"
        ? "section-privasi"
        : tab === "preferensi"
        ? "section-preferensi"
        : "section-keamanan";
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 1. Submit Edit Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui profil");
      }
      setCurrentUser((prev) => ({
        ...prev,
        name: profileForm.name,
        email: profileForm.email,
      }));
      setEditProfileOpen(false);
      showToast("Profil berhasil diperbarui!");
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
        {/* 1. SIDEBAR KIRI UTAMA (Floating White Card Sesuai Figma) */}
        {/* ======================================================== */}
        <aside className="w-full lg:w-64 bg-white rounded-[28px] p-4 shadow-sm border border-gray-100 flex-shrink-0 space-y-2">
          {/* Menu 1: Overview */}
          <Link
            href="/dashboard"
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium text-sm transition"
          >
            <div className="w-5 h-5 flex items-center justify-center text-gray-600">
              <Compass className="w-5 h-5" />
            </div>
            <span>Overview</span>
          </Link>

          {/* Menu 2: Tanya AI ✨ */}
          <Link
            href="/ai"
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium text-sm transition"
          >
            <div className="w-5 h-5 flex items-center justify-center text-gray-600">
              <Bot className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1.5">
              Tanya AI <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </span>
          </Link>

          {/* Menu 3: Settings (ACTIVE - Deep Teal Pill) */}
          <Link
            href="/settings"
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#0e6f68] text-white font-semibold text-sm shadow-xs transition"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span>Settings</span>
          </Link>
        </aside>

        {/* ======================================================== */}
        {/* 2. KONTEN UTAMA SETTINGS                                 */}
        {/* ======================================================== */}
        <main className="flex-1 w-full space-y-6">
          {/* Judul Halaman */}
          <h1 className="text-3xl sm:text-[34px] font-bold text-gray-900 tracking-tight">
            Settings
          </h1>

          {/* Layout Dua Kolom: Sub-Sidebar Navigasi & Kartu-Kartu Pengaturan */}
          <div className="flex flex-col md:flex-row items-start gap-6 lg:gap-8">
            {/* SUB-SIDEBAR NAVIGASI PENGATURAN */}
            <div className="w-full md:w-56 bg-white rounded-[24px] p-3 shadow-sm border border-gray-100 flex-shrink-0 space-y-1.5">
              {/* Tab 1: Profil */}
              <button
                onClick={() => handleTabClick("profil")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition cursor-pointer text-left ${
                  activeSubTab === "profil"
                    ? "bg-[#0e6f68] text-white font-semibold shadow-2xs"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <User
                  className={`w-4 h-4 ${
                    activeSubTab === "profil" ? "text-white" : "text-gray-600"
                  }`}
                />
                <span>Profil</span>
              </button>

              {/* Tab 2: Privasi & Data */}
              <button
                onClick={() => handleTabClick("privasi")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition cursor-pointer text-left ${
                  activeSubTab === "privasi"
                    ? "bg-[#0e6f68] text-white font-semibold shadow-2xs"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Shield
                  className={`w-4 h-4 ${
                    activeSubTab === "privasi" ? "text-white" : "text-gray-600"
                  }`}
                />
                <span>Privasi & Data</span>
              </button>

              {/* Tab 3: Preferensi */}
              <button
                onClick={() => handleTabClick("preferensi")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition cursor-pointer text-left ${
                  activeSubTab === "preferensi"
                    ? "bg-[#0e6f68] text-white font-semibold shadow-2xs"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <SlidersHorizontal
                  className={`w-4 h-4 ${
                    activeSubTab === "preferensi" ? "text-white" : "text-gray-600"
                  }`}
                />
                <span>Preferensi</span>
              </button>

              {/* Tab 4: Akun & Keamanan */}
              <button
                onClick={() => handleTabClick("keamanan")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition cursor-pointer text-left ${
                  activeSubTab === "keamanan"
                    ? "bg-[#0e6f68] text-white font-semibold shadow-2xs"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Lock
                  className={`w-4 h-4 ${
                    activeSubTab === "keamanan" ? "text-white" : "text-gray-600"
                  }`}
                />
                <span>Akun & Keamanan</span>
              </button>
            </div>

            {/* PANEL KARTU PENGATURAN (SISI KANAN) */}
            <div className="flex-1 w-full space-y-8">
              {/* =================================================== */}
              {/* SEKSI 1: PROFIL                                    */}
              {/* =================================================== */}
              <section id="section-profil" className="space-y-3 scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Profil
                </h2>

                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-5">
                  {/* Bagian Atas: Avatar + Nama + Email + Tombol Edit */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-gray-200 bg-teal-50 flex-shrink-0 shadow-xs">
                        <img
                          src="/images/avatar-evan.jpg"
                          alt={currentUser.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80";
                          }}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-lg font-bold text-gray-900 leading-snug">
                          {currentUser.name}
                        </h3>
                        <p className="text-sm text-gray-500">{currentUser.email}</p>
                        <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#0e6f68] border border-teal-100 uppercase mt-1">
                          {currentUser.role}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setProfileForm({
                          name: currentUser.name,
                          email: currentUser.email,
                        });
                        setFormError(null);
                        setEditProfileOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition self-start sm:self-center cursor-pointer shadow-2xs"
                    >
                      <Pencil className="w-3.5 h-3.5 text-gray-500" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Bagian Bawah: Sub-kartu Alamat Wilayah (Latar Hijau Mint Muda) */}
                  <div className="bg-[#f0fbf9] border border-teal-100/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              <section id="section-privasi" className="space-y-3 scroll-mt-24">
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
              {/* SEKSI 3: PREFERENSI                                */}
              {/* =================================================== */}
              <section id="section-preferensi" className="space-y-3 scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Preferensi
                </h2>

                <div className="bg-white rounded-[24px] p-4 sm:p-6 shadow-sm border border-gray-100 divide-y divide-gray-100">
                  {/* Item 1: Dark Mode Toggle Radio */}
                  <div className="pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <Sun className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        Dark Mode
                      </span>
                    </div>

                    <div className="flex items-center gap-5 sm:gap-7">
                      {/* Opsi Light */}
                      <button
                        type="button"
                        onClick={() => {
                          setDarkMode(false);
                          showToast("Mode Terang (Light Mode) aktif");
                        }}
                        className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-800 cursor-pointer group"
                      >
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                            !darkMode
                              ? "border-[#0e6f68] bg-[#0e6f68]"
                              : "border-gray-300 group-hover:border-gray-400"
                          }`}
                        >
                          {!darkMode && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <Sun className="w-4 h-4 text-gray-700" />
                        <span>Light</span>
                      </button>

                      {/* Opsi Dark */}
                      <button
                        type="button"
                        onClick={() => {
                          setDarkMode(true);
                          showToast("Mode Gelap (Dark Mode) aktif");
                        }}
                        className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-800 cursor-pointer group"
                      >
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                            darkMode
                              ? "border-[#0e6f68] bg-[#0e6f68]"
                              : "border-gray-300 group-hover:border-gray-400"
                          }`}
                        >
                          {darkMode && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <Moon className="w-4 h-4 text-gray-700" />
                        <span>Dark</span>
                      </button>
                    </div>
                  </div>

                  {/* Item 2: Bahasa */}
                  <div className="pt-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-[#0e6f68]">
                        <Languages className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        Bahasa
                      </span>
                    </div>

                    <button
                      onClick={() => setLanguageOpen(true)}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer shadow-2xs"
                    >
                      <span>{selectedLanguage}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </section>

              {/* =================================================== */}
              {/* SEKSI 4: AKUN & KEAMANAN                           */}
              {/* =================================================== */}
              <section id="section-keamanan" className="space-y-3 scroll-mt-24">
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
      {/* MODAL 1: EDIT PROFIL                                     */}
      {/* ======================================================== */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Ubah Data Profil</h3>
              <button
                onClick={() => setEditProfileOpen(false)}
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

            <form onSubmit={handleSaveProfile} className="space-y-4">
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e6f68] focus:border-transparent"
                />
              </div>

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

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0e6f68] hover:bg-[#0a524d] text-white text-xs font-bold shadow-xs disabled:opacity-50"
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
      {/* MODAL 3: RIWAYAT ASESMEN                                 */}
      {/* ======================================================== */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0e6f68]" />
                <h3 className="text-lg font-bold text-gray-900">
                  Riwayat Asesmen Kesiapsiagaan
                </h3>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <RotateCcw className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-700">
                  Belum Ada Riwayat Asesmen
                </p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Anda belum pernah mengisi tes kesiapsiagaan lingkungan.
                </p>
                <Link
                  href="/assessment"
                  className="inline-block mt-2 px-4 py-2 rounded-xl bg-[#0e6f68] text-white text-xs font-bold"
                >
                  Mulai Tes Sekarang
                </Link>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                {history.map((h, idx) => {
                  const dateStr = h.completedAt
                    ? new Date(h.completedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Tanggal tidak tercatat";

                  return (
                    <div
                      key={h.id || idx}
                      className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50/70 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            Skor: {Math.round(h.score)}%
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-[#0e6f68]">
                            Selesai
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">{dateStr}</p>
                        <p className="text-[11px] text-gray-600">
                          Gap Sarana: {h.facilityGapCount} • Gap Pemahaman:{" "}
                          {h.awarenessGapCount}
                        </p>
                      </div>

                      <Link
                        href="/assessment?view=result"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0e6f68] hover:underline"
                      >
                        Lihat <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setHistoryOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: PEMILIH BAHASA                                  */}
      {/* ======================================================== */}
      {languageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Pilih Bahasa</h3>
              <button
                onClick={() => setLanguageOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { label: "Bahasa Indonesia", code: "id" },
                { label: "English (United States)", code: "en" },
              ].map((lang) => {
                const isSelected = selectedLanguage === lang.label;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.label);
                      setLanguageOpen(false);
                      showToast(`Bahasa diatur ke: ${lang.label}`);
                    }}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition cursor-pointer text-left ${
                      isSelected
                        ? "bg-teal-50 border-[#0e6f68] font-bold text-[#0e6f68]"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium"
                    }`}
                  >
                    <span>{lang.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#0e6f68]" />}
                  </button>
                );
              })}
            </div>
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
