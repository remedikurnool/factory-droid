'use client'

import { useState, useEffect } from 'react'
import { Plus, MapPin, Home, Briefcase, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { Address } from '@/lib/types/order'
import { orderAPI } from '@/lib/api/orders'
import { AddressForm } from './address-form'

interface AddressSelectionProps {
  selectedAddressId?: string
  onSelect: (addressId: string) => void
}

export function AddressSelection({
  selectedAddressId,
  onSelect,
}: AddressSelectionProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const data = await orderAPI.getAddresses()
      setAddresses(data)
      // Auto-select default address
      const defaultAddress = data.find((addr) => addr.isDefault)
      if (defaultAddress && !selectedAddressId) {
        onSelect(defaultAddress.id)
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddressAdded = (address: Address) => {
    setAddresses((prev) => [...prev, address])
    setShowForm(false)
    onSelect(address.id)
  }

  const handleAddressUpdated = (address: Address) => {
    setAddresses((prev) =>
      prev.map((addr) => (addr.id === address.id ? address : addr))
    )
    setEditingAddress(null)
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await orderAPI.deleteAddress(id)
        setAddresses((prev) => prev.filter((addr) => addr.id !== id))
        if (selectedAddressId === id) {
          const newDefault = addresses.find((addr) => addr.id !== id)
          if (newDefault) onSelect(newDefault.id)
        }
      } catch (error) {
        console.error('Error deleting address:', error)
      }
    }
  }

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'HOME':
        return Home
      case 'WORK':
        return Briefcase
      default:
        return MapPin
    }
  }

  if (showForm) {
    return (
      <div>
        <Button
          variant="ghost"
          onClick={() => {
            setShowForm(false)
            setEditingAddress(null)
          }}
          className="mb-4"
        >
          ← Back to addresses
        </Button>
        <AddressForm
          address={editingAddress || undefined}
          onSuccess={editingAddress ? handleAddressUpdated : handleAddressAdded}
          onCancel={() => {
            setShowForm(false)
            setEditingAddress(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Select Delivery Address</h2>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add New Address
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-3/4 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No addresses saved</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Add a delivery address to continue
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => {
            const Icon = getAddressIcon(address.addressType)
            const isSelected = selectedAddressId === address.id

            return (
              <Card
                key={address.id}
                className={cn(
                  'cursor-pointer transition-colors hover:border-primary',
                  isSelected && 'border-primary ring-2 ring-primary ring-offset-2'
                )}
                onClick={() => onSelect(address.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{address.fullName}</h3>
                          {address.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                          <Badge variant="outline">
                            {address.addressType}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {address.addressLine1}
                          {address.addressLine2 && `, ${address.addressLine2}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        {address.landmark && (
                          <p className="text-sm text-muted-foreground">
                            Landmark: {address.landmark}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-muted-foreground">
                          Phone: {address.phoneNumber}
                        </p>

                        <div className="mt-2 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(address)
                            }}
                          >
                            Edit
                          </Button>
                          {!address.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(address.id)
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
