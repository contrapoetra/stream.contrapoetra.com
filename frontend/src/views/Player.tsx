import VideoPlayer from '../components/VideoPlayer';
import VideoThumbnail from '../components/VideoThumbnail';
import UserComment from '../components/UserComment';
import { useSearchParams, Link } from 'react-router-dom';
import { DarkModeContext } from '../context/DarkModeContext';
import { useContext, useEffect, useState } from 'react';
import apiService from '../services/api';
import { formatTimeAgo } from '../lib/utils';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function Player() {
  const { darkMode } = useContext(DarkModeContext);
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('id');

  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false); // State for subscription status

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!videoId) {
        setError('No video ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch main video
        const videoResponse = await apiService.getVideo(parseInt(videoId));

        if (videoResponse.video) {
          setVideo(videoResponse.video);
          setIsSubscribed(videoResponse.video.is_subscribed || false); // Initialize subscribe state from API
        } else {
          setError('Video not found');
          return;
        }

        // Fetch related videos (latest videos)
        const relatedResponse = await apiService.getVideos(1, 10);
        if (relatedResponse.videos) {
          // Filter out current video from related
          const filtered = relatedResponse.videos.filter(v => v.video_id !== parseInt(videoId));
          setRelatedVideos(filtered.slice(0, 8));
        }

        // Fetch comments
        const commentsResponse = await apiService.getComments(parseInt(videoId));
        if (commentsResponse.comments) {
          setComments(commentsResponse.comments);
        }

      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [videoId]);

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    if (!videoId) return;

    try {
      const response = await apiService.addComment(parseInt(videoId), commentText);
      if (response.message === 'commented' || response.comment_id) {
        addToast('Comment posted!', 'success');
        setCommentText('');
        // Refresh comments
        const commentsResponse = await apiService.getComments(parseInt(videoId));
        if (commentsResponse.comments) {
          setComments(commentsResponse.comments);
        }
      } else {
        addToast('Failed to post comment', 'error');
      }
    } catch (error) {
      console.error('Comment error:', error);
      addToast('Error posting comment', 'error');
    }
  };

  const handleSubscribe = async () => {
    if (!currentUser) {
      addToast('Please log in to subscribe', 'info');
      return;
    }
    if (!video) return; // Video owner not loaded yet

    try {
      if (isSubscribed) {
        await apiService.unsubscribe(video.user_id);
        setIsSubscribed(false);
        addToast('Unsubscribed', 'success');
      } else {
        await apiService.subscribe(video.user_id);
        setIsSubscribed(true);
        addToast('Subscribed!', 'success');
      }
    } catch (error) {
      console.error('Subscription failed', error);
      addToast('Subscription failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className={`flex w-full min-h-screen pt-8 ${darkMode ? 'bg-neutral-950' : 'bg-neutral-50'} justify-center items-center`}>
        <div className="text-xl">Loading video...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className={`flex w-full min-h-screen pt-8 ${darkMode ? 'bg-neutral-950' : 'bg-neutral-50'} justify-center items-center`}>
        <div className="text-center">
          <div className="text-xl text-red-500 mb-4">{error || 'Video not found'}</div>
          <a href="/" className="text-blue-500 hover:underline">Back to Home</a>
        </div>
      </div>
    );
  }

  const getVideoUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:80/www/api/api.php';
    const baseUrl = apiUrl.replace(/\/api\/api\.php$/, '').replace(/\/api\.php$/, '');
    return `${baseUrl}/${video.file_path}`;
  };

  return (
    <div id="player" className={`flex w-full min-h-screen pt-8 pb-24 gap-x-8 ${darkMode ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
      <div id="content" className="flex flex-col w-3/4 pl-12">
        <div id="video" className="flex shrink-0 mt-5 mb-5 rounded-xl overflow-hidden">
          <VideoPlayer
            src={getVideoUrl()}
            title={video.title}
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            {video.visibility === 'private' && (
              <Lock size={24} className="text-red-500 flex-shrink-0" />
            )}
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{video.title}</h1>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <Link to={`/@${video.username}`} className="hover:opacity-80 transition-opacity">
              <h2 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-black'}`}>{video.username}</h2>
            </Link>
            
            {/* Subscribe Button */}
            {(!currentUser || currentUser.id !== video.user_id) && ( // Only show if not owner and logged in
              <button 
                onClick={handleSubscribe}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${isSubscribed ? (darkMode ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-neutral-200 text-black hover:bg-neutral-300') : 'bg-red-600 hover:bg-red-700 text-white'}`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}

            <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-neutral-600'} flex items-center gap-1 ml-auto`}>
              {video.views?.toLocaleString() || 0} views • {formatTimeAgo(video.created_at)}
            </span>
          </div>

          {video.description && (
            <div className={`mt-5 p-4 rounded-xl ${darkMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-neutral-100 border border-neutral-200'}`}>
              <p className={`${darkMode ? 'text-white' : 'text-black'}`}>{video.description}</p>
            </div>
          )}

          <div className={`mt-5 p-4 rounded-xl ${darkMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-neutral-100 border border-neutral-200'}`}>
            <div className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
              {comments.length} Comments
            </div>
            
            {currentUser ? (
              <div className="flex gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className={`w-full p-3 rounded-lg border outline-none resize-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-black'}`}
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleCommentSubmit}
                      disabled={!commentText.trim()}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${!commentText.trim() ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <a href="/auth" className="text-blue-500 hover:underline">Log in to comment</a>
              </div>
            )}

            <div id="comments" className="flex flex-col gap-4">
              {comments.map((comment) => (
                <UserComment 
                  key={comment.comment_id} 
                  user={comment.username} 
                  comment={comment.comment_text} 
                  createdAt={comment.created_at}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="sidebar" className="w-1/4 min-h-screen mt-5 sticky top-0 pr-12">
        <h3 className={`text-lg font-semibold mb-4 ml-2 ${darkMode ? 'text-white' : 'text-black'}`}>Related Videos</h3>
        <div className="space-y-3">
          {relatedVideos.map((relatedVideo) => (
            <VideoThumbnail
              key={relatedVideo.video_id}
              videoId={relatedVideo.video_id}
              title={relatedVideo.title}
              channel={relatedVideo.username}
              views={relatedVideo.views}
              thumbnailPath={relatedVideo.thumbnail_path}
              createdAt={relatedVideo.created_at}
              duration={relatedVideo.duration}
              visibility={relatedVideo.visibility}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Player;