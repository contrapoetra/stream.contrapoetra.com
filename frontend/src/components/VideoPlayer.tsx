interface VideoPlayerProps {
  src: string;
  title?: string;
}

function VideoPlayer({ src, title }: VideoPlayerProps) {
  return (
    <video
      controls
      muted
      className="flex w-full aspect-video bg-black"
      preload="metadata"
    >
      <source src={src} type="video/mp4"/>
      Your browser does not support the video tag.
    </video>
  );
}

export default VideoPlayer;
