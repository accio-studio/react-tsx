import "@/styles/globals.css";
import React from "react";

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
    <html lang="en" className={inter.className}>
      <head>
        <title>React.tsx Docs</title>
      </head>
      <body className="bg-zinc-900 text-white">{children}</body>
    </html>
  );
}
