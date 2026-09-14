"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Send, User, Sparkles, AlertCircle, CheckCircle2, Shield } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AIChatPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto py-20 text-center text-sm text-gray-500">Memuat AI Assistant...</div>}>
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
      id: "intro",
      role: "assistant",
      content:
        "Halo! Saya adalah **Context-Aware AI Assistant NARAGA**. Saya siap membantu Anda menganalisis kesenjangan kesiapsiagaan lingkungan, menyusun rencana aksi mitigasi, dan panduan evakuasi praktis.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [groundingInfo, setGroundingInfo] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialTopic === "fasilitas") {
      setInput("Bagaimana langkah prioritas untuk mengatasi kekurangan fasilitas keselamatan di lingkungan saya?");
    } else if (initialTopic === "sosialisasi") {
      setInput("Bagaimana cara efektif menyosialisasikan jalur evakuasi dan titik kumpul kepada seluruh warga?");
    }
  }, [initialTopic]);

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
        if (data.contextGrounded) {
          setGroundingInfo(data.contextGrounded);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Mohon maaf, terjadi kendala saat memproses jawaban. Silakan coba kembali.",
          },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Tidak dapat terhubung ke server asisten.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Apa saja prioritas perbaikan berdasarkan asesmen lingkungan saya?",
    "Bagaimana menentukan titik kumpul aman yang ideal?",
    "Apa saja barang penting yang wajib ada di Tas Siaga Bencana?",
    "Bagaimana menyosialisasikan kontak darurat ke warga?",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Context-Aware AI Assistant
            </h1>
            <p className="text-xs text-gray-500">
              Didukung Gemini API &bull; Menjawab berdasarkan konteks data kesiapan pemukiman
            </p>
          </div>
        </div>

        {groundingInfo && (
          <div className="text-xs px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-800 rounded-xl space-y-0.5">
            <p className="font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" /> Grounding Aktif:
            </p>
            <p className="text-[11px] text-purple-700">
              Wilayah: <strong>{groundingInfo.communityName}</strong>
              {groundingInfo.readinessScore !== null && ` (Skor: ${groundingInfo.readinessScore}%)`}
            </p>
          </div>
        )}
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[520px]">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  m.role === "user"
                    ? "bg-emerald-600 text-white"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-50 text-gray-800 border border-gray-100 whitespace-pre-line"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-500 border border-gray-100">
                Sedang menganalisis konteks kesiapan wilayah...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Chips */}
        <div className="px-6 py-2 border-t border-gray-100 flex gap-2 overflow-x-auto">
          {samplePrompts.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sp)}
              className="text-[11px] whitespace-nowrap bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition"
            >
              {sp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan langkah kesiapsiagaan atau solusi kesenjangan..."
              className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              Kirim
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
