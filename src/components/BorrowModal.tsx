import { useState } from "react";

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (borrowerName: string, qty: number, dueDate: string) => Promise<void>;
  bookTitle: string;
  maxQty: number;
}

export default function BorrowModal({ isOpen, onClose, onConfirm, bookTitle, maxQty }: BorrowModalProps) {
  const [borrowerName, setBorrowerName] = useState("");
  const [qty, setQty] = useState(1);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14); // Default 2 weeks
    return date.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(borrowerName, qty, dueDate);
      // Reset form (optional, but good practice if reused)
      setBorrowerName("");
      setQty(1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-khmer">ខ្ចីសៀវភៅ</h2>
        <p className="text-sm text-gray-500 mb-6">
          ចំណងជើង: <span className="font-bold text-gray-900">{bookTitle}</span>
        </p>
 
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-black border-none">ឈ្មោះអ្នកខ្ចី / អត្តសញ្ញាណប័ណ្ណ</label>
            <input
              type="text"
              required
              placeholder="ឧទាហរណ៍: សុខ ឬ ID-123"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-black"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
            />
          </div>
 
          <div>
            <label className="block text-sm font-bold text-black border-none">ចំនួន (អតិបរមា: {maxQty})</label>
            <input
              type="number"
              required
              min="1"
              max={maxQty}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-black"
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value))}
            />
          </div>
 
          <div>
            <label className="block text-sm font-bold text-black border-none">ថ្ងៃត្រូវសងវិញ</label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-black"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">ជ្រើសរើសថ្ងៃដែលត្រូវយកសៀវភៅមកសងវិញ។</p>
          </div>
 
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "កំពុងដំណើរការ..." : "បញ្ជាក់ការខ្ចី"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
