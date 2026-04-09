/**
 * LMStudio Service Client
 * 
 * Provides frontend API client for LMStudio model discovery and validation.
 */

import { getApiUrl } from "../config/api";

export interface LMStudioModel {
  name: string;
  context_window?: number;
  supports_vision?: boolean;
  supports_embeddings?: boolean;
}

export interface LMStudioDiscoveryResponse {
  total_models: number;
  models: LMStudioModel[];
}

export interface LMStudioValidationResponse {
  is_valid: boolean;
  instance_url: string;
  response_time_ms?: number;
  models_available: number;
  error_message?: string;
}

class LMStudioService {
  private baseUrl = getApiUrl();

  private handleApiError(error: any, context: string): Error {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Error(`${context} failed: ${errorMessage}`);
  }

  /**
   * Validate an LMStudio instance
   */
  async validateInstance(instanceUrl: string): Promise<LMStudioValidationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/lmstudio/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instance_url: instanceUrl }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      throw this.handleApiError(error, "LMStudio instance validation");
    }
  }

  /**
   * Discover models from an LMStudio instance
   */
  async discoverModels(instanceUrl: string): Promise<LMStudioDiscoveryResponse> {
    try {
      const params = new URLSearchParams();
      params.append('instance_url', instanceUrl);

      const response = await fetch(`${this.baseUrl}/api/lmstudio/models?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      throw this.handleApiError(error, "LMStudio model discovery");
    }
  }
}

export const lmstudioService = new LMStudioService();
