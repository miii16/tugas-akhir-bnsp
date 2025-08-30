/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Berita` table. All the data in the column will be lost.
  - You are about to drop the column `gambar` on the `Berita` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Guru` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Jurusan` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Berita" DROP COLUMN "createdAt",
DROP COLUMN "gambar",
ADD COLUMN     "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "createdAt";

-- DropTable
DROP TABLE "public"."Guru";

-- DropTable
DROP TABLE "public"."Jurusan";

-- CreateTable
CREATE TABLE "public"."Kontak" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "jawaban" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kontak_pkey" PRIMARY KEY ("id")
);
