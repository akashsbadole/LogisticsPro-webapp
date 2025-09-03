'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  DollarSign,
  Smartphone,
  Building,
  CheckCircle,
  AlertTriangle,
  Shield,
  Lock,
  Calendar,
  User
} from 'lucide-react'

interface PaymentFormData {
  invoiceId: string
  amount: string
  method: string
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  cardholderName?: string
  bankAccount?: string
  routingNumber?: string
  upiId?: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  totalAmount: number
  status: string
  customer: {
    name: string
    email: string
  }
}

export default function PaymentProcessing() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [formData, setFormData] = useState<PaymentFormData>({
    invoiceId: '',
    amount: '',
    method: 'CREDIT_CARD',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    bankAccount: '',
    routingNumber: '',
    upiId: ''
  })

  useEffect(() => {
    fetchUnpaidInvoices()
  }, [])

  const fetchUnpaidInvoices = async () => {
    try {
      const response = await fetch('/api/invoices?status=SENT&status=OVERDUE')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }

  const handleInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setFormData(prev => ({
      ...prev,
      invoiceId: invoice.id,
      amount: invoice.totalAmount.toString()
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setPaymentError('')
    setPaymentSuccess(false)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      const response = await fetch(`/api/invoices/${formData.invoiceId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          method: formData.method,
          transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
        })
      })

      if (response.ok) {
        setPaymentSuccess(true)
        await fetchUnpaidInvoices()
        setSelectedInvoice(null)
        resetForm()
      } else {
        const errorData = await response.json()
        setPaymentError(errorData.error || 'Payment processing failed')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      setPaymentError('An error occurred while processing your payment')
    } finally {
      setProcessing(false)
    }
  }

  const resetForm = () => {
    setFormData({
      invoiceId: '',
      amount: '',
      method: 'CREDIT_CARD',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      bankAccount: '',
      routingNumber: '',
      upiId: ''
    })
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD': return <CreditCard className="h-5 w-5" />
      case 'DEBIT_CARD': return <CreditCard className="h-5 w-5" />
      case 'BANK_TRANSFER': return <Building className="h-5 w-5" />
      case 'UPI': return <Smartphone className="h-5 w-5" />
      case 'CASH': return <DollarSign className="h-5 w-5" />
      default: return <CreditCard className="h-5 w-5" />
    }
  }

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD': return 'Credit Card'
      case 'DEBIT_CARD': return 'Debit Card'
      case 'BANK_TRANSFER': return 'Bank Transfer'
      case 'UPI': return 'UPI Payment'
      case 'CASH': return 'Cash'
      default: return 'Other'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Processing</h2>
        <p className="text-gray-600">Secure payment processing for invoices and bills</p>
      </div>

      {/* Security Notice */}
      <Alert className="border-green-200 bg-green-50">
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-green-800">
          <div className="flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            All payments are processed securely with 256-bit SSL encryption. Your payment information is never stored on our servers.
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Invoice</CardTitle>
              <CardDescription>
                Choose an invoice to pay
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No unpaid invoices found</p>
                  </div>
                ) : (
                  invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedInvoice?.id === invoice.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInvoiceSelect(invoice)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{invoice.invoiceNumber}</div>
                          <div className="text-xs text-gray-500">{invoice.customer.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-sm">${invoice.totalAmount.toFixed(2)}</div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              invoice.status === 'OVERDUE' 
                                ? 'border-red-200 text-red-800 bg-red-50'
                                : 'border-yellow-200 text-yellow-800 bg-yellow-50'
                            }`}
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Enter your payment information securely
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Payment Successful!</h3>
                  <p className="text-gray-600 mb-4">
                    Your payment has been processed successfully. A confirmation email has been sent.
                  </p>
                  <Button onClick={() => setPaymentSuccess(false)}>
                    Process Another Payment
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {paymentError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-red-800">
                        {paymentError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Invoice Info */}
                  {selectedInvoice && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Invoice: {selectedInvoice.invoiceNumber}</div>
                          <div className="text-sm text-gray-600">{selectedInvoice.customer.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">${selectedInvoice.totalAmount.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
                    <Select 
                      value={formData.method} 
                      onValueChange={(value) => setFormData({...formData, method: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CREDIT_CARD">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Credit Card
                          </div>
                        </SelectItem>
                        <SelectItem value="DEBIT_CARD">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Debit Card
                          </div>
                        </SelectItem>
                        <SelectItem value="BANK_TRANSFER">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            Bank Transfer
                          </div>
                        </SelectItem>
                        <SelectItem value="UPI">
                          <div className="flex items-center">
                            <Smartphone className="h-4 w-4 mr-2" />
                            UPI Payment
                          </div>
                        </SelectItem>
                        <SelectItem value="CASH">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Cash
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Method Specific Fields */}
                  {(formData.method === 'CREDIT_CARD' || formData.method === 'DEBIT_CARD') && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cardholderName">Cardholder Name</Label>
                        <Input
                          id="cardholderName"
                          placeholder="John Doe"
                          value={formData.cardholderName}
                          onChange={(e) => setFormData({...formData, cardholderName: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {formData.method === 'BANK_TRANSFER' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bankAccount">Bank Account Number</Label>
                        <Input
                          id="bankAccount"
                          placeholder="1234567890"
                          value={formData.bankAccount}
                          onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="routingNumber">Routing Number</Label>
                        <Input
                          id="routingNumber"
                          placeholder="021000021"
                          value={formData.routingNumber}
                          onChange={(e) => setFormData({...formData, routingNumber: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {formData.method === 'UPI' && (
                    <div>
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        placeholder="yourname@upi"
                        value={formData.upiId}
                        onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                        required
                      />
                    </div>
                  )}

                  {/* Amount */}
                  <div>
                    <Label htmlFor="amount">Payment Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={processing || !selectedInvoice}
                  >
                    {processing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {getPaymentMethodIcon(formData.method)}
                        <span className="ml-2">
                          Pay ${formData.amount} with {getPaymentMethodName(formData.method)}
                        </span>
                      </div>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}