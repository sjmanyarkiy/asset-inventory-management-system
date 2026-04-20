import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import AssetTypeForm from "./TypeForm";

import {
  fetchAssetTypes,
  createAssetType,
  updateAssetType,
  deleteAssetType,
} from "../redux/slices/typeSlice";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5001";

export default function AssetTypesPage() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.types);

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    type_code: "",
    category_id: "",
    description: "",
  });

  /* =========================
     FETCH TYPES (LIVE SEARCH)
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
        const res = await fetch(
          `${API_BASE_URL}/categories?page=1&per_page=100`
        );
        const data = await res.json();
        setCategories(data.data || []);
      } catch (err) {
        toast.error("Failed to load categories ❌");
      }
    };

    fetchCategories();
  }, []);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (payload) => {
    try {
      let action;

      if (editingId) {
        action = await dispatch(
          updateAssetType({ id: editingId, data: payload })
        );
      } else {
        action = await dispatch(createAssetType(payload));
      }

      if (action?.error) {
        toast.error(action.payload || "Operation failed ❌");
        return;
      }

      toast.success(
        editingId ? "Type updated 🎉" : "Type created 🎉"
      );

      setForm({
        name: "",
        type_code: "",
        category_id: "",
        description: "",
      });

      setEditingId(null);

      dispatch(fetchAssetTypes({ page: 1, search }));

    } catch (err) {
      toast.error("Something went wrong ❌");
    }
  };

  /* =========================
     EDIT
  ========================= */
  const handleEdit = (type) => {
    setEditingId(type.id);

    setForm({
      name: type.name,
      type_code: type.type_code,
      category_id: type.category_id,
      description: type.description || "",
    });
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this type?");
    if (!confirmDelete) return;

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

      <h1 className="text-xl font-bold mb-4">
        Asset Types
      </h1>

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
        selectedType={editingId ? form : null}
        clearSelection={() => {
          setEditingId(null);
          setForm({
            name: "",
            type_code: "",
            category_id: "",
            description: "",
          });
        }}
        categories={categories}
        form={form}
        setForm={setForm}
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
          {data?.map((type) => {
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
                <td className="border p-2">{type.description}</td>

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
          })}
        </tbody>
      </table>

    </div>
  );
}