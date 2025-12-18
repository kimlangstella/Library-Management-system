import {
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    runTransaction,
    Timestamp,
    query,
    where,
    getDocs,
    orderBy
} from "firebase/firestore";
import { db } from "./firebase";
import { Book } from "@/types/book";
import { BorrowRecord } from "@/types/borrow";

const BOOKS_COLLECTION = "books";
const BORROWS_COLLECTION = "borrows";

export const borrowBook = async (borrowerName: string, bookId: string, qty: number, customDueDate?: string) => {
    if (!borrowerName) throw new Error("Borrower Name is required");
    if (qty <= 0) throw new Error("Quantity must be greater than 0");

    // Run as a transaction to ensure stock is available and updated atomically
    await runTransaction(db, async (transaction) => {
        const bookRef = doc(db, BOOKS_COLLECTION, bookId);
        const bookDoc = await transaction.get(bookRef);

        if (!bookDoc.exists()) {
            throw new Error("Book does not exist");
        }

        const book = bookDoc.data() as Book;

        if (book.availableStock < qty) {
            throw new Error(`Not enough stock. Available: ${book.availableStock}`);
        }

        // 1. Decrement Stock
        transaction.update(bookRef, {
            availableStock: book.availableStock - qty
        });

        // 2. Create Borrow Record reference
        const borrowRef = doc(collection(db, BORROWS_COLLECTION));

        // Calculate dates
        const now = new Date();
        let dueDate;

        if (customDueDate) {
            dueDate = new Date(customDueDate);
        } else {
            dueDate = new Date();
            dueDate.setDate(now.getDate() + 14); // Default 2 weeks
        }

        transaction.set(borrowRef, {
            bookId,
            bookTitle: book.title, // Snapshot title
            bookIsbn: book.isbn,
            borrowerName,
            qty,
            borrowDate: now.toISOString(),
            dueDate: dueDate.toISOString(),
            returnDate: null,
            status: 'borrowed'
        });
    });
};

export const returnBook = async (borrowId: string, bookId: string) => {
    await runTransaction(db, async (transaction) => {
        const borrowRef = doc(db, BORROWS_COLLECTION, borrowId);
        const bookRef = doc(db, BOOKS_COLLECTION, bookId);

        const borrowDoc = await transaction.get(borrowRef);
        if (!borrowDoc.exists()) throw new Error("Borrow record not found");

        const borrowData = borrowDoc.data() as BorrowRecord;
        if (borrowData.status === 'returned') throw new Error("Book already returned");

        const bookDoc = await transaction.get(bookRef);
        if (!bookDoc.exists()) throw new Error("Book not found");

        const book = bookDoc.data() as Book;

        // 1. Update Borrow Status
        transaction.update(borrowRef, {
            status: 'returned',
            returnDate: new Date().toISOString()
        });

        // 2. Increment Stock
        transaction.update(bookRef, {
            availableStock: book.availableStock + borrowData.qty
        });
    });
};

export const getBorrowHistory = async (userId?: string) => {
    let q;
    if (userId) {
        q = query(
            collection(db, BORROWS_COLLECTION),
            where("borrowerName", "==", userId),
            orderBy("borrowDate", "desc")
        );
    } else {
        // Admin view: all borrows
        q = query(
            collection(db, BORROWS_COLLECTION),
            orderBy("borrowDate", "desc")
        );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BorrowRecord));
};
