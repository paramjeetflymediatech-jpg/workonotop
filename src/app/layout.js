import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "src/context/AuthContext";
import Script from "next/script";

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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased `}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
        </AuthProvider>

        {/* Ionicons Support */}
        <Script 
          type="module" 
          src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js" 
          strategy="afterInteractive"
        />
        <Script 
          noModule 
          src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js" 
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}