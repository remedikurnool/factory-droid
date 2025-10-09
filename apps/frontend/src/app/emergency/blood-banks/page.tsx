'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Phone, Clock, Droplet, ChevronRight, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { emergencyAPI } from '@/lib/api/emergency'
import type { BloodBank, BloodGroup } from '@/lib/types/emergency'
import { cn } from '@/lib/utils/cn'

const bloodGroups: Array<{ value: BloodGroup; label: string }> = [
  { value: 'A_POSITIVE', label: 'A+' },
  { value: 'A_NEGATIVE', label: 'A-' },
  { value: 'B_POSITIVE', label: 'B+' },
  { value: 'B_NEGATIVE', label: 'B-' },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
  { value: 'O_POSITIVE', label: 'O+' },
  { value: 'O_NEGATIVE', label: 'O-' },
]

const bloodBankTypes = [
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'NGO', label: 'NGO' },
  { value: 'HOSPITAL_BASED', label: 'Hospital Based' },
]

export default function BloodBanksPage() {
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')

  useEffect(() => {
    fetchBloodBanks()
  }, [selectedBloodGroup, selectedType])

  const fetchBloodBanks = async () => {
    setLoading(true)
    try {
      const data = await emergencyAPI.searchBloodBanks({
        bloodGroup: selectedBloodGroup as BloodGroup | undefined,
        type: selectedType as any,
        available: true,
        limit: 50,
      })
      setBloodBanks(data.bloodBanks)
    } catch (error) {
      console.error('Error fetching blood banks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBloodBanks = bloodBanks.filter((bank) =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bank.location.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getBloodGroupBadgeColor = (bloodGroup: BloodGroup): string => {
    const colorMap: Record<string, string> = {
      A_POSITIVE: 'bg-red-100 text-red-800',
      A_NEGATIVE: 'bg-red-200 text-red-900',
      B_POSITIVE: 'bg-blue-100 text-blue-800',
      B_NEGATIVE: 'bg-blue-200 text-blue-900',
      AB_POSITIVE: 'bg-purple-100 text-purple-800',
      AB_NEGATIVE: 'bg-purple-200 text-purple-900',
      O_POSITIVE: 'bg-green-100 text-green-800',
      O_NEGATIVE: 'bg-green-200 text-green-900',
    }
    return colorMap[bloodGroup] || 'bg-gray-100 text-gray-800'
  }

  const BloodBankCard = ({ bank }: { bank: BloodBank }) => {
    const availableBloodGroups = bank.services.filter((s) => s.available)

    return (
      <Link href={`/emergency/blood-banks/${bank.id}`}>
        <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                  {bank.name}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {bank.type.replace(/_/g, ' ')}
                  </Badge>
                  {bank.verified && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {bank.rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{bank.rating.toFixed(1)}</span>
                    <Droplet className="h-4 w-4 fill-red-600 text-red-600" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-muted-foreground line-clamp-2">
                  {bank.location.address}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{bank.phoneNumber}</span>
                {bank.emergencyNumber && (
                  <Badge variant="destructive" className="text-xs">
                    Emergency: {bank.emergencyNumber}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {bank.operatingHours.Monday?.is24x7
                    ? '24x7 Available'
                    : `${bank.operatingHours.Monday?.open || 'N/A'} - ${bank.operatingHours.Monday?.close || 'N/A'}`}
                </span>
              </div>
            </div>

            {availableBloodGroups.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Blood Available:</p>
                <div className="flex flex-wrap gap-1">
                  {availableBloodGroups.slice(0, 6).map((service) => (
                    <Badge
                      key={service.bloodGroup}
                      className={cn('text-xs', getBloodGroupBadgeColor(service.bloodGroup))}
                    >
                      {bloodGroups.find((bg) => bg.value === service.bloodGroup)?.label}
                      {service.unitsAvailable && ` (${service.unitsAvailable})`}
                    </Badge>
                  ))}
                  {availableBloodGroups.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{availableBloodGroups.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {bank.facilities.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Facilities:</p>
                <div className="flex flex-wrap gap-1">
                  {bank.facilities.slice(0, 3).map((facility, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {facility}
                    </Badge>
                  ))}
                  {bank.facilities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{bank.facilities.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                {bank.donationAccepted && (
                  <Badge variant="outline" className="text-xs">
                    Donation
                  </Badge>
                )}
                {bank.crossMatchingAvailable && (
                  <Badge variant="outline" className="text-xs">
                    Cross-Match
                  </Badge>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Blood Banks</h1>
        <p className="mt-2 text-muted-foreground">
          Find nearby blood banks and check blood availability
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search blood banks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Blood Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Blood Groups</SelectItem>
                {bloodGroups.map((bg) => (
                  <SelectItem key={bg.value} value={bg.value}>
                    {bg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {bloodBankTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Blood Banks Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="mb-4 h-6 w-3/4" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBloodBanks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Droplet className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="mb-2 text-lg font-semibold">No blood banks found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Try adjusting your filters or search query
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedBloodGroup('')
                setSelectedType('')
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Found {filteredBloodBanks.length} blood bank{filteredBloodBanks.length !== 1 ? 's' : ''}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBloodBanks.map((bank) => (
              <BloodBankCard key={bank.id} bank={bank} />
            ))}
          </div>
        </>
      )}

      {/* Emergency Contact */}
      <Card className="mt-8 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <Phone className="h-5 w-5" />
            Emergency Blood Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-800 mb-4">
            For urgent blood requirements, contact your nearest blood bank directly or call emergency services.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive" size="sm" asChild>
              <a href="tel:108">
                <Phone className="mr-2 h-4 w-4" />
                108 - Emergency
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="tel:102">
                <Phone className="mr-2 h-4 w-4" />
                102 - Medical Helpline
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
