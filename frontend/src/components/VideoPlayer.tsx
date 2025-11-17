function VideoPlayer() {
  return (
      <video controls muted className="flex w-full">
        <source src={"http://" + location.hostname + ":8080/www/stream.php?file=video.mp4"} type="video/mp4"/>
      </video>
  );
}

export default VideoPlayer;
