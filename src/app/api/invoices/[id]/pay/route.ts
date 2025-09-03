import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { PaymentStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(auth)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, method, transactionId } = body

    // Get the invoice
    const invoice = await db.invoice.findUnique({
      where: { id: params.id },
      include: { payments: true }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Check if invoice is already paid
    if (invoice.status === 'PAID') {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 })
    }

    // Calculate total paid amount
    const totalPaid = invoice.payments
      .filter(payment => payment.status === 'COMPLETED')
      .reduce((sum, payment) => sum + payment.amount, 0)

    const newTotalPaid = totalPaid + amount

    // Create payment record
    const payment = await db.payment.create({
      data: {
        invoiceId: params.id,
        amount,
        method,
        transactionId,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date()
      }
    })

    // Update invoice status
    let newStatus = invoice.status
    if (newTotalPaid >= invoice.totalAmount) {
      newStatus = 'PAID'
    } else if (newTotalPaid > 0) {
      newStatus = 'SENT' // Partial payment
    }

    await db.invoice.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        paidAt: newStatus === 'PAID' ? new Date() : null
      }
    })

    return NextResponse.json({
      payment,
      invoiceStatus: newStatus,
      totalPaid: newTotalPaid
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}