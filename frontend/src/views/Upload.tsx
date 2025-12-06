import { useContext, useState } from 'react';
import { DarkModeContext } from '../context/DarkModeContext';

function Upload() {
  const { darkMode } = useContext(DarkModeContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Upload payload:', { title, description, file });
    alert('Upload feature is a mockup. Check console for payload.');
  };

  // Generate placeholders for the background sliding animation
  // We need enough items to cover the screen width plus scroll overlap
  const placeholders = Array.from({ length: 20 }); 

  return (
    <div className={`relative w-full h-full overflow-hidden ${darkMode ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
      
      {/* Background Animation Layer */}
      <div className="absolute inset-0 flex flex-col justify-evenly opacity-10 pointer-events-none select-none z-0">
        {[0, 1, 2, 3].map((rowIndex) => (
          <div 
            key={rowIndex} 
            className={`flex gap-4 w-max ${rowIndex % 2 === 0 ? 'animate-slide-left' : 'animate-slide-right'}`}
          >
            {/* Double the array to ensure seamless loop */}
            {[...placeholders, ...placeholders].map((_, i) => (
              <div 
                key={i} 
                className="w-64 h-36 bg-yellow-500 rounded-lg flex-shrink-0"
              />
            ))}
          </div>
        ))}
      </div>

      {/* Foreground Upload Form */}
      <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
        <div className={`w-full max-w-2xl p-8 rounded-2xl shadow-2xl border ${darkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
          <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-neutral-900'}`}>Upload Video</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Video File Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Video File
              </label>
              <div className={`flex items-center justify-center w-full border-2 border-dashed rounded-lg p-6 transition-colors ${darkMode ? 'border-neutral-600 hover:border-neutral-400 bg-neutral-900/50' : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50'}`}>
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={handleFileChange}
                  className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
              </div>
              {file && <p className={`mt-2 text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Selected: {file.name}</p>}
            </div>

            {/* Title Input */}
            <div>
              <label htmlFor="title" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-300 text-black placeholder-neutral-400'}`}
                required
              />
            </div>

            {/* Description Input */}
            <div>
              <label htmlFor="description" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers about your video"
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-300 text-black placeholder-neutral-400'}`}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Upload Video
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Upload;
