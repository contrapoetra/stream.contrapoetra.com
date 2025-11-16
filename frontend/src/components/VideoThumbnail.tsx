import { Link } from "react-router-dom";

interface VideoThumbnailProps {
  className?: string;
  title: string;
  channel: string;
}

function VideoThumbnail({className, title, channel}: VideoThumbnailProps) {
  return (
    <Link to={`/watch`}>
      <div className={`${className} flex flex-col justify-end items-center`}>
        <div id="container" className="flex flex-col w-[80%] h-[80%]">
          <div id="thumbnail" className="bg-red-300 w-full h-full mb-9 rounded-md"></div>
          <div>
            <h3><b>{title}</b></h3>
            <h4>{channel}</h4>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default VideoThumbnail;
