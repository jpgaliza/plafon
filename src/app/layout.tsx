import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
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
  title: "Plafon — Gestão Financeira Inteligente",
  description:
    "Controle suas finanças de forma simples e inteligente. Acompanhe receitas, despesas e assinaturas com o Plafon.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cookieStore, locale, messages] = await Promise.all([
    cookies(),
    getLocale(),
    getMessages(),
  ]);

  const theme = cookieStore.get("NEXT_THEME")?.value || "dark";
  const themeClass = theme === "light" ? "" : "dark";

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable}${themeClass ? ` ${themeClass}` : ""} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
