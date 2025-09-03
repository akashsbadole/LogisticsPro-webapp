'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Package,
  Truck,
  DollarSign,
  Users,
  Building,
  Clock,
  CheckCircle,
  AlertTriangle,
  Mail,
  Printer,
  Share2,
  Settings
} from 'lucide-react'

interface ReportConfig {
  type: string
  title: string
  description: string
  icon: React.ReactNode
  fields: Array<{
    name: string
    label: string
    type: 'select' | 'date' | 'text' | 'textarea'
    options?: string[]
    required: boolean
  }>
}

interface GeneratedReport {
  id: string
  name: string
  type: string
  generatedAt: string
  status: 'generating' | 'completed' | 'failed'
  downloadUrl?: string
}

export default function ReportsGeneration() {
  const [reports, setReports] = useState<ReportConfig[]>([
    {
      type: 'shipment_summary',
      title: 'Shipment Summary Report',
      description: 'Comprehensive overview of all shipments within a date range',
      icon: <Package className="h-5 w-5" />,
      fields: [
        { name: 'dateRange', label: 'Date Range', type: 'date', required: true },
        { name: 'status', label: 'Filter by Status', type: 'select', options: ['All', 'Delivered', 'In Transit', 'Pending', 'Delayed'], required: false },
        { name: 'warehouse', label: 'Warehouse', type: 'select', options: ['All', 'Main Warehouse', 'East Warehouse', 'West Warehouse'], required: false }
      ]
    },
    {
      type: 'financial_report',
      title: 'Financial Report',
      description: 'Revenue, expenses, and profit analysis',
      icon: <DollarSign className="h-5 w-5" />,
      fields: [
        { name: 'period', label: 'Reporting Period', type: 'select', options: ['Monthly', 'Quarterly', 'Yearly'], required: true },
        { name: 'year', label: 'Year', type: 'text', required: true },
        { name: 'include_expenses', label: 'Include Expenses', type: 'select', options: ['Yes', 'No'], required: false }
      ]
    },
    {
      type: 'inventory_report',
      title: 'Inventory Analysis',
      description: 'Stock levels, turnover rates, and valuation',
      icon: <Building className="h-5 w-5" />,
      fields: [
        { name: 'warehouse', label: 'Warehouse', type: 'select', options: ['All', 'Main Warehouse', 'East Warehouse', 'West Warehouse'], required: true },
        { name: 'category', label: 'Product Category', type: 'select', options: ['All', 'Electronics', 'Clothing', 'Books', 'Other'], required: false },
        { name: 'include_low_stock', label: 'Include Low Stock Items', type: 'select', options: ['Yes', 'No'], required: false }
      ]
    },
    {
      type: 'performance_report',
      title: 'Performance Metrics',
      description: 'Driver performance, on-time delivery rates, and efficiency',
      icon: <TrendingUp className="h-5 w-5" />,
      fields: [
        { name: 'dateRange', label: 'Date Range', type: 'date', required: true },
        { name: 'metric_type', label: 'Metric Type', type: 'select', options: ['All', 'On-time Delivery', 'Customer Satisfaction', 'Efficiency'], required: false },
        { name: 'driver', label: 'Specific Driver', type: 'select', options: ['All', 'John Doe', 'Jane Smith', 'Mike Johnson'], required: false }
      ]
    },
    {
      type: 'customer_report',
      title: 'Customer Analytics',
      description: 'Customer behavior, order patterns, and satisfaction',
      icon: <Users className="h-5 w-5" />,
      fields: [
        { name: 'dateRange', label: 'Date Range', type: 'date', required: true },
        { name: 'customer_type', label: 'Customer Type', type: 'select', options: ['All', 'Business', 'Individual'], required: false },
        { name: 'include_feedback', label: 'Include Feedback', type: 'select', options: ['Yes', 'No'], required: false }
      ]
    },
    {
      type: 'fleet_report',
      title: 'Fleet Utilization',
      description: 'Vehicle usage, maintenance schedules, and cost analysis',
      icon: <Truck className="h-5 w-5" />,
      fields: [
        { name: 'dateRange', label: 'Date Range', type: 'date', required: true },
        { name: 'vehicle_type', label: 'Vehicle Type', type: 'select', options: ['All', 'Truck', 'Van', 'Motorcycle'], required: false },
        { name: 'include_maintenance', label: 'Include Maintenance Data', type: 'select', options: ['Yes', 'No'], required: false }
      ]
    }
  ])

  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([])
  const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  })

  useEffect(() => {
    // Load previously generated reports
    const savedReports = localStorage.getItem('generatedReports')
    if (savedReports) {
      setGeneratedReports(JSON.parse(savedReports))
    }
  }, [])

  const handleReportSelect = (report: ReportConfig) => {
    setSelectedReport(report)
    setFormData({})
    setDateRange({ from: undefined, to: undefined })
    setIsDialogOpen(true)
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const generateReport = async () => {
    if (!selectedReport) return

    const newReport: GeneratedReport = {
      id: Date.now().toString(),
      name: selectedReport.title,
      type: selectedReport.type,
      generatedAt: new Date().toISOString(),
      status: 'generating'
    }

    setGeneratedReports(prev => [...prev, newReport])
    localStorage.setItem('generatedReports', JSON.stringify([...generatedReports, newReport]))
    setIsDialogOpen(false)

    // Simulate report generation
    setTimeout(() => {
      setGeneratedReports(prev => 
        prev.map(report => 
          report.id === newReport.id 
            ? { ...report, status: 'completed', downloadUrl: `/reports/${report.id}.pdf` }
            : report
        )
      )
      localStorage.setItem('generatedReports', JSON.stringify(
        generatedReports.map(report => 
          report.id === newReport.id 
            ? { ...report, status: 'completed', downloadUrl: `/reports/${report.id}.pdf` }
            : report
        )
      ))
    }, 3000)
  }

  const downloadReport = (report: GeneratedReport) => {
    // Simulate download
    const link = document.createElement('a')
    link.href = report.downloadUrl || '#'
    link.download = `${report.name.replace(/\s+/g, '_')}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const deleteReport = (reportId: string) => {
    setGeneratedReports(prev => prev.filter(report => report.id !== reportId))
    localStorage.setItem('generatedReports', JSON.stringify(generatedReports.filter(report => report.id !== reportId)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generating': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generating': return <Clock className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <AlertTriangle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Generate comprehensive reports and export business data</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Email Reports
          </Button>
        </div>
      </div>

      {/* Report Templates */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <Card key={report.type} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-blue-600 mr-3">{report.icon}</div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </div>
                  <Badge variant="outline">New</Badge>
                </div>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Fields:</span> {report.fields.length} required
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleReportSelect(report)}
                  >
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Generated Reports */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Generated Reports</h3>
        {generatedReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports generated yet</h3>
              <p className="text-gray-500 mb-4">Generate your first report to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {generatedReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-blue-600">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <p className="text-sm text-gray-500">
                          Generated on {new Date(report.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(report.status)}>
                        <div className="flex items-center">
                          {getStatusIcon(report.status)}
                          <span className="ml-1">{report.status}</span>
                        </div>
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      {report.status === 'completed' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => downloadReport(report)}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                          <Button variant="outline" size="sm">
                            <Printer className="h-4 w-4 mr-1" />
                            Print
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteReport(report.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Report Generation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate {selectedReport?.title}</DialogTitle>
            <DialogDescription>
              Configure the report parameters and generate your custom report
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              {selectedReport.fields.map((field) => (
                <div key={field.name}>
                  <Label htmlFor={field.name}>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  {field.type === 'select' && (
                    <Select 
                      value={formData[field.name] || ''} 
                      onValueChange={(value) => handleFieldChange(field.name, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {field.type === 'date' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm text-gray-600">From Date</Label>
                        <Input
                          type="date"
                          value={formData[`${field.name}_from`] || ''}
                          onChange={(e) => handleFieldChange(`${field.name}_from`, e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">To Date</Label>
                        <Input
                          type="date"
                          value={formData[`${field.name}_to`] || ''}
                          onChange={(e) => handleFieldChange(`${field.name}_to`, e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                  {field.type === 'text' && (
                    <Input
                      type="text"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                  {field.type === 'textarea' && (
                    <Textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      rows={3}
                    />
                  )}
                </div>
              ))}
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={generateReport}>
                  Generate Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}