import { EntityDefinition, EntityFieldDefinition, EntityRelationDefinition } from '../types';
import { getModelMetadata, getFieldsMetadata } from './decorators';

/**
 * Registry for all models in the application
 */
export class ModelRegistry {
  private models: Map<string, EntityDefinition>;
  
  constructor() {
    this.models = new Map();
  }
  
  /**
   * Register a model class in the registry
   * @param modelClass Model class decorated with @Model
   */
  registerModel(modelClass: any): void {
    // Get model metadata from decorators
    const metadata = getModelMetadata(modelClass);
    if (!metadata) {
      throw new Error(`Class ${modelClass.name} is not decorated with @Model`);
    }
    
    // Get fields metadata from decorators
    const fields = getFieldsMetadata(modelClass);
    if (!fields || !fields.length) {
      throw new Error(`Class ${modelClass.name} has no fields decorated with @Field`);
    }
    
    // Create entity definition
    const entityDefinition: EntityDefinition = {
      name: metadata.name,
      tableName: metadata.tableName,
      fields: fields as EntityFieldDefinition[],
      relations: this.extractRelations(fields as EntityFieldDefinition[])
    };
    
    // Register model in the registry
    this.models.set(metadata.name, entityDefinition);
  }
  
  /**
   * Extract relation definitions from fields
   * @param fields Fields to extract relations from
   * @returns Extracted relation definitions
   */
  private extractRelations(fields: EntityFieldDefinition[]): EntityRelationDefinition[] {
    const relations: EntityRelationDefinition[] = [];
    
    for (const field of fields) {
      if (field.type === 'reference' && field.jsonType) {
        // Create relation definition based on field type
        relations.push({
          name: field.name,
          targetEntity: field.jsonType,
          type: 'many-to-one', // Default relation type
          foreignKey: field.columnName
        });
      }
    }
    
    return relations;
  }
  
  /**
   * Get a model by name
   * @param name Name of the model
   * @returns Model definition or undefined if not found
   */
  getModel(name: string): EntityDefinition | undefined {
    return this.models.get(name);
  }
  
  /**
   * Get all registered models
   * @returns Array of all model definitions
   */
  getAllModels(): EntityDefinition[] {
    return Array.from(this.models.values());
  }
  
  /**
   * Check if a model is registered
   * @param name Name of the model
   * @returns True if model is registered
   */
  hasModel(name: string): boolean {
    return this.models.has(name);
  }
  
  /**
   * Get the number of registered models
   * @returns Number of models
   */
  getModelCount(): number {
    return this.models.size;
  }
  
  /**
   * Clear all registered models
   */
  clear(): void {
    this.models.clear();
  }
}
