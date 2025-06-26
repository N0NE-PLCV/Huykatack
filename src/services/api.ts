// API Configuration and Service Layer
const API_BASE_URL = 'https://healthcare-0y63.onrender.com';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserData {
  user_id?: string;
  email: string;
  password?: string;
  name?: string;
  age?: number;
  height?: number;
  weight?: number;
  gender?: string;
  physical_condition?: string;
  medical_history?: string;
  profile_image_url?: string;
  role?: string;
}

export interface ChatData {
  chat_id?: string;
  user_id?: string;
  created_at?: string;
  disease?: string;
  text?: string;
  name?: string;
  height?: number;
  weight?: number;
  gender?: string;
  physical_condition?: string;
  medical_history?: string;
  L?: string;
  O?: string;
  D?: string;
  C?: string;
  R?: string;
  A?: string;
  F?: string;
  T?: string;
  age?: number;
  updated_at?: string;
  blood_pressure?: string;
  pulse?: number;
}

// Import healthcare analysis types
export interface SymptomAnalysisRequest {
  symptoms: string[];
  userId?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  patientInfo?: {
    age?: number;
    gender?: string;
    medicalHistory?: string;
    currentMedications?: string;
  };
}

export interface SymptomAnalysisResponse {
  analysisId: string;
  conditions: Array<{
    name: string;
    probability: number;
    description: string;
    severity: 'low' | 'medium' | 'high';
    recommendations: string[];
  }>;
  confidence: number;
  timestamp: string;
}

export interface ImageAnalysisRequest {
  images: Array<{
    description: string;
    location?: string;
    base64?: string;
  }>;
  userId?: string;
  imageType: 'skin' | 'xray' | 'mri' | 'other';
}

export interface ImageAnalysisResponse {
  analysisId: string;
  results: Array<{
    imageId: string;
    conditions: Array<{
      name: string;
      probability: number;
      confidence: number;
      description: string;
      severity: 'low' | 'medium' | 'high';
      recommendations: string[];
    }>;
  }>;
  timestamp: string;
}

// API Client Class
class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`Making API request to: ${url}`);
      
      // Prepare headers
      const requestHeaders = {
        ...this.headers,
        ...options.headers,
      };

      // Add auth token if available
      if (this.authToken) {
        requestHeaders['Authorization'] = `Bearer ${this.authToken}`;
      }

      console.log('Request options:', {
        method: options.method || 'GET',
        headers: requestHeaders,
        body: options.body ? 'Present' : 'None',
        authToken: this.authToken ? 'Present' : 'Missing'
      });

      const response = await fetch(url, {
        ...options,
        headers: requestHeaders,
      });

      console.log(`API Response status: ${response.status} ${response.statusText}`);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      let data;
      let errorMessage = '';

      if (isJson) {
        try {
          data = await response.json();
          console.log('Parsed JSON response:', data);
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError);
          const textResponse = await response.text();
          console.log('Raw response text:', textResponse);
          errorMessage = `Invalid JSON response: ${textResponse}`;
        }
      } else {
        // Handle non-JSON responses
        const textResponse = await response.text();
        console.log('Non-JSON response text:', textResponse);
        
        if (!response.ok) {
          switch (response.status) {
            case 401:
              errorMessage = 'Authentication required. Please log in again.';
              break;
            case 403:
              errorMessage = 'Access forbidden. You do not have permission to perform this action.';
              break;
            case 404:
              errorMessage = 'Resource not found.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = textResponse || `HTTP ${response.status}: ${response.statusText}`;
          }
        } else {
          data = { message: textResponse };
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: errorMessage || data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Network error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Authentication endpoints
  async signin(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // User Management endpoints
  async createuser(userData: UserData): Promise<ApiResponse<UserData>> {
    const apiData = {
      email: userData.email,
      password: userData.password || 'defaultPassword123',
      name: userData.name,
      age: userData.age,
      height: userData.height,
      weight: userData.weight,
      gender: userData.gender,
      physical_condition: userData.physical_condition,
      medical_history: userData.medical_history,
      profile_image_url: userData.profile_image_url,
      role: userData.role || 'user'
    };

    // Remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(apiData).filter(([_, value]) => value !== undefined)
    );

    console.log('Creating user with data:', cleanedData);

    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(cleanedData),
    });
  }

  async updateuser(userId: string, userData: Partial<UserData>): Promise<ApiResponse<UserData>> {
    const apiData = {
      email: userData.email,
      password: userData.password,
      name: userData.name,
      age: userData.age,
      height: userData.height,
      weight: userData.weight,
      gender: userData.gender,
      physical_condition: userData.physical_condition,
      medical_history: userData.medical_history,
      profile_image_url: userData.profile_image_url,
      role: userData.role || 'user'
    };

    // Remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(apiData).filter(([_, value]) => value !== undefined)
    );

    console.log(`Updating user ${userId} with data:`, cleanedData);

    return this.request(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(cleanedData),
    });
  }

  async getusers(): Promise<ApiResponse<UserData[]>> {
    console.log('Fetching all users');
    return this.request('/api/users');
  }

  async getuser(userId: string): Promise<ApiResponse<UserData>> {
    console.log(`Fetching user ${userId}`);
    return this.request(`/api/users/${userId}`);
  }

  async deleteuser(userId: string): Promise<ApiResponse<{ message: string }>> {
    console.log(`Deleting user ${userId}`);
    return this.request(`/api/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Chat Management endpoints
  async createchat(chatData: ChatData): Promise<ApiResponse<ChatData>> {
    const apiData = {
      user_id: chatData.user_id,
      disease: chatData.disease,
      text: chatData.text,
      name: chatData.name,
      height: chatData.height,
      weight: chatData.weight,
      gender: chatData.gender,
      physical_condition: chatData.physical_condition,
      medical_history: chatData.medical_history,
      L: chatData.L,
      O: chatData.O,
      D: chatData.D,
      C: chatData.C,
      R: chatData.R,
      A: chatData.A,
      F: chatData.F,
      T: chatData.T,
      age: chatData.age,
      blood_pressure: chatData.blood_pressure,
      pulse: chatData.pulse
    };

    // Remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(apiData).filter(([_, value]) => value !== undefined)
    );

    console.log('Creating chat with data:', cleanedData);

    return this.request('/api/chats', {
      method: 'POST',
      body: JSON.stringify(cleanedData),
    });
  }

  async updatechat(chatId: string, chatData: Partial<ChatData>): Promise<ApiResponse<ChatData>> {
    const apiData = {
      user_id: chatData.user_id,
      disease: chatData.disease,
      text: chatData.text,
      name: chatData.name,
      height: chatData.height,
      weight: chatData.weight,
      gender: chatData.gender,
      physical_condition: chatData.physical_condition,
      medical_history: chatData.medical_history,
      L: chatData.L,
      O: chatData.O,
      D: chatData.D,
      C: chatData.C,
      R: chatData.R,
      A: chatData.A,
      F: chatData.F,
      T: chatData.T,
      age: chatData.age,
      blood_pressure: chatData.blood_pressure,
      pulse: chatData.pulse
    };

    // Remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(apiData).filter(([_, value]) => value !== undefined)
    );

    console.log(`Updating chat ${chatId} with data:`, cleanedData);

    return this.request(`/api/chats/${chatId}`, {
      method: 'PUT',
      body: JSON.stringify(cleanedData),
    });
  }

  async getchats(): Promise<ApiResponse<ChatData[]>> {
    console.log('Fetching all chats');
    return this.request('/api/chats');
  }

  async getchat(chatId: string): Promise<ApiResponse<ChatData>> {
    console.log(`Fetching chat ${chatId}`);
    return this.request(`/api/chats/${chatId}`);
  }

  async deletechat(chatId: string): Promise<ApiResponse<{ message: string }>> {
    console.log(`Deleting chat ${chatId}`);
    return this.request(`/api/chats/${chatId}`, {
      method: 'DELETE',
    });
  }

  // Healthcare Analysis endpoints - now using integrated healthcare models
  async analyzeSymptoms(request: SymptomAnalysisRequest): Promise<ApiResponse<SymptomAnalysisResponse>> {
    console.log('Analyzing symptoms with integrated healthcare models:', request);
    
    try {
      // Import and use the healthcare analysis functions
      const { analyzeSymptoms } = await import('./healthcare_api');
      
      const healthcareRequest = {
        symptoms: request.symptoms,
        patientInfo: request.patientInfo
      };
      
      const result = await analyzeSymptoms(healthcareRequest);
      
      if (result.success && result.data) {
        // Convert to expected format
        const analysisResponse: SymptomAnalysisResponse = {
          analysisId: result.data.analysisId,
          conditions: result.data.conditions,
          confidence: result.data.confidence,
          timestamp: result.data.timestamp
        };
        
        return {
          success: true,
          data: analysisResponse
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to analyze symptoms'
        };
      }
    } catch (error) {
      console.error('Error in symptom analysis:', error);
      return {
        success: false,
        error: 'Healthcare analysis service unavailable'
      };
    }
  }

  async analyzeImages(request: ImageAnalysisRequest): Promise<ApiResponse<ImageAnalysisResponse>> {
    console.log('Analyzing medical images with integrated healthcare models:', request);
    
    try {
      // Import and use the healthcare analysis functions
      const { analyzeImages } = await import('./healthcare_api');
      
      const healthcareRequest = {
        images: request.images,
        imageType: request.imageType
      };
      
      const result = await analyzeImages(healthcareRequest);
      
      if (result.success && result.data) {
        // Convert to expected format
        const analysisResponse: ImageAnalysisResponse = {
          analysisId: result.data.analysisId,
          results: result.data.results,
          timestamp: result.data.timestamp
        };
        
        return {
          success: true,
          data: analysisResponse
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to analyze images'
        };
      }
    } catch (error) {
      console.error('Error in image analysis:', error);
      return {
        success: false,
        error: 'Healthcare image analysis service unavailable'
      };
    }
  }

  // Upload Images
  async uploadImage(file: File, type: 'profile' | 'medical'): Promise<ApiResponse<{ url: string; id: string }>> {
    console.log('Uploading image:', file.name, 'type:', type);
    
    // For now, create a local URL for preview
    const mockResponse = {
      url: URL.createObjectURL(file),
      id: `upload_${Date.now()}`
    };

    return {
      success: true,
      data: mockResponse
    };
  }

  // Set authentication token
  setAuthToken(token: string) {
    console.log('Setting auth token');
    this.authToken = token;
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  // Remove authentication token
  removeAuthToken() {
    console.log('Removing auth token');
    this.authToken = null;
    delete this.headers['Authorization'];
  }

  // Get current auth token
  getAuthToken(): string | null {
    return this.authToken;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Utility functions
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const handleApiError = (error: string): string => {
  // Map common API errors to user-friendly messages
  const errorMap: Record<string, string> = {
    'Network error occurred': 'Please check your internet connection and try again.',
    'Authentication required. Please log in again.': 'Your session has expired. Please log in again.',
    'Access forbidden. You do not have permission to perform this action.': 'You do not have permission to perform this action.',
    'Resource not found.': 'The requested information was not found.',
    'Server error. Please try again later.': 'Server error. Please try again later.',
    'HTTP 401': 'Authentication required. Please log in again.',
    'HTTP 403': 'You do not have permission to perform this action.',
    'HTTP 404': 'The requested resource was not found.',
    'HTTP 500': 'Server error. Please try again later.',
  };

  // Check if error contains any of the mapped errors
  for (const [key, value] of Object.entries(errorMap)) {
    if (error.includes(key)) {
      return value;
    }
  }

  return error;
};

// Export UserData as PatientData for backward compatibility
export type PatientData = UserData;