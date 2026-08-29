import type { Metadata } from "next";
import "./globals.css";
import PwaRegister from "./pwa-register";

export const metadata: Metadata = {
  title: "TransportFlow TMS/CRM",
  description: "Centrum operacyjne transportu, floty, klientów i kierowców.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon-192.png",
    apple: "/icon-180.png",
  },
  appleWebApp: {
    capable: true,
    title: "TransportFlow",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body><PwaRegister />{children}</body>
    </html>
  );
}
