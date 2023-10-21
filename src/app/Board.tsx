"use client";
import Image from "next/image";
import { useState, MouseEvent } from "react";
import { removeFileExtension } from "./utils.ts";

type FileData = {
  url: string;
  name: string;
};

const Board: React.FC = () => {
  const [files, setFiles] = useState<{ [key: number]: FileData }>({});
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files)
      Array.from(event.target.files).forEach((file, index) => {
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFiles((prev) => ({
              ...prev,
              [index]: { url: reader.result as string, name: file.name },
            }));
          };
          reader.readAsDataURL(file);
        }
      });
  };

  const playSound = (index: number, src: string, event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setPlayingIndex(index);
    const audio = new Audio(src);
    audio.play();

    audio.onended = () => {
      setPlayingIndex(null);
    };
  };

  const handleDrop = (index: number, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const uploadedFile = Array.from(event.dataTransfer.files).find((file) =>
      file.type.startsWith("audio/")
    );
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles((prev) => ({
          ...prev,
          [index]: { url: reader.result as string, name: uploadedFile.name },
        }));
      };
      reader.readAsDataURL(uploadedFile);
    }
    setDragOver(null);
  };

  return (
    <div className="grid-container">
      {Array.from({ length: 16 }).map((_, index) => (
        <div
          key={index}
          className={`grid-item ${dragOver === index ? "drag-over" : ""} ${
            playingIndex === index ? "playing" : ""
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(index);
          }}
          onDragLeave={() => setDragOver(null)}
          onDrop={(e) => handleDrop(index, e)}
        >
          <input
            type="file"
            accept="audio/*"
            onChange={handleUpload}
            className="file-input"
            multiple
          />
          {files[index] ? (
            <div
              onClick={(e) => playSound(index, files[index].url, e)}
              className="playable"
            >
              <span>{removeFileExtension(files[index].name)}</span>
            </div>
          ) : (
            "Upload Sound"
          )}
        </div>
      ))}
    </div>
  );
};

export default Board;
