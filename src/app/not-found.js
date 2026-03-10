import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">

          {/* 404 Number */}
          <h1 className="text-8xl font-bold text-gray-900 mb-4">404</h1>

          {/* Message */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Page Not Found
          </h2>

          <p className="text-gray-600 mb-8">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          {/* Quick Links */}
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-block w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Go to Homepage
            </Link>

            <div className="flex gap-3">
              <Link
                href="/services"
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition"
              >
                Services
              </Link>
              <Link
                href="/help"
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition"
              >
                Help Center
              </Link>
            </div>
          </div>

          {/* Contact Link */}
          <p className="text-sm text-gray-400 mt-8">
            Need help? <Link href="/contact" className="text-green-600 hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}