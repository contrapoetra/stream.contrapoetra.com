import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiService, { type Video } from '../services/api';
import VideoSearchResult from '../components/VideoSearchResult';
import ChannelSearchResult, { type ChannelResult } from '../components/ChannelSearchResult';
import { Loader2 } from 'lucide-react';

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [channels, setChannels] = useState<ChannelResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiService.search(query);
        if (res.videos) {
          setVideos(res.videos);
        } else {
            setVideos([]);
        }
        if (res.channels) {
          setChannels(res.channels);
        } else {
            setChannels([]);
        }
      } catch (err) {
        setError('Failed to load search results.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (!query) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-muted-foreground">
        Enter a search term to find videos and channels.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      
      {/* Filters (Visual only for now) */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
         {['All', 'Shorts', 'Videos', 'Unwatched', 'Watched', 'Recently uploaded'].map(filter => (
             <button key={filter} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${filter === 'All' ? 'bg-foreground text-background' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                 {filter}
             </button>
         ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 py-8">
          {error}
        </div>
      )}

      {!loading && !error && videos.length === 0 && channels.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
            <p className="text-lg">No results found for "{query}"</p>
            <p className="text-sm mt-2">Try different keywords or check your spelling.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Channels Section */}
          {channels.length > 0 && (
            <div className="mb-8">
              {channels.map(channel => (
                <ChannelSearchResult key={channel.user_id} channel={channel} />
              ))}
            </div>
          )}

          {/* Videos Section */}
          <div className="space-y-4">
             {videos.map(video => (
                 <VideoSearchResult key={video.video_id} video={video} />
             ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;
