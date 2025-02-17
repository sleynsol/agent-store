import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "agentstore",
  description: "Your AI app store - Chat with specialized AI agents for health, fitness, finance, and more. Connect your wallet to start chatting with AI agents tailored to your needs.",
  keywords: ["AI", "chatbot", "artificial intelligence", "Solana", "wallet", "agents", "chat"],
  authors: [{ name: "agentstore" }],
  openGraph: {
    title: "agentstore - Your AI App Store",
    description: "Chat with specialized AI agents for health, fitness, finance, and more. Connect your wallet to start chatting with AI agents tailored to your needs.",
    url: "https://goagent.app",
    siteName: "agentstore",
    images: [
      {
        url: "/assets/og-image.png", // Make sure to add this image to your public/assets folder
        width: 1200,
        height: 630,
        alt: "agentstore Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "agentstore - Your AI App Store",
    description: "Chat with specialized AI agents for health, fitness, finance, and more. Connect your wallet to start chatting with AI agents tailored to your needs.",
    images: ["/assets/og-image.png"], // Same image as OpenGraph
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
