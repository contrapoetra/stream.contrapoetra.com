import VideoThumbnail from '../components/VideoThumbnail';

const videoClass = "w-full h-[400px]";

function Home() {

  return (
    <>
      <div className="bg-gray-950 flex w-full h-full">
        <div id="sidebar" className="bg-gray-900 w-1/5 h-full text-2xl">
          sidebar
        </div>
        <div className="flex flex-col w-full">
          <div id="content" className="bg-gray-950 w-full grid grid-cols-3 gap-0 mt-5">
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
