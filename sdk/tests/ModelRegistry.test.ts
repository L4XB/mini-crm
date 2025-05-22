import { ModelRegistry } from '../src/schema/ModelRegistry';
import { Model, Field } from '../src/schema/decorators';

describe('ModelRegistry', () => {
  let registry: ModelRegistry;

  beforeEach(() => {
    // Reset the registry before each test
    registry = new ModelRegistry();
  });

  test('should register a model', () => {
    // Define a test model using decorators
    @Model()
    class TestModel {
      @Field({ primaryKey: true })
      id: number;

      @Field()
      name: string;
    }

    // Register the model
    registry.registerModel(TestModel);

    // Check if model is registered
    const models = registry.getAllModels();
    expect(models.length).toBe(1);
    expect(models[0].name).toBe('TestModel');
    expect(models[0].fields.length).toBe(2);
  });

  test('should handle field types correctly', () => {
    @Model()
    class TypeTestModel {
      @Field({ primaryKey: true })
      id: number;

      @Field({ type: 'string' })
      stringField: string;

      @Field({ type: 'number' })
      numberField: number;

      @Field({ type: 'boolean' })
      booleanField: boolean;

      @Field({ type: 'date' })
      dateField: Date;
    }

    registry.registerModel(TypeTestModel);
    const models = registry.getAllModels();
    const model = models[0];

    // Check field types
    const fields = model.fields;
    expect(fields.find(f => f.name === 'id')?.type).toBe('number');
    expect(fields.find(f => f.name === 'stringField')?.type).toBe('string');
    expect(fields.find(f => f.name === 'numberField')?.type).toBe('number');
    expect(fields.find(f => f.name === 'booleanField')?.type).toBe('boolean');
    expect(fields.find(f => f.name === 'dateField')?.type).toBe('date');
  });

  test('should apply field options correctly', () => {
    @Model()
    class Contact {
      @Field({ primaryKey: true })
      id: number;

      @Field()
      name: string;

      @Field({ type: 'string', required: false })
      email?: string;

      @Field({ type: 'string', required: false })
      phone?: string;
    }

    registry.registerModel(Contact);
    const models = registry.getAllModels();
    const model = models[0];

    // Check field options
    const fields = model.fields;
    const idField = fields.find(f => f.name === 'id');
    const emailField = fields.find(f => f.name === 'email');
    const phoneField = fields.find(f => f.name === 'phone');

    expect(idField?.primaryKey).toBe(true);
    
    expect(emailField?.required).toBe(false);
    expect(phoneField?.required).toBe(false);
  });

  test('should clear all models', () => {
    @Model()
    class User {
      @Field({ primaryKey: true })
      id: number;

      @Field({ type: 'string' })
      username: string;

      @Field({ type: 'string' })
      email: string;
    }

    registry.registerModel(User);
    expect(registry.getAllModels().length).toBe(1);

    registry.clear();
    expect(registry.getAllModels().length).toBe(0);
  });
});
