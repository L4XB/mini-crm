import 'reflect-metadata';
import { EntityType, EntityFieldDefinition } from '../types';

// Re-export types
export { EntityType };

const MODEL_METADATA_KEY = 'mini-crm:model';
const FIELD_METADATA_KEY = 'mini-crm:field';

export interface FieldOptions {
  type: 'string' | 'number' | 'boolean' | 'date' | 'reference' | 'array';
  required?: boolean;
  unique?: boolean;
  enum?: string[];
  to?: string; // For references
  default?: any;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  columnName?: string;
  description?: string;
}

export interface ModelOptions {
  name?: string;
  tableName?: string;
  description?: string;
  type?: EntityType;
}

/**
 * Decorator for model classes
 * @param options Options for the model
 */
export function Model(options: ModelOptions = {}) {
  return function(target: any) {
    // Use the class name as the default model name
    const modelName = options.name || target.name;
    
    // Generate snake_case table name if not provided
    const tableName = options.tableName || 
      modelName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    
    // Store model metadata
    Reflect.defineMetadata(MODEL_METADATA_KEY, {
      name: modelName,
      tableName,
      description: options.description || `${modelName} entity`,
      type: options.type || EntityType.Custom,
      target
    }, target);
    
    // Return the class (TypeScript decorator pattern)
    return target;
  };
}

/**
 * Decorator for model fields
 * @param options Options for the field
 */
export function Field(options: Partial<FieldOptions> = {}): PropertyDecorator {
  return function(target: Object, propertyKey: string | symbol) {
    // Get existing fields or initialize empty array
    const existingFields: EntityFieldDefinition[] = Reflect.getMetadata(
      FIELD_METADATA_KEY, 
      target.constructor
    ) || [];
    
    // Ensure options is an object
    const safeOptions = options || {};
    
    // Infer type from TypeScript if not provided
    if (!safeOptions.type) {
      const reflectType = Reflect.getMetadata('design:type', target, propertyKey);
      if (reflectType) {
        const typeName = reflectType.name.toLowerCase();
        // Map TypeScript types to our type system
        switch (typeName) {
          case 'number': safeOptions.type = 'number'; break;
          case 'boolean': safeOptions.type = 'boolean'; break;
          case 'date': safeOptions.type = 'date'; break;
          case 'array': safeOptions.type = 'array'; break;
          default: safeOptions.type = 'string';
        }
      } else {
        safeOptions.type = 'string'; // Default to string if type cannot be inferred
      }
    }
    
    // Generate snake_case column name if not provided
    const columnName = safeOptions.columnName || 
      propertyKey.toString().replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    
    // Create field definition
    const field: EntityFieldDefinition = {
      name: propertyKey.toString(),
      columnName,
      type: safeOptions.type || 'string',
      required: safeOptions.required !== false,
      unique: safeOptions.unique === true,
      enum: safeOptions.enum,
      default: safeOptions.default,
      primaryKey: safeOptions.primaryKey === true,
      autoIncrement: safeOptions.autoIncrement === true
    };
    
    // Add to existing fields
    existingFields.push(field);
    
    // Update metadata on the class
    Reflect.defineMetadata(
      FIELD_METADATA_KEY, 
      existingFields, 
      target.constructor
    );
  };
}

/**
 * Get model metadata from a class
 * @param target Target class
 */
export function getModelMetadata(target: any) {
  return Reflect.getMetadata(MODEL_METADATA_KEY, target);
}

/**
 * Get field metadata from a class
 * @param target Target class
 */
export function getFieldsMetadata(target: any) {
  return Reflect.getMetadata(FIELD_METADATA_KEY, target) || [];
}
