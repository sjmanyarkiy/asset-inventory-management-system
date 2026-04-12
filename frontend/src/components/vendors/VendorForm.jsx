import { useState, useEffect } from "react";

export default function VendorForm({
  onSubmit,
  selectedVendor,
  clearSelection,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    contact_person: "",
    status: "active",
    postal_address: "",
    physical_address: "",
    payment_terms: "",
    description: "",
    bank_name: "",
    bank_account_number: "",
    bank_branch: "",
  });

  // 🔄 Populate form when editing
  useEffect(() => {
    if (selectedVendor) {
      setForm({
        name: selectedVendor.name || "",
        email: selectedVendor.email || "",
        phone: selectedVendor.phone || "",
        contact_person: selectedVendor.contact_person || "",
        status: selectedVendor.status || "active",
        postal_address: selectedVendor.postal_address || "",
        physical_address: selectedVendor.physical_address || "",
        payment_terms: selectedVendor.payment_terms || "",
        description: selectedVendor.description || "",
        bank_name: selectedVendor.bank_name || "",
        bank_account_number: selectedVendor.bank_account_number || "",
        bank_branch: selectedVendor.bank_branch || "",
      });
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
        contact_person: "",
        status: "active",
        postal_address: "",
        physical_address: "",
        payment_terms: "",
        description: "",
        bank_name: "",
        bank_account_number: "",
        bank_branch: "",
      });
    }
  }, [selectedVendor]);

  // ✏️ Handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🚀 Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      contact_person: form.contact_person.trim(),
      status: form.status.trim(),
      postal_address: form.postal_address.trim(),
      physical_address: form.physical_address.trim(),
      payment_terms: form.payment_terms.trim(),
      description: form.description.trim(),
      bank_name: form.bank_name.trim(),
      bank_account_number: form.bank_account_number.trim(),
      bank_branch: form.bank_branch.trim(),
    };

    if (!payload.name) {
      alert("Name is required");
      return;
    }

    onSubmit(payload);

    // Reset after create
    if (!selectedVendor) {
      setForm({
        name: "",
        email: "",
        phone: "",
        contact_person: "",
        status: "active",
        postal_address: "",
        physical_address: "",
        payment_terms: "",
        description: "",
        bank_name: "",
        bank_account_number: "",
        bank_branch: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded mb-4 space-y-3">
      <h3 className="font-bold text-lg">
        {selectedVendor ? "Update Vendor" : "Create Vendor"}
      </h3>

      {/* Name */}
      <input
        type="text"
        name="name"
        placeholder="Vendor Name"
        value={form.name}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* Email */}
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* Phone */}
      <input
        type="text"
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* Contact Person */}
      <input
        type="text"
        name="contact_person"
        placeholder="Contact Person"
        value={form.contact_person}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* Status */}
      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      {/* Addresses */}
      <input
        type="text"
        name="postal_address"
        placeholder="Postal Address"
        value={form.postal_address}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="physical_address"
        placeholder="Physical Address"
        value={form.physical_address}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* Payment */}
      <input
        type="text"
        name="payment_terms"
        placeholder="Payment Terms"
        value={form.payment_terms}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* Description */}
      <input
        type="text"
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* Bank Details */}
      <input
        type="text"
        name="bank_name"
        placeholder="Bank Name"
        value={form.bank_name}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="bank_account_number"
        placeholder="Account Number"
        value={form.bank_account_number}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="bank_branch"
        placeholder="Bank Branch"
        value={form.bank_branch}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* Buttons */}
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {selectedVendor ? "Update" : "Create"}
        </button>

        {selectedVendor && (
          <button
            type="button"
            onClick={clearSelection}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}