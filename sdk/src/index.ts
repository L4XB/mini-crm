/**
 * Mini CRM SDK
 * 
 * A comprehensive SDK for the Mini CRM Backend with support for custom models,
 * local development, and TypeScript integration.
 */

// Core SDK exports
export * from './client';
export * from './schema';
export * from './server';

// Type definitions
export * from './types';

// Decorator exports
export { Model, Field } from './schema/decorators';
export { EntityType } from './types';

// Configuration types
export { MiniCRMConfig } from './types';

// Main SDK class
import { MiniCRM } from './core/MiniCRM';
export { MiniCRM };

// Default export
export default MiniCRM;
