"use client";

import React, { useState } from "react";
import Board from "./Board";
import Header from "./Header"; // Import the Header component

const Home: React.FC = () => {
  const [isEditingKeybind, setIsEditingKeybind] = useState<boolean>(false);
  const [stopSongWhenAnOtherIsPlayed, setStopSongWhenAnOtherIsPlayed] =
    useState<boolean>(true);

  const handleEditKeybind = () => {
    setIsEditingKeybind(!isEditingKeybind);
  };

  return (
    <main>
      <Header
        onEditKeybind={handleEditKeybind}
        stopSongWhenAnOtherIsPlayed={stopSongWhenAnOtherIsPlayed}
        setStopSongWhenAnOtherIsPlayed={setStopSongWhenAnOtherIsPlayed}
      />
      <Board
        isEditingKeybind={isEditingKeybind}
        stopSongWhenAnOtherIsPlayed={stopSongWhenAnOtherIsPlayed}
        setStopSongWhenAnOtherIsPlayed={setStopSongWhenAnOtherIsPlayed}
      />
      <div className="mt-5 ml-6" id="storageUsage">
        Calculating storage usage...
      </div>
    </main>
  );
};

export default Home;
