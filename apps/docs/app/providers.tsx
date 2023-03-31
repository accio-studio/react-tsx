import { ThemeProvider } from "next-themes";
import React from "react";

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" enableSystem={true}>
      {children}
    </ThemeProvider>
  );
}
