/*
  Warnings:

  - You are about to drop the `Fine` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Fine` DROP FOREIGN KEY `Fine_transactionId_fkey`;

-- DropForeignKey
ALTER TABLE `Fine` DROP FOREIGN KEY `Fine_userId_fkey`;

-- DropTable
DROP TABLE `Fine`;
