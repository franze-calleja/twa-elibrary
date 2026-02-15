/*
  Warnings:

  - You are about to drop the column `approvedAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `rejectionReason` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `requestedDays` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Transaction` DROP COLUMN `approvedAt`,
    DROP COLUMN `rejectedAt`,
    DROP COLUMN `rejectionReason`,
    DROP COLUMN `requestedDays`;
