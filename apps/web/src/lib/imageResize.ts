// Downscale + recompress an image client-side before it's sent to the API,
// so a phone photo doesn't turn into a multi-megabyte upload and inflate
// Anthropic vision costs. 1568px matches Claude's recommended max image
// dimension — anything larger doesn't improve analysis quality, just cost.
const MAX_DIMENSION = 1568;
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const MAX_RESULT_BYTES = 5 * 1024 * 1024;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Bild konnte nicht geladen werden."));
    img.src = src;
  });
}

function encode(img: HTMLImageElement, quality: number): string {
  let { width, height } = img;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_DIMENSION) / width);
      width = MAX_DIMENSION;
    } else {
      width = Math.round((width * MAX_DIMENSION) / height);
      height = MAX_DIMENSION;
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Bild konnte nicht verarbeitet werden.");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

function decodedByteSize(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return Math.ceil((base64.length * 3) / 4);
}

export async function resizeImageForUpload(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Bitte wähle eine Bilddatei aus.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("Die Datei ist zu groß (maximal 15 MB).");
  }

  const dataUrl = await readAsDataUrl(file);
  const img = await loadImage(dataUrl);

  let result = encode(img, 0.85);
  if (decodedByteSize(result) > MAX_RESULT_BYTES) {
    result = encode(img, 0.6);
  }
  if (decodedByteSize(result) > MAX_RESULT_BYTES) {
    throw new Error("Das Bild ist auch verkleinert noch zu groß. Bitte versuch ein anderes Bild.");
  }
  return result;
}
