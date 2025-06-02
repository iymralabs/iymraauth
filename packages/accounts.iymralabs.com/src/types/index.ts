interface DbUser {
  $id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  profilePhotoUrl?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  addressCountry?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  $id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  profilePhotoUrl?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  addressCountry?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordChangeToken {
  $id: string;
  userId: string;
  code: string;
  expires: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}