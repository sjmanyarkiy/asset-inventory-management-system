import { useEffect } from "react";

export default function AssetTypeForm({
  onSubmit,
  selectedType,
  clearSelection,
  form,
  setForm,
}) {

  /* =========================
     LOAD EDIT DATA
  ========================= */
  useEffect(() => {
    if (selectedType) {
      setForm(selectedType);
    }
  }, [selectedType]);

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

    if (!form.name?.trim()) return;

    onSubmit({
      name: form.name.trim(),
      description: form.description,
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
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="border p-2 w-full md:w-80"
      />

      <div className="flex gap-2">

        <button className="bg-blue-500 text-white px-4 py-2">
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