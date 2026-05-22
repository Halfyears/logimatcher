import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://logimatcher.com'),
  title: {
    default: 'LogiMatcher — Find Your Perfect 3PL Warehouse in 60 Seconds',
    template: '%s | LogiMatcher',
  },
  description: 'AI-powered 3PL warehouse matching. Free for shippers. Tell us your needs and our AI scores 2,800+ vetted warehouses to find your perfect fulfillment partner in under 60 seconds.',
  keywords: ['3PL matching', 'warehouse fulfillment', 'ecommerce fulfillment', 'third party logistics', 'fulfillment center', 'warehouse finder', 'DTC fulfillment', 'logistics platform', 'AI matching', 'free warehouse search'],
  authors: [{ name: 'LogiMatcher', url: 'https://logimatcher.com' }],
  creator: 'LogiMatcher',
  publisher: 'LogiMatcher',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://logimatcher.com',
    siteName: 'LogiMatcher',
    title: 'LogiMatcher — Stop Searching. Start Matching.',
    description: 'Free AI-powered 3PL warehouse matching. Find your perfect fulfillment partner in 60 seconds. No signup required.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'LogiMatcher — AI-Powered 3PL Matching' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LogiMatcher — Stop Searching. Start Matching.',
    description: 'Free AI-powered 3PL warehouse matching. Find your perfect fulfillment partner in 60 seconds.',
    site: '@logimatcher',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: {
    canonical: 'https://logimatcher.com',
  },
  verification: {
    google: '', // Add Google Search Console verification code here
  },
}

// Structured data — Organization schema
const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'LogiMatcher',
  url: 'https://logimatcher.com',
  logo: 'https://logimatcher.com/icon.svg',
  description: 'AI-powered 3PL warehouse matching platform. Free for shippers.',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'hello@logimatcher.com',
    contactType: 'customer service',
  },
}

// Structured data — SoftwareApplication schema
const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'LogiMatcher',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free for shippers',
  },
  description: 'AI-powered 3PL warehouse matching. Find the perfect fulfillment partner in 60 seconds.',
  url: 'https://logimatcher.com',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#F4F7FB" />
        <meta name="format-detection" content="telephone=no" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      </head>
      <body>
        <Toaster position="top-right" toastOptions={{
          style: { borderRadius: '10px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', background: '#0F172A', color: '#F0F6FF', border: '1px solid rgba(255,255,255,0.08)' },
          success: { iconTheme: { primary: '#3FA38C', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
        }} />
        {children}
      </body>
    </html>
  )
}
