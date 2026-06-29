/**
 * Utility to convert an image File to a persistent Base64 Data URL.
 * This completely bypasses any cloud storage requirements (like S3) for a fully functional offline local demo.
 */
export async function uploadImage(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (err) => {
      reject(new Error('Failed to read image file as Data URL: ' + err));
    };
    reader.readAsDataURL(file);
  });
}
