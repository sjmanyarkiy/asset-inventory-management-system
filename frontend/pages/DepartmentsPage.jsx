import { useEffect, useState } from "react";
import DepartmentSearch from "../src/components/DepartmentSearch";
import DepartmentForm from "../pages/DepartmentForm";
import toast from "react-hot-toast";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const BASE_URL = `${import.meta.env.VITE_API_URL}/api/departments`;

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  });

  // =========================
  // FETCH FUNCTION
  // =========================
  const fetchDepartments = async (searchText = "") => {
    setLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}?page=1&search=${encodeURIComponent(searchText)}`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to fetch departments");
        return;
      }

      setDepartments(data.data || []);
    } catch (error) {
      console.error("FETCH ERROR:", error);
      toast.error("Network error while loading departments");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchDepartments();
  }, []);

  // =========================
  // DEBOUNCED SEARCH
  // =========================
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchDepartments(search);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  const handleSearch = (text) => {
    setSearch(text);
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (formData) => {
    try {
      let res;

      if (selectedDepartment) {
        const confirmUpdate = window.confirm("Update this department?");
        if (!confirmUpdate) return;

        res = await fetch(`${BASE_URL}/${selectedDepartment.id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        });
      } else {
        const confirmCreate = window.confirm("Create this department?");
        if (!confirmCreate) return;

        res = await fetch(BASE_URL, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        });
      }

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Operation failed");
        return;
      }

      toast.success(
        selectedDepartment
          ? "Department updated"
          : "Department created"
      );

      setSelectedDepartment(null);
      fetchDepartments(search); // keep current filter
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this department?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Delete failed");
        return;
      }

      toast.success("Department deleted");
      fetchDepartments(search);
    } catch (err) {
      console.error(err);
      toast.error("Delete error");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Departments Management</h2>

      <DepartmentForm
        onSubmit={handleSubmit}
        selectedDepartment={selectedDepartment}
        clearSelection={() => setSelectedDepartment(null)}
      />

      <DepartmentSearch onSearch={handleSearch} />

      {loading && <p>Loading...</p>}

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
                <td className="border p-2">
                  {dept.department_code || "-"}
                </td>
                <td className="border p-2">
                  {dept.location || "-"}
                </td>

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
              <td className="text-center p-4" colSpan="4">
                No departments found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}