import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './views/Home';
import Player from './views/Player';
import Login from './unused/Placeholder';
import './App.css';

function App() {
  return (
    <Router>
      <div className="flex flex-col w-screen h-screen">
        <nav className="bg-gray-800 p-2 text-white h-12 w-full flex justify-center text-center">
          <div className="absolute left-2">
            <Link to="/" style={{ margin: '10px' }}>Home</Link>
          </div>
          <div className="absolute right-4">
            <Link to="/login" className="text-right">Login</Link>
          </div>
          <div className="flex w-1/3 h-full bg-gray-900 p-1 pl-4 rounded-full outline-1 outline-gray-500">
            <input type="text" placeholder="Search" className="w-full h-full bg-transparent border-none outline-none" />
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watch" element={<Player />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
