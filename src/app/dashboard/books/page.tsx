"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBooks, deleteBook } from "@/lib/firestore";
import { borrowBook } from "@/lib/borrowService";
import { Book } from "@/types/book";
import toast from "react-hot-toast";
import { getCategories, Category } from "@/lib/categoryService";

import BorrowModal from "@/components/BorrowModal";

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDamagedOnly, setShowDamagedOnly] = useState(false);
  // State for Modal
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("ការទាញយកទិន្នន័យសៀវភៅបរាជ័យ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    (async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    })();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("តើអ្នកប្រាកដថាចង់លុបសៀវភៅនេះមែនទេ?")) {
      toast.promise(
        (async () => {
          await deleteBook(id);
          fetchBooks();
        })(),
        {
          loading: "កំពុងលុប...",
          success: "បានលុបសៀវភៅដោយជោគជ័យ",
          error: "ការលុបសៀវភៅបរាជ័យ",
        }
      );
    }
  };

  const openBorrowModal = (book: Book) => {
    if (book.availableStock <= 0) {
      toast.error("សៀវភៅនេះអស់ពីស្តុកហើយ");
      return;
    }
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleBorrowConfirm = async (borrowerName: string, qty: number, dueDate: string) => {
    if (!selectedBook) return;

    await borrowBook(borrowerName, selectedBook.id, qty, dueDate);
    toast.success("បានខ្ចីសៀវភៅដោយជោគជ័យ!");
    
    setIsModalOpen(false);
    setSelectedBook(null);
    fetchBooks();
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    const matchesDamaged = !showDamagedOnly || (book.damagedStock && book.damagedStock > 0);

    return matchesSearch && matchesCategory && matchesDamaged;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modal */}
      {selectedBook && (
        <BorrowModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleBorrowConfirm}
          bookTitle={selectedBook.title}
          maxQty={selectedBook.availableStock}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">សៀវភៅ</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <select
            className="border border-gray-300 rounded-md text-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all shadow-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">គ្រប់ប្រភេទ</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <button
            onClick={() => setShowDamagedOnly(!showDamagedOnly)}
            className={`px-4 py-2 rounded-md font-medium transition-all whitespace-nowrap ${
              showDamagedOnly 
                ? 'bg-rose-600 text-white hover:bg-rose-700' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {showDamagedOnly ? '✓ សៀវភៅខូច' : 'សៀវភៅខូច'}
          </button>

          <input
            type="text"
            placeholder="ស្វែងរកតាមចំណងជើង អ្នកនិពន្ធ ឬ ISBN..."
            className="border border-gray-300 text-gray-700 rounded-md px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Link
            href="/dashboard/books/add"
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap font-medium"
          >
            + បន្ថែមសៀវភៅ
          </Link>
        </div>
      </div>

      {!loading && filteredBooks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">
            {searchQuery ? "មិនមានសៀវភៅដែលត្រូវនឹងការស្វែងរករបស់អ្នកទេ។" : "មិនទាន់មានសៀវភៅនៅឡើយទេ។ សូមបន្ថែមសៀវភៅថ្មី។"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {filteredBooks.map((book) => (
            <div 
              key={book.id} 
              className="group flex flex-col space-y-3"
            >
              {/* Square Image Container - More Premium */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500 border border-gray-100">
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.247 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
                
                {/* Discrete Stock Indicator */}
                <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
                  <div className="flex items-center bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full shadow-sm">
                    <span className={`w-1.5 h-1.5 rounded-full mr-1 ${book.availableStock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    <span className="text-[9px] font-bold text-slate-800">{book.availableStock}</span>
                  </div>
                  {book.damagedStock > 0 && (
                    <div className="flex items-center bg-rose-500/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full shadow-sm">
                      <span className="text-[9px] font-bold text-white">ខូច: {book.damagedStock}</span>
                    </div>
                  )}
                </div>

                {/* Subtle Action Overlays */}
                <div className="absolute top-2 left-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/dashboard/books/edit/${book.id}`}
                    className="p-1.5 bg-white/80 hover:bg-white text-slate-600 rounded-lg shadow-sm backdrop-blur-sm transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Minimalist Details Below Image */}
              <div className="flex flex-col items-center">
                <h3 className="text-slate-900 font-bold text-sm line-clamp-1 mb-1 tracking-tight" title={book.title}>
                  {book.title}
                </h3>
                
                {/* Category Badge */}
                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-1">
                  {book.category}
                </span>
                
                {/* Arrival Date Display */}
                <span className="text-[10px] text-slate-400 font-medium mb-3">
                  ចូលស្តុក៖ {book.arrivalDate ? new Date(book.arrivalDate).toLocaleDateString('km-KH', { day: '2-digit', month: 'short' }) : '---'}
                </span>
                
                <button
                  onClick={() => openBorrowModal(book)}
                  disabled={book.availableStock === 0}
                  className="w-full bg-slate-900 text-white text-[11px] font-bold py-2.5 rounded-xl hover:bg-blue-600 disabled:bg-slate-100 disabled:text-slate-400 transition-all duration-300 transform active:scale-95 shadow-sm"
                >
                  ខ្ចីសៀវភៅ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
