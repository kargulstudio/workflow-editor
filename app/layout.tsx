import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, pageMetadata } from "@/lib/seo";
import ScrollToTop from "@/components/_common/scroll-to-top";
import "./globals.css";

const interDisplay = localFont({
  src: "../fonts/InterDisplay-Medium.woff2",
  variable: "--font-inter-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: 'history.scrollRestoration="manual"',
          }}
        />
      </head>
      <body
        className={`${interDisplay.variable} ${inter.variable} relative z-0 font-sans antialiased`}
      >
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
