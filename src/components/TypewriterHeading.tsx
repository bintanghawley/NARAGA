"use client";

import { useState, useEffect } from "react";

interface TypewriterHeadingProps {
  lines: string[];
  speed?: number;
  initialDelay?: number;
  className?: string;
  minHeightClass?: string;
}

export default function TypewriterHeading({
  lines,
  speed = 50,
  initialDelay = 100,
  className = "text-4xl sm:text-5xl lg:text-[54px] font-black text-white leading-[1.08] tracking-tight",
  minHeightClass,
}: TypewriterHeadingProps) {
  const fullText = lines.join("\n");
  const [displayedText, setDisplayedText] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let currentIdx = 0;
    setDisplayedText("");
    setIsFinished(false);

    const startTimer = setTimeout(() => {
      const interval = setInterval(() => {
        currentIdx++;
        setDisplayedText(fullText.slice(0, currentIdx));

        if (currentIdx >= fullText.length) {
          clearInterval(interval);
          setIsFinished(true);
        }
      }, speed);

      return () => clearInterval(interval);
    }, initialDelay);

    return () => clearTimeout(startTimer);
  }, [fullText, speed, initialDelay]);

  const currentLines = displayedText.split("\n");

  // Default min-height agar tidak ada lonjakan layout (CLS) saat teks sedang diketik
  const defaultMinHeight =
    minHeightClass ||
    (lines.length >= 3
      ? "min-h-[135px] sm:min-h-[165px] lg:min-h-[185px]"
      : "min-h-[90px] sm:min-h-[110px] lg:min-h-[125px]");

  return (
    <h1
      aria-label={lines.join(" ")}
      className={`${className} ${defaultMinHeight} flex flex-col justify-start`}
    >
      {currentLines.map((line, idx) => {
        const isLastLine = idx === currentLines.length - 1;
        return (
          <span key={idx} className="inline-flex items-baseline">
            <span>{line}</span>
            {isLastLine && (
              <span
                className="inline-block w-[3.5px] sm:w-[4.5px] h-[0.82em] bg-teal-200 ml-1.5 align-baseline animate-blink rounded-xs shadow-[0_0_10px_rgba(153,246,228,0.75)]"
                aria-hidden="true"
              />
            )}
          </span>
        );
      })}
    </h1>
  );
}
