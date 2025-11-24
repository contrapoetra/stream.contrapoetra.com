import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { DarkModeContext } from './context/DarkModeContext';
import { useContext } from 'react';
import Home from './views/Home';
import Player from './views/Player';
// import Auth from './views/Auth';
import Streamin from './assets/_streamin.svg';
import './App.css';
import { Toggle } from "@/components/ui/toggle"

function App() {
  const {darkMode, switchDarkMode} = useContext(DarkModeContext);

  return (
      <Router>
        <div className="flex flex-col w-screen h-screen overflow-x-hidden">
          <nav className={`${darkMode ? 'bg-neutral-900' : 'bg-neutral-50'} p-6 ${darkMode ? 'text-white' : 'text-black'} w-full flex justify-center text-center sticky top-0`}>
            <div className="absolute scale-220 left-15 translate-y-1 m-0.75">
              <Link to="/">
                  <img src={Streamin} className={`fill-current`} alt="Streamin" />
              </Link>
            </div>
            <div className="absolute right-30">
              <Toggle onClick={switchDarkMode} className='m-0 p-3'>{darkMode ? 'Light' : 'Dark'}</Toggle>
            </div>
            <div className="absolute right-4 m-0.75">
              <Link to="/auth" className="auth-button-dark">Sign Up</Link>
            </div>
            <div className={`flex w-1/3 h-full ${darkMode ? "bg-neutral-800" : "bg-neutral-200"} p-1 pl-4 rounded-full outline-1 ${darkMode ? 'outline-neutral-950' : 'outline-neutral-300'}`}>
              <input type="text" placeholder="Search" className="w-full h-full bg-transparent border-none outline-none" />
            </div>
          </nav>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch" element={
              <div className={`${darkMode ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
                <Player/>
              </div>
            } />
            {/*<Route path="/auth" element={<Auth />} />*/}
          </Routes>
        </div>
      </Router>
  );
}

export default App;
