import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { DEFAULT_AVATARS, SUBSCRIPTION_PLANS } from '../../shared/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.resolve(__dirname, '../../../data');
const DB_FILE = path.join(DB_DIR, 'ridex_db.json');

class Database {
  constructor() {
    this.data = {
      users: {},
      sessions: {},
      stats: {
        totalRidesRegistered: 0,
        createdAt: new Date().toISOString()
      }
    };
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.seedInitialData();
        this.save();
      }
    } catch (err) {
      console.warn('[DB] Error cargando base de datos, inicializando con semillas:', err.message);
      this.seedInitialData();
    }
  }

  save() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const tempPath = `${DB_FILE}.tmp_${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[DB] Error guardando base de datos:', err);
    }
  }

  hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  }

  seedInitialData() {
    const saltDriver = crypto.randomBytes(16).toString('hex');
    const saltPassenger = crypto.randomBytes(16).toString('hex');

    // Conductor Demo: Carlos Mendoza
    const driverId = 'drv_demo_carlos';
    this.data.users[driverId] = {
      id: driverId,
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@gmail.com',
      phone: '0412-9876543',
      nationalId: 'V-22987654',
      role: 'driver',
      city: 'Caracas',
      avatar: DEFAULT_AVATARS.driver_moto,
      rating: 4.97,
      totalRides: 184,
      salt: saltDriver,
      passwordHash: this.hashPassword('123456', saltDriver),
      createdAt: '2026-01-15T10:00:00.000Z',
      vehicle: {
        vehicleType: 'moto',
        make: 'Bera',
        model: 'Bera SBR 150',
        plate: 'AD712YZ',
        color: 'Rojo',
        year: '2024',
        hasAc: false
      },
      documents: {
        license: 'Vigente (INTT Grado 2)',
        rcv: 'Activo (Seguros Caracas)',
        medicalCert: 'Aprobado (Vence 2028)'
      },
      emergencyContact: {
        name: 'Elena Mendoza (Hermana)',
        phone: '0414-1122334',
        relationship: 'Familiar'
      }
    };

    // Pasajero Demo: Mariana Silva
    const passengerId = 'usr_demo_mariana';
    this.data.users[passengerId] = {
      id: passengerId,
      name: 'Mariana Silva',
      email: 'mariana.silva@gmail.com',
      phone: '0414-2345678',
      nationalId: 'V-26112334',
      role: 'passenger',
      city: 'Caracas',
      avatar: DEFAULT_AVATARS.passenger_female,
      rating: 4.98,
      totalRides: 42,
      salt: saltPassenger,
      passwordHash: this.hashPassword('123456', saltPassenger),
      createdAt: '2026-02-01T14:30:00.000Z',
      vehicle: null,
      emergencyContact: {
        name: 'Roberto Silva (Padre)',
        phone: '0424-9988776',
        relationship: 'Padre'
      }
    };
  }

  // --- Operaciones de Usuario ---

  createUser(userData) {
    const {
      name,
      email,
      phone,
      nationalId,
      role = 'passenger',
      city = 'Caracas',
      password = 'password123',
      avatar = null,
      vehicle = null,
      emergencyContact = null
    } = userData;

    // Verificar si el teléfono o correo ya existen
    const existing = Object.values(this.data.users).find(
      (u) => (u.phone && u.phone === phone) || (u.email && u.email.toLowerCase() === email?.toLowerCase())
    );

    if (existing) {
      throw new Error('Ya existe una cuenta con este teléfono o correo electrónico');
    }

    const userId = (role === 'driver' ? 'drv_' : 'usr_') + crypto.randomUUID().substring(0, 8);
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(password, salt);

    // Asignar avatar por defecto si no subió foto
    const selectedAvatar = avatar || (
      role === 'driver'
        ? (vehicle?.vehicleType === 'moto' ? DEFAULT_AVATARS.driver_moto : DEFAULT_AVATARS.driver_car)
        : DEFAULT_AVATARS.passenger_male
    );

    const newUser = {
      id: userId,
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : '',
      phone: phone.trim(),
      nationalId: nationalId ? nationalId.trim().toUpperCase() : 'V-00000000',
      role,
      city,
      avatar: selectedAvatar,
      rating: 5.0,
      totalRides: 0,
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
      vehicle: role === 'driver' ? {
        vehicleType: vehicle?.vehicleType || 'carro_standard',
        make: vehicle?.make || 'Chevrolet',
        model: vehicle?.model || 'Optra',
        plate: vehicle?.plate ? vehicle.plate.toUpperCase().trim() : 'AC000ZZ',
        color: vehicle?.color || 'Plata',
        year: vehicle?.year || '2022',
        hasAc: Boolean(vehicle?.hasAc)
      } : null,
      documents: role === 'driver' ? {
        license: 'Vigente (INTT)',
        rcv: 'Activo',
        medicalCert: 'Aprobado'
      } : null,
      emergencyContact: emergencyContact || {
        name: 'Contacto de Emergencia',
        phone: '0412-0000000',
        relationship: 'Familiar'
      }
    };

    this.data.users[userId] = newUser;
    this.save();

    // Crear sesión
    const token = this.createSession(userId);
    const safeUser = this.sanitizeUser(newUser);

    return { user: safeUser, token };
  }

  authenticateUser(identifier, password) {
    if (!identifier || !password) {
      throw new Error('Debe ingresar credenciales completas');
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const user = Object.values(this.data.users).find(
      (u) => u.phone === identifier.trim() || u.email?.toLowerCase() === cleanIdentifier
    );

    if (!user) {
      throw new Error('Usuario no registrado con ese teléfono o correo');
    }

    const inputHash = this.hashPassword(password, user.salt);
    if (inputHash !== user.passwordHash) {
      throw new Error('Contraseña incorrecta');
    }

    const token = this.createSession(user.id);
    return { user: this.sanitizeUser(user), token };
  }

  createSession(userId) {
    const token = 'tok_' + crypto.randomUUID().replace(/-/g, '');
    this.data.sessions[token] = {
      userId,
      createdAt: new Date().toISOString()
    };
    this.save();
    return token;
  }

  getUserByToken(token) {
    if (!token) return null;
    const session = this.data.sessions[token];
    if (!session) return null;
    const user = this.data.users[session.userId];
    return user ? this.sanitizeUser(user) : null;
  }

  getUserById(userId) {
    const user = this.data.users[userId];
    return user ? this.sanitizeUser(user) : null;
  }

  updateUser(userId, updates) {
    const user = this.data.users[userId];
    if (!user) throw new Error('Usuario no encontrado');

    const allowedFields = ['name', 'phone', 'email', 'city', 'avatar', 'emergencyContact', 'vehicle', 'role'];
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
      }
    }

    this.save();
    return this.sanitizeUser(user);
  }

  updateAvatar(userId, avatarDataUrl) {
    const user = this.data.users[userId];
    if (!user) throw new Error('Usuario no encontrado');

    user.avatar = avatarDataUrl;
    this.save();
    return this.sanitizeUser(user);
  }

  subscribeUser(userId, planId) {
    const user = this.data.users[userId];
    if (!user) throw new Error('Usuario no encontrado');

    const selectedPlan = Object.values(SUBSCRIPTION_PLANS).find((p) => p.id === planId) || SUBSCRIPTION_PLANS.MONTHLY;
    const durationDays = selectedPlan.durationDays || 30;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    user.subscription = {
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      priceUsd: selectedPlan.priceUsd,
      discountPercent: selectedPlan.discountPercent,
      status: 'active',
      startedAt: new Date().toISOString(),
      expiresAt,
      autoRenew: true
    };

    this.save();
    return this.sanitizeUser(user);
  }

  cancelSubscription(userId) {
    const user = this.data.users[userId];
    if (!user) throw new Error('Usuario no encontrado');

    if (user.subscription) {
      user.subscription.status = 'cancelled';
      user.subscription.autoRenew = false;
      user.subscription.cancelledAt = new Date().toISOString();
    }

    this.save();
    return this.sanitizeUser(user);
  }

  getAllDrivers() {
    return Object.values(this.data.users)
      .filter((u) => u.role === 'driver')
      .map((u) => this.sanitizeUser(u));
  }

  getAllUsers() {
    return Object.values(this.data.users).map((u) => this.sanitizeUser(u));
  }

  sanitizeUser(user) {
    const { passwordHash, salt, ...safe } = user;
    const isVipActive = Boolean(
      safe.subscription &&
      safe.subscription.status === 'active' &&
      new Date(safe.subscription.expiresAt).getTime() > Date.now()
    );
    return {
      ...safe,
      isVip: isVipActive
    };
  }
}

export const db = new Database();
