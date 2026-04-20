import { useEffect, useState } from "react";
import DepartmentSearch from "../src/components/DepartmentSearch";
import DepartmentForm from "../pages/DepartmentForm";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5001";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = `${API_BASE_URL}/departments`;

  // =========================
  // FETCH
  // =========================
  const fetchDepartments = async (search = "") => {
    try {
      setLoading(true);

      const res = await fetch(
        `${BASE_URL}/?page=1&search=${search}`
      );

      const data = await res.json();

      setDepartments(data.data || []);
    } catch (error) {
      console.error("FETCH ERROR:", error);
      toast.error("Failed to load departments ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // =========================
  // SEARCH (LIVE)
  // =========================
  const handleSearch = (searchText) => {
    fetchDepartments(searchText);
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (formData) => {
    try {
      let res;

      // =====================
      // UPDATE
      // =====================
      if (selectedDepartment) {
        const confirmUpdate = window.confirm(
          "⚠️ Are you sure you want to update this department?"
        );

        if (!confirmUpdate) return;

        res = await fetch(`${BASE_URL}/${selectedDepartment.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

      } else {
        // =====================
        // CREATE
        // =====================
        const confirmCreate = window.confirm(
          "✔️ Do you want to create this department?"
        );

        if (!confirmCreate) return;

        res = await fetch(`${BASE_URL}/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Operation failed ❌");
        return;
      }

      // SUCCESS TOASTS
      if (selectedDepartment) {
        toast.success("Department updated successfully 🎉");
      } else {
        toast.success("Department created successfully 🎉");
      }

      fetchDepartments();
      setSelectedDepartment(null);

    } catch (err) {
      console.error("SAVE ERROR:", err);
      toast.error("Something went wrong ❌");
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete this department?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Delete failed ❌");
        return;
      }

      toast.success("Department deleted successfully 🗑️");

      fetchDepartments();

    } catch (err) {
      console.error("DELETE ERROR:", err);
      toast.error("Something went wrong ❌");
    }
  };

  return (
    <div className="p-4">

      <h2 className="text-xl font-bold mb-4">
        Departments Management
      </h2>

      {/* FORM */}
      <DepartmentForm
        onSubmit={handleSubmit}
        selectedDepartment={selectedDepartment}
        clearSelection={() => setSelectedDepartment(null)}
      />

      {/* SEARCH */}
      <DepartmentSearch onSearch={handleSearch} />

      {/* LOADING */}
      {loading && <p className="mt-2">Loading...</p>}

      {/* TABLE */}
      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Code</th>
            <th className="border p-2">Location</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {departments.length > 0 ? (
            departments.map((dept) => (
              <tr key={dept.id}>
                <td className="border p-2">{dept.name}</td>
                <td className="border p-2">{dept.department_code}</td>
                <td className="border p-2">{dept.location}</td>

                <td className="border p-2">
                  {/* EDIT */}
                  <button
                    onClick={() => setSelectedDepartment(dept)}
                    className="bg-yellow-400 px-2 py-1 rounded mr-2"
                  >
                    Edit
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-4">
                No departments found
              </td>
            </tr>
          )}
        </tbody>
      </table>

    </div>
  );
}