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
