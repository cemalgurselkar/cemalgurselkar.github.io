import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ScrollProgress } from "@/components/motion/scroll-progress";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cemal Gürsel Kar — AI/ML & Data Engineering",
    template: "%s — Cemal Gürsel Kar",
  },
  description:
    "Portfolio of Cemal Gürsel Kar, a computer engineering graduate building inspectable AI, retrieval, robotics, and data systems.",
  applicationName: "Cemal Gürsel Kar Portfolio",
  authors: [{ name: "Cemal Gürsel Kar" }],
  creator: "Cemal Gürsel Kar",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0b0d0e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable}`} lang="en">
      <body>
        <ScrollProgress />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div className="flex min-h-dvh flex-col">
          <Header />
          <main className="flex-1" id="main-content" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
