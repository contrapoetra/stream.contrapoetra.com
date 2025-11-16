import VideoThumbnail from '../components/VideoThumbnail';
import { DarkModeContext } from '../context/DarkModeContext';
import { useContext } from 'react';
const videoClass = "w-full h-[400px]";

function Home() {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <>
      <div className={`${darkMode ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-black'} flex w-full h-full`}>
        <div id="sidebar" className={`${darkMode ? 'bg-neutral-950' : 'bg-neutral-50'} w-1/5 h-full text-2xl`}>
          sidebar
        </div>
        <div className="flex flex-col w-full">
          <div id="content" className={`w-full grid grid-cols-3 gap-0`}>
            <VideoThumbnail title="Video Title" channel="Channel Name" className={videoClass}/>
            <VideoThumbnail title="Video Title" channel="Channel Name" className={videoClass}/>
            <VideoThumbnail title="Video Title" channel="Channel Name" className={videoClass}/>
            <VideoThumbnail title="Video Title" channel="Channel Name" className={videoClass}/>
            <VideoThumbnail title="Video Title" channel="Channel Name" className={videoClass}/>
            <VideoThumbnail title="Video Title" channel="Channel Name" className={videoClass}/>
            <VideoThumbnail title="Video Title" channel="Channel Name" className={videoClass}/>
            <VideoThumbnail title="Video Title" channel="Channel Name" className={videoClass}/>
            <VideoThumbnail title="Video Title" channel="Channel Name" className={videoClass}/>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home;
