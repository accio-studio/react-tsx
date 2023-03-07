import "@/styles/globals.css";
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <title>React.tsx Docs</title>
      </head>
      <body className="bg-zinc-900 text-white">{children}</body>
    </html>
  );
}
