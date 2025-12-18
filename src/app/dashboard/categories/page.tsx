"use client";

import { useEffect, useState } from "react";
import { getCategories, addCategory, deleteCategory, Category } from "@/lib/categoryService";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("ការទាញយកប្រភេទសៀវភៅបរាជ័យ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setSubmitting(true);
    try {
      await addCategory(newCategory);
      setNewCategory("");
      toast.success("បានបន្ថែមប្រភេទសៀវភៅ");
      fetchCategories();
    } catch (error) {
      toast.error("ការបន្ថែមប្រភេទសៀវភៅបរាជ័យ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("តើអ្នកប្រាកដថាចង់លុបប្រភេទសៀវភៅនេះមែនទេ?")) return;

    try {
      await deleteCategory(id);
      toast.success("បានលុបប្រភេទសៀវភៅ");
      fetchCategories();
    } catch (error) {
      toast.error("ការលុបប្រភេទសៀវភៅបរាជ័យ");
    }
  };

  if (loading) return <div className="p-8">កំពុងទាញយកប្រភេទសៀវភៅ...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-black">
      <h1 className="text-2xl font-bold text-gray-900 border-none">ការគ្រប់គ្រងប្រភេទសៀវភៅ</h1>

      {/* Add Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-black border-none mb-4">បន្ថែមប្រភេទសៀវភៅថ្មី</h2>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="text"
            placeholder="ឧទាហរណ៍: រឿងព្រេង..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-black"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button
            type="submit"
            disabled={submitting || !newCategory.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-bold"
          >
            {submitting ? "កំពុងបន្ថែម..." : "បន្ថែម"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                ឈ្មោះប្រភេទសៀវភៅ
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-black uppercase tracking-wider">
                សកម្មភាព
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                  មិនទាន់មានប្រភេទសៀវភៅនៅឡើយទេ។ សូមបន្ថែមខាងលើ។
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-red-600 hover:text-red-900 font-bold"
                    >
                      លុប
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
