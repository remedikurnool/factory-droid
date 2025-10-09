'use client';

import { useState, useEffect } from 'react';
import { labTestsApi, LabTest, LabPackage } from '@/lib/api/lab-tests';
import { Search, Filter, TestTube, Package, Home, Clock, Droplet } from 'lucide-react';
import Link from 'next/link';

export default function LabTestsPage() {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [packages, setPackages] = useState<LabPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tests' | 'packages'>('tests');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    homeCollection: false,
    fasting: false,
    minPrice: 0,
    maxPrice: 10000,
  });

  useEffect(() => {
    loadData();
    loadCategories();
  }, [activeTab, selectedCategory, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'tests') {
        const response = await labTestsApi.getTests({
          category: selectedCategory || undefined,
          search: search || undefined,
          homeCollection: filters.homeCollection || undefined,
          fasting: filters.fasting || undefined,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          limit: 50,
        });
        setTests(response.tests);
      } else {
        const response = await labTestsApi.getPackages({
          search: search || undefined,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          limit: 50,
        });
        setPackages(response.packages);
      }
    } catch (error) {
      console.error('Error loading lab tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await labTestsApi.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Lab Tests & Packages</h1>
          <p className="mt-2 text-gray-600">
            Book diagnostic tests with home sample collection
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h3>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Home Collection */}
              <div className="mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.homeCollection}
                    onChange={(e) =>
                      setFilters({ ...filters, homeCollection: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Home Collection</span>
                </label>
              </div>

              {/* Fasting Required */}
              <div className="mb-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.fasting}
                    onChange={(e) =>
                      setFilters({ ...filters, fasting: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Fasting Required</span>
                </label>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹0</span>
                    <span>₹{filters.maxPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Tabs */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'tests'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <TestTube className="inline h-5 w-5 mr-2" />
                  Individual Tests
                </button>
                <button
                  onClick={() => setActiveTab('packages')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'packages'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Package className="inline h-5 w-5 mr-2" />
                  Test Packages
                </button>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : activeTab === 'tests' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tests.map((test) => (
                  <Link
                    key={test.id}
                    href={`/lab-tests/${test.id}`}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          {test.name}
                        </h3>
                        <p className="text-sm text-gray-600">{test.category}</p>
                      </div>
                      <div className="text-right">
                        {test.discountedPrice && test.discountedPrice < test.price ? (
                          <>
                            <p className="text-sm text-gray-500 line-through">
                              ₹{test.price}
                            </p>
                            <p className="text-xl font-bold text-blue-600">
                              ₹{test.discountedPrice}
                            </p>
                          </>
                        ) : (
                          <p className="text-xl font-bold text-gray-900">₹{test.price}</p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {test.description}
                    </p>

                    <div className="flex flex-wrap gap-3 text-sm">
                      {test.homeCollectionAvailable && (
                        <span className="flex items-center text-green-600">
                          <Home className="h-4 w-4 mr-1" />
                          Home Collection
                        </span>
                      )}
                      <span className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {test.reportDeliveryTime}
                      </span>
                      {test.fastingRequired && (
                        <span className="flex items-center text-orange-600">
                          <Droplet className="h-4 w-4 mr-1" />
                          Fasting Required
                        </span>
                      )}
                    </div>

                    <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Book Now
                    </button>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {packages.map((pkg) => (
                  <Link
                    key={pkg.id}
                    href={`/lab-tests/packages/${pkg.id}`}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Package className="h-6 w-6 text-blue-600 mr-2" />
                          <h3 className="font-semibold text-xl text-gray-900">
                            {pkg.name}
                          </h3>
                        </div>
                        <p className="text-gray-600 mb-4">{pkg.description}</p>
                        <p className="text-sm text-gray-600">
                          Includes {pkg.tests.length} tests
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-500 line-through">
                          ₹{pkg.originalPrice}
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          ₹{pkg.discountedPrice}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          Save ₹{pkg.savings}
                        </p>
                      </div>
                    </div>
                    <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      View Package Details
                    </button>
                  </Link>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading &&
              ((activeTab === 'tests' && tests.length === 0) ||
                (activeTab === 'packages' && packages.length === 0)) && (
                <div className="text-center py-12">
                  <TestTube className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {activeTab} found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your filters or search criteria
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
