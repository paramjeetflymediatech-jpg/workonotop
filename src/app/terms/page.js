import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-green-100">Last updated: February 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        
        <div className="space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using WorkOnTap, you agree to be bound by these Terms. 
              If you disagree with any part, you may not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              WorkOnTap connects homeowners with independent service professionals. 
              We are a platform, not a direct provider of services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account. 
              You must be at least 18 years old to use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Booking and Payments</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Prices are estimates and final amount based on actual time worked</li>
              <li>Payment is processed after job completion</li>
              <li>Cancellations free up to 24 hours before scheduled time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Professional Conduct</h2>
            <p className="text-gray-600 leading-relaxed">
              All professionals on our platform are independent contractors. 
              WorkOnTap is not responsible for their actions, but we provide our 
              Protection Promise for your peace of mind.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cancellation and Refunds</h2>
            <p className="text-gray-600 leading-relaxed">
              If you cancel within 24 hours of the scheduled time, a fee may apply. 
              Refunds for completed work are handled through our Protection Promise.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              WorkOnTap shall not be liable for any indirect, incidental, or consequential damages 
              arising from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of 
              material changes via email or platform notification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about these Terms, contact us at:{' '}
              <a href="mailto:legal@workontap.com" className="text-green-600 hover:underline">
                legal@workontap.com
              </a>
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}