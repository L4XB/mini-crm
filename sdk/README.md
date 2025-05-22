# Mini CRM SDK

A comprehensive SDK for easily building custom CRM applications with the Mini CRM backend.

## Features

- **TypeScript Client Library**: Fully typed API client for interacting with the Mini CRM backend
- **Custom Model Definition**: Define your own data models using TypeScript decorators
- **Code Generation**: Automatically generate Go code for your custom models
- **Local Development Server**: Run a local server with your custom models for development
- **CLI Tool**: Command-line interface for project initialization and management

## Installation

```bash
npm install mini-crm-sdk
```

## Quick Start

### Define Custom Models

```typescript
import { MiniCRM, Model, Field } from 'mini-crm-sdk';

// Define a custom model
@Model()
class Product {
  @Field({ type: 'string', required: true })
  name: string;
  
  @Field({ type: 'number', required: true })
  price: number;
  
  @Field({ type: 'string', enum: ['available', 'discontinued', 'out-of-stock'] })
  status: string;
  
  @Field({ type: 'reference', to: 'User' })
  createdBy: string;
}

// Initialize the CRM
const crm = new MiniCRM({
  models: [Product],
  dbConfig: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'mini_crm_custom'
  },
  serverConfig: {
    port: 8082
  }
});

// Start the server
crm.start().then(() => {
  console.log('Mini CRM server started');
});
```

### Use the API Client

```typescript
import { MiniCRM } from 'mini-crm-sdk';

// Create an instance
const crm = new MiniCRM({/* config */});

// Get the API client
const client = crm.getClient();

// Login
await client.login('admin@example.com', 'admin123');

// Use built-in endpoints
const users = await client.users.getAll();
const contacts = await client.contacts.getAll();

// Use custom model endpoints
const productClient = client.getEntityClient('Product');
const products = await productClient.getAll();
```

## Model Decorators

### @Model

Decorator for model classes that defines the entity in the database.

Options:
- `name`: Custom name for the model (defaults to class name)
- `tableName`: Custom table name (defaults to snake_case of model name)
- `description`: Description of the model

Example:
```typescript
@Model({
  name: 'Product',
  tableName: 'products',
  description: 'Product entity for e-commerce'
})
class Product {
  // fields
}
```

### @Field

Decorator for model properties that defines the columns in the database table.

Options:
- `type`: Field type ('string', 'number', 'boolean', 'date', 'reference', 'array')
- `required`: Whether the field is required (default: true)
- `unique`: Whether the field value should be unique (default: false)
- `enum`: Array of allowed values for string fields
- `to`: Target entity for reference fields
- `default`: Default value for the field
- `primaryKey`: Whether this field is the primary key
- `autoIncrement`: Whether this field auto-increments
- `columnName`: Custom column name in the database

Example:
```typescript
@Field({
  type: 'string',
  required: true,
  unique: true
})
name: string;

@Field({
  type: 'reference',
  to: 'User'
})
createdBy: string;
```

## CLI Usage

The SDK includes a command-line interface for project management:

```bash
# Initialize a new project
npx mini-crm init

# Generate code from models
npx mini-crm generate --config ./mini-crm.config.js

# Start the server
npx mini-crm start --config ./mini-crm.config.js
```

## API Client Reference

The API client provides methods for all built-in entities:

- `users`: User management
- `contacts`: Contact management
- `deals`: Deal management
- `tasks`: Task management
- `notes`: Note management
- `settings`: Settings management

For custom entities, use the `getEntityClient(entityName)` method.

## Configuration

The MiniCRM constructor accepts a configuration object with the following properties:

```typescript
interface MiniCRMConfig {
  // Custom model classes (must be decorated with @Model)
  models: any[];
  
  // Database configuration
  dbConfig: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl?: boolean;
  };
  
  // Server configuration
  serverConfig: {
    port: number;
    host?: string;
    jwtSecret?: string;
    jwtExpirationHours?: number;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    allowedOrigins?: string[];
    enableSwagger?: boolean;
  };
  
  // Optional configuration
  basePath?: string;
  apiVersion?: string;
  generateTestData?: boolean;
  disableAuth?: boolean;
}
```

## Requirements

- Node.js 16+
- Go 1.17+
- PostgreSQL 12+

## License

MIT
