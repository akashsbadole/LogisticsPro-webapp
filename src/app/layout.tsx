import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LogisticsPro - Logistics & Warehousing Management",
  description: "Comprehensive logistics and warehousing management system with real-time tracking, inventory management, and billing.",
  keywords: ["logistics", "warehousing", "inventory", "shipping", "fleet management"],
  authors: [{ name: "LogisticsPro Team" }],
  openGraph: {
    title: "LogisticsPro",
    description: "Comprehensive logistics and warehousing management system",
    url: "https://logisticspro.com",
    siteName: "LogisticsPro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LogisticsPro",
    description: "Comprehensive logistics and warehousing management system",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
