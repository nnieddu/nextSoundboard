"use client";

import React, { useState } from "react";
import Board from "./Board";
import Header from "./Header"; // Import the Header component

const Home: React.FC = () => {
  const [isEditingKeybind, setIsEditingKeybind] = useState(false);

  const handleEditKeybind = () => {
    setIsEditingKeybind(!isEditingKeybind);
  };

  return (
    <main>
      <Header onEditKeybind={handleEditKeybind} />
      <Board isEditingKeybind={isEditingKeybind} />
    </main>
  );
};

export default Home;
