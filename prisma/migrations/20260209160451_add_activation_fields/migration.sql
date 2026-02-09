-- AlterTable
ALTER TABLE `User` ADD COLUMN `activationCode` VARCHAR(191) NULL,
    ADD COLUMN `activationToken` VARCHAR(191) NULL;
