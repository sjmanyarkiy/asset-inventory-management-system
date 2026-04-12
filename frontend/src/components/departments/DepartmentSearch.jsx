import { useState, useEffect, useRef } from "react";

export default function DepartmentSearch({ onSearch }) {
  const [input, setInput] = useState("");
  const firstRender = useRef(true);

  // 🔥 LIVE SEARCH with debounce (stable version)
  useEffect(() => {
    // prevent running on initial mount
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const delay = setTimeout(() => {
      onSearch(input.trim());
    }, 400);

    return () => clearTimeout(delay);
  }, [input, onSearch]);

  return (
    <div className="flex items-center border rounded overflow-hidden w-full md:w-80">

      {/* Input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search departments..."
        className="w-full px-3 py-2 outline-none"
      />

      {/* Clear button */}
      {input && (
        <button
          onClick={() => {
            setInput("");
            // trigger only if already had value
            onSearch("");
          }}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300"
          title="Clear"
        >
          ✕
        </button>
      )}

    </div>
  );
}