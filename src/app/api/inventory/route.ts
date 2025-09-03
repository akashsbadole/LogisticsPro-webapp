import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(auth)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const warehouseId = searchParams.get('warehouseId')
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    const where: any = {}
    
    if (warehouseId) where.warehouseId = warehouseId
    if (category) where.category = category
    if (status) where.status = status

    const inventory = await db.inventory.findMany({
      where,
      include: {
        warehouse: {
          select: { id: true, name: true, code: true }
        },
        zone: {
          select: { id: true, name: true, code: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(auth)
    
    if (!session || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.WAREHOUSE_MANAGER)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sku, name, description, category, quantity, unit, price, weight, dimensions, barcode, qrCode, batchNumber, expiryDate, warehouseId, zoneId } = body

    // Check if SKU already exists
    const existingItem = await db.inventory.findUnique({
      where: { sku }
    })

    if (existingItem) {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 400 })
    }

    const inventoryItem = await db.inventory.create({
      data: {
        sku,
        name,
        description,
        category,
        quantity: parseInt(quantity),
        unit,
        price: parseFloat(price),
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        barcode,
        qrCode,
        batchNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        warehouseId,
        zoneId
      },
      include: {
        warehouse: {
          select: { id: true, name: true, code: true }
        },
        zone: {
          select: { id: true, name: true, code: true }
        }
      }
    })

    return NextResponse.json(inventoryItem, { status: 201 })
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}