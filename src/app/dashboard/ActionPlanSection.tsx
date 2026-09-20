"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export interface ActionPlanItem {
  id: string;
  title: string;
  priority: string;
  description: string;
}

export default function ActionPlanSection({
  initialItems,
}: {
  initialItems: ActionPlanItem[];
}) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section className="space-y-3 pt-2">
      {/* Header Action Plan */}
      <div>
        <h2 className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight">
          Action Plan
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 font-normal mt-1">
          Dihasilkan secara otomatis oleh sistem berdasarkan deteksi kesenjangan kesiapan
        </p>
      </div>

      {/* Container List Action Plan */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
        <div className="divide-y divide-gray-100">
          {initialItems.map((item, index) => {
            const isCompleted = completedIds.has(item.id);

            return (
              <div
                key={item.id || index}
                style={{ animationDelay: `${index * 80 + 100}ms` }}
                className="py-5 first:pt-0 last:pb-0 transition-all animate-emerge"
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox / Circle */}
                  <button
                    type="button"
                    onClick={() => toggleComplete(item.id)}
                    className="mt-0.5 flex-shrink-0 cursor-pointer transition transform active:scale-90"
                    aria-label={isCompleted ? "Tandai belum selesai" : "Tandai selesai"}
                  >
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-[#0e6f68] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-gray-400 bg-white transition" />
                    )}
                  </button>

                  {/* Body Konten */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Baris Judul & Badge Prioritas */}
                    <div className="flex items-start justify-between gap-4">
                      <h3
                        className={`text-sm sm:text-base font-bold text-gray-900 leading-snug transition ${
                          isCompleted ? "line-through text-gray-400" : ""
                        }`}
                      >
                        {item.title}
                      </h3>
                      <span className="bg-[#fee2e2] text-[#ef4444] text-[11px] font-bold px-2.5 py-0.5 rounded-md flex-shrink-0 tracking-wide">
                        {item.priority}
                      </span>
                    </div>

                    {/* Deskripsi Rekomendasi */}
                    <p
                      className={`text-xs text-gray-600 leading-relaxed max-w-4xl font-normal transition ${
                        isCompleted ? "line-through text-gray-400" : ""
                      }`}
                    >
                      {item.description}
                    </p>

                    {/* Tombol Aksi */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => toggleComplete(item.id)}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          isCompleted
                            ? "border-teal-200 bg-teal-50 text-[#0e6f68]"
                            : "border-[#0e6f68] text-[#0e6f68] hover:bg-[#0e6f68]/5"
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Telah Selesai</span>
                          </>
                        ) : (
                          <span>Tandai sebagai selesai</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
