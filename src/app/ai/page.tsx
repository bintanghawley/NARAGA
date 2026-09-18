"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  Bot,
  Settings,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";

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
        "Halo! Saya adalah NARAGA.AI . Saya siap membantu Anda menganalisis kesenjangan kesiapsiagaan lingkungan, menyusun rencana aksi mitigasi, dan panduan evakuasi praktis.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          sessionId,
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

  const samplePrompts = [
    "Apa saja prioritas perbaikan berdasarkan asesmen lingkungan saya?",
    "Bagaimana menentukan titik kumpul aman yang ideal?",
  ];

  return (
    <div className="min-h-screen bg-[#ebf4fa] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
        {/* ======================================================== */}
        {/* 1. SIDEBAR KIRI (Floating White Card Sesuai Desain Figma) */}
        {/* ======================================================== */}
        <aside className="w-full lg:w-64 bg-white rounded-[28px] p-4 shadow-sm border border-gray-100 flex-shrink-0 space-y-2">
          {/* Menu 1: Overview (Inactive) */}
          <Link
            href="/dashboard"
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium text-sm transition"
          >
            <div className="w-5 h-5 flex items-center justify-center text-gray-600">
              <Compass className="w-5 h-5" />
            </div>
            <span>Overview</span>
          </Link>

          {/* Menu 2: Tanya AI ✨ (Active - Deep Teal Pill) */}
          <Link
            href="/ai"
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#0e6f68] text-white font-semibold text-sm shadow-xs transition"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="flex items-center gap-1.5">
              Tanya AI <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </span>
          </Link>

          {/* Menu 3: Settings (Inactive) */}
          <Link
            href="/dashboard#settings"
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium text-sm transition"
          >
            <div className="w-5 h-5 flex items-center justify-center text-gray-600">
              <Settings className="w-5 h-5" />
            </div>
            <span>Settings</span>
          </Link>
        </aside>

        {/* ======================================================== */}
        {/* 2. KONTEN UTAMA KANAN (Talk With NARAGA.AI)               */}
        {/* ======================================================== */}
        <main className="flex-1 w-full space-y-6">
          {/* Header Title & Subtitle */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-[34px] font-bold text-gray-900 tracking-tight">
              Talk With NARAGA.AI
            </h1>
            <p className="text-sm sm:text-base font-bold text-gray-900 max-w-3xl leading-relaxed">
              Ceritakan kondisi lingkunganmu dan dapatkan penjelasan serta saran berdasarkan hasil kesiapsiagaanmu.
            </p>
          </div>

          {/* Main Chat Box Container (Floating White Card Sesuai Figma) */}
          <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[580px]">
            {/* Conversation Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1 max-h-[520px]">
              {messages.map((m) => {
                const isAI = m.role === "assistant";

                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3.5 ${
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
                        <div className="whitespace-pre-line">{m.content}</div>
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

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Inner Box: Suggestion Pills + Input Field (Sesuai Desain Figma) */}
            <div className="border border-gray-200/90 rounded-2xl p-2.5 sm:p-3 bg-white space-y-2.5 mt-6">
              {/* Suggestion Prompt Pills */}
              <div className="flex flex-wrap items-center gap-2 pb-2.5 border-b border-gray-100/90">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="bg-gray-100/90 hover:bg-gray-200 text-gray-700 text-xs px-3.5 py-1.5 rounded-full transition cursor-pointer font-normal text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

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
                  placeholder="Tanyakan langkah kesiapsiagaan atau solusi kesenjangan ..."
                  className="flex-1 text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none py-1"
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
