import { useEffect, useState } from "react";

export default function CategoryForm({
  onSubmit,
  selectedCategory,
  clearSelection,
}) {
  const [form, setForm] = useState({
    name: "",
    category_code: "",
    description: "",
  });

  // =========================
  // LOAD EDIT DATA / RESET
  // =========================
  useEffect(() => {
    if (selectedCategory) {
      setForm({
        name: selectedCategory.name || "",
        category_code: selectedCategory.category_code || "",
        description: selectedCategory.description || "",
      });
    } else {
      setForm({
        name: "",
        category_code: "",
        description: "",
      });
    }
  }, [selectedCategory]);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      category_code: form.category_code.trim(),
      description: form.description.trim(),
    };

    onSubmit(payload);
  };

  // =========================
  // RESET (CANCEL EDIT)
  // =========================
  const handleCancel = () => {
    clearSelection?.();
    setForm({
      name: "",
      category_code: "",
      description: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">

      {/* NAME */}
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Category Name"
        className="border p-2 w-full"
      />

      {/* CODE */}
      <input
        name="category_code"
        value={form.category_code}
        onChange={handleChange}
        placeholder="Category Code"
        className="border p-2 w-full"
      />

      {/* DESCRIPTION */}
      <input
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="border p-2 w-full"
      />

      {/* BUTTONS */}
      <div className="flex justify-end gap-2">

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {selectedCategory ? "Update" : "Create"}
        </button>

        {selectedCategory && (
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}

      </div>

    </form>
  );
}