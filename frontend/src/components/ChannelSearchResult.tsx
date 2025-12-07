import { Link } from "react-router-dom";
import { User } from "lucide-react";

export interface ChannelResult {
  user_id: number;
  username: string;
  created_at: string;
  subscriber_count: number;
}

interface ChannelSearchResultProps {
  channel: ChannelResult;
}

function ChannelSearchResult({ channel }: ChannelSearchResultProps) {
  const formatSubscribers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M subscribers`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K subscribers`;
    }
    return `${count} subscribers`;
  };

  return (
    <Link to={`/@${channel.username}`} className="block py-6 border-b border-border/50 hover:bg-accent/5 transition-colors">
      <div className="flex items-center gap-4 sm:gap-8 px-4 sm:px-0 max-w-4xl mx-auto">
        {/* Avatar */}
        <div className="shrink-0 flex justify-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                <User size={48} className="text-muted-foreground" />
            </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-lg font-medium text-foreground mb-1">
            {channel.username}
          </h3>
          <div className="text-sm text-muted-foreground">
            {channel.username} • {formatSubscribers(channel.subscriber_count)}
          </div>
          {/* Description placeholder - API doesn't return description for users yet */}
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
             {/* Future description here */}
          </p>
        </div>
        
        {/* Subscribe Button (Visual only for now, can be functionalized) */}
        <div className="shrink-0">
             <button className="bg-foreground text-background px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
                Subscribe
             </button>
        </div>
      </div>
    </Link>
  );
}

export default ChannelSearchResult;
