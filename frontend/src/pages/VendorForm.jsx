import { useState, useEffect } from "react";

export default function VendorForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    vendor_code: "",
    email: "",
    phone: "",
    status: "active",
    contact_person: "",
    postal_address: "",
    physical_address: "",
    payment_terms: "",
    description: "",
    bank_name: "",
    bank_account_number: "",
    bank_branch: "",
  });

  const [errors, setErrors] = useState({});

  /* ---------------- PREFILL ---------------- */
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || "",
        vendor_code: initialData.vendor_code || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        status: initialData.status || "active",
        contact_person: initialData.contact_person || "",
        postal_address: initialData.postal_address || "",
        physical_address: initialData.physical_address || "",
        payment_terms: initialData.payment_terms || "",
        description: initialData.description || "",
        bank_name: initialData.bank_name || "",
        bank_account_number: initialData.bank_account_number || "",
        bank_branch: initialData.bank_branch || "",
      });
    }
  }, [initialData]);

  /* ---------------- INPUT ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // clear error as user types
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vendor name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formData.email && !emailRegex.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (formData.phone && formData.phone.trim().length < 7) {
      newErrors.phone = "Phone number too short";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const cleanedData = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email?.trim() || null,
      phone: formData.phone?.trim() || null,
    };

    onSubmit(cleanedData);
  };

  const inputClass =
    "w-full border rounded-lg p-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">
        {initialData ? "Edit Vendor" : "Create Vendor"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Name */}
          <div>
            <label className="text-sm font-medium">Vendor Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g. Dell Ltd"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Vendor Code */}
          <div>
            <label className="text-sm font-medium">Vendor Code</label>
            <input
              name="vendor_code"
              value={formData.vendor_code}
              onChange={handleChange}
              className={inputClass}
              placeholder="Auto or manual code"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="vendor@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
              placeholder="07xxxxxxxx"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_hold">On Hold</option>
              <option value="blacklisted">Blacklisted</option>
            </select>
          </div>

          {/* Contact Person */}
          <div>
            <label className="text-sm font-medium">Contact Person</label>
            <input
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        {/* BANK SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="bank_name"
            value={formData.bank_name}
            onChange={handleChange}
            className={inputClass}
            placeholder="Bank Name"
          />

          <input
            name="bank_account_number"
            value={formData.bank_account_number}
            onChange={handleChange}
            className={inputClass}
            placeholder="Account Number"
          />

          <input
            name="bank_branch"
            value={formData.bank_branch}
            onChange={handleChange}
            className={inputClass}
            placeholder="Bank Branch"
          />
        </div>

        {/* ADDRESS */}
        <textarea
          name="postal_address"
          value={formData.postal_address}
          onChange={handleChange}
          className={inputClass}
          placeholder="Postal Address"
        />

        <textarea
          name="physical_address"
          value={formData.physical_address}
          onChange={handleChange}
          className={inputClass}
          placeholder="Physical Address"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={inputClass}
          placeholder="Description"
          rows={3}
        />

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {initialData ? "Update Vendor" : "Create Vendor"}
          </button>
        </div>
      </form>
    </div>
  );
}