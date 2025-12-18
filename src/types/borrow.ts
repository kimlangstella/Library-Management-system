export type BorrowStatus = 'borrowed' | 'returned' | 'overdue';

export interface BorrowRecord {
    id: string;
    bookId: string;
    bookTitle: string;
    bookIsbn?: string;
    borrowerName: string;
    qty: number;
    borrowDate: string; // ISO string
    dueDate: string; // ISO string
    returnDate?: string | null; // ISO string
    status: BorrowStatus;
}
