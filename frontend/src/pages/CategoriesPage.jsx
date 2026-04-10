import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import CategoryForm from "./CategoryForm";

import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../features/categories/categorySlice";

/* =========================
   ERROR HELPER
========================= */
const getErrorMessage = (action) => {
  return (
    action?.payload ||
    action?.error?.message ||
    "Operation failed ❌"
  );
};

export default function CategoriesPage() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.categories);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  /* =========================
     FETCH (LIVE SEARCH)
  ========================= */
  useEffect(() => {
    const delay = setTimeout(() => {
      dispatch(fetchCategories({ page: 1, search }));
    }, 300); // debounce (important for smooth live search)

    return () => clearTimeout(delay);
  }, [dispatch, search]);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (formData) => {
    try {
      let action;

      if (selectedCategory) {
        const confirmUpdate = window.confirm("⚠️ Update this category?");
        if (!confirmUpdate) return;

        action = await dispatch(
          updateCategory({
            id: selectedCategory.id,
            data: formData,
          })
        );
      } else {
        const confirmCreate = window.confirm("✔️ Create this category?");
        if (!confirmCreate) return;

        action = await dispatch(createCategory(formData));
      }

      if (action?.error) {
        toast.error(getErrorMessage(action));
        return;
      }

      toast.success(
        selectedCategory
          ? "Category updated successfully 🎉"
          : "Category created successfully 🎉"
      );

      setSelectedCategory(null);

      dispatch(fetchCategories({ page: 1, search }));

    } catch (err) {
      toast.error("Something went wrong ❌");
    }
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("⚠️ Delete this category?");
    if (!confirmDelete) return;

    const action = await dispatch(deleteCategory(id));

    if (action?.error) {
      toast.error(getErrorMessage(action));
      return;
    }

    toast.success("Category deleted 🗑️");

    // IMPORTANT: refresh list after delete
    dispatch(fetchCategories({ page: 1, search }));
  };

  return (
    <div className="p-4">

      <h1 className="text-xl font-bold mb-4">
        Asset Categories
      </h1>

      {/* SEARCH (LIVE) */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search categories..."
        className="border p-2 mb-4 w-full md:w-80"
      />

      {/* FORM */}
      <CategoryForm
        onSubmit={handleSubmit}
        selectedCategory={selectedCategory}
        clearSelection={() => setSelectedCategory(null)}
      />

      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* TABLE */}
      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Code</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data?.length > 0 ? (
            data.map((cat) => (
              <tr key={cat.id}>
                <td className="border p-2">{cat.name}</td>
                <td className="border p-2">{cat.category_code}</td>
                <td className="border p-2">{cat.description}</td>

                <td className="border p-2">
                  <button
                    onClick={() => setSelectedCategory(cat)}
                    className="text-blue-500 mr-3"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="p-4 text-center" colSpan="4">
                No categories found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}