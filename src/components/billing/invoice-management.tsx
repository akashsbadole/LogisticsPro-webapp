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
  FileText, 
  DollarSign,
  Calendar,
  User,
  CreditCard,
  Download,
  Send,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Receipt
} from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  tax: number
  totalAmount: number
  status: string
  dueDate?: string
  paidAt?: string
  createdAt: string
  customer: {
    id: string
    name: string
    email: string
  }
  order?: {
    id: string
    orderNumber: string
  }
  payments: Array<{
    id: string
    amount: number
    method: string
    status: string
    paidAt?: string
  }>
}

interface InvoiceFormData {
  orderId?: string
  customerId: string
  amount: string
  tax: string
  dueDate?: string
}

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [formData, setFormData] = useState<InvoiceFormData>({
    orderId: '',
    customerId: '',
    amount: '',
    tax: '',
    dueDate: ''
  })

  useEffect(() => {
    fetchInvoices()
    fetchOrders()
    fetchCustomers()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          tax: parseFloat(formData.tax)
        })
      })

      if (response.ok) {
        await fetchInvoices()
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      orderId: '',
      customerId: '',
      amount: '',
      tax: '',
      dueDate: ''
    })
  }

  const handlePayment = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: invoices.find(inv => inv.id === invoiceId)?.totalAmount,
          method: 'CREDIT_CARD'
        })
      })

      if (response.ok) {
        await fetchInvoices()
      }
    } catch (error) {
      console.error('Error processing payment:', error)
    }
  }

  const downloadInvoice = (invoice: Invoice) => {
    // Generate PDF content (simplified for demo)
    const invoiceContent = `
INVOICE #${invoice.invoiceNumber}
================================
Date: ${new Date(invoice.createdAt).toLocaleDateString()}
Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}

Bill To:
${invoice.customer.name}
${invoice.customer.email}

Description:
${invoice.order ? `Order: ${invoice.order.orderNumber}` : 'Custom Invoice'}

Amount: $${invoice.amount.toFixed(2)}
Tax: $${invoice.tax.toFixed(2)}
Total: $${invoice.totalAmount.toFixed(2)}

Status: ${invoice.status}
    `

    const blob = new Blob([invoiceContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoice.invoiceNumber}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invoice.order && invoice.order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'SENT': return 'bg-blue-100 text-blue-800'
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="h-4 w-4" />
      case 'OVERDUE': return <AlertTriangle className="h-4 w-4" />
      case 'SENT': return <Send className="h-4 w-4" />
      case 'DRAFT': return <FileText className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getInvoiceStats = () => {
    const total = invoices.length
    const paid = invoices.filter(inv => inv.status === 'PAID').length
    const overdue = invoices.filter(inv => inv.status === 'OVERDUE').length
    const pending = invoices.filter(inv => inv.status === 'SENT' || inv.status === 'DRAFT').length
    const totalRevenue = invoices.reduce((sum, inv) => inv.status === 'PAID' ? sum + inv.totalAmount : sum, 0)
    
    return { total, paid, overdue, pending, totalRevenue }
  }

  const stats = getInvoiceStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoice Management</h2>
          <p className="text-gray-600">Create, manage, and process invoices and payments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Generate a new invoice for orders or custom billing
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={formData.customerId} onValueChange={(value) => setFormData({...formData, customerId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} ({customer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="order">Order (Optional)</Label>
                  <Select value={formData.orderId || ''} onValueChange={(value) => setFormData({...formData, orderId: value || undefined})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Custom Invoice</SelectItem>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.orderNumber} - ${order.totalAmount.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tax">Tax</Label>
                  <Input
                    id="tax"
                    type="number"
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) => setFormData({...formData, tax: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Invoice</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Paid
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Overdue
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search invoices..."
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
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>
            Manage invoices, process payments, and track billing status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Receipt className="h-4 w-4 mr-2 text-blue-600" />
                        {invoice.invoiceNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <div className="font-medium">{invoice.customer.name}</div>
                          <div className="text-sm text-gray-500">{invoice.customer.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {invoice.order ? (
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {invoice.order.orderNumber}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Custom</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">${invoice.totalAmount.toFixed(2)}</div>
                        <div className="text-gray-500">
                          ${invoice.amount.toFixed(2)} + ${invoice.tax.toFixed(2)} tax
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        <div className="flex items-center">
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1">{invoice.status}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {invoice.dueDate ? (
                          new Date(invoice.dueDate).toLocaleDateString()
                        ) : (
                          <span className="text-gray-400">No due date</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadInvoice(invoice)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        {invoice.status !== 'PAID' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handlePayment(invoice.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
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

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Details - {selectedInvoice.invoiceNumber}</DialogTitle>
              <DialogDescription>
                Complete invoice information and payment history
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Invoice Number</Label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={getStatusColor(selectedInvoice.status)}>
                    {selectedInvoice.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created Date</Label>
                  <p className="text-sm">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Due Date</Label>
                  <p className="text-sm">
                    {selectedInvoice.dueDate 
                      ? new Date(selectedInvoice.dueDate).toLocaleDateString()
                      : 'No due date'
                    }
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <Label className="text-sm font-medium text-gray-600 mb-2 block">Bill To</Label>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium">{selectedInvoice.customer.name}</div>
                  <div className="text-sm text-gray-600">{selectedInvoice.customer.email}</div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Subtotal</Label>
                  <p className="text-lg font-medium">${selectedInvoice.amount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tax</Label>
                  <p className="text-lg font-medium">${selectedInvoice.tax.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Total</Label>
                  <p className="text-lg font-bold text-green-600">${selectedInvoice.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              {/* Payment History */}
              {selectedInvoice.payments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">Payment History</Label>
                  <div className="space-y-2">
                    {selectedInvoice.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-green-50 rounded">
                        <div>
                          <div className="font-medium text-sm">${payment.amount.toFixed(2)}</div>
                          <div className="text-xs text-gray-600">{payment.method}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'Pending'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => downloadInvoice(selectedInvoice)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {selectedInvoice.status !== 'PAID' && (
                  <Button onClick={() => handlePayment(selectedInvoice.id)}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Process Payment
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-500 mb-4">Create your first invoice to get started</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      )}
    </div>
  )
}