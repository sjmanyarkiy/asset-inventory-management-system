import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  fetchVendors,
  deleteVendor,
  createVendor,
  updateVendor,
} from "../redux/slices/VendorSlice";

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

export default function VendorsPage() {
  const dispatch = useDispatch();
  // const { data, loading, error } = useSelector((state) => state.vendors);
  const { vendors, loading, error } = useSelector(
    (state) => state.vendors || {}
  );

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    vendor_code: "",
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

  /* =========================
     FETCH
  ========================= */
  useEffect(() => {
    dispatch(fetchVendors({ page: 1, search }));
  }, [dispatch, search]);

  /* =========================
     INPUT HANDLER
  ========================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================
     CREATE / UPDATE
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      contact_person: form.contact_person,
      status: form.status,
      postal_address: form.postal_address,
      physical_address: form.physical_address,
      payment_terms: form.payment_terms,
      description: form.description,
      bank_name: form.bank_name,
      bank_account_number: form.bank_account_number,
      bank_branch: form.bank_branch,
    };

    try {
      let action;

      /* UPDATE */
      if (editingId) {
        const confirmUpdate = window.confirm(
          "⚠️ Are you sure you want to update this vendor?"
        );
        if (!confirmUpdate) return;

        action = await dispatch(
          updateVendor({ id: editingId, data: payload })
        );
      }

      /* CREATE */
      else {
        const confirmCreate = window.confirm(
          "✔️ Do you want to create this vendor?"
        );
        if (!confirmCreate) return;

        action = await dispatch(createVendor(payload));
      }

      /* ERROR FROM REDUX / BACKEND */
      if (action?.error) {
        toast.error(getErrorMessage(action));
        return;
      }

      /* SUCCESS TOASTS */
      if (editingId) {
        toast.success("Vendor updated successfully 🎉");
      } else {
        toast.success("Vendor created successfully 🎉");
      }

      /* RESET */
      setForm({
        name: "",
        vendor_code: "",
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

      setEditingId(null);

      dispatch(fetchVendors({ page: 1, search }));

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong ❌");
    }
  };

  /* =========================
     EDIT
  ========================= */
  const handleEdit = (vendor) => {
    setEditingId(vendor.id);

    setForm({
      name: vendor.name || "",
      vendor_code: vendor.vendor_code || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      contact_person: vendor.contact_person || "",
      status: vendor.status || "active",
      postal_address: vendor.postal_address || "",
      physical_address: vendor.physical_address || "",
      payment_terms: vendor.payment_terms || "",
      description: vendor.description || "",
      bank_name: vendor.bank_name || "",
      bank_account_number: vendor.bank_account_number || "",
      bank_branch: vendor.bank_branch || "",
    });
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete this vendor?"
    );

    if (!confirmDelete) return;

    try {
      const action = await dispatch(deleteVendor(id));

      if (action?.error) {
        toast.error(getErrorMessage(action));
        return;
      }

      toast.success("Vendor deleted successfully 🗑️");

      dispatch(fetchVendors({ page: 1, search }));

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong ❌");
    }
  };

  /* =========================
     CANCEL EDIT
  ========================= */
  const handleCancelEdit = () => {
    setEditingId(null);

    setForm({
      name: "",
      vendor_code: "",
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
  };

  return (
    <div className="p-4">

      <h1 className="text-xl font-bold mb-4">Vendors</h1>

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search vendors..."
        className="border p-2 mb-4 w-full md:w-80"
      />

      {/* FORM */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Vendor Name"
          className="border p-2 block w-full md:w-80"
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="border p-2 block w-full md:w-80"
        />

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="border p-2 block w-full md:w-80"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2"
          >
            {editingId ? "Update Vendor" : "Create Vendor"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-400 text-white px-4 py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* LOADING / ERROR */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* TABLE */}
      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Code</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Contact Person</th>
            <th className="border p-2">Bank</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {vendors?.map((vendor) => (
            <tr key={vendor.id}>
              <td className="border p-2">{vendor.name}</td>
              <td className="border p-2">{vendor.vendor_code}</td>
              <td className="border p-2">{vendor.email}</td>
              <td className="border p-2">{vendor.phone}</td>
              <td className="border p-2">{vendor.status}</td>
              <td className="border p-2">{vendor.contact_person}</td>
              <td className="border p-2">{vendor.bank_name}</td>

              <td className="border p-2">
                <button
                  onClick={() => handleEdit(vendor)}
                  className="text-blue-500 mr-3"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(vendor.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}