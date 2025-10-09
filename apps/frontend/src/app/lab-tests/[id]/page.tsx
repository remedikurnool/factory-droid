'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { labTestsApi, LabTest } from '@/lib/api/lab-tests';
import { 
  TestTube, 
  Clock, 
  Home, 
  Droplet, 
  FileText, 
  Calendar,
  IndianRupee,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function LabTestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [test, setTest] = useState<LabTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTest();
  }, [params.id]);

  const loadTest = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await labTestsApi.getTestById(params.id as string);
      setTest(data);
    } catch (err: any) {
      console.error('Error loading test:', err);
      setError(err.response?.data?.message || 'Failed to load test details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    router.push(`/lab-tests/${params.id}/book`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading test details...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The test you are looking for does not exist.'}</p>
          <Link
            href="/lab-tests"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Lab Tests
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage = test.discountedPrice && test.discountedPrice < test.price
    ? Math.round(((test.price - test.discountedPrice) / test.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/lab-tests"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lab Tests
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Test Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-3">
                    <TestTube className="h-4 w-4 mr-1" />
                    {test.category}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{test.name}</h1>
                  <p className="text-gray-600">{test.description}</p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Report Time</p>
                  <p className="font-semibold text-gray-900">{test.reportDeliveryTime}</p>
                </div>
                <div className="text-center">
                  <Droplet className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Sample</p>
                  <p className="font-semibold text-gray-900">{test.sampleType}</p>
                </div>
                <div className="text-center">
                  {test.homeCollectionAvailable ? (
                    <>
                      <Home className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Collection</p>
                      <p className="font-semibold text-green-600">At Home</p>
                    </>
                  ) : (
                    <>
                      <Home className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Collection</p>
                      <p className="font-semibold text-gray-600">At Lab</p>
                    </>
                  )}
                </div>
                <div className="text-center">
                  {test.fastingRequired ? (
                    <>
                      <AlertCircle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Fasting</p>
                      <p className="font-semibold text-orange-600">Required</p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Fasting</p>
                      <p className="font-semibold text-green-600">Not Required</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Preparation Instructions */}
            {test.preparationInstructions && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Preparation Instructions
                </h2>
                <div className="prose prose-sm max-w-none text-gray-600">
                  <p>{test.preparationInstructions}</p>
                </div>
              </div>
            )}

            {/* About the Test */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Test</h2>
              <div className="space-y-4 text-gray-600">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">What is it?</h3>
                  <p>{test.description}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Sample Type</h3>
                  <p>{test.sampleType} sample will be collected for this test.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Report Delivery</h3>
                  <p>You will receive your test report within {test.reportDeliveryTime}.</p>
                </div>
                {test.fastingRequired && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Fasting Instructions</h3>
                    <p>Fasting is required for this test. Please avoid eating for 8-12 hours before sample collection.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Book with Us?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">NABL Certified Labs</p>
                    <p className="text-sm text-gray-600">Accurate and reliable results</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Free Home Collection</p>
                    <p className="text-sm text-gray-600">Trained phlebotomists</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Digital Reports</p>
                    <p className="text-sm text-gray-600">Access anytime, anywhere</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Doctor Consultation</p>
                    <p className="text-sm text-gray-600">Free with every test</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <div className="mb-6">
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    {test.discountedPrice && test.discountedPrice < test.price ? (
                      <>
                        <span className="text-3xl font-bold text-blue-600">
                          ₹{test.discountedPrice}
                        </span>
                        <span className="ml-2 text-lg text-gray-500 line-through">
                          ₹{test.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">₹{test.price}</span>
                    )}
                  </div>
                  {discountPercentage > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {discountPercentage}% OFF
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">Inclusive of all taxes</p>
              </div>

              <button
                onClick={handleBookNow}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-4 flex items-center justify-center"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book Now
              </button>

              <div className="border-t pt-4 space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span>Free home sample collection</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span>Reports in {test.reportDeliveryTime}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span>100% safe & hygienic</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span>Free doctor consultation</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2">Need help?</p>
                <p className="font-semibold text-gray-900">Call: 1800-123-4567</p>
                <p className="text-sm text-gray-600">Available 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
