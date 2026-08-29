CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`organization_id` text NOT NULL,
	`actor_user_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`payload` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_org_entity_time` ON `audit_log` (`organization_id`,`entity_type`,`entity_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`segment` text NOT NULL,
	`sales_owner` text NOT NULL,
	`lifecycle_stage` text NOT NULL,
	`payment_days` integer DEFAULT 30 NOT NULL,
	`credit_limit` real DEFAULT 0 NOT NULL,
	`open_balance` real DEFAULT 0 NOT NULL,
	`last_contact_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_customers_org_stage` ON `customers` (`organization_id`,`lifecycle_stage`);--> statement-breakpoint
CREATE INDEX `idx_customers_org_name` ON `customers` (`organization_id`,`name`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`scope` text NOT NULL,
	`scope_code` text NOT NULL,
	`document_type` text NOT NULL,
	`workflow_stage` text NOT NULL,
	`status` text NOT NULL,
	`due_date` text,
	`process_block` text,
	`owner_user_id` text,
	`version` integer DEFAULT 1 NOT NULL,
	`storage_key` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_documents_org_scope` ON `documents` (`organization_id`,`scope`,`scope_code`);--> statement-breakpoint
CREATE INDEX `idx_documents_org_status_due` ON `documents` (`organization_id`,`status`,`due_date`);--> statement-breakpoint
CREATE TABLE `drivers` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`full_name` text NOT NULL,
	`base` text NOT NULL,
	`availability_status` text NOT NULL,
	`account_status` text NOT NULL,
	`compliance_status` text NOT NULL,
	`driving_hours_week` integer DEFAULT 0 NOT NULL,
	`driving_hours_two_weeks` integer DEFAULT 0 NOT NULL,
	`document_completeness` integer DEFAULT 0 NOT NULL,
	`card_download_due` text,
	`medical_due` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_drivers_org_status` ON `drivers` (`organization_id`,`availability_status`);--> statement-breakpoint
CREATE INDEX `idx_drivers_org_compliance` ON `drivers` (`organization_id`,`compliance_status`);--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`assignee_user_id` text,
	`driver_id` text,
	`customer_id` text,
	`order_id` text,
	`title` text NOT NULL,
	`status` text DEFAULT 'Otwarte' NOT NULL,
	`due_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assignee_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `transport_orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_tasks_org_assignee_status` ON `tasks` (`organization_id`,`assignee_user_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_tasks_org_due` ON `tasks` (`organization_id`,`due_at`);--> statement-breakpoint
CREATE TABLE `transport_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`customer_id` text NOT NULL,
	`customer_name` text NOT NULL,
	`vehicle_id` text,
	`vehicle_registration` text NOT NULL,
	`driver_id` text,
	`driver_name` text NOT NULL,
	`route` text NOT NULL,
	`cargo` text NOT NULL,
	`temperature` text,
	`status` text NOT NULL,
	`eta` text NOT NULL,
	`loaded_km` integer DEFAULT 0 NOT NULL,
	`empty_km` integer DEFAULT 0 NOT NULL,
	`sale_price` real DEFAULT 0 NOT NULL,
	`total_cost` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_orders_org_status` ON `transport_orders` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_orders_org_customer` ON `transport_orders` (`organization_id`,`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_org_driver` ON `transport_orders` (`organization_id`,`driver_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_org_vehicle` ON `transport_orders` (`organization_id`,`vehicle_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'Aktywne' NOT NULL,
	`driver_id` text,
	`customer_id` text,
	`last_login_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_org_email` ON `users` (`organization_id`,`email`);--> statement-breakpoint
CREATE INDEX `idx_users_org_role` ON `users` (`organization_id`,`role`);--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`registration` text NOT NULL,
	`vehicle_type` text NOT NULL,
	`make` text NOT NULL,
	`production_year` integer NOT NULL,
	`operational_status` text NOT NULL,
	`assigned_driver_id` text,
	`odometer` integer DEFAULT 0 NOT NULL,
	`fuel_average` real DEFAULT 0 NOT NULL,
	`next_service_at` text,
	`monthly_lease` real DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_vehicles_org_registration` ON `vehicles` (`organization_id`,`registration`);--> statement-breakpoint
CREATE INDEX `idx_vehicles_org_status` ON `vehicles` (`organization_id`,`operational_status`);--> statement-breakpoint
CREATE TABLE `workflow_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`organization_id` text NOT NULL,
	`order_id` text,
	`document_id` text,
	`actor_user_id` text,
	`event_type` text NOT NULL,
	`previous_value` text,
	`new_value` text,
	`description` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `transport_orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_events_org_order_time` ON `workflow_events` (`organization_id`,`order_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_events_org_document_time` ON `workflow_events` (`organization_id`,`document_id`,`created_at`);