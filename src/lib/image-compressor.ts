/**
 * High-performance client-side image compression and auto-conversion to WebP.
 * Works seamlessly in all modern browsers using the HTML5 Canvas API.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.82)
  squareCrop?: boolean;
}

export interface CompressedImageResult {
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  width: number;
  height: number;
}

/**
 * Format bytes to readable string (e.g. 2.1 MB, 145 KB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Compress an image file and convert it into an optimized WebP File object.
 * 
 * @param file The original File (PNG, JPEG, etc.)
 * @param options Custom compression settings
 * @returns CompressedImageResult with the new File, blob URL preview, and stats
 */
export async function compressImageToWebP(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    squareCrop = false,
  } = options;

  // If not an image (e.g. video/svg), return unchanged
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    const previewUrl = URL.createObjectURL(file);
    return {
      file,
      previewUrl,
      originalSize: file.size,
      compressedSize: file.size,
      savingsPercent: 0,
      width: 0,
      height: 0,
    };
  }

  // Load the image either via createImageBitmap (fastest, handles EXIF orientation) or Image element
  let sourceWidth = 0;
  let sourceHeight = 0;
  let drawable: ImageBitmap | HTMLImageElement;
  let objectUrlToRevoke: string | null = null;

  try {
    if (typeof window !== "undefined" && "createImageBitmap" in window) {
      drawable = await createImageBitmap(file);
      sourceWidth = drawable.width;
      sourceHeight = drawable.height;
    } else {
      objectUrlToRevoke = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image for compression"));
        img.src = objectUrlToRevoke!;
      });
      drawable = img;
      sourceWidth = img.naturalWidth || img.width;
      sourceHeight = img.naturalHeight || img.height;
    }

    // Determine target canvas dimensions
    let targetWidth = sourceWidth;
    let targetHeight = sourceHeight;
    let sx = 0;
    let sy = 0;
    let sWidth = sourceWidth;
    let sHeight = sourceHeight;

    if (squareCrop) {
      const minEdge = Math.min(sourceWidth, sourceHeight);
      const finalEdge = Math.min(minEdge, maxWidth);
      sx = (sourceWidth - minEdge) / 2;
      sy = (sourceHeight - minEdge) / 2;
      sWidth = minEdge;
      sHeight = minEdge;
      targetWidth = finalEdge;
      targetHeight = finalEdge;
    } else {
      if (targetWidth > maxWidth || targetHeight > maxHeight) {
        if (targetWidth / maxWidth > targetHeight / maxHeight) {
          targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
          targetWidth = maxWidth;
        } else {
          targetWidth = Math.round((targetWidth * maxHeight) / targetHeight);
          targetHeight = maxHeight;
        }
      }
    }

    // Create canvas and draw image
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      throw new Error("Canvas 2D context is not supported");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(drawable, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

    // Clean up ImageBitmap if applicable
    if ("close" in drawable && typeof drawable.close === "function") {
      drawable.close();
    }

    // Convert canvas to WebP Blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error("Canvas toBlob WebP conversion failed"));
        },
        "image/webp",
        quality
      );
    });

    // Create a new File with .webp extension
    const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    const cleanFileName = `${baseName}.webp`;
    const webpFile = new File([blob], cleanFileName, {
      type: "image/webp",
      lastModified: Date.now(),
    });

    const previewUrl = URL.createObjectURL(blob);
    const savings = Math.max(0, Math.round(((file.size - webpFile.size) / file.size) * 100));

    console.info(
      `[ImageCompressor] Converted "${file.name}" (${formatBytes(file.size)}) → "${cleanFileName}" (${formatBytes(webpFile.size)}, -${savings}%)`
    );

    return {
      file: webpFile,
      previewUrl,
      originalSize: file.size,
      compressedSize: webpFile.size,
      savingsPercent: savings,
      width: targetWidth,
      height: targetHeight,
    };
  } finally {
    if (objectUrlToRevoke) {
      URL.revokeObjectURL(objectUrlToRevoke);
    }
  }
}
