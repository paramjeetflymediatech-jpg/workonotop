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
          <p className="text-xl text-green-100">Last updated: April 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-3xl prose prose-green">
        
        <div className="space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              At WorkOnTap, we take your privacy seriously. As we operate in Canada, our privacy 
              practices comply with the Personal Information Protection and Electronic Documents Act (PIPEDA) 
              and applicable provincial privacy legislations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Contact Details: Name, email address, and phone number.</li>
              <li>Service Location: Your physical address to facilitate on-site visits.</li>
              <li>Professional Verification: For Pros, we collect background checks and identification for safety.</li>
              <li>Job Details: Descriptions and photos you upload related to your service requests.</li>
              <li>Payment Tokens: Securely processed by our partners (Stripe); we do not store full card info.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>To facilitate connections and bookings between Customers and Pros.</li>
              <li>To provide customer support and manage user accounts.</li>
              <li>To improve our platform and user experience.</li>
              <li>To comply with legal obligations under Canadian law.</li>
              <li>To prevent fraud and ensure the safety of our community.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We share your contact and location information with Service Providers only as 
              necessary to complete your booking. We NEVER sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We use industry-standard encryption and security measures to protect your data. 
              While data may be processed outside of Canada, we ensure our partners maintain 
              security standards that meet or exceed Canadian requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              Under PIPEDA, you have the right to access your personal data, correct any 
              inaccuracies, or withdraw consent for certain data uses. You can also request 
              account deletion by contacting our support team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              For any privacy-related questions or requests, contact our Privacy Officer at:{' '}
              <a href="mailto:privacy@workontap.ca" className="text-green-600 hover:underline">
                privacy@workontap.ca
              </a>
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}