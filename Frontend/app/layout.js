import { Outfit, Inter } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import AuthModal from "@/components/AuthModal/AuthModal";
import EnquiryModal from "@/components/EnquiryModal/EnquiryModal";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.threewheeler.in'),
  title: "Three Wheeler - India's Trusted Three Wheeler Marketplace",
  description: "Three Wheeler is India's largest marketplace and information portal for Three Wheelers. Find passenger auto rickshaws, cargo loaders, electric rickshaws, LPG/CNG autos, diesel mini-loaders. Compare specs, prices, mileage, payload and find dealers.",
  keywords: "auto rickshaw, cargo three wheeler, electric auto, electric cargo, CNG auto, LPG auto, diesel loader, TVS King, Bajaj RE, Piaggio Ape, Mahindra Treo, Euler HiLoad, Altigreen, commercial vehicle, three wheeler price, auto comparison, commercial loan",
  authors: [{ name: "Three Wheeler Commercial Team" }],
  openGraph: {
    title: "Three Wheeler - India's Largest Three Wheeler Platform",
    description: "Compare prices, mileage, payload capacity, and battery ranges for passenger and cargo three-wheelers in India. Find local dealers and check finance offers.",
    url: "https://www.threewheeler.in",
    siteName: "Three Wheeler",
    images: [
      {
        url: "/images/hero_banner.png",
        width: 1200,
        height: 630,
        alt: "Three Wheeler Three Wheeler Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Three Wheeler - India's Trusted Three Wheeler Portal",
    description: "Find your next commercial three-wheeler. Compare brands, browse electric, CNG, and diesel passenger or cargo autos.",
    images: ["/images/hero_banner.png"],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${outfit.variable} ${inter.variable} antialiased min-h-screen bg-brand-bg text-brand-dark flex flex-col`}>
        <AppProvider>
          <Toaster position="top-right" />
          <AuthModal />
          <EnquiryModal />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
