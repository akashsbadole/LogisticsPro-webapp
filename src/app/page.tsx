'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Truck, 
  Warehouse, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import WarehouseList from '@/components/warehouse/warehouse-list'
import InventoryManagement from '@/components/warehouse/inventory-management'
import ShipmentManagement from '@/components/shipments/shipment-management'
import ShipmentTracking from '@/components/shipments/shipment-tracking'
import InvoiceManagement from '@/components/billing/invoice-management'
import PaymentProcessing from '@/components/billing/payment-processing'
import AdminDashboard from '@/components/analytics/admin-dashboard'
import ReportsGeneration from '@/components/analytics/reports-generation'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const [userRole, setUserRole] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [stats, setStats] = useState([
    { title: 'Total Shipments', value: '0', change: '+0%', icon: Package, color: 'text-blue-600' },
    { title: 'Active Vehicles', value: '0', change: '+0%', icon: Truck, color: 'text-green-600' },
    { title: 'Warehouse Capacity', value: '0%', change: '+0%', icon: Warehouse, color: 'text-orange-600' },
    { title: 'Total Revenue', value: '$0', change: '+0%', icon: DollarSign, color: 'text-purple-600' },
  ])
  const [recentShipments, setRecentShipments] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      setUserRole(session.user.role)
      setUserName(session.user.name)
      fetchDashboardStats()
    }
  }, [session])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats([
          { title: 'Total Shipments', value: data.totalShipments.toString(), change: '+12%', icon: Package, color: 'text-blue-600' },
          { title: 'Active Vehicles', value: data.activeVehicles.toString(), change: '+3%', icon: Truck, color: 'text-green-600' },
          { title: 'Warehouse Capacity', value: data.warehouseCapacity, change: '-2%', icon: Warehouse, color: 'text-orange-600' },
          { title: 'Total Revenue', value: `$${data.totalRevenue.toLocaleString()}`, change: '+18%', icon: DollarSign, color: 'text-purple-600' },
        ])
        setRecentShipments(data.recentShipments || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800'
      case 'In Transit': return 'bg-blue-100 text-blue-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Delayed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator'
      case 'WAREHOUSE_MANAGER': return 'Warehouse Manager'
      case 'DRIVER': return 'Driver'
      case 'CUSTOMER': return 'Customer'
      case 'PARTNER': return 'Partner'
      default: return role
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LogisticsPro</h1>
                <p className="text-sm text-gray-500">Welcome, {userName} ({getRoleDisplayName(userRole)})</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">{getRoleDisplayName(userRole)}</Badge>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {(userRole === 'ADMIN' || userRole === 'WAREHOUSE_MANAGER') && (
              <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
            )}
            {(userRole === 'ADMIN' || userRole === 'DRIVER') && (
              <TabsTrigger value="shipments">Shipments</TabsTrigger>
            )}
            {userRole === 'ADMIN' && (
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            )}
            {userRole === 'CUSTOMER' && (
              <TabsTrigger value="customer">Customer Portal</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loadingStats ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse" />
                      ) : (
                        stat.value
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">{stat.change}</span> from last month
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Shipments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Shipments</CardTitle>
                <CardDescription>Latest shipment activities and status updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingStats ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
                          </div>
                          <div className="space-y-2">
                            <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    recentShipments.map((shipment: any) => (
                      <div key={shipment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Package className="h-5 w-5 text-gray-400" />
                            <span className="font-medium">{shipment.id}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{shipment.destination}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(shipment.status)}>
                            {shipment.status}
                          </Badge>
                          <div className="text-sm text-gray-500">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {shipment.eta}
                          </div>
                          <div className="text-sm text-gray-500">
                            <Users className="h-3 w-3 inline mr-1" />
                            {shipment.driver}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(userRole === 'ADMIN' || userRole === 'CUSTOMER') && (
                    <Button className="h-20 flex-col space-y-2">
                      <Package className="h-6 w-6" />
                      <span>New Shipment</span>
                    </Button>
                  )}
                  {(userRole === 'ADMIN' || userRole === 'WAREHOUSE_MANAGER') && (
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Warehouse className="h-6 w-6" />
                      <span>Manage Inventory</span>
                    </Button>
                  )}
                  {(userRole === 'ADMIN' || userRole === 'DRIVER') && (
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Truck className="h-6 w-6" />
                      <span>Track Vehicle</span>
                    </Button>
                  )}
                  {userRole === 'ADMIN' && (
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <TrendingUp className="h-6 w-6" />
                      <span>View Reports</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Portal for Customers */}
            {userRole === 'CUSTOMER' && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Portal</CardTitle>
                  <CardDescription>Access your personalized customer dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your Personal Dashboard</h3>
                    <p className="text-gray-500 mb-4">
                      Manage your orders, track shipments, view invoices, and more
                    </p>
                    <Button onClick={() => setActiveTab('customer')}>
                      Go to Customer Portal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {(userRole === 'ADMIN' || userRole === 'WAREHOUSE_MANAGER') && (
            <TabsContent value="warehouse">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Warehouse Management</CardTitle>
                    <CardDescription>Manage warehouses and inventory across all locations</CardDescription>
                  </CardHeader>
                </Card>
                
                <Tabs defaultValue="warehouses" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="warehouses">
                    <WarehouseList />
                  </TabsContent>
                  
                  <TabsContent value="inventory">
                    <InventoryManagement />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
          )}

          {(userRole === 'ADMIN' || userRole === 'DRIVER') && (
            <TabsContent value="shipments">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Shipment Management</CardTitle>
                    <CardDescription>Create, track, and manage all shipments with real-time GPS tracking</CardDescription>
                  </CardHeader>
                </Card>
                
                <Tabs defaultValue="management" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="management">Shipments</TabsTrigger>
                    <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="management">
                    <ShipmentManagement />
                  </TabsContent>
                  
                  <TabsContent value="tracking">
                    <ShipmentTracking />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
          )}

          {(userRole === 'ADMIN' || userRole === 'CUSTOMER') && (
            <TabsContent value="billing">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing & Payments</CardTitle>
                    <CardDescription>Manage invoices, process payments, and track billing status</CardDescription>
                  </CardHeader>
                </Card>
                
                <Tabs defaultValue="invoices" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="payments">Make Payment</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="invoices">
                    <InvoiceManagement />
                  </TabsContent>
                  
                  <TabsContent value="payments">
                    <PaymentProcessing />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
          )}

          {userRole === 'ADMIN' && (
            <TabsContent value="analytics">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics & Reports</CardTitle>
                    <CardDescription>Business intelligence and performance metrics</CardDescription>
                  </CardHeader>
                </Card>
                
                <Tabs defaultValue="billing" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="billing">Billing & Invoices</TabsTrigger>
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="billing">
                    <InvoiceManagement />
                  </TabsContent>
                  
                  <TabsContent value="dashboard">
                    <AdminDashboard />
                  </TabsContent>
                  
                  <TabsContent value="reports">
                    <ReportsGeneration />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
          )}

          {userRole === 'CUSTOMER' && (
            <TabsContent value="customer">
              <CustomerPortal />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}