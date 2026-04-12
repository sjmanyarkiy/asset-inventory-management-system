import { useEffect, useState } from "react";

export default function CategorySearch({ onSearch }) {
  const [input, setInput] = useState("");

  // =========================
  // LIVE SEARCH WITH DEBOUNCE
  // =========================
  useEffect(() => {
    const delay = setTimeout(() => {
      onSearch?.(input);
    }, 400);

    return () => clearTimeout(delay);
  }, [input, onSearch]);

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const handleClear = () => {
    setInput("");
    onSearch?.("");
  };

  return (
    <div className="flex items-center gap-2 border rounded overflow-hidden w-full md:w-80">

      {/* INPUT */}
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Search categories..."
        className="w-full px-3 py-2 outline-none"
      />

      {/* CLEAR */}
      <button
        onClick={handleClear}
        className="px-3 py-2 bg-red-100 hover:bg-red-200"
        title="Clear"
      >
        ✕
      </button>

    </div>
  );
}