import {
  PrismaClient,
  UserRole,
  UserStatus,
  VehicleType,
  VehicleStatus,
  WarehouseStatus,
  InventoryStatus,
  OrderStatus,
  ShipmentStatus,
  ShipmentType,
  InvoiceStatus,
  PaymentStatus,
  User,
  Warehouse,
  WarehouseZone,
  Inventory,
  Vehicle,
  Order,
  Shipment,
  Invoice,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo users
  const users = [
    {
      email: "admin@logistics.com",
      name: "Admin User",
      password: await bcrypt.hash("admin123", 12),
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      phone: "+1-555-0100",
    },
    {
      email: "manager@logistics.com",
      name: "John Manager",
      password: await bcrypt.hash("manager123", 12),
      role: UserRole.WAREHOUSE_MANAGER,
      status: UserStatus.ACTIVE,
      phone: "+1-555-0101",
    },
    {
      email: "manager2@logistics.com",
      name: "Sarah Wilson",
      password: await bcrypt.hash("manager123", 12),
      role: UserRole.WAREHOUSE_MANAGER,
      status: UserStatus.ACTIVE,
      phone: "+1-555-0102",
    },
    {
      email: "driver1@logistics.com",
      name: "Mike Driver",
      password: await bcrypt.hash("driver123", 12),
      role: UserRole.DRIVER,
      status: UserStatus.ACTIVE,
      phone: "+1-555-0201",
    },
    {
      email: "driver2@logistics.com",
      name: "Lisa Rodriguez",
      password: await bcrypt.hash("driver123", 12),
      role: UserRole.DRIVER,
      status: UserStatus.ACTIVE,
      phone: "+1-555-0202",
    },
    {
      email: "driver3@logistics.com",
      name: "Tom Johnson",
      password: await bcrypt.hash("driver123", 12),
      role: UserRole.DRIVER,
      status: UserStatus.ACTIVE,
      phone: "+1-555-0203",
    },
    {
      email: "customer1@example.com",
      name: "Alice Cooper",
      password: await bcrypt.hash("customer123", 12),
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      phone: "+1-555-0301",
    },
    {
      email: "customer2@example.com",
      name: "Bob Smith",
      password: await bcrypt.hash("customer123", 12),
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      phone: "+1-555-0302",
    },
    {
      email: "customer3@example.com",
      name: "Carol Davis",
      password: await bcrypt.hash("customer123", 12),
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      phone: "+1-555-0303",
    },
    {
      email: "partner1@company.com",
      name: "David Partner",
      password: await bcrypt.hash("partner123", 12),
      role: UserRole.PARTNER,
      status: UserStatus.ACTIVE,
      phone: "+1-555-0401",
    },
  ];

  const createdUsers: User[] = [];
  for (const user of users) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
    createdUsers.push(createdUser);
  }

  // Create demo warehouses
  const warehouses = [
    {
      name: "Main Distribution Center",
      code: "WH001",
      address: "123 Logistics Street",
      city: "New York",
      state: "NY",
      country: "USA",
      postalCode: "10001",
      phone: "+1-555-0123",
      email: "warehouse@logistics.com",
      capacity: 10000,
      status: WarehouseStatus.ACTIVE,
      managerId: createdUsers.find((u) => u.email === "manager@logistics.com")
        ?.id,
    },
    {
      name: "West Coast Hub",
      code: "WH002",
      address: "456 Shipping Avenue",
      city: "Los Angeles",
      state: "CA",
      country: "USA",
      postalCode: "90210",
      phone: "+1-555-0124",
      email: "westcoast@logistics.com",
      capacity: 8000,
      status: WarehouseStatus.ACTIVE,
      managerId: createdUsers.find((u) => u.email === "manager2@logistics.com")
        ?.id,
    },
    {
      name: "Midwest Storage",
      code: "WH003",
      address: "789 Central Blvd",
      city: "Chicago",
      state: "IL",
      country: "USA",
      postalCode: "60601",
      phone: "+1-555-0125",
      email: "midwest@logistics.com",
      capacity: 6000,
      status: WarehouseStatus.MAINTENANCE,
    },
  ];

  const createdWarehouses: Warehouse[] = [];
  for (const warehouse of warehouses) {
    const createdWarehouse = await prisma.warehouse.upsert({
      where: { code: warehouse.code },
      update: warehouse,
      create: warehouse,
    });
    createdWarehouses.push(createdWarehouse);
  }

  // Create warehouse zones
  const warehouseZones = [
    {
      name: "Electronics Zone",
      code: "A1",
      warehouseId: createdWarehouses[0].id,
      capacity: 2000,
    },
    {
      name: "Clothing Zone",
      code: "B1",
      warehouseId: createdWarehouses[0].id,
      capacity: 3000,
    },
    {
      name: "General Storage",
      code: "C1",
      warehouseId: createdWarehouses[0].id,
      capacity: 5000,
    },
    {
      name: "Temperature Controlled",
      code: "A1",
      warehouseId: createdWarehouses[1].id,
      capacity: 2500,
    },
  ];

  const createdZones: WarehouseZone[] = [];
  for (const zone of warehouseZones) {
    const createdZone = await prisma.warehouseZone.create({
      data: zone,
    });
    createdZones.push(createdZone);
  }

  // Create demo inventory items
  const inventoryItems = [
    {
      sku: "ELEC001",
      name: "Electronics Package",
      description: "High-value electronics items",
      category: "Electronics",
      quantity: 100,
      unit: "pcs",
      price: 299.99,
      weight: 2.5,
      dimensions: '{"length": 30, "width": 20, "height": 15}',
      barcode: "1234567890123",
      status: InventoryStatus.AVAILABLE,
      warehouseId: createdWarehouses[0].id,
      zoneId: createdZones[0].id,
    },
    {
      sku: "CLOT001",
      name: "Clothing Box",
      description: "Mixed clothing items",
      category: "Clothing",
      quantity: 250,
      unit: "pcs",
      price: 49.99,
      weight: 1.2,
      dimensions: '{"length": 40, "width": 30, "height": 10}',
      barcode: "2345678901234",
      status: InventoryStatus.AVAILABLE,
      warehouseId: createdWarehouses[0].id,
      zoneId: createdZones[1].id,
    },
    {
      sku: "BOOK001",
      name: "Books Package",
      description: "Educational and fiction books",
      category: "Books",
      quantity: 500,
      unit: "pcs",
      price: 19.99,
      weight: 0.8,
      dimensions: '{"length": 25, "width": 20, "height": 5}',
      barcode: "3456789012345",
      status: InventoryStatus.AVAILABLE,
      warehouseId: createdWarehouses[0].id,
      zoneId: createdZones[2].id,
    },
    {
      sku: "HOME001",
      name: "Home Goods Set",
      description: "Kitchen and bathroom essentials",
      category: "Home & Garden",
      quantity: 75,
      unit: "sets",
      price: 89.99,
      weight: 3.2,
      dimensions: '{"length": 35, "width": 25, "height": 20}',
      barcode: "4567890123456",
      status: InventoryStatus.AVAILABLE,
      warehouseId: createdWarehouses[1].id,
      zoneId: createdZones[3].id,
    },
    {
      sku: "TOYS001",
      name: "Children's Toy Box",
      description: "Assorted children's toys",
      category: "Toys",
      quantity: 150,
      unit: "boxes",
      price: 34.99,
      weight: 1.8,
      dimensions: '{"length": 30, "width": 25, "height": 15}',
      barcode: "5678901234567",
      status: InventoryStatus.RESERVED,
      warehouseId: createdWarehouses[0].id,
      zoneId: createdZones[2].id,
    },
  ];

  const createdInventory: Inventory[] = [];
  for (const item of inventoryItems) {
    const createdItem = await prisma.inventory.upsert({
      where: { sku: item.sku },
      update: item,
      create: item,
    });
    createdInventory.push(createdItem);
  }

  // Create demo vehicles
  const vehicles = [
    {
      licensePlate: "TRK001",
      make: "Ford",
      model: "F-150",
      year: 2022,
      type: VehicleType.TRUCK,
      capacity: 1000,
      status: VehicleStatus.AVAILABLE,
      driverId: createdUsers.find((u) => u.email === "driver1@logistics.com")
        ?.id,
    },
    {
      licensePlate: "VAN001",
      make: "Mercedes",
      model: "Sprinter",
      year: 2021,
      type: VehicleType.VAN,
      capacity: 500,
      status: VehicleStatus.IN_TRANSIT,
      driverId: createdUsers.find((u) => u.email === "driver2@logistics.com")
        ?.id,
    },
    {
      licensePlate: "BIKE001",
      make: "Honda",
      model: "CBR",
      year: 2023,
      type: VehicleType.MOTORCYCLE,
      capacity: 50,
      status: VehicleStatus.AVAILABLE,
      driverId: createdUsers.find((u) => u.email === "driver3@logistics.com")
        ?.id,
    },
    {
      licensePlate: "TRK002",
      make: "Volvo",
      model: "FH16",
      year: 2020,
      type: VehicleType.TRUCK,
      capacity: 2000,
      status: VehicleStatus.MAINTENANCE,
    },
  ];

  const createdVehicles: Vehicle[] = [];
  for (const vehicle of vehicles) {
    const createdVehicle = await prisma.vehicle.upsert({
      where: { licensePlate: vehicle.licensePlate },
      update: vehicle,
      create: vehicle,
    });
    createdVehicles.push(createdVehicle);
  }

  // Create maintenance records
  const maintenanceRecords = [
    {
      vehicleId: createdVehicles.find((v) => v.licensePlate === "TRK002")?.id!,
      type: "Oil Change",
      description: "Regular oil change and filter replacement",
      cost: 150.0,
      date: new Date("2024-08-15"),
      status: "COMPLETED",
    },
    {
      vehicleId: createdVehicles.find((v) => v.licensePlate === "VAN001")?.id!,
      type: "Tire Replacement",
      description: "Replace all four tires",
      cost: 800.0,
      date: new Date("2024-09-01"),
      status: "SCHEDULED",
    },
  ];

  for (const maintenance of maintenanceRecords) {
    await prisma.maintenance.create({
      data: maintenance,
    });
  }

  // Create demo orders
  const orders = [
    {
      orderNumber: "ORD001",
      customerId: createdUsers.find((u) => u.email === "customer1@example.com")
        ?.id!,
      warehouseId: createdWarehouses[0].id,
      status: OrderStatus.DELIVERED,
      totalAmount: 369.97,
      notes: "Urgent delivery requested",
    },
    {
      orderNumber: "ORD002",
      customerId: createdUsers.find((u) => u.email === "customer2@example.com")
        ?.id!,
      warehouseId: createdWarehouses[0].id,
      status: OrderStatus.SHIPPED,
      totalAmount: 99.98,
      notes: "Standard delivery",
    },
    {
      orderNumber: "ORD003",
      customerId: createdUsers.find((u) => u.email === "customer3@example.com")
        ?.id!,
      warehouseId: createdWarehouses[1].id,
      status: OrderStatus.PROCESSING,
      totalAmount: 89.99,
    },
    {
      orderNumber: "ORD004",
      customerId: createdUsers.find((u) => u.email === "customer1@example.com")
        ?.id!,
      warehouseId: createdWarehouses[0].id,
      status: OrderStatus.PENDING,
      totalAmount: 54.98,
    },
  ];

  const createdOrders: Order[] = [];
  for (const order of orders) {
    const createdOrder = await prisma.order.create({
      data: order,
    });
    createdOrders.push(createdOrder);
  }

  // Create order items
  const orderItems = [
    {
      orderId: createdOrders[0].id,
      inventoryId: createdInventory.find((i) => i.sku === "ELEC001")?.id!,
      quantity: 1,
      price: 299.99,
    },
    {
      orderId: createdOrders[0].id,
      inventoryId: createdInventory.find((i) => i.sku === "CLOT001")?.id!,
      quantity: 1,
      price: 49.99,
    },
    {
      orderId: createdOrders[0].id,
      inventoryId: createdInventory.find((i) => i.sku === "BOOK001")?.id!,
      quantity: 1,
      price: 19.99,
    },
    {
      orderId: createdOrders[1].id,
      inventoryId: createdInventory.find((i) => i.sku === "CLOT001")?.id!,
      quantity: 2,
      price: 49.99,
    },
    {
      orderId: createdOrders[2].id,
      inventoryId: createdInventory.find((i) => i.sku === "HOME001")?.id!,
      quantity: 1,
      price: 89.99,
    },
    {
      orderId: createdOrders[3].id,
      inventoryId: createdInventory.find((i) => i.sku === "TOYS001")?.id!,
      quantity: 1,
      price: 34.99,
    },
    {
      orderId: createdOrders[3].id,
      inventoryId: createdInventory.find((i) => i.sku === "BOOK001")?.id!,
      quantity: 1,
      price: 19.99,
    },
  ];

  for (const item of orderItems) {
    await prisma.orderItem.create({
      data: item,
    });
  }

  // Create demo shipments
  const shipments = [
    {
      trackingNumber: "TRK001001",
      orderId: createdOrders[0].id,
      vehicleId: createdVehicles.find((v) => v.licensePlate === "TRK001")?.id,
      driverId: createdUsers.find((u) => u.email === "driver1@logistics.com")
        ?.id,
      origin: "New York, NY",
      destination: "Boston, MA",
      status: ShipmentStatus.DELIVERED,
      type: ShipmentType.EXPRESS,
      weight: 4.5,
      dimensions: '{"length": 50, "width": 40, "height": 30}',
      distance: 215.5,
      estimatedDelivery: new Date("2024-08-20"),
      actualDelivery: new Date("2024-08-19"),
      cost: 45.99,
      notes: "Delivered to front door",
    },
    {
      trackingNumber: "TRK001002",
      orderId: createdOrders[1].id,
      vehicleId: createdVehicles.find((v) => v.licensePlate === "VAN001")?.id,
      driverId: createdUsers.find((u) => u.email === "driver2@logistics.com")
        ?.id,
      origin: "New York, NY",
      destination: "Philadelphia, PA",
      status: ShipmentStatus.IN_TRANSIT,
      type: ShipmentType.STANDARD,
      weight: 2.4,
      dimensions: '{"length": 40, "width": 30, "height": 20}',
      distance: 95.2,
      estimatedDelivery: new Date("2024-09-10"),
      cost: 25.99,
    },
    {
      trackingNumber: "TRK001003",
      orderId: createdOrders[2].id,
      origin: "Los Angeles, CA",
      destination: "San Francisco, CA",
      status: ShipmentStatus.PENDING,
      type: ShipmentType.STANDARD,
      weight: 3.2,
      dimensions: '{"length": 35, "width": 25, "height": 20}',
      distance: 382.1,
      estimatedDelivery: new Date("2024-09-15"),
      cost: 35.99,
    },
  ];

  const createdShipments: Shipment[] = [];
  for (const shipment of shipments) {
    const createdShipment = await prisma.shipment.create({
      data: shipment,
    });
    createdShipments.push(createdShipment);
  }

  // Create shipment items
  const shipmentItems = [
    {
      shipmentId: createdShipments[0].id,
      inventoryId: createdInventory.find((i) => i.sku === "ELEC001")?.id!,
      quantity: 1,
    },
    {
      shipmentId: createdShipments[0].id,
      inventoryId: createdInventory.find((i) => i.sku === "CLOT001")?.id!,
      quantity: 1,
    },
    {
      shipmentId: createdShipments[1].id,
      inventoryId: createdInventory.find((i) => i.sku === "CLOT001")?.id!,
      quantity: 2,
    },
  ];

  for (const item of shipmentItems) {
    await prisma.shipmentItem.create({
      data: item,
    });
  }

  // Create shipment tracking
  const trackingEntries = [
    {
      shipmentId: createdShipments[0].id,
      location: "New York Distribution Center",
      latitude: 40.7128,
      longitude: -74.006,
      status: "PICKED_UP",
      timestamp: new Date("2024-08-18T09:00:00Z"),
      notes: "Package picked up from warehouse",
    },
    {
      shipmentId: createdShipments[0].id,
      location: "Hartford, CT",
      latitude: 41.7658,
      longitude: -72.6734,
      status: "IN_TRANSIT",
      timestamp: new Date("2024-08-18T15:30:00Z"),
      notes: "Package in transit",
    },
    {
      shipmentId: createdShipments[0].id,
      location: "Boston, MA",
      latitude: 42.3601,
      longitude: -71.0589,
      status: "DELIVERED",
      timestamp: new Date("2024-08-19T11:15:00Z"),
      notes: "Package delivered successfully",
    },
  ];

  for (const tracking of trackingEntries) {
    await prisma.shipmentTracking.create({
      data: tracking,
    });
  }

  // Create proof of delivery
  await prisma.proofOfDelivery.create({
    data: {
      shipmentId: createdShipments[0].id,
      signature:
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==",
      recipientName: "Alice Cooper",
      notes: "Delivered to customer at front door",
      deliveredAt: new Date("2024-08-19T11:15:00Z"),
    },
  });

  // Create invoices
  const invoices = [
    {
      invoiceNumber: "INV001",
      orderId: createdOrders[0].id,
      customerId: createdUsers.find((u) => u.email === "customer1@example.com")
        ?.id!,
      amount: 369.97,
      tax: 29.6,
      totalAmount: 399.57,
      status: InvoiceStatus.PAID,
      dueDate: new Date("2024-09-01"),
      paidAt: new Date("2024-08-25"),
    },
    {
      invoiceNumber: "INV002",
      orderId: createdOrders[1].id,
      customerId: createdUsers.find((u) => u.email === "customer2@example.com")
        ?.id!,
      amount: 99.98,
      tax: 8.0,
      totalAmount: 107.98,
      status: InvoiceStatus.SENT,
      dueDate: new Date("2024-09-15"),
    },
    {
      invoiceNumber: "INV003",
      orderId: createdOrders[2].id,
      customerId: createdUsers.find((u) => u.email === "customer3@example.com")
        ?.id!,
      amount: 89.99,
      tax: 7.2,
      totalAmount: 97.19,
      status: InvoiceStatus.DRAFT,
      dueDate: new Date("2024-09-20"),
    },
  ];

  const createdInvoices: Invoice[] = [];
  for (const invoice of invoices) {
    const createdInvoice = await prisma.invoice.create({
      data: invoice,
    });
    createdInvoices.push(createdInvoice);
  }

  // Create payments
  const payments = [
    {
      invoiceId: createdInvoices[0].id,
      amount: 399.57,
      method: "CREDIT_CARD",
      transactionId: "txn_1234567890",
      status: PaymentStatus.COMPLETED,
      paidAt: new Date("2024-08-25T14:30:00Z"),
    },
    {
      invoiceId: createdInvoices[1].id,
      amount: 107.98,
      method: "BANK_TRANSFER",
      status: PaymentStatus.PENDING,
    },
  ];

  for (const payment of payments) {
    await prisma.payment.create({
      data: payment,
    });
  }

  // Create reviews
  const reviews = [
    {
      userId: createdUsers.find((u) => u.email === "customer1@example.com")
        ?.id!,
      shipmentId: createdShipments[0].id,
      rating: 5,
      comment:
        "Excellent service! Package arrived on time and in perfect condition.",
    },
    {
      userId: createdUsers.find((u) => u.email === "customer2@example.com")
        ?.id!,
      shipmentId: createdShipments[1].id,
      rating: 4,
      comment: "Good service overall, delivery was prompt.",
    },
    {
      userId: createdUsers.find((u) => u.email === "customer3@example.com")
        ?.id!,
      rating: 3,
      comment: "Average service, could be improved.",
    },
  ];

  for (const review of reviews) {
    await prisma.review.create({
      data: review,
    });
  }

  console.log("Database seeded successfully with comprehensive dummy data!");
  console.log(`Created:`);
  console.log(`- ${createdUsers.length} users`);
  console.log(`- ${createdWarehouses.length} warehouses`);
  console.log(`- ${createdZones.length} warehouse zones`);
  console.log(`- ${createdInventory.length} inventory items`);
  console.log(`- ${createdVehicles.length} vehicles`);
  console.log(`- ${createdOrders.length} orders`);
  console.log(`- ${createdShipments.length} shipments`);
  console.log(`- ${createdInvoices.length} invoices`);
  console.log(`- ${maintenanceRecords.length} maintenance records`);
  console.log(`- ${orderItems.length} order items`);
  console.log(`- ${shipmentItems.length} shipment items`);
  console.log(`- ${trackingEntries.length} tracking entries`);
  console.log(`- ${payments.length} payments`);
  console.log(`- ${reviews.length} reviews`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
