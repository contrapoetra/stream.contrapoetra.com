function Player() {
  return (
    <div id="player" className="flex w-full h-full">
      <div id="content" className="flex flex-col w-3/4">
        <div id="video" className="flex">video</div>
        <div id="title-description" className="flex">title</div>
        <div id="comments" className="flex">comments</div>
      </div>
      <div id="sidebar" className="w-1/4">recommendations</div>
    </div>
  );
}

export default Player;
