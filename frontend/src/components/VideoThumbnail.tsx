import { Link } from "react-router-dom";
import { formatTimeAgo, formatDuration } from "../lib/utils";

interface VideoThumbnailProps {
  className?: string;
  videoId: number;
  title: string;
  channel: string;
  views?: number;
  thumbnailPath?: string;
  createdAt: string;
  duration?: number;
}

function VideoThumbnail({ videoId, title, channel, views, thumbnailPath, createdAt, duration }: VideoThumbnailProps) {
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
      // Construct URL from API base, stripping /api/api.php to get web root
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:80/www/api/api.php';
      const baseUrl = apiUrl.replace( /\/api\/api\.php$/, '').replace( /\/api\.php$/, '');
      return `${baseUrl}/${thumbnailPath}`;
    }
    // Fallback to placeholder
    return `https://picsum.photos/320/180?random=${videoId}`;
  };

  return (
    <Link to={`/watch?id=${videoId}`}>
      <div className={`flex flex-col justify-end items-center mb-6 group cursor-pointer`}>
        <div id="container" className="flex flex-col w-full">
          {/* Thumbnail */}
          <div className="relative mb-3 rounded-lg overflow-hidden">
            <img
              src={getThumbnailUrl()}
              alt={title}
              className="w-full aspect-video object-cover bg-neutral-200 group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).src = `https://picsum.photos/320/180?random=${videoId}`;
              }}
            />
            {/* Duration overlay */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
              {formatDuration(duration || 0)}
            </div>
          </div>

          {/* Video Info */}
          <div className="flex gap-3">
            {/* Channel Avatar */}
            <div className="w-9 h-9 bg-neutral-300 rounded-full shrink-0"></div>

            {/* Title and Meta */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 leading-tight mb-1 text-foreground">
                {title}
              </h3>
              <div className="text-xs text-muted-foreground">
                <p className="hover:text-primary transition-colors">{channel}</p>
                {views !== undefined && (
                  <p>{formatViews(views)} • {formatTimeAgo(createdAt)}</p>
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
