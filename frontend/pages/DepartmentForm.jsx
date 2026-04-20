import { useState, useEffect } from "react";

export default function DepartmentForm({
  onSubmit,
  selectedDepartment,
  clearSelection,
}) {
  const [form, setForm] = useState({
    name: "",
    department_code: "",
    description: "",
    location: "",
  });

  // 🔄 Populate form when editing
  useEffect(() => {
    if (selectedDepartment) {
      setForm({
        name: selectedDepartment.name || "",
        department_code: selectedDepartment.department_code || "",
        description: selectedDepartment.description || "",
        location: selectedDepartment.location || "",
      });
    } else {
      setForm({
        name: "",
        department_code: "",
        description: "",
        location: "",
      });
    }
  }, [selectedDepartment]);

  // ✏️ Handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🚀 Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.department_code) {
      alert("Name and Department Code are required");
      return;
    }

    onSubmit(form);

    if (!selectedDepartment) {
      setForm({
        name: "",
        department_code: "",
        description: "",
        location: "",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border p-4 rounded mb-4 space-y-3"
    >
      <h3 className="font-bold text-lg">
        {selectedDepartment ? "Update Department" : "Create Department"}
      </h3>

      {/* Name */}
      <input
        type="text"
        name="name"
        placeholder="Department Name"
        value={form.name}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* Code */}
      <input
        type="text"
        name="department_code"
        placeholder="Department Code"
        value={form.department_code}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* Description */}
      <input
        type="text"
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* Location */}
      <input
        type="text"
        name="location"
        placeholder="Location"
        value={form.location}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {selectedDepartment ? "Update" : "Create"}
        </button>

        {selectedDepartment && (
          <button
            type="button"
            onClick={clearSelection}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}