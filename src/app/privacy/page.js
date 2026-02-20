import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-green-100">Last updated: February 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-3xl prose prose-green">
        
        <div className="space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              At WorkOnTap, we take your privacy seriously. This policy describes how we collect, 
              use, and protect your personal information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Name, email address, phone number</li>
              <li>Service address and job details</li>
              <li>Payment information (processed securely by our partners)</li>
              <li>Photos you upload of your job</li>
              <li>Communications with pros and support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>To connect you with trusted tradespeople</li>
              <li>To process and manage your bookings</li>
              <li>To improve our services</li>
              <li>To communicate important updates</li>
              <li>To prevent fraud and ensure safety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We share your information with tradespeople only as necessary to complete your job. 
              We never sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We use industry-standard encryption and security measures to protect your data. 
              Payment information is handled by our secure payment partners and never stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              You can request access to your data, correct inaccuracies, or delete your account 
              by contacting our support team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              For privacy-related questions, contact us at:{' '}
              <a href="mailto:privacy@workontap.com" className="text-green-600 hover:underline">
                privacy@workontap.com
              </a>
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}