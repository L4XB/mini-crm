#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { MiniCRM } from '../core/MiniCRM';
import { CodeGenerator } from '../generator/CodeGenerator';
import { ModelRegistry } from '../schema/ModelRegistry';
import { Logger } from '../utils/Logger';

const logger = new Logger('info');
const packageJson = require('../../package.json');

// Create CLI program
const program = new Command();

program
  .name('mini-crm')
  .description('Mini CRM CLI tool')
  .version(packageJson.version);

/**
 * Initialize a new Mini CRM project
 */
program
  .command('init')
  .description('Initialize a new Mini CRM project')
  .option('-d, --directory <directory>', 'Project directory', '.')
  .action(async (options) => {
    logger.info('Initializing new Mini CRM project...');

    const projectDir = path.resolve(options.directory);
    await fs.ensureDir(projectDir);

    // Check if directory is empty
    const files = await fs.readdir(projectDir);
    if (files.length > 0) {
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'Directory is not empty. Proceed anyway?',
          default: false
        }
      ]);

      if (!proceed) {
        logger.info('Initialization canceled');
        return;
      }
    }

    // Get project info
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Project name:',
        default: path.basename(projectDir)
      },
      {
        type: 'input',
        name: 'port',
        message: 'Server port:',
        default: '8081'
      },
      {
        type: 'input',
        name: 'dbHost',
        message: 'Database host:',
        default: 'localhost'
      },
      {
        type: 'input',
        name: 'dbPort',
        message: 'Database port:',
        default: '5432'
      },
      {
        type: 'input',
        name: 'dbUser',
        message: 'Database user:',
        default: 'postgres'
      },
      {
        type: 'input',
        name: 'dbPassword',
        message: 'Database password:',
        default: 'postgres'
      },
      {
        type: 'input',
        name: 'dbName',
        message: 'Database name:',
        default: (answers: { name: string; }) => `${answers.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_db`
      }
    ]);

    // Create project files
    try {
      // Create package.json
      const packageJson = {
        name: answers.name,
        version: '1.0.0',
        description: 'Mini CRM project',
        main: 'index.js',
        scripts: {
          start: 'ts-node index.ts'
        },
        dependencies: {
          'mini-crm-sdk': '^1.0.0',
          'typescript': '^5.0.0',
          'ts-node': '^10.9.1'
        }
      };

      await fs.writeJSON(path.join(projectDir, 'package.json'), packageJson, { spaces: 2 });

      // Create index.ts
      const indexContent = `import { MiniCRM, Model, Field } from 'mini-crm-sdk';

// Define your custom models here
@Model()
class Product {
  @Field({ type: 'string', required: true })
  name: string;
  
  @Field({ type: 'number', required: true })
  price: number;
  
  @Field({ type: 'string', enum: ['available', 'discontinued', 'out-of-stock'] })
  status: string;
}

// Initialize the CRM
const crm = new MiniCRM({
  models: [Product],
  dbConfig: {
    host: '${answers.dbHost}',
    port: ${answers.dbPort},
    user: '${answers.dbUser}',
    password: '${answers.dbPassword}',
    database: '${answers.dbName}'
  },
  serverConfig: {
    port: ${answers.port}
  }
});

// Start the server
crm.start().then(() => {
  console.log('Mini CRM server started');
}).catch(error => {
  console.error('Failed to start Mini CRM server:', error);
});
`;

      await fs.writeFile(path.join(projectDir, 'index.ts'), indexContent);

      // Create tsconfig.json
      const tsconfigContent = {
        compilerOptions: {
          target: 'ES2020',
          module: 'commonjs',
          strict: true,
          esModuleInterop: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true
        }
      };

      await fs.writeJSON(path.join(projectDir, 'tsconfig.json'), tsconfigContent, { spaces: 2 });

      // Create .env file
      const envContent = `DB_HOST=${answers.dbHost}
DB_PORT=${answers.dbPort}
DB_USER=${answers.dbUser}
DB_PASSWORD=${answers.dbPassword}
DB_NAME=${answers.dbName}
PORT=${answers.port}
`;

      await fs.writeFile(path.join(projectDir, '.env'), envContent);

      // Create README.md
      const readmeContent = `# ${answers.name}

A Mini CRM project created with Mini CRM SDK.

## Getting Started

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Start the server:
   \`\`\`
   npm start
   \`\`\`

3. Access the API at http://localhost:${answers.port}/api/v1
   Swagger UI is available at http://localhost:${answers.port}/swagger/index.html

## Custom Models

Define your custom models in \`index.ts\` using the \`@Model\` and \`@Field\` decorators.
`;

      await fs.writeFile(path.join(projectDir, 'README.md'), readmeContent);

      // Create .gitignore
      const gitignoreContent = `node_modules/
.env
generated/
dist/
*.log
`;

      await fs.writeFile(path.join(projectDir, '.gitignore'), gitignoreContent);

      logger.info(`Project initialized at ${projectDir}`);
      logger.info('Run the following commands to get started:');
      logger.info(chalk.bold(`cd ${options.directory}`));
      logger.info(chalk.bold('npm install'));
      logger.info(chalk.bold('npm start'));
    } catch (error) {
      logger.error('Failed to initialize project', error);
      process.exit(1);
    }
  });

/**
 * Generate code from a configuration file
 */
program
  .command('generate')
  .description('Generate code from models')
  .option('-c, --config <config>', 'Configuration file path')
  .action(async (options) => {
    try {
      // Load configuration
      const configPath = path.resolve(options.config || './mini-crm.config.js');

      if (!await fs.pathExists(configPath)) {
        logger.error(`Configuration file not found at ${configPath}`);
        process.exit(1);
      }

      const config = require(configPath);

      // Create model registry
      const modelRegistry = new ModelRegistry();

      // Register models
      if (config.models && Array.isArray(config.models)) {
        for (const model of config.models) {
          modelRegistry.registerModel(model);
        }
      }

      // Create code generator
      const codeGenerator = new CodeGenerator(modelRegistry, logger);

      // Generate code
      await codeGenerator.generateCode(process.cwd());

      logger.info('Code generation completed');
    } catch (error) {
      logger.error('Failed to generate code', error);
      process.exit(1);
    }
  });

/**
 * Start the server
 */
program
  .command('start')
  .description('Start the Mini CRM server')
  .option('-c, --config <config>', 'Configuration file path')
  .action(async (options) => {
    try {
      // Load configuration
      const configPath = path.resolve(options.config || './mini-crm.config.js');

      if (!await fs.pathExists(configPath)) {
        logger.error(`Configuration file not found at ${configPath}`);
        process.exit(1);
      }

      const config = require(configPath);

      // Create Mini CRM instance
      const crm = new MiniCRM(config);

      // Start server
      await crm.start();

      // Handle signals for graceful shutdown
      process.on('SIGINT', async () => {
        logger.info('Received SIGINT, shutting down...');
        await crm.stop();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        logger.info('Received SIGTERM, shutting down...');
        await crm.stop();
        process.exit(0);
      });

      logger.info('Server started. Press Ctrl+C to stop.');
    } catch (error) {
      logger.error('Failed to start server', error);
      process.exit(1);
    }
  });

// Parse arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
