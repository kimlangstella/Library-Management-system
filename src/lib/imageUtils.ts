export const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        // 1. Create an image element to load the file
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            // 2. Create a canvas to resize
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Calculate new dimensions (Max width 600px to keep size small)
            const MAX_WIDTH = 600;
            const scale = MAX_WIDTH / img.width;
            const width = scale < 1 ? MAX_WIDTH : img.width;
            const height = scale < 1 ? img.height * scale : img.height;

            canvas.width = width;
            canvas.height = height;

            // 3. Draw and Compress
            ctx?.drawImage(img, 0, 0, width, height);

            // Get Base64 string (JPEG at 0.7 quality to save space)
            const base64 = canvas.toDataURL("image/jpeg", 0.7);

            // Check size (Firestore limit is ~1MB, we aim for < 100KB for speed)
            if (base64.length > 800000) {
                reject(new Error("Image is still too large. Please pick a smaller image."));
            } else {
                resolve(base64);
            }
        };

        img.onerror = (error) => reject(error);
    });
};
