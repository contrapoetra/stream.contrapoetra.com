import VideoPlayer from '../components/VideoPlayer';
import VideoThumbnail from '../components/VideoThumbnail';
import UserComment from '../components/UserComment';
import { useSearchParams } from 'react-router-dom';
import { DarkModeContext } from '../context/DarkModeContext';
import { useContext, useEffect, useState } from 'react';
import apiService from '../services/api';

function Player() {
  const { darkMode } = useContext(DarkModeContext);
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('id');

  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);

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

      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [videoId]);

  if (loading) {
    return (
      <div className={`flex w-full min-h-screen mt-12 ${darkMode ? 'bg-neutral-950' : 'bg-neutral-50'} justify-center items-center`}>
        <div className="text-xl">Loading video...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className={`flex w-full min-h-screen mt-12 ${darkMode ? 'bg-neutral-950' : 'bg-neutral-50'} justify-center items-center`}>
        <div className="text-center">
          <div className="text-xl text-red-500 mb-4">{error || 'Video not found'}</div>
          <a href="/" className="text-blue-500 hover:underline">Back to Home</a>
        </div>
      </div>
    );
  }

  const getVideoUrl = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:80/api';
    return `${baseUrl}/${video.file_path}`;
  };

  return (
    <div id="player" className={`flex w-full min-h-screen mt-12 ${darkMode ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
      <div id="content" className="flex flex-col w-3/4 ml-12">
        <div id="video" className="flex shrink-0 ml-12 mt-5 mb-5 rounded-xl overflow-hidden">
          <VideoPlayer
            src={getVideoUrl()}
            title={video.title}
          />
        </div>

        <div className="ml-12">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{video.title}</h1>
          <div className="flex items-center gap-4 mt-3">
            <h2 className={`${darkMode ? 'text-white' : 'text-black'}`}>{video.username}</h2>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {video.views?.toLocaleString() || 0} views • Just now
            </span>
          </div>

          {video.description && (
            <div className={`mt-5 p-4 rounded-xl ${darkMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-neutral-100 border border-neutral-200'}`}>
              <p className={`${darkMode ? 'text-white' : 'text-black'}`}>{video.description}</p>
            </div>
          )}

          <div className={`text-2xl font-bold mt-5 ${darkMode ? 'text-white' : 'text-black'}`}>Comments</div>
          <div id="comments" className="flex flex-col mt-5">
            <UserComment user="yuemichi" comment="this is so ass bro!!! 🥀" />
            <UserComment user="sunnydrop" comment="ngl this kinda ate?? ✨" />
            <UserComment user="voidling" comment="bro what did my eyes just witness 😭😭" />
          </div>
        </div>
      </div>

      <div id="sidebar" className="w-1/4 min-h-screen mt-5 sticky top-0">
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Player;
