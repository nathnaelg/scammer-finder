import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import RootClientLayout from "@/components/RootClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scammer Finder",
  description: "A platform to detect and report online scams",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <RootClientLayout>{children}</RootClientLayout>
      </body>
    </html>
  );
}
