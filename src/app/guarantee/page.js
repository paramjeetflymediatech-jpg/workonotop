import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function GuaranteePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Guarantee</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            We stand behind every job. 100% satisfaction guaranteed.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">

        {/* Main Guarantee */}
        <div className="bg-green-50 rounded-2xl p-8 mb-12 text-center">
          <div className="text-6xl mb-4">🛡️</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">WorkOnTap Protection Promise</h2>
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            If you&apos;re not happy with the work, we&apos;ll make it right.
            Contact us within 48 hours of job completion.
          </p>
        </div>

        {/* What&apos;s Covered */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">What&apos;s Covered</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">

          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-semibold text-gray-900 mb-2">Quality of Work</h3>
            <p className="text-gray-600">If the work isn&apos;t up to professional standards, we&apos;ll fix it.</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-semibold text-gray-900 mb-2">Professional Conduct</h3>
            <p className="text-gray-600">All pros are background-checked and insured.</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-semibold text-gray-900 mb-2">Fair Pricing</h3>
            <p className="text-gray-600">You only pay for the actual time worked.</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-semibold text-gray-900 mb-2">Timely Service</h3>
            <p className="text-gray-600">If the pro is significantly late, we&apos;ll help reschedule.</p>
          </div>
        </div>

        {/* How It Works */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How to File a Claim</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-12">
          <ol className="list-decimal list-inside space-y-3 text-gray-600">
            <li>Contact us within 48 hours of job completion</li>
            <li>Provide your booking number and details of the issue</li>
            <li>We&apos;ll review and get back to you within 24 hours</li>
            <li>If eligible, we&apos;ll arrange for a fix or refund</li>
          </ol>
        </div>

        {/* Contact */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Have an issue with a job?</p>
          <Link
            href="/contact"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Contact Support
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}