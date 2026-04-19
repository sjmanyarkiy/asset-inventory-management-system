import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import api from "../../services/api";
import { toAssetFileUrl } from "../../config/apiConfig";
import { createAsset, updateAsset } from "../../features/assets/assetSlice";

const AssetForm = ({ asset, onSuccess, onClose }) => {
  const dispatch = useDispatch();
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
  const [dropdownLoading, setDropdownLoading] = useState(true);

  const [modal, setModal] = useState({
    open: false,
    type: "",
    value: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const load = async () => {
      setDropdownLoading(true);
      try {
        const [c, t, v, d] = await Promise.all([
          api.get("/categories"),
          api.get("/types"),
          api.get("/vendors"),
          api.get("/departments"),
        ]);

        setDropdowns({
          categories: c.data.data || [],
          types: t.data.data || [],
          vendors: v.data.data || [],
          departments: d.data.data || [],
        });
      } catch {
        setFormError("Failed to load form options. Please try again.");
        toast.error("Failed to load dropdown data");
      } finally {
        setDropdownLoading(false);
      }
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

    setFormError("");

    try {
      let payload = { name: value };

      if (type === "categories") payload.category_code = value.slice(0, 4).toUpperCase();
      if (type === "types") {
        payload.type_code = value.slice(0, 4).toUpperCase();
        payload.category_id = Number(formData.category_id);

        if (!payload.category_id) {
          const message = "Select a category first before adding a new type.";
          setFormError(message);
          toast.error(message);
          return;
        }
      }
      if (type === "departments") payload.department_code = value.slice(0, 4).toUpperCase();

      const res = await api.post(`/${type}`, payload);
      const newItem = res.data?.data || res.data;

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
      toast.success("New option added");
    } catch (err) {
      const message = err?.response?.data?.error || "Failed to add option";
      setFormError(message);
      toast.error(message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name?.trim()) {
      setFormError("Asset name is required.");
      toast.error("Asset name is required");
      return;
    }

    if (!formData.barcode?.trim()) {
      setFormError("Barcode is required.");
      toast.error("Barcode is required");
      return;
    }

    if (!formData.category_id) {
      setFormError("Category is required.");
      toast.error("Category is required");
      return;
    }

    if (!formData.asset_type_id) {
      setFormError("Type is required.");
      toast.error("Type is required");
      return;
    }

    setSubmitting(true);

    try {
      const form = new FormData();

      Object.entries(formData).forEach(([k, v]) => {
        if (v !== "") form.append(k, v);
      });

      if (file) form.append("image_file", file);

      if (isEdit) {
        await dispatch(
          updateAsset({
            id: asset.id,
            data: form,
          })
        ).unwrap();
      } else {
        await dispatch(createAsset(form)).unwrap();
      }

      onSuccess();
    } catch (err) {
      const message =
        typeof err === "string"
          ? err
          : err?.response?.data?.error || "Unable to save asset. Please try again.";
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderSelect = (label, name, type) => (
    <select
      name={name}
      value={formData[name]}
      disabled={submitting || dropdownLoading}
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
    return toAssetFileUrl(img);
  };

  const imageUrl = getImageUrl(existingImage);

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-3 bg-white">

      {formError && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </div>
      )}

      <input name="name" placeholder="Asset Name" value={formData.name} onChange={handleChange} className="border p-2 w-full" disabled={submitting || dropdownLoading} />
      <input name="asset_code" placeholder="Asset Code" value={formData.asset_code} onChange={handleChange} className="border p-2 w-full" disabled={submitting || dropdownLoading} />
      <input name="barcode" placeholder="Barcode" value={formData.barcode} onChange={handleChange} className="border p-2 w-full" disabled={submitting || dropdownLoading} />

      <select name="status" value={formData.status} onChange={handleChange} className="border p-2 w-full" disabled={submitting || dropdownLoading}>
        <option value="available">Available</option>
        <option value="assigned">Assigned</option>
        <option value="under_repair">Under Repair</option>
        <option value="retired">Retired</option>
      </select>

      {renderSelect("Category", "category_id", "categories")}
      {renderSelect("Type", "asset_type_id", "types")}
      {renderSelect("Vendor", "vendor_id", "vendors")}
      {renderSelect("Department", "department_id", "departments")}

      <textarea name="description" value={formData.description} onChange={handleChange} className="border p-2 w-full" disabled={submitting || dropdownLoading} />

      {/* IMAGE SECTION (ONLY CHANGE IS HERE) */}
      <div className="border p-2 w-full flex flex-col gap-2">

        <input
          type="file"
          id="file"
          className="hidden"
          disabled={submitting || dropdownLoading}
          onChange={(e) => setFile(e.target.files[0])}
        />

        <label htmlFor="file">
          <span className={`inline-block bg-yellow-500 text-black px-4 py-2 rounded font-semibold underline underline-offset-2 ${submitting ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-yellow-600"}`}>
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
        <button
          className={`text-white px-4 py-2 ${submitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          disabled={submitting || dropdownLoading}
        >
          {submitting ? "Saving..." : dropdownLoading ? "Loading options..." : isEdit ? "Update Asset" : "Create Asset"}
        </button>

        <button type="button" onClick={onClose} disabled={submitting || dropdownLoading} className={submitting || dropdownLoading ? "opacity-60 cursor-not-allowed" : ""}>
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