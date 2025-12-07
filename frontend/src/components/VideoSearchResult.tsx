import { Link } from "react-router-dom";
import { formatTimeAgo, formatDuration } from "../lib/utils";
import type { Video } from "../services/api";

interface VideoSearchResultProps {
  video: Video;
}

function VideoSearchResult({ video }: VideoSearchResultProps) {
  const formatViews = (viewCount: number) => {
    if (viewCount >= 1000000) {
      return `${(viewCount / 1000000).toFixed(1)}M views`;
    } else if (viewCount >= 1000) {
      return `${(viewCount / 1000).toFixed(1)}K views`;
    }
    return `${viewCount} views`;
  };

  const getThumbnailUrl = () => {
    if (video.thumbnail_path) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:80/www/api/api.php';
      const baseUrl = apiUrl.replace( /\/api\/api\.php$/, '').replace( /\/api\.php$/, '');
      return `${baseUrl}/${video.thumbnail_path}`;
    }
    return `https://picsum.photos/320/180?random=${video.video_id}`;
  };

  return (
    <Link to={`/watch?id=${video.video_id}`} className="block mb-4 group">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Thumbnail */}
        <div className="relative shrink-0 w-full sm:w-[360px] aspect-video rounded-xl overflow-hidden bg-neutral-200">
          <img
            src={getThumbnailUrl()}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/320/180?random=${video.video_id}`;
            }}
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.duration || 0)}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-1">
          <h3 className="text-lg font-medium line-clamp-2 leading-tight mb-1 text-foreground group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <div className="text-xs text-muted-foreground flex items-center flex-wrap gap-1 mb-2">
            <span>{formatViews(video.views)}</span>
            <span>•</span>
            <span>{formatTimeAgo(video.created_at)}</span>
          </div>
          
          <div className="flex items-center gap-2 mb-2 text-muted-foreground hover:text-foreground transition-colors">
            <div className="w-6 h-6 rounded-full bg-neutral-300"></div>
            <span className="text-sm">{video.username}</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {video.description}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default VideoSearchResult;
