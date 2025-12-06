import { Link } from "react-router-dom";

interface VideoThumbnailProps {
  className?: string;
  videoId: number;
  title: string;
  channel: string;
  views?: number;
  thumbnailPath?: string;
}

function VideoThumbnail({ videoId, title, channel, views, thumbnailPath }: VideoThumbnailProps) {
  const formatViews = (viewCount: number) => {
    if (viewCount >= 1000000) {
      return `${(viewCount / 1000000).toFixed(1)}M views`;
    } else if (viewCount >= 1000) {
      return `${(viewCount / 1000).toFixed(1)}K views`;
    }
    return `${viewCount} views`;
  };

  const getThumbnailUrl = () => {
    if (thumbnailPath) {
      // If thumbnail path exists, construct URL from API
      return `${import.meta.env.VITE_API_URL || 'http://localhost:80/api'}/${thumbnailPath}`;
    }
    // Fallback to placeholder
    return `https://picsum.photos/320/180?random=${videoId}`;
  };

  return (
    <Link to={`/player?id=${videoId}`}>
      <div className={`flex flex-col justify-end items-center mb-6 group cursor-pointer`}>
        <div id="container" className="flex flex-col w-full">
          {/* Thumbnail */}
          <div className="relative mb-3 rounded-lg overflow-hidden">
            <img
              src={getThumbnailUrl()}
              alt={title}
              className="w-full aspect-video object-cover bg-gray-200 group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).src = `https://picsum.photos/320/180?random=${videoId}`;
              }}
            />
            {/* Duration overlay (placeholder) */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
              10:24
            </div>
          </div>

          {/* Video Info */}
          <div className="flex gap-3">
            {/* Channel Avatar */}
            <div className="w-9 h-9 bg-gray-300 rounded-full flex-shrink-0"></div>

            {/* Title and Meta */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 leading-tight mb-1">
                {title}
              </h3>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <p className="hover:text-gray-900 dark:hover:text-gray-200">{channel}</p>
                {views !== undefined && (
                  <p>{formatViews(views)} • Just now</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default VideoThumbnail;
