'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDoctors, getSpecializations } from '@/lib/api/doctors';
import type { Doctor, DoctorSearchParams, SpecializationOption } from '@/types/doctor';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [specializations, setSpecializations] = useState<SpecializationOption[]>([]);
  
  // Filters
  const [filters, setFilters] = useState<DoctorSearchParams>({
    page: 1,
    limit: 12,
    sortBy: 'rating',
    sortOrder: 'desc',
  });

  useEffect(() => {
    loadSpecializations();
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [filters]);

  const loadSpecializations = async () => {
    try {
      const data = await getSpecializations();
      setSpecializations(data);
    } catch (error) {
      console.error('Failed to load specializations:', error);
    }
  };

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await getDoctors(filters);
      setDoctors(data.doctors);
      setTotal(data.total);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to load doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: 'rating',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find a Doctor
          </h1>
          <p className="text-gray-600">
            Book consultations with verified doctors in Kurnool
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Doctor
                </label>
                <input
                  type="text"
                  placeholder="Doctor name..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Specialization */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <select
                  value={filters.specialization || ''}
                  onChange={(e) =>
                    handleFilterChange('specialization', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label} ({spec.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Consultation Fee Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Fee
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minFee || ''}
                    onChange={(e) =>
                      handleFilterChange('minFee', e.target.value)
                    }
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxFee || ''}
                    onChange={(e) =>
                      handleFilterChange('maxFee', e.target.value)
                    }
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Experience
                </label>
                <select
                  value={filters.experience || ''}
                  onChange={(e) =>
                    handleFilterChange('experience', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Experience</option>
                  <option value="5">5+ Years</option>
                  <option value="10">10+ Years</option>
                  <option value="15">15+ Years</option>
                  <option value="20">20+ Years</option>
                </select>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating || ''}
                  onChange={(e) =>
                    handleFilterChange('minRating', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <select
                  value={filters.availability || ''}
                  onChange={(e) =>
                    handleFilterChange('availability', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Time</option>
                  <option value="today">Available Today</option>
                  <option value="tomorrow">Available Tomorrow</option>
                  <option value="this-week">Available This Week</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-600">
                Showing {doctors.length} of {total} doctors
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Sort by:</label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters((prev) => ({
                      ...prev,
                      sortBy: sortBy as any,
                      sortOrder: sortOrder as any,
                    }));
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="rating-desc">Highest Rated</option>
                  <option value="fee-asc">Lowest Fee</option>
                  <option value="fee-desc">Highest Fee</option>
                  <option value="experience-desc">Most Experienced</option>
                </select>
              </div>
            </div>

            {/* Doctors Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
                  >
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded mb-4" />
                    <div className="h-10 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : doctors.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No doctors found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters to see more results
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doctor) => (
                    <DoctorCard key={doctor.id} doctor={doctor} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`px-4 py-2 rounded-lg ${
                            currentPage === i + 1
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-4">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-2">
          {doctor.avatar ? (
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            doctor.name.charAt(0)
          )}
        </div>
        {doctor.isVerified && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
            ✓ Verified
          </span>
        )}
      </div>

      {/* Info */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {doctor.name}
        </h3>
        <p className="text-sm text-gray-600 mb-2">{doctor.specialization}</p>
        <p className="text-xs text-gray-500 mb-2">
          {doctor.experience} years experience
        </p>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex items-center text-yellow-500">
            <span>⭐</span>
            <span className="text-sm font-medium ml-1">{doctor.rating}</span>
          </div>
          <span className="text-xs text-gray-500">
            ({doctor.totalConsultations} consultations)
          </span>
        </div>
        <p className="text-sm font-semibold text-gray-900">
          ₹{doctor.consultationFee}
          <span className="text-xs text-gray-500 font-normal"> / consultation</span>
        </p>
      </div>

      {/* Languages */}
      <div className="mb-4">
        <p className="text-xs text-gray-600 text-center">
          {doctor.languages.join(', ')}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Link
          href={`/doctors/${doctor.id}`}
          className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Profile & Book
        </Link>
        <Link
          href={`/doctors/${doctor.id}/book`}
          className="block w-full px-4 py-2 border border-blue-600 text-blue-600 text-center rounded-lg hover:bg-blue-50 transition-colors"
        >
          Quick Book
        </Link>
      </div>
    </div>
  );
}
