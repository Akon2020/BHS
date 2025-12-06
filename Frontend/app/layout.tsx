import type React from "react";
import type { Metadata } from "next";
import { Inter, Crimson_Pro } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/contexts/theme-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Burning Heart - Ignatian Spirituality",
  description:
    "Burning Heart Ignatian Spirituality - Ravivez la flamme de l'espérance dans votre coeur",
  icons: {
    icon: [
      {
        url: "/images/logon.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/images/logon.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/images/logon.png",
        type: "image/png",
      },
    ],
    apple: "/images/logon.png",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#8B1538" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/images/logon.png" />
      </head>
      <body
        className={`${inter.variable} ${crimsonPro.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
