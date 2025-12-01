const API_BASE_URL = 'http://localhost/www/api/api.php';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: {
    id: number;
    username: string;
    email: string;
  };
  token?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async post<T = any>(action: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=${action}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  }

  async get<T = any>(action: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=${action}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse> {
    return this.post('login', { email, password });
  }

  async register(username: string, email: string, password: string): Promise<ApiResponse> {
    return this.post('register', { username, email, password });
  }

  // Protected methods that require authentication
  async uploadVideo(videoData: FormData): Promise<ApiResponse> {
    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch(`${API_BASE_URL}?action=upload_video`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: videoData,
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Video upload failed:', error);
      return {
        success: false,
        message: 'Upload failed',
      };
    }
  }

  async addComment(videoId: number, comment: string): Promise<ApiResponse> {
    return this.post('add_comment', { video_id: videoId, comment });
  }

  async likeVideo(videoId: number): Promise<ApiResponse> {
    return this.post('like_video', { video_id: videoId });
  }

  async dislikeVideo(videoId: number): Promise<ApiResponse> {
    return this.post('dislike_video', { video_id: videoId });
  }

  async subscribe(channelId: number): Promise<ApiResponse> {
    return this.post('subscribe', { channel_id: channelId });
  }

  async unsubscribe(channelId: number): Promise<ApiResponse> {
    return this.post('unsubscribe', { channel_id: channelId });
  }
}

export const apiService = new ApiService();
export default apiService;