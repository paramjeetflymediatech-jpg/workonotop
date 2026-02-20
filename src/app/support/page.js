import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="bg-gradient-to-r from-green-800 to-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Support Center</h1>
          <p className="text-xl text-green-100">We're here to help</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        
        {/* Quick Help */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link href="/chat" className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-md transition">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold text-gray-900">Live Chat</h3>
            <p className="text-sm text-gray-500">Chat with us now</p>
          </Link>
          
          <Link href="/faq" className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-md transition">
            <div className="text-3xl mb-3">❓</div>
            <h3 className="font-semibold text-gray-900">FAQs</h3>
            <p className="text-sm text-gray-500">Find quick answers</p>
          </Link>
          
          <Link href="/contact" className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-md transition">
            <div className="text-3xl mb-3">📧</div>
            <h3 className="font-semibold text-gray-900">Email Us</h3>
            <p className="text-sm text-gray-500">Get back within 24h</p>
          </Link>
        </div>

        {/* Support Categories */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Topics</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/help/booking" className="p-4 border border-gray-200 rounded-lg hover:border-green-500 transition">
            <h4 className="font-semibold text-gray-900">📅 Booking Issues</h4>
            <p className="text-sm text-gray-500">Problems with your booking</p>
          </Link>
          
          <Link href="/help/payment" className="p-4 border border-gray-200 rounded-lg hover:border-green-500 transition">
            <h4 className="font-semibold text-gray-900">💰 Payment Help</h4>
            <p className="text-sm text-gray-500">Questions about payments</p>
          </Link>
          
          <Link href="/help/account" className="p-4 border border-gray-200 rounded-lg hover:border-green-500 transition">
            <h4 className="font-semibold text-gray-900">👤 Account Support</h4>
            <p className="text-sm text-gray-500">Login, profile issues</p>
          </Link>
          
          <Link href="/help/technical" className="p-4 border border-gray-200 rounded-lg hover:border-green-500 transition">
            <h4 className="font-semibold text-gray-900">🔧 Technical Help</h4>
            <p className="text-sm text-gray-500">App, website issues</p>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}