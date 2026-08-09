import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Montserrat } from "next/font/google";
import "./globals.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-bodoni",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finanzas RMA",
  description: "Flujo de caja y control de cuentas",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#161513",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${bodoni.variable} ${montserrat.variable}`}>
      <body className="min-h-screen font-label">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 pb-28 pt-6 sm:px-6 sm:pb-10">
          {children}
        </div>
      </body>
    </html>
  );
}
