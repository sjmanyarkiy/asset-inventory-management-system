import { useState, useEffect } from "react";

export default function VendorModal({
  isOpen,
  onClose,
  onSubmit,
  selectedVendor
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    contact_person: "",
    physical_address: "",
    postal_address: "",
    payment_terms: "",
    status: "active",
    description: ""
  });

  /* =========================
     PREFILL EDIT DATA
  ========================= */
  useEffect(() => {
    if (selectedVendor) {
      setForm({
        name: selectedVendor.name || "",
        email: selectedVendor.email || "",
        phone: selectedVendor.phone || "",
        contact_person: selectedVendor.contact_person || "",
        physical_address: selectedVendor.physical_address || "",
        postal_address: selectedVendor.postal_address || "",
        payment_terms: selectedVendor.payment_terms || "",
        status: selectedVendor.status || "active",
        description: selectedVendor.description || ""
      });
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
        contact_person: "",
        physical_address: "",
        postal_address: "",
        payment_terms: "",
        status: "active",
        description: ""
      });
    }
  }, [selectedVendor]);

  /* =========================
     HANDLE CHANGE
  ========================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      name: form.name.trim(),
      email: form.email ? form.email.trim().toLowerCase() : null
    };

    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-[500px]">

        <h2 className="text-xl font-bold mb-4">
          {selectedVendor ? "Edit Vendor" : "Create Vendor"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-2">

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Vendor Name"
            className="border p-2 w-full"
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="border p-2 w-full"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="border p-2 w-full"
          />

          <input
            name="contact_person"
            value={form.contact_person}
            onChange={handleChange}
            placeholder="Contact Person"
            className="border p-2 w-full"
          />

          <input
            name="physical_address"
            value={form.physical_address}
            onChange={handleChange}
            placeholder="Physical Address"
            className="border p-2 w-full"
          />

          <input
            name="postal_address"
            value={form.postal_address}
            onChange={handleChange}
            placeholder="Postal Address"
            className="border p-2 w-full"
          />

          <input
            name="payment_terms"
            value={form.payment_terms}
            onChange={handleChange}
            placeholder="Payment Terms"
            className="border p-2 w-full"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-2 w-full"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="border p-2 w-full"
          />

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-2">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {selectedVendor ? "Update" : "Create"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}