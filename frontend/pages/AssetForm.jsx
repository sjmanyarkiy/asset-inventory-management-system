import { useEffect, useState } from "react";
// import axios from "axios";
import axios from "../../frontend/src/api/axios";

const AssetForm = ({ selectedAsset, onClose, onSuccess }) => {
  // const BASE_URL = "http://127.0.0.1:5000";

  const [formData, setFormData] = useState({
    name: "",
    asset_code: "",
    barcode: "",
    status: "available",
    description: "",
    category_id: "",
    asset_type_id: "",
    vendor_id: "",
    department_id: "",
    image_url: ""
  });

  const [imageFile, setImageFile] = useState(null);

  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [departments, setDepartments] = useState([]);

  // =========================
  // PREFILL ON EDIT
  // =========================
  useEffect(() => {
    if (selectedAsset) {
      setFormData({
        name: selectedAsset.name || "",
        asset_code: selectedAsset.asset_code || "",
        barcode: selectedAsset.barcode || "",
        status: selectedAsset.status || "available",
        description: selectedAsset.description || "",
        category_id: selectedAsset.category_id || "",
        asset_type_id: selectedAsset.asset_type_id || "",
        vendor_id: selectedAsset.vendor_id || "",
        department_id: selectedAsset.department_id || "",
        image_url: selectedAsset.image_url || ""
      });
    }
  }, [selectedAsset]);

  // =========================
  // LOAD DROPDOWNS (FIXED ROUTES)
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      try {
          const [cat, type, ven, dep] = await Promise.all([
            axios.get("categories"),
            axios.get("/api/types"),
            axios.get("/api/vendors"),
            axios.get("/api/departments")
          ]);

        setCategories(cat.data.data || []);
        setTypes(type.data.data || []);
        setVendors(ven.data.data || []);
        setDepartments(dep.data.data || []);
      } catch (err) {
        console.error("Dropdown load error:", err);
      }
    };

    fetchData();
  }, []);

  // =========================
  // HANDLE CHANGE
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // =========================
  // HANDLE SUBMIT (FIXED: FORM DATA FOR FLASK)
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      if (imageFile) {
        payload.append("image_file", imageFile);
      }

      if (selectedAsset) {
        // UPDATE
        await axios.put(
          `/api/assets/${selectedAsset.id}`,
          payload
        );
      } else {
        // CREATE
        await axios.post("/api/assets", payload);
      }

      onSuccess();
      onClose();

    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save asset");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 w-[500px] space-y-3">

      <h2 className="text-xl font-bold">
        {selectedAsset ? "Edit Asset" : "Create Asset"}
      </h2>

      <input
        name="name"
        placeholder="Asset Name"
        value={formData.name}
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <input
        name="asset_code"
        placeholder="Asset Code"
        value={formData.asset_code}
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <input
        name="barcode"
        placeholder="Barcode"
        value={formData.barcode}
        onChange={handleChange}
        className="border p-2 w-full"
      />

      {/* CATEGORY */}
      <select
        name="category_id"
        value={formData.category_id}
        onChange={handleChange}
        className="border p-2 w-full"
      >
        <option value="">Select Category</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* TYPE */}
      <select
        name="asset_type_id"
        value={formData.asset_type_id}
        onChange={handleChange}
        className="border p-2 w-full"
      >
        <option value="">Select Type</option>
        {types.map(t => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      {/* VENDOR */}
      <select
        name="vendor_id"
        value={formData.vendor_id}
        onChange={handleChange}
        className="border p-2 w-full"
      >
        <option value="">Select Vendor</option>
        {vendors.map(v => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>

      {/* DEPARTMENT */}
      <select
        name="department_id"
        value={formData.department_id}
        onChange={handleChange}
        className="border p-2 w-full"
      >
        <option value="">Select Department</option>
        {departments.map(d => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      {/* STATUS */}
      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="border p-2 w-full"
      >
        <option value="available">Available</option>
        <option value="assigned">Assigned</option>
        <option value="under_repair">Under Repair</option>
        <option value="retired">Retired</option>
      </select>

      {/* IMAGE FILE (IMPORTANT FIX) */}
      <input
        type="file"
        onChange={(e) => setImageFile(e.target.files[0])}
        className="border p-2 w-full"
      />

      <input
        name="image_url"
        placeholder="Image URL (optional)"
        value={formData.image_url}
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="border p-2 w-full"
      />

      {/* ACTIONS */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2"
        >
          {selectedAsset ? "Update" : "Create"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="bg-gray-400 text-white px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AssetForm;