import { MutableRefObject } from "react";

export function removeFileExtension(filename: string) {
  return filename.replace(/\.[^/.]+$/, "");
}

export function calculateLocalStorageSize() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      let value = localStorage[key];
      if (typeof value === "string") {
        let amount = (value.length * 2) / 1024 / 1024; // value's length in bytes; converted to MB
        total += amount;
      }
    }
  }
  return total;
}

export const MAX_SIZE_MB = 5;

export function playSong(
  currentAudio: MutableRefObject<HTMLAudioElement | null>,
  stopSongWhenAnOtherIsPlayed: boolean,
  src: string,
  index: number,
  setPlayingIndex: any
) {
  // Check and stop the currently playing audio
  if (currentAudio.current && stopSongWhenAnOtherIsPlayed) {
    currentAudio.current.pause();
    currentAudio.current.currentTime = 0;
  }

  setPlayingIndex(index);

  const audio = new Audio(src);
  audio.play();

  // Assign the currently playing audio to the ref
  currentAudio.current = audio;

  audio.onended = () => {
    setPlayingIndex(null);
    currentAudio.current = null;
  };
}
