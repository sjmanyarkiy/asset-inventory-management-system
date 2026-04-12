import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  fetchVendors,
  deleteVendor,
  createVendor,
  updateVendor,
} from "../features/vendors/vendorSlice";

const getErrorMessage = (action) =>
  action?.payload || action?.error?.message || "Operation failed ❌";

export default function VendorsPage() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.vendors);

  const [inputSearch, setInputSearch] = useState("");
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);

  const initialForm = {
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
  };

  const [form, setForm] = useState(initialForm);

  /* =========================
     FETCH
  ========================= */
  useEffect(() => {
    dispatch(fetchVendors({ page: 1, search }));
  }, [dispatch, search]);

  /* =========================
     DEBOUNCE SEARCH
  ========================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(inputSearch.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [inputSearch]);

  /* =========================
     CHANGE HANDLER
  ========================= */
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* =========================
     RESET FORM
  ========================= */
  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  /* =========================
     SUBMIT (CREATE / UPDATE)
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let action;

      if (editingId) {
        action = await dispatch(
          updateVendor({ id: editingId, data: form })
        );
      } else {
        action = await dispatch(createVendor(form));
      }

      if (action?.error) {
        toast.error(getErrorMessage(action));
        return;
      }

      toast.success(editingId ? "Vendor Updated 🎉" : "Vendor Created 🎉");

      resetForm();
      dispatch(fetchVendors({ page: 1, search }));
    } catch {
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
    const ok = window.confirm("Delete vendor?");
    if (!ok) return;

    const action = await dispatch(deleteVendor(id));

    if (action?.error) {
      toast.error(getErrorMessage(action));
      return;
    }

    toast.success("Vendor Deleted 🗑️");
    dispatch(fetchVendors({ page: 1, search }));
  };

  return (
    <div className="p-4">

      <h1 className="text-xl font-bold mb-4">Vendors</h1>

      {/* SEARCH */}
      <input
        value={inputSearch}
        onChange={(e) => setInputSearch(e.target.value)}
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
          className="border p-2 w-full md:w-80"
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="border p-2 w-full md:w-80"
        />

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="border p-2 w-full md:w-80"
        />

        <button className="bg-blue-500 text-white px-4 py-2">
          {editingId ? "Update Vendor" : "Create Vendor"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="ml-2 bg-gray-400 text-white px-4 py-2"
          >
            Cancel
          </button>
        )}
      </form>

      {/* STATUS */}
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
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((v) => (
            <tr key={v.id}>
              <td className="border p-2">{v.name}</td>
              <td className="border p-2">{v.vendor_code}</td>
              <td className="border p-2">{v.email}</td>
              <td className="border p-2">{v.phone}</td>

              <td className="border p-2">
                <button
                  onClick={() => handleEdit(v)}
                  className="text-blue-500 mr-2"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(v.id)}
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