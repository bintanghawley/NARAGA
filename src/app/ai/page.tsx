"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import {
  detectUserLocation,
  hasLocationPermission,
  saveLocationPermission,
  UserLocation,
  SIDOARJO_PRESET,
} from "@/lib/location";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import DashboardSidebar from "@/components/DashboardSidebar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AIChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#ebf4fa] flex items-center justify-center py-20 text-sm text-gray-500">
          Memuat Talk With NARAGA.AI...
        </div>
      }
    >
      <AIChatContent />
    </Suspense>
  );
}

function AIChatContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") || undefined;
  const initialTopic = searchParams.get("topic") || "";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro-1",
      role: "assistant",
      content:
        "Halo! Saya adalah **NARAGA.AI**. Saya siap membantu Anda menganalisis kesenjangan kesiapsiagaan lingkungan, menyusun rencana aksi mitigasi bencana, panduan evakuasi, serta mendiskusikan topik ketahanan terkait seperti adaptasi perubahan iklim, sanitasi pasca-bencana, penanganan trauma, hingga keamanan keluarga.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasStartedChat = messages.some((m) => m.role === "user");
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // Deteksi lokasi pengguna & dengarkan perubahan lokasi dari halaman peta untuk grounding AI
  useEffect(() => {
    if (hasLocationPermission()) {
      detectUserLocation().then((loc) => setUserLocation(loc));
    }

    const handleLocChange = (e: any) => {
      if (e.detail) {
        setUserLocation(e.detail);
      } else {
        setUserLocation(null);
      }
    };
    window.addEventListener("naraga_location_changed", handleLocChange);
    return () => window.removeEventListener("naraga_location_changed", handleLocChange);
  }, []);

  // Measure initial compact height on mount, or set expanded height if already chatted
  useEffect(() => {
    if (!hasStartedChat && cardRef.current) {
      setCardHeight(cardRef.current.offsetHeight);
    } else if (hasStartedChat) {
      const target = Math.min(Math.max(window.innerHeight - 210, 520), 640);
      setCardHeight(target);
    }
  }, []);

  // Responsive height adjustment on window resize
  useEffect(() => {
    const handleResize = () => {
      if (hasStartedChat) {
        setCardHeight(Math.min(Math.max(window.innerHeight - 210, 520), 640));
      } else if (cardRef.current) {
        setCardHeight(cardRef.current.offsetHeight);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [hasStartedChat]);

  // Smooth scroll to bottom when messages update
  useEffect(() => {
    if (hasStartedChat) {
      scrollToBottom();
      const t1 = setTimeout(() => scrollToBottom(), 150);
      const t2 = setTimeout(() => scrollToBottom(), 520);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [messages, loading]);

  useEffect(() => {
    if (initialTopic === "fasilitas") {
      setInput("Bagaimana langkah prioritas untuk mengatasi kekurangan fasilitas keselamatan di lingkungan saya?");
    } else if (initialTopic === "sosialisasi") {
      setInput("Bagaimana cara efektif menyosialisasikan jalur evakuasi dan titik kumpul kepada seluruh warga?");
    }
  }, [initialTopic]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    // Trigger smooth expansion to full canvas height immediately
    if (!hasStartedChat) {
      const target = Math.min(Math.max(window.innerHeight - 210, 520), 640);
      setCardHeight(target);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput("");
    setLoading(true);

    let locToSend = userLocation;
    if (
      !locToSend &&
      (textToSend.toLowerCase().includes("lokasi saya") ||
        textToSend.toLowerCase().includes("di mana") ||
        textToSend.toLowerCase().includes("dimana"))
    ) {
      try {
        saveLocationPermission(true);
        locToSend = await Promise.race([
          detectUserLocation(false),
          new Promise<UserLocation>((_, reject) => setTimeout(() => reject("timeout"), 600)),
        ]).catch(() => SIDOARJO_PRESET);
        if (locToSend) setUserLocation(locToSend);
      } catch {}
    }

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          sessionId,
          userLocation: locToSend || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.reply,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "Mohon maaf, terjadi kendala saat memproses jawaban. Silakan coba kembali sesaat lagi.",
          },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Tidak dapat terhubung ke server asisten AI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#ebf4fa] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
        {/* ======================================================== */}
        {/* 1. SIDEBAR KIRI FIXED & ANIMASI SLIDING HIJAU             */}
        {/* ======================================================== */}
        <DashboardSidebar />

        {/* ======================================================== */}
        {/* 2. KONTEN UTAMA KANAN (Talk With NARAGA.AI)               */}
        {/* ======================================================== */}
        <main className="flex-1 w-full space-y-5">
          {/* Header Title & Subtitle */}
          <div className="space-y-1.5 animate-emerge">
            <h1 className="text-3xl sm:text-[34px] font-bold text-gray-900 tracking-tight">
              Talk With NARAGA.AI
            </h1>
            <p className="text-sm sm:text-base font-bold text-gray-900 max-w-3xl leading-relaxed">
              Ceritakan kondisi lingkunganmu dan dapatkan penjelasan serta saran berdasarkan hasil kesiapsiagaanmu.
            </p>
          </div>

          {/* Main Chat Box Container (Floating White Card Sesuai Figma) */}
          <div
            ref={cardRef}
            style={{
              height: cardHeight ? `${cardHeight}px` : undefined,
            }}
            className="bg-white rounded-[32px] p-5 sm:p-7 border border-gray-100 shadow-sm flex flex-col transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden will-change-[height]"
          >
            {/* Conversation Messages Area */}
            <div
              ref={chatContainerRef}
              className={`space-y-6 pr-2 custom-scrollbar ${
                hasStartedChat
                  ? "flex-1 min-h-0 overflow-y-auto"
                  : "overflow-visible"
              }`}
            >
              {messages.map((m) => {
                const isAI = m.role === "assistant";

                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                      isAI ? "justify-start" : "justify-end"
                    }`}
                  >
                    {/* Bot Avatar Icon di kiri pesan AI */}
                    {isAI && (
                      <div className="w-9 h-9 rounded-full bg-[#0e6f68] text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                        <Bot className="w-5 h-5" />
                      </div>
                    )}

                    {/* Chat Bubble */}
                    <div className="relative group max-w-xl">
                      <div
                        className={`p-4 sm:p-5 text-sm sm:text-[15px] leading-relaxed shadow-xs transition-all ${
                          isAI
                            ? "bg-[#edf8f6] text-gray-800 rounded-2xl rounded-tl-sm font-normal"
                            : "bg-[#0e6f68] text-white rounded-2xl rounded-tr-sm font-medium"
                        }`}
                      >
                        <MarkdownRenderer content={m.content} isAI={isAI} />
                      </div>

                      {/* Tombol Copy Clipboard untuk pesan AI */}
                      {isAI && (
                        <button
                          type="button"
                          onClick={() => handleCopy(m.id, m.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 -right-2 p-1.5 bg-white border border-gray-200 text-gray-600 hover:text-[#0e6f68] rounded-lg shadow-xs text-xs flex items-center gap-1 cursor-pointer"
                          title="Salin ke clipboard"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3 h-3 text-[#0e6f68]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator (Animasi 3 Titik Sesuai Desain Figma) */}
              {loading && (
                <div className="flex items-center gap-3.5 animate-in fade-in duration-200">
                  <div className="w-9 h-9 rounded-full bg-[#0e6f68] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-[#edf8f6] rounded-full px-5 py-3.5 flex items-center gap-2 shadow-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Inner Box: Input Field (Sesuai Desain Figma NARAGA) */}
            <div className="flex-shrink-0 border border-gray-200/90 rounded-2xl p-2 sm:p-2.5 bg-white mt-4 shadow-2xs">

              {/* Input Form Row */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 pl-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tanyakan kesiapsiagaan bencana, mitigasi risiko, perubahan iklim, atau sanitasi..."
                  className="flex-1 text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none py-1.5"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-9 h-9 rounded-full bg-[#0e6f68] hover:bg-[#0a524d] text-white flex items-center justify-center flex-shrink-0 transition cursor-pointer shadow-xs disabled:opacity-40"
                  aria-label="Kirim Pesan"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>


    </div>
  );
}
