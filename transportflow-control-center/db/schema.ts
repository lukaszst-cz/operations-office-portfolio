import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull(),
  status: text("status").notNull().default("Aktywne"),
  driverId: text("driver_id"),
  customerId: text("customer_id"),
  lastLoginAt: text("last_login_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_users_org_email").on(table.organizationId, table.email),
  index("idx_users_org_role").on(table.organizationId, table.role),
]);

export const drivers = sqliteTable("drivers", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  fullName: text("full_name").notNull(),
  base: text("base").notNull(),
  availabilityStatus: text("availability_status").notNull(),
  accountStatus: text("account_status").notNull(),
  complianceStatus: text("compliance_status").notNull(),
  drivingHoursWeek: integer("driving_hours_week").notNull().default(0),
  drivingHoursTwoWeeks: integer("driving_hours_two_weeks").notNull().default(0),
  documentCompleteness: integer("document_completeness").notNull().default(0),
  cardDownloadDue: text("card_download_due"),
  medicalDue: text("medical_due"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_drivers_org_status").on(table.organizationId, table.availabilityStatus),
  index("idx_drivers_org_compliance").on(table.organizationId, table.complianceStatus),
]);

export const vehicles = sqliteTable("vehicles", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  registration: text("registration").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  make: text("make").notNull(),
  productionYear: integer("production_year").notNull(),
  operationalStatus: text("operational_status").notNull(),
  assignedDriverId: text("assigned_driver_id").references(() => drivers.id),
  odometer: integer("odometer").notNull().default(0),
  fuelAverage: real("fuel_average").notNull().default(0),
  nextServiceAt: text("next_service_at"),
  monthlyLease: real("monthly_lease").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_vehicles_org_registration").on(table.organizationId, table.registration),
  index("idx_vehicles_org_status").on(table.organizationId, table.operationalStatus),
]);

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  segment: text("segment").notNull(),
  salesOwner: text("sales_owner").notNull(),
  lifecycleStage: text("lifecycle_stage").notNull(),
  paymentDays: integer("payment_days").notNull().default(30),
  creditLimit: real("credit_limit").notNull().default(0),
  openBalance: real("open_balance").notNull().default(0),
  lastContactAt: text("last_contact_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_customers_org_stage").on(table.organizationId, table.lifecycleStage),
  index("idx_customers_org_name").on(table.organizationId, table.name),
]);

export const transportOrders = sqliteTable("transport_orders", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  customerId: text("customer_id").notNull().references(() => customers.id),
  customerName: text("customer_name").notNull(),
  vehicleId: text("vehicle_id").references(() => vehicles.id),
  vehicleRegistration: text("vehicle_registration").notNull(),
  driverId: text("driver_id").references(() => drivers.id),
  driverName: text("driver_name").notNull(),
  route: text("route").notNull(),
  cargo: text("cargo").notNull(),
  temperature: text("temperature"),
  status: text("status").notNull(),
  eta: text("eta").notNull(),
  loadedKm: integer("loaded_km").notNull().default(0),
  emptyKm: integer("empty_km").notNull().default(0),
  salePrice: real("sale_price").notNull().default(0),
  totalCost: real("total_cost").notNull().default(0),
  currency: text("currency").notNull().default("EUR"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_orders_org_status").on(table.organizationId, table.status),
  index("idx_orders_org_customer").on(table.organizationId, table.customerId),
  index("idx_orders_org_driver").on(table.organizationId, table.driverId),
  index("idx_orders_org_vehicle").on(table.organizationId, table.vehicleId),
]);

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  scope: text("scope").notNull(),
  scopeCode: text("scope_code").notNull(),
  documentType: text("document_type").notNull(),
  workflowStage: text("workflow_stage").notNull(),
  status: text("status").notNull(),
  dueDate: text("due_date"),
  processBlock: text("process_block"),
  ownerUserId: text("owner_user_id").references(() => users.id),
  version: integer("version").notNull().default(1),
  storageKey: text("storage_key"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_documents_org_scope").on(table.organizationId, table.scope, table.scopeCode),
  index("idx_documents_org_status_due").on(table.organizationId, table.status, table.dueDate),
]);

export const workflowEvents = sqliteTable("workflow_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  orderId: text("order_id").references(() => transportOrders.id),
  documentId: text("document_id").references(() => documents.id),
  actorUserId: text("actor_user_id").references(() => users.id),
  eventType: text("event_type").notNull(),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  description: text("description").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_events_org_order_time").on(table.organizationId, table.orderId, table.createdAt),
  index("idx_events_org_document_time").on(table.organizationId, table.documentId, table.createdAt),
]);

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  assigneeUserId: text("assignee_user_id").references(() => users.id),
  driverId: text("driver_id").references(() => drivers.id),
  customerId: text("customer_id").references(() => customers.id),
  orderId: text("order_id").references(() => transportOrders.id),
  title: text("title").notNull(),
  status: text("status").notNull().default("Otwarte"),
  dueAt: text("due_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_tasks_org_assignee_status").on(table.organizationId, table.assigneeUserId, table.status),
  index("idx_tasks_org_due").on(table.organizationId, table.dueAt),
]);

export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  organizationId: text("organization_id").notNull(),
  actorUserId: text("actor_user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  payload: text("payload"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_audit_org_entity_time").on(table.organizationId, table.entityType, table.entityId, table.createdAt)]);
