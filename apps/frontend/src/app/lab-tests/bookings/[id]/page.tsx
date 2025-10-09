'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { labTestsApi, LabBooking } from '@/lib/api/lab-tests';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  TestTube
} from 'lucide-react';
import Link from 'next/link';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<LabBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBooking();
  }, [params.id]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await labTestsApi.getBookingById(params.id as string);
      setBooking(data);
    } catch (err: any) {
      console.error('Error loading booking:', err);
      setError(err.response?.data?.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await labTestsApi.cancelBooking(params.id as string);
      loadBooking();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const handleDownloadReport = async () => {
    try {
      const blob = await labTestsApi.downloadReport(params.id as string);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lab-report-${params.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Failed to download report. Please try again.');
    }
  };

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { color: string; bgColor: string; icon: any; label: string; description: string }> = {
      pending: {
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50 border-yellow-200',
        icon: Clock,
        label: 'Booking Pending',
        description: 'Your booking is being processed. We will confirm shortly.'
      },
      confirmed: {
        color: 'text-blue-700',
        bgColor: 'bg-blue-50 border-blue-200',
        icon: CheckCircle,
        label: 'Booking Confirmed',
        description: 'Your booking has been confirmed. Our team will arrive at the scheduled time.'
      },
      sample_collected: {
        color: 'text-purple-700',
        bgColor: 'bg-purple-50 border-purple-200',
        icon: TestTube,
        label: 'Sample Collected',
        description: 'Your sample has been collected and sent to the lab for testing.'
      },
      completed: {
        color: 'text-green-700',
        bgColor: 'bg-green-50 border-green-200',
        icon: CheckCircle,
        label: 'Completed',
        description: 'Your test has been completed and the report is ready.'
      },
      cancelled: {
        color: 'text-red-700',
        bgColor: 'bg-red-50 border-red-200',
        icon: XCircle,
        label: 'Cancelled',
        description: 'This booking has been cancelled.'
      }
    };

    return statuses[status] || statuses.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The booking you are looking for does not exist.'}</p>
          <Link
            href="/lab-tests/bookings"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(booking.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/lab-tests/bookings"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Bookings
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        <div className={`rounded-lg border-2 p-6 mb-6 ${statusInfo.bgColor}`}>
          <div className="flex items-start">
            <StatusIcon className={`h-8 w-8 ${statusInfo.color} mr-4 flex-shrink-0`} />
            <div className="flex-1">
              <h2 className={`text-xl font-bold ${statusInfo.color} mb-1`}>{statusInfo.label}</h2>
              <p className={statusInfo.color}>{statusInfo.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Test Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Test Name:</span>
                  <span className="font-medium text-gray-900">
                    {booking.testName || 'Lab Test'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-medium text-gray-900">{booking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Date:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(booking.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Collection Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Details</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Collection Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(booking.collectionDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Time Slot</p>
                    <p className="font-medium text-gray-900">{booking.collectionTimeSlot}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Collection Address</p>
                    <p className="font-medium text-gray-900">{booking.collectionAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{booking.patientName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-medium text-gray-900">{booking.patientAge} years</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium text-gray-900 capitalize">{booking.patientGender}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-medium text-gray-900">{booking.patientPhone}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="font-medium text-gray-900">{booking.patientEmail}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Test Amount:</span>
                  <span className="font-medium text-gray-900">₹{booking.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Home Collection:</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="inline-flex items-center">
                    <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900 capitalize">{booking.paymentMethod}</span>
                  </span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total Amount:</span>
                    <span className="font-bold text-blue-600 text-xl">₹{booking.amount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {booking.status === 'completed' && booking.reportAvailable && (
                  <button
                    onClick={handleDownloadReport}
                    className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download Report
                  </button>
                )}

                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <button
                    onClick={handleCancelBooking}
                    className="w-full py-3 px-4 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium flex items-center justify-center"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Cancel Booking
                  </button>
                )}

                <Link
                  href="/lab-tests"
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
                >
                  <TestTube className="h-5 w-5 mr-2" />
                  Book Another Test
                </Link>
              </div>

              {/* Help Section */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-3">Need Help?</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <Phone className="h-4 w-4 inline mr-1" />
                    Call: <span className="font-medium text-gray-900">1800-123-4567</span>
                  </p>
                  <p>
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email: <span className="font-medium text-gray-900">support@onemedi.com</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Available 24/7</p>
                </div>
              </div>

              {/* Timeline */}
              {booking.status !== 'cancelled' && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-4">Booking Timeline</h4>
                  <div className="space-y-4">
                    <div className={`flex items-start ${
                      booking.status === 'pending' ? 'opacity-100' : 'opacity-50'
                    }`}>
                      <div className={`w-3 h-3 rounded-full mt-1 mr-3 ${
                        booking.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Booking Placed</p>
                        <p className="text-xs text-gray-500">Awaiting confirmation</p>
                      </div>
                    </div>
                    <div className={`flex items-start ${
                      booking.status === 'confirmed' ? 'opacity-100' : 'opacity-50'
                    }`}>
                      <div className={`w-3 h-3 rounded-full mt-1 mr-3 ${
                        ['confirmed', 'sample_collected', 'completed'].includes(booking.status)
                          ? 'bg-blue-500'
                          : 'bg-gray-300'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Confirmed</p>
                        <p className="text-xs text-gray-500">Ready for collection</p>
                      </div>
                    </div>
                    <div className={`flex items-start ${
                      booking.status === 'sample_collected' ? 'opacity-100' : 'opacity-50'
                    }`}>
                      <div className={`w-3 h-3 rounded-full mt-1 mr-3 ${
                        ['sample_collected', 'completed'].includes(booking.status)
                          ? 'bg-purple-500'
                          : 'bg-gray-300'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Sample Collected</p>
                        <p className="text-xs text-gray-500">Under testing</p>
                      </div>
                    </div>
                    <div className={`flex items-start ${
                      booking.status === 'completed' ? 'opacity-100' : 'opacity-50'
                    }`}>
                      <div className={`w-3 h-3 rounded-full mt-1 mr-3 ${
                        booking.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Completed</p>
                        <p className="text-xs text-gray-500">Report ready</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
