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

    // Get basic counts
    const [
      totalShipments,
      activeVehicles,
      totalWarehouses,
      totalInventory,
      totalRevenue,
      recentShipments
    ] = await Promise.all([
      db.shipment.count(),
      db.vehicle.count({ where: { status: 'AVAILABLE' } }),
      db.warehouse.count(),
      db.inventory.count(),
      db.invoice.aggregate({ _sum: { totalAmount: true }, where: { status: 'PAID' } }),
      db.shipment.findMany({
        take: 5,
        include: {
          driver: { select: { name: true } },
          order: {
            include: {
              customer: { select: { name: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    // Calculate warehouse capacity
    const warehouses = await db.warehouse.findMany({
      include: {
        _count: {
          select: { inventory: true }
        }
      }
    })

    const totalCapacity = warehouses.reduce((sum, wh) => sum + wh.capacity, 0)
    const usedCapacity = warehouses.reduce((sum, wh) => sum + wh._count.inventory, 0)
    const capacityUtilization = totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0

    const stats = {
      totalShipments,
      activeVehicles,
      totalWarehouses,
      totalInventory,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      warehouseCapacity: `${capacityUtilization}%`,
      recentShipments: recentShipments.map(shipment => ({
        id: shipment.trackingNumber,
        destination: shipment.destination,
        status: shipment.status,
        driver: shipment.driver?.name || 'Unassigned',
        eta: shipment.estimatedDelivery ? '2 hours' : 'Pending'
      }))
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}