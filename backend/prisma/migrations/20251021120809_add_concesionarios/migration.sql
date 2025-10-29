/*
  Warnings:

  - Added the required column `concesionarioId` to the `Inscripcion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Inscripcion" ADD COLUMN     "concesionarioId" INTEGER NOT NULL,
ADD COLUMN     "informacionAdicional" TEXT,
ADD COLUMN     "telefono" TEXT;

-- CreateTable
CREATE TABLE "Concesionario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Concesionario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Concesionario_nombre_key" ON "Concesionario"("nombre");

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_concesionarioId_fkey" FOREIGN KEY ("concesionarioId") REFERENCES "Concesionario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
