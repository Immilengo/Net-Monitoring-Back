export interface UserOutput {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string | null;
  emailVerified: boolean;
  roles: string[];
  profileImage?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSummaryOutput {
  totals: {
    total: number;
    active: number;
    inactive: number;
    verified: number;
    admins: number;
    operators: number;
    viewers: number;
  };
  recentUsers: UserOutput[];
}
