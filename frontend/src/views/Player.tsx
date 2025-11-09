function Player() {
  return (
    <div className="player">
      <div className="player__controls">
        <button className="player__button">Play</button>
        <button className="player__button">Pause</button>
        <button className="player__button">Stop</button>
      </div>
      <div className="player__progress">
        <div className="player__progress__bar"></div>
      </div>
    </div>
  );
}

export default Player;
