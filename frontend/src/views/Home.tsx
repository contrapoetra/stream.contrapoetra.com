import VideoThumbnail from "../components/VideoThumbnail";
import { DarkModeContext } from "../context/DarkModeContext";
import { useContext, useEffect, useState } from "react";
import apiService from "../services/api";
import { Link } from 'react-router-dom';
import { Home as HomeIcon, Rss } from 'lucide-react';

function Home() {
  const { darkMode } = useContext(DarkModeContext);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await apiService.getVideos(1, 16);

        if (response.videos) {
          setVideos(response.videos);
          setError(null); // Clear error on success
        } else {
          setError("No videos available");
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <>
      <div
        className={`${darkMode ? "text-white" : "text-black"} flex w-full min-h-screen`}
      >
        <div
          id="sidebar"
          className={`${darkMode ? "bg-neutral-950" : "bg-neutral-50"} w-1/5 min-h-screen p-4 flex-shrink-0 shadow-md`}
        >
          <ul className="space-y-2">
            <li>
              <Link to="/" className={`flex items-center p-2 rounded-lg ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'}`}>
                <HomeIcon size={20} className="mr-2" />
                Home
              </Link>
            </li>
            <li>
              <Link to="/subscriptions" className={`flex items-center p-2 rounded-lg ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'}`}>
                <Rss size={20} className="mr-2" />
                Subscriptions
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col w-full">
          {/* Error Message */}
          {error && (
            <div
              className={`${darkMode ? "bg-neutral-900" : "bg-white"} p-4 border-b ${darkMode ? "border-neutral-700" : "border-neutral-200"}`}
            >
              <div className="p-2 bg-red-500 text-white rounded">
                {error} - Make sure backend server is running!
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="text-xl">Loading videos...</div>
            </div>
          )}

          {/* Videos Grid */}
          {!loading && (
            <div
              id="content"
              className={`w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4`}
            >
              {videos.length > 0 ? (
                videos.map((video) => (
                  <VideoThumbnail
                    key={video.video_id}
                    videoId={video.video_id}
                    title={video.title}
                    channel={video.username}
                    views={video.views}
                    thumbnailPath={video.thumbnail_path}
                    createdAt={video.created_at}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <div className="max-w-md mx-auto">
                    <h2 className="text-2xl font-bold mb-2">
                      Welcome to Streamin!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      No videos yet. Be the first to upload!
                    </p>
                    <Link
                      to="/upload"
                      className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                    >
                      Start Uploading
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
