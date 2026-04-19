import api from "../../services/api";
import CategoryForm from "./CategoryForm";

const CategoryModal = ({
  onClose,
  onSuccess,
  selectedCategory,   // ✅ now controlled from parent
}) => {
  const handleSubmit = async (payload) => {
    try {
      if (selectedCategory) {
        await api.put(`/categories/${selectedCategory.id}`, payload);
      } else {
        await api.post("/categories", payload);
      }

      onSuccess(); // refresh list + dropdowns
      onClose();   // close modal
    } catch (err) {
      console.error("Category error:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-[450px]">

        <h2 className="text-lg font-bold mb-4">
          {selectedCategory ? "Edit Category" : "Create Category"}
        </h2>

        <CategoryForm
          onSubmit={handleSubmit}
          selectedCategory={selectedCategory}
          clearSelection={onClose}
        />

        {/* CLOSE BUTTON */}
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-3 py-1 rounded"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default CategoryModal;