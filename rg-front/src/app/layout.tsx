import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/ReduxProvider";
import QueryProvider from "@/components/QueryProvider";
import TWAProvider from "@/components/TWAProvider";
import AuthGuard from "@/components/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reference Generator",
  description: "Reference Generator - a tool to generate references for your research",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <QueryProvider>
            <TWAProvider>
              <AuthGuard>
                <div className="min-h-screen">
                  {children}
                </div>
              </AuthGuard>
            </TWAProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
