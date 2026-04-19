import { useEffect, useState } from "react";
import DepartmentSearch from "../components/departments/DepartmentSearch";
import DepartmentForm from "../components/departments/DepartmentForm";
import toast from "react-hot-toast";
import api from "../services/api";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // =========================
  // FETCH (ONLY SOURCE OF TRUTH)
  // =========================
  const fetchDepartments = async (searchText = "") => {
    try {
      setLoading(true);

      const res = await api.get("/departments", {
        params: searchText ? { search: searchText.trim() } : undefined,
      });

      setDepartments(res.data?.data || []);
    } catch (error) {
      console.error("FETCH ERROR:", error);
      toast.error("Failed to load departments ❌");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD + SEARCH WATCHER
  // =========================
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchDepartments(search);
    }, 300); // 🔥 debounce prevents flicker

    return () => clearTimeout(delay);
  }, [search]);

  // initial load trigger (optional safety)
  useEffect(() => {
    fetchDepartments();
  }, []);

  // =========================
  // SEARCH (ONLY SET STATE)
  // =========================
  const handleSearch = (value) => {
    setSearch(value);
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (formData) => {
    try {
      let res;

      if (selectedDepartment) {
        const confirmUpdate = window.confirm(
          "⚠️ Are you sure you want to update this department?"
        );

        if (!confirmUpdate) return;

        res = await api.put(`/departments/${selectedDepartment.id}`, formData);

      } else {
        const confirmCreate = window.confirm(
          "✔️ Do you want to create this department?"
        );

        if (!confirmCreate) return;

        res = await api.post("/departments", formData);
      }

      const result = res.data;

      if (!result) {
        toast.error("Operation failed ❌");
        return;
      }

      toast.success(
        selectedDepartment
          ? "Department updated successfully 🎉"
          : "Department created successfully 🎉"
      );

      setSelectedDepartment(null);

      await fetchDepartments(search);

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
      await api.delete(`/departments/${id}`);

      toast.success("Department deleted 🗑️");

      if (selectedDepartment?.id === id) {
        setSelectedDepartment(null);
      }

      await fetchDepartments(search);

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
                  <button
                    onClick={() => setSelectedDepartment(dept)}
                    className="bg-yellow-400 px-2 py-1 rounded mr-2"
                  >
                    Edit
                  </button>

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