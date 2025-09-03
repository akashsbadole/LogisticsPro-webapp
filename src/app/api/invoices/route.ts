import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole, InvoiceStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");

    const where: any = {};

    if (status) where.status = status;
    if (customerId && session.user.role === UserRole.CUSTOMER) {
      // Customers can only see their own invoices
      where.customerId = session.user.id;
    }

    const invoices = await db.invoice.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        order: {
          select: { id: true, orderNumber: true },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            paidAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, customerId, amount, tax, dueDate } = body;

    // Generate invoice number
    const invoiceNumber = `INV${Date.now()}`;

    const taxAmount = tax || 0;
    const totalAmount = amount + taxAmount;

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        orderId,
        customerId,
        amount: parseFloat(amount),
        tax: parseFloat(taxAmount),
        totalAmount,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: InvoiceStatus.DRAFT,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        order: {
          select: { id: true, orderNumber: true },
        },
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
