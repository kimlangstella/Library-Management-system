import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    orderBy,
    Timestamp
} from "firebase/firestore";
import { db } from "./firebase";

export interface Category {
    id: string;
    name: string;
    createdAt: string;
}

const COLLECTION_NAME = "categories";

export const getCategories = async (): Promise<Category[]> => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString()
    } as Category));
};

export const addCategory = async (name: string): Promise<void> => {
    if (!name.trim()) throw new Error("Category name is required");

    await addDoc(collection(db, COLLECTION_NAME), {
        name: name.trim(),
        createdAt: Timestamp.now()
    });
};

export const deleteCategory = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
};
