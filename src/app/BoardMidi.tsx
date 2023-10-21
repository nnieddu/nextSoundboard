"use client";
import { useState, MouseEvent, useEffect, useRef } from "react";
import {
  MAX_SIZE_MB,
  calculateLocalStorageSize,
  playSong,
  removeFileExtension,
} from "./utils.ts";

type FileData = {
  url: string;
  name: string;
};
interface MIDIMessageEvent extends Event {
  data: Uint8Array;
}

interface MIDIInput {
  onmidimessage: (event: MIDIMessageEvent) => void;
}

interface MyMIDIAccess {
  inputs: Map<string, MIDIInput>;
}

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
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage - 1;

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
      usageElement.textContent = `${currentUsageMB.toFixed(2)} MB / ${MAX_SIZE_MB} MB`;
  }, [files]);

  const handleMIDIMessage = (event: Event) => {
    const message = event as MIDIMessageEvent;
    const command = message.data[0];
    const key = message.data[1];
    const velocity = message.data[2];

    if (velocity > 0) {
      if (files.hasOwnProperty(key)) {
        playSong(
          currentAudio,
          stopSongWhenAnOtherIsPlayed,
          files[key].url,
          key,
          setPlayingIndex
        );
      }
    }
  };

  useEffect(() => {
    function onMIDISuccess(midiAccess: MyMIDIAccess | any) {
      const inputs = Array.from(midiAccess.inputs.values());
      if (inputs.length === 0) {
        console.warn("No MIDI input devices available.");
        return;
      }

      (inputs as MIDIInput[]).forEach((input) => {
        input.onmidimessage = handleMIDIMessage;
      });
    }

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
      console.warn("WebMIDI is not supported in this browser.");
    }

    function onMIDIFailure() {
      console.warn("Could not access MIDI devices.");
    }
  });

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

      const indexStr = currentPageKeyIndices.find((k) => keyBindings[k] === key);

      // Check if indexStr is found, convert it to a number, and check if it's within the current page range
      if (indexStr) {
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
  ]);

  const handleUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    targetIndex: number
  ) => {
    if (event.target.files) {
      Array.from(event.target.files).forEach((file) => {
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const fileData = { url: reader.result as string, name: file.name };
            setFiles((prev) => {
              const newFiles = { ...prev, [targetIndex]: fileData };
              localStorage.setItem("savedFiles", JSON.stringify(newFiles));
              return newFiles;
            });
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const playSound = (index: number, src: string, event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    playSong(currentAudio, stopSongWhenAnOtherIsPlayed, src, index, setPlayingIndex);
  };

  const handleDrop = (index: number, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const uploadedFile = Array.from(event.dataTransfer.files).find((file) =>
      file.type.startsWith("audio/")
    );
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileData = { url: reader.result as string, name: uploadedFile.name };
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

  const handleKeyBinding = (index: number, key: string) => {
    setKeyBindings((prev) => {
      const updatedKeyBindings = { ...prev, [index]: key };
      localStorage.setItem("keyBindings", JSON.stringify(updatedKeyBindings));
      return updatedKeyBindings;
    });
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLDivElement>) => {
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
              {keyBindings[adjustedIndex] && (
                <span className="keybind-display mt-2">{keyBindings[adjustedIndex]}</span>
              )}
              {isEditingKeybind && <span>Edit mode active</span>}
              {!isEditingKeybind && (
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleUpload(e, adjustedIndex)}
                  className="file-input"
                  multiple
                />
              )}
              {files[adjustedIndex] && !isEditingKeybind ? (
                <div
                  onClick={(e) => playSound(adjustedIndex, files[adjustedIndex].url, e)}
                  className="playable"
                >
                  <span>{removeFileExtension(files[adjustedIndex].name)}</span>
                </div>
              ) : (
                <>{!isEditingKeybind && <span className="mt-2">Upload Sound</span>}</>
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
