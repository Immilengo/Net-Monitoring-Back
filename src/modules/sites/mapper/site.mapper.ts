import { SiteOutput } from '../interfaces/site.interface';

type InputSite = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  description: string | null;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const toSiteOutput = (site: InputSite): SiteOutput => ({
  id: site.id,
  name: site.name,
  address: site.address,
  city: site.city,
  country: site.country,
  description: site.description,
  deleted: site.deleted,
  createdAt: site.createdAt,
  updatedAt: site.updatedAt
});