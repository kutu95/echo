import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const sans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Echocardiogram Recorder",
  description:
    "Chairside recorder and reference for canine cardiac ultrasound measurements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={sans.variable}>
      <body className={cn(sans.className, "min-h-screen antialiased")}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
