/*
  Warnings:

  - You are about to drop the column `activationCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `activationToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `activationCode`,
    DROP COLUMN `activationToken`,
    ADD COLUMN `middleName` VARCHAR(191) NULL;
