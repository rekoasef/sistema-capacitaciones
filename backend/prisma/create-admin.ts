import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // --- TUS CREDENCIALES ---
  const email = 'posventa@crucianelli.com'; // <--- PON TU EMAIL AQUÍ
  const password = 'Pos2020ventas'; // <--- PON TU CONTRASEÑA AQUÍ
  // ------------------------

  console.log(`Creando administrador: ${email}...`);

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    console.log(`✅ ¡ÉXITO! Administrador creado con ID: ${admin.id}`);
  } catch (e: any) {
    if (e.code === 'P2002') {
      console.log('⚠️ El usuario ya existe.');
    } else {
      console.error('Error:', e);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
