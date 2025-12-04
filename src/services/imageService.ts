export const compressImage = async (
  file: File,
  convertToWebP: boolean = false
): Promise<{ blob: Blob; fileName: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Use original dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0);

      // Determine output settings
      let mimeType = file.type;
      let quality = 0.8; // default compression quality
      let fileName = file.name;

      if (convertToWebP) {
        mimeType = 'image/webp';
        // Change extension
        const namePart = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
        fileName = `${namePart}.webp`;
      }

      // If it's a JPEG or we are converting, we can compress. 
      // PNG compression is lossless in canvas unless converted to WebP/JPEG.
      // Canvas toBlob automatically handles encoding
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, fileName });
          } else {
            reject(new Error("Image compression failed"));
          }
        },
        mimeType,
        quality
      );
    };

    img.onerror = (err) => reject(new Error("Failed to load image"));

    reader.readAsDataURL(file);
  });
};
