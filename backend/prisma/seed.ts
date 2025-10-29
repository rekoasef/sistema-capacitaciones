// backend/prisma/seed.ts

import { PrismaClient } from '@prisma/client';

// Inicializamos el cliente de Prisma
const prisma = new PrismaClient();

// La lista de concesionarios extraída del PDF
const concesionarios = [
  "Agrícola Arrecifes", "Agrícola Noroeste", "Agrícola Rafaela S.A.", "Agro de Souza S.A.",
  "Agro Scheidegger", "Agro Sur S.A.C.I.F.I.A.", "Agrocomercial Chivilcoy", "Agromaq Saladillo S.R.L.",
  "Alonso Maquinarias", "Altamirano Oscar A. Maquinaria", "Álvarez Maquinarias", "Anta Maquinarias S.R.L.",
  "Botto Víctor", "Calatroni Javier", "Caminiti Caminos", "Caon Maquinarias", "Centeno maquinarias",
  "Ciagro", "Combes Gabriel", "Corporacion de Máquinaria Sa", "Cosechar S.A.", "Cri - Mag",
  "Criolani", "Depetris", "Distribuidora Z", "Echevarria", "El Marrullero", "EQ S.A.",
  "Ferrari maquinarias", "Frare Hernán", "Gondra", "Guerrero Carlos", "Implementos Quadri SRL",
  "Lanzetti", "Litoral Comercial S.A", "Luciano Salvador", "Luis S Ferro", "M.F.M. Rural S.R.L.",
  "Maquiagro (Moralejo)", "Máquinas del Centro", "Maratta maquinarias", "Net Multiagro SRL",
  "y Gûizzo", "Pajín maquinarias S.A", "Pallotti Diego", "Perracino", "Perticarini",
  "Pintucci", "Pozzi Maquinarias", "Realicó Agrosoluciones (RAS)", "Sabbione", "Schmidt Mauricio",
  "Silvia Lombardi", "Silvio Quevedo", "Spitale Osvaldo", "Sur Pampa S.A.(Uribe)", "Taborro Omar",
  "Tecnomac", "Todo Campo (Salum)", "Vagliengo Maquinarias", "Weinbaur", "Wirz Carlos", "Zappelli"
];

async function main() {
  console.log(`Start seeding ...`);

  // Usamos createMany para insertar todos los concesionarios de una vez.
  // skipDuplicates: true evita que el script falle si intentamos re-insertar un nombre que ya existe.
  await prisma.concesionario.createMany({
    data: concesionarios.map(nombre => ({ nombre })),
    skipDuplicates: true,
  });

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });