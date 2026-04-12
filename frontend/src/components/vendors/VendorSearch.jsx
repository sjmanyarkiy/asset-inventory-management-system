import { useEffect, useState } from "react";

export default function VendorSearch({ onSearch }) {
  const [input, setInput] = useState("");

  useEffect(() => {
    const delay = setTimeout(() => {
      onSearch(input.trim());
    }, 400);

    return () => clearTimeout(delay);
  }, [input, onSearch]);

  return (
    <div className="flex items-center border rounded overflow-hidden w-full md:w-80">

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search vendors..."
        className="w-full px-3 py-2 outline-none"
      />

      {input && (
        <button
          onClick={() => {
            setInput("");
            onSearch("");
          }}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300"
        >
          ✕
        </button>
      )}
    </div>
  );
}