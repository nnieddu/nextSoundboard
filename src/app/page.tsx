"use client";

import React, { useState } from "react";
import Board from "./Board";
import Header from "./Header"; // Import the Header component
import { MAX_SIZE_MB, calculateLocalStorageSize } from "./utils.ts";

const Home: React.FC = () => {
  const [isEditingKeybind, setIsEditingKeybind] = useState(false);

  const handleEditKeybind = () => {
    setIsEditingKeybind(!isEditingKeybind);
  };

  return (
    <main>
      <Header onEditKeybind={handleEditKeybind} />
      <Board isEditingKeybind={isEditingKeybind} />
      <div className="mt-5 ml-6" id="storageUsage">
        Calculating storage usage...
      </div>
    </main>
  );
};

export default Home;
