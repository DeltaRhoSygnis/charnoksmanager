
export interface UserRole {
  id: string;
  email: string;
  role: 'owner' | 'worker';
  createdBy?: string;
  createdAt: Date;
}

export interface AuthUser {
  uid: string;
  email: string;
  role: 'owner' | 'worker';
}
