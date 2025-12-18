"use client";

import BookForm from "@/components/BookForm";
import { addBook } from "@/lib/firestore";
import { useRouter } from "next/navigation";

export default function AddBookPage() {
  const router = useRouter();

  const handleCreate = async (data: any) => {
    await addBook(data);
    router.push("/dashboard/books");
  };

  return <BookForm title="Add New Book" onSubmit={handleCreate} />;
}
