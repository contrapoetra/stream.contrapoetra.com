import { useContext, useState, useRef, useEffect, useMemo } from 'react';
import { DarkModeContext } from '../context/DarkModeContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { Upload as UploadIcon, Image as ImageIcon, Film, Globe, Lock, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

function Upload() {
  const { darkMode } = useContext(DarkModeContext);
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [file, setFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [autoThumbnailBlob, setAutoThumbnailBlob] = useState<Blob | null>(null);
  
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [backgroundVideos, setBackgroundVideos] = useState<any[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch videos for background animation
  useEffect(() => {
    const fetchBackgroundVideos = async () => {
      try {
        const response = await apiService.getVideos(1, 20);
        if (response.videos && response.videos.length > 0) {
          setBackgroundVideos(response.videos);
        }
      } catch (error) {
        console.error('Failed to load background videos', error);
      }
    };
    fetchBackgroundVideos();
  }, []);

  // Generate placeholders if no videos, otherwise use videos. 
  // Ensure we have enough items for the loop (at least 20)
  const displayItems = backgroundVideos.length > 0 
    ? Array.from({ length: 20 }, (_, i) => backgroundVideos[i % backgroundVideos.length])
    : Array.from({ length: 20 });
  
  // Generate random speeds for each row (20s to 50s) and random start positions
  const rowConfigs = useMemo(() => {
    return Array.from({ length: 8 }).map(() => ({
      duration: `${Math.floor(Math.random() * 30) + 20}s`,
      delay: `${Math.floor(Math.random() * -50)}s`
    }));
  }, []);

  // Helper to get thumbnail URL
  const getThumbnailUrl = (path?: string) => {
    if (!path) return null;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:80/www/api/api.php';
    const baseUrl = apiUrl.replace(/\/api\/api\.php$/, '').replace(/\/api\.php$/, '');
    return `${baseUrl}/${path}`;
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (thumbnailPreviewUrl && thumbnailFile) URL.revokeObjectURL(thumbnailPreviewUrl);
    };
  }, [videoPreviewUrl, thumbnailPreviewUrl, thumbnailFile]);

  const resetUpload = () => {
    setFile(null);
    setVideoPreviewUrl(null);
    setThumbnailFile(null);
    setThumbnailPreviewUrl(null);
    setAutoThumbnailBlob(null);
    setTitle('');
    setDescription('');
    setDuration(0);
  };

  const processVideoFile = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setVideoPreviewUrl(url);
    
    // Reset thumbnail
    setThumbnailFile(null);
    setThumbnailPreviewUrl(null);
    setAutoThumbnailBlob(null);
    
    // Auto-set title from filename
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processVideoFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('video/')) {
        processVideoFile(droppedFile);
      } else {
        addToast('Please upload a valid video file', 'error');
      }
    }
  };

  const generateThumbnail = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            setAutoThumbnailBlob(blob);
            // Create a preview URL for the auto thumbnail
            const url = URL.createObjectURL(blob);
            setThumbnailPreviewUrl(url);
          }
        }, 'image/jpeg', 0.7);
      }
    }
  };

  const onVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(Math.round(videoRef.current.duration));
      // Seek to 1 second (or 10%) to get a non-black frame usually
      videoRef.current.currentTime = Math.min(1, videoRef.current.duration * 0.1);
    }
  };

  const onVideoSeeked = () => {
    // Generate thumbnail when seek completes (initial auto-seek or user seek)
    if (!thumbnailFile) {
      generateThumbnail();
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setThumbnailFile(selectedFile);
      setThumbnailPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      addToast('Please select a video file', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('duration', duration.toString());
      formData.append('visibility', visibility);

      // Prefer uploaded thumbnail, fallback to auto-generated
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      } else if (autoThumbnailBlob) {
        formData.append('thumbnail', autoThumbnailBlob, 'thumbnail.jpg');
      }

      const response = await apiService.uploadVideoWithProgress(formData, (progress) => {
        setUploadProgress(progress);
      });

      if (response.video_id || response.message === 'uploaded') {
        addToast('Video uploaded successfully!', 'success');
        // Delay redirect slightly to show 100% progress
        setTimeout(() => navigate('/'), 500);
      } else {
        addToast(`Upload failed: ${response.error || response.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      addToast('An error occurred during upload.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`relative min-h-screen w-full overflow-hidden ${darkMode ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-black'}`}>
      
      {/* Background Animation Layer */}
      <div className="absolute inset-0 flex flex-col justify-center gap-6 opacity-10 pointer-events-none select-none z-0 overflow-hidden">
        {rowConfigs.map((config, rowIndex) => (
          <div 
            key={rowIndex} 
            className="flex gap-4 w-max animate-slide-right"
            style={{ 
              animationDuration: config.duration,
              animationDelay: config.delay
            }}
          >
            {/* Double the array to ensure seamless loop */}
            {[...displayItems, ...displayItems].map((item, i) => (
              <div 
                key={i} 
                className="w-80 h-44 bg-yellow-500 rounded-lg flex-shrink-0 overflow-hidden"
              >
                {item && item.thumbnail_path && (
                  <img 
                    src={getThumbnailUrl(item.thumbnail_path) || ''} 
                    alt="" 
                    className="w-full h-full object-cover opacity-80"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Upload Video</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Media Upload & Preview */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Video Preview Area */}
            <div 
              className={`aspect-video rounded-xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center relative transition-colors ${isDragging ? (darkMode ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500 bg-blue-50') : (darkMode ? 'bg-neutral-900/80 border-neutral-700 hover:border-neutral-500' : 'bg-white/80 border-neutral-300 hover:border-neutral-400')} backdrop-blur-sm`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {videoPreviewUrl ? (
                <div className="relative w-full h-full group">
                  <video
                    ref={videoRef}
                    src={videoPreviewUrl}
                    className="w-full h-full object-contain bg-black"
                    controls
                    onLoadedMetadata={onVideoLoadedMetadata}
                    onSeeked={onVideoSeeked}
                  />
                  <button 
                    type="button"
                    onClick={resetUpload}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100 z-50"
                    title="Remove video"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-6">
                  <div className={`p-4 rounded-full mb-4 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                    <UploadIcon size={48} className={darkMode ? 'text-neutral-400' : 'text-neutral-500'} />
                  </div>
                  <span className="text-lg font-medium mb-2">Select video to upload</span>
                  <span className={`text-sm ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Or drag and drop a file</span>
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={handleVideoSelect}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>

            {/* Thumbnail Selection */}
            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImageIcon size={20} />
                Thumbnail
              </h3>
              
              <div className="flex gap-6 items-start">
                {/* Preview Box */}
                <div className={`w-40 aspect-video rounded-lg overflow-hidden border shrink-0 flex items-center justify-center ${darkMode ? 'bg-black border-neutral-700' : 'bg-neutral-100 border-neutral-300'}`}>
                  {thumbnailPreviewUrl ? (
                    <img src={thumbnailPreviewUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  ) : (
                    <Film size={24} className="text-neutral-500" />
                  )}
                </div>

                {/* Controls */}
                <div className="flex-1 space-y-4">
                  <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    A thumbnail is auto-generated from your video. You can upload a custom image if you prefer.
                  </p>
                  
                  <div className="flex gap-3">
                    <label className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${!file || isUploading ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-black'}`}>
                      Upload Custom
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleThumbnailSelect}
                        className="hidden"
                        disabled={!file || isUploading}
                      />
                    </label>
                    {file && (
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailFile(null);
                          generateThumbnail(); // Regenerate auto thumbnail
                        }}
                        disabled={isUploading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'}`}
                      >
                        Reset to Auto
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details Form */}
          <div className="space-y-6">
            <div className={`p-6 rounded-xl border h-full flex flex-col ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
              <h3 className="text-lg font-semibold mb-6">Video Details</h3>
              
              <div className="space-y-5 flex-1">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Title (required)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Video title"
                    disabled={isUploading}
                    className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all ${darkMode ? 'bg-neutral-800 border-neutral-700 focus:border-neutral-500 text-white' : 'bg-neutral-50 border-neutral-300 focus:border-neutral-500 text-black'}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this video about?"
                    rows={5}
                    disabled={isUploading}
                    className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all resize-none ${darkMode ? 'bg-neutral-800 border-neutral-700 focus:border-neutral-500 text-white' : 'bg-neutral-50 border-neutral-300 focus:border-neutral-500 text-black'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Visibility</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${visibility === 'public' ? (darkMode ? 'border-white bg-white/10' : 'border-black bg-black/5') : (darkMode ? 'border-neutral-800 hover:border-neutral-700' : 'border-neutral-200 hover:border-neutral-300')}`}>
                      <input 
                        type="radio" 
                        name="visibility" 
                        value="public"
                        checked={visibility === 'public'}
                        onChange={() => setVisibility('public')}
                        className="hidden"
                      />
                      <div className="flex items-center gap-3 justify-center">
                        <Globe size={20} />
                        <span className="capitalize font-medium">Public</span>
                      </div>
                    </label>
                    
                    <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${visibility === 'private' ? (darkMode ? 'border-white bg-white/10' : 'border-black bg-black/5') : (darkMode ? 'border-neutral-800 hover:border-neutral-700' : 'border-neutral-200 hover:border-neutral-300')}`}>
                      <input 
                        type="radio" 
                        name="visibility" 
                        value="private"
                        checked={visibility === 'private'}
                        onChange={() => setVisibility('private')}
                        className="hidden"
                      />
                      <div className="flex items-center gap-3 justify-center">
                        <Lock size={20} />
                        <span className="capitalize font-medium">Private</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                {isUploading && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className={`w-full rounded-full h-2.5 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-300 ${darkMode ? 'bg-white' : 'bg-black'}`} 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={!file || !title || isUploading}
                  className={`w-full font-bold py-3 px-4 rounded-lg transition-all shadow-lg transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${darkMode ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'}`}
                >
                  {isUploading ? 'Uploading...' : 'Publish Video'}
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>
      
      {/* Hidden canvas for thumbnail generation */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
}

export default Upload;