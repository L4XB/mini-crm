/**
 * Core type definitions for the Mini CRM SDK
 */

export interface DBConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
  sslMode?: string;
}

export interface ServerConfig {
  port?: number;
  host?: string;
  jwtSecret?: string;
  jwtExpirationHours?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  allowedOrigins?: string[];
  enableSwagger?: boolean;
}

export interface MiniCRMConfig {
  models: any[];
  dbConfig: DBConfig;
  serverConfig: ServerConfig;
  basePath?: string;
  projectPath?: string;
  baseUrl?: string;
  apiVersion?: string;
  generateTestData?: boolean;
  disableAuth?: boolean;
}

export interface AuthToken {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: number;
  title: string;
  description?: string;
  value: number;
  status: string;
  contactId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  details?: string;
  dueDate?: string;
  completed: boolean;
  dealId?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  content: string;
  contactId?: number;
  dealId?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: number;
  theme: string;
  language: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EntityDefinition {
  name: string;
  tableName: string;
  fields: EntityFieldDefinition[];
  relations: EntityRelationDefinition[];
}

export interface EntityFieldDefinition {
  name: string;
  columnName: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'reference' | 'array';
  required: boolean;
  unique: boolean;
  enum?: string[];
  default?: any;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  jsonType?: string;
}

export interface EntityRelationDefinition {
  name: string;
  targetEntity: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  foreignKey: string;
  joinTable?: string;
  joinColumn?: string;
  inverseJoinColumn?: string;
}

export enum EntityType {
  User = 'User',
  Contact = 'Contact',
  Deal = 'Deal',
  Task = 'Task',
  Note = 'Note',
  Settings = 'Settings',
  Custom = 'Custom'
}
