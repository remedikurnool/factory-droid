'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { labTestsApi, LabTest, CreateLabBookingInput } from '@/lib/api/lab-tests';
import { 
  User, 
  MapPin, 
  Calendar, 
  Clock,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

type BookingStep = 1 | 2 | 3;

interface PatientInfo {
  name: string;
  age: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
}

interface AddressInfo {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

interface TimeSlot {
  id: string;
  label: string;
  available: boolean;
}

export default function BookLabTestPage() {
  const params = useParams();
  const router = useRouter();
  const [test, setTest] = useState<LabTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);

  // Form data
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    age: '',
    gender: 'male',
    phone: '',
    email: ''
  });

  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');

  // Sample time slots
  const timeSlots: TimeSlot[] = [
    { id: '06:00-08:00', label: '06:00 AM - 08:00 AM', available: true },
    { id: '08:00-10:00', label: '08:00 AM - 10:00 AM', available: true },
    { id: '10:00-12:00', label: '10:00 AM - 12:00 PM', available: true },
    { id: '12:00-14:00', label: '12:00 PM - 02:00 PM', available: false },
    { id: '14:00-16:00', label: '02:00 PM - 04:00 PM', available: true },
    { id: '16:00-18:00', label: '04:00 PM - 06:00 PM', available: true },
  ];

  useEffect(() => {
    loadTest();
  }, [params.id]);

  const loadTest = async () => {
    try {
      setLoading(true);
      const data = await labTestsApi.getTestById(params.id as string);
      setTest(data);
    } catch (err) {
      console.error('Error loading test:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as BookingStep);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as BookingStep);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const bookingData: CreateLabBookingInput = {
        testId: params.id as string,
        patientName: patientInfo.name,
        patientAge: parseInt(patientInfo.age),
        patientGender: patientInfo.gender,
        patientPhone: patientInfo.phone,
        patientEmail: patientInfo.email,
        collectionAddress: `${addressInfo.street}, ${addressInfo.city}, ${addressInfo.state} - ${addressInfo.pincode}`,
        collectionDate: selectedDate,
        collectionTimeSlot: selectedTimeSlot,
        paymentMethod: paymentMethod,
        amount: test?.discountedPrice || test?.price || 0
      };

      const booking = await labTestsApi.createBooking(bookingData);
      
      // Redirect to booking confirmation
      router.push(`/lab-tests/bookings/${booking.id}`);
    } catch (err) {
      console.error('Error creating booking:', err);
      alert('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isStep1Valid = () => {
    return patientInfo.name && patientInfo.age && patientInfo.phone && patientInfo.email;
  };

  const isStep2Valid = () => {
    return selectedDate && selectedTimeSlot && addressInfo.street && addressInfo.city && 
           addressInfo.state && addressInfo.pincode;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Test not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/lab-tests/${params.id}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Test Details
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <span className="font-semibold">{step}</span>
                  )}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className={`text-sm ${currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Patient Info
            </span>
            <span className={`text-sm ${currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Schedule
            </span>
            <span className={`text-sm ${currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Payment
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Step 1: Patient Information */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <User className="h-6 w-6 mr-2 text-blue-600" />
                    Patient Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={patientInfo.name}
                        onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter patient name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Age *
                        </label>
                        <input
                          type="number"
                          value={patientInfo.age}
                          onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Age"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender *
                        </label>
                        <select
                          value={patientInfo.gender}
                          onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value as any })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={patientInfo.phone}
                        onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={patientInfo.email}
                        onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Schedule & Address */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                    Schedule & Address
                  </h2>
                  <div className="space-y-6">
                    {/* Date Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Collection Date *
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Time Slot Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Slot *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.id}
                            disabled={!slot.available}
                            onClick={() => setSelectedTimeSlot(slot.id)}
                            className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedTimeSlot === slot.id
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : slot.available
                                ? 'border-gray-300 hover:border-blue-400'
                                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <Clock className="h-4 w-4 inline mr-1" />
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Address */}
                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                        Collection Address
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            value={addressInfo.street}
                            onChange={(e) => setAddressInfo({ ...addressInfo, street: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="House/Flat No., Street"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City *
                            </label>
                            <input
                              type="text"
                              value={addressInfo.city}
                              onChange={(e) => setAddressInfo({ ...addressInfo, city: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              State *
                            </label>
                            <input
                              type="text"
                              value={addressInfo.state}
                              onChange={(e) => setAddressInfo({ ...addressInfo, state: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="State"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Pincode *
                            </label>
                            <input
                              type="text"
                              value={addressInfo.pincode}
                              onChange={(e) => setAddressInfo({ ...addressInfo, pincode: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Pincode"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Landmark
                            </label>
                            <input
                              type="text"
                              value={addressInfo.landmark}
                              onChange={(e) => setAddressInfo({ ...addressInfo, landmark: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Landmark (optional)"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
                    Payment Method
                  </h2>
                  <div className="space-y-4">
                    <button
                      onClick={() => setPaymentMethod('online')}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                        paymentMethod === 'online'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          paymentMethod === 'online' ? 'border-blue-600' : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'online' && (
                            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Pay Online</p>
                          <p className="text-sm text-gray-600">Credit/Debit Card, UPI, Net Banking</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                        paymentMethod === 'cash'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          paymentMethod === 'cash' ? 'border-blue-600' : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'cash' && (
                            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Cash on Collection</p>
                          <p className="text-sm text-gray-600">Pay when sample is collected</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Summary */}
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Patient:</span>
                        <span className="font-medium text-gray-900">{patientInfo.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium text-gray-900">{selectedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium text-gray-900">
                          {timeSlots.find(s => s.id === selectedTimeSlot)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment:</span>
                        <span className="font-medium text-gray-900">
                          {paymentMethod === 'online' ? 'Online Payment' : 'Cash on Collection'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                {currentStep > 1 && (
                  <button
                    onClick={handlePrevStep}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                )}
                {currentStep < 3 ? (
                  <button
                    onClick={handleNextStep}
                    disabled={currentStep === 1 ? !isStep1Valid() : !isStep2Valid()}
                    className={`ml-auto px-6 py-2 rounded-lg font-semibold flex items-center ${
                      (currentStep === 1 ? isStep1Valid() : isStep2Valid())
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Next
                    <ChevronRight className="h-5 w-5 ml-1" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Processing...' : 'Confirm Booking'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Test Details</h3>
              <div className="mb-4">
                <p className="font-medium text-gray-900">{test.name}</p>
                <p className="text-sm text-gray-600 mt-1">{test.category}</p>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Test Price:</span>
                  {test.discountedPrice && test.discountedPrice < test.price ? (
                    <div>
                      <span className="font-semibold text-gray-900">₹{test.discountedPrice}</span>
                      <span className="ml-2 text-sm text-gray-500 line-through">₹{test.price}</span>
                    </div>
                  ) : (
                    <span className="font-semibold text-gray-900">₹{test.price}</span>
                  )}
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Home Collection:</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-blue-600 text-xl">
                      ₹{test.discountedPrice || test.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
