"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" enableSystem>
      {children}
    </ThemeProvider>
  );
}
