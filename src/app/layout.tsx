import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
      <body className="min-h-full flex flex-col bg-white text-gray-900 selection:bg-teal-100 selection:text-teal-900">
        <Providers>
          <Navbar />
          <main className="flex-1 bg-white">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
