import { useEffect, useState } from "react";
import axios from "../src/api/axios";

const AssetForm = ({ selectedAsset, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

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

  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [departments, setDepartments] = useState([]);

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
      setPreview(selectedAsset.image_url || null);
    }
  }, [selectedAsset]);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([k, v]) => {
        payload.append(k, v);
      });

      if (imageFile) {
        payload.append("image_file", imageFile);
      }

      if (selectedAsset) {
        await axios.put(`/api/assets/${selectedAsset.id}`, payload);
      } else {
        await axios.post("/api/assets", payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save asset");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400";
  const labelClass = "text-sm font-medium text-gray-600 mb-1";

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl space-y-6">

      {/* HEADER */}
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">
          {selectedAsset ? "Edit Asset" : "Create New Asset"}
        </h2>
        <p className="text-sm text-gray-500">
          Fill in asset details carefully
        </p>
      </div>

      {/* BASIC INFO */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Asset Name</label>
          <input name="name" value={formData.name} onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Asset Code</label>
          <input name="asset_code" value={formData.asset_code} onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Barcode</label>
          <input name="barcode" value={formData.barcode} onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="under_repair">Under Repair</option>
            <option value="retired">Retired</option>
          </select>
        </div>
      </div>

      {/* CLASSIFICATION */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category</label>
          <select name="category_id" value={formData.category_id} onChange={handleChange} className={inputClass}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Type</label>
          <select name="asset_type_id" value={formData.asset_type_id} onChange={handleChange} className={inputClass}>
            <option value="">Select Type</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Vendor</label>
          <select name="vendor_id" value={formData.vendor_id} onChange={handleChange} className={inputClass}>
            <option value="">Select Vendor</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Department</label>
          <select name="department_id" value={formData.department_id} onChange={handleChange} className={inputClass}>
            <option value="">Select Department</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={`${inputClass} min-h-[100px]`}
        />
      </div>

      {/* IMAGE */}
      <div className="space-y-2">
        <label className={labelClass}>Asset Image</label>

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="w-32 h-32 object-cover rounded-md border"
          />
        )}

        <input type="file" onChange={handleImage} className={inputClass} />
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : selectedAsset ? "Update Asset" : "Create Asset"}
        </button>
      </div>
    </form>
  );
};

export default AssetForm;