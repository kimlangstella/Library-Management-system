import { useState, useRef, useEffect } from "react";
import { Book } from "@/types/book";
import toast from "react-hot-toast";
import { convertImageToBase64 } from "@/lib/imageUtils";
import { getCategories, Category } from "@/lib/categoryService";

interface BookFormProps {
  initialData?: Partial<Book>;
  onSubmit: (data: Omit<Book, "id">) => Promise<void>;
  title: string;
}

export default function BookForm({ initialData, onSubmit, title }: BookFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    author: initialData?.author || "",
    category: initialData?.category || "",
    isbn: initialData?.isbn || "",
    totalStock: initialData?.totalStock || 0,
    availableStock: initialData?.availableStock || 0,
    imageUrl: initialData?.imageUrl || "",
    arrivalDate: initialData?.arrivalDate || new Date().toISOString().split('T')[0],
    damagedStock: initialData?.damagedStock || 0,
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (e) {
        console.error("Failed to load categories");
      }
    })();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const toastId = toast.loading("កំពុងដំណើរការរូបភាព...");

      try {
        const base64 = await convertImageToBase64(file);
        setFormData(prev => ({ ...prev, imageUrl: base64 }));
        toast.success("រូបភាពរួចរាល់", { id: toastId });
      } catch (error) {
        console.error(error);
        toast.error("រូបភាពធំពេក ឬមិនត្រឹមត្រូវ", { id: toastId });
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For new books, available stock defaults to total stock minus damaged stock
      const stockData = !initialData
        ? { ...formData, availableStock: formData.totalStock - formData.damagedStock }
        : formData;

      await onSubmit({
        ...stockData,
        createdAt: initialData?.createdAt || new Date().toISOString(),
      });

      toast.success("បានរក្សាទុកសៀវភៅដោយជោគជ័យ");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(`កំហុស: ${error?.message || "មិនស្គាល់កំហុស"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-6">{title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Base64 Image Upload */}
        <div>
          <label className="block text-sm font-bold text-black mb-2">រូបភាពក្របសៀវភៅ</label>
          <div className="flex items-start space-x-4">
            <div className="w-24 h-36 bg-gray-100 rounded-lg border border-gray-300 overflow-hidden flex-shrink-0">
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="P" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-xs">គ្មានរូបភាព</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                ចំណាំ: JPG, PNG. រូបភាពនឹងត្រូវបានបង្កើនគុណភាពដោយស្វ័យប្រវត្តិ។
              </p>
              {formData.imageUrl && (
                 <button 
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({...prev, imageUrl: ""}));
                    if(fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-xs text-red-600 mt-2 hover:underline"
                 >
                   លុបរូបភាព
                 </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-black">ចំណងជើង</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-black"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-black">អ្នកនិពន្ធ</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-black"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-black">ប្រភេទ</label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-black"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="">ជ្រើសរើសប្រភេទ</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
            {/* Fallback if current category was deleted/hardcoded */}
            {formData.category && !categories.some(c => c.name === formData.category) && (
               <option value={formData.category}>{formData.category}</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-black">កាលបរិច្ឆេទចូលស្តុក (Arrival Date)</label>
          <input
            type="date"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-black"
            value={formData.arrivalDate}
            onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-black">ISBN / លេខកូដ</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-black"
            value={formData.isbn}
            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-black">ស្តុករួម</label>
            <input
              type="number"
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-black"
              value={formData.totalStock}
              onChange={(e) =>
                setFormData({ ...formData, totalStock: parseInt(e.target.value) })
              }
            />
          </div>
          {initialData && (
            <div>
              <label className="block text-sm font-bold text-black">ស្តុកដែលអាចខ្ចីបាន</label>
              <input
                type="number"
                required
                min="0"
                max={formData.totalStock - formData.damagedStock}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-black"
                value={formData.availableStock}
                onChange={(e) =>
                  setFormData({ ...formData, availableStock: parseInt(e.target.value) })
                }
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-black">សៀវភៅខូច (Damaged)</label>
            <input
              type="number"
              required
              min="0"
              max={formData.totalStock}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-black"
              value={formData.damagedStock}
              onChange={(e) =>
                setFormData({ ...formData, damagedStock: parseInt(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 font-medium"
          >
            {loading ? "កំពុងរក្សាទុក..." : "រក្សាទុកសៀវភៅ"}
          </button>
        </div>
      </form>
    </div>
  );
}
