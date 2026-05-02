CREATE TABLE `foodItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`expirationDate` timestamp NOT NULL,
	`imageUrl` text,
	`category` varchar(100),
	`quantity` varchar(100),
	`notes` text,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `foodItems_id` PRIMARY KEY(`id`)
);
