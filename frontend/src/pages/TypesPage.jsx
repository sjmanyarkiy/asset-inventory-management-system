import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import AssetTypeForm from "../components/types/TypeForm";

import {
  fetchAssetTypes,
  createAssetType,
  updateAssetType,
  deleteAssetType,
} from "../features/types/typeSlice";

export default function AssetTypesPage() {
  const dispatch = useDispatch();
  const { data = [], loading } = useSelector((state) => state.types);

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);

  const initialForm = {
    name: "",
    type_code: "",
    category_id: "",
    description: "",
  };

  const [form, setForm] = useState(initialForm);

  const BASE_URL = "http://127.0.0.1:5000";

  /* =========================
     FETCH TYPES
  ========================= */
  useEffect(() => {
    dispatch(fetchAssetTypes({ page: 1, search }));
  }, [search, dispatch]);

  /* =========================
     FETCH CATEGORIES
  ========================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/categories?page=1&per_page=100`);
        const json = await res.json();
        setCategories(json.data || []);
      } catch {
        toast.error("Failed to load categories ❌");
      }
    };

    fetchCategories();
  }, []);

  /* =========================
     HANDLE CHANGE
  ========================= */
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* =========================
     RESET
  ========================= */
  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  /* =========================
     SUBMIT (CREATE / UPDATE)
  ========================= */
  const handleSubmit = async (payload) => {
    try {
      let action;

      const safePayload = {
        ...payload,
        name: payload.name?.trim(),
        type_code: payload.type_code?.trim(),
      };

      if (editingId) {
        action = await dispatch(
          updateAssetType({ id: editingId, data: safePayload })
        );
      } else {
        action = await dispatch(createAssetType(safePayload));
      }

      if (action?.error) {
        toast.error(action.payload || "Operation failed ❌");
        return;
      }

      toast.success(editingId ? "Type updated 🎉" : "Type created 🎉");

      resetForm();
      dispatch(fetchAssetTypes({ page: 1, search }));

    } catch {
      toast.error("Something went wrong ❌");
    }
  };

  /* =========================
     EDIT
  ========================= */
  const handleEdit = (type) => {
    setEditingId(type.id);

    setForm({
      name: type.name || "",
      type_code: type.type_code || "",
      category_id: type.category_id || "",
      description: type.description || "",
    });
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this type?");
    if (!ok) return;

    const action = await dispatch(deleteAssetType(id));

    if (action?.error) {
      toast.error(action.payload || "Delete failed ❌");
      return;
    }

    toast.success("Deleted 🗑️");
    dispatch(fetchAssetTypes({ page: 1, search }));
  };

  return (
    <div className="p-4">

      <h1 className="text-xl font-bold mb-4">Asset Types</h1>

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search types..."
        className="border p-2 mb-4 w-full md:w-80"
      />

      {/* FORM */}
      <AssetTypeForm
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        categories={categories}
        selectedType={editingId ? form : null}
        clearSelection={resetForm}
      />

      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* TABLE */}
      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Code</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((type) => {
              const category = categories.find(
                (c) => c.id === type.category_id
              );

              return (
                <tr key={type.id}>
                  <td className="border p-2">{type.name}</td>
                  <td className="border p-2">{type.type_code}</td>
                  <td className="border p-2">
                    {category?.name || "Unknown"}
                  </td>
                  <td className="border p-2">
                    {type.description || "-"}
                  </td>

                  <td className="border p-2">
                    <button
                      onClick={() => handleEdit(type)}
                      className="text-blue-500 mr-3"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(type.id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-4">
                No types found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
