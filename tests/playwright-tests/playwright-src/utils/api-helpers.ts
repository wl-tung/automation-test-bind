import { APIRequestContext, request } from '@playwright/test';

/**
 * API testing helpers
 */
export class ApiHelpers {
  private apiContext: APIRequestContext;

  constructor(apiContext: APIRequestContext) {
    this.apiContext = apiContext;
  }

  /**
   * Create API context with base configuration
   */
  static async createApiContext(
    baseURL: string,
    headers?: Record<string, string>
  ): Promise<APIRequestContext> {
    return await request.newContext({
      baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  }

  /**
   * Perform GET request
   */
  async get(endpoint: string, options?: { params?: Record<string, any> }): Promise<any> {
    const response = await this.apiContext.get(endpoint, options);
    return {
      status: response.status(),
      data: await response.json(),
      headers: response.headers(),
    };
  }

  /**
   * Perform POST request
   */
  async post(endpoint: string, data?: any, options?: Record<string, any>): Promise<any> {
    const response = await this.apiContext.post(endpoint, {
      data,
      ...options,
    });
    return {
      status: response.status(),
      data: await response.json(),
      headers: response.headers(),
    };
  }

  /**
   * Perform PUT request
   */
  async put(endpoint: string, data?: any, options?: Record<string, any>): Promise<any> {
    const response = await this.apiContext.put(endpoint, {
      data,
      ...options,
    });
    return {
      status: response.status(),
      data: await response.json(),
      headers: response.headers(),
    };
  }

  /**
   * Perform DELETE request
   */
  async delete(endpoint: string, options?: Record<string, any>): Promise<any> {
    const response = await this.apiContext.delete(endpoint, options);
    return {
      status: response.status(),
      data: response.status() !== 204 ? await response.json() : null,
      headers: response.headers(),
    };
  }

  /**
   * Perform PATCH request
   */
  async patch(endpoint: string, data?: any, options?: Record<string, any>): Promise<any> {
    const response = await this.apiContext.patch(endpoint, {
      data,
      ...options,
    });
    return {
      status: response.status(),
      data: await response.json(),
      headers: response.headers(),
    };
  }

  /**
   * Upload file
   */
  async uploadFile(endpoint: string, filePath: string, fieldName: string = 'file'): Promise<any> {
    const fs = require('fs');
    const response = await this.apiContext.post(endpoint, {
      multipart: {
        [fieldName]: {
          name: filePath.split('/').pop() || 'file',
          mimeType: 'application/octet-stream',
          buffer: fs.readFileSync(filePath),
        },
      },
    });
    return {
      status: response.status(),
      data: await response.json(),
      headers: response.headers(),
    };
  }

  /**
   * Set authorization header
   */
  async setAuthToken(token: string): Promise<void> {
    await this.apiContext.dispose();
    this.apiContext = await request.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Dispose API context
   */
  async dispose(): Promise<void> {
    await this.apiContext.dispose();
  }
}
