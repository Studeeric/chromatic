import type { ColorScheme } from "../types";
import { extractColors } from "./colorExtraction";
import { mapColorsToScheme } from "./colorMapping";
import { optimizeColorScheme } from "./colorOptimization";

export async function processImageFile(file: File): Promise<ColorScheme> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload a valid image file.");
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const imageUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const maxSize = 500;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Failed to get canvas context.");
        }

        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);

        const extractedColors = extractColors(imageData, 30);

        if (extractedColors.length === 0) {
          throw new Error("Failed to extract colors from image.");
        }

        const colorScheme = mapColorsToScheme(extractedColors);
        const optimizedScheme = optimizeColorScheme(colorScheme);

        URL.revokeObjectURL(imageUrl);
        resolve(optimizedScheme);
      } catch (e) {
        URL.revokeObjectURL(imageUrl);
        reject(e);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("Failed to load image. Please try another file."));
    };

    img.src = imageUrl;
  });
}
