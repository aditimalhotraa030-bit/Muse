import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HideOnAdmin from "@/components/layout/HideOnAdmin";
import { Toaster } from "@/lib/toast";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "muse by Kashish",
  description: "Premium Artificial Jewelry Store",
  icons: {
    icon: [
      { url: '/favicon.png' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <HideOnAdmin>
          <Navbar />
        </HideOnAdmin>
        <main className="flex-1 flex flex-col">{children}</main>
        <HideOnAdmin>
          <Footer />
        </HideOnAdmin>
        <Toaster />
      </body>
    </html>
  );
}
