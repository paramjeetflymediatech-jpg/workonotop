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
          <p className="text-xl text-green-100">Last updated: April 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        
        <div className="space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using WorkOnTap, you agree to be bound by these Terms. 
              These Terms govern your use of the platform, website, and mobile applications. 
              If you disagree with any part, you may not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. The Marketplace Platform</h2>
            <p className="text-gray-600 leading-relaxed">
              WorkOnTap is a digital marketplace connecting customers with independent service professionals. 
              We are a platform provider, not a direct provider of services. All professionals on our platform 
              are independent contractors and are not employees of WorkOnTap.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 leading-relaxed">
              You must be at least 18 years old to use our services. You are responsible for 
              maintaining the confidentiality of your account credentials and for all activities 
              under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Booking and Payments</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Prices are estimates and the final amount is based on actual time and scope worked.</li>
              <li>Payment is processed securely after job completion via Stripe.</li>
              <li>All prices are subject to applicable Canadian taxes (GST/HST/PST) based on the location of service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Professional Conduct</h2>
            <p className="text-gray-600 leading-relaxed">
              While we facilitate connections, WorkOnTap is not responsible for the actions or 
              omissions of any users. We offer a Protection Promise for your peace of mind 
              regarding the quality of work performed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cancellation Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              Cancellations more than 24 hours before the scheduled time are free. 
              Cancellations within 24 hours of the scheduled time may incur a cancellation fee.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              To the maximum extent permitted by the laws of Canada and your applicable Province, 
              WorkOnTap shall not be liable for any indirect, incidental, or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms are governed by and construed in accordance with the laws of Canada 
              and the Province of your residence. Disputes shall be resolved in the competent 
              courts of Canada.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              For legal inquiries, contact us at:{' '}
              <a href="mailto:legal@workontap.ca" className="text-green-600 hover:underline">
                legal@workontap.ca
              </a>
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}