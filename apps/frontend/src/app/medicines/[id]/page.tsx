'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Star,
  Shield,
  Truck,
  Package,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { medicineAPI } from '@/lib/api/medicines'
import { useCartStore } from '@/lib/store/cart-store'
import { useWishlistStore } from '@/lib/store/wishlist-store'
import { formatCurrency } from '@/lib/utils/format'
import type { Medicine } from '@/lib/types/medicine'
import { cn } from '@/lib/utils/cn'

export default function MedicineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const medicineId = params.id as string

  const cart = useCartStore()
  const wishlist = useWishlistStore()

  const [medicine, setMedicine] = useState<Medicine | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'usage'>('description')

  useEffect(() => {
    fetchMedicine()
  }, [medicineId])

  const fetchMedicine = async () => {
    setLoading(true)
    try {
      const data = await medicineAPI.getMedicineById(medicineId)
      setMedicine(data)
    } catch (error) {
      console.error('Error fetching medicine:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!medicine) return
    cart.addItem(medicine, quantity)
  }

  const handleToggleWishlist = () => {
    if (!medicine) return
    wishlist.toggle(medicine.id)
  }

  const handleBuyNow = () => {
    if (!medicine) return
    cart.addItem(medicine, quantity)
    router.push('/checkout')
  }

  const incrementQuantity = () => {
    if (medicine && quantity < medicine.stockQuantity) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="h-96 rounded bg-muted" />
            <div className="space-y-4">
              <div className="h-8 w-64 rounded bg-muted" />
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-12 w-full rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!medicine) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Medicine not found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              The medicine you're looking for doesn't exist
            </p>
            <Button asChild>
              <Link href="/medicines">Browse Medicines</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isInStock = medicine.stockQuantity > 0
  const isWishlisted = wishlist.isWishlisted(medicine.id)
  const cartItem = cart.items.find((item) => item.medicine.id === medicine.id)
  const inCart = !!cartItem
  const discount = medicine.discount || 0
  const finalPrice = medicine.price - (medicine.price * discount) / 100

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/medicines">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Medicines
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Image */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            {/* Placeholder for image */}
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <Package className="h-32 w-32 text-muted-foreground" />
            </div>

            {/* Discount Badge */}
            {discount > 0 && (
              <Badge className="absolute left-4 top-4 bg-green-600 text-white">
                {discount}% OFF
              </Badge>
            )}

            {/* Wishlist Button */}
            <Button
              size="icon"
              variant={isWishlisted ? 'default' : 'secondary'}
              className="absolute right-4 top-4"
              onClick={handleToggleWishlist}
            >
              <Heart
                className={cn('h-5 w-5', isWishlisted && 'fill-current')}
              />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and Category */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline">{medicine.category.name}</Badge>
              {medicine.prescriptionRequired && (
                <Badge className="bg-amber-100 text-amber-800">
                  Rx Required
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold">{medicine.name}</h1>
            <p className="mt-2 text-muted-foreground">
              by {medicine.manufacturer}
            </p>
          </div>

          {/* Price */}
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">
                {formatCurrency(finalPrice)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCurrency(medicine.price)}
                  </span>
                  <Badge className="bg-green-100 text-green-800">
                    Save {formatCurrency(medicine.price - finalPrice)}
                  </Badge>
                </>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Inclusive of all taxes
            </p>
          </div>

          {/* Stock Status */}
          <div>
            {isInStock ? (
              <div className="flex items-center gap-2 text-green-600">
                <Shield className="h-5 w-5" />
                <span className="font-medium">In Stock ({medicine.stockQuantity} available)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          {isInStock && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-lg font-semibold">
                  {quantity}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={incrementQuantity}
                  disabled={quantity >= medicine.stockQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Prescription Warning */}
          {medicine.prescriptionRequired && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                This medicine requires a valid prescription. You'll need to upload it after placing the order.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={!isInStock}
              size="lg"
              variant="outline"
              className="flex-1"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {inCart ? `In Cart (${cartItem!.quantity})` : 'Add to Cart'}
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={!isInStock}
              size="lg"
              className="flex-1"
            >
              Buy Now
            </Button>
          </div>

          {/* Features */}
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Free Delivery</h4>
                <p className="text-sm text-muted-foreground">
                  On orders above ₹500
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">100% Genuine</h4>
                <p className="text-sm text-muted-foreground">
                  Sourced directly from manufacturers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-12">
        <div className="flex border-b">
          <button
            className={cn(
              'px-6 py-3 font-medium transition-colors',
              activeTab === 'description'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={cn(
              'px-6 py-3 font-medium transition-colors',
              activeTab === 'ingredients'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('ingredients')}
          >
            Ingredients
          </button>
          <button
            className={cn(
              'px-6 py-3 font-medium transition-colors',
              activeTab === 'usage'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('usage')}
          >
            Usage & Dosage
          </button>
        </div>

        <div className="py-6">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p>{medicine.description || 'No description available.'}</p>
            </div>
          )}
          {activeTab === 'ingredients' && (
            <div className="prose max-w-none">
              <p>
                Composition: {medicine.composition || 'Information not available'}
              </p>
            </div>
          )}
          {activeTab === 'usage' && (
            <div className="prose max-w-none">
              <p>
                Dosage: {medicine.dosageForm || 'Consult your doctor for proper dosage'}
              </p>
              <p className="mt-4">
                Please read the label carefully before use. Consult your healthcare provider for personalized advice.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
