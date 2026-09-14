import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NARAGA - Platform Kesiapsiagaan Komunitas Menuju Pemukiman Tangguh Bencana",
  description: "Platform evaluasi kesiapsiagaan pra-bencana berbasis Readiness Gap untuk warga dan pengurus lingkungan (RT/RW).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500">
            <div className="max-w-7xl mx-auto px-4">
              <p className="font-semibold text-gray-700">NARAGA &bull; Platform Kesiapsiagaan Komunitas</p>
              <p className="mt-1">Infinitera 2.0 Web Development Competition &bull; Menuju SDG 11: Pemukiman Tangguh Bencana</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
