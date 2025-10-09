'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { labTestsApi, LabBooking } from '@/lib/api/lab-tests';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText,
  Download,
  XCircle,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import Link from 'next/link';

type BookingStatus = 'pending' | 'confirmed' | 'sample_collected' | 'completed' | 'cancelled';

export default function MyLabBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<LabBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | BookingStatus>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await labTestsApi.getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await labTestsApi.cancelBooking(id);
      loadBookings(); // Reload bookings
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const handleDownloadReport = async (id: string) => {
    try {
      const blob = await labTestsApi.downloadReport(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lab-report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Failed to download report. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Confirmed' },
      sample_collected: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle, label: 'Sample Collected' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="h-4 w-4 mr-1" />
        {badge.label}
      </span>
    );
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Lab Bookings</h1>
          <p className="text-gray-600 mt-1">View and manage your lab test bookings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({bookings.filter(b => b.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'confirmed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({bookings.filter(b => b.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't made any lab test bookings yet."
                : `No ${filter} bookings found.`}
            </p>
            <Link
              href="/lab-tests"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Browse Lab Tests
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.testName || `Booking #${booking.id.substring(0, 8)}`}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        Booking ID: {booking.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">₹{booking.amount}</p>
                      <p className="text-sm text-gray-600">{booking.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Collection Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(booking.collectionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Time Slot</p>
                        <p className="font-medium text-gray-900">{booking.collectionTimeSlot}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-gray-900 line-clamp-2">
                          {booking.collectionAddress}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Patient Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">{booking.patientName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Age</p>
                        <p className="font-medium text-gray-900">{booking.patientAge} years</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Gender</p>
                        <p className="font-medium text-gray-900 capitalize">{booking.patientGender}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{booking.patientPhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/lab-tests/bookings/${booking.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      View Details
                    </Link>
                    
                    {booking.status === 'completed' && booking.reportAvailable && (
                      <button
                        onClick={() => handleDownloadReport(booking.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </button>
                    )}
                    
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium flex items-center"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
