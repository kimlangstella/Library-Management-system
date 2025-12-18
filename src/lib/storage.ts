import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export const uploadImage = async (file: File): Promise<string> => {
    if (!file) throw new Error("No file provided");

    // Create a unique filename
    const filename = `book-covers/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, filename);

    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error("Failed to upload image");
    }
};
