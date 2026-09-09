import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import Script from "next/script";
import { getSeoForPath } from "@/lib/seo";
import { AuthProvider } from "@/context/AuthContext";
import DynamicSeoManager from "@/components/DynamicSeoManager";
import parse from 'html-react-parser';

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

export async function generateMetadata() {
  const headersList = await headers();
  const rawPathname = headersList.get("x-pathname") || "/";
  const seo = await getSeoForPath(rawPathname);

  const isNoIndex = seo.robots?.toLowerCase().includes('noindex');
  const isNoFollow = seo.robots?.toLowerCase().includes('nofollow');

  return {
    title: seo.title || 'WorkOnTap',
    description: seo.description || 'WorkOnTap connects you with skilled and trusted local tradespeople.',
    keywords: seo.keywords || undefined,
    robots: {
      index: !isNoIndex,
      follow: !isNoFollow,
      googleBot: {
        index: !isNoIndex,
        follow: !isNoFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: seo.canonical || undefined,
    },
    verification: {
      google: 'A6y8CvpEQ9Tkn0I6JPDykgUl9e2vRCmBYZiHON-QEcw',
    },
    openGraph: {
      title: seo.ogTitle || seo.title || 'WorkOnTap',
      description: seo.ogDescription || seo.description || 'WorkOnTap connects you with skilled and trusted local tradespeople.',
      url: seo.canonical || undefined,
      siteName: 'WorkOnTap',
      type: rawPathname.includes('/blogs/') ? 'article' : 'website',
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle || seo.title || 'WorkOnTap',
      description: seo.ogDescription || seo.description,
      images: seo.ogImage ? [seo.ogImage] : [],
    },
    icons: {
      icon: '/favicon.png',
    },
  };
}

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const rawPathname = headersList.get("x-pathname") || "/";
  const seo = await getSeoForPath(rawPathname);

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased font-sans flex flex-col min-h-screen`}>
      <head>
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