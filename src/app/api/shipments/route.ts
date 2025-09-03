import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserRole, ShipmentStatus, ShipmentType } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(auth)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const driverId = searchParams.get('driverId')
    const customerId = searchParams.get('customerId')

    const where: any = {}
    
    if (status) where.status = status
    if (driverId) where.driverId = driverId
    if (customerId && session.user.role === UserRole.CUSTOMER) {
      // Customers can only see their own shipments
      where.order = { customerId: session.user.id }
    }

    const shipments = await db.shipment.findMany({
      where,
      include: {
        order: {
          select: { id: true, orderNumber: true, customer: { select: { id: true, name: true, email: true } } }
        },
        vehicle: {
          select: { id: true, licensePlate: true, make: true, model: true }
        },
        driver: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            inventory: {
              select: { id: true, name: true, sku: true }
            }
          }
        },
        tracking: {
          orderBy: { timestamp: 'desc' },
          take: 1
        },
        proofOfDelivery: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(shipments)
  } catch (error) {
    console.error('Error fetching shipments:', error)
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
    const { origin, destination, type, weight, dimensions, items, notes } = body

    // Generate tracking number
    const trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Calculate cost (simplified calculation)
    const baseCost = 10
    const weightCost = weight ? parseFloat(weight) * 0.5 : 0
    const distanceCost = 20 // Simplified distance cost
    const totalCost = baseCost + weightCost + distanceCost

    const shipment = await db.shipment.create({
      data: {
        trackingNumber,
        origin,
        destination,
        status: ShipmentStatus.PENDING,
        type: type || ShipmentType.STANDARD,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        cost: totalCost,
        notes,
        // If customer is creating, associate with their account
        ...(session.user.role === UserRole.CUSTOMER && {
          order: {
            create: {
              orderNumber: `ORD${Date.now()}`,
              customerId: session.user.id,
              warehouseId: 'default', // This should be determined based on location
              totalAmount: totalCost,
              status: 'PENDING'
            }
          }
        })
      },
      include: {
        order: {
          include: {
            customer: { select: { id: true, name: true, email: true } }
          }
        },
        vehicle: {
          select: { id: true, licensePlate: true, make: true, model: true }
        },
        driver: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(shipment, { status: 201 })
  } catch (error) {
    console.error('Error creating shipment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}