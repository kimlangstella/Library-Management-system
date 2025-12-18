export interface Book {
    id: string;
    title: string;
    author: string;
    category: string;
    isbn: string;
    totalStock: number;
    availableStock: number;
    imageUrl?: string;
    createdAt: string; // ISO string
    arrivalDate: string; // ISO or YYYY-MM-DD
    damagedStock: number;
}
