import React from "react";

type HeaderProps = {
  onEditKeybind: () => void;
};

const Header: React.FC<HeaderProps> = ({ onEditKeybind }) => {
  return (
    <header className="header-container">
      <h1 className="border-b-2 border-black">Team Tech Soundboard</h1>
      <button
        className="border-2 border-black hover:bg-white rounded"
        onClick={() => localStorage.removeItem("savedFiles")}
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
