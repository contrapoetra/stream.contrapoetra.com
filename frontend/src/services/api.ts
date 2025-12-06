const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:80/www/api/api.php';

export interface Video {
  video_id: number;
  user_id: number;
  username: string;
  title: string;
  description: string;
  file_path: string;
  thumbnail_path?: string;
  views: number;
  duration?: number;
  visibility: 'public' | 'private';
  created_at: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  user?: {
    id: number;
    username: string;
    email: string;
  };
  token?: string;
  videos?: Video[];
  video?: Video;
  page?: number;
  limit?: number;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const headers: any = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async post<T = any>(action: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const headers = this.getAuthHeaders() as any;
      headers['Content-Type'] = 'application/json';

      const response = await fetch(`${API_BASE_URL}?action=${action}`, {
        method: 'POST',
        headers: headers,
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

  // Video methods
  async getVideos(page: number = 1, limit: number = 12): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=videos&page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get videos failed:', error);
      return {
        success: false,
        message: 'Failed to fetch videos',
      };
    }
  }

  async getVideo(videoId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=video&id=${videoId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get video failed:', error);
      return {
        success: false,
        message: 'Failed to fetch video',
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
      const response = await fetch(`${API_BASE_URL}?action=upload`, {
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

  async uploadVideoWithProgress(
    videoData: FormData, 
    onProgress: (progress: number) => void
  ): Promise<ApiResponse> {
    const token = localStorage.getItem('auth_token');
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}?action=upload`);
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(Math.round(percentComplete));
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
            } catch (e) {
                resolve({ success: false, message: 'Invalid JSON response', error: xhr.responseText });
            }
        } else {
             try {
                const response = JSON.parse(xhr.responseText);
                resolve(response); // Let caller handle API errors structure
            } catch (e) {
                resolve({ success: false, message: `Upload failed with status ${xhr.status}` });
            }
        }
      };
      
      xhr.onerror = () => {
        resolve({ success: false, message: 'Network error' });
      };
      
      xhr.send(videoData);
    });
  }

  async addComment(videoId: number, commentText: string): Promise<ApiResponse> {
    return this.post('comment', { video_id: videoId, comment_text: commentText });
  }

  async likeVideo(videoId: number): Promise<ApiResponse> {
    return this.post('like', { video_id: videoId, like_type: 'like' });
  }

  async dislikeVideo(videoId: number): Promise<ApiResponse> {
    return this.post('like', { video_id: videoId, like_type: 'dislike' });
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