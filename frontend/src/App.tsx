import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { DarkModeContext } from './context/DarkModeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useContext, useState, useRef, useEffect } from 'react';
import apiService from './services/api';
import Home from './views/Home';
import Player from './views/Player';
import Auth from './views/Auth';
import Upload from './views/Upload';
import Channel from './views/Channel';
import Search from './views/Search';
import './App.css';
import { User, Search as SearchIcon } from 'lucide-react';
import Manage from './views/Manage';
// import { Toggle } from "@/components/ui/toggle"

function AppContent() {
  const {darkMode, switchDarkMode} = useContext(DarkModeContext);
  const { logout, isAuthenticated, user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{text: string, type: 'video' | 'channel'}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [debounceTimer, setDebounceTimer] = useState<number | undefined>(undefined);

  const handleSearch = (e?: React.FormEvent, queryOverride?: string) => {
    e?.preventDefault();
    const q = queryOverride || searchQuery;
    if (q.trim()) {
        setShowSuggestions(false);
        navigate(`/results?q=${encodeURIComponent(q)}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (val.trim().length > 1) {
        if (debounceTimer) clearTimeout(debounceTimer);
        const timer = setTimeout(async () => {
            try {
                const res = await apiService.search(val);
                const newSuggestions: {text: string, type: 'video' | 'channel'}[] = [];
                // Prioritize channels? or Mix?
                // Let's take top 2 channels and top 5 videos
                if (res.channels) {
                    res.channels.slice(0, 2).forEach((c: any) => newSuggestions.push({text: c.username, type: 'channel'}));
                }
                if (res.videos) {
                    res.videos.slice(0, 5).forEach((v: any) => newSuggestions.push({text: v.title, type: 'video'}));
                }
                setSuggestions(newSuggestions);
                setShowSuggestions(newSuggestions.length > 0);
            } catch (err) {
                console.error(err);
            }
        }, 300);
        setDebounceTimer(timer as unknown as number);
    } else {
        setSuggestions([]);
        setShowSuggestions(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
      <div className={`flex flex-col w-screen h-screen overflow-x-hidden ${darkMode ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
        <nav className={`${darkMode ? 'bg-neutral-900' : 'bg-neutral-50'} px-6 py-3 ${darkMode ? 'text-white' : 'text-black'} w-full flex items-center justify-between sticky top-0 z-50 shadow-sm`}>
          {/* Left: Logo */}
          <div className="flex-1 flex items-center justify-start">
            <Link to="/" className="hover:opacity-80 transition-opacity">
                <svg width="62" height="10" viewBox="0 0 62 10" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto fill-current">
<path d="M0.86999 8.842C0.776657 8.902 0.673324 8.932 0.55999 8.932C0.406657 8.932 0.273324 8.87867 0.15999 8.772C0.0533236 8.65867 -9.73046e-06 8.52534 -9.73046e-06 8.372C-9.73046e-06 8.28534 0.0233236 8.202 0.0699903 8.122C0.116657 8.03534 0.173324 7.96867 0.23999 7.922L2.40999 6.472L0.23999 5.022C0.173324 4.97534 0.116657 4.912 0.0699903 4.832C0.0233236 4.74534 -9.73046e-06 4.65867 -9.73046e-06 4.57201C-9.73046e-06 4.41867 0.0533236 4.28867 0.15999 4.182C0.273324 4.06867 0.406657 4.012 0.55999 4.012C0.67999 4.012 0.783324 4.042 0.86999 4.102L3.71999 6.012C3.80666 6.072 3.87332 6.14534 3.91999 6.232C3.96666 6.312 3.98999 6.38867 3.98999 6.462C3.98999 6.65534 3.89999 6.812 3.71999 6.932L0.86999 8.842ZM9.37808 9.97201C8.59408 9.97201 7.89808 9.86801 7.29008 9.66C6.68208 9.452 6.19808 9.16 5.83808 8.784L7.15808 7.632C7.42208 7.872 7.76208 8.06 8.17808 8.196C8.60208 8.332 9.05008 8.4 9.52208 8.4C9.65008 8.4 9.77008 8.396 9.88208 8.388C9.99408 8.372 10.0941 8.344 10.1821 8.304C10.2701 8.264 10.3381 8.22 10.3861 8.172C10.4341 8.124 10.4581 8.064 10.4581 7.992C10.4581 7.872 10.3701 7.776 10.1941 7.704C10.0661 7.664 9.88608 7.624 9.65408 7.584C9.42208 7.544 9.17808 7.5 8.92208 7.452C8.45808 7.372 8.05008 7.284 7.69808 7.188C7.35408 7.092 7.05808 6.96 6.81008 6.792C6.58608 6.624 6.40608 6.424 6.27008 6.192C6.14208 5.96 6.07808 5.688 6.07808 5.376C6.07808 5.048 6.16608 4.76 6.34208 4.512C6.51808 4.256 6.75408 4.04 7.05008 3.864C7.34608 3.68 7.68608 3.544 8.07008 3.456C8.45408 3.368 8.85408 3.324 9.27008 3.324C9.69408 3.324 10.1021 3.36 10.4941 3.432C10.8941 3.496 11.2741 3.6 11.6341 3.744C12.0021 3.88 12.3261 4.056 12.6061 4.272L11.5021 5.58C11.3181 5.46 11.0981 5.344 10.8421 5.232C10.5941 5.12 10.3221 5.028 10.0261 4.956C9.73008 4.884 9.42608 4.848 9.11408 4.848C8.98608 4.848 8.87008 4.856 8.76608 4.872C8.66208 4.888 8.56608 4.912 8.47808 4.944C8.39008 4.968 8.32208 5.008 8.27408 5.064C8.23408 5.112 8.21408 5.164 8.21408 5.22C8.21408 5.276 8.23008 5.328 8.26208 5.376C8.30208 5.424 8.35808 5.468 8.43008 5.508C8.54208 5.58 8.71408 5.64 8.94608 5.688C9.18608 5.736 9.47408 5.792 9.81008 5.856C10.4021 5.96 10.8901 6.084 11.2741 6.228C11.6581 6.364 11.9541 6.528 12.1621 6.72C12.3461 6.856 12.4741 7.02 12.5461 7.212C12.6181 7.396 12.6541 7.596 12.6541 7.812C12.6541 8.236 12.5181 8.612 12.2461 8.94C11.9821 9.26 11.6021 9.512 11.1061 9.69601C10.6101 9.88001 10.0341 9.97201 9.37808 9.97201ZM14.1913 9.85201V1.632H16.4233V9.85201H14.1913ZM12.7273 5.352V3.456H18.0793V5.352H12.7273ZM18.4078 9.85201V3.456H20.4958L20.6158 5.736L20.0158 5.604C20.1278 5.18 20.3198 4.796 20.5918 4.452C20.8638 4.108 21.1838 3.836 21.5518 3.636C21.9278 3.428 22.3278 3.324 22.7518 3.324C22.9838 3.324 23.2078 3.348 23.4238 3.396C23.6398 3.436 23.8278 3.492 23.9878 3.564L23.3638 6C23.2358 5.904 23.0478 5.828 22.7998 5.772C22.5598 5.708 22.3158 5.676 22.0678 5.676C21.8358 5.676 21.6278 5.712 21.4438 5.784C21.2678 5.856 21.1198 5.956 20.9998 6.084C20.8798 6.204 20.7878 6.34 20.7238 6.492C20.6678 6.644 20.6398 6.812 20.6398 6.996V9.85201H18.4078ZM27.782 9.97201C26.95 9.97201 26.226 9.83201 25.61 9.55201C25.002 9.264 24.53 8.868 24.194 8.364C23.866 7.86 23.702 7.292 23.702 6.66C23.702 6.164 23.798 5.712 23.99 5.304C24.19 4.888 24.462 4.536 24.806 4.248C25.15 3.952 25.55 3.724 26.006 3.564C26.47 3.404 26.962 3.324 27.482 3.324C28.01 3.324 28.494 3.404 28.934 3.564C29.382 3.724 29.77 3.952 30.098 4.248C30.426 4.536 30.678 4.88 30.854 5.28C31.03 5.68 31.11 6.124 31.094 6.612L31.082 7.152H25.106L24.83 5.94H29.294L29.078 6.24V6.012C29.07 5.82 28.994 5.656 28.85 5.52C28.706 5.384 28.518 5.276 28.286 5.196C28.062 5.116 27.81 5.076 27.53 5.076C27.186 5.076 26.878 5.128 26.606 5.232C26.342 5.336 26.134 5.496 25.982 5.712C25.83 5.92 25.754 6.176 25.754 6.48C25.754 6.792 25.842 7.072 26.018 7.32C26.202 7.56 26.470 7.752 26.822 7.896C27.182 8.04 27.606 8.112 28.094 8.112C28.534 8.112 28.894 8.068 29.174 7.98C29.454 7.884 29.682 7.776 29.858 7.656L30.842 9.072C30.538 9.28 30.218 9.452 29.882 9.588C29.554 9.716 29.214 9.81201 28.862 9.87601C28.510 9.94001 28.150 9.97201 27.782 9.97201ZM34.6615 9.96001C34.0055 9.96001 33.4295 9.82001 32.9335 9.54C32.4455 9.252 32.0615 8.86 31.7815 8.364C31.5095 7.868 31.3735 7.3 31.3735 6.66C31.3735 6.004 31.5095 5.428 31.7815 4.932C32.0615 4.428 32.4495 4.036 32.9455 3.756C33.4415 3.468 34.0215 3.324 34.6855 3.324C35.0615 3.324 35.4055 3.368 35.7175 3.456C36.0295 3.544 36.3055 3.664 36.5455 3.816C36.7855 3.968 36.9855 4.136 37.1455 4.32C37.3055 4.504 37.4135 4.684 37.4695 4.86L36.9655 4.908V3.456H39.1615V9.85201H36.9175V8.16L37.3855 8.28C37.3455 8.496 37.2455 8.704 37.0855 8.904C36.9335 9.104 36.7375 9.284 36.4975 9.444C36.2575 9.604 35.9815 9.73201 35.6695 9.82801C35.3655 9.91601 35.0295 9.96001 34.6615 9.96001ZM35.2735 8.124C35.6335 8.124 35.9375 8.064 36.1855 7.944C36.4415 7.824 36.6375 7.652 36.7735 7.428C36.9095 7.204 36.9775 6.948 36.9775 6.66C36.9775 6.348 36.9095 6.084 36.7735 5.868C36.6375 5.644 36.4415 5.472 36.1855 5.352C35.9375 5.232 35.6335 5.172 35.2735 5.172C34.9215 5.172 34.6175 5.232 34.3615 5.352C34.1135 5.472 33.9215 5.644 33.7855 5.868C33.6495 6.084 33.5815 6.348 33.5815 6.66C33.5815 6.948 33.6495 7.204 33.7855 7.428C33.9215 7.652 34.1135 7.824 34.3615 7.944C34.6175 8.064 34.9215 8.124 35.2735 8.124ZM39.4635 9.85201V3.456H41.5515L41.6355 4.776L41.2275 4.596C41.3635 4.412 41.5235 4.244 41.7075 4.092C41.8915 3.932 42.0955 3.79601 42.3195 3.68401C42.5435 3.564 42.7875 3.476 43.0515 3.42C43.3155 3.356 43.5955 3.324 43.8915 3.324C44.2355 3.324 44.5555 3.372 44.8515 3.468C45.1555 3.556 45.4155 3.72 45.6315 3.96C45.8555 4.192 46.0315 4.512 46.1595 4.92L45.6795 4.872L45.7875 4.704C45.9315 4.504 46.0995 4.324 46.2915 4.164C46.4915 3.996 46.7115 3.852 46.9515 3.732C47.1915 3.604 47.4475 3.504 47.7195 3.432C47.9995 3.36 48.2955 3.324 48.6075 3.324C49.2315 3.324 49.7395 3.44 50.1315 3.672C50.5315 3.904 50.8195 4.22 50.9955 4.62C51.1795 5.02 51.2715 5.48 51.2715 6V9.85201H49.0395V6.24C49.0395 6.032 48.9995 5.848 48.9195 5.688C48.8395 5.528 48.7235 5.4 48.5715 5.304C48.4195 5.208 48.2275 5.16 47.9955 5.16C47.7795 5.16 47.5795 5.196 47.3955 5.268C47.2115 5.332 47.0515 5.424 46.9155 5.544C46.7795 5.656 46.6715 5.788 46.5915 5.94C46.5195 6.092 46.4835 6.264 46.4835 6.456V9.85201H44.2515V6.228C44.2515 6.028 44.2075 5.848 44.1195 5.688C44.0315 5.52 43.8995 5.392 43.7235 5.304C43.5475 5.208 43.3155 5.16 43.0275 5.16C42.8355 5.16 42.6555 5.2 42.4875 5.28C42.3195 5.352 42.1755 5.444 42.0555 5.556C41.9435 5.668 41.8555 5.792 41.7915 5.928C41.7275 6.064 41.6955 6.188 41.6955 6.3V9.85201H39.4635ZM51.7478 9.85201V3.456H53.9798V9.85201H51.7478ZM52.8638 2.172C52.4558 2.172 52.1398 2.08 51.9158 1.896C51.6918 1.704 51.5798 1.436 51.5798 1.092C51.5798 0.772005 51.6918 0.512005 51.9158 0.312005C52.1478 0.104005 52.4638 4.52995e-06 52.8638 4.52995e-06C53.2638 4.52995e-06 53.5758 0.0960045 53.7998 0.288004C54.0318 0.472004 54.1478 0.740005 54.1478 1.092C54.1478 1.412 54.0318 1.672 53.7998 1.872C53.5678 2.072 53.2558 2.172 52.8638 2.172ZM54.4378 9.85201V3.456H56.5258L56.6218 5.016L56.0818 5.172C56.1778 4.836 56.3538 4.528 56.6098 4.248C56.8658 3.968 57.1858 3.744 57.5698 3.576C57.9618 3.408 58.3938 3.324 58.8658 3.324C59.4258 3.324 59.9018 3.436 60.2938 3.66C60.6858 3.884 60.9858 4.2 61.1938 4.608C61.4018 5.008 61.5058 5.472 61.5058 6V9.85201H59.2618V6.384C59.2618 6.136 59.2098 5.92 59.1058 5.736C59.0098 5.544 58.8658 5.4 58.6738 5.304C58.4898 5.2 58.2738 5.148 58.0258 5.148C57.8098 5.148 57.6178 5.188 57.4498 5.268C57.2818 5.34 57.1378 5.436 57.0178 5.556C56.8978 5.676 56.8098 5.808 56.7538 5.952C56.6978 6.088 56.6698 6.228 56.6698 6.372V9.85201H55.5658C55.2378 9.85201 54.9778 9.85201 54.7858 9.85201C54.6018 9.85201 54.4858 9.85201 54.4378 9.85201Z" />
</svg>
            </Link>
          </div>

          {/* Center: Search */}
          <div className="flex-initial w-full max-w-xl flex justify-center px-4 relative" ref={searchRef}>
            <form onSubmit={handleSearch} className={`flex w-full max-w-xl ${darkMode ? "bg-neutral-800" : "bg-neutral-200"} py-2 px-4 rounded-full border ${darkMode ? 'border-neutral-700' : 'border-neutral-300'} focus-within:ring-1 focus-within:ring-blue-500`}>
              <input 
                type="text" 
                placeholder="Search" 
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
                className={`w-full bg-transparent border-none outline-none ${darkMode ? 'text-white placeholder-neutral-400' : 'text-black placeholder-neutral-500'}`} 
              />
              <button type="submit" className={`ml-2 ${darkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'}`}>
                  <SearchIcon size={20} />
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className={`absolute top-full left-4 right-4 mt-1 rounded-xl shadow-lg border overflow-hidden z-50 ${darkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                    <ul>
                        {suggestions.map((s, idx) => (
                            <li key={idx}>
                                <button 
                                    className={`w-full text-left px-4 py-2 flex items-center gap-3 ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-black'}`}
                                    onClick={() => {
                                        setSearchQuery(s.text);
                                        handleSearch(undefined, s.text);
                                    }}
                                >
                                    <SearchIcon size={16} className="opacity-50" />
                                    <span className="truncate flex-1">{s.text}</span>
                                    {s.type === 'channel' && <span className="text-xs opacity-50 border border-current px-1 rounded">Channel</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex-1 flex items-center justify-end gap-3">
              <button onClick={switchDarkMode} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${darkMode ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-neutral-200 text-black hover:bg-neutral-300'}`}>
                {darkMode ? 'Light' : 'Dark'}
              </button>
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-black'}`}
                >
                  <User size={20} />
                </button>

                {isProfileOpen && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 ${darkMode ? 'bg-neutral-800 text-white' : 'bg-white text-black'}`}>
                    {user && (
                      <div className={`px-4 py-2 text-sm border-b ${darkMode ? 'border-neutral-700' : 'border-gray-100'}`}>
                        <p className="font-medium truncate">{user.username}</p>
                        <p className={`text-xs truncate ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{user.email}</p>
                      </div>
                    )}
                    {user && ( // Ensure user is defined before showing channel link
                      <Link
                        to={`/@${user.username}`}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${darkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/5'}`}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Your Channel
                      </Link>
                    )}
                    <Link
                      to="/upload"
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${darkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/5'}`}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Upload Video
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${darkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/5'}`}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="auth-button-dark text-sm">Log In</Link>
            )}
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watch" element={
            <div className={`${darkMode ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
              <Player/>
            </div>
          } />
          <Route path="/auth" element={<Auth />} />
          <Route path="/subscriptions" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/manage" element={<Manage />} />
          <Route path="/results" element={<Search />} />
          {/* Catch-all for channel pages or 404s */}
          <Route path="/:handle" element={<Channel />} />
        </Routes>
      </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
