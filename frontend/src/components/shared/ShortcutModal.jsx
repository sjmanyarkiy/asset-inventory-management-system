import { useEffect, useState } from "react";
import Modal from "./Modal";
import api from "../../services/api";

const ShortcutModal = ({
  isOpen,
  onClose,
  title,
  endpoint,
  fields = [],
  onSuccess,
}) => {
  // build initial form dynamically
  const buildInitialState = () => {
    const state = {};
    fields.forEach((f) => {
      state[f.name] = "";
    });
    return state;
  };

  const [form, setForm] = useState(buildInitialState());
  const [loading, setLoading] = useState(false);

  // reset form whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(buildInitialState());
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/${endpoint}`, form);

      setForm(buildInitialState());
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(`${title} error:`, err);
    }

    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ width: "100%" }}>
        <h2 style={{ marginBottom: "15px", fontWeight: "bold" }}>
          {title}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          
          {fields.map((field) => (
            <input
              key={field.name}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.label}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            />
          ))}

          {/* BUTTONS */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#999",
                color: "white",
                padding: "6px 12px",
                border: "none",
                borderRadius: "5px",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#2563eb",
                color: "white",
                padding: "6px 12px",
                border: "none",
                borderRadius: "5px",
              }}
            >
              {loading ? "Saving..." : "Save"}
            </button>

          </div>

        </form>
      </div>
    </Modal>
  );
};

export default ShortcutModal;