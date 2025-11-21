/*
  Warnings:

  - You are about to drop the column `fechaFin` on the `Grupo` table. All the data in the column will be lost.
  - You are about to drop the column `fechaInicio` on the `Grupo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Capacitacion" ALTER COLUMN "ubicacion" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Grupo" DROP COLUMN "fechaFin",
DROP COLUMN "fechaInicio";

-- CreateTable
CREATE TABLE "GrupoSegmento" (
    "id" SERIAL NOT NULL,
    "dia" TIMESTAMP(3) NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "grupoId" INTEGER NOT NULL,

    CONSTRAINT "GrupoSegmento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GrupoSegmento_grupoId_dia_key" ON "GrupoSegmento"("grupoId", "dia");

-- AddForeignKey
ALTER TABLE "GrupoSegmento" ADD CONSTRAINT "GrupoSegmento_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
