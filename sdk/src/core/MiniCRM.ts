import { MiniCRMConfig } from '../types';
import { ApiClient } from '../client/ApiClient';
import { LocalServer } from '../server/LocalServer';
import { ModelRegistry } from '../schema/ModelRegistry';
import { CodeGenerator } from '../generator/CodeGenerator';
import { Logger } from '../utils/Logger';

/**
 * Main SDK class that serves as the entry point for the Mini CRM SDK
 */
export class MiniCRM {
  private config: MiniCRMConfig;
  private apiClient: ApiClient;
  private localServer: LocalServer;
  private registry: ModelRegistry;
  private codeGenerator: CodeGenerator;
  private logger: Logger;
  
  /**
   * Create a new MiniCRM SDK instance
   * @param config Configuration for the SDK
   */
  constructor(config: Partial<MiniCRMConfig>) {
    this.config = this.validateConfig(config);
    this.logger = new Logger(this.config.serverConfig.logLevel || 'info');
    this.registry = new ModelRegistry();
    this.codeGenerator = new CodeGenerator(this.registry, this.logger);
    
    // Register custom models
    if (this.config.models && Array.isArray(this.config.models)) {
      this.config.models.forEach(model => {
        this.registry.registerModel(model);
      });
    }
    
    // Setup client
    const baseUrl = this.config.baseUrl || `http://${this.config.serverConfig.host || 'localhost'}:${this.config.serverConfig.port || 8080}`;
    this.apiClient = new ApiClient(baseUrl, this.logger);
    
    // Setup server
    this.localServer = new LocalServer(
      this.config,
      this.registry,
      this.codeGenerator,
      this.logger
    );
  }
  
  /**
   * Start the local server with the custom models
   * @returns Promise that resolves with server info (port and process id)
   */
  async startServer(): Promise<{ port: number; pid: number }> {
    this.logger.info('Starting Mini CRM with custom models...');
    
    try {
      // Generate code from models
      await this.generateCode();
      
      // Start the server
      await this.localServer.start();
      
      // For compatibility with tests, return server info
      // This assumes the server is running on the port specified in config
      return {
        port: this.config.serverConfig.port || 8080,
        pid: process.pid
      };
    } catch (error) {
      this.logger.error(`Failed to start Mini CRM: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Start the server (alias for startServer)
   * @returns Promise that resolves with server info (port and process id)
   */
  async start(): Promise<{ port: number; pid: number }> {
    return this.startServer();
  }
  
  /**
   * Stop the server (alias for stopServer)
   * @returns Promise that resolves when the server has stopped
   */
  async stop(): Promise<void> {
    return this.stopServer();
  }
  
  /**
   * Stop the local server
   * @returns Promise that resolves when the server has stopped
   */
  async stopServer(): Promise<void> {
    this.logger.info('Stopping Mini CRM server...');
    try {
      await this.localServer.stop();
      this.logger.info('Mini CRM server stopped successfully');
    } catch (error) {
      this.logger.error(`Failed to stop Mini CRM: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Register a model class in the registry
   * @param modelClass Model class decorated with @Model
   */
  registerModel(modelClass: any): void {
    this.registry.registerModel(modelClass);
  }

  /**
   * Generate code based on registered models
   * @param outputPath Optional custom output path
   */
  async generateCode(outputPath?: string): Promise<void> {
    const basePath = outputPath || this.config.basePath || process.cwd();
    await this.codeGenerator.generateCode(basePath);
  }

  /**
   * Get the API client to interact with the server
   * @returns API client instance
   */
  getApiClient(): ApiClient {
    return this.apiClient;
  }
  
  /**
   * Get the model registry
   * @returns Model registry instance
   */
  getModelRegistry(): ModelRegistry {
    return this.registry;
  }
  
  /**
   * Login to the Mini CRM API
   * @param email Email
   * @param password Password
   * @returns Auth token and user info
   */
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const authToken = await this.apiClient.login(email, password);
    // ApiClient already sets the token internally
    const user = await this.apiClient.getCurrentUser();
    return {
      token: authToken.token,
      user
    };
  }
  
  /**
   * Get user profile
   * @returns User profile
   */
  async getUserProfile(): Promise<any> {
    return await this.apiClient.getCurrentUser();
  }
  
  /**
   * Get contacts with pagination
   * @param options Pagination options
   * @returns Paginated contacts
   */
  async getContacts(options?: { page?: number; limit?: number }): Promise<{ contacts: any[]; total: number }> {
    const contacts = await this.apiClient.get<any[]>('/contacts', { params: options });
    return {
      contacts,
      total: contacts.length
    };
  }
  
  /**
   * Create custom entity
   * @param entityType Entity type
   * @param data Entity data
   * @returns Created entity
   */
  async createEntity(entityType: string, data: any): Promise<any> {
    return await this.apiClient.post(`/${entityType.toLowerCase()}`, data);
  }
  
  /**
   * Validate the configuration and set defaults
   * @param config Input configuration
   * @returns Validated configuration with defaults
   */
  private validateConfig(config: Partial<MiniCRMConfig>): MiniCRMConfig {
    if (!config) {
      throw new Error('Configuration is required');
    }
    
    // Create default configuration
    const defaultConfig: MiniCRMConfig = {
      models: [],
      dbConfig: {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'mini_crm'
      },
      serverConfig: {
        port: 8080,
        host: 'localhost',
        logLevel: 'info'
      },
      apiVersion: 'v1',
      generateTestData: false,
      disableAuth: false
    };
    
    // Merge with provided config
    const mergedConfig: MiniCRMConfig = { 
      ...defaultConfig,
      ...config,
      dbConfig: { ...defaultConfig.dbConfig, ...(config.dbConfig || {}) },
      serverConfig: { ...defaultConfig.serverConfig, ...(config.serverConfig || {}) }
    };
    
    return mergedConfig;
  }
}
