import { spawn, ChildProcess } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { MiniCRMConfig } from '../types';
import { ModelRegistry } from '../schema/ModelRegistry';
import { CodeGenerator } from '../generator/CodeGenerator';
import { Logger } from '../utils/Logger';

/**
 * Local server for running the Mini CRM backend with custom models
 */
export class LocalServer {
  private config: MiniCRMConfig;
  private modelRegistry: ModelRegistry;
  private codeGenerator: CodeGenerator;
  private logger: Logger;
  private serverProcess: ChildProcess | null = null;
  private isRunning: boolean = false;
  private outputDir: string;

  /**
   * Create a new local server instance
   * @param config MiniCRM configuration
   * @param modelRegistry Model registry with all registered models
   * @param codeGenerator Code generator for custom models
   * @param logger Logger instance
   */
  constructor(
    config: MiniCRMConfig,
    modelRegistry: ModelRegistry,
    codeGenerator: CodeGenerator,
    logger: Logger
  ) {
    this.config = config;
    this.modelRegistry = modelRegistry;
    this.codeGenerator = codeGenerator;
    this.logger = logger;
    this.outputDir = path.join(config.basePath || process.cwd(), 'generated');
  }

  /**
   * Start the local server
   * @returns Promise that resolves when the server is running
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Server is already running');
      return;
    }

    // Create output directory
    await fs.ensureDir(this.outputDir);

    // Generate environment file
    await this.generateEnvFile();

    // Build and start the server
    try {
      // First check if Go is installed
      await this.checkGoInstallation();

      // Generate the code
      await this.codeGenerator.generateCode(this.config.basePath || process.cwd());

      // Install dependencies
      await this.installDependencies();

      // Start the server
      await this.startServer();

      this.isRunning = true;
    } catch (error) {
      this.logger.error('Failed to start server', error);
      throw error;
    }
  }

  /**
   * Stop the local server
   * @returns Promise that resolves when the server has stopped
   */
  async stop(): Promise<void> {
    if (!this.isRunning || !this.serverProcess) {
      this.logger.warn('Server is not running');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      // Kill the process
      this.serverProcess!.kill('SIGTERM');

      // Set timeout for forced kill
      const timeout = setTimeout(() => {
        if (this.serverProcess) {
          this.logger.warn('Server did not exit gracefully, forcing kill');
          this.serverProcess.kill('SIGKILL');
        }
      }, 5000);

      // Listen for exit
      this.serverProcess!.on('exit', () => {
        clearTimeout(timeout);
        this.isRunning = false;
        this.serverProcess = null;
        this.logger.info('Server stopped');
        resolve();
      });

      // Listen for error
      this.serverProcess!.on('error', (error) => {
        clearTimeout(timeout);
        this.isRunning = false;
        this.serverProcess = null;
        this.logger.error('Error stopping server', error);
        reject(error);
      });
    });
  }

  /**
   * Check if Go is installed
   * @returns Promise that resolves if Go is installed
   */
  private async checkGoInstallation(): Promise<void> {
    this.logger.info('Checking Go installation...');

    return new Promise<void>((resolve, reject) => {
      const process = spawn('go', ['version']);

      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.on('error', (error) => {
        this.logger.error('Go is not installed or not in PATH', error);
        reject(new Error('Go is not installed or not in PATH. Please install Go to use this SDK.'));
      });

      process.on('exit', (code) => {
        if (code === 0) {
          this.logger.info(`Go is installed: ${output.trim()}`);
          resolve();
        } else {
          reject(new Error(`Go check failed with exit code ${code}`));
        }
      });
    });
  }

  /**
   * Install Go dependencies for the generated code
   * @returns Promise that resolves when dependencies are installed
   */
  private async installDependencies(): Promise<void> {
    this.logger.info('Installing Go dependencies...');

    return new Promise<void>((resolve, reject) => {
      const goProcess = spawn('go', ['mod', 'tidy'], {
        cwd: this.outputDir,
        env: { ...process.env, GO111MODULE: 'on' }
      });

      goProcess.stdout.on('data', (data: Buffer) => {
        this.logger.debug(`go mod tidy: ${data.toString().trim()}`);
      });

      goProcess.stderr.on('data', (data: Buffer) => {
        this.logger.debug(`go mod tidy stderr: ${data.toString().trim()}`);
      });

      goProcess.on('error', (error: Error) => {
        this.logger.error('Failed to install dependencies', error);
        reject(error);
      });

      goProcess.on('exit', (code: number | null) => {
        if (code === 0) {
          this.logger.info('Dependencies installed successfully');
          resolve();
        } else {
          reject(new Error(`go mod tidy failed with exit code ${code}`));
        }
      });
    });
  }

  /**
   * Start the server process
   * @returns Promise that resolves when the server is running
   */
  private async startServer(): Promise<void> {
    this.logger.info('Starting server...');

    return new Promise<void>((resolve, reject) => {
      // Build environment variables
      const env = {
        ...process.env,
        DB_HOST: this.config.dbConfig.host,
        DB_PORT: this.config.dbConfig.port.toString(),
        DB_USER: this.config.dbConfig.user,
        DB_PASSWORD: this.config.dbConfig.password,
        DB_NAME: this.config.dbConfig.database,
        JWT_SECRET_KEY: this.config.serverConfig.jwtSecret || '',
        JWT_EXPIRATION_HOURS: (this.config.serverConfig.jwtExpirationHours || 24).toString(),
        PORT: (this.config.serverConfig.port || 8080).toString(),
        ENV: 'development',
        ALLOWED_ORIGINS: this.config.serverConfig.allowedOrigins?.join(',') || '*',
        LOG_LEVEL: this.config.serverConfig.logLevel || 'info',
        ENABLE_SWAGGER: 'true',
        UI_TEST_MODE: this.config.disableAuth ? 'true' : 'false',
        SEED_TEST_DATA: this.config.generateTestData ? 'true' : 'false'
      };

      // Start the server process
      this.serverProcess = spawn('go', ['run', '.'], {
        cwd: this.outputDir,
        env
      });

      // Flag to track if server started successfully
      let serverStarted = false;

      // Listen for server output
      if (this.serverProcess && this.serverProcess.stdout) {
        this.serverProcess.stdout.on('data', (data: Buffer) => {
          const output = data.toString();
          this.logger.debug(`Server: ${output.trim()}`);

          // Check if server has started
          if (output.includes('Server started') || output.includes('listening')) {
            serverStarted = true;
            this.logger.info('Server started successfully');
            resolve();
          }
        });
      }

      // Listen for server errors
      if (this.serverProcess && this.serverProcess.stderr) {
        this.serverProcess.stderr.on('data', (data: Buffer) => {
          const output = data.toString();
          this.logger.debug(`Server error: ${output.trim()}`);

          // Some servers log to stderr, so check for success messages here too
          if (output.includes('Server started') || output.includes('listening')) {
            serverStarted = true;
            this.logger.info('Server started successfully');
            resolve();
          }
        });
      }

      // Listen for process error
      if (this.serverProcess) {
        this.serverProcess.on('error', (error: Error) => {
          this.logger.error('Failed to start server', error);
          this.serverProcess = null;
          this.isRunning = false;
          reject(error);
        });
      }

      // Listen for process exit
      if (this.serverProcess) {
        this.serverProcess.on('exit', (code: number | null) => {
          if (!serverStarted) {
            this.logger.error(`Server exited with code ${code} before starting`);
            reject(new Error(`Server exited with code ${code} before starting`));
          } else if (code !== 0) {
            this.logger.error(`Server exited with code ${code}`);
            this.isRunning = false;
            this.serverProcess = null;
          } else {
            this.logger.info('Server stopped');
            this.isRunning = false;
            this.serverProcess = null;
          }
        });
      }

      // Set timeout for server start
      setTimeout(() => {
        if (!serverStarted) {
          this.logger.error('Server failed to start within timeout');
          if (this.serverProcess) {
            this.serverProcess.kill('SIGKILL');
            this.serverProcess = null;
          }
          this.isRunning = false;
          reject(new Error('Server failed to start within timeout'));
        }
      }, 30000); // 30 second timeout
    });
  }

  /**
   * Generate environment file for the server
   * @returns Promise that resolves when the file is written
   */
  private async generateEnvFile(): Promise<void> {
    const envFile = path.join(this.outputDir, '.env');
    this.logger.debug(`Generating environment file at ${envFile}...`);

    const env = `
DB_HOST=${this.config.dbConfig.host}
DB_PORT=${this.config.dbConfig.port}
DB_USER=${this.config.dbConfig.user}
DB_PASSWORD=${this.config.dbConfig.password}
DB_NAME=${this.config.dbConfig.database}
JWT_SECRET_KEY=${this.config.serverConfig.jwtSecret || Math.random().toString(36).substring(2, 15)}
JWT_EXPIRATION_HOURS=${this.config.serverConfig.jwtExpirationHours || 24}
PORT=${this.config.serverConfig.port}
ENV=development
ALLOWED_ORIGINS=${this.config.serverConfig.allowedOrigins?.join(',') || '*'}
LOG_LEVEL=${this.config.serverConfig.logLevel || 'info'}
ENABLE_SWAGGER=true
UI_TEST_MODE=${this.config.disableAuth ? 'true' : 'false'}
SEED_TEST_DATA=${this.config.generateTestData ? 'true' : 'false'}
    `.trim();

    await fs.writeFile(envFile, env);
    this.logger.debug('Environment file generated');
  }
}
