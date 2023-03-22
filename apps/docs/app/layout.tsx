import "./globals.css";
import "@accio-ui/ui/dist/index.css";

// keep space to disable sort imports
import "@accio-ui/colors/dist/css/oklch-var/slate.css";

import "@accio-ui/colors/dist/css/oklch-var/slate-dark.css";

import React from "react";

import { Providers } from "./providers";
import { ThemeSwitch } from "./theme-switch";
import { Inter } from "next/font/google";

const inter = Inter({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <title>React.tsx Docs</title>
      </head>
      <body className="text-slate12 bg-slate-2">
        <Providers>
          <header>
            <ThemeSwitch />
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
