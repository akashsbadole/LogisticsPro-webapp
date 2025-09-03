import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserRole, OrderStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(auth)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')

    const where: any = {}
    
    if (status) where.status = status
    if (customerId && session.user.role === UserRole.CUSTOMER) {
      // Customers can only see their own orders
      where.customerId = session.user.id
    }

    const orders = await db.order.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        },
        warehouse: {
          select: { id: true, name: true, code: true }
        },
        items: {
          include: {
            inventory: {
              select: { id: true, name: true, sku: true, price: true }
            }
          }
        },
        shipments: {
          select: { id: true, trackingNumber: true, status: true }
        },
        invoices: {
          select: { id: true, invoiceNumber: true, status: true, totalAmount: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(auth)
    
    if (!session || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.CUSTOMER)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { warehouseId, items, notes } = body

    // Calculate total amount
    let totalAmount = 0
    for (const item of items) {
      const inventoryItem = await db.inventory.findUnique({
        where: { id: item.inventoryId }
      })
      if (inventoryItem) {
        totalAmount += inventoryItem.price * item.quantity
      }
    }

    // Generate order number
    const orderNumber = `ORD${Date.now()}`

    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: session.user.id,
        warehouseId,
        totalAmount,
        notes,
        items: {
          create: items.map((item: any) => ({
            inventoryId: item.inventoryId,
            quantity: item.quantity,
            price: item.price || 0
          }))
        }
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        },
        warehouse: {
          select: { id: true, name: true, code: true }
        },
        items: {
          include: {
            inventory: {
              select: { id: true, name: true, sku: true, price: true }
            }
          }
        }
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}