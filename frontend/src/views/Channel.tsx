import { useContext, useEffect, useState } from 'react';
import { DarkModeContext } from '../context/DarkModeContext';
import { useAuth } from '../context/AuthContext';
import { Settings, Share2, Film } from 'lucide-react';
import { useParams } from 'react-router-dom';
import apiService from '../services/api';
import type { Video } from '../services/api';
import VideoThumbnail from '../components/VideoThumbnail';

function Channel() {
  const { darkMode } = useContext(DarkModeContext);
  const { user: currentUser } = useAuth();
  const { handle } = useParams<{ handle?: string }>();

  // Extract username from handle, assuming '@username' format
  const username = handle && handle.startsWith('@') ? handle.substring(1) : handle;

  const [channel, setChannel] = useState<any>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannelData = async () => {
      if (!username) {
        setError("Invalid channel URL");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch channel info
        const channelResponse = await apiService.getChannel(username);
        
        if (channelResponse.user) {
          setChannel(channelResponse.user);
          
          // Fetch channel videos using user_id
          const videosResponse = await apiService.getVideos(1, 20, channelResponse.user.user_id); // Assuming getVideos now accepts userId
          if (videosResponse.videos) {
            setVideos(videosResponse.videos);
          }
        } else {
          setError("Channel not found");
        }
      } catch (err) {
        console.error("Error fetching channel:", err);
        setError("Failed to load channel");
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [username]);

  const isOwner = currentUser && channel && currentUser.id === channel.user_id;

  if (loading) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center ${darkMode ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-black'}`}>
        Loading...
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className={`min-h-screen w-full flex flex-col items-center justify-center ${darkMode ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-black'}`}>
        <h2 className="text-2xl font-bold mb-2">{error || "Channel not found"}</h2>
        <p className="text-neutral-500">The channel you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full ${darkMode ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-black'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Channel Banner */}
        <div className="relative h-48 sm:h-64 md:h-80 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl overflow-hidden mb-6">
          {/* Placeholder for actual banner implementation */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-4xl font-bold text-white drop-shadow-lg">{channel.username}</span>
          </div>
        </div>

        {/* Channel Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap">
          <div className="flex items-center gap-4">
            {/* Channel Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-neutral-800 shadow-lg flex-shrink-0 bg-neutral-300 flex items-center justify-center text-3xl font-bold text-white select-none">
               {channel.username.charAt(0).toUpperCase()}
            </div>
            
            {/* Channel Info */}
            <div>
              <h1 className="text-3xl font-bold">{channel.username}</h1>
              <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {channel.subscriber_count || 0} subscribers
              </p>
            </div>
          </div>

          {/* Channel Actions */}
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            {isOwner && (
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-black'}`}>
                <Settings size={18} />
                Manage Channel
              </button>
            )}
            <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-black'}`}>
              <Share2 size={18} />
              Share
            </button>
            {!isOwner && (
              <button className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition-colors">
                Subscribe
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-200'} mb-8`}>
          <nav className="flex space-x-6">
            <a href="#" className={`pb-3 border-b-2 ${darkMode ? 'border-white text-white' : 'border-black text-black'} font-medium`}>Videos</a>
            <a href="#" className={`pb-3 border-b-2 border-transparent ${darkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'} transition-colors`}>Playlists</a>
            <a href="#" className={`pb-3 border-b-2 border-transparent ${darkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'} transition-colors`}>About</a>
          </nav>
        </div>

        {/* Video Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Latest Videos</h2>
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoThumbnail
                  key={video.video_id}
                  videoId={video.video_id}
                  title={video.title}
                  channel={video.username}
                  views={video.views}
                  thumbnailPath={video.thumbnail_path}
                  createdAt={video.created_at}
                  duration={video.duration}
                  visibility={video.visibility}
                />
              ))}
            </div>
          ) : (
            <div className={`text-center py-12 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
              <Film size={48} className="mx-auto mb-4 opacity-50" />
              <p>No videos uploaded yet.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Channel;