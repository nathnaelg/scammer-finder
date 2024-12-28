"use client";

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import NavbarWrapper from "@/components/NavbarWrapper";
import { usePathname } from "next/navigation";

export default function RootClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {!pathname.startsWith("/admin") && <NavbarWrapper />}
      <main className="container mx-auto py-4">{children}</main>
      <Toaster />
    </ThemeProvider>
  );
}
