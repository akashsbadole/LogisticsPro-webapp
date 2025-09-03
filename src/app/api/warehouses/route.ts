import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(auth)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const warehouses = await db.warehouse.findMany({
      include: {
        manager: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { inventory: true, zones: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(warehouses)
  } catch (error) {
    console.error('Error fetching warehouses:', error)
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
    const { name, code, address, city, state, country, postalCode, phone, email, capacity, managerId } = body

    const warehouse = await db.warehouse.create({
      data: {
        name,
        code,
        address,
        city,
        state,
        country,
        postalCode,
        phone,
        email,
        capacity: parseInt(capacity),
        managerId
      },
      include: {
        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(warehouse, { status: 201 })
  } catch (error) {
    console.error('Error creating warehouse:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}