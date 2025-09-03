'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Truck, 
  DollarSign,
  Users,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap
} from 'lucide-react'

interface DashboardMetrics {
  totalShipments: number
  activeVehicles: number
  totalWarehouses: number
  totalRevenue: number
  deliveredShipments: number
  pendingShipments: number
  overdueInvoices: number
  lowStockItems: number
  monthlyGrowth: number
  customerSatisfaction: number
  onTimeDelivery: number
}

interface ChartData {
  name: string
  value: number
}

interface TopPerformer {
  id: string
  name: string
  type: 'driver' | 'warehouse'
  performance: number
  metric: string
  metricValue: number
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalShipments: 0,
    activeVehicles: 0,
    totalWarehouses: 0,
    totalRevenue: 0,
    deliveredShipments: 0,
    pendingShipments: 0,
    overdueInvoices: 0,
    lowStockItems: 0,
    monthlyGrowth: 0,
    customerSatisfaction: 0,
    onTimeDelivery: 0
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([])

  useEffect(() => {
    fetchDashboardMetrics()
    fetchTopPerformers()
  }, [timeRange])

  const fetchDashboardMetrics = async () => {
    setLoading(true)
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMetrics({
        totalShipments: 1234,
        activeVehicles: 48,
        totalWarehouses: 5,
        totalRevenue: 45200,
        deliveredShipments: 987,
        pendingShipments: 123,
        overdueInvoices: 23,
        lowStockItems: 15,
        monthlyGrowth: 12.5,
        customerSatisfaction: 94.2,
        onTimeDelivery: 87.3
      })
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTopPerformers = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setTopPerformers([
        { id: '1', name: 'John Doe', type: 'driver', performance: 98, metric: 'On-time Delivery', metricValue: 98 },
        { id: '2', name: 'Jane Smith', type: 'driver', performance: 95, metric: 'Deliveries', metricValue: 156 },
        { id: '3', name: 'Main Warehouse', type: 'warehouse', performance: 92, metric: 'Efficiency', metricValue: 92 },
        { id: '4', name: 'Mike Johnson', type: 'driver', performance: 89, metric: 'Customer Rating', metricValue: 4.8 },
        { id: '5', name: 'East Warehouse', type: 'warehouse', performance: 87, metric: 'Capacity', metricValue: 87 }
      ])
    } catch (error) {
      console.error('Error fetching top performers:', error)
    }
  }

  const shipmentData: ChartData[] = [
    { name: 'Delivered', value: metrics.deliveredShipments },
    { name: 'In Transit', value: 124 },
    { name: 'Pending', value: metrics.pendingShipments },
    { name: 'Delayed', value: 23 }
  ]

  const revenueData: ChartData[] = [
    { name: 'Jan', value: 35000 },
    { name: 'Feb', value: 42000 },
    { name: 'Mar', value: 38000 },
    { name: 'Apr', value: 45200 },
    { name: 'May', value: 48000 },
    { name: 'Jun', value: 52000 }
  ]

  const getMetricCard = (title: string, value: string | number, change?: number, icon: React.ReactNode, color: string = 'text-blue-600') => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={color}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground">
            {change > 0 ? (
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{change.toFixed(1)}%
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                {change.toFixed(1)}%
              </span>
            )} from last month
          </p>
        )}
      </CardContent>
    </Card>
  )

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'bg-green-100 text-green-800'
    if (performance >= 80) return 'bg-blue-100 text-blue-800'
    if (performance >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded mt-2 w-3/4 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive business intelligence and performance metrics</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {getMetricCard('Total Shipments', metrics.totalShipments, metrics.monthlyGrowth, <Package className="h-4 w-4" />)}
        {getMetricCard('Active Vehicles', metrics.activeVehicles, 3.2, <Truck className="h-4 w-4" />, 'text-green-600')}
        {getMetricCard('Total Revenue', `$${metrics.totalRevenue.toLocaleString()}`, 18.7, <DollarSign className="h-4 w-4" />, 'text-purple-600')}
        {getMetricCard('On-time Delivery', `${metrics.onTimeDelivery}%`, 2.1, <CheckCircle className="h-4 w-4" />, 'text-green-600')}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {getMetricCard('Warehouses', metrics.totalWarehouses, 0, <Building className="h-4 w-4" />, 'text-orange-600')}
        {getMetricCard('Customer Satisfaction', `${metrics.customerSatisfaction}%`, 1.8, <Users className="h-4 w-4" />, 'text-blue-600')}
        {getMetricCard('Pending Shipments', metrics.pendingShipments, -5.2, <Clock className="h-4 w-4" />, 'text-yellow-600')}
        {getMetricCard('Low Stock Items', metrics.lowStockItems, -12.3, <AlertTriangle className="h-4 w-4" />, 'text-red-600')}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipment Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Shipment Status Distribution
            </CardTitle>
            <CardDescription>Current status of all shipments in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shipmentData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">{item.value}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          index === 0 ? 'bg-green-500' :
                          index === 1 ? 'bg-blue-500' :
                          index === 2 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(item.value / metrics.totalShipments) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Monthly revenue performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">${item.value.toLocaleString()}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(item.value / 60000) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Top Performers
          </CardTitle>
          <CardDescription>Best performing drivers and warehouses this month</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Key Metric</TableHead>
                <TableHead>Metric Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPerformers.map((performer) => (
                <TableRow key={performer.id}>
                  <TableCell className="font-medium">{performer.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {performer.type === 'driver' ? (
                        <Truck className="h-3 w-3 mr-1" />
                      ) : (
                        <Building className="h-3 w-3 mr-1" />
                      )}
                      {performer.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPerformanceColor(performer.performance)}>
                      {performer.performance}%
                    </Badge>
                  </TableCell>
                  <TableCell>{performer.metric}</TableCell>
                  <TableCell className="font-medium">
                    {performer.type === 'driver' && performer.metric === 'Customer Rating' 
                      ? `${performer.metricValue}/5.0`
                      : performer.metricValue
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">API Response Time</span>
                <Badge className="bg-green-100 text-green-800">Excellent</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Database Load</span>
                <Badge className="bg-green-100 text-green-800">Low</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Error Rate</span>
                <Badge className="bg-green-100 text-green-800">0.1%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">247</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12% from last hour
            </div>
            <div className="mt-2 text-sm text-gray-500">
              45 drivers, 23 managers, 179 customers
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pickups</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Deliveries</span>
                <span className="font-medium">45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Maintenance</span>
                <span className="font-medium">3</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}