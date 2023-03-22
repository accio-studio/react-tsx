"use client";

import { Button } from "@accio-ui/ui";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div>
      <span className="px-4">Theme: {theme}</span>
      <Button onClick={() => setTheme("system")}>System</Button>
      <Button onClick={() => setTheme("dark")}>Dark</Button>
      <Button onClick={() => setTheme("light")}>Light</Button>
    </div>
  );
}
