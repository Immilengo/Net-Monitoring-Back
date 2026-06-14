export interface CreateSiteDto {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
}

export interface UpdateSiteDto {
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
}