import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import Script from "next/script";
import { getSeoForPath } from "@/lib/seo";
import { AuthProvider } from "@/context/AuthContext";
import DynamicSeoManager from "@/components/DynamicSeoManager";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

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

import parse from 'html-react-parser';

export const dynamic = "force-dynamic";

const parserOptions = {
  replace: (node) => {
    if (node.type === 'text') {
      return <></>;
    }
    if (node.name === 'script') {
      const { attribs, children } = node;
      const innerHTML = children && children.length > 0 && children[0].data ? children[0].data : '';
      if (innerHTML) {
        return <script {...attribs} dangerouslySetInnerHTML={{ __html: innerHTML }} />;
      }
      return <script {...attribs} />;
    }
  }
};

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const rawPathname = headersList.get("x-pathname") || "/";

  const seo = await getSeoForPath(rawPathname);

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased font-sans flex flex-col min-h-screen`}>
      <head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        {seo.keywords && <meta name="keywords" content={seo.keywords} />}
        <meta name="robots" content={seo.robots} />
        <meta name="googlebot" content={`${seo.robots}, max-video-preview:-1, max-image-preview:large, max-snippet:-1`} />
        {seo.canonical && <link rel="canonical" href={seo.canonical} />}
        <meta name="google-site-verification" content="A6y8CvpEQ9Tkn0I6JPDykgUl9e2vRCmBYZiHON-QEcw" />

        {seo.ogTitle && <meta property="og:title" content={seo.ogTitle} />}
        {seo.ogDescription && <meta property="og:description" content={seo.ogDescription} />}
        {seo.canonical && <meta property="og:url" content={seo.canonical} />}
        <meta property="og:site_name" content="WorkOnTap" />
        <meta property="og:type" content={rawPathname.includes("/blogs/") ? "article" : "website"} />
        {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}

        <meta name="twitter:card" content="summary_large_image" />
        {seo.ogTitle && <meta name="twitter:title" content={seo.ogTitle} />}
        {seo.ogDescription && <meta name="twitter:description" content={seo.ogDescription} />}
        {seo.ogImage && <meta name="twitter:image" content={seo.ogImage} />}

        <link rel="icon" href="/favicon.png" />
        {seo.headerScripts && typeof seo.headerScripts === 'string' ? parse(seo.headerScripts, parserOptions) : null}
      </head>

      <body className="flex-grow flex flex-col min-h-screen" suppressHydrationWarning>
        <AuthProvider>
          <DynamicSeoManager />
          {children}
        </AuthProvider>

        <Script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js" strategy="afterInteractive" crossOrigin="anonymous" />
        <Script noModule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js" strategy="lazyOnload" crossOrigin="anonymous" />
        
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />

        <Script src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly&loading=async`} strategy="beforeInteractive" />
      </body>
    </html>
  );
}