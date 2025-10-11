import Link from 'next/link';
import { APP_NAME } from "@onemedi/shared";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your Health, Our Priority
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Complete healthcare services at your fingertips - Medicines, Lab Tests, Doctor Consultations & More
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto mb-8">
              <input
                type="text"
                placeholder="Search medicines, doctors, hospitals, tests..."
                className="flex-1 px-4 py-3 text-gray-900 rounded-lg focus:outline-none"
              />
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors">
                Search
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-blue-100 text-sm">Medicines</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-blue-100 text-sm">Lab Tests</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">200+</div>
                <div className="text-blue-100 text-sm">Doctors</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-blue-100 text-sm">Happy Customers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Healthcare Services
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive healthcare solutions for all your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Medicines */}
            <Link href="/medicines" className="group">
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500">
                <div className="text-5xl mb-4">💊</div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                  Medicines
                </h3>
                <p className="text-gray-600 mb-4">
                  Order medicines online with prescription upload. Genuine products with fast delivery.
                </p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                  Order Now
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Lab Tests */}
            <Link href="/lab-tests" className="group">
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-500">
                <div className="text-5xl mb-4">🧪</div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900 group-hover:text-green-600 transition-colors">
                  Lab Tests
                </h3>
                <p className="text-gray-600 mb-4">
                  Book diagnostic tests with home sample collection. Get reports online quickly.
                </p>
                <div className="flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
                  Book Test
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Doctors */}
            <Link href="/doctors" className="group">
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-500">
                <div className="text-5xl mb-4">👨‍⚕️</div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900 group-hover:text-purple-600 transition-colors">
                  Doctor Consultation
                </h3>
                <p className="text-gray-600 mb-4">
                  Consult with verified doctors online or in-person. Video, audio & chat options.
                </p>
                <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
                  Consult Now
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Homecare */}
            <Link href="/homecare" className="group">
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-500">
                <div className="text-5xl mb-4">🏠</div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900 group-hover:text-orange-600 transition-colors">
                  Homecare Services
                </h3>
                <p className="text-gray-600 mb-4">
                  Professional nursing, physiotherapy, and diabetes management at home.
                </p>
                <div className="flex items-center text-orange-600 font-semibold group-hover:translate-x-2 transition-transform">
                  Book Service
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Emergency */}
            <Link href="/emergency" className="group">
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-red-500">
                <div className="text-5xl mb-4">🚑</div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900 group-hover:text-red-600 transition-colors">
                  Emergency Services
                </h3>
                <p className="text-gray-600 mb-4">
                  24/7 ambulance booking and blood bank requests. Quick response guaranteed.
                </p>
                <div className="flex items-center text-red-600 font-semibold group-hover:translate-x-2 transition-transform">
                  Get Help
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Insurance */}
            <Link href="/insurance" className="group">
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-500">
                <div className="text-5xl mb-4">🛡️</div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900 group-hover:text-indigo-600 transition-colors">
                  Health Insurance
                </h3>
                <p className="text-gray-600 mb-4">
                  Compare and purchase health insurance plans. Secure your family's health.
                </p>
                <div className="flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform">
                  View Plans
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose {APP_NAME}?
            </h2>
            <p className="text-lg text-gray-600">
              Your trusted healthcare partner in Kurnool
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">100% Genuine Products</h3>
              <p className="text-gray-600 text-sm">Authentic medicines and healthcare products</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Quick delivery to your doorstep</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600 text-sm">Competitive pricing with great discounts</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm">Your data is safe and confidential</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers using {APP_NAME} for their healthcare needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/medicines"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Order Medicines
            </Link>
            <Link
              href="/doctors"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Consult a Doctor
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
