'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Package, 
  Truck, 
  MapPin, 
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Plus,
  Eye,
  Download,
  FileText,
  User,
  Phone,
  Mail,
  Star,
  TrendingUp,
  Navigation,
  CreditCard
} from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  createdAt: string
  warehouse: {
    name: string
    code: string
  }
  shipments: Array<{
    id: string
    trackingNumber: string
    status: string
    estimatedDelivery?: string
  }>
  invoices: Array<{
    id: string
    invoiceNumber: string
    status: string
    totalAmount: number
  }>
}

interface Shipment {
  id: string
  trackingNumber: string
  origin: string
  destination: string
  status: string
  estimatedDelivery?: string
  actualDelivery?: string
  cost: number
  driver?: {
    name: string
    phone?: string
  }
  vehicle?: {
    licensePlate: string
    make: string
    model: string
  }
  tracking: Array<{
    location: string
    status: string
    timestamp: string
    latitude?: number
    longitude?: number
  }>
}

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  tax: number
  totalAmount: number
  status: string
  dueDate?: string
  createdAt: string
  payments: Array<{
    amount: number
    method: string
    status: string
    paidAt?: string
  }>
}

export default function CustomerPortal() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [orderFormData, setOrderFormData] = useState({
    warehouseId: '',
    items: '',
    notes: ''
  })

  useEffect(() => {
    if (session) {
      fetchCustomerData()
    }
  }, [session])

  const fetchCustomerData = async () => {
    setLoading(true)
    try {
      const [ordersRes, shipmentsRes, invoicesRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/shipments'),
        fetch('/api/invoices')
      ])

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }

      if (shipmentsRes.ok) {
        const shipmentsData = await shipmentsRes.json()
        setShipments(shipmentsData)
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json()
        setInvoices(invoicesData)
      }
    } catch (error) {
      console.error('Error fetching customer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          warehouseId: orderFormData.warehouseId,
          items: JSON.parse(orderFormData.items),
          notes: orderFormData.notes
        })
      })

      if (response.ok) {
        await fetchCustomerData()
        setIsOrderDialogOpen(false)
        setOrderFormData({ warehouseId: '', items: '', notes: '' })
      }
    } catch (error) {
      console.error('Error creating order:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': case 'PAID': return 'bg-green-100 text-green-800'
      case 'IN_TRANSIT': case 'CONFIRMED': case 'PROCESSING': return 'bg-blue-100 text-blue-800'
      case 'PENDING': case 'DRAFT': return 'bg-yellow-100 text-yellow-800'
      case 'DELAYED': case 'OVERDUE': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': case 'PAID': return <CheckCircle className="h-4 w-4" />
      case 'IN_TRANSIT': return <Truck className="h-4 w-4" />
      case 'PENDING': case 'DRAFT': return <Clock className="h-4 w-4" />
      case 'DELAYED': case 'OVERDUE': return <AlertTriangle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getCustomerStats = () => {
    const totalOrders = orders.length
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length
    const totalSpent = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.totalAmount, 0)
    const pendingShipments = shipments.filter(s => s.status !== 'DELIVERED').length
    
    return { totalOrders, deliveredOrders, totalSpent, pendingShipments }
  }

  const stats = getCustomerStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Customer Portal</h2>
        <p className="text-gray-600">Welcome back, {session?.user?.name}! Manage your orders and shipments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Orders
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
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
            <div className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Spent
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              In Transit
            </CardTitle>
            <Truck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingShipments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest order activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{order.orderNumber}</div>
                        <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No orders yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Shipments */}
            <Card>
              <CardHeader>
                <CardTitle>Active Shipments</CardTitle>
                <CardDescription>Shipments currently in transit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {shipments.filter(s => s.status !== 'DELIVERED').slice(0, 5).map((shipment) => (
                    <div key={shipment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{shipment.trackingNumber}</div>
                        <div className="text-xs text-gray-500">{shipment.destination}</div>
                      </div>
                      <Badge className={getStatusColor(shipment.status)}>
                        {shipment.status}
                      </Badge>
                    </div>
                  ))}
                  {shipments.filter(s => s.status !== 'DELIVERED').length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No active shipments
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-20 flex-col space-y-2" onClick={() => setIsOrderDialogOpen(true)}>
                  <Plus className="h-6 w-6" />
                  <span>New Order</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => setActiveTab('shipments')}>
                  <Navigation className="h-6 w-6" />
                  <span>Track Shipment</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => setActiveTab('invoices')}>
                  <FileText className="h-6 w-6" />
                  <span>View Invoices</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <CreditCard className="h-6 w-6" />
                  <span>Make Payment</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Your Orders</h3>
              <p className="text-gray-600">Manage and track your orders</p>
            </div>
            <Button onClick={() => setIsOrderDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders..."
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
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Shipments</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{order.warehouse.name}</TableCell>
                        <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.shipments.map((shipment, index) => (
                              <div key={index} className="text-xs">
                                <span className="font-mono">{shipment.trackingNumber}</span>
                                <Badge className={`ml-1 ${getStatusColor(shipment.status)}`} variant="outline">
                                  {shipment.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipments" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Your Shipments</h3>
            <p className="text-gray-600">Track your shipments in real-time</p>
          </div>

          {/* Shipment Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Track Shipment</CardTitle>
              <CardDescription>Enter tracking number to get real-time updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter tracking number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={() => {
                  const shipment = shipments.find(s => s.trackingNumber === searchTerm)
                  if (shipment) setSelectedShipment(shipment)
                }}>
                  <Search className="h-4 w-4 mr-2" />
                  Track
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shipments List */}
          <Card>
            <CardHeader>
              <CardTitle>All Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredShipments.map((shipment) => (
                  <div key={shipment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-medium">{shipment.trackingNumber}</div>
                        <div className="text-sm text-gray-500">
                          {shipment.origin} → {shipment.destination}
                        </div>
                      </div>
                      <Badge className={getStatusColor(shipment.status)}>
                        {shipment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        {shipment.estimatedDelivery && `ETA: ${new Date(shipment.estimatedDelivery).toLocaleDateString()}`}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedShipment(shipment)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Your Invoices</h3>
            <p className="text-gray-600">Manage your billing and payments</p>
          </div>

          {/* Invoices List */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-medium">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-gray-500">
                          Created: {new Date(invoice.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">${invoice.totalAmount.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">
                          {invoice.dueDate && `Due: ${new Date(invoice.dueDate).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.status !== 'PAID' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Creation Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>Place a new order with your selected items</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div>
              <Label htmlFor="warehouse">Warehouse</Label>
              <Select 
                value={orderFormData.warehouseId} 
                onValueChange={(value) => setOrderFormData({...orderFormData, warehouseId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wh1">Main Warehouse</SelectItem>
                  <SelectItem value="wh2">East Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="items">Items (JSON format)</Label>
              <Textarea
                id="items"
                value={orderFormData.items}
                onChange={(e) => setOrderFormData({...orderFormData, items: e.target.value})}
                placeholder='[{"inventoryId": "id", "quantity": 1, "price": 10.00}]'
                rows={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={orderFormData.notes}
                onChange={(e) => setOrderFormData({...orderFormData, notes: e.target.value})}
                placeholder="Additional notes for your order"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Order</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}