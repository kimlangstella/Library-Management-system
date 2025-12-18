"use client";

import BookForm from "@/components/BookForm";
import { getBook, updateBook } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Book } from "@/types/book";
import toast from "react-hot-toast";

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Unwrap params using React.use()
  const { id } = use(params);

  useEffect(() => {
    const fetchBook = async () => {
      // Ensure ID is valid before fetching
      if (!id) return;

      try {
        const data = await getBook(id);
        if (data) {
          setBook(data);
        } else {
          // If book isn't found, redirect seamlessly
          toast.error("Book not found");
          router.push("/dashboard/books");
        }
      } catch (error) {
        console.error("Error fetching book:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, router]);

  const handleUpdate = async (data: any) => {
    if (book?.id) {
        try {
            await updateBook(book.id, data);
            toast.success("Book updated");
            router.push("/dashboard/books");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update");
        }
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!book) return <div className="p-8">Book not found</div>;

  return <BookForm title="Edit Book" initialData={book} onSubmit={handleUpdate} />;
}
