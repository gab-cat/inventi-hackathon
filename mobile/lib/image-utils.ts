/**
 * Image compression utility for Expo/React Native using expo-image-manipulator.
 * Always outputs WebP.
 */
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export type CompressOptions = {
  width?: number;
  height?: number;
  maxSize?: number; // used only if width/height not provided (square)
  quality?: number; // 0..1
  format?: 'jpeg' | 'png' | 'webp';
  cropToSquare?: boolean;
};

export type CompressedImageResult = {
  base64: string;
  mimeType: string;
  uri: string;
};

/**
 * Compress an image in Expo/React Native. Accepts an image URI or base64 string and returns compressed image data.
 */
export async function compressImage(
  input: { uri: string } | { base64: string; mimeType?: string },
  options: CompressOptions = {}
): Promise<CompressedImageResult> {
  const quality = options.quality ?? 0.8;
  const targetW = options.width;
  const targetH = options.height;
  const cropToSquare = options.cropToSquare !== false;

  const initialUri = 'uri' in input ? input.uri : `data:${input.mimeType ?? 'image/jpeg'};base64,${input.base64}`;
  const actions: import('expo-image-manipulator').Action[] = [];

  if (targetW || targetH) {
    actions.push({ resize: { width: targetW, height: targetH } } as import('expo-image-manipulator').Action);
  }

  // First pass resize if needed
  const resized = actions.length
    ? await manipulateAsync(initialUri, actions, { compress: quality, format: SaveFormat.WEBP, base64: true })
    : await manipulateAsync(initialUri, [], { compress: quality, format: SaveFormat.WEBP, base64: true });

  // Optional square crop after resize
  let finalBase64 = resized.base64!;
  let workingUri = resized.uri;

  if (cropToSquare) {
    // We need dimensions; do another no-op to obtain width/height if not present
    const meta = await manipulateAsync(workingUri, [], { compress: 1, format: SaveFormat.WEBP });
    const w = meta.width ?? targetW ?? 0;
    const h = meta.height ?? targetH ?? 0;
    const side = Math.min(w, h);
    const originX = Math.floor((w - side) / 2);
    const originY = Math.floor((h - side) / 2);
    const cropped = await manipulateAsync(workingUri, [{ crop: { originX, originY, width: side, height: side } }], {
      compress: quality,
      format: SaveFormat.WEBP,
      base64: true,
    });
    finalBase64 = cropped.base64!;
    workingUri = cropped.uri;
  }

  // Return base64 string directly for React Native compatibility
  return {
    base64: finalBase64,
    mimeType: 'image/webp',
    uri: workingUri,
  };
}

/**
 * Validates file size and type
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (max 5MB)
  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSizeInBytes) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  // Check supported formats
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
  if (!supportedTypes.includes(file.type)) {
    return { valid: false, error: 'Supported formats: JPEG, PNG, WebP, GIF, BMP' };
  }

  return { valid: true };
}
