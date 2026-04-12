import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000";

const AssetForm = ({ asset, onSuccess, onClose }) => {
  const isEdit = !!asset;

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
  });

  const [file, setFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  const [dropdowns, setDropdowns] = useState({
    categories: [],
    types: [],
    vendors: [],
    departments: [],
  });

  const [modal, setModal] = useState({
    open: false,
    type: "",
    value: "",
  });

  useEffect(() => {
    const load = async () => {
      const [c, t, v, d] = await Promise.all([
        axios.get(`${BASE_URL}/categories`),
        axios.get(`${BASE_URL}/types`),
        axios.get(`${BASE_URL}/vendors`),
        axios.get(`${BASE_URL}/departments`),
      ]);

      setDropdowns({
        categories: c.data.data || [],
        types: t.data.data || [],
        vendors: v.data.data || [],
        departments: d.data.data || [],
      });
    };

    load();
  }, []);

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || "",
        asset_code: asset.asset_code || "",
        barcode: asset.barcode || "",
        status: asset.status || "available",
        description: asset.description || "",
        category_id: asset.category_id || "",
        asset_type_id: asset.asset_type_id || "",
        vendor_id: asset.vendor_id || "",
        department_id: asset.department_id || "",
      });

      setExistingImage(asset.image_url || asset.image_file || null);
    }
  }, [asset]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createEntity = async () => {
    const { type, value } = modal;
    if (!value) return;

    let payload = { name: value };

    if (type === "categories") payload.category_code = value.slice(0, 4).toUpperCase();
    if (type === "types") payload.type_code = value.slice(0, 4).toUpperCase();
    if (type === "departments") payload.department_code = value.slice(0, 4).toUpperCase();

    const res = await axios.post(`${BASE_URL}/${type}`, payload);
    const newItem = res.data;

    const map = {
      categories: "category_id",
      types: "asset_type_id",
      vendors: "vendor_id",
      departments: "department_id",
    };

    setDropdowns((prev) => ({
      ...prev,
      [type]: [...prev[type], newItem],
    }));

    setFormData((prev) => ({
      ...prev,
      [map[type]]: newItem.id,
    }));

    setModal({ open: false, type: "", value: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();

    Object.entries(formData).forEach(([k, v]) => {
      if (v !== "") form.append(k, v);
    });

    if (file) form.append("image_file", file);

    if (isEdit) {
      await axios.put(`${BASE_URL}/assets/${asset.id}`, form);
    } else {
      await axios.post(`${BASE_URL}/assets`, form);
    }

    onSuccess();
    onClose();
  };

  const renderSelect = (label, name, type) => (
    <select
      name={name}
      value={formData[name]}
      onChange={(e) => {
        if (e.target.value === "__new__") {
          setModal({ open: true, type, value: "" });
          return;
        }
        handleChange(e);
      }}
      className="border p-2 w-full"
    >
      <option value="">Select {label}</option>

      {dropdowns[type].map((i) => (
        <option key={i.id} value={i.id}>
          {i.name}
        </option>
      ))}

      <option value="__new__">+ Add New {label}</option>
    </select>
  );

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${BASE_URL}/${img.replace(/^\/+/, "")}`;
  };

  const imageUrl = getImageUrl(existingImage);

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-3 bg-white">

      <input name="name" placeholder="Asset Name" value={formData.name} onChange={handleChange} className="border p-2 w-full" />
      <input name="asset_code" placeholder="Asset Code" value={formData.asset_code} onChange={handleChange} className="border p-2 w-full" />
      <input name="barcode" placeholder="Barcode" value={formData.barcode} onChange={handleChange} className="border p-2 w-full" />

      <select name="status" value={formData.status} onChange={handleChange} className="border p-2 w-full">
        <option value="available">Available</option>
        <option value="assigned">Assigned</option>
        <option value="maintenance">Maintenance</option>
        <option value="retired">Retired</option>
      </select>

      {renderSelect("Category", "category_id", "categories")}
      {renderSelect("Type", "asset_type_id", "types")}
      {renderSelect("Vendor", "vendor_id", "vendors")}
      {renderSelect("Department", "department_id", "departments")}

      <textarea name="description" value={formData.description} onChange={handleChange} className="border p-2 w-full" />

      {/* IMAGE SECTION (ONLY CHANGE IS HERE) */}
      <div className="border p-2 w-full flex flex-col gap-2">

        <input
          type="file"
          id="file"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <label htmlFor="file">
          <span className="inline-block bg-yellow-500 text-black px-4 py-2 rounded cursor-pointer hover:bg-yellow-600 font-semibold underline underline-offset-2">
            {file ? "Selected File" : isEdit ? "Change Image" : "Choose Image"}
          </span>
        </label>

        {imageUrl && !file && (
          <img
            src={imageUrl}
            alt="asset"
            className="w-20 h-20 object-cover mt-2 rounded cursor-pointer"
          />
        )}
      </div>

      <div className="flex gap-2">
        <button className="bg-blue-600 text-white px-4 py-2">
          {isEdit ? "Update Asset" : "Create Asset"}
        </button>

        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-4 w-80">

            <input
              value={modal.value}
              onChange={(e) => setModal({ ...modal, value: e.target.value })}
              className="border p-2 w-full"
              placeholder="Enter name"
            />

            <button type="button" onClick={createEntity} className="bg-green-600 text-white px-3 py-1 mt-2">
              Save
            </button>

            <button type="button" onClick={() => setModal({ open: false })}>
              Cancel
            </button>

          </div>
        </div>
      )}

    </form>
  );
};

export default AssetForm;