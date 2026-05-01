import type { Metadata, Viewport } from "next";
import { LangProvider } from "@/components/LangProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Olivia | NZ ECE Career Guidance",
  description: "Expert guidance for Chinese ECE professionals navigating New Zealand.",
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=Noto+Sans+SC:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-off antialiased">
        <LangProvider>
          <div className="relative mx-auto max-w-[430px] min-h-svh overflow-x-hidden">
            {children}
          </div>
        </LangProvider>
      </body>
    </html>
  );
}
