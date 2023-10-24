import React from "react";

type HeaderProps = {
  onEditKeybind: () => void;
  stopSongWhenAnOtherIsPlayed: boolean;
  setStopSongWhenAnOtherIsPlayed: React.Dispatch<React.SetStateAction<boolean>>;
};

const Header: React.FC<HeaderProps> = ({
  onEditKeybind,
  stopSongWhenAnOtherIsPlayed,
  setStopSongWhenAnOtherIsPlayed,
}) => {
  const handleCheckboxChange = () => {
    setStopSongWhenAnOtherIsPlayed(!stopSongWhenAnOtherIsPlayed);
  };

  return (
    <header className="header-container">
      <h1 className="border-b-2 border-black">Team Tech Soundboard</h1>
      <label>
        Stop song when another is played
        <input
          type="checkbox"
          className="ml-2"
          onChange={handleCheckboxChange}
          checked={stopSongWhenAnOtherIsPlayed}
        />
      </label>
      <button
        className="border-2 border-black hover:bg-white rounded"
        onClick={() => {
          localStorage.removeItem("savedFiles");
          location.reload();
        }}
      >
        Remove all
      </button>
      <button
        className="border-2 border-black hover:bg-white rounded"
        onClick={onEditKeybind}
      >
        Edit Keybindings
      </button>
    </header>
  );
};

export default Header;
