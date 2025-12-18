import { db } from "./firebase";
import { collection, getDocs, doc, deleteDoc, query, orderBy, Timestamp, addDoc, getDoc, updateDoc } from "firebase/firestore";
import { Book } from "@/types/book";

const COLLECTION_NAME = "books";

export const getBooks = async (): Promise<Book[]> => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id, // Ensure doc.id overwrites any 'id' field in data
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        } as Book;
    });
};

export const deleteBook = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
};

export const addBook = async (book: Omit<Book, "id">): Promise<void> => {
    // Remove any 'id' field if it exists in the input
    const { id, ...bookData } = book as any;
    await addDoc(collection(db, COLLECTION_NAME), {
        ...bookData,
        createdAt: Timestamp.now(),
    });
};

export const getBook = async (id: string): Promise<Book | null> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            ...data,
            id: docSnap.id, // Ensure doc.id overwrites any 'id' field in data
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        } as Book;
    } else {
        return null;
    }
};

export const updateBook = async (id: string, book: Partial<Book>): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, book);
};
