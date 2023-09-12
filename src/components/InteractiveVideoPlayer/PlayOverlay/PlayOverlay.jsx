import PauseIcon from "@mui/icons-material/PauseCircleOutline";
import PlayIcon from "@mui/icons-material/PlayCircleOutline";
import PropTypes from "prop-types";
import React from "react";
import "./PlayOverlay.scss";

export default function PlayOverlay({ isPlaying, onClick }) {
  return (
    <div className={`play-overlay ${!isPlaying && "fade-overlay"}`}>
      <button type="button" onClick={onClick}>
        {!isPlaying ? <PlayIcon className="play-icon" /> : <PauseIcon className="pause-icon" />}
      </button>
    </div>
  );
}

PlayOverlay.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};
