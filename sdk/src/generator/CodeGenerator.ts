import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import { EntityDefinition } from '../types';
import { ModelRegistry } from '../schema/ModelRegistry';
import { Logger } from '../utils/Logger';
import { getTemplatePath, getTemplatesDir } from '../utils/paths';

/**
 * Code generator for creating Go code from TypeScript model definitions
 */
export class CodeGenerator {
  private modelRegistry: ModelRegistry;
  private logger: Logger;
  private templatesDir: string;

  /**
   * Create a new code generator
   * @param modelRegistry Model registry with all registered models
   * @param logger Logger instance
   */
  constructor(modelRegistry: ModelRegistry, logger: Logger) {
    this.modelRegistry = modelRegistry;
    this.logger = logger;
    this.templatesDir = getTemplatesDir();
    
    // Register Handlebars helpers
    this.registerHandlebarsHelpers();
  }

  /**
   * Generate Go code for all registered models
   * @param basePath Base path where code will be generated
   */
  async generateCode(basePath: string): Promise<void> {
    this.logger.info('Generating code for custom models...');
    
    try {
      // Get all models
      const models = this.modelRegistry.getAllModels();
      if (models.length === 0) {
        this.logger.warn('No models found to generate code for');
        return;
      }
      
      // Create output directories
      const outputBase = path.join(basePath, 'generated');
      const modelsDir = path.join(outputBase, 'models');
      const controllersDir = path.join(outputBase, 'controllers');
      const routesDir = path.join(outputBase, 'routes');
      
      await fs.ensureDir(outputBase);
      await fs.ensureDir(modelsDir);
      await fs.ensureDir(controllersDir);
      await fs.ensureDir(routesDir);
      
      // Generate Go module file
      await this.generateGoModFile(outputBase);
      
      // Generate models
      await this.generateModels(models, modelsDir);
      
      // Generate controllers
      await this.generateControllers(models, controllersDir);
      
      // Generate routes
      await this.generateRoutes(models, routesDir);
      
      // Generate main file
      await this.generateMainFile(models, basePath);
      
      this.logger.info('Code generation completed successfully');
    } catch (error) {
      this.logger.error('Failed to generate code', error);
      throw error;
    }
  }
  
  /**
   * Generate Go module file
   * @param outputDir Output directory
   */
  private async generateGoModFile(outputDir: string): Promise<void> {
    const goModContent = `module github.com/deinname/mini-crm-backend

go 1.17

require (
	github.com/gin-gonic/gin v1.8.1
	github.com/go-playground/validator/v10 v10.11.0
	github.com/golang-jwt/jwt/v4 v4.4.2
	github.com/joho/godotenv v1.4.0
	github.com/sirupsen/logrus v1.9.0
	golang.org/x/crypto v0.0.0-20220829220503-c86fa9a7ed90
	gorm.io/driver/postgres v1.3.9
	gorm.io/gorm v1.23.8
)
`;
    
    const goModPath = path.join(outputDir, 'go.mod');
    await fs.writeFile(goModPath, goModContent);
    this.logger.debug(`Generated go.mod at ${goModPath}`);
  }

  /**
   * Generate model files
   * @param models Model definitions
   * @param outputDir Output directory
   */
  private async generateModels(models: EntityDefinition[], outputDir: string): Promise<void> {
    try {
      const templatePath = getTemplatePath('model.go.hbs');
      
      // Load template
      const templateContent = await fs.readFile(templatePath, 'utf8');
      const template = Handlebars.compile(templateContent);
      
      // Generate each model
      for (const model of models) {
        this.logger.debug(`Generating model for ${model.name}...`);
        
        const output = template({
          model,
          timestamp: new Date().toISOString()
        });
        
        const outputFile = path.join(outputDir, `${model.name.toLowerCase()}.go`);
        await fs.writeFile(outputFile, output);
        
        this.logger.debug(`Generated model ${model.name} at ${outputFile}`);
      }
    } catch (error) {
      this.logger.error(`Failed to generate models: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Generate controller files
   * @param models Model definitions
   * @param outputDir Output directory
   */
  private async generateControllers(models: EntityDefinition[], outputDir: string): Promise<void> {
    try {
      const templatePath = getTemplatePath('controller.go.hbs');
      
      // Load template
      const templateContent = await fs.readFile(templatePath, 'utf8');
      const template = Handlebars.compile(templateContent);
      
      // Generate each controller
      for (const model of models) {
        this.logger.debug(`Generating controller for ${model.name}...`);
        
        const output = template({
          model,
          timestamp: new Date().toISOString()
        });
        
        const outputFile = path.join(outputDir, `${model.name.toLowerCase()}_controller.go`);
        await fs.writeFile(outputFile, output);
        
        this.logger.debug(`Generated controller ${model.name} at ${outputFile}`);
      }
    } catch (error) {
      this.logger.error(`Failed to generate controllers: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Generate route files
   * @param models Model definitions
   * @param outputDir Output directory
   */
  private async generateRoutes(models: EntityDefinition[], outputDir: string): Promise<void> {
    try {
      const templatePath = getTemplatePath('routes.go.hbs');
      
      // Load template
      const templateContent = await fs.readFile(templatePath, 'utf8');
      const template = Handlebars.compile(templateContent);
      
      // Generate routes file
      this.logger.debug('Generating routes file...');
      
      const output = template({
        models,
        timestamp: new Date().toISOString()
      });
      
      const outputFile = path.join(outputDir, 'custom_routes.go');
      await fs.writeFile(outputFile, output);
      
      this.logger.debug(`Generated routes at ${outputFile}`);
    } catch (error) {
      this.logger.error(`Failed to generate routes: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Generate main file that includes custom models
   * @param models Model definitions
   * @param basePath Base path
   */
  private async generateMainFile(models: EntityDefinition[], basePath: string): Promise<void> {
    try {
      const templatePath = getTemplatePath('main.go.hbs');
      
      // Load template
      const templateContent = await fs.readFile(templatePath, 'utf8');
      const template = Handlebars.compile(templateContent);
      
      // Generate main file
      this.logger.debug('Generating main file...');
      
      const output = template({
        models,
        timestamp: new Date().toISOString()
      });
      
      const outputFile = path.join(basePath, 'generated/main.go');
      await fs.writeFile(outputFile, output);
      
      this.logger.debug(`Generated main file at ${outputFile}`);
    } catch (error) {
      this.logger.error(`Failed to generate main file: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Register Handlebars helpers for templates
   */
  private registerHandlebarsHelpers(): void {
    // Convert to Go type
    Handlebars.registerHelper('goType', (type: string, options?: any) => {
      switch (type) {
        case 'string':
          return 'string';
        case 'number':
          return 'float64';
        case 'boolean':
          return 'bool';
        case 'date':
          return 'time.Time';
        case 'reference':
          return 'uint';
        case 'array':
          if (options && options.hash && options.hash.of) {
            const ofType = this.goTypeMap(options.hash.of);
            return `[]${ofType}`;
          }
          return '[]interface{}';
        default:
          return 'interface{}';
      }
    });
    
    // Convert to camelCase
    Handlebars.registerHelper('camelCase', (str: string) => {
      if (!str) return '';
      
      // Handle case where string is already PascalCase
      if (/^[A-Z]/.test(str)) {
        return str.charAt(0).toLowerCase() + str.slice(1);
      }
      
      return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    });
    
    // Convert to PascalCase
    Handlebars.registerHelper('pascalCase', (str: string) => {
      if (!str) return '';
      
      let result = str;
      
      // Convert snake_case to camelCase
      result = result.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      
      // Capitalize first letter
      return result.charAt(0).toUpperCase() + result.slice(1);
    });
    
    // Convert to snake_case
    Handlebars.registerHelper('snakeCase', (str: string) => {
      if (!str) return '';
      return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    });
    
    // Check if two values are equal
    Handlebars.registerHelper('eq', function(this: any, a: any, b: any, options: any) {
      return a === b ? options.fn(this) : options.inverse(this);
    });
    
    // Safe string helper
    Handlebars.registerHelper('safe', function(this: any, str: string) {
      return new Handlebars.SafeString(str);
    });
  }
  
  /**
   * Map TypeScript types to Go types
   * @param type TypeScript type
   * @returns Go type
   */
  private goTypeMap(type: string): string {
    switch (type) {
      case 'string':
        return 'string';
      case 'number':
        return 'float64';
      case 'boolean':
        return 'bool';
      case 'date':
        return 'time.Time';
      case 'reference':
        return 'uint';
      default:
        return 'interface{}';
    }
  }
}
