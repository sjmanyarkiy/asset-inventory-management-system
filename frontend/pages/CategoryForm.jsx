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

  /* =========================
     LOAD SELECTED CATEGORY
  ========================= */
  useEffect(() => {
    if (selectedCategory) {
      setForm({
        name: selectedCategory.name || "",
        category_code: selectedCategory.category_code || "",
        description: selectedCategory.description || "",
      });
    } else {
      resetForm();
    }
  }, [selectedCategory]);

  /* =========================
     HANDLE INPUT
  ========================= */
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* =========================
     RESET FORM
  ========================= */
  const resetForm = () => {
    setForm({
      name: "",
      category_code: "",
      description: "",
    });
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      category_code: form.category_code.trim(),
      description: form.description?.trim() || "",
    };

    onSubmit(payload);

    // reset only after CREATE
    if (!selectedCategory) {
      resetForm();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-4">

      {/* NAME */}
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Category Name"
        className="border p-2 w-full md:w-80"
      />

      {/* CODE */}
      <input
        name="category_code"
        value={form.category_code}
        onChange={handleChange}
        placeholder="Category Code"
        className="border p-2 w-full md:w-80"
      />

      {/* DESCRIPTION */}
      <input
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="border p-2 w-full md:w-80"
      />

      {/* BUTTONS */}
      <div className="flex gap-2">

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2"
        >
          {selectedCategory ? "Update Category" : "Create Category"}
        </button>

        {selectedCategory && (
          <button
            type="button"
            onClick={() => {
              clearSelection();
              resetForm();
            }}
            className="bg-gray-400 text-white px-4 py-2"
          >
            Cancel
          </button>
        )}

      </div>
    </form>
  );
}