import { useState, useEffect } from "react";

export default function AssetTypeSearch({ onSearch }) {
  const [value, setValue] = useState("");

  /* =========================
     DEBOUNCE (SMOOTH SEARCH)
  ========================= */
  useEffect(() => {
    const delay = setTimeout(() => {
      onSearch(value);
    }, 400); // 🔥 prevents too many API calls

    return () => clearTimeout(delay);
  }, [value, onSearch]);

  return (
    <div className="mb-4 flex flex-col md:flex-row gap-2">

      {/* SEARCH INPUT */}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="🔍 Search by name, code, description..."
        className="border p-2 w-full md:w-80 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* CLEAR BUTTON */}
      {value && (
        <button
          onClick={() => setValue("")}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Clear
        </button>
      )}

    </div>
  );
}