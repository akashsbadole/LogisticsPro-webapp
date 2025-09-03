import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserRole, VehicleStatus, VehicleType } from '@prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(auth)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const vehicles = await db.vehicle.findMany({
      include: {
        driver: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { shipments: true, maintenance: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(vehicles)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(auth)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { licensePlate, make, model, year, type, capacity, driverId } = body

    // Check if license plate already exists
    const existingVehicle = await db.vehicle.findUnique({
      where: { licensePlate }
    })

    if (existingVehicle) {
      return NextResponse.json({ error: 'License plate already exists' }, { status: 400 })
    }

    const vehicle = await db.vehicle.create({
      data: {
        licensePlate,
        make,
        model,
        year: year ? parseInt(year) : null,
        type: type as VehicleType,
        capacity: parseFloat(capacity),
        driverId
      },
      include: {
        driver: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}