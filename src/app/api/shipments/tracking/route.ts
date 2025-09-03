import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(auth)
    
    if (!session || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.DRIVER)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { shipmentId, location, latitude, longitude, status, notes } = body

    const tracking = await db.shipmentTracking.create({
      data: {
        shipmentId,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        status,
        notes
      }
    })

    // Update shipment status if needed
    await db.shipment.update({
      where: { id: shipmentId },
      data: { status }
    })

    return NextResponse.json(tracking, { status: 201 })
  } catch (error) {
    console.error('Error creating shipment tracking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}