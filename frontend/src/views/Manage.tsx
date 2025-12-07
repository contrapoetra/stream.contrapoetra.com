import { useContext, useEffect, useState } from 'react';
import { DarkModeContext } from '../context/DarkModeContext';
import { useAuth } from '../context/AuthContext';
import apiService, { type Video } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Trash2, Edit2, Save, X, Lock, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '../lib/utils';
import ConfirmDialog from '../components/ui/ConfirmDialog'; // Import ConfirmDialog

function Manage() {
  const { darkMode } = useContext(DarkModeContext);
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editVisibility, setEditVisibility] = useState<'public' | 'private'>('public');

  // Confirmation dialog state
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [videoToDeleteId, setVideoToDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    fetchVideos();
  }, [currentUser]);

  const fetchVideos = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Fetch all videos for current user (limit 100 for manage page)
      const response = await apiService.getVideos(1, 100, currentUser.id);
      if (response.videos) {
        setVideos(response.videos);
      }
    } catch (error) {
      console.error("Failed to fetch videos", error);
      addToast("Failed to load videos", "error");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (video: Video) => {
    setEditingId(video.video_id);
    setEditTitle(video.title);
    setEditDesc(video.description || '');
    setEditVisibility(video.visibility);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDesc('');
    setEditVisibility('public'); // Reset visibility too
  };

  const saveEdit = async (id: number) => {
    try {
      const response = await apiService.updateVideo(id, {
        title: editTitle,
        description: editDesc,
        visibility: editVisibility
      });

      if (response.message === 'updated') {
        addToast("Video updated", "success");
        setVideos(prev => prev.map(v => v.video_id === id ? {
          ...v,
          title: editTitle,
          description: editDesc,
          visibility: editVisibility
        } : v));
        cancelEdit();
      } else {
        addToast("Update failed", "error");
      }
    } catch (error) {
      addToast("Update failed", "error");
    }
  };

  // Function to show the confirmation dialog
  const confirmDelete = (id: number) => {
    setVideoToDeleteId(id);
    setShowConfirmDelete(true);
  };

  // Function to actually perform the deletion after confirmation
  const executeDelete = async () => {
    if (videoToDeleteId === null) return;

    try {
      const response = await apiService.deleteVideo(videoToDeleteId);
      if (response.message === 'deleted') {
        addToast("Video deleted", "success");
        setVideos(prev => prev.filter(v => v.video_id !== videoToDeleteId));
      } else {
        addToast("Delete failed", "error");
      }
    } catch (error) {
      addToast("Delete failed", "error");
    } finally {
      setShowConfirmDelete(false);
      setVideoToDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setVideoToDeleteId(null);
  };

  return (
    <div className={`min-h-screen w-full ${darkMode ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-black'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Channel Content</h1>
          <Link
            to="/upload"
            className="bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Upload Video
          </Link>
        </div>

        <div className={`rounded-xl overflow-hidden border ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'} border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Video</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Visibility</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Views</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">Loading content...</td>
                  </tr>
                ) : videos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">No videos found</td>
                  </tr>
                ) : (
                  videos.map((video) => (
                    <tr key={video.video_id} className={`group ${darkMode ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex gap-4">
                          <div className="w-32 aspect-video bg-black rounded-lg overflow-hidden shrink-0 relative">
                            {video.thumbnail_path && (
                              <img
                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:80/www/api/api.php'}`.replace(/\/api\/api\.php$/, '').replace(/\/api\.php$/, '') + '/' + video.thumbnail_path}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 py-1">
                            {editingId === video.video_id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className={`w-full px-2 py-1 rounded border ${darkMode ? 'bg-neutral-800 border-neutral-600' : 'bg-white border-neutral-300'}`}
                                />
                                <textarea
                                  value={editDesc}
                                  onChange={(e) => setEditDesc(e.target.value)}
                                  className={`w-full px-2 py-1 rounded border text-xs ${darkMode ? 'bg-neutral-800 border-neutral-600' : 'bg-white border-neutral-300'}`}
                                  rows={2}
                                />
                              </div>
                            ) : (
                              <>
                                <h3 className="font-medium text-sm line-clamp-1 mb-1">{video.title}</h3>
                                <p className={`text-xs line-clamp-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                  {video.description || 'No description'}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === video.video_id ? (
                          <select
                            value={editVisibility}
                            onChange={(e) => setEditVisibility(e.target.value as any)}
                            className={`px-2 py-1 rounded border text-sm ${darkMode ? 'bg-neutral-800 border-neutral-600' : 'bg-white border-neutral-300'}`}
                          >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            {video.visibility === 'public' ? <Globe size={16} className="text-green-500" /> : <Lock size={16} className="text-red-500" />}
                            <span className="capitalize text-sm">{video.visibility}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        {formatTimeAgo(video.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {video.views}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {editingId === video.video_id ? (
                            <>
                              <button onClick={() => saveEdit(video.video_id)} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg" title="Save">
                                <Save size={18} />
                              </button>
                              <button onClick={cancelEdit} className="p-2 text-neutral-500 hover:bg-neutral-500/10 rounded-lg" title="Cancel">
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Changed onClick to confirmDelete */}
                              <button onClick={() => startEdit(video)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg" title="Edit">
                                <Edit2 size={18} />
                              </button>
                              <button onClick={() => confirmDelete(video.video_id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg" title="Delete">
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Render the Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Video"
        message="Are you sure you want to delete this video? This action cannot be undone."
        onConfirm={executeDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

export default Manage;
