"use client";
import { useState, MouseEvent, useEffect, useRef, useMemo } from "react";
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
  const itemsPerPage = 12;
  const [selectedGridItemIndex, setSelectedGridItemIndex] = useState<
    number | null
  >(null);

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
    } else {
      let initialKeyBindings = {};
      for (let i = 0; i <= 12; i++) {
        initialKeyBindings[i.toString()] = (i + 40).toString();
      }
      setKeyBindings(initialKeyBindings); // Set the state with an object, not a string
      localStorage.setItem("keyBindings", JSON.stringify(initialKeyBindings)); // If you want to save this to local storage as well
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
  ]);

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
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

  const handleMidiInput = (note: number, velocity: number) => {
    // console.log(note);
    if (isEditingKeybind && selectedGridItemIndex !== null) {
      // Save note as keybinding for the selected grid item
      setKeyBindings((prev) => {
        console.log(prev);
        console.log(selectedGridItemIndex);
        const updatedKeyBindings = {
          ...prev,
          [selectedGridItemIndex]: note.toString(),
        };
        localStorage.setItem("keyBindings", JSON.stringify(updatedKeyBindings));
        return updatedKeyBindings;
      });
      // Optionally, reset the selected grid item index after setting
      setSelectedGridItemIndex(null);
    } else if (velocity > 0) {
      // Check if the note corresponds to a saved keybinding and play the song
      const index = Object.keys(keyBindings).find(
        (key) => keyBindings[key] === note.toString()
      );
      if (index && files.hasOwnProperty(index)) {
        playSong(
          currentAudio,
          stopSongWhenAnOtherIsPlayed,
          files[index].url,
          parseInt(index, 10),
          setPlayingIndex
        );
      }
    }
  };

  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
      console.log("WebMIDI is not supported in this browser.");
    }

    function onMIDIFailure() {
      console.log("Could not access your MIDI devices.");
    }

    function onMIDISuccess(midiAccess: any) {
      const inputs = midiAccess.inputs.values();
      for (
        let input = inputs.next();
        input && !input.done;
        input = inputs.next()
      ) {
        input.value.onmidimessage = onMIDIMessage;
      }
    }

    function onMIDIMessage(event: any) {
      const [status, note, velocity] = event.data;
      handleMidiInput(note, velocity);
    }
  });

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
              onClick={() => {
                setSelectedGridItemIndex(adjustedIndex);
              }}
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

////////////////////////////////
// import { useState, MouseEvent, useEffect } from "react";

// // Define your Raspberry Pi server URL
// const SERVER_URL = "https://192.168.2.71:3000/"; // Replace with your Pi's IP or hostname

// // ...

// const Board: React.FC<BoardProps> = ({ isEditingKeybind, stopSongWhenAnOtherIsPlayed, setStopSongWhenAnOtherIsPlayed }) => {
//   // ...

//   const playSoundOnPi = (index: number) => {
//     // Send an HTTP POST request to play sound on Raspberry Pi
//     fetch(`${SERVER_URL}/playSound`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ index }),
//     })
//       .then((response) => {
//         if (response.ok) {
//           // Sound played successfully
//           // Add your handling logic here
//         } else {
//           // Handle error
//           console.error("Failed to play sound on Raspberry Pi");
//         }
//       })
//       .catch((error) => {
//         console.error("Error sending request:", error);
//       });
//   };

//   // ...

//   return (
//     <div className="board-container">
//       <div className="grid-container">
//         {Array.from({ length: itemsPerPage }).map((_, index) => {
//           // ...

//           return (
//             <div
//               key={adjustedIndex}
//               // ...
//               onClick={() => {
//                 setSelectedGridItemIndex(adjustedIndex);
//                 playSoundOnPi(adjustedIndex); // Play sound on Raspberry Pi
//               }}
//               // ...
//             >
//               {/* ... */}
//             </div>
//           );
//         })}
//       </div>
//       {/* ... */}
//     </div>
//   );
// };
