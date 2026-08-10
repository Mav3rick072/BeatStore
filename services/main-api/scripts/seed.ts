/**
 * Script de datos iniciales para main-api.
 * Uso dentro del contenedor:
 *   docker compose exec main-api npm run seed
 */
import * as bcrypt from 'bcryptjs';
import * as mongoose from 'mongoose';

import { UserRole } from '../src/modules/users/enums/user-role.enum';
import { UserSchema } from '../src/modules/users/schemas/user.schema';

async function run() {
  const uri = process.env.MONGODB_URI ?? 'mongodb://mongodb:27017/beatstore';
  await mongoose.connect(uri);

  const UserModel = mongoose.model('User', UserSchema);

  const users = [
    {
      firstName: 'Admin',
      lastName: 'BeatStore',
      email: 'admin@beatstore.com',
      password: 'BeatStore123',
      role: UserRole.ADMIN,
      employeeNumber: 'EMP-0001',
    },
    {
      firstName: 'Gerente',
      lastName: 'BeatStore',
      email: 'gerente@beatstore.com',
      password: 'BeatStore123',
      role: UserRole.MANAGER,
      employeeNumber: 'EMP-0002',
    },
    {
      firstName: 'Cajero',
      lastName: 'Uno',
      email: 'cajero@beatstore.com',
      password: 'BeatStore123',
      role: UserRole.CASHIER,
      employeeNumber: 'EMP-0003',
    },
  ];

  for (const user of users) {
    const exists = await UserModel.findOne({ email: user.email });
    if (exists) continue;

    const passwordHash = await bcrypt.hash(user.password, 10);
    await UserModel.create({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      passwordHash,
      role: user.role,
      employeeNumber: user.employeeNumber,
    });
  }

  console.log('Usuarios de prueba creados:');
  console.log('  admin@beatstore.com / BeatStore123 (ADMIN)');
  console.log('  gerente@beatstore.com / BeatStore123 (MANAGER)');
  console.log('  cajero@beatstore.com / BeatStore123 (CASHIER)');

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error('Error al cargar datos iniciales:', error);
  process.exit(1);
});
