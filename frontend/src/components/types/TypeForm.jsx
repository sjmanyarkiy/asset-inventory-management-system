import { useEffect } from "react";

export default function AssetTypeForm({
  onSubmit,
  selectedType,
  clearSelection,
  categories,
  form,
  setForm,
}) {

  /* =========================
     LOAD EDIT DATA (SAFE CLONE)
  ========================= */
  useEffect(() => {
    if (selectedType) {
      setForm({
        name: selectedType.name || "",
        type_code: selectedType.type_code || "",
        category_id: selectedType.category_id || "",
        description: selectedType.description || "",
      });
    } else {
      setForm({
        name: "",
        type_code: "",
        category_id: "",
        description: "",
      });
    }
  }, [selectedType, setForm]);

  /* =========================
     CHANGE HANDLER
  ========================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = (e) => {
    e.preventDefault();

    // FINAL SAFETY FIX (CRITICAL)
    if (!form.name || !form.type_code || !form.category_id) return;

    onSubmit({
      name: form.name.trim(),
      type_code: form.type_code.trim().toUpperCase(),
      category_id: Number(form.category_id),
      description: form.description?.trim() || "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-6">

      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Type Name"
        className="border p-2 w-full md:w-80"
      />

      <input
        name="type_code"
        value={form.type_code}
        onChange={handleChange}
        placeholder="Type Code"
        className="border p-2 w-full md:w-80"
      />

      <select
        name="category_id"
        value={form.category_id}
        onChange={handleChange}
        className="border p-2 w-full md:w-80"
      >
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="border p-2 w-full md:w-80"
      />

      <div className="flex gap-2">

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2"
        >
          {selectedType ? "Update" : "Create"}
        </button>

        {selectedType && (
          <button
            type="button"
            onClick={clearSelection}
            className="bg-gray-400 text-white px-4 py-2"
          >
            Cancel
          </button>
        )}

      </div>
    </form>
  );
}