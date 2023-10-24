"use client";
import { useState, MouseEvent, useEffect, useRef, useMemo } from "react";
import {
  MAX_SIZE_MB,
  calculateLocalStorageSize,
  playSong,
  removeFileExtension,
} from "./utils.ts";

import Midi from "./Midi.js";

type FileData = {
  url: string;
  name: string;
};

type BoardProps = {
  isEditingKeybind: boolean;
  stopSongWhenAnOtherIsPlayed: boolean;
  setStopSongWhenAnOtherIsPlayed: React.Dispatch<React.SetStateAction<boolean>>;
};

const Board: React.FC<BoardProps> = ({
  isEditingKeybind,
  stopSongWhenAnOtherIsPlayed,
  setStopSongWhenAnOtherIsPlayed,
}) => {
  const [files, setFiles] = useState<{ [key: number]: FileData }>({});
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyBindings, setKeyBindings] = useState<{ [key: number]: string }>({});
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const itemsPerPage = 16;

  useEffect(() => {
    const savedFiles = localStorage.getItem("savedFiles");
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles));
    }
    const savedKeyBindings = localStorage.getItem("keyBindings");
    if (savedKeyBindings) {
      setKeyBindings(JSON.parse(savedKeyBindings));
    }
  }, []);

  useEffect(() => {
    const usageElement = document.getElementById("storageUsage");
    const currentUsageMB = calculateLocalStorageSize();
    if (usageElement)
      usageElement.textContent = `${currentUsageMB.toFixed(
        2
      )} MB / ${MAX_SIZE_MB} MB`;
  }, [files]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage - 1;

  const midi = useMemo(() => new Midi(), []);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files)
      Array.from(event.target.files).forEach((file, index) => {
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const fileData = { url: reader.result as string, name: file.name };
            setFiles((prev) => {
              const newFiles = { ...prev, [index]: fileData };
              localStorage.setItem("savedFiles", JSON.stringify(newFiles));
              return newFiles;
            });
          };
          reader.readAsDataURL(file);
        }
      });
  };

  const playSound = (
    index: number,
    src: string,
    event: MouseEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    playSong(
      currentAudio,
      stopSongWhenAnOtherIsPlayed,
      src,
      index,
      setPlayingIndex
    );
  };

  const handleDrop = (
    index: number,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    const uploadedFile = Array.from(event.dataTransfer.files).find((file) =>
      file.type.startsWith("audio/")
    );
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileData = {
          url: reader.result as string,
          name: uploadedFile.name,
        };
        setFiles((prev) => {
          const newFiles = { ...prev, [index]: fileData };
          localStorage.setItem("savedFiles", JSON.stringify(newFiles));
          return newFiles;
        });
      };
      reader.readAsDataURL(uploadedFile);
    }
    setDragOver(null);
  };

  // useEffect(() => {
  //   midi.setMidiMessageHandler((midiEvent: any, index: number) => {
  //     const midiKey = midiEvent.data[1];
  //     const key = midiKey.toString();
  //     console.log(key);
  //     setKeyBindings((prev) => {
  //       const updatedKeyBindings = { ...prev, [index]: key };
  //       localStorage.setItem("keyBindings", key);
  //       return updatedKeyBindings;
  //     });
  //   });
  // }, [midi]);

  useEffect(() => {
    const handleGlobalKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();

      if (key === "END") {
        setStopSongWhenAnOtherIsPlayed(!stopSongWhenAnOtherIsPlayed);
        return; // exit the function early after toggling the state
      }

      const currentPageKeyIndices = Object.keys(keyBindings)
        .map((k) => parseInt(k, 10))
        .filter((index) => index >= startIndex && index <= endIndex);
      const indexStr = currentPageKeyIndices.find(
        (k) => keyBindings[k] === key
      );

      // Check if indexStr is found, convert it to a number, and check if it's within the current page range
      if (indexStr !== undefined) {
        const index = Number(indexStr);
        if (files.hasOwnProperty(index)) {
          playSong(
            currentAudio,
            stopSongWhenAnOtherIsPlayed,
            files[index].url,
            index,
            setPlayingIndex
          );
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyPress);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyPress);
    };
  }, [
    keyBindings,
    files,
    stopSongWhenAnOtherIsPlayed,
    setStopSongWhenAnOtherIsPlayed,
    startIndex,
    endIndex,
    currentPage,
    midi,
  ]);

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    console.log("lol");
    if (isEditingKeybind) {
      event.preventDefault();
      const key = event.key.toUpperCase();
      setKeyBindings((prev) => {
        const updatedKeyBindings = { ...prev, [index]: key };
        localStorage.setItem("keyBindings", JSON.stringify(updatedKeyBindings));
        return updatedKeyBindings;
      });
    }
  };

  return (
    <div className="board-container">
      <div className="grid-container">
        {Array.from({ length: itemsPerPage }).map((_, index) => {
          const adjustedIndex = startIndex + index;

          return (
            <div
              key={adjustedIndex}
              className={`grid-item hover:bg-slate-300 ${
                dragOver === index ? "drag-over" : ""
              } ${playingIndex === index ? "playing" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(index);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(index, e)}
              onKeyDown={(e) => handleKeyDown(adjustedIndex, e)}
              tabIndex={0} // make the div focusable
            >
              {keyBindings[adjustedIndex] ? (
                <span className="keybind-display mt-2">
                  {keyBindings[adjustedIndex]}
                </span>
              ) : isEditingKeybind ? (
                <span>Edit mode active</span>
              ) : null}
              {!isEditingKeybind && (
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleUpload}
                  className="file-input"
                  multiple
                />
              )}
              {files[adjustedIndex] && !isEditingKeybind ? (
                <div
                  onClick={(e) =>
                    playSound(adjustedIndex, files[adjustedIndex].url, e)
                  }
                  className="playable"
                >
                  <span>{removeFileExtension(files[adjustedIndex].name)}</span>
                </div>
              ) : (
                <>
                  {!isEditingKeybind && (
                    <span className="mt-2">Upload Sound</span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="pagination">
        {[1, 2, 3, 4].map((pageNum) => (
          <button
            key={pageNum}
            className={currentPage === pageNum ? "active" : ""}
            onClick={() => setCurrentPage(pageNum)}
          >
            {pageNum}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Board;
