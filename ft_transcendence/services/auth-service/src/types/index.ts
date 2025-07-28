/**
 * Auth Service Types
 * Consolidated type definitions for the auth service
 */

// User related types
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash?: string | null;
  google_id?: string | null;
  profile_picture?: string | null;
  is_verified?: boolean;
  created_at: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  profile_picture?: string | null;
  created_at?: string;
}

// Token related types  
export interface TokenPayload {
  userId: number;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

// OAuth2 related types
export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface OAuthUser {
  id: number;
  google_id: string;
  username: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface OAuthUserResponse {
  id: number;
  username: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
}

// Request/Response types
export interface RegistrationRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserResponse;
  error?: string;
}

// Database creation types
export interface CreateUserData {
  username: string;
  email: string;
  password_hash?: string | null;
  google_id?: string | null;
  profile_picture?: string | null;
  is_verified?: boolean;
}