"use client";
import { useState, MouseEvent, useEffect } from "react";
import { removeFileExtension } from "./utils.ts";

type FileData = {
  url: string;
  name: string;
};

type BoardProps = {
  isEditingKeybind: boolean;
};

const Board: React.FC<BoardProps> = ({ isEditingKeybind }) => {
  const [files, setFiles] = useState<{ [key: number]: FileData }>({});
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  useEffect(() => {
    const savedFiles = localStorage.getItem("savedFiles");
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles));
    }
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;

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
            >
              {isEditingKeybind ? <span>Edit mode active</span> : null}
              <input
                type="file"
                accept="audio/*"
                onChange={handleUpload}
                className="file-input"
                multiple
              />
              {files[adjustedIndex] ? (
                <div
                  onClick={(e) => playSound(adjustedIndex, files[adjustedIndex].url, e)}
                  className="playable"
                >
                  <span>{removeFileExtension(files[adjustedIndex].name)}</span>
                </div>
              ) : (
                "Upload Sound"
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
