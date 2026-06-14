import { AppError } from '@errors/app-error';
import { AuditService } from '@modules/audit/service/audit.service';
import { toPageResponse, parsePageQuery } from '@modules/common/service/pagination.service';
import { CreateSiteDto, UpdateSiteDto } from '../dto/site.dto';
import { toSiteOutput } from '../mapper/site.mapper';
import { SiteRepository } from '../repository/site.repository';

export class SiteService {
  constructor(
    private readonly repository = new SiteRepository(),
    private readonly audit = new AuditService()
  ) {}

  async create(input: CreateSiteDto, actorId?: string) {
    const existing = await this.repository.findByName(input.name);
    if (existing) throw new AppError('A site with this name already exists', 409);

    const site = await this.repository.create({
      name: input.name.trim(),
      address: input.address ?? null,
      city: input.city ?? null,
      country: input.country ?? null,
      description: input.description ?? null
    });

    await this.audit.log({ userId: actorId, action: 'CREATE', resource: 'SITE', resourceId: site.id });
    return toSiteOutput(site);
  }

  async getById(id: string) {
    const site = await this.repository.findById(id);
    if (!site || site.deleted) throw new AppError('Site not found', 404);
    return toSiteOutput(site);
  }

  async list(query: {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
    recordStatus?: 'ACTIVE' | 'INACTIVE' | 'ALL';
    search?: string;
  }) {
    const { page, size, skip, take } = parsePageQuery(query);

    const allowedSortFields = ['name', 'city', 'country', 'createdAt', 'updatedAt'];
    const sortBy = allowedSortFields.includes(query.sortBy ?? '')
      ? (query.sortBy as 'name' | 'city' | 'country' | 'createdAt' | 'updatedAt')
      : 'createdAt';

    const direction = (query.direction === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
    const recordStatus = query.recordStatus ?? 'ACTIVE';

    const { items, total } = await this.repository.findMany({
      skip,
      take,
      sortBy,
      direction,
      recordStatus,
      search: query.search
    });

    return toPageResponse(items.map(toSiteOutput), total, page, size);
  }

  async update(id: string, input: UpdateSiteDto, actorId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing || existing.deleted) throw new AppError('Site not found', 404);

    if (input.name && input.name.trim() !== existing.name) {
      const nameConflict = await this.repository.findByName(input.name.trim());
      if (nameConflict) throw new AppError('A site with this name already exists', 409);
    }

    const site = await this.repository.update(id, {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      ...(input.city !== undefined ? { city: input.city } : {}),
      ...(input.country !== undefined ? { country: input.country } : {}),
      ...(input.description !== undefined ? { description: input.description } : {})
    });

    await this.audit.log({ userId: actorId, action: 'UPDATE', resource: 'SITE', resourceId: id });
    return toSiteOutput(site);
  }

  async softDelete(id: string, actorId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing || existing.deleted) throw new AppError('Site not found', 404);

    await this.repository.update(id, { deleted: true });

    await this.audit.log({ userId: actorId, action: 'SOFT_DELETE', resource: 'SITE', resourceId: id });
  }

  async restore(id: string, actorId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError('Site not found', 404);
    if (!existing.deleted) throw new AppError('Site is already active', 400);

    const site = await this.repository.update(id, { deleted: false });

    await this.audit.log({ userId: actorId, action: 'RESTORE', resource: 'SITE', resourceId: id });
    return toSiteOutput(site);
  }
}