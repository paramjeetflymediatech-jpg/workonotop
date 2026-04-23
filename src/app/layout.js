import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "src/context/AuthContext";
import Script from "next/script";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "WorkOnTap - Home Maintenance Services",
  description: "Book trusted local pros for your home maintenance needs",
  icons: {
    icon: "/favicon.png",
  },
  other: {
    referrer: 'no-referrer-when-downgrade'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased font-sans flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>

        {/* Ionicons Support */}
        <Script 
          type="module" 
          src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js" 
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <Script 
          noModule 
          src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js" 
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        
        {/* Google Identity Services */}
        <Script 
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}