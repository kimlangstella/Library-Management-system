"use client";

import { useEffect, useState } from "react";
import { getBorrowHistory, returnBook } from "@/lib/borrowService";
import { BorrowRecord } from "@/types/borrow";
import toast from "react-hot-toast";

export default function BorrowsPage() {
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBorrows = async () => {
    try {
      const data = await getBorrowHistory();
      setBorrows(data);
    } catch (error) {
      console.error("Error fetching borrows:", error);
      toast.error("ការទាញយកប្រវត្តិខ្ចីបរាជ័យ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, []);

  const handleReturn = async (borrow: BorrowRecord) => {
    if (!confirm(`តើអ្នកចង់សងសៀវភៅ "${borrow.bookTitle}" មែនទេ?`)) return;

    toast.promise(
      (async () => {
        await returnBook(borrow.id, borrow.bookId);
        fetchBorrows();
      })(),
      {
        loading: "កំពុងសងសៀវភៅ...",
        success: "បានសងសៀវភៅដោយជោគជ័យ",
        error: (err) => `កំហុស: ${err?.message || "ការសងសៀវភៅបរាជ័យ"}`,
      }
    );
  };

  const filteredBorrows = borrows.filter((record) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      record.bookTitle.toLowerCase().includes(searchLower) ||
      record.borrowerName.toLowerCase().includes(searchLower) ||
      record.bookIsbn?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "borrowed": return "កំពុងខ្ចី";
      case "returned": return "បានសងវិញ";
      case "overdue": return "ហួសកាលកំណត់";
      default: return status;
    }
  };

  if (loading) return <div className="p-8">កំពុងទាញយកទិន្នន័យ...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">ប្រវត្តិការខ្ចីសៀវភៅ</h1>
        
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="ស្វែងរកតាមសៀវភៅ អ្នកខ្ចី ឬ ISBN..."
            className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                  សៀវភៅ និង កូដ
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                  អ្នកខ្ចី
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                  ចំនួន
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                  ថ្ងៃខ្ចី
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                  ស្ថានភាព
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-black uppercase tracking-wider">
                  សកម្មភាព
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBorrows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {searchQuery ? "មិនឃើញលទ្ធផលស្វែងរកទេ។" : "មិនទាន់មានប្រវត្តិការខ្ចីសៀវភៅនៅឡើយទេ។"}
                  </td>
                </tr>
              ) : (
                filteredBorrows.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div>{record.bookTitle}</div>
                      <div className="text-xs text-gray-400 font-mono">{record.bookIsbn || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.borrowerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.qty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.borrowDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === "returned"
                            ? "bg-green-100 text-green-800"
                            : record.status === "overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {getStatusLabel(record.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {record.status === "borrowed" && (
                        <button
                          onClick={() => handleReturn(record)}
                          className="text-indigo-600 hover:text-indigo-900 font-bold"
                        >
                          សងសៀវភៅ
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
