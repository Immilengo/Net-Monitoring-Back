import { Prisma } from '@prisma/client';
import { prisma } from '@infra/database/prisma';

export class SiteRepository {
  async create(data: Prisma.SiteCreateInput) {
    return prisma.site.create({ data });
  }

  async findById(id: string) {
    return prisma.site.findUnique({ where: { id } });
  }

  async findByName(name: string) {
    return prisma.site.findFirst({ where: { name, deleted: false } });
  }

  async findMany(params: {
    skip: number;
    take: number;
    recordStatus: 'ACTIVE' | 'INACTIVE' | 'ALL';
    sortBy: 'name' | 'city' | 'country' | 'createdAt' | 'updatedAt';
    direction: 'asc' | 'desc';
    search?: string;
  }) {
    const where: Prisma.SiteWhereInput = {
      ...(params.recordStatus === 'ALL' ? {} : { deleted: params.recordStatus === 'INACTIVE' }),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { city: { contains: params.search, mode: 'insensitive' } },
              { country: { contains: params.search, mode: 'insensitive' } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.site.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { [params.sortBy]: params.direction }
      }),
      prisma.site.count({ where })
    ]);

    return { items, total };
  }

  async update(id: string, data: Prisma.SiteUpdateInput) {
    return prisma.site.update({ where: { id }, data });
  }
}