import bcrypt from 'bcrypt'
import { PrismaClient, DeviceType, MonitoringStatus, AlertLevel, ServiceType, StatusSource } from '@prisma/client'

const prisma = new PrismaClient()

const passwordHash = async (password: string) => bcrypt.hash(password, 10)

async function main() {
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: { description: 'Administrador do sistema', deleted: false },
      create: { name: 'ADMIN', description: 'Administrador do sistema' }
    }),
    prisma.role.upsert({
      where: { name: 'MANAGER' },
      update: { description: 'Gestor de operações', deleted: false },
      create: { name: 'MANAGER', description: 'Gestor de operações' }
    }),
    prisma.role.upsert({
      where: { name: 'VIEWER' },
      update: { description: 'Visualizador com acesso restrito', deleted: false },
      create: { name: 'VIEWER', description: 'Visualizador com acesso restrito' }
    })
  ])

  const statuses = await Promise.all([
    prisma.status.upsert({
      where: { code: 'ACTIVE' },
      update: { name: 'Active', description: 'Usuário ativo', deleted: false },
      create: { code: 'ACTIVE', name: 'Active', description: 'Usuário ativo' }
    }),
    prisma.status.upsert({
      where: { code: 'INACTIVE' },
      update: { name: 'Inactive', description: 'Usuário inativo', deleted: false },
      create: { code: 'INACTIVE', name: 'Inactive', description: 'Usuário inativo' }
    })
  ])

  const adminPassword = await passwordHash('Admin123@')
  const managerPassword = await passwordHash('Manager123@')
  const viewerPassword = await passwordHash('Viewer123@')

  const users = [
    {
      email: 'admin@netwatch.com',
      fullName: 'Administrador NetWatch',
      password: adminPassword,
      roleNames: ['ADMIN'],
      phone: '+244900000001'
    },
    {
      email: 'manager@netwatch.com',
      fullName: 'Network Manager',
      password: managerPassword,
      roleNames: ['MANAGER'],
      phone: '+244900000002'
    },
    {
      email: 'viewer@netwatch.com',
      fullName: 'Read Only User',
      password: viewerPassword,
      roleNames: ['VIEWER'],
      phone: '+244900000003'
    }
  ]

  for (const seedUser of users) {
    const user = await prisma.user.upsert({
      where: { email: seedUser.email },
      update: {
        fullName: seedUser.fullName,
        password: seedUser.password,
        phone: seedUser.phone,
        deleted: false,
        emailVerified: true,
        statusId: statuses[0].id
      },
      create: {
        email: seedUser.email,
        fullName: seedUser.fullName,
        password: seedUser.password,
        phone: seedUser.phone,
        deleted: false,
        emailVerified: true,
        statusId: statuses[0].id
      }
    })

    await prisma.userRole.deleteMany({ where: { userId: user.id } })

    for (const roleName of seedUser.roleNames) {
      const role = roles.find((r) => r.name === roleName)
      if (!role) continue
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id
        }
      })
    }
  }

  const existingSite = await prisma.site.findFirst({ where: { name: 'Headquarters' } })
  const site = existingSite
    ? await prisma.site.update({
        where: { id: existingSite.id },
        data: {
          address: 'Av. Principal 100',
          city: 'Luanda',
          country: 'Angola',
          description: 'Site principal do NOC',
          deleted: false
        }
      })
    : await prisma.site.create({
        data: {
          name: 'Headquarters',
          address: 'Av. Principal 100',
          city: 'Luanda',
          country: 'Angola',
          description: 'Site principal do NOC'
        }
      })

  const device = await prisma.device.upsert({
    where: { ipAddress: '10.0.0.1' },
    update: {
      name: 'Core Router',
      type: DeviceType.ROUTER,
      currentStatus: MonitoringStatus.ONLINE,
      statusSource: StatusSource.AUTO,
      siteId: site.id,
      active: true,
      deleted: false
    },
    create: {
      name: 'Core Router',
      hostname: 'core-router',
      ipAddress: '10.0.0.1',
      macAddress: 'AA:BB:CC:DD:EE:01',
      type: DeviceType.ROUTER,
      description: 'Main edge router',
      currentStatus: MonitoringStatus.ONLINE,
      statusSource: StatusSource.AUTO,
      siteId: site.id,
      active: true
    }
  })

  await prisma.monitoringLog.deleteMany({ where: { deviceId: device.id } })
  await prisma.alert.deleteMany({ where: { deviceId: device.id } })
  await prisma.serviceMonitor.deleteMany({ where: { deviceId: device.id } })

  await prisma.monitoringLog.create({
    data: {
      deviceId: device.id,
      status: MonitoringStatus.ONLINE,
      responseTime: 12,
      packetLoss: 0,
      message: 'Heartbeat received'
    }
  })

  await prisma.alert.create({
    data: {
      deviceId: device.id,
      title: 'Initial check',
      message: 'Seed alert to validate dashboard flow',
      level: AlertLevel.INFO
    }
  })

  await prisma.serviceMonitor.create({
    data: {
      deviceId: device.id,
      name: 'ICMP Ping',
      type: ServiceType.TCP,
      port: 0,
      enabled: true,
      timeoutSeconds: 5
    }
  })

  console.log('Seed completed successfully')
  console.log('Default credentials:')
  console.log('admin@netwatch.com / Admin123@')
  console.log('manager@netwatch.com / Manager123@')
  console.log('viewer@netwatch.com / Viewer123@')
}

main()
  .catch(async (error) => {
    console.error('Seed failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
