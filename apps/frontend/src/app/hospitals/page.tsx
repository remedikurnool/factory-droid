'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getHospitals } from '@/lib/api/hospitals';
import type { Hospital, HospitalSearchParams } from '@/types/hospital';
import { HOSPITAL_TYPES, COMMON_DEPARTMENTS } from '@/types/hospital';

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [filters, setFilters] = useState<HospitalSearchParams>({
    page: 1,
    limit: 12,
    sortBy: 'rating',
    sortOrder: 'desc',
  });

  useEffect(() => {
    loadHospitals();
  }, [filters]);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const data = await getHospitals(filters);
      setHospitals(data.hospitals);
      setTotal(data.total);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to load hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
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
            Find a Hospital
          </h1>
          <p className="text-gray-600">
            Discover trusted hospitals and healthcare facilities in Kurnool
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
                  Search Hospital
                </label>
                <input
                  type="text"
                  placeholder="Hospital name..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Hospital Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Type
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {HOSPITAL_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={filters.department || ''}
                  onChange={(e) =>
                    handleFilterChange('department', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Departments</option>
                  {COMMON_DEPARTMENTS.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.icon} {dept.label}
                    </option>
                  ))}
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

              {/* Emergency Available */}
              <div className="mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.emergencyAvailable || false}
                    onChange={(e) =>
                      handleFilterChange('emergencyAvailable', e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    24/7 Emergency Available
                  </span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-600">
                Showing {hospitals.length} of {total} hospitals
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
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="bedCount-desc">Bed Capacity</option>
                </select>
              </div>
            </div>

            {/* Hospitals Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
                  >
                    <div className="h-48 bg-gray-200 rounded-lg mb-4" />
                    <div className="h-6 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded mb-4" />
                    <div className="h-10 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : hospitals.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🏥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hospitals found
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hospitals.map((hospital) => (
                    <HospitalCard key={hospital.id} hospital={hospital} />
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
                      {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
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

function HospitalCard({ hospital }: { hospital: Hospital }) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
        {hospital.image ? (
          <img
            src={hospital.image}
            alt={hospital.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-4xl">
            🏥
          </div>
        )}
        {hospital.emergencyAvailable && (
          <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            24/7 Emergency
          </span>
        )}
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold text-gray-900 flex-1">
              {hospital.name}
            </h3>
            {hospital.isVerified && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-2">
                ✓ Verified
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{hospital.type}</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center text-yellow-500">
              <span>⭐</span>
              <span className="text-sm font-medium ml-1">{hospital.rating}</span>
            </div>
            <span className="text-xs text-gray-500">
              ({hospital.totalReviews} reviews)
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📍</span>
            <span className="line-clamp-1">{hospital.address}, {hospital.city}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">🛏️</span>
            <span>{hospital.bedCount} beds</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📞</span>
            <span>{hospital.phone}</span>
          </div>
        </div>

        {/* Departments */}
        {hospital.departments && hospital.departments.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Departments:
            </p>
            <div className="flex flex-wrap gap-1">
              {hospital.departments.slice(0, 4).map((dept) => (
                <span
                  key={dept.id}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                >
                  {dept.name}
                </span>
              ))}
              {hospital.departments.length > 4 && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  +{hospital.departments.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Facilities */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {hospital.ambulanceAvailable && (
              <span className="text-xs text-gray-600 flex items-center gap-1">
                🚑 Ambulance
              </span>
            )}
            {hospital.pharmacyAvailable && (
              <span className="text-xs text-gray-600 flex items-center gap-1">
                💊 Pharmacy
              </span>
            )}
            {hospital.labAvailable && (
              <span className="text-xs text-gray-600 flex items-center gap-1">
                🔬 Lab
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <Link
          href={`/hospitals/${hospital.id}`}
          className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
