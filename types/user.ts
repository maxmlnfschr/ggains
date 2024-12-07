export interface UserMetadata {
  full_name: string;
  role: 'admin' | 'coach' | 'athlete';
  email_verified: boolean;
  phone_verified: boolean;
  phone?: string;
} 