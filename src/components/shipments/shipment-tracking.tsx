'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Package, 
  MapPin, 
  Navigation,
  Clock,
  CheckCircle,
  Truck,
  AlertTriangle,
  Phone,
  Mail,
  User
} from 'lucide-react'

interface ShipmentTracking {
  id: string
  trackingNumber: string
  origin: string
  destination: string
  status: string
  currentLocation?: string
  latitude?: number
  longitude?: number
  estimatedDelivery?: string
  driver?: {
    name: string
    phone?: string
    email?: string
  }
  vehicle?: {
    licensePlate: string
    make: string
    model: string
  }
  tracking: Array<{
    id: string
    location: string
    status: string
    timestamp: string
    latitude?: number
    longitude?: number
    notes?: string
  }>
}

interface TrackingUpdate {
  location: string
  latitude?: string
  longitude?: string
  status: string
  notes?: string
}

export default function ShipmentTracking() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shipment, setShipment] = useState<ShipmentTracking | null>(null)
  const [loading, setLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [trackingUpdate, setTrackingUpdate] = useState<TrackingUpdate>({
    location: '',
    latitude: '',
    longitude: '',
    status: '',
    notes: ''
  })
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    // Get user's current location for GPS tracking
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])

  const trackShipment = async () => {
    if (!trackingNumber.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/shipments?trackingNumber=${trackingNumber}`)
      if (response.ok) {
        const shipments = await response.json()
        const foundShipment = shipments.find((s: any) => s.trackingNumber === trackingNumber)
        setShipment(foundShipment || null)
      }
    } catch (error) {
      console.error('Error tracking shipment:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTracking = async () => {
    if (!shipment || !trackingUpdate.location || !trackingUpdate.status) return

    setIsUpdating(true)
    try {
      const response = await fetch('/api/shipments/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shipmentId: shipment.id,
          location: trackingUpdate.location,
          latitude: trackingUpdate.latitude ? parseFloat(trackingUpdate.latitude) : undefined,
          longitude: trackingUpdate.longitude ? parseFloat(trackingUpdate.longitude) : undefined,
          status: trackingUpdate.status,
          notes: trackingUpdate.notes
        })
      })

      if (response.ok) {
        // Refresh shipment data
        await trackShipment()
        setTrackingUpdate({
          location: '',
          latitude: '',
          longitude: '',
          status: '',
          notes: ''
        })
      }
    } catch (error) {
      console.error('Error updating tracking:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const useCurrentLocation = () => {
    if (userLocation) {
      setTrackingUpdate(prev => ({
        ...prev,
        latitude: userLocation.lat.toString(),
        longitude: userLocation.lng.toString()
      }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'PICKUP_SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'IN_TRANSIT': return 'bg-purple-100 text-purple-800'
      case 'OUT_FOR_DELIVERY': return 'bg-indigo-100 text-indigo-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'DELAYED': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'IN_TRANSIT': return <Truck className="h-4 w-4" />
      case 'DELIVERED': return <CheckCircle className="h-4 w-4" />
      case 'DELAYED': return <AlertTriangle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getProgressPercentage = (status: string) => {
    const progressMap: Record<string, number> = {
      'PENDING': 0,
      'PICKUP_SCHEDULED': 25,
      'IN_TRANSIT': 50,
      'OUT_FOR_DELIVERY': 75,
      'DELIVERED': 100,
      'CANCELLED': 0,
      'DELAYED': 50
    }
    return progressMap[status] || 0
  }

  return (
    <div className="space-y-6">
      {/* Tracking Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Navigation className="h-5 w-5 mr-2" />
            Track Shipment
          </CardTitle>
          <CardDescription>
            Enter your tracking number to get real-time shipment updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Enter tracking number (e.g., TRK1234567890)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && trackShipment()}
              />
            </div>
            <Button onClick={trackShipment} disabled={loading || !trackingNumber.trim()}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Tracking...' : 'Track'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shipment Details */}
      {shipment && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Shipment Details</span>
                  <Badge className={getStatusColor(shipment.status)}>
                    <div className="flex items-center">
                      {getStatusIcon(shipment.status)}
                      <span className="ml-1">{shipment.status}</span>
                    </div>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Tracking Number</Label>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">{shipment.trackingNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Estimated Delivery</Label>
                      <p className="text-sm">
                        {shipment.estimatedDelivery 
                          ? new Date(shipment.estimatedDelivery).toLocaleDateString()
                          : 'TBD'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Route Progress */}
                  <div>
                    <Label className="text-sm font-medium text-gray-600 mb-2 block">Route Progress</Label>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${getProgressPercentage(shipment.status)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>Origin</span>
                        <span>In Transit</span>
                        <span>Destination</span>
                      </div>
                    </div>
                  </div>

                  {/* Route Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Origin</Label>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-1 text-green-600" />
                        {shipment.origin}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Destination</Label>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-1 text-red-600" />
                        {shipment.destination}
                      </div>
                    </div>
                  </div>

                  {/* Current Location */}
                  {shipment.currentLocation && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Current Location</Label>
                      <div className="flex items-center text-sm">
                        <Navigation className="h-4 w-4 mr-1 text-blue-600" />
                        {shipment.currentLocation}
                      </div>
                    </div>
                  )}

                  {/* Driver & Vehicle Info */}
                  {(shipment.driver || shipment.vehicle) && (
                    <div className="grid grid-cols-2 gap-4">
                      {shipment.driver && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Driver</Label>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <User className="h-4 w-4 mr-1 text-gray-400" />
                              {shipment.driver.name}
                            </div>
                            {shipment.driver.phone && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Phone className="h-4 w-4 mr-1" />
                                {shipment.driver.phone}
                              </div>
                            )}
                            {shipment.driver.email && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Mail className="h-4 w-4 mr-1" />
                                {shipment.driver.email}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {shipment.vehicle && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Vehicle</Label>
                          <div className="text-sm">
                            <div className="font-medium">{shipment.vehicle.licensePlate}</div>
                            <div className="text-gray-500">{shipment.vehicle.make} {shipment.vehicle.model}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tracking History */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {shipment.tracking.map((track, index) => (
                    <div key={track.id} className="flex items-start space-x-3">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        index === 0 ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{track.location}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(track.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{track.status}</div>
                        {track.notes && (
                          <div className="text-xs text-gray-500 mt-1">{track.notes}</div>
                        )}
                        {track.latitude && track.longitude && (
                          <div className="text-xs text-blue-600 mt-1">
                            GPS: {track.latitude.toFixed(6)}, {track.longitude.toFixed(6)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tracking Update Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Update Tracking</CardTitle>
                <CardDescription>
                  Add new tracking information for this shipment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location">Current Location</Label>
                  <Input
                    id="location"
                    value={trackingUpdate.location}
                    onChange={(e) => setTrackingUpdate({...trackingUpdate, location: e.target.value})}
                    placeholder="Enter current location"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={trackingUpdate.latitude}
                      onChange={(e) => setTrackingUpdate({...trackingUpdate, latitude: e.target.value})}
                      placeholder="Latitude"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={trackingUpdate.longitude}
                      onChange={(e) => setTrackingUpdate({...trackingUpdate, longitude: e.target.value})}
                      placeholder="Longitude"
                    />
                  </div>
                </div>

                {userLocation && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={useCurrentLocation}
                    className="w-full"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Use Current Location
                  </Button>
                )}

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={trackingUpdate.status} onValueChange={(value) => setTrackingUpdate({...trackingUpdate, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PICKUP_SCHEDULED">Pickup Scheduled</SelectItem>
                      <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                      <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="DELAYED">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={trackingUpdate.notes}
                    onChange={(e) => setTrackingUpdate({...trackingUpdate, notes: e.target.value})}
                    placeholder="Additional notes about this update"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={updateTracking} 
                  disabled={isUpdating || !trackingUpdate.location || !trackingUpdate.status}
                  className="w-full"
                >
                  {isUpdating ? 'Updating...' : 'Update Tracking'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* No Shipment Found */}
      {trackingNumber && !shipment && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Shipment Not Found</h3>
            <p className="text-gray-500 mb-4">
              No shipment found with tracking number: {trackingNumber}
            </p>
            <p className="text-sm text-gray-400">
              Please check the tracking number and try again.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}