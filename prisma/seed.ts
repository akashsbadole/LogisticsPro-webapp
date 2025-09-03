import {
  PrismaClient,
  UserRole,
  UserStatus,
  VehicleType,
  VehicleStatus,
  WarehouseStatus,
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
    },
    {
      email: "manager@logistics.com",
      name: "Warehouse Manager",
      password: await bcrypt.hash("manager123", 12),
      role: UserRole.WAREHOUSE_MANAGER,
      status: UserStatus.ACTIVE,
    },
    {
      email: "driver@logistics.com",
      name: "Driver User",
      password: await bcrypt.hash("driver123", 12),
      role: UserRole.DRIVER,
      status: UserStatus.ACTIVE,
    },
    {
      email: "customer@logistics.com",
      name: "Customer User",
      password: await bcrypt.hash("customer123", 12),
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  // Create or update demo warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: {
      code: "WH001",
    },
    update: {
      name: "Main Distribution Center",
      address: "123 Logistics Street",
      city: "New York",
    },
    create: {
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
    },
  });

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
      warehouseId: warehouse.id,
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
      warehouseId: warehouse.id,
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
      warehouseId: warehouse.id,
    },
  ];

  for (const item of inventoryItems) {
    await prisma.inventory.upsert({
      where: { sku: item.sku },
      update: item,
      create: item,
    });
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
    },
    {
      licensePlate: "VAN001",
      make: "Mercedes",
      model: "Sprinter",
      year: 2021,
      type: VehicleType.VAN,
      capacity: 500,
      status: VehicleStatus.AVAILABLE,
    },
  ];

  for (const vehicle of vehicles) {
    await prisma.vehicle.upsert({
      where: { licensePlate: vehicle.licensePlate },
      update: vehicle,
      create: vehicle,
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
