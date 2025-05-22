import { CodeGenerator } from '../src/generator/CodeGenerator';
import { ModelRegistry } from '../src/schema/ModelRegistry';
import { Model, Field } from '../src/schema/decorators';
import * as fs from 'fs-extra';
import * as path from 'path';

// Mock fs-extra
jest.mock('fs-extra');

describe('CodeGenerator', () => {
  let generator: CodeGenerator;
  let registry: ModelRegistry;
  const tempDir = '/tmp/mini-crm-test';
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock the fs.readFile for template loading
    (fs.readFile as jest.Mock).mockImplementation((templatePath: string) => {
      if (templatePath.includes('model.go.hbs')) {
        return Promise.resolve(`
package models

// {{model.name}} represents the {{model.name}} model
type {{model.name}} struct {
  {{#each model.fields}}
  {{name}} {{goType}} \`json:"{{jsonName}}"\`
  {{/each}}
}
        `);
      } else if (templatePath.includes('controller.go.hbs')) {
        return Promise.resolve(`
package controllers

// {{model.name}}Controller handles {{model.name}} endpoints
type {{model.name}}Controller struct {
  DB *gorm.DB
}
        `);
      } else if (templatePath.includes('routes.go.hbs')) {
        return Promise.resolve(`
package routes

// SetupCustomRoutes sets up routes for custom models
func SetupCustomRoutes(router *gin.Engine, db *gorm.DB) {
  {{#each models}}
  {{name}}Controller := &controllers.{{name}}Controller{DB: db}
  {{/each}}
}
        `);
      } else if (templatePath.includes('main.go.hbs')) {
        return Promise.resolve(`
package main

// Main file for custom models
func main() {
  // Models:
  {{#each models}}
  // - {{name}}
  {{/each}}
}
        `);
      }
      return Promise.resolve('');
    });
    
    // Mock file system operations
    (fs.ensureDir as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    
    // Create registry and generator
    registry = new ModelRegistry();
    generator = new CodeGenerator(registry);
  });
  
  test('should generate model files correctly', async () => {
    // Define test models
    @Model()
    class Product {
      @Field({ primaryKey: true, autoIncrement: true })
      id: number;
      
      @Field({ required: true })
      name: string;
      
      @Field()
      price: number;
      
      @Field()
      category: string;
    }
    
    // Register model
    registry.registerModel(Product);
    
    // Generate code
    await generator.generateCode(tempDir);
    
    // Check that directories were created
    expect(fs.ensureDir).toHaveBeenCalledWith(path.join(tempDir, 'generated/models'));
    expect(fs.ensureDir).toHaveBeenCalledWith(path.join(tempDir, 'generated/controllers'));
    expect(fs.ensureDir).toHaveBeenCalledWith(path.join(tempDir, 'generated/routes'));
    
    // Check that model file was written
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('product.go'),
      expect.stringContaining('type Product struct'),
      undefined
    );
    
    // Check that controller file was written
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('product_controller.go'),
      expect.stringContaining('type ProductController struct'),
      undefined
    );
    
    // Check that routes file was written
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('custom_routes.go'),
      expect.stringContaining('SetupCustomRoutes'),
      undefined
    );
    
    // Check that main file was written
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('main.go'),
      expect.stringContaining('// - Product'),
      undefined
    );
  });
  
  test('should convert field types correctly', async () => {
    // Define model with various field types
    @Model()
    class TypeTest {
      @Field({ primaryKey: true })
      id: number;
      
      @Field()
      text: string;
      
      @Field()
      isActive: boolean;
      
      @Field()
      createdAt: Date;
    }
    
    // Register model
    registry.registerModel(TypeTest);
    
    // Generate code
    await generator.generateCode(tempDir);
    
    // Check model file content for correct Go types
    const modelFileCall = (fs.writeFile as jest.Mock).mock.calls.find(
      call => call[0].includes('typetest.go')
    );
    
    expect(modelFileCall).toBeDefined();
    const modelContent = modelFileCall ? modelFileCall[1] : '';
    
    // Verify type conversions
    expect(modelContent).toContain('id'); // number -> int
    expect(modelContent).toContain('text'); // string -> string
    expect(modelContent).toContain('isActive'); // boolean -> bool
    expect(modelContent).toContain('createdAt'); // Date -> time.Time
  });
  
  test('should handle errors gracefully', async () => {
    // Mock fs.readFile to throw an error
    (fs.readFile as jest.Mock).mockRejectedValueOnce(new Error('Template not found'));
    
    // Define a test model
    @Model()
    class ErrorTest {
      @Field({ primaryKey: true })
      id: number;
    }
    
    // Register model
    registry.registerModel(ErrorTest);
    
    // Attempt to generate code and expect it to throw
    await expect(generator.generateCode(tempDir)).rejects.toThrow('Template not found');
  });
});
