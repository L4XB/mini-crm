import { ApiClient } from '../src/client/ApiClient';
import axios from 'axios';
import { Logger } from '../src/utils/Logger';

// Mock axios and Logger
jest.mock('axios');
jest.mock('../src/utils/Logger');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const MockedLogger = Logger as jest.MockedClass<typeof Logger>;

describe('ApiClient', () => {
  let apiClient: ApiClient;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup axios mock for create method
    mockedAxios.create.mockReturnValue(mockedAxios);
    
    // Create a new ApiClient instance
    apiClient = new ApiClient('http://localhost:8080', new MockedLogger());
  });

  test('should construct API client correctly', () => {
    // Check that the client uses the correct base URL
    expect((apiClient as any).baseUrl).toBe('http://localhost:8080');
  });

  test('login should call the correct endpoint with proper data', async () => {
    // Setup mock response
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        token: 'fake-jwt-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'admin'
        }
      }
    });
    
    // Call login method
    const response = await apiClient.login('testuser', 'password');
    
    // Verify axios was called with correct parameters
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'testuser', password: 'password' }
    );
    
    // Verify response was processed correctly
    expect(response.token).toBe('fake-jwt-token');
    expect(response.user.username).toBe('testuser');
  });

  test('register should call the correct endpoint with proper data', async () => {
    // Setup mock response
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        token: 'fake-jwt-token',
        user: {
          id: 1,
          username: 'newuser',
          email: 'new@example.com',
          role: 'user'
        }
      }
    });
    
    // Call register method
    const response = await apiClient.register({
      username: 'newuser',
      email: 'new@example.com',
      password: 'securepassword'
    });
    
    // Verify axios was called with correct parameters
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/auth/register',
      {
        username: 'newuser',
        email: 'new@example.com',
        password: 'securepassword'
      }
    );
    
    // Verify response was processed correctly
    expect(response.token).toBe('fake-jwt-token');
    expect(response.user.username).toBe('newuser');
  });

  test('getUserProfile should call the correct endpoint with auth header', async () => {
    // Set auth token
    apiClient.setAuthToken('fake-jwt-token');
    
    // Setup mock response
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'admin'
        }
      }
    });
    
    // Call getUserProfile method
    const response = await apiClient.getUserProfile();
    
    // Verify axios was called with correct parameters and headers
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/users/profile',
      {
        headers: {
          Authorization: 'Bearer fake-jwt-token'
        }
      }
    );
    
    // Verify response was processed correctly
    expect(response.username).toBe('testuser');
  });

  test('getContacts should use pagination parameters correctly', async () => {
    // Set auth token
    apiClient.setAuthToken('fake-jwt-token');
    
    // Setup mock response
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        contacts: [
          { id: 1, name: 'Contact 1', email: 'contact1@example.com' },
          { id: 2, name: 'Contact 2', email: 'contact2@example.com' }
        ],
        total: 2
      }
    });
    
    // Call getContacts method with pagination
    const response = await apiClient.getContacts({ page: 1, limit: 10 });
    
    // Verify axios was called with correct parameters and headers
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/contacts',
      {
        headers: {
          Authorization: 'Bearer fake-jwt-token'
        },
        params: {
          page: 1,
          limit: 10
        }
      }
    );
    
    // Verify response was processed correctly
    expect(response.contacts.length).toBe(2);
    expect(response.total).toBe(2);
  });

  test('createEntity should handle custom entities correctly', async () => {
    // Set auth token
    apiClient.setAuthToken('fake-jwt-token');
    
    // Setup mock response for a custom entity
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        id: 1,
        name: 'Product A',
        price: 99.99,
        category: 'Electronics'
      }
    });
    
    // Create a custom entity
    const productData = {
      name: 'Product A',
      price: 99.99,
      category: 'Electronics'
    };
    
    // Call createEntity method for a custom entity
    const response = await apiClient.createEntity('products', productData);
    
    // Verify axios was called with correct parameters and headers
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/products',
      productData,
      {
        headers: {
          Authorization: 'Bearer fake-jwt-token',
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Verify response was processed correctly
    expect(response.id).toBe(1);
    expect(response.name).toBe('Product A');
    expect(response.price).toBe(99.99);
  });

  test('error handling should work correctly', async () => {
    // Setup mock error response
    const errorResponse = {
      response: {
        status: 401,
        data: {
          error: 'Invalid credentials'
        }
      }
    };
    
    mockedAxios.post.mockRejectedValueOnce(errorResponse);
    
    // Call login method and expect it to throw
    await expect(apiClient.login('testuser', 'wrongpassword'))
      .rejects.toMatchObject({
        status: 401,
        message: 'Invalid credentials'
      });
  });
});
