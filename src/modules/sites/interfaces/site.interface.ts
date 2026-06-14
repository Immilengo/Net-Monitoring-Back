export interface SiteOutput {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  description: string | null;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}