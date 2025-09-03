'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Search, 
  Package, 
  Truck, 
  MapPin,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Navigation
} from 'lucide-react'

interface Shipment {
  id: string
  trackingNumber: string
  origin: string
  destination: string
  status: string
  type: string
  weight?: number
  dimensions?: string
  distance?: number
  estimatedDelivery?: string
  actualDelivery?: string
  cost: number
  notes?: string
  createdAt: string
  order?: {
    id: string
    orderNumber: string
    customer: {
      id: string
      name: string
      email: string
    }
  }
  vehicle?: {
    id: string
    licensePlate: string
    make: string
    model: string
  }
  driver?: {
    id: string
    name: string
    email: string
  }
  tracking: Array<{
    id: string
    location: string
    status: string
    timestamp: string
  }>
  proofOfDelivery?: {
    id: string
    recipientName: string
    deliveredAt: string
  }
}

interface ShipmentFormData {
  origin: string
  destination: string
  type: string
  weight?: string
  dimensions?: string
  notes?: string
}

export default function ShipmentManagement() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [formData, setFormData] = useState<ShipmentFormData>({
    origin: '',
    destination: '',
    type: 'STANDARD',
    weight: '',
    dimensions: '',
    notes: ''
  })

  useEffect(() => {
    fetchShipments()
    fetchVehicles()
  }, [])

  const fetchShipments = async () => {
    try {
      const response = await fetch('/api/shipments')
      if (response.ok) {
        const data = await response.json()
        setShipments(data)
      }
    } catch (error) {
      console.error('Error fetching shipments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchShipments()
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating shipment:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      origin: '',
      destination: '',
      type: 'STANDARD',
      weight: '',
      dimensions: '',
      notes: ''
    })
  }

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter
    const matchesType = typeFilter === 'all' || shipment.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

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

  const getShipmentStats = () => {
    const total = shipments.length
    const inTransit = shipments.filter(s => s.status === 'IN_TRANSIT').length
    const delivered = shipments.filter(s => s.status === 'DELIVERED').length
    const pending = shipments.filter(s => s.status === 'PENDING').length
    
    return { total, inTransit, delivered, pending }
  }

  const stats = getShipmentStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading shipments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shipment Management</h2>
          <p className="text-gray-600">Create, track, and manage all shipments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Shipment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Shipment</DialogTitle>
              <DialogDescription>
                Create a new shipment with origin, destination, and delivery details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    id="origin"
                    value={formData.origin}
                    onChange={(e) => setFormData({...formData, origin: e.target.value})}
                    placeholder="Enter origin address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    placeholder="Enter destination address"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Shipment Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STANDARD">Standard</SelectItem>
                      <SelectItem value="EXPRESS">Express</SelectItem>
                      <SelectItem value="OVERNIGHT">Overnight</SelectItem>
                      <SelectItem value="INTERNATIONAL">International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="Enter weight"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dimensions">Dimensions (LxWxH)</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
                  placeholder="e.g., 10x5x3 cm"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes or instructions"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Shipment</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Shipments
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              In Transit
            </CardTitle>
            <Truck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.inTransit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Delivered
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search shipments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PICKUP_SCHEDULED">Pickup Scheduled</SelectItem>
            <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
            <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="DELAYED">Delayed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="STANDARD">Standard</SelectItem>
            <SelectItem value="EXPRESS">Express</SelectItem>
            <SelectItem value="OVERNIGHT">Overnight</SelectItem>
            <SelectItem value="INTERNATIONAL">International</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Shipments</CardTitle>
          <CardDescription>
            Track and manage all your shipments in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking #</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-blue-600" />
                        {shipment.trackingNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{shipment.origin}</div>
                        <div className="text-gray-500">→ {shipment.destination}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(shipment.status)}>
                        <div className="flex items-center">
                          {getStatusIcon(shipment.status)}
                          <span className="ml-1">{shipment.status}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {shipment.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      {shipment.vehicle ? (
                        <div className="text-sm">
                          <div className="font-medium">{shipment.vehicle.licensePlate}</div>
                          <div className="text-gray-500">{shipment.vehicle.make} {shipment.vehicle.model}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {shipment.driver ? (
                        <div className="text-sm">
                          <div className="font-medium">{shipment.driver.name}</div>
                          <div className="text-gray-500">{shipment.driver.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${shipment.cost.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedShipment(shipment)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Shipment Details Modal */}
      {selectedShipment && (
        <Dialog open={!!selectedShipment} onOpenChange={() => setSelectedShipment(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Shipment Details - {selectedShipment.trackingNumber}</DialogTitle>
              <DialogDescription>
                Complete shipment information and tracking history
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Origin</Label>
                  <p className="text-sm">{selectedShipment.origin}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Destination</Label>
                  <p className="text-sm">{selectedShipment.destination}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={getStatusColor(selectedShipment.status)}>
                    {selectedShipment.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Type</Label>
                  <p className="text-sm">{selectedShipment.type}</p>
                </div>
              </div>

              {/* Tracking History */}
              <div>
                <Label className="text-sm font-medium text-gray-600 mb-2 block">Tracking History</Label>
                <div className="space-y-2">
                  {selectedShipment.tracking.map((track, index) => (
                    <div key={track.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          index === 0 ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <div className="font-medium text-sm">{track.location}</div>
                          <div className="text-xs text-gray-500">{track.status}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(track.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proof of Delivery */}
              {selectedShipment.proofOfDelivery && (
                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">Proof of Delivery</Label>
                  <div className="p-3 bg-green-50 rounded">
                    <div className="font-medium text-sm">Delivered to: {selectedShipment.proofOfDelivery.recipientName}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(selectedShipment.proofOfDelivery.deliveredAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {filteredShipments.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments found</h3>
          <p className="text-gray-500 mb-4">Create your first shipment to get started</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Shipment
          </Button>
        </div>
      )}
    </div>
  )
}