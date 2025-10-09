'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ServiceCard } from '@/components/homecare/service-card'
import { homecareAPI } from '@/lib/api/homecare'
import type { HomecareService, ServiceCategory } from '@/lib/types/homecare'

const categories: Array<{ value: ServiceCategory; label: string }> = [
  { value: 'NURSING', label: 'Nursing Care' },
  { value: 'PHYSIOTHERAPY', label: 'Physiotherapy' },
  { value: 'DIABETES_CARE', label: 'Diabetes Care' },
  { value: 'ELDERLY_CARE', label: 'Elderly Care' },
  { value: 'POST_SURGERY_CARE', label: 'Post-Surgery Care' },
  { value: 'MEDICAL_EQUIPMENT', label: 'Medical Equipment' },
  { value: 'LAB_SAMPLE_COLLECTION', label: 'Lab Sample Collection' },
]

export default function HomecarePage() {
  const [services, setServices] = useState<HomecareService[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>([])
  const [availableOnly, setAvailableOnly] = useState(true)
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchServices()
  }, [selectedCategories, availableOnly, sortBy, page])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const data = await homecareAPI.getServices({
        category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
        available: availableOnly,
        sortBy,
        page,
        limit: 12,
      })
      setServices(data.services)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (category: ServiceCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
    setPage(1)
  }

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase()) ||
    service.shortDescription.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Homecare Services</h1>
        <p className="mt-2 text-muted-foreground">
          Professional healthcare services at your doorstep
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                <h3 className="font-semibold">Filters</h3>
              </div>

              {/* Categories Filter */}
              <div className="mb-6">
                <h4 className="mb-3 text-sm font-medium">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.value} className="flex items-center gap-2">
                      <Checkbox
                        id={category.value}
                        checked={selectedCategories.includes(category.value)}
                        onCheckedChange={() => toggleCategory(category.value)}
                      />
                      <Label
                        htmlFor={category.value}
                        className="cursor-pointer text-sm"
                      >
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="mb-6">
                <h4 className="mb-3 text-sm font-medium">Availability</h4>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="available"
                    checked={availableOnly}
                    onCheckedChange={setAvailableOnly}
                  />
                  <Label htmlFor="available" className="cursor-pointer text-sm">
                    Available only
                  </Label>
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedCategories.length > 0 || !availableOnly) && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedCategories([])
                    setAvailableOnly(true)
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search and Sort */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Services Grid */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="mb-4 h-40 w-full" />
                    <Skeleton className="mb-2 h-4 w-3/4" />
                    <Skeleton className="mb-2 h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="text-6xl mb-4">🏥</div>
                <h3 className="mb-2 text-lg font-semibold">No services found</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {search
                    ? 'Try adjusting your search'
                    : 'No services match your filters'}
                </p>
                {(search || selectedCategories.length > 0) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch('')
                      setSelectedCategories([])
                    }}
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>

              {/* Pagination */}
              {filteredServices.length > 0 && (
                <div className="mt-6 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
